import { View, Text } from 'react-native'
import SubmitButton from '../buttons/SubmitButton'
import { TouchableOpacity } from 'react-native'
import { useActionStore } from 'src/store/actions/actions'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { errorMessages } from 'src/constants/errorMessages'
import { MultiCategory } from 'src/types'
import { useState, useCallback } from 'react'
import ErrorAlert from '../dialogs/ErrorAlert'
import { marchandisesTypes } from 'src/constants/tracking'
import { useAddressStore } from 'src/store/address'
import { useUserDetails } from 'src/hooks/queries'

import { buildDocument } from 'src/library/powersync/schemas/documents'
import {
	insertAddress,
	insertBirth,
	insertContact,
	insertDocument,
} from 'src/library/powersync/sql-statements'
import { Href, useRouter } from 'expo-router'
import { buildShipmentCar } from 'src/library/powersync/schemas/shipment_cars'
import { buildCashewShipment } from 'src/library/powersync/schemas/cashew_shipments'
import { buildShipmentLoad } from 'src/library/powersync/schemas/shipment_loads'
import { buildShipmentDriver } from 'src/library/powersync/schemas/shipment_drivers'
import { buildShipmentDirection } from 'src/library/powersync/schemas/shipment_directions'
import {
	insertShipmentCar,
	insertShipmentDirection,
	insertShipmentLoad,
	insertCashewShipment,
	insertShipmentDriver,
	insertCashewCrossbordersSmuggling,
	insertCashewInbordersSmuggling,
} from 'src/library/sqlite/inserts'
import { useSmuggledLoadDetailsStore } from 'src/store/tracking/smuggled_load'
import { useSmugglerDetailsStore } from 'src/store/tracking/smuggler'
import Spinner from '../loaders/Spinner'
import { useSmugglingFlowStore } from 'src/store/tracking/smugglingFlow'
import { buildCashewInbordersSmuggling } from 'src/library/powersync/schemas/cashew_inborders_smuggling'
import { buildCashewCrossbordersSmuggling } from 'src/library/powersync/schemas/cashew_crossborders_smuggling'
import { usePreconditionsStore } from 'src/store/tracking/pre-conditions'

export default function SaveSmugglingInfo() {
	// Smuggling Flow Details
	const { smugglerDetails, resetSmugglerDetails } = useSmugglerDetailsStore()

	// Smuggled Load Details
	const { smuggledLoadDetails, resetSmuggledLoadDetails } = useSmuggledLoadDetailsStore()

	const { smugglingFlowInfo, resetSmugglingFlowInfo } = useSmugglingFlowStore()
	const { resetPreconditions } = usePreconditionsStore()

	// Smuggling Flow Details
	const { smugglerId, smugglerSurname, smugglerOtherNames, smugglerPhone } = smugglerDetails
	// Smuggled Load Details
	const { quantity, transportType } = smuggledLoadDetails

	const { setCurrentStep, totalSteps, setSuccess } = useActionStore()
	const { userDetails } = useUserDetails()
	const router = useRouter()

	const [message, setMessage] = useState('')
	const [hasError, setHasError] = useState(false)

	const [isSaving, setIsSaving] = useState<boolean>(false)
	const {
		fullAddress,
		getFullProvinceNameById,
		getFullDistrictNameById,
		getFullAdminPostNameById,
		getFullVillageNameById,
		reset: resetAddress,
	} = useAddressStore()

	const handleCancel = () => {
		setCurrentStep(totalSteps - 1)
		resetAddress()
	}

	const smugglerInfo = ()=>{
		if (smugglerDetails.isAlreadyRegistered && smugglerDetails.smugglerId) {
			return {
				smugglerId: smugglerDetails.smugglerId,
				smugglerCategory: smugglerDetails.smugglerCategory as 'FARMER' | 'TRADER',
				smugglerNames: smugglerOtherNames + ' ' + smugglerSurname,
				smugglerVillageId: smugglerDetails.smugglerVillageId,
				smugglerAdminPostId: smugglerDetails.smugglerAdminPostId,
				smugglerDistrictId: smugglerDetails.smugglerDistrictId,
				smugglerProvinceId: smugglerDetails.smugglerProvinceId,

			}
		}
		return {
			smugglerId: '',
			smugglerCategory: smugglerDetails.smugglerCategory as 'FARMER' | 'TRADER',
			smugglerNames: smugglerOtherNames + ' ' + smugglerSurname,
			smugglerVillageId: fullAddress.villageId!,
			smugglerAdminPostId: fullAddress.adminPostId!,
			smugglerDistrictId: fullAddress.districtId!,
			smugglerProvinceId: fullAddress.provinceId!,
		}
	}

	const ensureRequiredData = () => {
		const isInvalid = 
		(!userDetails ||
			!fullAddress.provinceId ||
			!fullAddress.districtId ||
			!fullAddress.adminPostId ||
			!fullAddress.villageId ||
			!userDetails.province_id) &&
		!smugglerId &&
		!smugglerDetails.isAlreadyRegistered
		if (isInvalid) {
			setMessage('Dados insuficientes para gravar o registo.')
			setHasError(true)
			return false
		}

		return true
	}

	// const createOwnerIfNeeded = async () => {
	// 	if (smugglerDetails.isAlreadyRegistered && smugglerDetails.smugglerId) {
	// 		return {
	// 			ownerId: smugglerInfo().smugglerId,
	// 			ownerType: smugglerInfo().smugglerCategory as 'FARMER' | 'TRADER',
	// 			ownerName: smugglerInfo().smugglerNames,
	// 		}
	// 	}

	// 	const category =
	// 		smugglerInfo().smugglerCategory === 'FARMER'
	// 			? MultiCategory.FARMER_UNCATEGORIZED
	// 			: MultiCategory.TRADER_UNCATEGORIZED

	// 	const birth = buildBirth({
	// 		description: 'NATIONAL',
	// 		birth_place: 'province(N/A);district(N/A);admin_post(N/A);village(N/A)',
	// 		birth_date: 'N/A',
	// 		sync_id: smugglerInfo().smugglerProvinceId!,
	// 	})

	// 	const contact = buildContact({
	// 		primary_phone: smugglerPhone || 'N/A',
	// 		secondary_phone: 'N/A',
	// 		email: 'N/A',
	// 		sync_id: smugglerInfo().smugglerProvinceId!,
	// 	})
	// 	const address = buildAddress({
	// 		province_id: smugglerInfo().smugglerProvinceId!,
	// 		district_id: smugglerInfo().smugglerDistrictId!,
	// 		admin_post_id: smugglerInfo().smugglerAdminPostId!,
	// 		village_id: smugglerInfo().smugglerVillageId!,
	// 		gps_lat: '0',
	// 		gps_long: '0',
	// 		sync_id: smugglerInfo().smugglerProvinceId!,
	// 	})

	// 	const document = buildDocument({
	// 		document_type: 'N/A',
	// 		document_number: 'N/A',
	// 		document_date: 'N/A',
	// 		document_place: 'N/A',
	// 		nuit: 'N/A',
	// 		nuel: 'N/A',
	// 		license_type: 'N/A',
	// 		license_number: 'N/A',
	// 		license_date: 'N/A',
	// 		license_place: 'N/A',
	// 		sync_id: smugglerInfo().smugglerProvinceId!,
	// 	})

	// 	await Promise.all([insertBirth(birth), insertContact(contact), insertAddress(address), insertDocument(document)])

	// 	if (smugglerDetails.smugglerCategory === 'FARMER') {
	// 		// const farmer = buildFarmer({
	// 		// 	surname: smugglerSurname,
	// 		// 	other_names: smugglerOtherNames,
	// 		// 	gender: 'N/A',
	// 		// 	multicategory: category,
	// 		// 	family_size: 0,
	// 		// 	nuit: 'N/A',
	// 		// 	document_id: document.id,
	// 		// 	address_id: address.id,
	// 		// 	contact_id: contact.id,
	// 		// 	birth_id: birth.id,
	// 		// 	sync_id: smugglerInfo().smugglerProvinceId!,
	// 		// })
	// 		// await insertFarmer(farmer)
	// 		// return { ownerId: farmer.id, ownerType: 'FARMER', ownerName: smugglerOtherNames + ' ' + smugglerSurname }
	// 	} else {
	// 		// const trader = buildTrader({
	// 		// 	surname: smugglerSurname,
	// 		// 	other_names: smugglerOtherNames,
	// 		// 	gender: 'N/A',
	// 		// 	multicategory: category,
	// 		// 	nuit: 'N/A',
	// 		// 	birth_date: 'N/A',
	// 		// 	birth_district: smugglerInfo().smugglerDistrictId!,
	// 		// 	birth_admin_post: smugglerInfo().smugglerAdminPostId!,
	// 		// 	birth_id: birth.id,
	// 		// 	document_id: document.id,
	// 		// 	address_id: address.id,
	// 		// 	contact_id: contact.id,
	// 		// 	sync_id: smugglerInfo().smugglerProvinceId!,
	// 		// })
	// 		// await insertTrader(trader)
	// 		// return { ownerId: trader.id, ownerType: 'TRADER', ownerName: smugglerOtherNames + ' ' + smugglerSurname }
	// 	}
	// }

	const createShipmentRecords = async ({
		ownerId,
		ownerType,
		ownerName,
	}: {
		ownerId: string
		ownerType: 'FARMER' | 'TRADER'
		ownerName: string
	}) => {
		const shipmentNumber = `untracked-${Date.now()}`
		const shipment = buildCashewShipment({
			shipment_number: shipmentNumber,
			owner_id: ownerId,
			owner_type: ownerType,
			status: 'PENDING',
			sync_id: smugglerInfo().smugglerProvinceId!,
		})

		const driver = buildShipmentDriver({
			driver_name: ownerName,
			driver_phone: smugglerPhone || 'N/A',
			sync_id: smugglerInfo().smugglerProvinceId!,
		})
		const car = buildShipmentCar({
			car_type: transportType,
			plate_number: 'N/A',
			sync_id: smugglerInfo().smugglerProvinceId!,
		})

		const shipmentLoad = buildShipmentLoad({
			shipment_id: shipment.id,
			product_type: marchandisesTypes.CASHEW_NUT,
			quantity,
			unit: 'KG',
			number_of_bags: 0,
			weight_per_bag: 0,
			bag_type: 'JUTE',
			driver_id: driver.id,
			car_id: car.id,
			sync_id: smugglerInfo().smugglerProvinceId!,
		})

		await Promise.all([
			insertCashewShipment(shipment),
			insertShipmentLoad(shipmentLoad),
			insertShipmentDriver(driver),
			insertShipmentCar(car),
		])

		return shipment.id
	}

	const createSmugglingRecord = async (shipmentId: string) => {
		if (smugglingFlowInfo.borderType === 'INBORDERS') {
			const inborders = buildCashewInbordersSmuggling({
				shipment_id: shipmentId,
				destination_district_id:
					smugglingFlowInfo.shipmentDirection === 'INBOUND' ? userDetails?.district_id! : smugglingFlowInfo.districtId!,
				departure_district_id:
					smugglingFlowInfo.shipmentDirection === 'INBOUND' ? smugglingFlowInfo.districtId! : userDetails?.district_id!,
				smuggling_notes: 'N/A',
				sync_id: smugglerInfo().smugglerProvinceId!,
			})

			await insertCashewInbordersSmuggling(inborders)
			return
		}

		if (smugglingFlowInfo.borderType === 'CROSSBORDERS') {
			const crossborders = buildCashewCrossbordersSmuggling({
				shipment_id: shipmentId,
				destination_country_id: smugglingFlowInfo.destinationCountryId!,
				border_name: smugglingFlowInfo.borderName!,
				smuggling_notes: 'N/A',
				sync_id: smugglerInfo().smugglerProvinceId!,
			})

			await insertCashewCrossbordersSmuggling(crossborders)
		}
	}

	const resetStateAndNavigate = () => {
		resetSmugglerDetails()
		resetSmuggledLoadDetails()
		resetAddress()
		resetSmugglingFlowInfo()
		resetPreconditions()
		setCurrentStep(0)
		setSuccess(true)
		router.push(`/trades/shipments?tab=UNVERIFIED` as Href)
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			const isRequiredDataValid = ensureRequiredData()
			if (!isRequiredDataValid) {
				return
			}
			// const { ownerId, ownerType, ownerName } = await createOwnerIfNeeded()
			// if (!ownerId || !ownerType || !ownerName) {
			// 	return
			// }
			// const shipmentId = await createShipmentRecords({
			// 	ownerId,
			// 	ownerType: ownerType as 'FARMER' | 'TRADER',
			// 	ownerName,
			// })
			// if (!shipmentId) {
			// 	setMessage('Falha ao criar shipment')
			// 	return
			// }
			// await createSmugglingRecord(shipmentId)
			resetStateAndNavigate()
		} catch (error) {
			console.error('Error creating smuggling record', error)
			setMessage(errorMessages.failedToSave)
			setHasError(true)
		} finally {
			setIsSaving(false)
		}
	}

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
						className="bg-white dark:bg-gray-900 p-2 rounded-md flex justify-center items-center h-[50px] w-full border border-gray-300 dark:border-gray-700"
					>
						<Text className="text-black dark:text-white text-[14px] font-normal text-center">Cancelar</Text>
					</TouchableOpacity>
				</View>
				<View className="w-1/2">
					<SubmitButton title="Gravar" onPress={handleSave} disabled={isSaving} isSubmitting={isSaving} />
				</View>
			</View>

			<ErrorAlert title="" message={message} visible={hasError} setVisible={setHasError} setMessage={setMessage} />
		</View>
	)
}
