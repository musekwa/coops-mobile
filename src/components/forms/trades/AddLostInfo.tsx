import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { Switch } from 'react-native'
import { useLostInfoStore } from 'src/store/trades'

const TransactionSchema = z
	.object({
		hasLost: z.boolean(),
		lostQuantity: z.number().min(0, 'A quantidade deve ser maior ou igual a 0').optional(),
	})
	.refine(
		(data: any) => {
			if (data.hasLost && !data.lostQuantity) {
				return false
			}
			return true
		},
		{
			message: 'Indica a quantidade desperdiçada.',
			path: ['hasLost'],
		},
	)

type TransactionData = z.infer<typeof TransactionSchema> & {
	[key: `quantity_${string}`]: number | undefined
}

type LostInfoProps = {
	customErrors: Record<string, string>
	setCustomErrors: (customErrors: Record<string, string>) => void
}

export default function AddLostInfo({ customErrors, setCustomErrors }: LostInfoProps) {
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
			hasLost: false,
			lostQuantity: undefined,
		},
		resolver: zodResolver(TransactionSchema),
	})
	const { setQuantityLost, setHasLost, resetLostInfo } = useLostInfoStore()
	const hasLostValue = watch('hasLost')
	const lostQuantityValue = watch('lostQuantity')

	useEffect(() => {
		validateLostInfo()
	}, [hasLostValue, lostQuantityValue])

	const validateLostInfo = () => {
		const hasLost = getValues('hasLost')
		const lostQuantity = getValues('lostQuantity')
		setHasLost(hasLost)
		if (hasLost) {
			if (lostQuantity) {
				setQuantityLost(lostQuantity)
			}
		} else {
			setQuantityLost(0)
		}
	}

	return (
		<ScrollView className="border border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 my-3">
			<View className="flex-row items-center justify-between mb-4">
				<View className="flex-1">
					<Text className="text-sm text-gray-600 dark:text-gray-400">Teve desperdício de castanha?</Text>
				</View>
				<Controller
					control={control}
					name="hasLost"
					render={({ field: { onChange, value } }) => (
						<Switch
							value={value}
							onValueChange={(newValue: boolean) => {
								onChange(newValue)
								if (!newValue) {
									setValue('lostQuantity', undefined)
									setCustomErrors({ ...customErrors, lost: '', outgoing: '' })
									clearErrors(['lostQuantity', 'hasLost'])
									resetLostInfo()
								}
							}}
							thumbColor={value ? '#008000' : '#f4f3f4'}
							trackColor={{ false: '#767577', true: '#008000' }}
						/>
					)}
				/>
			</View>

			{/* Quantity Lost */}
			{hasLostValue && (
				<View className="flex flex-row justify-between space-x-2 items-center mt-4">
					<View className="w-[80px]">
						<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Quantidade desperdiçada</Text>
					</View>
					<View className="flex-1">
						<Controller
							control={control}
							name="lostQuantity"
							rules={{ required: 'Quantidade perdida é obrigatória' }}
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<>
									<View className="relative">
										<CustomTextInput
											label=""
											placeholder="Qtd. em kg"
											keyboardType="numeric"
											onChangeText={(text) => {
												onChange(parseFloat(text) || 0)
												setCustomErrors({ ...customErrors, lost: '', outgoing: '' })
												clearErrors('lostQuantity')
											}}
											value={value?.toString() || ''}
											onBlur={onBlur}
										/>
										<View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
											<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Kg</Text>
										</View>
									</View>
									<Text className={`text-xs italic text-gray-400`}>Qtd. desperdiçada</Text>
								</>
							)}
						/>
					</View>
				</View>
			)}

			{/* Combined error message for when hasLost is true but fields are empty */}
			{hasLostValue && customErrors.lost ? (
				<Text className="text-xs text-red-500 mt-2">{customErrors.lost}</Text>
			) : null}
		</ScrollView>
	)
}
