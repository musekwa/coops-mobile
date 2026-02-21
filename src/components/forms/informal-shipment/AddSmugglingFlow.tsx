// React and React Native imports
import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'

// Form and validation
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Components
import RadioButton from 'src/components/buttons/RadioButton'
import FormItemDescription from '../FormItemDescription'
import CustomSelectItem from 'src/components/ui/custom-select-item'
import CustomSelectItemTrigger from 'src/components/ui/custom-select-item-trigger'
import NextAndPreviousButtons from 'src/components/buttons/NextAndPreviousButtons'
import FormWrapper from '../FormWrapper'
import Label from '../Label'

// Constants
import { neighboringCountries } from 'src/constants/neighboringPlaces'
import { AddressLevel } from 'src/types'

// Hooks
import { useQueryMany } from 'src/hooks/queries'
import { CountryRecord, TABLES, BorderRecord } from 'src/library/powersync/schemas/AppSchema'

// Components
import SelectAddress from 'src/custom-ui/select-address'

// Store
import { useActionStore } from 'src/store/actions/actions'
import { useSmugglingFlowStore } from 'src/store/tracking/smugglingFlow'

const BorderType = {
	INBORDERS: 'INBORDERS',
	CROSSBORDERS: 'CROSSBORDERS',
} as const

const ShipmentDirection = {
	INBOUND: 'INBOUND',
	OUTBOUND: 'OUTBOUND',
} as const

const SmugglingFlowSchema = z
	.object({
		borderType: z
			.string({
				message: 'Indica se a carga está dentro das fronteiras ou atravessa fronteiras.',
			})
			.trim()
			.min(2, 'Indica se a carga está dentro das fronteiras ou atravessa fronteiras.'),
		shipmentDirection: z.string().optional(),
		transitType: z
			.string({
				message: 'Indica o tipo de trânsito.',
			})
			.trim()
			.min(2, 'Indica o tipo de trânsito.'),
		// Address fields for INBORDERS shipments
		provinceId: z.string().optional(),
		districtId: z.string().optional(),
		adminPostId: z.string().optional(),
		villageId: z.string().optional(),
		// Destination country for CROSSBORDERS shipments
		destinationCountryId: z.string().optional(),
		borderId: z.string().optional(),
		borderName: z.string().optional(),
		purpose: z
			.string({
				message: 'Indica a finalidade para a qual se transporta a mercadoria.',
			})
			.trim()
			.min(2, 'Indica a finalidade para a qual se transporta a mercadoria.'),
		originDistrict: z
			.string({
				message: 'Indica a província da mercadoria.',
			})
			.trim()
			.min(2, 'Indica a província da mercadoria.'),
		originProvince: z
			.string({
				message: 'Indica a província da mercadoria.',
			})
			.trim()
			.min(2, 'Indica a província da mercadoria.'),
		destinationDistrict: z
			.string({
				message: 'Indica a província da mercadoria.',
			})
			.trim()
			.min(2, 'Indica a província da mercadoria.'),
		destinationProvince: z
			.string({
				message: 'Indica a província da mercadoria.',
			})
			.trim()
			.min(2, 'Indica a província da mercadoria.'),
	})
	.refine(
		(data) => {
			// If INBORDERS, shipmentDirection is required
			if (data.borderType === BorderType.INBORDERS && !data.shipmentDirection) {
				return false
			}
			return true
		},
		{
			message: 'Indica se a carga está a entrar ou sair do distrito.',
			path: ['shipmentDirection'],
		},
	)
	.refine(
		(data) => {
			// If INBORDERS, address fields are required
			if (data.borderType === BorderType.INBORDERS) {
				if (!data.provinceId || !data.districtId || !data.adminPostId || !data.villageId) {
					return false
				}
			}
			return true
		},
		{
			message: 'Todos os campos de endereço são obrigatórios.',
			path: ['provinceId'],
		},
	)
	.refine(
		(data) => {
			// If CROSSBORDERS, destinationCountryId is required
			if (data.borderType === BorderType.CROSSBORDERS && !data.destinationCountryId) {
				return false
			}
			return true
		},
		{
			message: 'Indica o país de destino.',
			path: ['destinationCountryId'],
		},
	)
	.refine(
		(data) => {
			// If CROSSBORDERS, borderId is required
			if (data.borderType === BorderType.CROSSBORDERS && !data.borderId) {
				return false
			}
			return true
		},
		{
			message: 'Indica a fronteira.',
			path: ['borderId'],
		},
	)

type SmugglingFlowFormData = z.infer<typeof SmugglingFlowSchema>

export default function AddSmugglingFlow() {
	const { currentStep, setCurrentStep, totalSteps } = useActionStore()

	const { smugglingFlowInfo, setSmugglingFlowInfo, setDestinationCountryId } = useSmugglingFlowStore()
	const [showCountryModal, setShowCountryModal] = useState(false)
	const [showBorderModal, setShowBorderModal] = useState(false)

	const {
		control,
		formState: { errors },
		setValue,
		setError,
		watch,
		clearErrors,
	} = useForm<SmugglingFlowFormData>({
		defaultValues: {
			borderType: smugglingFlowInfo.borderType || '',
			shipmentDirection: smugglingFlowInfo.shipmentDirection || '',
			transitType: '',
			purpose: '',
			originDistrict: '',
			originProvince: '',
			destinationDistrict: '',
			destinationProvince: '',
			destinationCountryId: smugglingFlowInfo.destinationCountryId || '',
			borderId: smugglingFlowInfo.borderId || '',
			borderName: smugglingFlowInfo.borderName || '',
			provinceId: smugglingFlowInfo.provinceId || '',
			districtId: smugglingFlowInfo.districtId || '',
			adminPostId: smugglingFlowInfo.adminPostId || '',
			villageId: smugglingFlowInfo.villageId || '',
		},
		resolver: zodResolver(SmugglingFlowSchema),
	})

	const borderTypeValue = watch('borderType')
	const shipmentDirectionValue = watch('shipmentDirection')
	const destinationCountryIdValue = watch('destinationCountryId')
	const borderIdValue = watch('borderId')
	const provinceIdValue = watch('provinceId')
	const districtIdValue = watch('districtId')
	const adminPostIdValue = watch('adminPostId')
	const villageIdValue = watch('villageId')

	// Fetch countries from database
	const { data: allCountries } = useQueryMany<CountryRecord>(
		`SELECT id, name, initials, code FROM ${TABLES.COUNTRIES} ORDER BY name ASC`,
	)

	const { data: countryBorders } = useQueryMany<BorderRecord>(
		destinationCountryIdValue
			? `SELECT id, name, border_type FROM ${TABLES.BORDERS} WHERE country_id = '${destinationCountryIdValue}' ORDER BY name ASC`
			: '',
	)

	// Filter to neighboring countries
	const availableCountries = allCountries
		? allCountries
				.filter((country) => country.name && neighboringCountries.includes(country.name))
				.map((country) => ({ label: country.name!, value: country.id }))
		: []

	const availableBorders = countryBorders
		? countryBorders.filter((border) => border.name).map((border) => ({ label: border.name!, value: border.id }))
		: []

	const handlePreviousStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleNextStep = () => {
		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1)

			const selectedBorder = countryBorders?.find((border) => border.id === borderIdValue)

			// Save to smuggling flow store - all required fields
			setSmugglingFlowInfo({
				borderType: borderTypeValue || '',
				shipmentDirection: shipmentDirectionValue || '',
				provinceId: provinceIdValue || '',
				districtId: districtIdValue || '',
				adminPostId: adminPostIdValue || '',
				villageId: villageIdValue || '',
				destinationCountryId: destinationCountryIdValue || '',
				borderId: borderIdValue || '',
				borderName: selectedBorder?.name || '',
			})
		}
	}

	// Sync address fields to store when they change
	useEffect(() => {
		if (provinceIdValue) {
			setSmugglingFlowInfo({
				...smugglingFlowInfo,
				provinceId: provinceIdValue,
			})
		}
	}, [provinceIdValue])

	useEffect(() => {
		if (districtIdValue) {
			setSmugglingFlowInfo({
				...smugglingFlowInfo,
				districtId: districtIdValue,
			})
		}
	}, [districtIdValue])

	useEffect(() => {
		if (adminPostIdValue) {
			setSmugglingFlowInfo({
				...smugglingFlowInfo,
				adminPostId: adminPostIdValue,
			})
		}
	}, [adminPostIdValue])

	useEffect(() => {
		if (villageIdValue) {
			setSmugglingFlowInfo({
				...smugglingFlowInfo,
				villageId: villageIdValue,
			})
		}
	}, [villageIdValue])

	// Sync destinationCountryId to store when it changes
	useEffect(() => {
		if (destinationCountryIdValue) {
			setDestinationCountryId(destinationCountryIdValue)
		}
	}, [destinationCountryIdValue, setDestinationCountryId])

	const isFormValid = () => {
		// Border type must be selected
		if (!borderTypeValue) {
			return false
		}

		// If INBORDERS, check shipmentDirection and address fields
		if (borderTypeValue === BorderType.INBORDERS) {
			if (!shipmentDirectionValue) {
				return false
			}
			// All address fields must be filled
			if (!provinceIdValue || !districtIdValue || !adminPostIdValue || !villageIdValue) {
				return false
			}
			return true
		}

		// If CROSSBORDERS, check destinationCountryId and borderId
		if (borderTypeValue === BorderType.CROSSBORDERS) {
			if (!destinationCountryIdValue || !borderIdValue) {
				return false
			}
			return true
		}

		return false
	}

	return (
		<View className="flex-1">
			<FormWrapper>
				{/* Border Type Question - First Question */}
				<View>
					<Label label="A carga está dentro das fronteiras ou atravessa fronteiras?" />
					<Controller
						control={control}
						name="borderType"
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<View className="">
								<RadioButton
									label="Dentro das fronteiras"
									value={BorderType.INBORDERS}
									checked={borderTypeValue === BorderType.INBORDERS}
									onChange={() => {
										onChange(BorderType.INBORDERS)
										setSmugglingFlowInfo({
											...smugglingFlowInfo,
											borderType: BorderType.INBORDERS,
											shipmentDirection: '',
											destinationCountryId: '',
											borderId: '',
											borderName: '',
										})
										// Reset form fields when switching
										setValue('shipmentDirection', '')
										setValue('destinationCountryId', '')
										setValue('borderId', '')
										setValue('borderName', '')
									}}
								/>
								<RadioButton
									label="Atravessa fronteiras"
									value={BorderType.CROSSBORDERS}
									checked={borderTypeValue === BorderType.CROSSBORDERS}
									onChange={() => {
										onChange(BorderType.CROSSBORDERS)
										setSmugglingFlowInfo({
											...smugglingFlowInfo,
											borderType: BorderType.CROSSBORDERS,
											shipmentDirection: '',
											provinceId: '',
											districtId: '',
											adminPostId: '',
											villageId: '',
											destinationCountryId: '',
											borderId: '',
											borderName: '',
										})
										// Reset form fields when switching
										setValue('shipmentDirection', '')
										setValue('provinceId', '')
										setValue('districtId', '')
										setValue('adminPostId', '')
										setValue('villageId', '')
										setValue('destinationCountryId', '')
										setValue('borderId', '')
										setValue('borderName', '')
									}}
								/>
								{error && <Text className="text-xs text-red-500">{error.message}</Text>}
							</View>
						)}
					/>
				</View>

				{/* Shipment Direction Question - Only shown if INBORDERS */}
				{borderTypeValue === BorderType.INBORDERS && (
					<View className="mt-4">
						<Label label="A carga está entrar ou sair do distrito?" />
						<Controller
							control={control}
							name="shipmentDirection"
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<View className="">
									<RadioButton
										label="A entrar"
										value={ShipmentDirection.INBOUND}
										checked={shipmentDirectionValue === ShipmentDirection.INBOUND}
										onChange={() => {
											onChange(ShipmentDirection.INBOUND)
											setSmugglingFlowInfo({
												...smugglingFlowInfo,
												shipmentDirection: ShipmentDirection.INBOUND,
											})
										}}
									/>
									<RadioButton
										label="A sair"
										value={ShipmentDirection.OUTBOUND}
										checked={shipmentDirectionValue === ShipmentDirection.OUTBOUND}
										onChange={() => {
											onChange(ShipmentDirection.OUTBOUND)
											setSmugglingFlowInfo({
												...smugglingFlowInfo,
												shipmentDirection: ShipmentDirection.OUTBOUND,
											})
										}}
									/>
									{error && <Text className="text-xs text-red-500">{error.message}</Text>}
								</View>
							)}
						/>
					</View>
				)}

				{/* Full Address Component - shown for INBORDERS after direction is selected */}
				{borderTypeValue === BorderType.INBORDERS && shipmentDirectionValue && (
					<View className="mt-4">
						<SelectAddress
							control={control}
							errors={errors}
							customErrors={{}}
							clearFieldError={(name) => clearErrors(name as any)}
							addressLevel={AddressLevel.FROM_PROVINCES}
							description={
								shipmentDirectionValue === ShipmentDirection.INBOUND
									? 'Indica o endereço completo de origem da carga'
									: 'Indica o endereço completo de destino da carga'
							}
						/>
					</View>
				)}

				{/* Destination Country - shown for CROSSBORDERS */}
				{borderTypeValue === BorderType.CROSSBORDERS && (
					<View className="mt-4">
						<Label label="País de destino" />
						<Controller
							control={control}
							name="destinationCountryId"
							rules={{ required: true }}
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => {
								const selectedCountry = availableCountries.find((country) => country.value === value)
								const selectedCountryName = selectedCountry?.label || 'Seleccione o país de destino'
								const hasSelectedCountry = !!value && !!selectedCountry

								return (
									<>
										<CustomSelectItemTrigger
											selectedItem={selectedCountryName}
											setShowItems={setShowCountryModal}
											resetItem={() => {
												onChange('')
												setDestinationCountryId('')
												setValue('borderId', '')
												setValue('borderName', '')
												clearErrors('borderId')
												setSmugglingFlowInfo({
													...smugglingFlowInfo,
													destinationCountryId: '',
													borderId: '',
													borderName: '',
												})
												setShowCountryModal(false)
											}}
											hasSelectedItem={hasSelectedCountry}
										/>
										<CustomSelectItem
											label="Seleccione o país de destino"
											searchPlaceholder="Pesquise por país"
											emptyMessage="Nenhum país encontrado"
											showModal={showCountryModal}
											setShowModal={setShowCountryModal}
											itemsList={availableCountries}
											setValue={(countryValue) => {
												onChange(countryValue)
												setDestinationCountryId(countryValue)
												setValue('borderId', '')
												setValue('borderName', '')
												clearErrors('borderId')
												setSmugglingFlowInfo({
													...smugglingFlowInfo,
													destinationCountryId: countryValue,
													borderId: '',
													borderName: '',
												})
												setShowCountryModal(false)
											}}
										/>
										{error ? (
											<Text className="text-xs text-red-500">{error.message}</Text>
										) : errors.destinationCountryId ? (
											<Text className="text-xs text-red-500">{errors.destinationCountryId.message}</Text>
										) : (
											<FormItemDescription description="Indica o país de destino da carga" />
										)}
									</>
								)
							}}
						/>
					</View>
				)}

				{/* Border selection - shown for CROSSBORDERS */}
				{borderTypeValue === BorderType.CROSSBORDERS && (
					<View className="mt-4">
						<Label label="Seleccione a fronteira" />
						<Controller
							control={control}
							name="borderId"
							rules={{ required: true }}
							render={({ field: { onChange, value }, fieldState: { error } }) => {
								const selectedBorder = availableBorders.find((border) => border.value === value)
								const selectedBorderName = selectedBorder?.label || 'Seleccione a fronteira'
								const hasSelectedBorder = !!selectedBorder

								return (
									<>
										<CustomSelectItemTrigger
											selectedItem={selectedBorderName}
											setShowItems={setShowBorderModal}
											resetItem={() => {
												onChange('')
												setValue('borderName', '')
												clearErrors('borderId')
												setSmugglingFlowInfo({
													...smugglingFlowInfo,
													borderId: '',
													borderName: '',
												})
												setShowBorderModal(false)
											}}
											hasSelectedItem={hasSelectedBorder}
										/>
										<CustomSelectItem
											label="Seleccione a fronteira"
											searchPlaceholder="Pesquise por fronteira"
											emptyMessage={
												availableBorders.length ? 'Nenhuma fronteira encontrada' : 'Nenhuma fronteira disponível'
											}
											showModal={showBorderModal}
											setShowModal={setShowBorderModal}
											itemsList={availableBorders}
											setValue={(borderValue) => {
												onChange(borderValue)
												const selectedOption = availableBorders.find((item) => item.value === borderValue)
												const selectedName = selectedOption?.label || ''
												setValue('borderName', selectedName)
												setSmugglingFlowInfo({
													...smugglingFlowInfo,
													borderId: borderValue,
													borderName: selectedName,
												})
												clearErrors('borderId')
												setShowBorderModal(false)
											}}
										/>
										{error ? (
											<Text className="text-xs text-red-500">{error.message}</Text>
										) : errors.borderId ? (
											<Text className="text-xs text-red-500">{errors.borderId.message}</Text>
										) : (
											<FormItemDescription description="Indica a fronteira por onde a carga atravessa" />
										)}
									</>
								)
							}}
						/>
					</View>
				)}
			</FormWrapper>

			<NextAndPreviousButtons
				// currentStep={currentStep}
				handlePreviousStep={handlePreviousStep}
				handleNextStep={handleNextStep}
				showPreviousButton={currentStep > 0}
				showNextButton={currentStep < totalSteps - 1}
				nextButtonDisabled={!isFormValid()}
				previousButtonDisabled={currentStep === 0}
			/>
		</View>
	)
}
