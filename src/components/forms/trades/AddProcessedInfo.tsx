import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { Ionicons } from '@expo/vector-icons'
import { Switch } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useQueryMany } from 'src/hooks/queries'
import { CashewFactoryType } from 'src/types'
import { useProcessingInfoStore } from 'src/store/trades'
import CustomSelectItem from 'src/components/ui/custom-select-item'
import Label from '../Label'
import CustomSelectItemTrigger from 'src/components/ui/custom-select-item-trigger'
import { translateWarehouseTypeToPortuguese } from 'src/helpers/helpersToTrades'

const ProcessingSchema = z
	.object({
		hasSentToProcessing: z.boolean(),
		processings: z
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
			if (data.hasSentToProcessing && !data.processings) {
				return false
			}
			return true
		},
		{
			message: 'Indica a quantidade enviada para processamento.',
			path: ['hasSentToProcessing'],
		},
	)

type ProcessingData = z.infer<typeof ProcessingSchema>

type ProcessedInfoProps = {
	customErrors: Record<string, string>
	setCustomErrors: (customErrors: Record<string, string>) => void
}

export default function AddProcessedInfo({ customErrors, setCustomErrors }: ProcessedInfoProps) {
	// Add query for processing warehouses
	const {
		data: processingWarehouses,
		isLoading: isProcessingWarehousesLoading,
		error: processingWarehousesError,
		isError: isProcessingWarehousesError,
	} = useQueryMany<{
		id: string
		warehouse_type: string
		description: string
		owner_id: string
		address_id: string
		surname: string
		other_names: string
		name: string
	}>(
		`SELECT 
			wd.id, 
			wd.type as warehouse_type, 
			wd.description, 
			wd.owner_id, 
			ad.id as address_id, 
			wd.name, 
			t.surname, 
			t.other_names
	FROM ${TABLES.WAREHOUSE_DETAILS} wd 
	LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
	JOIN ${TABLES.ACTOR_DETAILS} t ON t.actor_id = wd.owner_id
		WHERE wd.type IN ('${CashewFactoryType.SMALL_SCALE}', '${CashewFactoryType.LARGE_SCALE}') 
		AND wd.is_active = 'true'`,
	)

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
	} = useForm<ProcessingData>({
		defaultValues: {
			hasSentToProcessing: false,
			processings: [],
		},
		resolver: zodResolver(ProcessingSchema),
	})

	const [showProcessingWarehouse, setShowProcessingWarehouse] = useState(false)

	const hasSentToProcessingValue = watch('hasSentToProcessing')
	const processingsValue = watch('processings')

	const { setProcessingInfo, resetProcessingInfo, updateWarehouseQuantity, removeWarehouse, setHasSentToProcessing } =
		useProcessingInfoStore()

	useEffect(() => {
		validateProcessingInfo()
	}, [hasSentToProcessingValue, processingsValue])

	const validateProcessingInfo = () => {
		const hasSentToProcessing = getValues('hasSentToProcessing')
		const processings = getValues('processings')
		setHasSentToProcessing(hasSentToProcessing)
		if (hasSentToProcessing) {
			if (processings && processings.length > 0 && processings.every((w) => w.warehouse_id && w.warehouse_type)) {
				setProcessingInfo({
					hasSentToProcessing: true,
					processingWarehouses: processings.map((w) => ({
						warehouse_id: w.warehouse_id,
						warehouse_label: w.warehouse_label,
						warehouse_type: w.warehouse_type,
						quantity: w.quantity || 0,
						description: w.description || '',
					})),
				})
				setCustomErrors({ ...customErrors, processed: '', outgoing: '' })
			}
		}
	}

	return (
		<ScrollView className="border border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 my-3">
			<View className="flex-row items-center justify-between mb-4">
				<View className="flex-1">
					<Text className="text-sm text-gray-600 dark:text-gray-400">Enviou castanha para processamento?</Text>
				</View>

				<Controller
					control={control}
					name="hasSentToProcessing"
					render={({ field: { onChange, value } }) => (
						<Switch
							value={value}
							onValueChange={(newValue: boolean) => {
								onChange(newValue)
								if (!newValue) {
									resetProcessingInfo()
									setCustomErrors({ ...customErrors, processed: '', outgoing: '' })
									setValue('processings', [])
									clearErrors('processings')
								}
							}}
							thumbColor={value ? '#008000' : '#f4f3f4'}
							trackColor={{ false: '#767577', true: '#008000' }}
						/>
					)}
				/>
			</View>

			{hasSentToProcessingValue && (
				<>
					{/* Selected Processing Warehouses */}
					{processingsValue?.map((warehouse, index) => (
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
										const updatedProcessings = processingsValue.filter((_, i) => i !== index)
										setValue('processings', updatedProcessings)
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
										name={`processings.${index}.quantity`}
										rules={{ required: 'Quantidade enviada é obrigatória' }}
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
															setCustomErrors({ ...customErrors, processed: '', outgoing: '' })
														}}
														value={value && value > 0 ? value.toString() : ''}
														onBlur={onBlur}
													/>
													<View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
														<Text className="text-gray-600 dark:text-gray-400 text-[14px]">Kg</Text>
													</View>
												</View>

												<Text className={`text-[12px] italic text-gray-500`}>Qtd. enviada</Text>
											</>
										)}
									/>
								</View>
							</View>
						</View>
					))}

					{/* Processing Warehouse Selection */}
					<View className="mt-4">
						<Label label="Unidade de Processamento" />
						<CustomSelectItemTrigger
							selectedItem={'Seleccione a unidade de processamento'}
							setShowItems={setShowProcessingWarehouse}
							hasSelectedItem={false}
							resetItem={() => {}}
						/>
						<CustomSelectItem
							label="Seleccione a unidade de processamento"
							showModal={showProcessingWarehouse}
							setShowModal={setShowProcessingWarehouse}
							itemsList={processingWarehouses
								.filter((w) => !processingsValue?.some((pw) => pw.warehouse_id === w.id))
								.map((w) => ({
									label: `${translateWarehouseTypeToPortuguese(w.warehouse_type)}`,
									value: w.id,
									description: `${w.description}`,
								}))}
							setValue={(warehouseId) => {
								if (warehouseId) {
									const warehouse = processingWarehouses.find((w) => w.id === warehouseId)
									if (warehouse) {
										const newWarehouse = {
											warehouse_id: warehouse.id,
											warehouse_label: `${translateWarehouseTypeToPortuguese(warehouse.warehouse_type)}`,
											warehouse_type: warehouse.warehouse_type,
											quantity: 0,
											description: `${warehouse.name}`,
										}

										setValue('processings', [...(processingsValue || []), newWarehouse])
										setProcessingInfo({
											hasSentToProcessing: true,
											processingWarehouses: [...(processingsValue || []), newWarehouse],
										})
									}
								}
							}}
						/>
						<Text className="text-gray-500 dark:text-gray-400 text-[12px] italic mb-2">Unidade de processamento</Text>
					</View>
				</>
			)}

			{hasSentToProcessingValue && customErrors.processed ? (
				<Text className="text-xs text-red-500 mt-2">{customErrors.processed}</Text>
			) : null}
		</ScrollView>
	)
}
