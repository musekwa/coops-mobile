import React, { useEffect, useRef } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Controller, Control, UseFormSetValue, UseFormGetValues, UseFormClearErrors } from 'react-hook-form'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { useDateRangeStore } from 'src/store/trades'

type DateRangeData = {
	startDate: Date
	endDate: Date
}

interface TransactionEndDateProps {
	control: Control<DateRangeData>
	lastTransactionEndDate: Date | null
	startDate: Date
	setValue: UseFormSetValue<DateRangeData>
	getValues: UseFormGetValues<DateRangeData>
	setCustomErrors: (errors: Record<string, string>) => void
	customErrors: Record<string, string>
	clearErrors: UseFormClearErrors<DateRangeData>
}

export default function TransactionEndDate({
	control,
	lastTransactionEndDate,
	startDate,
	setValue,
	getValues,
	setCustomErrors,
	customErrors,
	clearErrors,
}: TransactionEndDateProps) {
	const { setEndDate } = useDateRangeStore()
	const lastStoreUpdateRef = useRef<Date | null>(null)

	// Initialize end date to today
	useEffect(() => {
		const currentEndDate = getValues().endDate
		if (!currentEndDate) {
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			setValue('endDate', today, { shouldValidate: false })

			if (!lastStoreUpdateRef.current || lastStoreUpdateRef.current.getTime() !== today.getTime()) {
				setEndDate(today)
				lastStoreUpdateRef.current = today
			}
		}
	}, [setValue, getValues, setEndDate])

	// Watch for end date changes and sync to store
	useEffect(() => {
		const currentEndDate = getValues().endDate
		if (currentEndDate) {
			const normalizedDate = new Date(currentEndDate.getTime())
			normalizedDate.setHours(0, 0, 0, 0)

			// Calculate minimum valid end date (startDate + 1 day)
			const actualStartDate = lastTransactionEndDate ? new Date(lastTransactionEndDate.getTime() + 86400000) : startDate
			actualStartDate.setHours(0, 0, 0, 0)
			const minEndDate = new Date(actualStartDate.getTime() + 86400000)
			minEndDate.setHours(0, 0, 0, 0)

			// Auto-adjust if end date is invalid
			if (normalizedDate <= actualStartDate) {
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				const adjustedEndDate = minEndDate > today ? today : minEndDate

				setValue('endDate', adjustedEndDate, { shouldValidate: false })
				if (!lastStoreUpdateRef.current || lastStoreUpdateRef.current.getTime() !== adjustedEndDate.getTime()) {
					setEndDate(adjustedEndDate)
					lastStoreUpdateRef.current = adjustedEndDate
				}
				return
			}

			// Update store if value changed
			if (!lastStoreUpdateRef.current || lastStoreUpdateRef.current.getTime() !== normalizedDate.getTime()) {
				setEndDate(normalizedDate)
				lastStoreUpdateRef.current = normalizedDate
			}
		}
	}, [getValues().endDate, startDate, lastTransactionEndDate, setValue, setEndDate])

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
					setValue('endDate', constrainedDate)
					setCustomErrors({ ...customErrors, dateRange: '', outgoing: '', dateMismatch: '' })
					clearErrors('endDate')
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
				<Text className="text-gray-600 dark:text-gray-400 text-[14px]">Até</Text>
			</View>
			<View className="flex-1">
				<Controller
					control={control}
					name="endDate"
					render={({ field: { value }, fieldState: { error } }) => {
						// Calculate minimum date: startDate + 1 day (or lastTransactionEndDate + 1 day if that's later)
						const actualStartDate = lastTransactionEndDate
							? new Date(lastTransactionEndDate.getTime() + 86400000)
							: startDate
						const today = new Date()
						const minDate = new Date(actualStartDate.getTime() + 86400000)
						const maxDate = today

						return (
							<View className="relative">
								<Pressable
									onPress={() => {
										showDatePicker(value, minDate, maxDate)
									}}
									className="border border-slate-300 p-3 shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-black h-[55px] flex justify-center"
								>
									<Text className="text-gray-600 dark:text-gray-400 text-[13px]">
										{value.toLocaleDateString('pt-BR')}
									</Text>
								</Pressable>
								<View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
									<Ionicons name="calendar-outline" size={24} color={colors.primary} />
								</View>
								{error && <Text className="text-red-500 text-[12px]">{error.message}</Text>}
							</View>
						)
					}}
				/>
			</View>
		</View>
	)
}
