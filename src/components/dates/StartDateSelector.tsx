import React, { useEffect, useRef } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { useDateRangeStore } from 'src/store/trades'

interface StartDateSelectorProps {
	control: any
	lastTransactionEndDate: Date | null
	setValue: (name: string, value: Date, options?: any) => void
	getValues: () => { startDate: Date; endDate: Date }
}

export default function StartDateSelector({
	control,
	lastTransactionEndDate,
	setValue,
	getValues,
}: StartDateSelectorProps) {
	const { setStartDate } = useDateRangeStore()
	const lastStoreUpdateRef = useRef<Date | null>(null)

	// Initialize and sync start date with lastTransactionEndDate
	useEffect(() => {
		if (lastTransactionEndDate) {
			// Automatically set startDate to the day after lastTransactionEndDate
			const autoStartDate = new Date(lastTransactionEndDate.getTime() + 86400000)
			autoStartDate.setHours(0, 0, 0, 0)
			setValue('startDate', autoStartDate, { shouldValidate: false })
			
			// Update store if value changed
			if (!lastStoreUpdateRef.current || lastStoreUpdateRef.current.getTime() !== autoStartDate.getTime()) {
				setStartDate(autoStartDate)
				lastStoreUpdateRef.current = autoStartDate
			}
		} else {
			// Initialize to yesterday when there's no lastTransactionEndDate
			const initialStartDate = new Date()
			initialStartDate.setDate(initialStartDate.getDate() - 1)
			initialStartDate.setHours(0, 0, 0, 0)
			setValue('startDate', initialStartDate, { shouldValidate: false })
			
			// Update store if value changed
			if (!lastStoreUpdateRef.current || lastStoreUpdateRef.current.getTime() !== initialStartDate.getTime()) {
				setStartDate(initialStartDate)
				lastStoreUpdateRef.current = initialStartDate
			}
		}
	}, [lastTransactionEndDate, setValue, setStartDate])

	// Watch for start date changes and sync to store (only when user can select it)
	useEffect(() => {
		if (!lastTransactionEndDate) {
			const currentStartDate = getValues().startDate
			if (currentStartDate) {
				currentStartDate.setHours(0, 0, 0, 0)
				if (!lastStoreUpdateRef.current || lastStoreUpdateRef.current.getTime() !== currentStartDate.getTime()) {
					setStartDate(currentStartDate)
					lastStoreUpdateRef.current = currentStartDate
				}
			}
		}
	}, [getValues().startDate, lastTransactionEndDate, setStartDate])

	const showDatePicker = (currentValue: Date, minDate: Date, maxDate: Date) => {
		DateTimePickerAndroid.open({
			value: currentValue,
			onChange: (event: any, selectedDate?: Date) => {
				if (selectedDate) {
					let constrainedDate = selectedDate
					if (selectedDate < minDate) {
						constrainedDate = minDate
					} else if (selectedDate > maxDate) {
						constrainedDate = maxDate
					}
					setValue('startDate', constrainedDate)
				}
			},
			mode: 'date',
			is24Hour: true,
			minimumDate: minDate,
			maximumDate: maxDate,
			positiveButton: { label: 'OK', textColor: colors.primary },
			negativeButton: { label: 'Cancelar', textColor: colors.primary },
			locale: 'pt-BR',
		})
	}

	return (
		<View className="flex flex-row justify-between space-x-2 items-center mt-4">
			<View className="w-[80px]">
				<Text className="text-gray-600 dark:text-gray-400 text-[14px]">De</Text>
			</View>
			<View className="flex-1">
				<Controller
					control={control}
					name="startDate"
					render={({ field: { value }, fieldState: { error } }) => (
						<View className="relative">
							{lastTransactionEndDate ? (
								// Disabled view when lastTransactionEndDate exists
								<View className="border border-slate-300 p-3 shadow-sm shadow-black rounded-xl bg-gray-100 dark:bg-gray-800 h-[55px] flex justify-center opacity-60">
									<Text className="text-gray-600 dark:text-gray-400 text-[13px]">
										{value.toLocaleDateString('pt-BR')}
									</Text>
								</View>
							) : (
								// Pressable view when user can select start date
								<Pressable
									onPress={() => {
										const today = new Date()
										const oneMonthAgo = new Date(today.getTime())
										oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
										const maxDate = new Date(today.getTime())
										maxDate.setDate(maxDate.getDate() - 1) // Yesterday
										showDatePicker(value, oneMonthAgo, maxDate)
									}}
									className="border border-slate-300 p-3 shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-black h-[55px] flex justify-center"
								>
									<Text className="text-gray-600 dark:text-gray-400 text-[13px]">
										{value.toLocaleDateString('pt-BR')}
									</Text>
								</Pressable>
							)}
							{!lastTransactionEndDate && (
								<View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
									<Ionicons name="calendar-outline" size={24} color={colors.primary} />
								</View>
							)}
							{error && <Text className="text-red-500 text-[12px]">{error.message}</Text>}
						</View>
					)}
				/>
			</View>
		</View>
	)
}

