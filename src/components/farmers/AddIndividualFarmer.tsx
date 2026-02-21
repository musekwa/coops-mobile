import { Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import CustomTextInput from '../custom-text-input/CustomTextInput'
import { useFarmerStore } from 'src/store/farmer'
// import { DatePickerModal } from 'react-native-paper-dates'
import DatePicker from 'react-native-date-picker'
import { colors, dateLimits } from 'src/constants'

import idDocTypes from 'src/constants/idDocTypes'

import { Fontisto } from '@expo/vector-icons'
import FormFieldPreview from '../data-preview/FormFieldPreview'
import { Divider } from 'react-native-paper'
import { capitalize } from 'src/helpers/capitalize'

import NextAndPreviousButtons from '../buttons/NextAndPreviousButtons'
import Label from '../forms/Label'
import FormStepIndicator from '../tracking/FormStepIndicator'
import { useWindowDimensions } from 'react-native'
import CustomSelectItem from '../ui/custom-select-item'
import CustomSelectItemTrigger from '../ui/custom-select-item-trigger'
import { useUserDetails } from 'src/hooks/queries'
import { useCheckFarmerDuplicate } from 'src/hooks/useCheckFarmerDuplicate'

import { AddressLevel } from 'src/types'

import SelectAddress from 'src/custom-ui/select-address'
import { useAddressStore } from 'src/store/address'
import RadioButton from '../buttons/RadioButton'
import { Href, useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import FormItemDescription from '../forms/FormItemDescription'

type CustomErrors = {
	[key: string]: string
}

const FarmerSchema = z.object({
	isServiceProvider: z.enum(['YES', 'NO'], {
		message: 'Indica se é um provedor de serviços de pulverização',
	}),
	isSmallScale: z.enum(['YES', 'NO'], {
		message: 'Indica a categoria do produtor',
	}),
	surname: z.string().trim().min(2, 'Indica um apelido.').regex(/^\S*$/, 'Indica apenas um apelido.'),
	otherNames: z.string().trim().min(2, 'Indica outros nomes.'),
	familySize: z.preprocess(
		(val) => (typeof val === 'string' ? parseInt(val, 10) : val),
		z
			.number({
				message: 'Agregado familiar',
			})
			.int()
			.min(1, 'Pelos menos 1')
			.max(20, 'Até 20'),
	),
	gender: z.enum(['Masculino', 'Feminino'], {
		message: 'Indica o género',
	}),
	birthDate: z.preprocess(
		(val) => (val instanceof Date ? val : new Date(val as string)),
		z
			.date({
				description: 'Data de Nascimento',
			})
			.min(dateLimits.minimumDate, `Só os nascidos depois de ${new Date(dateLimits.minimumDate).getFullYear()}`)
			.max(dateLimits.maximumDate, `Só os nascidos antes de ${new Date(dateLimits.maximumDate).getFullYear()}`)
			.refine((date) => !isNaN(date.getTime()), {
				message: 'Formato de data inválido.',
			}),
	),
	primaryPhone: z
		.union([
			z.literal(''),
			z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, {
				message: 'Indica número válido',
			}),
		])
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
	secondaryPhone: z
		.union([z.literal(''), z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, 'Indica número válido')])
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
	docType: z
		.string({
			description: 'Tipo de Doc.',
			message: 'Selecciona uma opção.',
		})
		.min(2, {
			message: 'Selecciona uma opção.',
		}),

	docNumber: z.string(),
	nuit: z.union([z.literal(''), z.string().regex(/^\d{9}$/, 'Indica um NUIT válido')]),
})

type FarmerFormData = z.infer<typeof FarmerSchema>

// Screen component types
type ServiceProviderScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrors
	clearFieldError: (fieldName: string) => void
}

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
	onConfirmSingle: (params: { date: Date | undefined }) => void
}

type AddressScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrors
	clearFieldError: (fieldName: string) => void
	districtId: string
}

type ContactInfoScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrors
	clearFieldError: (fieldName: string) => void
}

type BirthPlaceScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrors
	clearFieldError: (fieldName: string) => void
	birthAddressLevel: AddressLevel
	setBirthAddressLevel: (addressLevel: AddressLevel) => void
}

type DocumentationScreenProps = {
	control: any
	errors: any
	customErrors: CustomErrors
	clearFieldError: (fieldName: string) => void
	showDocuments: boolean
	setShowDocuments: (show: boolean) => void
	docTypeValue: string
	resetField: (name: keyof FarmerFormData) => void
}

// Screen Components
const ServiceProviderScreen = ({ control, errors, customErrors, clearFieldError }: ServiceProviderScreenProps) => {
	return (
		<View className="flex-1 space-y-4">
			{/* Service Provider */}
			<View className="flex flex-col w-full space-y-4 items-start">
				<View className="">
					<FormItemDescription description="Este produtor é Provedor de Serviços de Pulverização?" />
				</View>
				<Controller
					control={control}
					name="isServiceProvider"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View className="flex flex-col w-full space-y-4 items-start">
							<View className="flex flex-row justify-around">
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => {
										onChange('NO')
										clearFieldError('isServiceProvider')
									}}
									className="flex-1 flex-row space-x-2 my-1"
								>
									{value === 'NO' ? (
										<Fontisto name="radio-btn-active" color={colors.primary} size={24} />
									) : (
										<Fontisto name="radio-btn-passive" color={colors.gray600} size={24} />
									)}
									<Text className="text-gray-500 dark:text-white text-[14px]">Não</Text>
								</TouchableOpacity>
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => {
										onChange('YES')
										clearFieldError('isServiceProvider')
									}}
									className="flex-1 flex-row space-x-2 my-1"
								>
									{value === 'YES' ? (
										<Fontisto name="radio-btn-active" color={colors.primary} size={24} />
									) : (
										<Fontisto color={colors.gray600} name="radio-btn-passive" size={24} />
									)}
									<Text className="text-gray-500 dark:text-white text-[14px]">Sim</Text>
								</TouchableOpacity>
							</View>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.isServiceProvider ? (
								<Text className="text-xs text-red-500">{customErrors.isServiceProvider}</Text>
							) : null}
						</View>
					)}
				/>
			</View>

			{/* Farmer Category */}
			<View className="flex flex-col w-full space-y-4 items-start">
				<View className="">
					<FormItemDescription description="Este Produtor é Familiar ou Comercial?" />
				</View>
				<Controller
					control={control}
					name="isSmallScale"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View className="flex flex-col w-full space-y-4 items-start">
							<View className="flex flex-row justify-around">
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => {
										onChange('YES')
										clearFieldError('isSmallScale')
									}}
									className="flex-1 flex-row space-x-2 my-1 items-center"
								>
									{value === 'YES' ? (
										<Fontisto name="radio-btn-active" color={colors.primary} size={24} />
									) : (
										<Fontisto name="radio-btn-passive" color={colors.gray600} size={24} />
									)}
									<Text className="text-gray-500 dark:text-white text-[14px]">Familiar</Text>
								</TouchableOpacity>
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => {
										onChange('NO')
										clearFieldError('isSmallScale')
									}}
									className="flex-1 flex-row space-x-2 my-1 items-center"
								>
									{value === 'NO' ? (
										<Fontisto name="radio-btn-active" color={colors.primary} size={24} />
									) : (
										<Fontisto color={colors.gray600} name="radio-btn-passive" size={24} />
									)}
									<Text className="text-gray-500 dark:text-white text-[14px]">Comercial</Text>
								</TouchableOpacity>
							</View>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.isSmallScale ? (
								<Text className="text-xs text-red-500">{customErrors.isSmallScale}</Text>
							) : null}
						</View>
					)}
				/>
			</View>
		</View>
	)
}

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
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	return (
		<View className="flex-1 space-y-4">
			{/* Surname */}
			<View className="">
				<Controller
					control={control}
					name="surname"
					defaultValue=""
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View>
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
						</View>
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
						<View>
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
						</View>
					)}
				/>
			</View>

			{/* Gender */}
			<View className="">
				<Controller
					control={control}
					name="gender"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View className="flex flex-col space-y-3">
							<Text className="text-[14px] font-normal text-black dark:text-white">Gênero</Text>
							<View className="flex flex-row justify-around">
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => {
										onChange('Masculino')
										clearFieldError('gender')
									}}
									className="flex-1 flex-row space-x-2 my-1 items-center"
								>
									{value === 'Masculino' ? (
										<Fontisto name="radio-btn-active" color={colors.primary} size={24} />
									) : (
										<Fontisto color={colors.gray600} name="radio-btn-passive" size={24} />
									)}
									<Text className="text-gray-500 dark:text-white text-[14px]">Homem</Text>
								</TouchableOpacity>
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => {
										onChange('Feminino')
										clearFieldError('gender')
									}}
									className="flex-1 flex-row space-x-2 my-1 items-center"
								>
									{value === 'Feminino' ? (
										<Fontisto name="radio-btn-active" color={colors.primary} size={24} />
									) : (
										<Fontisto color={colors.gray600} name="radio-btn-passive" size={24} />
									)}
									<Text className="text-gray-500 dark:text-white text-[14px]">Mulher</Text>
								</TouchableOpacity>
							</View>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.gender ? (
								<Text className="text-xs text-red-500">{customErrors.gender}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Indica o género</Text>
							)}
						</View>
					)}
				/>
			</View>

			{/* Family Size */}
			<View className="">
				<Controller
					control={control}
					name="familySize"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View>
							<CustomTextInput
								label="Agregado Familiar"
								value={value}
								onChangeText={(text) => {
									onChange(text)
									clearFieldError('familySize')
								}}
								onBlur={onBlur}
								keyboardType="numeric"
								placeholder="Agregado Familiar"
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.familySize ? (
								<Text className="text-xs text-red-500">{customErrors.familySize}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Agregado Familiar</Text>
							)}
						</View>
					)}
				/>
			</View>

			{/* Birth Date */}
			<View className="flex-1 justify-center">
				<Controller
					control={control}
					name="birthDate"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View>
							<TouchableOpacity
								activeOpacity={0.5}
								onPress={() => {
									setOpenDate(true)
								}}
							>
								<CustomTextInput
									editable={false}
									label="Data de Nascimento"
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
							<DatePicker
								modal
								theme={isDarkMode ? 'dark' : 'light'}
								minimumDate={new Date(dateLimits.minimumDate)}
								maximumDate={new Date(dateLimits.maximumDate)}
								title="Data de Nascimento"
								confirmText="Confirmar"
								cancelText="Cancelar"
								locale="pt"
								mode="date"
								open={openDate}
								date={date || new Date()}
								onConfirm={(date: Date) => {
									setOpenDate(false)
									setDate(date)
									onChange(date)
									clearFieldError('birthDate')
								}}
								onCancel={() => {
									setOpenDate(false)
									setDate(undefined)
								}}
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.birthDate ? (
								<Text className="text-xs text-red-500">{customErrors.birthDate}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Data de Nascimento</Text>
							)}
						</View>
					)}
				/>
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
		<View className="flex-1 space-y-4">
			<View className="">
				<Controller
					control={control}
					name="primaryPhone"
					render={({ field: { onChange, value }, fieldState: { error } }) => (
						<View>
							<CustomTextInput
								label="Telemóvel Principal (opcional)"
								value={value}
								onChangeText={(text) => {
									onChange(text)
									clearFieldError('primaryPhone')
								}}
								keyboardType="phone-pad"
								placeholder="Digite o número de telefone"
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.primaryPhone ? (
								<Text className="text-xs text-red-500">{customErrors.primaryPhone}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Telemóvel Principal (opcional)</Text>
							)}
						</View>
					)}
				/>
			</View>
			<View className="">
				<Controller
					control={control}
					name="secondaryPhone"
					render={({ field: { onChange, value }, fieldState: { error } }) => (
						<View>
							<CustomTextInput
								label="Telemóvel Alternativo (opcional)"
								value={value}
								onChangeText={(text) => {
									onChange(text)
									clearFieldError('secondaryPhone')
								}}
								keyboardType="phone-pad"
								placeholder="Digite o número de telefone alternativo"
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.secondaryPhone ? (
								<Text className="text-xs text-red-500">{customErrors.secondaryPhone}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Telemóvel Alternativo (opcional)</Text>
							)}
						</View>
					)}
				/>
			</View>
		</View>
	)
}

const BirthPlaceScreen = ({
	control,
	errors,
	customErrors,
	clearFieldError,
	birthAddressLevel,
	setBirthAddressLevel,
}: BirthPlaceScreenProps) => {
	const { nationality, setNationality } = useAddressStore()
	return (
		<View className="flex-1 space-y-4">
			<View className="flex flex-col">
				<Label label="Naturalidade" />
				<View className="flex flex-row space-x-4 justify-between pb-4">
					<RadioButton
						label="Moçambicana"
						value="NATIONAL"
						checked={nationality === 'NATIONAL'}
						onChange={() => {
							setBirthAddressLevel(AddressLevel.FROM_PROVINCES)
							setNationality('NATIONAL')
						}}
					/>
					<RadioButton
						label="Estrangeira"
						value="FOREIGN"
						checked={nationality === 'FOREIGN'}
						onChange={() => {
							setBirthAddressLevel(AddressLevel.FROM_COUNTRIES)
							setNationality('FOREIGN')
						}}
					/>
				</View>
			</View>

			<SelectAddress
				control={control}
				errors={errors}
				customErrors={customErrors}
				clearFieldError={clearFieldError}
				addressLevel={birthAddressLevel}
				description="Indica o local de nascimento do produtor"
			/>
		</View>
	)
}

const DocumentationScreen = ({
	control,
	errors,
	customErrors,
	clearFieldError,
	showDocuments,
	setShowDocuments,
	docTypeValue,
	resetField,
}: DocumentationScreenProps) => {
	return (
		<View className="flex-1 space-y-4">
			<View className="">
				<Label label="Tipo de Documento" />
				<Controller
					control={control}
					name="docType"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View className="">
							<CustomSelectItemTrigger
								resetItem={() => {
									resetField('docType')
									resetField('docNumber')
									clearFieldError('docType')
								}}
								hasSelectedItem={!!value}
								setShowItems={setShowDocuments}
								selectedItem={value || 'Seleccione um tipo de documento'}
							/>

							<CustomSelectItem
								label="Tipo de Documento"
								searchPlaceholder="Pesquise por um tipo de documento"
								showModal={showDocuments}
								emptyMessage="Nenhum tipo de documento encontrado"
								setShowModal={setShowDocuments}
								itemsList={idDocTypes.map((type) => ({ label: type, value: type }))}
								setValue={(val) => {
									onChange(val)
									clearFieldError('docType')
								}}
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.docType ? (
								<Text className="text-xs text-red-500">{customErrors.docType}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Tipo de Documento</Text>
							)}
						</View>
					)}
				/>
			</View>
			{/* {docTypeValue && !docTypeValue.includes('Não tem') && ( */}
			<View className="">
				<Label label="Número de Documento" />
				<Controller
					control={control}
					name="docNumber"
					rules={{ required: false }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View>
							<CustomTextInput
								label=""
								value={value}
								onChangeText={(text) => {
									onChange(text)
									clearFieldError('docNumber')
								}}
								onBlur={onBlur}
								autoCapitalize="characters"
								placeholder="Número de Documento"
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.docNumber ? (
								<Text className="text-xs text-red-500">{customErrors.docNumber}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Número de BI | Cédula | Outro</Text>
							)}
						</View>
					)}
				/>
			</View>
			{/* )} */}

			<View className="">
				<Label label="NUIT (opcional)" />
				<Controller
					control={control}
					name="nuit"
					rules={{ required: false }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View>
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
						</View>
					)}
				/>
			</View>
		</View>
	)
}

export default function AddIndividualFarmer() {
	const { userDetails } = useUserDetails()
	const { resetFormData, setFormData, validateFormData, formData } = useFarmerStore()

	const {
		control,
		handleSubmit,
		formState: { errors, isValid, isDirty, isSubmitting, isSubmitSuccessful, submitCount },
		reset,
		getValues,
		resetField,
		getFieldState,
		setValue,
		watch,
	} = useForm<FarmerFormData>({
		defaultValues: {
			isServiceProvider: formData?.isServiceProvider || undefined,
			isSmallScale: formData?.isSmallScale || undefined,
			surname: formData?.surname || '',
			otherNames: formData?.otherNames || '',
			gender: formData.gender || undefined,
			birthDate: formData.birthDate,
			primaryPhone: formData.primaryPhone || undefined,
			secondaryPhone: formData.secondaryPhone || undefined,
			nuit: formData.nuit || '',
			docType: formData.docType || '',
			docNumber: formData.docNumber || '',
		},
		resolver: zodResolver(FarmerSchema),
	})
	const router = useRouter()
	const { width } = useWindowDimensions()
	const barWidth = width - 5 * 8
	const [date, setDate] = useState<Date | undefined>(undefined)
	const [openDate, setOpenDate] = useState(false)
	const [customErrors, setCustomErrors] = useState<{ [key: string]: string }>({})
	const [showDocuments, setShowDocuments] = useState(false)
	const {
		validateByAddressLevel,
		partialAddress,
		fullAddress,
		nationality,
		countryId,
		getFullProvinceNameById,
		getFullDistrictNameById,
		getFullAdminPostNameById,
		getFullVillageNameById,
		getPartialProvinceNameById,
		getPartialDistrictNameById,
		getPartialAdminPostNameById,
		getPartialVillageNameById,
		getCountryNameById,
	} = useAddressStore()

	const [birthAddressLevel, setBirthAddressLevel] = useState(AddressLevel.FROM_PROVINCES)
	const [birthPlaceString, setBirthPlaceString] = useState<string>('')
	const [showDuplicateModal, setShowDuplicateModal] = useState(false)

	const [currentScreen, setCurrentScreen] = useState(0)

	const docTypeValue = watch('docType')
	const surnameValue = watch('surname')
	const otherNamesValue = watch('otherNames')
	const birthDateValue = watch('birthDate')
	const nuitValue = watch('nuit')
	const primaryPhoneValue = watch('primaryPhone')
	const secondaryPhoneValue = watch('secondaryPhone')
	const docNumberValue = watch('docNumber')

	// Construct birth place string when birth address changes
	useEffect(() => {
		const constructBirthPlace = async () => {
			if (nationality === 'FOREIGN') {
				if (countryId) {
					try {
						const countryName = await getCountryNameById(countryId)
						setBirthPlaceString(countryName ? `country(${countryName})` : '')
					} catch {
						setBirthPlaceString('')
					}
				} else {
					setBirthPlaceString('')
				}
			} else {
				// NATIONAL: need province, district, admin_post, village
				// Based on save-farmer.tsx, it uses fullAddress for all fields
				// But birth place screen uses SelectAddress which might update partialAddress
				// Try fullAddress first, fallback to partialAddress if needed
				const provinceId = fullAddress.provinceId || partialAddress.provinceId
				const districtId = fullAddress.districtId || partialAddress.districtId
				const adminPostId = fullAddress.adminPostId || partialAddress.adminPostId
				const villageId = fullAddress.villageId || partialAddress.villageId

				if (provinceId && districtId && adminPostId && villageId) {
					try {
						const [provinceName, districtName, adminPostName, villageName] = await Promise.all([
							provinceId === fullAddress.provinceId
								? getFullProvinceNameById(provinceId)
								: getPartialProvinceNameById(provinceId),
							districtId === fullAddress.districtId
								? getFullDistrictNameById(districtId)
								: getPartialDistrictNameById(districtId),
							adminPostId === fullAddress.adminPostId
								? getFullAdminPostNameById(adminPostId)
								: getPartialAdminPostNameById(adminPostId),
							villageId === fullAddress.villageId
								? getFullVillageNameById(villageId)
								: getPartialVillageNameById(villageId),
						])
						if (provinceName && districtName && adminPostName && villageName) {
							setBirthPlaceString(
								`province(${provinceName});district(${districtName});admin_post(${adminPostName});village(${villageName})`,
							)
						} else {
							setBirthPlaceString('')
						}
					} catch {
						setBirthPlaceString('')
					}
				} else {
					setBirthPlaceString('')
				}
			}
		}
		constructBirthPlace()
	}, [
		nationality,
		countryId,
		fullAddress.provinceId,
		fullAddress.districtId,
		fullAddress.adminPostId,
		fullAddress.villageId,
		partialAddress.provinceId,
		partialAddress.districtId,
		partialAddress.adminPostId,
		partialAddress.villageId,
		getFullProvinceNameById,
		getFullDistrictNameById,
		getFullAdminPostNameById,
		getFullVillageNameById,
		getPartialProvinceNameById,
		getPartialDistrictNameById,
		getPartialAdminPostNameById,
		getPartialVillageNameById,
		getCountryNameById,
	])

	// Check for duplicate farmers
	const {
		hasDuplicate,
		duplicateType,
		message: duplicateMessage,
		isLoading: isCheckingDuplicate,
		duplicateFarmers,
	} = useCheckFarmerDuplicate({
		nuit: nuitValue,
		docType: docTypeValue,
		docNumber: docNumberValue,
		primaryPhone: primaryPhoneValue,
		secondaryPhone: secondaryPhoneValue,
		surname: surnameValue,
		otherNames: otherNamesValue,
		birthDate: birthDateValue,
		birthPlace: birthPlaceString,
	})

	const clearFieldError = (fieldName: string) => {
		setCustomErrors((prev) => {
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
					currentErrors.surname = 'Indica um apelido válido e sem espaços'
				}
				if (!values.otherNames || values.otherNames.length < 2) {
					currentErrors.otherNames = 'Indica outros nomes válidos'
				}
				if (!values.gender) {
					currentErrors.gender = 'Indica o género'
				}
				if (!values.familySize) {
					currentErrors.familySize = 'Indica o tamanho do agregado familiar'
				}
				if (!values.birthDate) {
					currentErrors.birthDate = 'Indica a data de nascimento'
				} else {
					const today = new Date()
					const birthDate = new Date(values.birthDate)
					let age = today.getFullYear() - birthDate.getFullYear()
					const monthDiff = today.getMonth() - birthDate.getMonth()
					if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
						age--
					}
					if (age < 12) {
						currentErrors.birthDate = 'A idade mínima é 12 anos'
					}
				}
				break
			case 1: // Service Provider & Category
				if (!values.isServiceProvider) {
					currentErrors.isServiceProvider = 'Indica se é um provedor de serviços de pulverização'
				}
				if (!values.isSmallScale) {
					currentErrors.isSmallScale = 'Indica a categoria do produtor'
				}
				break
			case 2: // Address Information
				const addressResult = validateByAddressLevel(AddressLevel.FROM_ADMIN_POSTS)
				if (!addressResult.success) {
					currentErrors.address = addressResult.message
				}
				break
			case 3: // Contact Information
				if (values.primaryPhone && !/^(84|86|87|85|82|83)\d{7}$/.test(values.primaryPhone)) {
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
			case 4: // Birth Place
				const birthPlaceResult = validateByAddressLevel(birthAddressLevel)
				if (!birthPlaceResult.success) {
					currentErrors.birthPlace = birthPlaceResult.message
				}
				break
			case 5: // Documentation
				if (!values.docType) {
					currentErrors.docType = 'Selecciona um tipo de documento'
				}
				if (values.nuit && !/^\d{9}$/.test(values.nuit)) {
					currentErrors.nuit = 'O NUIT deve ter 9 dígitos'
				}
				// Check if document number is required based on docType
				if (
					values.docType &&
					typeof values.docType === 'string' &&
					!values.docType.includes('Não tem') &&
					!values.docNumber
				) {
					currentErrors.docNumber = 'Indica o número do documento'
				}
				// Check for duplicate farmer (only if not checking duplicate - to avoid race conditions)
				if (!isCheckingDuplicate && hasDuplicate && duplicateMessage) {
					// Set error on the relevant field based on duplicate type
					if (duplicateType === 'nuit') {
						currentErrors.nuit = duplicateMessage
					} else if (duplicateType === 'document') {
						currentErrors.docNumber = duplicateMessage
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
					} else if (duplicateType === 'name' || duplicateType === 'name_birth') {
						currentErrors.otherNames = duplicateMessage
					}
				}
				break
		}

		setCustomErrors(currentErrors)
		return Object.keys(currentErrors).length === 0
	}

	const onSubmit = (data: FarmerFormData) => {
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
				} else if (duplicateType === 'document') {
					duplicateErrors.docNumber = duplicateMessage
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
				} else if (duplicateType === 'name' || duplicateType === 'name_birth') {
					duplicateErrors.otherNames = duplicateMessage
				}
				setCustomErrors(duplicateErrors)
				return
			}

			setFormData({
				...data,
			})
			const result = FarmerSchema.safeParse(data)
			const formValidationErrors = validateFormData()

			// Check schema validation
			if (!result.success) {
				// Schema validation failed, show errors
				const schemaErrors: { [key: string]: string } = {}
				result.error.errors.forEach((error) => {
					if (error.path.length > 0) {
						const fieldName = error.path[0] as string
						schemaErrors[fieldName] = error.message
					}
				})
				setCustomErrors(schemaErrors)
				return
			}

			// Check form validation
			if (Object.keys(formValidationErrors).length > 0) {
				setCustomErrors(formValidationErrors)
				return
			}

			// All validations passed, navigate to preview
			router.navigate('/(aux)/data-previews/save-farmer' as Href)
		}
	}

	useEffect(() => {
		resetFormData()
	}, [])

	const screens = [
		<PersonalInfoScreen
			key="personal-info"
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
			date={date}
			setDate={setDate}
			openDate={openDate}
			setOpenDate={setOpenDate}
			onDismissSingle={() => {
				setOpenDate(false)
				setDate(undefined)
			}}
			onConfirmSingle={(params) => {
				setOpenDate(false)
				setDate(params.date)
			}}
		/>,
		<ServiceProviderScreen
			key="service-provider"
			control={control}
			errors={errors}
			customErrors={customErrors}
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
		<BirthPlaceScreen
			key="birth-place"
			control={control}
			errors={errors}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
			birthAddressLevel={birthAddressLevel}
			setBirthAddressLevel={setBirthAddressLevel}
		/>,
		<DocumentationScreen
			key="documentation"
			control={control}
			errors={errors}
			docTypeValue={docTypeValue}
			customErrors={customErrors}
			clearFieldError={clearFieldError}
			showDocuments={showDocuments}
			setShowDocuments={setShowDocuments}
			resetField={resetField}
		/>,
	]

	const handleNext = () => {
		if (currentScreen < screens.length - 1) {
			const isValid = validateCurrentScreen()
			if (isValid) {
				setCurrentScreen(currentScreen + 1)
			}
		}
	}

	const handlePrevious = () => {
		console.log('currentScreen', currentScreen)
		if (currentScreen > 0) {
			setCurrentScreen(currentScreen - 1)
		}
	}

	return (
		<View className="flex-1">
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
					flexGrow: 1,
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
					nextButtonDisabled={false}
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
											value={`${capitalize(farmer.other_names || '')} ${capitalize(farmer.surname || '')}`}
										/>

										{farmer.birth_day &&
											farmer.birth_month &&
											farmer.birth_year &&
											!isNaN(farmer.birth_day) &&
											!isNaN(farmer.birth_month) &&
											!isNaN(farmer.birth_year) && (
												<FormFieldPreview
													title="Data de Nascimento:"
													value={(() => {
														try {
															const date = new Date(farmer.birth_year, farmer.birth_month - 1, farmer.birth_day)
															if (!isNaN(date.getTime())) {
																return date.toLocaleDateString('pt-BR')
															}
															return 'N/A'
														} catch (error) {
															return 'N/A'
														}
													})()}
												/>
											)}

										{farmer.birth_place_description &&
											farmer.birth_place_description !== 'N/A' &&
											farmer.birth_place_description.trim() !== '' && (
												<FormFieldPreview
													title="Local de Nascimento:"
													value={(() => {
														try {
															return farmer.birth_place_description
																.replace(/province\(/g, 'Província: ')
																.replace(/district\(/g, 'Distrito: ')
																.replace(/admin_post\(/g, 'Posto Administrativo: ')
																.replace(/village\(/g, 'Localidade: ')
																.replace(/country\(/g, 'País: ')
																.replace(/\)/g, '')
																.replace(/;/g, ' | ')
														} catch (error) {
															return farmer.birth_place_description
														}
													})()}
												/>
											)}

										{farmer.nuit && farmer.nuit !== 'N/A' && farmer.nuit.trim() !== '' && (
											<FormFieldPreview title="NUIT:" value={farmer.nuit} />
										)}

										{farmer.document_type &&
											farmer.document_type !== 'N/A' &&
											farmer.document_number &&
											farmer.document_number !== 'N/A' &&
											farmer.document_number.trim() !== '' && (
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
