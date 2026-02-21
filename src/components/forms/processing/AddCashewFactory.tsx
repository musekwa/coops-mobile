import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Image } from 'expo-image'
import Tooltip from 'react-native-walkthrough-tooltip'
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'

// Components
import BackButton from 'src/components/buttons/BackButton'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import SubmitButton from 'src/components/buttons/SubmitButton'
import { CustomPicker } from 'src/components/custom-select-item/CustomPicker'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import SuccessAlert from 'src/components/dialogs/SuccessAlert'

// Constants and data
import provinces from 'src/constants/provinces'
import districts from 'src/constants/districts'
import adminPosts from 'src/constants/adminPosts'
import villages from 'src/constants/villages'
import { errorMessages } from 'src/constants/errorMessages'
import { avatarPlaceholderUri } from 'src/constants/imageURI'

// Hooks and stores
import { useCashewWarehouseStore } from 'src/store/cashewWarehouse'
import { AddressLevel, CashewFactoryType, MetricName } from 'src/types'
import FormItemDescription from '../FormItemDescription'
import Label from '../Label'
import { useQueryOne, useUserDetails } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useActionStore } from 'src/store/actions/actions'
import { insertAddressDetail, insertFacility, insertWarehouseDetail } from 'src/library/powersync/sql-statements2'
import { Href, useRouter } from 'expo-router'
import { buildAddressDetail } from 'src/library/powersync/schemas/address_details'
import { buildFacility } from 'src/library/powersync/schemas/facilities'
import { buildWarehouseDetail } from 'src/library/powersync/schemas/warehouse_details'
import { useAddressStore } from 'src/store/address'
import SelectAddress from 'src/custom-ui/select-address'

const CashewFactorySchema = z
	.object({
		name: z.string().trim().min(2, 'Indica o nome da fábrica.'),
		factoryType: z.enum([CashewFactoryType.LARGE_SCALE, CashewFactoryType.SMALL_SCALE, CashewFactoryType.INFORMAL], {
			message: 'Seleccione um tipo de fábrica',
		}),
		description: z.string().trim().min(2, 'Indica a descrição da fábrica.').optional(),
	})
	.refine((data) => !!data.factoryType, {
		message: 'Seleccione um tipo de fábrica',
		path: ['factoryType'],
	})

type CashewFactoryFormData = z.infer<typeof CashewFactorySchema>
export default function AddCashewFactoryForm() {
	const { getCurrentResource } = useActionStore()
	const { userDetails } = useUserDetails()
	const { fullAddress, validateByAddressLevel, reset: resetAddress } = useAddressStore()
	const router = useRouter()

	const { resetCashewWarehouseInfo } = useCashewWarehouseStore()
	const {
		control,
		handleSubmit,
		setValue,
		getValues,
		watch,
		formState: { errors, isValid, isDirty, isSubmitting, isSubmitSuccessful, submitCount },
		reset,
	} = useForm<CashewFactoryFormData>({
		defaultValues: {
			name: '',
			description: '',

			// workerOption: 'none',
		},
		resolver: zodResolver(CashewFactorySchema),
	})

	const [customErrors, setCustomErrors] = useState<{ [key: string]: string }>({})
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [success, setSuccess] = useState(false)
	const [traderName, setTraderName] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const [showTooltip, setShowTooltip] = useState(false)

	const {
		data: trader,
		isLoading: isTraderLoading,
		isError: isTraderError,
	} = useQueryOne<{
		actor_id: string
		surname: string
		other_names: string
		photo: string
	}>(`SELECT actor_id, surname, other_names, photo FROM ${TABLES.ACTOR_DETAILS} WHERE actor_id = ?`, [
		getCurrentResource().id,
	])

	useEffect(() => {
		if (trader && trader.surname && trader.other_names) {
			const traderName = `${trader?.other_names} ${trader?.surname?.toLowerCase().includes('company') ? '(Empresa)' : trader?.surname}`
			setTraderName(traderName)
		}
	}, [trader])

	const onSubmit = async (data: CashewFactoryFormData) => {
		setIsLoading(true)
		setCustomErrors({})
		const result = CashewFactorySchema.safeParse(data)
		if (!userDetails || !userDetails.district_id) {
			setHasError(true)
			setErrorMessage('Não é permitido a um usuário não idêntificado adicionar um posto de compra ou armazém')
			return
		}
		if (!trader || !trader.actor_id) {
			setHasError(true)
			setErrorMessage('Não é possível adicionar um posto ou armazém de um comerciante não idêntificado')
			return
		}
		if (result.success) {
			if (
				!validateByAddressLevel(AddressLevel.FROM_PROVINCES) ||
				!fullAddress.provinceId ||
				!fullAddress.districtId ||
				!fullAddress.adminPostId ||
				!fullAddress.villageId
			) {
				setHasError(true)
				setErrorMessage('Não é possível adicionar um posto ou armazém sem uma localização')
				return
			}
			try {
				// Build facility record first
				const facility_row = buildFacility({
					name: data.name || 'N/A',
					type: 'WAREHOUSE',
					owner_id: trader?.actor_id || '',
					sync_id: fullAddress.districtId,
				})

				// Insert facility first
				await insertFacility(facility_row)

				// Build warehouse detail record (using facility.id)
				const warehouse_detail_row = buildWarehouseDetail({
					id: facility_row.id,
					name: data.name || 'N/A',
					description: `${traderName} - ${data.description || ''}`,
					owner_id: trader?.actor_id || '',
					type: data.factoryType,
					is_active: true,
					sync_id: fullAddress.districtId,
				})

				// Build address detail record (for the warehouse)
				const address_detail_row = buildAddressDetail({
					owner_id: facility_row.id,
					owner_type: 'WAREHOUSE',
					village_id: fullAddress.villageId,
					admin_post_id: fullAddress.adminPostId,
					district_id: fullAddress.districtId,
					province_id: fullAddress.provinceId,
					gps_lat: '0',
					gps_long: '0',
					sync_id: fullAddress.districtId,
				})

				// Insert warehouse detail and address detail
				await Promise.all([insertWarehouseDetail(warehouse_detail_row), insertAddressDetail(address_detail_row)])

				resetCashewWarehouseInfo()
				setSuccess(true)
				reset()
				resetAddress()
				router.push('/(aux)/custom-redirect' as Href)
			} catch (error) {
				console.log(error)
				setHasError(true)
				setErrorMessage('Erro ao adicionar a fábrica')
			} finally {
				setIsLoading(false)
			}
		}
	}

	useEffect(() => {
		if ((errors && Object.keys(errors).length > 0) || Object.keys(customErrors).length > 0) {
			setHasError(true)
			setErrorMessage(errorMessages.formFields)
		}
	}, [errors, customErrors])

	return (
		<>
			<Animated.ScrollView
				entering={SlideInDown.duration(300)}
				exiting={SlideOutDown.duration(300)}
				className="flex-1 bg-white dark:bg-black"
			>
				<View className="h-[55px] mt-6 flex flex-row justify-between items-center p-3">
					<BackButton />
					<View>
						<Text className="text-black dark:text-white font-bold">Registo de Fábrica</Text>
					</View>
					<View className="flex flex-row justify-between items-center ">
						<Tooltip
							isVisible={showTooltip}
							content={<Text>{traderName}</Text>}
							placement="bottom"
							onClose={() => setShowTooltip(false)}
						>
							<TouchableOpacity onPress={() => setShowTooltip(true)} className="items-center justify-center">
								<Image
									source={{ uri: trader?.photo && trader.photo !== 'N/A' ? trader.photo : avatarPlaceholderUri }}
									style={{ width: 40, height: 40, borderRadius: 20 }}
									contentFit="cover"
								/>
							</TouchableOpacity>
						</Tooltip>
					</View>
				</View>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						paddingHorizontal: 15,
						paddingVertical: 30,
						flexGrow: 1,
						justifyContent: 'center',
					}}
				>
					<View className="flex-1 space-y-6">
						<View className="flex justify-between items-center">
							<FormItemDescription description="Registo de fábrica de grande porte, pequeno porte ou informal" />
						</View>
						<View className="">
							<Label label="Nome da Fábrica" />
							<Controller
								control={control}
								name="name"
								rules={{ required: 'Nome da fábrica é obrigatório' }}
								render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
									<>
										<CustomTextInput
											label=""
											placeholder="Nome da Fábrica"
											onChangeText={onChange}
											autoCapitalize="words"
											value={value}
											onBlur={onBlur}
										/>
										{error ? (
											<Text className="text-xs text-red-500">{error.message}</Text>
										) : (
											<FormItemDescription description="Nome da Fábrica" />
										)}
									</>
								)}
							/>
						</View>
						<View className="">
							<Label label="Tipo de Fábrica" />
							<Controller
								control={control}
								name="factoryType"
								rules={{ required: 'Seleccione um tipo de fábrica' }}
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<>
										<View className="">
											<TouchableOpacity
												onPress={() => onChange('LARGE_SCALE')}
												className={`flex-row items-center p-3  rounded-md ${
													value === CashewFactoryType.LARGE_SCALE ? 'bg-gray-100 dark:bg-gray-800' : 'border-gray-300'
												}`}
											>
												<View
													className={`w-6 h-6 rounded-full border-2 mr-3 ${
														value === CashewFactoryType.LARGE_SCALE
															? 'border-[#008000] bg-[#008000]'
															: 'border-gray-400'
													}`}
												>
													{value === CashewFactoryType.LARGE_SCALE && (
														<View className="w-3 h-3 bg-white rounded-full m-auto" />
													)}
												</View>
												<Text
													className={`${value === CashewFactoryType.LARGE_SCALE ? 'text-[#008000]' : 'text-black dark:text-white'}`}
												>
													Fábrica de Grande Porte
												</Text>
											</TouchableOpacity>

											<TouchableOpacity
												onPress={() => onChange('SMALL_SCALE')}
												className={`flex-row items-center p-3 rounded-md ${
													value === CashewFactoryType.SMALL_SCALE ? 'bg-gray-100 dark:bg-gray-800' : 'border-gray-300'
												}`}
											>
												<View
													className={`w-6 h-6 rounded-full border-2 mr-3 ${
														value === CashewFactoryType.SMALL_SCALE
															? 'border-[#008000] bg-[#008000]'
															: 'border-gray-400'
													}`}
												>
													{value === CashewFactoryType.SMALL_SCALE && (
														<View className="w-3 h-3 bg-white rounded-full m-auto" />
													)}
												</View>
												<Text
													className={`${value === CashewFactoryType.SMALL_SCALE ? 'text-[#008000]' : 'text-black dark:text-white'}`}
												>
													Fábrica de Pequeno Porte
												</Text>
											</TouchableOpacity>

											<TouchableOpacity
												onPress={() => onChange('INFORMAL')}
												className={`flex-row items-center p-3 rounded-md ${
													value === CashewFactoryType.INFORMAL ? 'bg-gray-100 dark:bg-gray-800' : 'border-gray-300'
												}`}
											>
												<View
													className={`w-6 h-6 rounded-full border-2 mr-3 ${
														value === CashewFactoryType.INFORMAL ? 'border-[#008000] bg-[#008000]' : 'border-gray-400'
													}`}
												>
													{value === CashewFactoryType.INFORMAL && (
														<View className="w-3 h-3 bg-white rounded-full m-auto" />
													)}
												</View>
												<Text
													className={`${value === CashewFactoryType.INFORMAL ? 'text-[#008000]' : 'text-black dark:text-white'}`}
												>
													Fábrica Informal
												</Text>
											</TouchableOpacity>
										</View>
										{error && <Text className="text-xs text-red-500 mt-1">{error.message}</Text>}
									</>
								)}
							/>
						</View>

						<View className="">
							{/* Description */}
							<Label label="Descrição da Fábrica" />
							<View>
								<Controller
									control={control}
									name="description"
									defaultValue=""
									rules={{ required: 'Descrição é obrigatória' }}
									render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
										<>
											<CustomTextInput
												label=""
												placeholder="Descrição da Fábrica"
												onChangeText={onChange}
												value={value}
												onBlur={onBlur}
												autoCapitalize="sentences"
												numberOfLines={3}
											/>
											{error ? (
												<Text className="text-xs text-red-500">{error.message}</Text>
											) : (
												<FormItemDescription description="Descrição da Fábrica" />
											)}
										</>
									)}
								/>
							</View>
						</View>
						{/*  Address */}
						<View className="flex flex-row space-x-2">
							<SelectAddress
								control={control}
								errors={errors}
								clearFieldError={() => {}}
								customErrors={customErrors}
								addressLevel={AddressLevel.FROM_PROVINCES}
								description="Localização da Fábrica"
							/>
						</View>
						{/* Submit button */}
						<View className="">
							<SubmitButton
								title="Gravar"
								disabled={isSubmitting || (!isDirty && isSubmitSuccessful) || isLoading}
								isSubmitting={isLoading}
								onPress={handleSubmit(onSubmit)}
							/>
						</View>
					</View>
				</ScrollView>
				{/* <Toast position="bottom" /> */}
				<ErrorAlert
					visible={hasError}
					setVisible={setHasError}
					title="Erro"
					message={errorMessage}
					setMessage={setErrorMessage}
				/>
				<SuccessAlert visible={success} setVisible={setSuccess} route="/(aux)/actors/trader/profile" />
			</Animated.ScrollView>
		</>
	)
}
