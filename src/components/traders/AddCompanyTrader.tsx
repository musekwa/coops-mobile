import { Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import CustomTextInput from '../custom-text-input/CustomTextInput'
import { tradingPurposes, colors } from 'src/constants'
import ChipsList from '../chips-list/ChipsList'
import { useTraderStore } from 'src/store/trader'
import TraderDataPreview from '../data-preview/TraderDataPreview'
import { AddressLevel, TraderType, TradingPurpose } from 'src/types'
import { errorMessages } from 'src/constants/errorMessages'
import SuccessAlert from '../dialogs/SuccessAlert'
import DuplicatesPreview from '../data-preview/DuplicatesPreview'
import NextAndPreviousButtons from '../buttons/NextAndPreviousButtons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import Label from '../forms/Label'
import FormStepIndicator from '../tracking/FormStepIndicator'
import { useWindowDimensions } from 'react-native'
import SelectAddress from 'src/custom-ui/select-address'
import { useAddressStore } from 'src/store/address'
import { useCheckTraderDuplicate } from 'src/hooks/useCheckTraderDuplicate'
import { Fontisto } from '@expo/vector-icons'
import FormFieldPreview from '../data-preview/FormFieldPreview'
import { Divider } from 'react-native-paper'
import { capitalize } from 'src/helpers/capitalize'
import { Href } from 'expo-router'

const TraderCompanySchema = z.object({
	surname: z.string(),
	otherNames: z.string().trim().min(2, 'Indica outros nomes.'),
	purposes: z.array(z.string()).optional(),
	license: z
		.string({
			message: 'Indica um número de alvará válido',
		})
		.min(4, 'Indica um número de alvará válido'),
	licenseType: z.string().optional(),
	nuel: z.string().regex(/^\d{9}$/, 'Indica o NUEL válido'),
	nuit: z.string().regex(/^\d{9}$/, 'Indica o NUIT válido'),
	primaryPhone: z
		.string({
			message: 'Indica um número de telefone válido',
		})
		.regex(/^(84|86|87|85|82|83)\d{7}$/, {
			message: 'Indica número válido',
		})
		.transform((val) => (val === '' ? undefined : val)),
	secondaryPhone: z
		.union([z.literal(''), z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, 'Indica número válido')])
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
})

type TraderCompanyFormData = z.infer<typeof TraderCompanySchema>

type AddCompanyTraderProps = {
	handleChipSelection: (items: string[], cb: (list: string[]) => void) => void
	// setDuplicates: (duplicates: Trader[] | Farmer[]) => void
	// duplicates: Trader[] | Farmer[]
	setProceed: (proceed: boolean) => void
	proceed: boolean
}

type CustomErrors = { [key: string]: string }

// Screen component types
type CompanyInfoScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrors
	clearFieldError: (fieldName: string) => void
}

type PurposesScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrors
	handleChipSelection: (items: string[], cb: (list: string[]) => void) => void
	clearFieldError: (fieldName: string) => void
	setCustomErrors: (errors: CustomErrors) => void
}

type AddressScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrors
	clearFieldError: (fieldName: string) => void
}

type ContactInfoScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrors
	clearFieldError: (fieldName: string) => void
}

type BusinessInfoScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrors
	clearFieldError: (fieldName: string) => void
}

// Screen Components
const CompanyInfoScreen = ({ control, errors, customErrors, clearFieldError }: CompanyInfoScreenProps) => {
	return (
		<View className="w-full space-y-4">
			<Controller
				control={control}
				name="otherNames"
				rules={{ required: true }}
				render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
					<>
						<CustomTextInput
							label="Nome da Empresa"
							value={value}
							onChangeText={(text) => {
								onChange(text)
								clearFieldError('otherNames')
							}}
							onBlur={onBlur}
							autoCapitalize="words"
							placeholder="Digita o nome da empresa"
						/>
						{error ? (
							<Text className="text-xs text-red-500">{error.message}</Text>
						) : customErrors?.otherNames ? (
							<Text className="text-xs text-red-500">{customErrors.otherNames}</Text>
						) : (
							<Text className={`text-xs text-gray-500`}>Indica o nome da empresa</Text>
						)}
					</>
				)}
			/>
		</View>
	)
}

const PurposesScreen = ({
	control,
	errors,
	customErrors,
	handleChipSelection,
	clearFieldError,
}: PurposesScreenProps) => {
	return (
		<View>
			<Label label="Finalidade" />
			<Controller
				control={control}
				name="purposes"
				rules={{ required: true }}
				render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
					<>
						<ChipsList
							items={tradingPurposes}
							onSelectionChange={(items) => {
								handleChipSelection(items, onChange)
								clearFieldError('purposes')
							}}
						/>
						<View>
							{customErrors?.purposes ? (
								<Text className="text-xs text-red-500">{customErrors.purposes}</Text>
							) : errors.purposes ? (
								<Text className="text-xs text-red-500">{errors.purposes}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Utilização da castanha</Text>
							)}
						</View>
					</>
				)}
			/>
		</View>
	)
}

const AddressScreen = ({ control, errors, customErrors, clearFieldError }: AddressScreenProps) => {
	return (
		<SelectAddress
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
			addressLevel={AddressLevel.FROM_PROVINCES}
			description="Indica o endereço de residência da empresa"
		/>
	)
}

const ContactInfoScreen = ({ control, errors, customErrors, clearFieldError }: ContactInfoScreenProps) => {
	return (
		<View className="w-full space-y-4">
			<View className="flex-1">
				<Controller
					control={control}
					name="primaryPhone"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<CustomTextInput
								label="Telemóvel Principal"
								value={value}
								onChangeText={(text) => {
									onChange(text)
									clearFieldError('primaryPhone')
								}}
								onBlur={onBlur}
								keyboardType="phone-pad"
								placeholder="Telemóvel"
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.primaryPhone ? (
								<Text className="text-xs text-red-500">{customErrors.primaryPhone}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Número de telefone</Text>
							)}
						</>
					)}
				/>
			</View>
			<View className="flex-1">
				<Controller
					control={control}
					name="secondaryPhone"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<CustomTextInput
								label="Telemóvel Alternativo (opcional)"
								value={value}
								onChangeText={(text) => {
									onChange(text)
									clearFieldError('secondaryPhone')
								}}
								onBlur={onBlur}
								keyboardType="phone-pad"
								placeholder="Telemóvel"
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.secondaryPhone ? (
								<Text className="text-xs text-red-500">{customErrors.secondaryPhone}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Número de telefone</Text>
							)}
						</>
					)}
				/>
			</View>
		</View>
	)
}

const BusinessInfoScreen = ({ control, errors, customErrors, clearFieldError }: BusinessInfoScreenProps) => {
	return (
		<View className="w-full space-y-4">
			<Label label="Documentação" />
			<View className="flex flex-row space-x-2 items-center justify-between">
				<View className="flex-1">
					<Controller
						control={control}
						name="license"
						rules={{ required: false }}
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<>
								<CustomTextInput
									label="Alvará"
									value={value}
									onChangeText={(text) => {
										onChange(text)
										clearFieldError('license')
									}}
									onBlur={onBlur}
									autoCapitalize="characters"
									placeholder="Número de alvará"
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : customErrors?.license ? (
									<Text className="text-xs text-red-500">{customErrors.license}</Text>
								) : (
									<Text className={`text-xs text-gray-500`}>Número de alvará</Text>
								)}
							</>
						)}
					/>
				</View>
			</View>

			<View className="space-x-2">
				<View className="flex-1 pb-3">
					<Controller
						control={control}
						name="nuit"
						rules={{ required: false }}
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<>
								<CustomTextInput
									label="NUIT"
									value={value}
									keyboardType="numeric"
									onChangeText={(text) => {
										onChange(text)
										clearFieldError('nuit')
									}}
									onBlur={onBlur}
									placeholder="NUIT da empresa"
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : customErrors?.nuit ? (
									<Text className="text-xs text-red-500">{customErrors.nuit}</Text>
								) : (
									<Text className={`text-xs text-gray-500`}>NUIT da empresa</Text>
								)}
							</>
						)}
					/>
				</View>
			</View>

			<View className="pb-3">
				<Controller
					control={control}
					name="nuel"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<CustomTextInput
								label="NUEL"
								value={value}
								keyboardType="numeric"
								onChangeText={(text) => {
									onChange(text)
									clearFieldError('nuel')
								}}
								onBlur={onBlur}
								placeholder="Número de Entidade Legal da empresa"
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.nuel ? (
								<Text className={`text-xs text-red-500`}>{customErrors.nuel}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Número Único de Entidade Legal da empresa</Text>
							)}
						</>
					)}
				/>
			</View>
		</View>
	)
}

export default function AddCompanyTrader({
	handleChipSelection,
	// setDuplicates,
	// duplicates,
	setProceed,
	proceed,
}: AddCompanyTraderProps) {
	const [errorMessage, setErrorMessage] = useState('')
	const [success, setSuccess] = useState(false)
	const [hasError, setHasError] = useState(false)
	const [routeSegment, setRouteSegment] = useState<Href | undefined>(undefined)
	const [customErrors, setCustomErrors] = useState<CustomErrors>({})
	const [previewData, setPreviewData] = useState(false)
	const [currentScreen, setCurrentScreen] = useState(0)
	const [showDuplicateModal, setShowDuplicateModal] = useState(false)
	const { width } = useWindowDimensions()
	const barWidth = width - 5 * 8

	const { resetFormData, setFormData, validateFormData, formData } = useTraderStore()
	const { validateByAddressLevel } = useAddressStore()
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		getValues,
		watch,
	} = useForm<TraderCompanyFormData>({
		defaultValues: {
			surname: 'COMPANY',
			otherNames: formData?.otherNames || '',
			primaryPhone: formData.primaryPhone || undefined,
			secondaryPhone: formData.secondaryPhone || undefined,
			nuit: formData.nuit || '',
			nuel: formData.nuel || '',
			license: formData.license || '',
			licenseType: formData.licenseType || 'alvara',
			purposes: formData.purposes || [],
		},
		resolver: zodResolver(TraderCompanySchema),
	})

	const primaryPhoneValue = watch('primaryPhone')
	const secondaryPhoneValue = watch('secondaryPhone')
	const nuitValue = watch('nuit')

	// Check for duplicate traders (phone numbers and NUIT only)
	// Company traders MUST have NUIT and phone number
	// Traders are NOT restricted to user district
	const {
		hasDuplicate,
		duplicateType,
		message: duplicateMessage,
		isLoading: isCheckingDuplicate,
		duplicateTraders,
	} = useCheckTraderDuplicate({
		nuit: nuitValue,
		primaryPhone: primaryPhoneValue,
		secondaryPhone: secondaryPhoneValue,
	})

	const clearFieldError = (fieldName: string) => {
		setCustomErrors((prev: CustomErrors) => {
			const newErrors = { ...prev }
			delete newErrors[fieldName]
			return newErrors
		})
	}

	const validateCurrentScreen = () => {
		const values = getValues()
		const currentErrors: { [key: string]: string } = {}

		switch (currentScreen) {
			case 0: // Company Information
				if (!values.otherNames || values.otherNames.length < 2) {
					currentErrors.otherNames = 'Indica o nome da empresa.'
				}
				break
			case 1: // Purposes
				console.log('values.purposes', values.purposes)
				if (!values.purposes || values.purposes.length === 0) {
					currentErrors.purposes = 'Seleccione pelo menos uma finalidade.'
				}
				if (values.purposes) {
					const isSecondary = values.purposes.find((p) => p === TradingPurpose.RESELLING || p === TradingPurpose.LOCAL)
					const isExporter = values.purposes.find((p) => p === TradingPurpose.EXPORT)
					const isLargeScaleProcessor = values.purposes.find((p) => p === TradingPurpose.LARGE_SCALE_PROCESSING)
					const isSmallScaleProcessor = values.purposes.find((p) => p === TradingPurpose.SMALL_SCALE_PROCESSING)

					if (isSmallScaleProcessor && isLargeScaleProcessor) {
						currentErrors.purposes = 'O Processador não pode ser artesanal e industrial ao mesmo tempo.'
					}
					if (isSecondary && (isSmallScaleProcessor || isLargeScaleProcessor || isExporter)) {
						currentErrors.purposes = 'O Comerciante não pode ser Intermediário e Final ao mesmo tempo.'
					}
				}

				break
			case 2: // Address Information
				const addressResult = validateByAddressLevel(AddressLevel.FROM_PROVINCES)
				if (!addressResult.success) {
					currentErrors.address = addressResult.message
				}
				break
			case 3: // Contact Information
				if (!values.primaryPhone || !/^(84|86|87|85|82|83)\d{7}$/.test(values.primaryPhone)) {
					currentErrors.primaryPhone = 'Indica um número de telefone válido.'
				}
				if (values.secondaryPhone && !/^(84|86|87|85|82|83)\d{7}$/.test(values.secondaryPhone)) {
					currentErrors.secondaryPhone = 'Indica um número de telefone válido.'
				}
				// Check for phone number duplicates
				if (!isCheckingDuplicate && hasDuplicate && duplicateMessage && duplicateType === 'phone') {
					const primaryPhoneTrimmed = values.primaryPhone?.trim()
					const secondaryPhoneTrimmed = values.secondaryPhone?.trim()

					const primaryMatch = duplicateTraders?.some(
						(t) =>
							primaryPhoneTrimmed &&
							primaryPhoneTrimmed !== '' &&
							primaryPhoneTrimmed !== 'N/A' &&
							((t.primary_phone === primaryPhoneTrimmed && t.primary_phone !== 'N/A') ||
								(t.secondary_phone === primaryPhoneTrimmed && t.secondary_phone !== 'N/A')),
					)
					const secondaryMatch = duplicateTraders?.some(
						(t) =>
							secondaryPhoneTrimmed &&
							secondaryPhoneTrimmed !== '' &&
							secondaryPhoneTrimmed !== 'N/A' &&
							((t.primary_phone === secondaryPhoneTrimmed && t.primary_phone !== 'N/A') ||
								(t.secondary_phone === secondaryPhoneTrimmed && t.secondary_phone !== 'N/A')),
					)

					if (primaryMatch && primaryPhoneTrimmed) {
						currentErrors.primaryPhone = duplicateMessage
					}
					if (secondaryMatch && secondaryPhoneTrimmed) {
						currentErrors.secondaryPhone = duplicateMessage
					}

					// If no specific match found but duplicate is phone type, show on primary phone by default
					if (!primaryMatch && !secondaryMatch && duplicateTraders && duplicateTraders.length > 0) {
						currentErrors.primaryPhone = duplicateMessage
					}
				}
				break
			case 4: // Business Information
				if (!values.license) {
					currentErrors.license = 'Indica o número do alvará.'
				}
				if (!values.nuit) {
					currentErrors.nuit = 'Indica o NUIT.'
				} else if (!/^\d{9}$/.test(values.nuit)) {
					currentErrors.nuit = 'O NUIT deve ter 9 dígitos.'
				} else {
					// Only check for NUIT duplicates if NUIT format is valid
					// Check for duplicate trader (only if not checking duplicate - to avoid race conditions)
					if (!isCheckingDuplicate && hasDuplicate && duplicateMessage && duplicateType === 'nuit') {
						currentErrors.nuit = duplicateMessage
					}
				}
				if (!values.nuel) {
					currentErrors.nuel = 'Indica o NUEL.'
				} else if (!/^\d{9}$/.test(values.nuel)) {
					currentErrors.nuel = 'O NUEL deve ter 9 dígitos.'
				}
				// Check for phone duplicates (can happen even if NUIT is valid)
				if (!isCheckingDuplicate && hasDuplicate && duplicateMessage && duplicateType === 'phone') {
					// Check which phone number matches - use form values for accuracy
					const primaryPhoneTrimmed = primaryPhoneValue?.trim()
					const secondaryPhoneTrimmed = secondaryPhoneValue?.trim()

					const primaryMatch = duplicateTraders?.some(
						(t) =>
							primaryPhoneTrimmed &&
							primaryPhoneTrimmed !== '' &&
							primaryPhoneTrimmed !== 'N/A' &&
							((t.primary_phone === primaryPhoneTrimmed && t.primary_phone !== 'N/A') ||
								(t.secondary_phone === primaryPhoneTrimmed && t.secondary_phone !== 'N/A')),
					)
					const secondaryMatch = duplicateTraders?.some(
						(t) =>
							secondaryPhoneTrimmed &&
							secondaryPhoneTrimmed !== '' &&
							secondaryPhoneTrimmed !== 'N/A' &&
							((t.primary_phone === secondaryPhoneTrimmed && t.primary_phone !== 'N/A') ||
								(t.secondary_phone === secondaryPhoneTrimmed && t.secondary_phone !== 'N/A')),
					)

					if (primaryMatch && primaryPhoneTrimmed) {
						currentErrors.primaryPhone = duplicateMessage
					}
					if (secondaryMatch && secondaryPhoneTrimmed) {
						currentErrors.secondaryPhone = duplicateMessage
					}

					// If no specific match found but duplicate is phone type, show on primary phone by default
					if (!primaryMatch && !secondaryMatch && duplicateTraders && duplicateTraders.length > 0) {
						currentErrors.primaryPhone = duplicateMessage
					}
				}
				break
		}

		setCustomErrors(currentErrors)
		return Object.keys(currentErrors).length === 0
	}

	const onSubmit = (data: TraderCompanyFormData) => {
		const isValid = validateCurrentScreen()

		if (isValid) {
			// Check for duplicates before proceeding (wait if still checking)
			if (isCheckingDuplicate) {
				// Still checking, wait a moment
				setTimeout(() => {
					onSubmit(data)
				}, 500)
				return
			}

			// Check for duplicates before proceeding to preview
			if (hasDuplicate && duplicateMessage && duplicateTraders && duplicateTraders.length > 0) {
				// Show duplicate modal instead of navigating to preview
				setShowDuplicateModal(true)
				// Also set field errors to indicate where the duplicate was found
				const duplicateErrors: { [key: string]: string } = {}
				if (duplicateType === 'nuit') {
					duplicateErrors.nuit = duplicateMessage
				} else if (duplicateType === 'phone') {
					// Check which phone number matches - use form values to ensure accuracy
					const primaryPhoneTrimmed = primaryPhoneValue?.trim()
					const secondaryPhoneTrimmed = secondaryPhoneValue?.trim()

					const primaryMatch = duplicateTraders?.some(
						(t) =>
							primaryPhoneTrimmed &&
							primaryPhoneTrimmed !== '' &&
							primaryPhoneTrimmed !== 'N/A' &&
							((t.primary_phone === primaryPhoneTrimmed && t.primary_phone !== 'N/A') ||
								(t.secondary_phone === primaryPhoneTrimmed && t.secondary_phone !== 'N/A')),
					)
					const secondaryMatch = duplicateTraders?.some(
						(t) =>
							secondaryPhoneTrimmed &&
							secondaryPhoneTrimmed !== '' &&
							secondaryPhoneTrimmed !== 'N/A' &&
							((t.primary_phone === secondaryPhoneTrimmed && t.primary_phone !== 'N/A') ||
								(t.secondary_phone === secondaryPhoneTrimmed && t.secondary_phone !== 'N/A')),
					)

					if (primaryMatch && primaryPhoneTrimmed) {
						duplicateErrors.primaryPhone = duplicateMessage
					}
					if (secondaryMatch && secondaryPhoneTrimmed) {
						duplicateErrors.secondaryPhone = duplicateMessage
					}

					// If no specific match found but duplicate is phone type, show on primary phone by default
					if (!primaryMatch && !secondaryMatch && duplicateTraders && duplicateTraders.length > 0) {
						duplicateErrors.primaryPhone = duplicateMessage
					}
				}
				setCustomErrors(duplicateErrors)
				return
			}

			setFormData({
				...data,
				traderType:
					data.purposes?.includes(TradingPurpose.EXPORT) ||
					data.purposes?.includes(TradingPurpose.LARGE_SCALE_PROCESSING) ||
					data.purposes?.includes(TradingPurpose.SMALL_SCALE_PROCESSING) ||
					data.purposes?.includes(TradingPurpose.LOCAL)
						? TraderType.FINAL
						: TraderType.SECONDARY,
			})
			// Validate the form data
			const result = TraderCompanySchema.safeParse(data)
			if (result.success && Object.keys(validateFormData()).length > 0) {
				setCustomErrors(validateFormData())
			} else {
				setPreviewData(true)
			}
		} else {
			setHasError(true)
			setErrorMessage(errorMessages.formFields)
		}
	}

	useEffect(() => {
		resetFormData()
	}, [])

	useEffect(() => {
		if ((errors && Object.keys(errors).length > 0) || Object.keys(customErrors).length > 0) {
			setHasError(true)
			setErrorMessage(errorMessages.formFields)
		}
	}, [errors, customErrors])

	const screens = [
		<CompanyInfoScreen
			key="company"
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
		/>,
		<PurposesScreen
			key="purposes"
			control={control}
			errors={errors}
			customErrors={customErrors}
			handleChipSelection={handleChipSelection}
			clearFieldError={clearFieldError}
			setCustomErrors={setCustomErrors}
		/>,
		<AddressScreen
			key="address"
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
		/>,
		<ContactInfoScreen
			key="contact"
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
		/>,
		<BusinessInfoScreen
			key="business"
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
		/>,
	]

	const handleNext = () => {
		if (currentScreen < screens.length - 1) {
			const isValid = validateCurrentScreen()
			if (isValid) {
				setCurrentScreen(currentScreen + 1)
			} else {
				setErrorMessage(errorMessages.formFields)
			}
		}
	}

	const handlePrevious = () => {
		if (currentScreen > 0) {
			setCurrentScreen(currentScreen - 1)
		}
	}

	return (
		<View className="flex-1 relative">
			<FormStepIndicator
				currentStep={currentScreen}
				totalSteps={screens.length + 1}
				barWidth={barWidth / (screens.length + 1)}
			/>
			<KeyboardAwareScrollView
				decelerationRate={'normal'}
				fadingEdgeLength={2}
				keyboardDismissMode="on-drag"
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				contentContainerStyle={{
					paddingBottom: 60,
					paddingTop: 20,
					alignItems: 'center',
				}}
				className="flex-1 px-3"
			>
				{screens[currentScreen]}

				<SuccessAlert visible={success} setVisible={setSuccess} route={routeSegment} />

				<TraderDataPreview
					hasError={hasError}
					errorMessage={errorMessage}
					setHasError={setHasError}
					setErrorMessage={setErrorMessage}
					setSuccess={setSuccess}
					setRouteSegment={setRouteSegment}
					previewData={previewData}
					setPreviewData={setPreviewData}
					trader={formData}
					// setDuplicates={setDuplicates}
					// duplicates={duplicates}
					proceed={proceed}
					reset={reset}
				/>

				<DuplicatesPreview
					setProceed={setProceed}
					hint="Trader"
					// setDuplicates={setDuplicates}
					// duplicates={duplicates}
				/>
			</KeyboardAwareScrollView>

			<View className="absolute bottom-0 left-0 right-0">
				<NextAndPreviousButtons
					// currentStep={currentScreen}
					handlePreviousStep={handlePrevious}
					handleNextStep={currentScreen === screens.length - 1 ? handleSubmit(onSubmit) : handleNext}
					previousButtonDisabled={currentScreen === 0}
					nextButtonDisabled={currentScreen === screens.length}
					nextButtonText={currentScreen === screens.length - 1 ? 'Submeter' : 'Avançar'}
					previousButtonText={currentScreen === 0 ? 'Voltar' : 'Anterior'}
					showPreviousButton={currentScreen > 0}
				/>
			</View>

			{/* Duplicate Traders Modal - Shows automatically when duplicates are found on submit */}
			<Modal visible={showDuplicateModal} presentationStyle="pageSheet" animationType="slide">
				<View className="flex-1 w-full bg-white dark:bg-black">
					{/* Header */}
					<View className="flex flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
						<View className="flex-1 mr-4">
							<Text className="text-[18px] font-bold text-black dark:text-white">
								Comerciantes Duplicados Encontrados
							</Text>
							<Text className="text-[12px] text-red-600 dark:text-red-400 mt-1">
								Não é possível prosseguir enquanto existirem duplicados
							</Text>
						</View>
						<TouchableOpacity onPress={() => setShowDuplicateModal(false)} className="p-2" activeOpacity={0.7}>
							<Fontisto name="close" size={24} color={colors.gray600} />
						</TouchableOpacity>
					</View>

					{/* Duplicate Traders List */}
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							paddingBottom: 20,
							paddingTop: 10,
						}}
						className="p-4"
					>
						{duplicateTraders?.map((trader, index) => (
							<View key={trader.id} className="mb-6">
								<View className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
									<Text className="text-[16px] font-bold text-black dark:text-white mb-3">
										Comerciante Duplicado #{index + 1}
									</Text>

									<View className="space-y-2">
										<FormFieldPreview
											title="Nome Completo:"
											value={`${capitalize(trader.other_names)} ${capitalize(trader.surname)}`}
										/>

										{trader.identifier && trader.identifier !== 'N/A' && trader.identifier.trim() !== '' && (
											<FormFieldPreview title="NUIT:" value={trader.identifier} />
										)}

										{(trader.primary_phone || trader.secondary_phone) &&
											(trader.primary_phone !== 'N/A' || trader.secondary_phone !== 'N/A') && (
												<>
													{trader.primary_phone && trader.primary_phone !== 'N/A' && (
														<FormFieldPreview title="Telefone Principal:" value={trader.primary_phone} />
													)}
													{trader.secondary_phone && trader.secondary_phone !== 'N/A' && (
														<FormFieldPreview title="Telefone Alternativo:" value={trader.secondary_phone} />
													)}
												</>
											)}
									</View>
								</View>
								{index < duplicateTraders.length - 1 && <Divider className="my-4" />}
							</View>
						))}
					</ScrollView>

					{/* Footer */}
					<View className="border-t border-gray-200 dark:border-gray-700 p-4">
						<TouchableOpacity
							onPress={() => setShowDuplicateModal(false)}
							className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 items-center"
							activeOpacity={0.7}
						>
							<Text className="text-[16px] font-semibold text-black dark:text-white">Fechar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	)
}
