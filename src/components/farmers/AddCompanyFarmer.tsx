import { Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import CustomTextInput from '../custom-text-input/CustomTextInput'
import { privateInstitutions, publicInstitutions } from 'src/constants'
import { CustomPicker } from '../custom-select-item/CustomPicker'
import { useFarmerStore } from 'src/store/farmer'
import FarmerDataPreview from '../data-preview/FarmerDataPreview'
import { errorMessages } from 'src/constants/errorMessages'
import DuplicatesPreview from '../data-preview/DuplicatesPreview'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import NextAndPreviousButtons from '../buttons/NextAndPreviousButtons'
import FormItemDescription from '../forms/FormItemDescription'
import Label from '../forms/Label'
import FormStepIndicator from '../tracking/FormStepIndicator'
import { useWindowDimensions } from 'react-native'
import RadioButton from '../buttons/RadioButton'
import { useUserDetails } from 'src/hooks/queries'
import SelectAddress from 'src/custom-ui/select-address'
import { AddressLevel } from 'src/types'
import { useAddressStore } from 'src/store/address'
import { Href, useRouter } from 'expo-router'
import { useCheckFarmerDuplicate } from 'src/hooks/useCheckFarmerDuplicate'
import { Fontisto } from '@expo/vector-icons'
import FormFieldPreview from '../data-preview/FormFieldPreview'
import { Divider } from 'react-native-paper'
import { capitalize } from 'src/helpers/capitalize'
import { colors } from 'src/constants'

const CompanyFarmerSchema = z.object({
	surname: z.string().trim().min(2, 'Indica tipo da instituição.'),
	otherNames: z.string().trim().min(2, 'Indica nome da instituição.'),
	primaryPhone: z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, {
		message: 'Indica número válido',
	}),
	secondaryPhone: z
		.union([z.literal(''), z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, 'Indica número válido')])
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
	nuit: z.string().regex(/^\d{9}$/, 'Indica um NUIT válido'),
})

type CompanyFarmerFormData = z.infer<typeof CompanyFarmerSchema>

type CustomErrorType = {
	[key: string]: string
}

type CompanyInfoScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrorType
	institutionsOptions: { label: string; value: string }[]
	isPrivate: 'YES' | 'NO' | undefined
	setIsPrivate: (value: 'YES' | 'NO' | undefined) => void
	clearFieldError: (fieldName: string) => void
}

type AddressScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrorType
	clearFieldError: (fieldName: string) => void
	districtId: string
}

type ContactInfoScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrorType
	clearFieldError: (fieldName: string) => void
}

type DocumentationScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrorType
	clearFieldError: (fieldName: string) => void
}

// Screen Components
const CompanyInfoScreen = ({
	control,
	errors,
	customErrors,
	institutionsOptions,
	isPrivate,
	setIsPrivate,
	clearFieldError,
}: CompanyInfoScreenProps) => {
	return (
		<View className="w-full space-y-4">
			<FormItemDescription description="Seleccione 'Privada' caso a instituição seja do Privado ou 'Pública' caso seja do Estado" />
			<View className="flex flex-row space-x-4">
				<View className="flex-1">
					<RadioButton
						value="YES"
						label="Privada"
						checked={isPrivate === 'YES'}
						onChange={() => {
							setIsPrivate('YES')
							clearFieldError('ownership')
						}}
					/>
				</View>
				<View className="flex-1">
					<RadioButton
						value="NO"
						label="Pública"
						checked={isPrivate === 'NO'}
						onChange={() => {
							setIsPrivate('NO')
							clearFieldError('ownership')
						}}
					/>
				</View>
			</View>

			{customErrors?.ownership && <Text className="text-xs text-red-500">{customErrors.ownership}</Text>}

			<View className="space-y-4">
				<View className="">
					<Label label="Tipo de entidade" />
					<Controller
						name="surname"
						control={control}
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<>
								<CustomPicker
									value={value || ''}
									placeholder={{ label: 'Tipo de entidade', value: null }}
									setValue={(val) => {
										onChange(val)
										clearFieldError('institutionType')
									}}
									items={institutionsOptions}
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : customErrors?.institutionType ? (
									<Text className="text-xs text-red-500">{customErrors.institutionType}</Text>
								) : (
									<Text className="text-xs text-gray-500">Tipo de entidade</Text>
								)}
							</>
						)}
					/>
				</View>
				<View className="">
					<Label label="Nome da entidade" />
					<Controller
						control={control}
						name="otherNames"
						rules={{ required: true }}
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<>
								<CustomTextInput
									label=""
									value={value}
									onChangeText={(text) => {
										onChange(text)
										clearFieldError('otherNames')
									}}
									onBlur={onBlur}
									autoCapitalize="words"
									placeholder="Nome da entidade"
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : customErrors?.otherNames ? (
									<Text className="text-xs text-red-500">{customErrors.otherNames}</Text>
								) : (
									<Text className="text-xs text-gray-500">Nome da entidade</Text>
								)}
							</>
						)}
					/>
				</View>
			</View>
		</View>
	)
}

const AddressScreen = ({ control, errors, customErrors, clearFieldError, districtId }: AddressScreenProps) => {
	return (
		<SelectAddress
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
			districtId={districtId}
			addressLevel={AddressLevel.FROM_ADMIN_POSTS}
			description="Indica o endereço do produtor"
		/>
	)
}

const ContactInfoScreen = ({ control, errors, customErrors, clearFieldError }: ContactInfoScreenProps) => {
	return (
		<View className="w-full space-y-4">
			<FormItemDescription description="Indica os contactos da instituição" />
			<View className="">
				<Label label="Telemóvel Principal" />
				<Controller
					control={control}
					name="primaryPhone"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<CustomTextInput
								label=""
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
								<Text className="text-xs text-gray-500">Telemóvel Principal</Text>
							)}
						</>
					)}
				/>
			</View>
			<View className="">
				<Controller
					control={control}
					name="secondaryPhone"
					rules={{ required: false }}
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
								<Text className="text-xs text-gray-500">Telemóvel Alternativo (opcional)</Text>
							)}
						</>
					)}
				/>
			</View>
		</View>
	)
}

const DocumentationScreen = ({ control, errors, customErrors, clearFieldError }: DocumentationScreenProps) => {
	return (
		<View className="w-full space-y-4">
			<FormItemDescription description="Indica a documentação da instituição" />
			<View className="">
				<Label label="NUIT" />
				<Controller
					control={control}
					name="nuit"
					rules={{ required: true }}
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
								<Text className="text-xs text-gray-500">Indica o NUIT</Text>
							)}
						</>
					)}
				/>
			</View>
		</View>
	)
}

export default function AddCompanyFarmer() {
	const { userDetails } = useUserDetails()
	const router = useRouter()
	const { resetFormData, setFormData, validateFormData, formData } = useFarmerStore()
	const { validateByAddressLevel } = useAddressStore()
	const { width } = useWindowDimensions()
	const barWidth = width - 5 * 8

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		getValues,
		watch,
		setValue,
	} = useForm<CompanyFarmerFormData>({
		defaultValues: {
			surname: formData?.surname || '',
			otherNames: formData?.otherNames || '',
			nuit: formData?.nuit || '',
			primaryPhone: formData?.primaryPhone || '',
			secondaryPhone: formData?.secondaryPhone || '',
		},
		resolver: zodResolver(CompanyFarmerSchema),
	})

	const [customErrors, setCustomErrors] = useState<CustomErrorType>({})
	const [isPrivate, setIsPrivate] = useState<'YES' | 'NO' | undefined>(undefined)
	const [institutionsOptions, setInstitutionsOptions] = useState<{ label: string; value: string }[]>([])
	const [currentScreen, setCurrentScreen] = useState(0)
	const [showDuplicateModal, setShowDuplicateModal] = useState(false)

	const primaryPhoneValue = watch('primaryPhone')
	const secondaryPhoneValue = watch('secondaryPhone')
	const nuitValue = watch('nuit')

	// Check for duplicate farmers (phone numbers and NUIT only)
	// Company farmers never have birth date/place, so we don't check those
	const {
		hasDuplicate,
		duplicateType,
		message: duplicateMessage,
		isLoading: isCheckingDuplicate,
		duplicateFarmers,
	} = useCheckFarmerDuplicate({
		nuit: nuitValue,
		primaryPhone: primaryPhoneValue,
		secondaryPhone: secondaryPhoneValue,
		// Company farmers don't have birth date/place, documents, or personal names for duplicate checking
	})

	useEffect(() => {
		if (isPrivate === 'YES') {
			setInstitutionsOptions(privateInstitutions)
			setValue('surname', '')
		} else if (isPrivate === 'NO') {
			setInstitutionsOptions(publicInstitutions)
			setValue('surname', '')
		}
	}, [isPrivate])

	useEffect(() => {
		resetFormData()
	}, [])

	const validateCurrentScreen = () => {
		const values = getValues()
		const currentErrors: CustomErrorType = {}

		switch (currentScreen) {
			case 0: // Institution Info
				if (!isPrivate) {
					currentErrors.ownership = 'Indica o tipo de instituição'
				}
				if (!values.surname) {
					currentErrors.institutionType = 'Indica o tipo de entidade'
				}
				if (!values.otherNames) {
					currentErrors.otherNames = 'Indica o nome da entidade'
				}
				break

			case 1: // Address
				const addressResult = validateByAddressLevel(AddressLevel.FROM_ADMIN_POSTS)
				if (!addressResult.success) {
					currentErrors.address = addressResult.message
				}
				break

			case 2: // Contact Info
				if (!values.primaryPhone || !/^(84|86|87|85|82|83)\d{7}$/.test(values.primaryPhone)) {
					currentErrors.primaryPhone = 'Indica um número de telefone válido'
				}
				if (values.secondaryPhone && !/^(84|86|87|85|82|83)\d{7}$/.test(values.secondaryPhone)) {
					currentErrors.secondaryPhone = 'Indica um número de telefone válido'
				}
				// Check for phone number duplicates
				if (!isCheckingDuplicate && hasDuplicate && duplicateMessage && duplicateType === 'phone') {
					const primaryPhoneTrimmed = values.primaryPhone?.trim()
					const secondaryPhoneTrimmed = values.secondaryPhone?.trim()

					const primaryMatch = duplicateFarmers?.some(
						(f) =>
							primaryPhoneTrimmed &&
							primaryPhoneTrimmed !== '' &&
							primaryPhoneTrimmed !== 'N/A' &&
							((f.primary_phone === primaryPhoneTrimmed && f.primary_phone !== 'N/A') ||
								(f.secondary_phone === primaryPhoneTrimmed && f.secondary_phone !== 'N/A')),
					)
					const secondaryMatch = duplicateFarmers?.some(
						(f) =>
							secondaryPhoneTrimmed &&
							secondaryPhoneTrimmed !== '' &&
							secondaryPhoneTrimmed !== 'N/A' &&
							((f.primary_phone === secondaryPhoneTrimmed && f.primary_phone !== 'N/A') ||
								(f.secondary_phone === secondaryPhoneTrimmed && f.secondary_phone !== 'N/A')),
					)

					if (primaryMatch && primaryPhoneTrimmed) {
						currentErrors.primaryPhone = duplicateMessage
					}
					if (secondaryMatch && secondaryPhoneTrimmed) {
						currentErrors.secondaryPhone = duplicateMessage
					}

					// If no specific match found but duplicate is phone type, show on primary phone by default
					if (!primaryMatch && !secondaryMatch && duplicateFarmers && duplicateFarmers.length > 0) {
						currentErrors.primaryPhone = duplicateMessage
					}
				}
				break

			case 3: // Documentation
				if (!values.nuit) {
					currentErrors.nuit = 'Indica o NUIT'
				} else if (!/^\d{9}$/.test(values.nuit)) {
					currentErrors.nuit = 'O NUIT deve ter 9 dígitos'
				}
				// Check for duplicate farmer (only if not checking duplicate - to avoid race conditions)
				if (!isCheckingDuplicate && hasDuplicate && duplicateMessage) {
					// Set error on the relevant field based on duplicate type
					if (duplicateType === 'nuit') {
						currentErrors.nuit = duplicateMessage
					} else if (duplicateType === 'phone') {
						// Check which phone number matches - use form values for accuracy
						const primaryPhoneTrimmed = primaryPhoneValue?.trim()
						const secondaryPhoneTrimmed = secondaryPhoneValue?.trim()

						const primaryMatch = duplicateFarmers?.some(
							(f) =>
								primaryPhoneTrimmed &&
								primaryPhoneTrimmed !== '' &&
								primaryPhoneTrimmed !== 'N/A' &&
								((f.primary_phone === primaryPhoneTrimmed && f.primary_phone !== 'N/A') ||
									(f.secondary_phone === primaryPhoneTrimmed && f.secondary_phone !== 'N/A')),
						)
						const secondaryMatch = duplicateFarmers?.some(
							(f) =>
								secondaryPhoneTrimmed &&
								secondaryPhoneTrimmed !== '' &&
								secondaryPhoneTrimmed !== 'N/A' &&
								((f.primary_phone === secondaryPhoneTrimmed && f.primary_phone !== 'N/A') ||
									(f.secondary_phone === secondaryPhoneTrimmed && f.secondary_phone !== 'N/A')),
						)

						if (primaryMatch && primaryPhoneTrimmed) {
							currentErrors.primaryPhone = duplicateMessage
						}
						if (secondaryMatch && secondaryPhoneTrimmed) {
							currentErrors.secondaryPhone = duplicateMessage
						}

						// If no specific match found but duplicate is phone type, show on primary phone by default
						if (!primaryMatch && !secondaryMatch && duplicateFarmers && duplicateFarmers.length > 0) {
							currentErrors.primaryPhone = duplicateMessage
						}
					}
				}
				break
		}

		setCustomErrors(currentErrors)
		return Object.keys(currentErrors).length === 0
	}

	const onSubmit = (data: CompanyFarmerFormData) => {
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
			if (hasDuplicate && duplicateMessage && duplicateFarmers && duplicateFarmers.length > 0) {
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

					const primaryMatch = duplicateFarmers?.some(
						(f) =>
							primaryPhoneTrimmed &&
							primaryPhoneTrimmed !== '' &&
							primaryPhoneTrimmed !== 'N/A' &&
							((f.primary_phone === primaryPhoneTrimmed && f.primary_phone !== 'N/A') ||
								(f.secondary_phone === primaryPhoneTrimmed && f.secondary_phone !== 'N/A')),
					)
					const secondaryMatch = duplicateFarmers?.some(
						(f) =>
							secondaryPhoneTrimmed &&
							secondaryPhoneTrimmed !== '' &&
							secondaryPhoneTrimmed !== 'N/A' &&
							((f.primary_phone === secondaryPhoneTrimmed && f.primary_phone !== 'N/A') ||
								(f.secondary_phone === secondaryPhoneTrimmed && f.secondary_phone !== 'N/A')),
					)

					if (primaryMatch && primaryPhoneTrimmed) {
						duplicateErrors.primaryPhone = duplicateMessage
					}
					if (secondaryMatch && secondaryPhoneTrimmed) {
						duplicateErrors.secondaryPhone = duplicateMessage
					}

					// If no specific match found but duplicate is phone type, show on primary phone by default
					if (!primaryMatch && !secondaryMatch && duplicateFarmers && duplicateFarmers.length > 0) {
						duplicateErrors.primaryPhone = duplicateMessage
					}
				}
				setCustomErrors(duplicateErrors)
				return
			}

			setFormData({
				...data,
				isSmallScale: 'NO',
				birthDate: new Date(),
				surname: isPrivate === 'YES' ? `${data.surname} - PRIVATE COMPANY` : `${data.surname} - PUBLIC COMPANY`,
				isServiceProvider: 'NO',
			})
			// All validations passed, navigate to preview
			router.navigate('/(aux)/data-previews/save-farmer' as Href)
		}
	}

	const handleNext = () => {
		if (currentScreen < screens.length - 1) {
			const isValid = validateCurrentScreen()
			if (isValid) {
				setCurrentScreen(currentScreen + 1)
			}
		}
	}

	const handlePrevious = () => {
		if (currentScreen > 0) {
			setCurrentScreen(currentScreen - 1)
		}
	}

	const clearFieldError = (fieldName: string) => {
		setCustomErrors((prev) => {
			const newErrors = { ...prev }
			delete newErrors[fieldName]
			return newErrors
		})
	}

	const screens = [
		<CompanyInfoScreen
			key="company-info"
			control={control}
			errors={errors}
			customErrors={customErrors}
			institutionsOptions={institutionsOptions}
			isPrivate={isPrivate}
			setIsPrivate={setIsPrivate}
			clearFieldError={clearFieldError}
		/>,
		<AddressScreen
			key="address"
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
			districtId={userDetails?.district_id || ''}
		/>,
		<ContactInfoScreen
			key="contact"
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
		/>,
		<DocumentationScreen
			key="documentation"
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
		/>,
	]

	return (
		<View className="flex-1 relative">
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
					paddingBottom: 80,
					paddingTop: 20,
				}}
			>
				{screens[currentScreen]}
			</KeyboardAwareScrollView>

			<View className="absolute bottom-0 left-0 right-0">
				<NextAndPreviousButtons
					handlePreviousStep={handlePrevious}
					handleNextStep={currentScreen === screens.length - 1 ? handleSubmit(onSubmit) : handleNext}
					previousButtonDisabled={currentScreen === 0}
					nextButtonDisabled={currentScreen === screens.length}
					nextButtonText={currentScreen === screens.length - 1 ? 'Submeter' : 'Avançar'}
					previousButtonText={currentScreen === 0 ? 'Voltar' : 'Anterior'}
					showPreviousButton={currentScreen > 0}
				/>
			</View>

			{/* Duplicate Farmers Modal - Shows automatically when duplicates are found on submit */}
			<Modal visible={showDuplicateModal} presentationStyle="pageSheet" animationType="slide">
				<View className="flex-1 w-full bg-white dark:bg-black">
					{/* Header */}
					<View className="flex flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
						<View className="flex-1 mr-4">
							<Text className="text-[18px] font-bold text-black dark:text-white">
								Produtores Duplicados Encontrados
							</Text>
							<Text className="text-[12px] text-red-600 dark:text-red-400 mt-1">
								Não é possível prosseguir enquanto existirem duplicados
							</Text>
						</View>
						<TouchableOpacity onPress={() => setShowDuplicateModal(false)} className="p-2" activeOpacity={0.7}>
							<Fontisto name="close" size={24} color={colors.gray600} />
						</TouchableOpacity>
					</View>

					{/* Duplicate Farmers List */}
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							paddingBottom: 20,
							paddingTop: 10,
						}}
						className="p-4"
					>
						{duplicateFarmers?.map((farmer, index) => (
							<View key={farmer.id} className="mb-6">
								<View className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
									<Text className="text-[16px] font-bold text-black dark:text-white mb-3">
										Produtor Duplicado #{index + 1}
									</Text>

									<View className="space-y-2">
										<FormFieldPreview
											title="Nome Completo:"
											value={`${capitalize(farmer.other_names)} ${capitalize(farmer.surname)}`}
										/>

										{farmer.document_type &&
											farmer.document_type !== 'N/A' &&
											farmer.document_number &&
											farmer.document_number !== 'N/A' && (
												<>
													<FormFieldPreview title="Tipo de Documento:" value={farmer.document_type} />
													<FormFieldPreview title="Número de Documento:" value={farmer.document_number} />
												</>
											)}

										{(farmer.primary_phone || farmer.secondary_phone) &&
											(farmer.primary_phone !== 'N/A' || farmer.secondary_phone !== 'N/A') && (
												<>
													{farmer.primary_phone && farmer.primary_phone !== 'N/A' && (
														<FormFieldPreview title="Telefone Principal:" value={farmer.primary_phone} />
													)}
													{farmer.secondary_phone && farmer.secondary_phone !== 'N/A' && (
														<FormFieldPreview title="Telefone Alternativo:" value={farmer.secondary_phone} />
													)}
												</>
											)}
									</View>
								</View>
								{index < duplicateFarmers.length - 1 && <Divider className="my-4" />}
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
