import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { Switch } from 'react-native'
import { useResoldInfoStore } from 'src/store/trades'

const TransactionSchema = z
	.object({
		resoldPrice: z.number().min(0, 'O preço deve ser maior ou igual a 0').optional(),
		hasResold: z.boolean(),
		quantityResold: z.number().min(0, 'A quantidade deve ser maior ou igual a 0').optional(),
	})
	.refine(
		(data: any) => {
			if (data.hasResold && (!data.resoldPrice || !data.quantityResold)) {
				return false
			}
			return true
		},
		{
			message: 'Indica o preço e a quantidade revendida.',
			path: ['hasResold'],
		},
	)

type TransactionData = z.infer<typeof TransactionSchema> & {
	[key: `quantity_${string}`]: number | undefined
}

type ResoldInfoProps = {
	customErrors: Record<string, string>
	setCustomErrors: (customErrors: Record<string, string>) => void
}

export default function AddResoldInfo({ customErrors, setCustomErrors }: ResoldInfoProps) {
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
			resoldPrice: undefined,
			hasResold: false,
			quantityResold: undefined,
		},
		resolver: zodResolver(TransactionSchema),
	})

	const hasResoldValue = watch('hasResold')
	const quantityResoldValue = watch('quantityResold')
	const resoldPriceValue = watch('resoldPrice')

	const { setQuantityResold, setResoldPrice, setHasResold } = useResoldInfoStore()

	useEffect(() => {
		validateResoldInfo()
	}, [quantityResoldValue, resoldPriceValue, hasResoldValue])

	const validateResoldInfo = () => {
		const hasResold = getValues('hasResold')
		const quantityResold = getValues('quantityResold')
		const resoldPrice = getValues('resoldPrice')

		setHasResold(hasResold)
		if (hasResold) {
			if (quantityResold) {
				setQuantityResold(quantityResold)
			}
			if (resoldPrice) {
				setResoldPrice(resoldPrice)
			}
		} else {
			setQuantityResold(0)
			setResoldPrice(0)
		}
	}

	return (
		<ScrollView className="border border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 my-3">
			<View className="flex-row items-center justify-between mb-4">
				<View className="flex-1">
					<Text className="text-sm text-gray-600 dark:text-gray-400">Revendeu castanha?</Text>
				</View>
				<Controller
					control={control}
					name="hasResold"
					render={({ field: { onChange, value } }) => (
						<Switch
							value={value}
							onValueChange={(newValue: boolean) => {
								onChange(newValue)
								if (!newValue) {
									setValue('quantityResold', undefined)
									setValue('resoldPrice', undefined)
									setCustomErrors({ ...customErrors, resold: '', outgoing: '' })
									clearErrors(['quantityResold', 'resoldPrice'])
									setQuantityResold(0)
									setResoldPrice(0)
								}
							}}
							thumbColor={value ? '#008000' : '#f4f3f4'}
							trackColor={{ false: '#767577', true: '#008000' }}
						/>
					)}
				/>
			</View>

			{/* Quantity Resold */}
			{hasResoldValue && (
				<View className="flex flex-row justify-between space-x-2 items-center mt-4">
					<View className="w-[80px]">
						<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Quantidade revendida</Text>
					</View>
					<View className="flex-1">
						<Controller
							control={control}
							name="quantityResold"
							rules={{ required: 'Quantidade revendida é obrigatória' }}
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<>
									<View className="relative">
										<CustomTextInput
											label=""
											placeholder="Qtd. em kg"
											keyboardType="numeric"
											onChangeText={(text) => {
												onChange(parseFloat(text) || 0)
												setCustomErrors({ ...customErrors, resold: '', outgoing: '' })
											}}
											value={value?.toString() || ''}
											onBlur={onBlur}
										/>
										<View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
											<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Kg</Text>
										</View>
									</View>
									<Text className={`text-[12px] italic text-gray-400`}>Qtd. revendida</Text>
								</>
							)}
						/>
					</View>
				</View>
			)}

			{
				// if hasResold is true, ask the user to give the price by kg
				hasResoldValue && (
					<View className="flex flex-row justify-between space-x-2 items-center mt-4">
						<View className="w-[80px]">
							<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Preço de venda</Text>
						</View>
						<View className="flex-1">
							<Controller
								control={control}
								name="resoldPrice"
								rules={{ required: 'Preço de venda é obrigatório' }}
								render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
									<>
										<View className="relative">
											<CustomTextInput
												label=""
												placeholder="Preço por kg"
												keyboardType="numeric"
												onChangeText={(text) => {
													onChange(parseFloat(text) || '')
                                                    setCustomErrors({ ...customErrors, resold: '', outgoing: '' })
												}}
												value={value || ''}
												onBlur={onBlur}
											/>
											<View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
												<Text className="text-gray-600 dark:text-gray-400 text-[12px]">MZN / Kg</Text>
											</View>
										</View>

										<Text className={`text-xs italic text-gray-400`}>Preço de venda</Text>
									</>
								)}
							/>
						</View>
					</View>
				)
			}

			{/* Combined error message for when hasResold is true but fields are empty */}
			{hasResoldValue && customErrors.resold ? (
				<Text className="text-xs text-red-500 mt-2">{customErrors.resold}</Text>
			) : null}
		</ScrollView>
	)
}
