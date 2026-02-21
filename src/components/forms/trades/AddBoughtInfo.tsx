import React, { useState, useEffect } from 'react'
import { View, Text } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { Switch, ScrollView } from 'react-native'
import { useBoughtInfoStore } from 'src/store/trades'

const TransactionSchema = z
	.object({

		hasBought: z.boolean(),
		quantityBought: z.number().min(0, 'A quantidade deve ser maior ou igual a 0').optional(),
		boughtPrice: z.number().min(0, 'O preço deve ser maior ou igual a 0').optional(),
		
	})
	.refine(
		(data: any) => {
			if (
				data.hasBought &&
				!(data.quantityBought && data.boughtPrice)
				// !sellerTypes.some((seller) => data[`quantity_${seller.id}`] && data[`price_${seller.id}`])
			) {
				return false
			}
			return true
		},
		{
			message: 'Indica a quantidade comprada e o preço de compra.',
			path: ['hasBought'],
		},
	)

type TransactionData = z.infer<typeof TransactionSchema> & {
	[key: `quantity_${string}`]: number | undefined
}

type BoughtInfoProps = {
	customErrors: Record<string, string>
	setCustomErrors: (customErrors: Record<string, string>) => void
}

export default function AddBoughtInfo({ customErrors, setCustomErrors }: BoughtInfoProps) {
    const {
		control,
		handleSubmit,
		formState: { errors, isValid, isDirty, isSubmitting, isSubmitSuccessful, submitCount },
		reset,
		resetField,
		getValues,
		setValue, // set value of the form
		watch,
		setError,
		clearErrors,
	} = useForm<TransactionData>({
		defaultValues: {
			hasBought: false,
			quantityBought: undefined,
			boughtPrice: undefined,
		},
		resolver: zodResolver(TransactionSchema),
	})
	const { setQuantityBought, setBoughtPrice, setHasBought} = useBoughtInfoStore()
	const hasBoughtValue = watch('hasBought')
    const quantityBoughtValue = watch('quantityBought')
    const boughtPriceValue = watch('boughtPrice')

	useEffect(() => {
		validateBoughtInfo()
	}, [quantityBoughtValue, boughtPriceValue, hasBoughtValue])

	const validateBoughtInfo = () => {
		const hasBought = getValues('hasBought')
		const quantityBought = getValues('quantityBought')
		const boughtPrice = getValues('boughtPrice')
		if (hasBought) {
			setHasBought(hasBought)
			if (quantityBought) {
				setQuantityBought(quantityBought)
			}
			if (boughtPrice) {
				setBoughtPrice(boughtPrice)
			}
		}
		else {
			setHasBought(false)
			setQuantityBought(0)
			setBoughtPrice(0)
		}
	}

	return (
		<ScrollView className="border border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 my-3">
			<View className="flex-row items-center justify-between mb-4">
				<View className="flex-1">
					<Text className="text-sm text-gray-600 dark:text-gray-400">Comprou castanha?</Text>
				</View>
				<Controller
					control={control}
					name="hasBought"
					render={({ field: { onChange, value } }) => (
						<Switch
							value={value}
							onValueChange={(newValue: boolean) => {
								onChange(newValue)
								if (!newValue) {
									setValue('quantityBought', undefined)
									setValue('boughtPrice', undefined)
									setCustomErrors({ ...customErrors, bought: '', outgoing: '' })
									clearErrors(['quantityBought', 'boughtPrice'])
									setQuantityBought(0)
									setBoughtPrice(0)
								}
							}}
							thumbColor={value ? '#008000' : '#f4f3f4'}
							trackColor={{ false: '#767577', true: '#008000' }}
						/>
					)}
				/>
			</View>

			{/* Quantity Bought */}
			{hasBoughtValue && (
				<View className="flex flex-row justify-between space-x-2 items-center mt-4">
					<View className="w-[80px]">
						<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Quantidade comprada</Text>
					</View>
					<View className="flex-1">
						<Controller
							control={control}
							name="quantityBought"
							rules={{ required: 'Quantidade comprada é obrigatória' }}
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<>
									<View className="relative">
										<CustomTextInput
											label=""
											placeholder="Qtd. em kg"
											keyboardType="numeric"
											onChangeText={(text) => {
												onChange(parseFloat(text) || 0)
												setCustomErrors({ ...customErrors, bought: '', outgoing: '' })
												clearErrors('quantityBought')
											}}
											value={value?.toString() || ''}
											onBlur={onBlur}
										/>
										<View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
											<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Kg</Text>
										</View>
									</View>
									<Text className={`text-[12px] italic text-gray-400`}>Qtd. comprada</Text>
								</>
							)}
						/>
					</View>
				</View>
			)}

			{
				// if hasBought is true, ask the user to give the price by kg
				hasBoughtValue && (
					<View className="flex flex-row justify-between space-x-2 items-center mt-4">
						<View className="w-[80px]">
							<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Preço de compra</Text>
						</View>
						<View className="flex-1">
							<Controller
								control={control}
								name="boughtPrice"
								rules={{ required: 'Preço de compra é obrigatório' }}
								render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
									<>
										<View className="relative">
											<CustomTextInput
												label=""
												placeholder="Preço por kg"
												keyboardType="numeric"
												onChangeText={(text) => {
													onChange(parseFloat(text) || 0)
													setCustomErrors({ ...customErrors, bought: '', outgoing: '' })
													clearErrors('boughtPrice')
												}}
												value={value?.toString() || ''}
												onBlur={onBlur}
											/>
											<View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
												<Text className="text-gray-600 dark:text-gray-400 text-[12px]">MZN / Kg</Text>
											</View>
										</View>
										<Text className={`text-[12px] italic text-gray-400`}>Preço de compra</Text>
									</>
								)}
							/>
						</View>
					</View>
				)
			}
	
			{/* Combined error message for when hasBought is true but fields are empty */}
			{hasBoughtValue && customErrors.bought ? (
				<Text className="text-xs text-red-500 mt-2">{customErrors.bought}</Text>
			) : null}
		</ScrollView>
	)
}
