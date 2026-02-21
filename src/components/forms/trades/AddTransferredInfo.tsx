import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { CashewWarehouseType } from 'src/types'
import { Switch, TouchableOpacity } from 'react-native'
import { useQueryMany } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { Ionicons } from '@expo/vector-icons'
import { useTransferredInfoStore } from 'src/store/trades'
import CustomSelectItem from 'src/components/ui/custom-select-item'
import Label from '../Label'
import CustomSelectItemTrigger from 'src/components/ui/custom-select-item-trigger'
import { translateWarehouseTypeToPortuguese } from 'src/helpers/helpersToTrades'

type WarehouseData = {
	id: string
	warehouse_type: string
	description: string
	owner_id: string
	address_id: string
}

const TransactionSchema = z
	.object({
		hasTransferred: z.boolean(),
		transfers: z
			.array(
				z.object({
					warehouse_id: z.string(),
					warehouse_label: z.string(),
					warehouse_type: z.string(),
					quantity: z.number().min(0, 'A quantidade deve ser maior ou igual a 0 Kg.'),
					description: z.string().optional(),
				}),
			)
			.optional(),
	})
	.refine(
		(data: any) => {
			if (data.hasTransferred && (!data.transfers || data.transfers.length === 0)) {
				return false
			}
			return true
		},
		{
			message: 'Indica a quantidade transferida e o armazém de destino.',
			path: ['hasTransferred'],
		},
	)

type TransactionData = z.infer<typeof TransactionSchema>

type TransferredInfoProps = {
	currentWarehouseId: string
	ownerId: string
	customErrors: Record<string, string>
	setCustomErrors: (customErrors: Record<string, string>) => void
}

export default function AddTransferredInfo({
	currentWarehouseId,
	ownerId,
	customErrors,
	setCustomErrors,
}: TransferredInfoProps) {
	const {
		control,
		handleSubmit,
		formState: { errors, isValid, isDirty, isSubmitting, isSubmitSuccessful, submitCount },
		reset,
		resetField,
		getValues,
		setValue,
		watch,
		setError,
		clearErrors,
	} = useForm<TransactionData>({
		defaultValues: {
			hasTransferred: false,
			transfers: [],
		},
		resolver: zodResolver(TransactionSchema),
	})

	const {
		data: traderWarehouses,
		isLoading: isTraderWarehousesLoading,
		error: traderWarehousesError,
		isError: isTraderWarehousesError,
	} = useQueryMany<WarehouseData>(
		`SELECT 
			wd.id, 
			wd.type as warehouse_type, 
			ad.id as address_id,
			wd.description, 
			wd.owner_id
		FROM ${TABLES.WAREHOUSE_DETAILS} wd 
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
			WHERE wd.owner_id = '${ownerId}' 
			AND wd.type IN ('${CashewWarehouseType.AGGREGATION}', '${CashewWarehouseType.DESTINATION}') 
			AND wd.id != '${currentWarehouseId}'`,
	)

	const [showWarehouse, setShowWarehouse] = useState(false)
	const { setTransferredInfo, resetTransferredInfo, removeWarehouse, updateWarehouseQuantity, setHasTransferred } =
		useTransferredInfoStore()

	const hasTransferredValue = watch('hasTransferred')
	const transfersValue = watch('transfers')

	useEffect(() => {
		validateTransferredInfo()
	}, [hasTransferredValue, transfersValue])

	const validateTransferredInfo = () => {
		const hasTransferred = getValues('hasTransferred')
		const transfers = getValues('transfers')
		setHasTransferred(hasTransferred)
		if (hasTransferred) {
			if (transfers && transfers.length > 0 && transfers.every((w) => w.warehouse_id && w.warehouse_type)) {
				setTransferredInfo({
					hasTransferred: true,
					transfersWarehouses: transfers.map((w) => ({
						warehouse_id: w.warehouse_id,
						warehouse_label: w.warehouse_label,
						warehouse_type: w.warehouse_type,
						quantity: w.quantity || 0,
						description: w.description || '',
					})),
				})
				setCustomErrors({ ...customErrors, transferred: '', outgoing: '' })
			}
		}
	}

	return (
		<ScrollView className="border border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 my-3">
			<View className="flex-row items-center justify-between mb-4">
				<View className="flex-1">
					<Text className="text-sm text-gray-600 dark:text-gray-400">Transferiu castanha para outro armazém?</Text>
				</View>
				<Controller
					control={control}
					name="hasTransferred"
					render={({ field: { onChange, value } }) => (
						<Switch
							value={value}
							onValueChange={(newValue: boolean) => {
								onChange(newValue)
								if (!newValue) {
									setValue('transfers', [])
									setCustomErrors({ ...customErrors, transferred: '', outgoing: '' })
									clearErrors('transfers')
									resetTransferredInfo()
								}
							}}
							thumbColor={value ? '#008000' : '#f4f3f4'}
							trackColor={{ false: '#767577', true: '#008000' }}
						/>
					)}
				/>
			</View>

			{hasTransferredValue && (
				<>
					{/* Selected Transfer Warehouses */}
					{transfersValue?.map((warehouse, index) => (
						<View key={warehouse.warehouse_id} className="mt-4 border-t border-gray-200 pt-4">
							<View className="flex-row justify-between items-start mb-2">
								<View className="flex-1 mr-2">
									<Text className="text-gray-600 dark:text-gray-400 text-[12px] font-semibold" numberOfLines={2}>
										{warehouse.warehouse_label}
									</Text>
									{warehouse.description && (
										<Text
											className="text-gray-600 dark:text-gray-400 text-[10px] italic"
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{warehouse.description}
										</Text>
									)}
								</View>
								<TouchableOpacity
									onPress={() => {
										const updatedTransfers = transfersValue.filter((_, i) => i !== index)
										setValue('transfers', updatedTransfers)
										removeWarehouse({ warehouse_id: warehouse.warehouse_id })
									}}
								>
									<Ionicons name="close-circle-outline" size={24} color="red" />
								</TouchableOpacity>
							</View>
							<View className="flex flex-row justify-between space-x-2 items-center mt-2">
								<View className="w-[80px]">
									<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Quantidade</Text>
								</View>
								<View className="flex-1">
									<Controller
										control={control}
										name={`transfers.${index}.quantity`}
										rules={{ required: 'Quantidade transferida é obrigatória' }}
										render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
											<>
												<View className="relative">
													<CustomTextInput
														label=""
														placeholder="Qtd. em kg"
														keyboardType="numeric"
														onChangeText={(text) => {
															const newQuantity = parseFloat(text) || 0
															onChange(newQuantity)
															updateWarehouseQuantity({ warehouse_id: warehouse.warehouse_id, quantity: newQuantity })
															setCustomErrors({ ...customErrors, transferred: '', outgoing: '' })
														}}
														value={value && value > 0 ? value.toString() : ''}
														onBlur={onBlur}
													/>
													<View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
														<Text className="text-gray-600 dark:text-gray-400 text-[14px]">Kg</Text>
													</View>
												</View>
												<Text className={`text-[12px] italic text-gray-500`}>Qtd. transferida</Text>
											</>
										)}
									/>
								</View>
							</View>
						</View>
					))}

					{/* Warehouse Selection */}
					<View className="mt-4">
						<Label label="Armazém de destino" />
						<CustomSelectItemTrigger
							selectedItem={'Seleccione o armazém de destino'}
							setShowItems={setShowWarehouse}
							hasSelectedItem={false}
							resetItem={() => {}}
						/>
						<CustomSelectItem
							label="Seleccione o armazém de destino"
							showModal={showWarehouse}
							setShowModal={setShowWarehouse}
							itemsList={traderWarehouses
								.filter((w) => !transfersValue?.some((tw) => tw.warehouse_id === w.id))
								.map((w) => ({
									label: `${translateWarehouseTypeToPortuguese(w.warehouse_type)}`,
									value: w.id,
									description: `${w.description}`,
								}))}
							setValue={(warehouseId) => {
								if (warehouseId) {
									const warehouse = traderWarehouses.find((w) => w.id === warehouseId)
									if (warehouse) {
										const newWarehouse = {
											warehouse_id: warehouse.id,
											warehouse_label: `${translateWarehouseTypeToPortuguese(warehouse.warehouse_type)}`,
											warehouse_type: warehouse.warehouse_type,
											quantity: 0,
											description: `${warehouse.description}`,
										}

										setValue('transfers', [...(transfersValue || []), newWarehouse])
									}
								}
							}}
						/>
						<Text className="text-gray-500 dark:text-gray-400 text-[12px] italic mb-2">Armazém de destino</Text>
					</View>
				</>
			)}
			{customErrors.transferred ? <Text className="text-xs text-red-500 mt-2">{customErrors.transferred}</Text> : null}
		</ScrollView>
	)
}
