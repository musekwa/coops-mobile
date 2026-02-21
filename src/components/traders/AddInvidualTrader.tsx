import React, { useState, useCallback, useEffect } from 'react'
import { Text, View, TouchableOpacity, useWindowDimensions, Modal, ScrollView } from 'react-native'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DatePickerModal } from 'react-native-paper-dates'
import { CalendarDate } from 'react-native-paper-dates/lib/typescript/Date/Calendar'
import { Href } from 'expo-router'

import { dateLimits, tradingPurposes, colors } from 'src/constants'
import { errorMessages } from 'src/constants/errorMessages'
import { AddressLevel, TraderType } from 'src/types'
import CustomTextInput from '../custom-text-input/CustomTextInput'
import TraderDataPreview from '../data-preview/TraderDataPreview'
import ChipsList from '../chips-list/ChipsList'
import SuccessAlert from '../dialogs/SuccessAlert'
import DuplicatesPreview from '../data-preview/DuplicatesPreview'
import RadioButton from '../buttons/RadioButton'
import Label from '../forms/Label'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import NextAndPreviousButtons from '../buttons/NextAndPreviousButtons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import FormStepIndicator from '../tracking/FormStepIndicator'
import SelectAddress from 'src/custom-ui/select-address'
import { useTraderStore } from 'src/store/trader'
import { useAddressStore } from 'src/store/address'
import { useCheckTraderDuplicate } from 'src/hooks/useCheckTraderDuplicate'
import { Fontisto } from '@expo/vector-icons'
import FormFieldPreview from '../data-preview/FormFieldPreview'
import { Divider } from 'react-native-paper'
import { capitalize } from 'src/helpers/capitalize'

const TraderSchema = z.object({
	surname: z.string().trim().min(2, 'Indica um apelido.').regex(/^\S*$/, 'Indica apenas um apelido.'),
	otherNames: z.string().trim().min(2, 'Indica outros nomes.'),
	birthDate: z.preprocess(
		(val) => (val instanceof Date ? val : new Date(val as string)),
		z
			.date({
				description: 'Data de Nascimento',
			})
			.min(
				dateLimits.minimumDate,
				`Nascido só depois de ${new Date(dateLimits.minimumDate).toLocaleDateString('pt-BR')}`,
			)
			.max(
				dateLimits.maximumDate,
				`Nascido só antes de ${new Date(dateLimits.maximumDate).toLocaleDateString('pt-BR')}`,
			)
			.refine((date) => !isNaN(date.getTime()), {
				message: 'Invalid date format',
			}),
	),
	primaryPhone: z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, {
		message: 'Indica número válido',
	}),
	secondaryPhone: z
		.union([z.literal(''), z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, 'Indica número válido')])
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
	license: z.string(),
	licenseType: z.string(),
	nuit: z.string().regex(/^\d{9}$/, 'Indica um NUIT válido'),
	traderType: z.string().optional(),
	purposes: z.array(z.string()).optional(),
})

type TraderFormData = z.infer<typeof TraderSchema>

type AddInvidualTraderProps = {
	handleChipSelection: (items: string[], cb: (list: string[]) => void) => void
	// setDuplicates: (duplicates: Trader[] | Farmer[]) => void
	// duplicates: Trader[] | Farmer[]
	setProceed: (proceed: boolean) => void
	proceed: boolean
}

// Add type definitions for screen props
type CustomErrors = { [key: string]: string }
type SetCustomErrors = React.Dispatch<React.SetStateAction<CustomErrors>>

type PersonalInfoScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrors
	clearFieldError: (fieldName: string) => void
	date: Date | undefined
	setDate: (date: Date | undefined) => void
	openDate: boolean
	setOpenDate: (open: boolean) => void
	onDismissSingle: () => void
	onConfirmSingle: (params: { date: CalendarDate }) => void
}

type TraderCategoryScreenProps = {
	control: any
	errors: any
	customErrors: { [key: string]: string }
	selectedTraderType: string
	setSelectedTraderType: (type: string) => void
	resetField: (name: keyof TraderFormData) => void
	clearFieldError: (fieldName: string) => void
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
	customErrors: { [key: string]: string }
	selectedTraderType: string
	handleChipSelection: (items: string[], cb: (list: string[]) => void) => void
	clearFieldError: (fieldName: string) => void
}

// Personal Information Screen
const PersonalInfoScreen = ({
	control,
	errors,
	customErrors,
	clearFieldError,
	date,
	setDate,
	openDate,
	setOpenDate,
	onDismissSingle,
	onConfirmSingle,
}: PersonalInfoScreenProps) => {
	return (
		<View className="w-full space-y-4">
			{/* Surname */}
			<View className="">
				<Controller
					control={control}
					name="surname"
					defaultValue=""
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<CustomTextInput
								label="Apelido"
								value={value}
								onChangeText={(text) => {
									onChange(text)
									clearFieldError('surname')
								}}
								onBlur={onBlur}
								autoCapitalize="words"
								placeholder="Digita o apelido"
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.surname ? (
								<Text className="text-xs text-red-500">{customErrors.surname}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Apenas o apelido</Text>
							)}
						</>
					)}
				/>
			</View>

			{/* Other Names */}
			<View className="">
				<Controller
					control={control}
					name="otherNames"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<CustomTextInput
								label="Outros Nomes"
								value={value}
								onChangeText={(text) => {
									onChange(text)
									clearFieldError('otherNames')
								}}
								onBlur={onBlur}
								autoCapitalize="words"
								placeholder="Digita outros nomes"
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.otherNames ? (
								<Text className="text-xs text-red-500">{customErrors.otherNames}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>outros nomes</Text>
							)}
						</>
					)}
				/>
			</View>

			{/* Date of birth */}
			<View className="space-y-2">
				<View className="flex-1">
					<Controller
						control={control}
						name="birthDate"
						rules={{ required: true }}
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<>
								<TouchableOpacity
									activeOpacity={0.5}
									onPress={() => {
										setOpenDate(true)
									}}
								>
									<CustomTextInput
										editable={false}
										label="Data Nascimento"
										value={value}
										style={{
											texAlign: 'center',
										}}
										onChangeText={onChange}
										onBlur={onBlur}
										keyboardType="numeric"
										placeholder={
											value
												? `${new Date(value).toLocaleDateString('pt-BR')}`
												: `${new Date().toLocaleDateString('pt-BR')}`
										}
									/>
								</TouchableOpacity>
								<DatePickerModal
									locale="pt"
									mode="single"
									startYear={1920}
									endYear={2012}
									presentationStyle="pageSheet"
									label="Data de Nascimento"
									visible={openDate}
									onDismiss={onDismissSingle}
									date={date}
									onConfirm={(params) => {
										onConfirmSingle(params)
										onChange(params.date)
										clearFieldError('birthDate')
									}}
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : customErrors?.birthDate ? (
									<Text className="text-xs text-red-500">{customErrors.birthDate}</Text>
								) : (
									<Text className={`text-xs text-gray-500`}>Data de nascimento</Text>
								)}
							</>
						)}
					/>
				</View>
			</View>
		</View>
	)
}

// Trader Category Screen
const TraderCategoryScreen = ({
	control,
	errors,
	customErrors,
	selectedTraderType,
	setSelectedTraderType,
	resetField,
	clearFieldError,
}: TraderCategoryScreenProps) => {
	return (
		<View className="w-full space-y-4">
			<Label label="Subcategoria de comerciante" />
			<Controller
				name="traderType"
				control={control}
				render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
					<>
						<View className="flex space-y-3 flex-col">
							<RadioButton
								label="Primário"
								value={TraderType.PRIMARY}
								checked={selectedTraderType === TraderType.PRIMARY}
								onChange={(value) => {
									onChange(value)
									setSelectedTraderType(value)
									resetField('purposes')
									clearFieldError('traderType')
								}}
							/>
							<RadioButton
								label="Intermédio"
								value={TraderType.SECONDARY}
								checked={selectedTraderType === TraderType.SECONDARY}
								onChange={(value) => {
									onChange(value)
									setSelectedTraderType(value)
									resetField('purposes')
									clearFieldError('traderType')
								}}
							/>
							<RadioButton
								label="Final"
								value={TraderType.FINAL}
								checked={selectedTraderType === TraderType.FINAL}
								onChange={(value) => {
									onChange(value)
									setSelectedTraderType(value)
									resetField('purposes')
									clearFieldError('traderType')
								}}
							/>
						</View>
						{error ? (
							<Text className="text-xs text-red-500">{error.message}</Text>
						) : customErrors?.traderType ? (
							<Text className="text-xs text-red-500">{customErrors.traderType}</Text>
						) : (
							<Text className={`text-xs text-gray-500`}>Subcategoria de comerciante</Text>
						)}
					</>
				)}
			/>
		</View>
	)
}

// Address Screen
const AddressScreen = ({ control, errors, customErrors, clearFieldError }: AddressScreenProps) => {
	return (
		<SelectAddress
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
			addressLevel={AddressLevel.FROM_PROVINCES}
			description="Indica o endereço de residência do comerciante"
		/>
	)
}

// Contact Information Screen
const ContactInfoScreen = ({ control, errors, customErrors, clearFieldError }: ContactInfoScreenProps) => {
	return (
		<View className="flex flex-col w-full space-y-4">
			<View className="flex-1 ">
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
								<Text className={`text-xs text-gray-500`}>Telemóvel Alternativo</Text>
							)}
						</>
					)}
				/>
			</View>
		</View>
	)
}

// Business Information Screen
const BusinessInfoScreen = ({
	control,
	errors,
	customErrors,
	selectedTraderType,
	handleChipSelection,
	clearFieldError,
}: BusinessInfoScreenProps) => {
	return (
		<View className="w-full space-y-4 py-3">
			<Label label="Tipo de Licença" />
			<Controller
				control={control}
				name="licenseType"
				rules={{ required: true }}
				render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
					<View className="flex flex-col space-x-2">
						<RadioButton
							label="Alvará"
							value={'BUSINESS_LICENSE'}
							checked={value === 'BUSINESS_LICENSE'}
							onChange={() => {
								onChange('BUSINESS_LICENSE')
								clearFieldError('licenseType')
							}}
						/>
						<RadioButton
							label="Mera Comunicação Prévia"
							value={'LOCAL_LICENSE'}
							checked={value === 'LOCAL_LICENSE'}
							onChange={() => {
								onChange('LOCAL_LICENSE')
								clearFieldError('licenseType')
							}}
						/>
						{error ? (
							<Text className="text-xs text-red-500">{error.message}</Text>
						) : customErrors?.licenseType ? (
							<Text className="text-xs text-red-500">{customErrors.licenseType}</Text>
						) : (
							<Text className={`text-xs text-gray-500`}>Tipo de Licença</Text>
						)}
					</View>
				)}
			/>
			<View className="flex flex-row space-x-2 items-center justify-between">
				<View className="flex-1 pb-4">
					<Controller
						control={control}
						name="license"
						rules={{ required: false }}
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<>
								<CustomTextInput
									label=""
									value={value}
									onChangeText={(text) => {
										onChange(text)
										clearFieldError('license')
									}}
									onBlur={onBlur}
									autoCapitalize="characters"
									placeholder="Número de Licença"
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : customErrors?.license ? (
									<Text className="text-xs text-red-500">{customErrors.license}</Text>
								) : (
									<Text className={`text-xs text-gray-500`}>Número de Licença</Text>
								)}
							</>
						)}
					/>
				</View>
			</View>

			{/* NUIT */}
			<View className="flex-1 pb-4">
				<Controller
					control={control}
					name="nuit"
					rules={{ required: false }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<CustomTextInput
								label=""
								value={value}
								keyboardType="numeric"
								onChangeText={(text) => {
									onChange(text)
									clearFieldError('nuit')
								}}
								onBlur={onBlur}
								placeholder="NUIT"
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.nuit ? (
								<Text className="text-xs text-red-500">{customErrors.nuit}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>NUIT</Text>
							)}
						</>
					)}
				/>
			</View>

			{selectedTraderType === TraderType.FINAL && (
				<>
					<Animated.View entering={FadeIn.duration(100)} exiting={FadeOut.duration(100)}>
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
					</Animated.View>
				</>
			)}
		</View>
	)
}

export default function AddInvidualTrader({
	handleChipSelection,
	// setDuplicates,
	// duplicates,
	setProceed,
	proceed,
}: AddInvidualTraderProps) {
	const [errorMessage, setErrorMessage] = useState('')

	const [success, setSuccess] = useState(false)
	const [routeSegment, setRouteSegment] = useState<Href | undefined>(undefined)
	const [currentScreen, setCurrentScreen] = useState(0)

	const { resetFormData, setFormData, validateFormData, formData } = useTraderStore()
	const { validateByAddressLevel } = useAddressStore()
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		resetField,
		getValues,
		watch,
		setValue,
	} = useForm<TraderFormData>({
		defaultValues: {
			surname: formData?.surname || '',
			otherNames: formData?.otherNames || '',
			birthDate: formData.birthDate,
			primaryPhone: formData.primaryPhone || undefined,
			secondaryPhone: formData.secondaryPhone || undefined,
			nuit: formData.nuit || '',
			license: formData.license || '',
			licenseType: formData.licenseType || '',
			traderType: formData.traderType || '',
			purposes: formData.purposes || [],
		},
		resolver: zodResolver(TraderSchema),
	})
	const { width } = useWindowDimensions()
	const barWidth = width - 5 * 8

	const [previewData, setPreviewData] = useState(false)
	const [date, setDate] = useState<Date | undefined>(undefined)
	const [openDate, setOpenDate] = useState(false)
	const [selectedTraderType, setSelectedTraderType] = useState('')
	const [hasError, setHasError] = useState(false)
	const [showDuplicateModal, setShowDuplicateModal] = useState(false)

	const primaryPhoneValue = watch('primaryPhone')
	const secondaryPhoneValue = watch('secondaryPhone')
	const nuitValue = watch('nuit')

	// Check for duplicate traders (phone numbers and NUIT only)
	// Individual traders have NO birth place, but MUST have NUIT and phone number
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

	// dismiss the date picker
	const onDismissSingle = useCallback(() => {
		setOpenDate(false)
	}, [setOpenDate])

	// confirm the selected date
	const onConfirmSingle = useCallback(
		(params: { date: CalendarDate }) => {
			setOpenDate(false)
			setDate(params.date)
		},
		[setOpenDate, setDate],
	)

	const [tradePurposes, setTradePurposes] = useState([''])
	const [customErrors, setCustomErrors] = useState<CustomErrors>({})

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
			case 0: // Personal Information
				if (!values.surname || values.surname.length < 2 || values.surname.trim().includes(' ')) {
					currentErrors.surname = 'Indica um apelido válido e sem espaços.'
				}
				if (!values.otherNames || values.otherNames.length < 2) {
					currentErrors.otherNames = 'Indica outros nomes válidos.'
				}
				if (!values.birthDate) {
					currentErrors.birthDate = 'Indica a data de nascimento.'
				} else {
					// Calculate age
					const today = new Date()
					const birthDate = new Date(values.birthDate)
					const age = today.getFullYear() - birthDate.getFullYear()
					const monthDiff = today.getMonth() - birthDate.getMonth()

					// Adjust age if birthday hasn't occurred this year
					const adjustedAge =
						monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age

					if (adjustedAge < 12) {
						currentErrors.birthDate = 'O comerciante deve ter pelo menos 12 anos de idade.'
					}
				}
				break

			case 1: // Trader Category
				if (!values.traderType) {
					currentErrors.traderType = 'Seleccione uma subcategoria de comerciante.'
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
				if (!values.licenseType) {
					currentErrors.licenseType = 'Seleccione o tipo de licença.'
				}
				if (!values.license) {
					currentErrors.license = 'Indica o número da licença.'
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
				if (values.traderType === TraderType.FINAL && (!values.purposes || values.purposes.length === 0)) {
					currentErrors.purposes = 'Seleccione pelo menos uma finalidade.'
				}
				break
		}

		setCustomErrors(currentErrors)
		return Object.keys(currentErrors).length === 0
	}

	const onSubmit = (data: TraderFormData) => {
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
			})
			// Validate the form data
			const result = TraderSchema.safeParse(data)
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

	// Reset the category trade purposes when the trader type is changed
	useEffect(() => {
		if (selectedTraderType !== TraderType.FINAL) {
			setTradePurposes([''])
		}
	}, [selectedTraderType, setSelectedTraderType])

	// Reset the form data when the form is submitted successfully or when the component mounts
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
		<PersonalInfoScreen
			key="personal"
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
			date={date}
			setDate={setDate}
			openDate={openDate}
			setOpenDate={setOpenDate}
			onDismissSingle={onDismissSingle}
			onConfirmSingle={onConfirmSingle}
		/>,
		<TraderCategoryScreen
			key="category"
			control={control}
			errors={errors}
			customErrors={customErrors}
			selectedTraderType={selectedTraderType}
			setSelectedTraderType={setSelectedTraderType}
			resetField={resetField}
			clearFieldError={clearFieldError}
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
			selectedTraderType={selectedTraderType}
			handleChipSelection={handleChipSelection}
			clearFieldError={clearFieldError}
		/>,
	]

	const handleNext = () => {
		if (currentScreen < screens.length - 1) {
			const isValid = validateCurrentScreen()
			if (isValid) {
				setCurrentScreen(currentScreen + 1)
			} else {
				setHasError(true)
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
		<View className="flex-1 relative w-full">
			<FormStepIndicator
				barWidth={barWidth / (screens.length + 1)}
				currentStep={currentScreen}
				totalSteps={screens.length + 1}
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
				className="flex-1 px-3 "
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
					proceed={proceed}
					reset={reset}
				/>

				<DuplicatesPreview setProceed={setProceed} hint="Trader" />
			</KeyboardAwareScrollView>

			<View className="absolute bottom-0 left-0 right-0">
				<NextAndPreviousButtons
					// currentStep={currentScreen}
					handlePreviousStep={handlePrevious}
					handleNextStep={currentScreen === screens.length - 1 ? handleSubmit(onSubmit) : handleNext}
					previousButtonDisabled={currentScreen === 0}
					showPreviousButton={currentScreen > 0}
					nextButtonDisabled={currentScreen === screens.length}
					nextButtonText={currentScreen === screens.length - 1 ? 'Submeter' : 'Avançar'}
					previousButtonText={currentScreen === 0 ? 'Voltar' : 'Anterior'}
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
