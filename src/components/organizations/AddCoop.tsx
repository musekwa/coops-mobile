import { Text, View, Modal, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { z } from 'zod'
import { Controller, useForm, FieldErrors, Control, UseFormResetField, UseFormWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddressLevel, CoopAffiliationStatus, CoopPurpose, OrganizationTypes } from 'src/types'
import { getFullYears } from 'src/helpers/dates'
import { showToast } from 'src/helpers/toast'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { CustomPicker } from 'src/components/custom-select-item/CustomPicker'
import { errorMessages } from 'src/constants/errorMessages'
import { useCoopStore } from 'src/store/organizations'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import NextAndPreviousButtons from 'src/components/buttons/NextAndPreviousButtons'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import Label from 'src/components/forms/Label'
import FormStepIndicator from 'src/components/tracking/FormStepIndicator'
import { useWindowDimensions } from 'react-native'
import CheckButton from 'src/components/buttons/CheckButton'
import RadioButton from 'src/components/buttons/RadioButton'
import SelectAddress from 'src/custom-ui/select-address'
import { useUserDetails } from 'src/hooks/queries'
import { useAddressStore } from 'src/store/address'
import { useCheckOrganizationDuplicate } from 'src/hooks/useCheckOrganizationDuplicate'
import { Fontisto } from '@expo/vector-icons'
import FormFieldPreview from 'src/components/data-preview/FormFieldPreview'
import { Divider } from 'react-native-paper'
import { capitalize } from 'src/helpers/capitalize'
import { colors } from 'src/constants'

const CoopSchema = z
	.object({
		name: z.string().trim().min(2, 'Indica o nome da cooperavita.'),
		affiliationStatus: z.enum(
			[
				CoopAffiliationStatus.AFFILIATED,
				CoopAffiliationStatus.AFFILIATION_ON_PROCESS,
				CoopAffiliationStatus.NOT_AFFILIATED,
			],
			{
				message: 'Indica o estado de legalidade da cooperativa',
			},
		),
		creationYear: z.string().min(2, {
			message: 'Indica o ano de criação da cooperativa',
		}),
		affiliationYear: z.string().optional(),
		license: z.string().optional(),
		nuel: z
			.union([
				z.literal(''),
				z.string().regex(/^\d{9}$/, {
					message: 'NUEL deve ter 9 dígitos',
				}),
			])
			.optional(),
		nuit: z.union([
			z.literal(''),
			z
				.string()
				.regex(/^\d{9}$/, {
					message: 'NUIT deve ter 9 dígitos',
				})
				.optional(),
		]),
	})
	.superRefine((data, ctx) => {
		if (data.affiliationStatus === CoopAffiliationStatus.AFFILIATED) {
			if (!data.nuel) {
				ctx.addIssue({
					path: ['nuel'],
					message: 'Indica o NUEL da cooperativa',
					code: z.ZodIssueCode.custom,
				})
			}
			if (!data.nuit) {
				ctx.addIssue({
					path: ['nuit'],
					message: 'Indica o NUIT da cooperativa',
					code: z.ZodIssueCode.custom,
				})
			}
			if (!data.license) {
				ctx.addIssue({
					path: ['license'],
					message: 'Indica o número de licença da cooperativa',
					code: z.ZodIssueCode.custom,
				})
			}
			if (!data.affiliationYear) {
				ctx.addIssue({
					path: ['affiliationYear'],
					message: 'Indica o ano de legalização da cooperativa',
					code: z.ZodIssueCode.custom,
				})
			}
		}
	})

type CoopFormData = z.infer<typeof CoopSchema>

type AddCoopFormProps = {
	setPreviewData: (data: any) => void
	setErrorMessage: (message: string) => void
	setHasError: (error: boolean) => void
}

type CustomErrorType = {
	[key: string]: string
}

type BasicInfoScreenProps = {
	control: Control<CoopFormData>
	errors: FieldErrors<CoopFormData>
	customErrors: CustomErrorType
	clearFieldError: (fieldName: string) => void
}

type LegalStatusScreenProps = {
	control: Control<CoopFormData>
	errors: FieldErrors<CoopFormData>
	customErrors: CustomErrorType
	clearFieldError: (fieldName: string) => void
	selectedAffiliationState: string
	setSelectedAffiliationState: (state: string) => void
	resetField: UseFormResetField<CoopFormData>
	watch: UseFormWatch<CoopFormData>
}

type AddressScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrorType
	clearFieldError: (fieldName: string) => void
	districtId: string
}

// Screen Components
const BasicInfoScreen = ({ control, errors, customErrors, clearFieldError }: BasicInfoScreenProps) => {
	return (
		<View className="w-full space-y-4">
			<FormItemDescription description="Informações básicas da cooperativa" />

			<View className="">
				<Label label="Nome da Cooperativa" />
				<Controller
					control={control}
					name="name"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<CustomTextInput
								label=""
								value={value}
								onChangeText={(text) => {
									onChange(text)
									clearFieldError('name')
								}}
								onBlur={onBlur}
								autoCapitalize="words"
								placeholder="Nome da cooperativa"
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.name ? (
								<Text className="text-xs text-red-500">{customErrors.name}</Text>
							) : (
								<Text className="text-xs text-gray-500">Nome da cooperativa</Text>
							)}
						</>
					)}
				/>
			</View>

			<View className="flex-1">
				<Label label="Ano de Criação" />
				<Controller
					control={control}
					name="creationYear"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<CustomPicker
								value={value || ''}
								setValue={(val) => {
									onChange(val)
									clearFieldError('creationYear')
								}}
								items={getFullYears()}
								placeholder={{ label: 'Ano de Criação', value: null }}
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.creationYear ? (
								<Text className="text-xs text-red-500">{customErrors.creationYear}</Text>
							) : (
								<Text className="text-xs text-gray-500">Ano de Criação</Text>
							)}
						</>
					)}
				/>
			</View>
		</View>
	)
}

const LegalStatusScreen = ({
	control,
	errors,
	customErrors,
	clearFieldError,
	selectedAffiliationState,
	setSelectedAffiliationState,
	resetField,
	watch,
}: LegalStatusScreenProps) => {
	const affiliationStatus = watch('affiliationStatus')

	return (
		<View className="w-full space-y-4">
			<FormItemDescription description="Informações sobre a legalidade da cooperativa" />

			<View className="">
				<Label label="Legalidade da cooperativa" />
				<Controller
					name="affiliationStatus"
					rules={{ required: true }}
					control={control}
					render={({ field: { onChange, value }, fieldState: { error } }) => {
						return (
							<View className="">
								<View>
									<RadioButton
										label="Legalizada"
										value={CoopAffiliationStatus.AFFILIATED}
										checked={value === CoopAffiliationStatus.AFFILIATED}
										onChange={(value) => {
											setSelectedAffiliationState(value)
											onChange(value)
											resetField('affiliationYear')
											resetField('license')
											resetField('nuel')
											resetField('nuit')
											clearFieldError('affiliationStatus')
										}}
									/>
								</View>

								<View>
									<RadioButton
										label="Em Processo de Legalização"
										value={CoopAffiliationStatus.AFFILIATION_ON_PROCESS}
										checked={value === CoopAffiliationStatus.AFFILIATION_ON_PROCESS}
										onChange={(value) => {
											setSelectedAffiliationState(value)
											onChange(value)
											resetField('affiliationYear')
											resetField('license')
											resetField('nuel')
											resetField('nuit')
											clearFieldError('affiliationStatus')
										}}
									/>
								</View>

								<View>
									<RadioButton
										label="Não Legalizada"
										value={CoopAffiliationStatus.NOT_AFFILIATED}
										checked={value === CoopAffiliationStatus.NOT_AFFILIATED}
										onChange={(value) => {
											setSelectedAffiliationState(value)
											onChange(value)
											resetField('affiliationYear')
											resetField('license')
											resetField('nuel')
											resetField('nuit')
											clearFieldError('affiliationStatus')
										}}
									/>
								</View>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : customErrors?.affiliationStatus ? (
									<Text className="text-xs text-red-500">{customErrors.affiliationStatus}</Text>
								) : (
									<Text className="text-xs text-gray-500">Legalidade da cooperativa</Text>
								)}
							</View>
						)
					}}
				/>
			</View>

			{affiliationStatus === CoopAffiliationStatus.AFFILIATED && (
				<View className="w-full space-y-4">
					<FormItemDescription description="Informações sobre a legalização da cooperativa" />

					<View className="flex-1">
						<Label label="Ano de Legalização" />
						<Controller
							name="affiliationYear"
							control={control}
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => {
								return (
									<>
										<CustomPicker
											placeholder={{ label: 'Ano de Legalização', value: null }}
											value={value || ''}
											setValue={(newValue) => {
												onChange(newValue)
												clearFieldError('affiliationYear')
											}}
											items={getFullYears()}
										/>
										{error ? (
											<Text className="text-xs text-red-500">{error.message}</Text>
										) : customErrors?.affiliationYear ? (
											<Text className="text-xs text-red-500">{customErrors.affiliationYear}</Text>
										) : (
											<Text className="text-xs text-gray-500">Ano de Legalização</Text>
										)}
									</>
								)
							}}
						/>
					</View>

					<View className="">
						<Controller
							control={control}
							name="license"
							rules={{ required: true }}
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<>
									<CustomTextInput
										label="Número de licença (alvará)"
										value={value}
										onChangeText={(text) => {
											onChange(text)
											clearFieldError('license')
										}}
										onBlur={onBlur}
										autoCapitalize="characters"
										placeholder="No. de Licença/Alvará"
									/>
									{error ? (
										<Text className="text-xs text-red-500">{error.message}</Text>
									) : customErrors?.license ? (
										<Text className="text-xs text-red-500">{customErrors.license}</Text>
									) : (
										<Text className="text-xs text-gray-500">Número de licença | alvará</Text>
									)}
								</>
							)}
						/>
					</View>

					<View className="">
						<Controller
							control={control}
							name="nuel"
							rules={{ required: true }}
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<>
									<CustomTextInput
										label="Número Único de Entidade Legal"
										value={value}
										keyboardType="numeric"
										onChangeText={(text) => {
											onChange(text)
											clearFieldError('nuel')
										}}
										onBlur={onBlur}
										placeholder="NUEL"
									/>
									{error ? (
										<Text className="text-xs text-red-500">{error.message}</Text>
									) : customErrors?.nuel ? (
										<Text className="text-xs text-red-500">{customErrors.nuel}</Text>
									) : (
										<Text className="text-xs text-gray-500">Número Único de Entidade Legal</Text>
									)}
								</>
							)}
						/>
					</View>

					<View className="">
						<Controller
							control={control}
							name="nuit"
							rules={{ required: true }}
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
										placeholder="NUIT"
									/>
									{error ? (
										<Text className="text-xs text-red-500">{error.message}</Text>
									) : customErrors?.nuit ? (
										<Text className="text-xs text-red-500">{customErrors.nuit}</Text>
									) : (
										<Text className="text-xs text-gray-500">Número Único de Identificação Tributária</Text>
									)}
								</>
							)}
						/>
					</View>
				</View>
			)}
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
			description="Indica o endereço da cooperativa"
		/>
	)
}

export default function AddCoopForm({ setPreviewData, setErrorMessage, setHasError }: AddCoopFormProps) {
	const { userDetails } = useUserDetails()

	const { resetFormData, setFormData, validateFormData, formData } = useCoopStore()
	const { validateByAddressLevel } = useAddressStore()
	const { width } = useWindowDimensions()
	const barWidth = width - 5 * 8

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		resetField,
		setValue,
		getValues,
	} = useForm<CoopFormData>({
		defaultValues: {
			name: formData?.name || '',
			creationYear: formData?.creationYear || '',
			affiliationYear: formData?.affiliationYear || '',
			license: formData?.license || '',
			nuel: formData?.nuel || '',
			nuit: formData?.nuit || '',
		},
		resolver: zodResolver(CoopSchema),
	})

	const [customErrors, setCustomErrors] = useState<CustomErrorType>({})
	const [selectedAffiliationState, setSelectedAffiliationState] = useState('')
	const [currentScreen, setCurrentScreen] = useState(0)
	const [showDuplicateModal, setShowDuplicateModal] = useState(false)

	// Watch form values for duplicate checking
	const nameValue = watch('name')
	const nuitValue = watch('nuit')
	const nuelValue = watch('nuel')

	// Check for duplicates
	const {
		hasDuplicate,
		duplicateType,
		message: duplicateMessage,
		isLoading: isCheckingDuplicate,
		duplicateOrganizations,
	} = useCheckOrganizationDuplicate({
		name: nameValue || '',
		nuit: nuitValue || '',
		nuel: nuelValue || '',
		organizationType: OrganizationTypes.COOPERATIVE,
	})

	const clearFieldError = (fieldName: string) => {
		setCustomErrors((prev: CustomErrorType) => {
			const newErrors = { ...prev }
			delete newErrors[fieldName]
			return newErrors
		})
	}

	// Reset duplicate state when inputs change - clear errors immediately when inputs change
	useEffect(() => {
		// Clear name error immediately when name changes - will be re-set if duplicate still exists
		setCustomErrors((prev) => {
			const newErrors = { ...prev }
			delete newErrors.name
			return newErrors
		})
	}, [nameValue])

	useEffect(() => {
		// Clear NUIT error immediately when NUIT changes
		setCustomErrors((prev) => {
			const newErrors = { ...prev }
			delete newErrors.nuit
			return newErrors
		})
	}, [nuitValue])

	useEffect(() => {
		// Clear NUEL error immediately when NUEL changes
		setCustomErrors((prev) => {
			const newErrors = { ...prev }
			delete newErrors.nuel
			return newErrors
		})
	}, [nuelValue])

	// Separate effect to handle duplicate state changes
	useEffect(() => {
		// Close modal if duplicates are resolved
		if (!hasDuplicate && showDuplicateModal) {
			setShowDuplicateModal(false)
		}

		// Clear all duplicate errors when no duplicate exists and check is complete
		if (!hasDuplicate && !isCheckingDuplicate) {
			setCustomErrors((prev) => {
				const newErrors = { ...prev }
				delete newErrors.name
				delete newErrors.nuit
				delete newErrors.nuel
				return newErrors
			})
		}
	}, [hasDuplicate, isCheckingDuplicate, showDuplicateModal, duplicateType])

	const validateCurrentScreen = () => {
		const values = getValues()
		const currentErrors: CustomErrorType = {}

		switch (currentScreen) {
			case 0: // Basic Info
				if (!values.name || values.name.length < 2) {
					currentErrors.name = 'Indica o nome da cooperativa'
				} else if (hasDuplicate && duplicateType === 'name') {
					currentErrors.name = duplicateMessage
				}
				break

			case 1: // Legal Status
				if (!values.affiliationStatus) {
					currentErrors.affiliationStatus = 'Indica o estado legal da cooperativa'
				}
				if (values.affiliationStatus === CoopAffiliationStatus.AFFILIATED) {
					if (!values.affiliationYear) {
						currentErrors.affiliationYear = 'Indica o ano de legalização'
					}
					if (!values.license) {
						currentErrors.license = 'Indica o número de licença'
					}
					if (!values.nuel) {
						currentErrors.nuel = 'Indica o NUEL'
					} else if (!/^\d{9}$/.test(values.nuel.trim())) {
						currentErrors.nuel = 'NUEL deve ter 9 dígitos'
					} else if (hasDuplicate && duplicateType === 'nuel') {
						currentErrors.nuel = duplicateMessage
					}
					if (!values.nuit) {
						currentErrors.nuit = 'Indica o NUIT'
					} else if (!/^\d{9}$/.test(values.nuit.trim())) {
						currentErrors.nuit = 'NUIT deve ter 9 dígitos'
					} else if (hasDuplicate && duplicateType === 'nuit') {
						currentErrors.nuit = duplicateMessage
					}
				}
				break

			case 2: // Address
				const addressResult = validateByAddressLevel(AddressLevel.FROM_ADMIN_POSTS)
				if (!addressResult.success) {
					currentErrors.address = addressResult.message
				}
				break
		}

		setCustomErrors(currentErrors)
		return Object.keys(currentErrors).length === 0
	}

	const onSubmit = async (data: CoopFormData) => {
		// Wait for duplicate check to complete
		if (isCheckingDuplicate) {
			return
		}

		const isValid = validateCurrentScreen()

		// Check for duplicates before proceeding
		if (hasDuplicate) {
			setShowDuplicateModal(true)
			// Set errors on relevant fields
			if (duplicateType === 'name') {
				setCustomErrors((prev) => ({ ...prev, name: duplicateMessage }))
			} else if (duplicateType === 'nuit') {
				setCustomErrors((prev) => ({ ...prev, nuit: duplicateMessage }))
			} else if (duplicateType === 'nuel') {
				setCustomErrors((prev) => ({ ...prev, nuel: duplicateMessage }))
			}
			return
		}

		if (isValid) {
			setFormData({
				...data,
			})
			const result = CoopSchema.safeParse(data)
			if (result.success && Object.keys(validateFormData()).length > 0) {
				setCustomErrors(validateFormData())
				showToast('Preencha todos os campos corretamente', 'error')
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
			setErrorMessage(errorMessages.formFields)
		}
	}, [errors, customErrors])

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

	const screens = [
		{
			title: 'Informação Básica',
			component: (
				<BasicInfoScreen
					control={control}
					errors={errors}
					customErrors={customErrors}
					clearFieldError={clearFieldError}
				/>
			),
		},
		{
			title: 'Estado Legal',
			component: (
				<LegalStatusScreen
					control={control}
					errors={errors}
					customErrors={customErrors}
					clearFieldError={clearFieldError}
					selectedAffiliationState={selectedAffiliationState}
					setSelectedAffiliationState={setSelectedAffiliationState}
					resetField={resetField}
					watch={watch}
				/>
			),
		},
		{
			title: 'Endereço',
			component: (
				<AddressScreen
					control={control}
					errors={errors}
					customErrors={customErrors}
					clearFieldError={clearFieldError}
					districtId={userDetails?.district_id || ''}
				/>
			),
		},
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
					paddingBottom: 60,
					paddingTop: 20,
					alignItems: 'center',
				}}
				className="space-y-4 flex-1 p-3"
			>
				{screens[currentScreen].component}
			</KeyboardAwareScrollView>

			<View className="absolute bottom-12 left-6 right-6">
				<NextAndPreviousButtons
					// currentStep={currentScreen}
					handlePreviousStep={handlePrevious}
					handleNextStep={currentScreen === screens.length - 1 ? handleSubmit(onSubmit) : handleNext}
					previousButtonDisabled={currentScreen === 0}
					nextButtonDisabled={currentScreen === screens.length}
					nextButtonText={currentScreen === screens.length - 1 ? 'Avançar' : 'Avançar'}
					previousButtonText={currentScreen === 0 ? 'Voltar' : 'Anterior'}
					showPreviousButton={currentScreen > 0}
				/>
			</View>

			{/* Duplicate Modal */}
			<Modal visible={showDuplicateModal} animationType="slide" transparent={true}>
				<View className="flex-1 bg-black/50 justify-end">
					<View className="bg-white rounded-t-3xl max-h-[80%]">
						<View className="flex-row items-center justify-between p-4 border-b border-gray-200">
							<View className="flex-row items-center space-x-2">
								<Fontisto name="info" size={20} color={colors.red} />
								<Text className="text-lg font-bold text-gray-800">
									Não é possível prosseguir enquanto existirem duplicados
								</Text>
							</View>
							<TouchableOpacity onPress={() => setShowDuplicateModal(false)}>
								<Fontisto name="close" size={20} color={colors.gray600} />
							</TouchableOpacity>
						</View>
						<ScrollView className="flex-1 p-4">
							{duplicateOrganizations.length > 0 && (
								<View className="space-y-4">
									{duplicateOrganizations.map((org, index) => {
										const orgTypeLabel =
											org.organization_type === OrganizationTypes.ASSOCIATION
												? 'Associação'
												: org.organization_type === OrganizationTypes.COOPERATIVE
													? 'Cooperativa'
													: 'União de Cooperativas'
										return (
											<View key={org.id} className="bg-gray-50 p-4 rounded-lg space-y-2">
												<FormFieldPreview title="Tipo" value={orgTypeLabel} />
												<FormFieldPreview title="Nome" value={capitalize(org.group_name)} />
												{org.nuit && org.nuit.trim() !== '0' && org.nuit.trim() !== '' && org.nuit.trim() !== 'N/A' && (
													<FormFieldPreview title="NUIT" value={org.nuit} />
												)}
												{org.nuel && org.nuel.trim() !== '0' && org.nuel.trim() !== '' && org.nuel.trim() !== 'N/A' && (
													<FormFieldPreview title="NUEL" value={org.nuel} />
												)}
												{index < duplicateOrganizations.length - 1 && <Divider className="my-2" />}
											</View>
										)
									})}
								</View>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	)
}
