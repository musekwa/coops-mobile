import React, { useMemo, useEffect } from 'react'
import { View, Text } from 'react-native'

// Third party imports
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useColorScheme } from 'nativewind'

// Components
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { CustomPicker } from 'src/components/custom-select-item/CustomPicker'
import RadioButton from 'src/components/buttons/RadioButton'
import FormWrapper from '../FormWrapper'
import FormItemDescription from '../FormItemDescription'
import Label from '../Label'
import NextAndPreviousButtons from 'src/components/buttons/NextAndPreviousButtons'

// Hooks
import { useQueryMany } from 'src/hooks/queries'
import {
	AdminPostRecord,
	DistrictRecord,
	ProvinceRecord,
	TABLES,
	VillageRecord,
} from 'src/library/powersync/schemas/AppSchema'

// Store
import { useActionStore } from 'src/store/actions/actions'
import { useSmugglerDetailsStore, SmugglerDetailsStore } from 'src/store/tracking/smuggler'

const OwnerType = {
	FARMER: 'FARMER',
	TRADER: 'TRADER',
} as const

const AddSmugglerSchema = z.object({
	ownerType: z
		.string({
			message: 'Indica o tipo de proprietário.',
		})
		.trim()
		.min(2, 'Indica o tipo de proprietário.'),
	surname: z.string().trim().min(2, 'Indica um apelido.').regex(/^\S*$/, 'Indica apenas um apelido.'),
	otherNames: z.string().trim().min(2, 'Indica outros nomes.'),
	phone: z
		.string()
		.regex(/^(84|86|87|85|82|83)\d{7}$/, { message: 'Número de telefone inválido' })
		.optional(),
	provinceId: z
		.string({
			message: 'Indica a província',
		})
		.min(1, 'Indica a província'),
	districtId: z
		.string({
			message: 'Indica o distrito',
		})
		.min(1, 'Indica o distrito'),
	adminPostId: z
		.string({
			message: 'Indica o posto administrativo',
		})
		.min(1, 'Indica o posto administrativo'),
	villageId: z
		.string({
			message: 'Indica a localidade',
		})
		.min(1, 'Indica a localidade'),
})

type AddSmugglerFormData = z.infer<typeof AddSmugglerSchema>

type AddSmugglerProps = {
	hasError: boolean
	setHasError: (hasError: boolean) => void
	errorMessage: string
	setErrorMessage: (errorMessage: string) => void
}

export default function AddSmugglerInfo({ hasError, setHasError, errorMessage, setErrorMessage }: AddSmugglerProps) {
	const { colorScheme } = useColorScheme()
	const isDarkMode = colorScheme === 'dark'
	const { setCurrentStep, totalSteps, currentStep } = useActionStore()
	const { smugglerDetails, setSmugglerDetails } = useSmugglerDetailsStore()

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isValid },
	} = useForm<AddSmugglerFormData>({
		defaultValues: {
			ownerType: smugglerDetails.smugglerCategory || '',
			surname: smugglerDetails.smugglerSurname || '',
			otherNames: smugglerDetails.smugglerOtherNames || '',
			phone: smugglerDetails.smugglerPhone || '',
			provinceId: smugglerDetails.smugglerProvinceId || '',
			districtId: smugglerDetails.smugglerDistrictId || '',
			adminPostId: smugglerDetails.smugglerAdminPostId || '',
			villageId: smugglerDetails.smugglerVillageId || '',
		},
		resolver: zodResolver(AddSmugglerSchema),
	})

	const ownerTypeValue = watch('ownerType')
	const provinceIdValue = watch('provinceId')
	const districtIdValue = watch('districtId')
	const adminPostIdValue = watch('adminPostId')
	const villageIdValue = watch('villageId')
	const surnameValue = watch('surname')
	const otherNamesValue = watch('otherNames')
	const phoneValue = watch('phone')

	const { data: provinces } = useQueryMany<ProvinceRecord>(`SELECT id, name FROM ${TABLES.PROVINCES} ORDER BY name ASC`)
	const { data: districtsData } = useQueryMany<DistrictRecord>(
		provinceIdValue
			? `SELECT id, name FROM ${TABLES.DISTRICTS} WHERE province_id = '${provinceIdValue}' ORDER BY name ASC`
			: '',
	)
	const { data: adminPostsData } = useQueryMany<AdminPostRecord>(
		districtIdValue
			? `SELECT id, name FROM ${TABLES.ADMIN_POSTS} WHERE district_id = '${districtIdValue}' ORDER BY name ASC`
			: '',
	)
	const { data: villagesData } = useQueryMany<VillageRecord>(
		adminPostIdValue
			? `SELECT id, name FROM ${TABLES.VILLAGES} WHERE admin_post_id = '${adminPostIdValue}' ORDER BY name ASC`
			: '',
	)

	const availableProvinces = useMemo(
		() =>
			provinces
				?.filter((province) => province.name)
				.map((province) => ({
					label: province.name!,
					value: province.id,
				})) ?? [],
		[provinces],
	)

	const availableDistricts = useMemo(
		() =>
			districtsData
				?.filter((district) => district.name)
				.map((district) => ({
					label: district.name!,
					value: district.id,
				})) ?? [],
		[districtsData],
	)

	const availableAdminPosts = useMemo(
		() =>
			adminPostsData
				?.filter((adminPost) => adminPost.name)
				.map((adminPost) => ({
					label: adminPost.name!,
					value: adminPost.id,
				})) ?? [],
		[adminPostsData],
	)

	const availableVillages = useMemo(
		() =>
			villagesData
				?.filter((village) => village.name)
				.map((village) => ({
					label: village.name!,
					value: village.id,
				})) ?? [],
		[villagesData],
	)

	useEffect(() => {
		if (!provinceIdValue) {
			setValue('districtId', '')
			setValue('adminPostId', '')
			setValue('villageId', '')
		}
	}, [provinceIdValue, setValue])

	useEffect(() => {
		if (!districtIdValue) {
			setValue('adminPostId', '')
			setValue('villageId', '')
		}
	}, [districtIdValue, setValue])

	useEffect(() => {
		if (!adminPostIdValue) {
			setValue('villageId', '')
		}
	}, [adminPostIdValue, setValue])

	const handlePreviousStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1)
		}
	}

	const onSubmit = (data: AddSmugglerFormData) => {
		const selectedProvince = provinces?.find((item) => item.id === data.provinceId)
		const selectedDistrict = districtsData?.find((item) => item.id === data.districtId)
		const selectedAdminPost = adminPostsData?.find((item) => item.id === data.adminPostId)
		const selectedVillage = villagesData?.find((item) => item.id === data.villageId)

		setSmugglerDetails({
			smugglerId: '',
			smugglerCategory: data.ownerType as 'FARMER' | 'TRADER',
			smugglerSurname: data.surname,
			smugglerOtherNames: data.otherNames,
			smugglerPhone: data.phone ?? '',
			smugglerProvinceId: data.provinceId,
			smugglerProvince: selectedProvince?.name ?? '',
			smugglerDistrictId: data.districtId,
			smugglerDistrict: selectedDistrict?.name ?? '',
			smugglerAdminPostId: data.adminPostId,
			smugglerAdminPost: selectedAdminPost?.name ?? '',
			smugglerVillageId: data.villageId,
			smugglerVillage: selectedVillage?.name ?? '',
			isAlreadyRegistered: false,
		})

		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1)
		}
	}

	return (
		<View className="flex-1">
			<FormWrapper>
				<FormItemDescription description="Como categoriza o proprietário da mercadoria?" />

				<View className="mb-4">
					<Label label="Tipo de proprietário" />
					<Controller
						control={control}
						name="ownerType"
						render={({ field: { onChange, value }, fieldState: { error } }) => (
							<View>
								<RadioButton
									label="Produtor"
									value={OwnerType.FARMER}
									checked={value === OwnerType.FARMER}
									onChange={() => onChange(OwnerType.FARMER)}
								/>
								<RadioButton
									label="Comerciante"
									value={OwnerType.TRADER}
									checked={value === OwnerType.TRADER}
									onChange={() => onChange(OwnerType.TRADER)}
								/>
								{error && <Text className="text-xs text-red-500">{error.message}</Text>}
							</View>
						)}
					/>
				</View>

				<View>
					<Controller
						control={control}
						name="surname"
						render={({ field: { onChange, value }, fieldState: { error } }) => (
							<>
								<CustomTextInput
									label="Apelido"
									value={value}
									onChangeText={onChange}
									autoCapitalize="words"
									placeholder="Digita o apelido"
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : (
									<FormItemDescription description="Indica apenas o apelido" />
								)}
							</>
						)}
					/>
				</View>

				<View>
					<Controller
						control={control}
						name="otherNames"
						render={({ field: { onChange, value }, fieldState: { error } }) => (
							<>
								<CustomTextInput
									label="Outros Nomes"
									value={value}
									onChangeText={onChange}
									autoCapitalize="words"
									placeholder="Digita outros nomes"
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : (
									<FormItemDescription description="Indica outros nomes, exceto o apelido" />
								)}
							</>
						)}
					/>
				</View>

				<View>
					<Controller
						control={control}
						name="phone"
						render={({ field: { onChange, value }, fieldState: { error } }) => (
							<>
								<CustomTextInput
									label="Telefone"
									value={value}
									onChangeText={onChange}
									placeholder="Digita o número de telefone"
									keyboardType="phone-pad"
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : (
									<FormItemDescription description="Indica o número de telefone" />
								)}
							</>
						)}
					/>
				</View>

				<View>
					<Label label="Endereço" />

					<View className="flex flex-row space-x-2 pb-3">
						<View className="flex-1">
							<Controller
								control={control}
								name="provinceId"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<>
										<CustomPicker
											value={value}
											setValue={(newValue) => {
												onChange(newValue)
											}}
											items={availableProvinces}
											placeholder={{ label: 'Província', value: null }}
										/>
										{error ? (
											<Text className="text-xs text-red-500">{error.message}</Text>
										) : (
											<FormItemDescription description="Indica a província" />
										)}
									</>
								)}
							/>
						</View>

						<View className="flex-1">
							<Controller
								control={control}
								name="districtId"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<>
										<CustomPicker
											value={value}
											setValue={(newValue) => {
												onChange(newValue)
											}}
											items={availableDistricts}
											placeholder={{ label: 'Distrito', value: null }}
										/>
										{error ? (
											<Text className="text-xs text-red-500">{error.message}</Text>
										) : (
											<FormItemDescription description="Indica o distrito" />
										)}
									</>
								)}
							/>
						</View>
					</View>

					<View className="flex flex-row space-x-2">
						<View className="flex-1">
							<Controller
								control={control}
								name="adminPostId"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<>
										<CustomPicker
											value={value}
											setValue={(newValue) => {
												onChange(newValue)
											}}
											items={availableAdminPosts}
											placeholder={{ label: 'Posto Admin.', value: null }}
										/>
										{error ? (
											<Text className="text-xs text-red-500">{error.message}</Text>
										) : (
											<FormItemDescription description="Posto administrativo" />
										)}
									</>
								)}
							/>
						</View>

						<View className="flex-1">
							<Controller
								control={control}
								name="villageId"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<>
										<CustomPicker
											value={value}
											setValue={(newValue) => {
												onChange(newValue)
											}}
											items={availableVillages}
											placeholder={{ label: 'Localidade', value: null }}
										/>
										{error ? (
											<Text className="text-xs text-red-500">{error.message}</Text>
										) : (
											<FormItemDescription description="Indica a localidade" />
										)}
									</>
								)}
							/>
						</View>
					</View>
				</View>
			</FormWrapper>
			<NextAndPreviousButtons
				handlePreviousStep={handlePreviousStep}
				handleNextStep={handleSubmit(onSubmit)}
				showPreviousButton={currentStep > 0}
				showNextButton={currentStep < totalSteps - 1}
				nextButtonDisabled={!isValid}
				previousButtonDisabled={currentStep === 0}
			/>
		</View>
	)
}
