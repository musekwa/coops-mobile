import { View, Text } from 'react-native'
import SubmitButton from '../buttons/SubmitButton'
import { TouchableOpacity } from 'react-native'
import { useShipmentOwnerDetailsStore } from 'src/store/shipment/shipment_owner_details'
import { useActionStore } from 'src/store/actions/actions'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'

import { errorMessages } from 'src/constants/errorMessages'
import { ResourceName } from 'src/types'
import { useState, useCallback, useEffect, useMemo } from 'react'
import ErrorAlert from '../dialogs/ErrorAlert'
import { useRouter, Href } from 'expo-router'
import { useShipmentLicenseStore } from 'src/store/shipment/shipment_license'
import { useShipmentLoadStore } from 'src/store/shipment/shipment_load'
import { useShipmentDriverStore } from 'src/store/shipment/shipment_driver'
import { useShipmentCarStore } from 'src/store/shipment/shipment_car'
import { buildCashewShipment } from 'src/library/powersync/schemas/cashew_shipments'
import { useUserDetails } from 'src/hooks/queries'
import { buildActor } from 'src/library/powersync/schemas/actors'
import { buildActorDetails } from 'src/library/powersync/schemas/actor_details'
import { buildContactDetail } from 'src/library/powersync/schemas/contact_details'
import { buildShipmentCar } from 'src/library/powersync/schemas/shipment_cars'
import { buildShipmentDirection } from 'src/library/powersync/schemas/shipment_directions'
import { useAddressStore } from 'src/store/address'

import { buildShipmentLoad } from 'src/library/powersync/schemas/shipment_loads'
import {
	insertCashewShipment,
	insertShipmentCar,
	insertShipmentDirection,
	insertShipmentLoad,
} from 'src/library/sqlite/inserts'
import { insertActor } from 'src/library/powersync/sql-statements'
import { insertActorDetails, insertContactDetail } from 'src/library/powersync/sql-statements2'
import { insertLicense } from 'src/library/powersync/sql-statements'
import { buildAddressDetail } from 'src/library/powersync/schemas/address_details'
import { insertAddressDetail } from 'src/library/powersync/sql-statements2'
import { ShipmentCarRecord, ShipmentLoadRecord } from 'src/library/powersync/schemas/AppSchema'
import Spinner from '../loaders/Spinner'
import { usePreconditionsStore } from 'src/store/tracking/pre-conditions'
import { buildLicense } from 'src/library/powersync/schemas/licenses'
import { useShipmentCheckpointStore } from 'src/store/shipment/shipment_checkpoint'

export default function SaveShipmentInfo() {
	const { userDetails } = useUserDetails()
	const { shipmentCheckpointInfo, resetCheckpointInfo } = useShipmentCheckpointStore()
	const { fullAddress, partialAddress, reset: resetFullAddress } = useAddressStore()
	const { shipmentLicenseInfo, resetLicenseInfo } = useShipmentLicenseStore()
	const { shipmentLoadInfo, resetLoadInfo } = useShipmentLoadStore()
	const { shipmentDriverInfo, resetDriverInfo } = useShipmentDriverStore()
	const { shipmentCarInfo, resetCarInfo } = useShipmentCarStore()
	const { shipmentOwnerDetails, resetShipmentOwnerDetails } = useShipmentOwnerDetailsStore()
	const { resetPreconditions } = usePreconditionsStore()
	const { ownerId, ownerType } = shipmentOwnerDetails
	const [isSaving, setIsSaving] = useState(false)

	const { setCurrentStep, resetCurrentStep, totalSteps, setNextRoute, setReloading, reloading, setCurrentResource } =
		useActionStore()
	const [message, setMessage] = useState('')
	const [hasError, setHasError] = useState(false)
	const router = useRouter()

	const handleReset = () => {
		resetCurrentStep()
		resetFullAddress()
		resetLicenseInfo()
		resetLoadInfo()
		resetDriverInfo()
		resetCarInfo()
		resetShipmentOwnerDetails()
		resetPreconditions()
		resetCheckpointInfo()
	}

	const isInvalid = useMemo(() => {
		const invalid =
			!userDetails?.id ||
			!userDetails?.province_id ||
			!partialAddress.adminPostId ||
			!partialAddress.villageId ||
			!userDetails?.district_id ||
			!fullAddress.provinceId ||
			!fullAddress.districtId ||
			!fullAddress.adminPostId ||
			!fullAddress.villageId

		return invalid
	}, [
		userDetails,
		partialAddress.adminPostId,
		partialAddress.villageId,
		userDetails?.district_id,
		fullAddress.provinceId,
		fullAddress.districtId,
		fullAddress.adminPostId,
		fullAddress.villageId,
	])

	const handleCancel = () => {
		setCurrentStep(totalSteps - 2)
	}

	const handleSave = useCallback(async () => {
		if (isInvalid) {
			setHasError(true)
			setMessage(errorMessages.failedToSave)
			return
		}

		setIsSaving(true)

		try {
			// 1. Create and insert shipment
			const newShipment = await createAndInsertShipment(shipmentLicenseInfo.shipmentNumber!)

			// 2. Create and insert shipment license
			const newShipmentLicense = await createShipmentLicenseInfo(newShipment.id)

			// 3. Handle driver creation/selection
			const newDriverId = await handleDriverCreation()

			// 4. Handle car creation/selection
			const { newCarId, cars } = await handleCarCreation()

			// 5. Create and insert addresses (using shipment ID as owner)
			const { departureAddressId, destinationAddressId } = await createAndInsertAddresses(newShipment.id)

			// 6. Insert license
			if (!newShipmentLicense) {
				throw new Error('Falha ao inserir licença')
			}
			await insertLicense(newShipmentLicense)

			// 7. Create and insert shipment direction
			if (!newShipment) {
				throw new Error('Falha ao criar rota do envio')
			}
			await createAndInsertShipmentDirection(newShipment.id, departureAddressId, destinationAddressId)

			// 8. Create and insert shipment loads
			if (!newShipment) {
				throw new Error('Falha ao criar cargas do envio')
			}
			await createAndInsertShipmentLoads(newShipment.id, newDriverId, newCarId)

			// 9. Insert cars if any were created
			if (!cars) {
				throw new Error('Falha ao inserir veículos')
			}
			await insertCars(cars)

			// Success - all operations completed
			setReloading(false)
			setCurrentResource({
				name: ResourceName.SHIPMENT,
				id: newShipment.id,
			})
			router.push(`/trades/transit/shipment-inspection?shipmentId=${newShipment.id}` as Href)
			// Reset after navigation to avoid interfering with the navigation flow
			setTimeout(() => {
				handleReset()
			}, 300)
		} catch (error) {
			console.error('Error during save operation:', error)
			setHasError(true)
			setMessage(`Erro ao salvar: ${error instanceof Error ? error.message : 'Operação falhou'}`)
		} finally {
			setIsSaving(false)
		}
	}, [
		shipmentLicenseInfo,
		shipmentLoadInfo,
		shipmentDriverInfo,
		shipmentCarInfo,
		shipmentOwnerDetails,
		isInvalid,
		setCurrentStep,
		totalSteps,
		setNextRoute,
		setReloading,
		reloading,
		userDetails,
		partialAddress.adminPostId,
		partialAddress.villageId,
		fullAddress.provinceId,
		fullAddress.districtId,
		fullAddress.adminPostId,
		fullAddress.villageId,
	])

	const createShipmentLicenseInfo = async (shipmentId: string) => {
		const { day, month, year } = shipmentLicenseInfo

		// Create issue date from day, month, year (month is 0-indexed in Date constructor)
		const issueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

		// Create expiration date (3 days after issue date)
		const expirationDate = new Date(issueDate)
		expirationDate.setDate(expirationDate.getDate() + 3)

		try {
			// 1. Create license
			const newShipmentLicense = buildLicense({
				number: shipmentLicenseInfo.shipmentNumber,
				photo: shipmentLicenseInfo.photoUrl || '',
				owner_type: 'CASHEW_SHIPMENT',
				owner_id: shipmentId,
				issue_date: issueDate.toISOString(),
				expiration_date: expirationDate.toISOString(),
				issue_place_id: userDetails?.district_id!,
				issue_place_type: 'DISTRICT',
				sync_id: userDetails?.province_id!,
			})

			return newShipmentLicense
		} catch (error) {
			throw new Error('Falha ao criar licença: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
		}
	}

	// 2. Create shipment and insert it
	const createAndInsertShipment = async (shipmentNumber: string) => {
		try {
			const newShipment = buildCashewShipment({
				shipment_number: shipmentNumber,
				owner_id: ownerId,
				owner_type: ownerType,
				status: 'PENDING',
				sync_id: userDetails?.province_id!,
			})

			await insertCashewShipment(newShipment)
			return newShipment
		} catch (error) {
			throw new Error('Falha ao criar envio: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
		}
	}

	// 3. Handle driver creation/selection (as actor)
	const handleDriverCreation = async (): Promise<string> => {
		try {
			if (!shipmentDriverInfo.driverId) {
				// Split driver name into surname and other_names
				const nameParts = shipmentDriverInfo.driverName.trim().split(/\s+/)
				const surname = nameParts.length > 0 ? nameParts[nameParts.length - 1] : shipmentDriverInfo.driverName
				const other_names = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : ''

				// 1. Create actor record
				const actor_row = buildActor({
					category: 'DRIVER',
					sync_id: userDetails?.province_id!,
				})
				await insertActor(actor_row)

				// 2. Create actor_details record
				const actor_details_row = buildActorDetails({
					actor_id: actor_row.id,
					surname: surname,
					other_names: other_names,
					photo: '',
					sync_id: userDetails?.province_id!,
				})
				await insertActorDetails(actor_details_row)

				// 3. Create contact_details record
				const contact_detail_row = buildContactDetail({
					owner_id: actor_row.id,
					owner_type: 'DRIVER',
					primary_phone: shipmentDriverInfo.driverPhone,
					secondary_phone: shipmentDriverInfo.driverPhone,
					email: '',
					sync_id: userDetails?.province_id!,
				})
				await insertContactDetail(contact_detail_row)

				return actor_row.id
			} else {
				return shipmentDriverInfo.driverId
			}
		} catch (error) {
			throw new Error('Falha ao criar motorista: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
		}
	}

	// 4. Handle car creation/selection
	const handleCarCreation = async (): Promise<{ newCarId: string; cars: ShipmentCarRecord[] }> => {
		try {
			const cars: ShipmentCarRecord[] = []
			let newCarId = ''

			if (!shipmentCarInfo.carId && (shipmentLoadInfo.truckLoad.plateNumber || shipmentCarInfo.carType)) {
				const carType = shipmentCarInfo.brandName
					? `${shipmentCarInfo.carType}-${shipmentCarInfo.brandName}`
					: shipmentCarInfo.carType
				const plateNumber = shipmentLoadInfo.truckLoad.plateNumber

				const truckLoad = buildShipmentCar({
					car_type: carType,
					plate_number: plateNumber,
					sync_id: userDetails?.province_id!,
				})
				newCarId = truckLoad.id
				cars.push(truckLoad)
			} else {
				newCarId = shipmentCarInfo.carId
			}

			// Handle trailer cars
			for (const trailer of shipmentLoadInfo.trailerLoads) {
				const trailerCar = buildShipmentCar({
					car_type: 'TRAILER',
					plate_number: trailer.plateNumber,
					sync_id: userDetails?.province_id!,
				})
				cars.push(trailerCar)
			}

			return { newCarId, cars }
		} catch (error) {
			throw new Error('Falha ao criar veículos: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
		}
	}

	// 5. Create and insert addresses
	const createAndInsertAddresses = async (
		shipmentId: string,
	): Promise<{ departureAddressId: string; destinationAddressId: string }> => {
		try {
			// Create destination address_detail
			// Use shipment ID as owner_id and CASHEW_SHIPMENT as owner_type for shipment direction addresses
			const destinationAddressDetail = buildAddressDetail({
				owner_id: shipmentId,
				owner_type: 'CASHEW_SHIPMENT',
				province_id: fullAddress.provinceId!,
				district_id: fullAddress.districtId!,
				admin_post_id: fullAddress.adminPostId!,
				village_id: fullAddress.villageId!,
				sync_id: userDetails?.province_id!,
				gps_lat: '0',
				gps_long: '0',
			})
			await insertAddressDetail(destinationAddressDetail)

			// Create departure address_detail
			// Use shipment ID as owner_id and CASHEW_SHIPMENT as owner_type for shipment direction addresses
			const departureAddressDetail = buildAddressDetail({
				owner_id: shipmentId,
				owner_type: 'CASHEW_SHIPMENT',
				province_id: userDetails?.province_id!,
				district_id: userDetails?.district_id!,
				admin_post_id: partialAddress.adminPostId!,
				village_id: partialAddress.villageId!,
				sync_id: userDetails?.province_id!,
				gps_lat: '0',
				gps_long: '0',
			})
			await insertAddressDetail(departureAddressDetail)

			return {
				departureAddressId: departureAddressDetail.id,
				destinationAddressId: destinationAddressDetail.id,
			}
		} catch (error) {
			throw new Error('Falha ao criar endereços: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
		}
	}

	// 6. Create and insert shipment direction
	const createAndInsertShipmentDirection = async (
		shipmentId: string,
		departureAddressId: string,
		destinationAddressId: string,
	) => {
		try {
			const shipmentDirection = buildShipmentDirection({
				direction: 'OUTBOUND',
				departure_address_id: departureAddressId,
				destination_address_id: destinationAddressId,
				shipment_id: shipmentId,
				sync_id: userDetails?.province_id!,
			})

			await insertShipmentDirection(shipmentDirection)
		} catch (error) {
			throw new Error(
				'Falha ao criar direção do envio: ' + (error instanceof Error ? error.message : 'Erro desconhecido'),
			)
		}
	}

	// 7. Create and insert shipment loads
	const createAndInsertShipmentLoads = async (shipmentId: string, driverId: string, carId: string) => {
		try {
			const shipmentLoads: ShipmentLoadRecord[] = []

			// Create truck load
			const truckLoad = buildShipmentLoad({
				shipment_id: shipmentId,
				product_type: shipmentLoadInfo.truckLoad.productType,
				quantity: (shipmentLoadInfo.truckLoad.numberOfBags || 0) * (shipmentLoadInfo.truckLoad.bagWeight || 0),
				unit: 'KG',
				number_of_bags: shipmentLoadInfo.truckLoad.numberOfBags || 0,
				weight_per_bag: shipmentLoadInfo.truckLoad.bagWeight || 0,
				bag_type: 'RAFFIA',
				driver_id: driverId,
				car_id: carId,
				sync_id: userDetails?.province_id!,
			})
			shipmentLoads.push(truckLoad)

			// Create trailer loads
			for (const trailer of shipmentLoadInfo.trailerLoads) {
				const trailerLoad = buildShipmentLoad({
					shipment_id: shipmentId,
					product_type: trailer.productType,
					quantity: (trailer.numberOfBags || 0) * (trailer.bagWeight || 0),
					unit: 'KG',
					number_of_bags: trailer.numberOfBags || 0,
					weight_per_bag: trailer.bagWeight || 0,
					bag_type: 'RAFFIA',
					driver_id: driverId,
					car_id: carId,
					sync_id: userDetails?.province_id!,
				})
				shipmentLoads.push(trailerLoad)
			}

			// 8. Insert all loads
			for (const load of shipmentLoads) {
				await insertShipmentLoad(load)
			}
		} catch (error) {
			throw new Error('Falha ao criar cargas: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
		}
	}

	// 9. Insert cars if any were created
	const insertCars = async (cars: ShipmentCarRecord[]) => {
		try {
			for (const car of cars) {
				await insertShipmentCar(car)
			}
		} catch (error) {
			throw new Error('Falha ao inserir veículos: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
		}
	}

	// 10. Handle reloading
	useEffect(() => {
		if (reloading) {
			handleSave()
		}
	}, [reloading])

	return (
		<View className="flex-1 justify-center items-center p-8 space-y-6 h-[75vh]">
			<View className="flex-1 justify-center items-center">
				{isSaving ? (
					<>
						<Spinner />
						<Text className="text-[12px] text-center text-gray-500 dark:text-gray-300 mt-4">Gravando...</Text>
					</>
				) : (
					<>
						<Ionicons name="checkmark-circle-outline" size={100} color={colors.primary} />
						<Text className="text-[16px] font-bold text-center text-gray-500 dark:text-gray-300">Concluir Registo</Text>
					</>
				)}
			</View>

			<View className="flex flex-row justify-between space-x-8">
				<View className="w-1/2">
					<TouchableOpacity
						onPress={handleCancel}
						activeOpacity={0.5}
						disabled={isSaving}
						className={`bg-white dark:bg-gray-900 p-2 rounded-md flex justify-center items-center h-[50px] w-full border border-gray-300 dark:border-gray-700 ${isSaving ? 'opacity-50' : ''}`}
					>
						<Text className="text-black dark:text-white text-[14px] font-normal text-center">Cancelar</Text>
					</TouchableOpacity>
				</View>
				<View className="w-1/2">
					<SubmitButton
						title={isSaving ? 'Gravando...' : 'Gravar'}
						onPress={async () => await handleSave()}
						disabled={isSaving}
						isSubmitting={isSaving}
					/>
				</View>
			</View>

			<ErrorAlert title="" message={message} visible={hasError} setVisible={setHasError} setMessage={setMessage} />
		</View>
	)
}
