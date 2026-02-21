import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Image } from 'expo-image'
import Tooltip from 'react-native-walkthrough-tooltip'
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'

import BackButton from 'src/components/buttons/BackButton'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import SubmitButton from 'src/components/buttons/SubmitButton'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import SuccessAlert from 'src/components/dialogs/SuccessAlert'

// Constants and data
import { errorMessages } from 'src/constants/errorMessages'
import { avatarPlaceholderUri } from 'src/constants/imageURI'

// Hooks and stores
import { useCashewWarehouseStore } from 'src/store/cashewWarehouse'
import { AddressLevel, CashewWarehouseType } from 'src/types'
import { useQueryOne, useUserDetails } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { ActorDetailRecord } from 'src/library/powersync/schemas/AppSchema'
import { useActionStore } from 'src/store/actions/actions'
import { insertAddressDetail, insertFacility, insertWarehouseDetail } from 'src/library/powersync/sql-statements2'
import { buildAddressDetail } from 'src/library/powersync/schemas/address_details'
import { buildFacility } from 'src/library/powersync/schemas/facilities'
import { buildWarehouseDetail } from 'src/library/powersync/schemas/warehouse_details'
import { useRouter, Href } from 'expo-router'
import { useAddressStore } from 'src/store/address'
import SelectAddress from 'src/custom-ui/select-address'

const CashewWarehouseSchema = z
	.object({
		warehouseType: z
			.enum(['BUYING', 'AGGREGATION', 'DESTINATION', 'COOPERATIVE', 'COOP_UNION', 'ASSOCIATION', 'N/A'])
			.default('N/A'),
		description: z.string().trim().min(2, 'Indica a descrição do posto.'),
		// workerOption: z.enum(['isTraderWorker', 'willAddCollaborator', 'none']).default('none'),
	})
	.refine((data) => data.warehouseType !== 'N/A', {
		message: 'Seleccione um tipo de armazém ou posto',
		path: ['warehouseType'],
	})

type CashewWarehouseFormData = z.infer<typeof CashewWarehouseSchema>
export default function AddCashewWarehouseForm({ warehouseType }: { warehouseType: CashewWarehouseType }) {
	const { userDetails } = useUserDetails()
	const { getCurrentResource } = useActionStore()
	const router = useRouter()

	const { resetCashewWarehouseInfo } = useCashewWarehouseStore()
	const {
		control,
		handleSubmit,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		reset,
	} = useForm<CashewWarehouseFormData>({
		defaultValues: {
			warehouseType: warehouseType ? warehouseType : 'N/A',
			description: '',
		},
		resolver: zodResolver(CashewWarehouseSchema),
	})

	const [customErrors, setCustomErrors] = useState<{ [key: string]: string }>({})
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [success, setSuccess] = useState(false)
	const [traderName, setTraderName] = useState('')
	const [isCompany, setIsCompany] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const [showTooltip, setShowTooltip] = useState(false)

	const { fullAddress, reset: resetAddress, validateByAddressLevel } = useAddressStore()

	const { data: trader } = useQueryOne<{
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
			setIsCompany(trader?.surname?.toLowerCase().includes('company'))
		}
	}, [trader])

	const onSubmit = async (data: CashewWarehouseFormData) => {
		setIsLoading(true)
		setCustomErrors({})
		const result = CashewWarehouseSchema.safeParse(data)
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
					name: data.description || 'N/A',
					type: 'WAREHOUSE',
					owner_id: trader?.actor_id || '',
					sync_id: fullAddress.districtId,
				})

				// Insert facility first
				await insertFacility(facility_row)

				// Build warehouse detail record (using facility.id)
				const warehouse_detail_row = buildWarehouseDetail({
					id: facility_row.id,
					name: data.description || 'N/A',
					description: `${traderName} - ${data.description}`,
					owner_id: trader?.actor_id || '',
					type: data.warehouseType,
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
				setErrorMessage('Erro ao adicionar o posto de compra ou armazém')
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
		<Animated.ScrollView
			entering={SlideInDown.duration(300)}
			exiting={SlideOutDown.duration(300)}
			className="flex-1 bg-white dark:bg-black"
		>
			<View className="h-[55px] mt-6 flex flex-row justify-between items-center p-3">
				<BackButton />
				<View>
					<Text className="text-black dark:text-white font-bold">Registo de Posto</Text>
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
								source={{ uri: trader?.photo && trader?.photo !== 'N/A' ? trader?.photo : avatarPlaceholderUri }}
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
					padding: 16,
					flexGrow: 1,
					justifyContent: 'center',
				}}
				className="space-y-5"
			>
				<View className="flex flex-row justify-between items-center">
					<Text className="text-gray-600 dark:text-gray-400 text-[12px] italic text-center">
						Registo de posto de compras, de agregação ou armazém de destino
					</Text>
				</View>
				<View className="space-y-4">
					<Text className="text-black dark:text-white">Tipo de Posto ou Armazém</Text>
					<Controller
						control={control}
						name="warehouseType"
						rules={{ required: 'Seleccione um tipo de armazém' }}
						render={({ field: { onChange, value }, fieldState: { error } }) => (
							<>
								<View className="py-2">
									<TouchableOpacity
										onPress={() => onChange('BUYING')}
										className={`flex-row items-center p-3  rounded-md ${
											value === CashewWarehouseType.BUYING ? 'bg-gray-100 dark:bg-gray-800' : 'border-gray-300'
										}`}
									>
										<View
											className={`w-6 h-6 rounded-full border-2 mr-3 ${
												value === CashewWarehouseType.BUYING ? 'border-[#008000] bg-[#008000]' : 'border-gray-400'
											}`}
										>
											{value === CashewWarehouseType.BUYING && (
												<View className="w-3 h-3 bg-white rounded-full m-auto" />
											)}
										</View>
										<Text
											className={`${value === CashewWarehouseType.BUYING ? 'text-[#008000]' : 'text-black dark:text-white'}`}
										>
											Posto de Compra
										</Text>
									</TouchableOpacity>

									<TouchableOpacity
										onPress={() => onChange('AGGREGATION')}
										className={`flex-row items-center p-3 rounded-md ${
											value === CashewWarehouseType.AGGREGATION ? 'bg-gray-100 dark:bg-gray-800' : 'border-gray-300'
										}`}
									>
										<View
											className={`w-6 h-6 rounded-full border-2 mr-3 ${
												value === CashewWarehouseType.AGGREGATION ? 'border-[#008000] bg-[#008000]' : 'border-gray-400'
											}`}
										>
											{value === CashewWarehouseType.AGGREGATION && (
												<View className="w-3 h-3 bg-white rounded-full m-auto" />
											)}
										</View>
										<Text
											className={`${value === CashewWarehouseType.AGGREGATION ? 'text-[#008000]' : 'text-black dark:text-white'}`}
										>
											Armazém de Trânsito
										</Text>
									</TouchableOpacity>

									<TouchableOpacity
										onPress={() => onChange('DESTINATION')}
										className={`flex-row items-center p-3 rounded-md ${
											value === CashewWarehouseType.DESTINATION ? 'bg-gray-100 dark:bg-gray-800' : 'border-gray-300'
										}`}
									>
										<View
											className={`w-6 h-6 rounded-full border-2 mr-3 ${
												value === CashewWarehouseType.DESTINATION ? 'border-[#008000] bg-[#008000]' : 'border-gray-400'
											}`}
										>
											{value === CashewWarehouseType.DESTINATION && (
												<View className="w-3 h-3 bg-white rounded-full m-auto" />
											)}
										</View>
										<Text
											className={`${value === CashewWarehouseType.DESTINATION ? 'text-[#008000]' : 'text-black dark:text-white'}`}
										>
											Armazém de Destino
										</Text>
									</TouchableOpacity>
								</View>
								{error && <Text className="text-xs text-red-500 mt-1">{error.message}</Text>}
							</>
						)}
					/>
				</View>

				<View className="space-y-5 flex-1">
					{/* Description */}
					<View>
						<Controller
							control={control}
							name="description"
							defaultValue=""
							rules={{ required: 'Descrição é obrigatória' }}
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<>
									<CustomTextInput
										label="Descrição do Posto"
										placeholder="Descrição do Posto"
										onChangeText={onChange}
										value={value}
										onBlur={onBlur}
										autoCapitalize="sentences"
										numberOfLines={3}
									/>
									{error ? (
										<Text className="text-xs text-red-500">{error.message}</Text>
									) : (
										<Text className={`text-xs text-gray-500`}>Descrição do Posto</Text>
									)}
								</>
							)}
						/>
					</View>

					{/*  Address */}

					<View className="flex flex-row space-x-2">
						<SelectAddress
							control={control}
							errors={errors}
							clearFieldError={() => {}}
							customErrors={customErrors}
							addressLevel={AddressLevel.FROM_PROVINCES}
							description="Localização do Posto ou Armazém"
						/>
					</View>

					{/* Submit button */}
					<View className="">
						<SubmitButton
							title="Gravar"
							disabled={isSubmitting || (!isDirty && isSubmitSuccessful) || isLoading}
							onPress={handleSubmit(onSubmit)}
							isSubmitting={isLoading}
						/>
					</View>
				</View>
				{/* <Toast position="bottom" /> */}
				<ErrorAlert
					visible={hasError}
					setVisible={setHasError}
					title="Erro"
					message={errorMessage}
					setMessage={setErrorMessage}
				/>
				<SuccessAlert visible={success} setVisible={setSuccess} route="/(aux)/actors/trader/profile" />
			</ScrollView>
		</Animated.ScrollView>
	)
}
