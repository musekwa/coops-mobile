import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Pressable } from 'react-native'
import { DatePickerModal } from 'react-native-paper-dates'
import { colors } from 'src/constants'
import { Ionicons } from '@expo/vector-icons'

interface CustomDatePickerProps {
	dateValue: Date
	setDateValue: (date: Date) => void
	minimumDate?: Date
	maximumDate?: Date
}

export default function CustomDatePicker({ dateValue, setDateValue, minimumDate, maximumDate }: CustomDatePickerProps) {
	const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)

	// set the start date
	const onChangeDate = (params: any) => {
		const newDate = params.date || dateValue
		setDateValue(newDate)
		setIsDatePickerVisible(false)
	}

	return (
		<View className="relative">
			<Pressable
				onPress={() => setIsDatePickerVisible(true)}
				className="border border-slate-300 p-3 shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-black  flex justify-center"
			>
				<Text className="text-gray-600 dark:text-gray-400 text-[13px]">{dateValue.toLocaleDateString('pt-BR')}</Text>
			</Pressable>
			<View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
				<Ionicons name="calendar-outline" size={24} color={colors.primary} />
			</View>

			{/* Date Picker Modal */}
			<DatePickerModal
				locale="pt"
				mode="single"
				visible={isDatePickerVisible}
				onDismiss={() => setIsDatePickerVisible(false)}
				date={dateValue}
				onConfirm={onChangeDate}
				label="Selecionar Data"
				startYear={new Date().getFullYear() - 100}
				endYear={new Date().getFullYear() + 10}
				presentationStyle="pageSheet"
			/>
		</View>
	)
}
