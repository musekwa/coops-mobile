import React, { useState } from 'react'
import { Pressable } from 'react-native'
import { View, Text } from 'react-native'
import { DatePickerModal } from 'react-native-paper-dates'
import { colors } from 'src/constants'
// import Nylas from '@nylas/nylas-js';

// Initialize Nylas client (you should do this in a more appropriate place, like app initialization)
// const nylas = Nylas.with('YOUR_ACCESS_TOKEN');

export default function ScheduleMonitoring() {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
	const [selectedTime, setSelectedTime] = useState<Date | undefined>(new Date())
	const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)
	const [isTimePickerVisible, setIsTimePickerVisible] = useState(false)

	const handleSchedule = async () => {
		try {
			//   const event = await nylas.events.create({
			//     title: 'Warehouse Visit',
			//     description: 'Scheduled visit to the warehouse',
			//     start: selectedDate.toISOString(),
			// 			end: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
			// 			// Add more details as needed
			// 		});
			console.log('Event scheduled:', selectedDate)
			// Handle successful scheduling (e.g., show confirmation, navigate back)
		} catch (error) {
			console.error('Error scheduling event:', error)
			// Handle error (e.g., show error message)
		}
	}

	// set the start date
	const onChangeDate = (params: any) => {
		const newDate = params.date || selectedDate
		setSelectedDate(newDate)
		setIsDatePickerVisible(false)
	}

	// set the time
	const onChangeTime = (params: any) => {
		const newTime = params.date || selectedTime
		setSelectedTime(newTime)
		setIsTimePickerVisible(false)
	}

	return (
		<View className="flex-1 justify-center items-center p-3">
			<Text className="text-[14px] font-bold">Agendar Visita de Monitoria</Text>
			<Pressable
				onPress={() => setIsDatePickerVisible(true)}
				className="border border-slate-300 p-3 shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-black h-[55px] flex justify-center"
			>
				<Text className="text-gray-600 dark:text-gray-400 text-[13px]">Agendar Visita de Monitoria</Text>
				<Text className="text-gray-600 dark:text-gray-400 text-[13px]">
					{selectedDate?.toLocaleDateString('pt-BR')}
				</Text>
			</Pressable>
			<Pressable
				onPress={() => setIsTimePickerVisible(true)}
				className="border border-slate-300 p-3 shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-black h-[55px] flex justify-center"
			>
				<Text className="text-gray-600 dark:text-gray-400 text-[13px]">Agendar Visita de Monitoria</Text>
				<Text className="text-gray-600 dark:text-gray-400 text-[13px]">
					{selectedTime?.toLocaleTimeString('pt-BR')}
				</Text>
			</Pressable>

			{/* Date Picker Modal */}
			<DatePickerModal
				locale="pt"
				mode="single"
				visible={isDatePickerVisible}
				onDismiss={() => setIsDatePickerVisible(false)}
				date={selectedDate}
				onConfirm={onChangeDate}
				label="Selecionar Data"
				startYear={new Date().getFullYear()}
				endYear={new Date().getFullYear() + 1}
				presentationStyle="pageSheet"
			/>

			{/* Time Picker Modal */}
			<DatePickerModal
				locale="pt"
				mode="single"
				visible={isTimePickerVisible}
				onDismiss={() => setIsTimePickerVisible(false)}
				date={selectedTime}
				onConfirm={onChangeTime}
				label="Selecionar Hora"
				startYear={new Date().getFullYear()}
				endYear={new Date().getFullYear() + 1}
				presentationStyle="pageSheet"
			/>
		</View>
	)
}
