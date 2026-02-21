import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Dialog } from 'react-native-simple-dialogs'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import { ScrollView } from 'react-native'
import { generate15DaySlots, getFormattedDate } from 'src/helpers/dates'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import { useActionStore } from 'src/store/actions/actions'

type Props = {
	visible: boolean
	setVisible: (v: boolean) => void
	selectedSlotIndex: number
	setSelectedSlotIndex: (v: number) => void
}

export default function DatesRange({ visible, setVisible, selectedSlotIndex, setSelectedSlotIndex }: Props) {
	const {setStartDate, setEndDate, setReloading} = useActionStore()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const slots = generate15DaySlots()
	return (
		<Dialog
			animationType={'slide'}
			statusBarTranslucent={true}
			titleStyle={{ color: 'red', fontSize: 20 }}
			visible={visible}
			dialogStyle={{
				backgroundColor: isDarkMode ? colors.gray800 : colors.white,
				height: '95%',
				width: '100%',
				borderRadius: 8,
			}}
			contentInsetAdjustmentBehavior={'automatic'}
			onRequestClose={() => {
				setVisible(false)
			}}
			onTouchOutside={() => {
				setVisible(false)
			}}
		>
			<View className="space-y-2">
				<Text className="text-black font-bold text-[15px] dark:text-white">Seleccione uma quinzena</Text>
			</View>
			<ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: 5 }} className="h-full"
				showsVerticalScrollIndicator={false}
			>
				{slots.map((slot, index) => {
					return (
						<View
							key={index}
							className="flex flex-row justify-between items-center py-2 border-b border-gray-300 dark:border-gray-500 space-x-3"
						>
							<TouchableOpacity
								onPress={() => {
									setSelectedSlotIndex(index)
									setStartDate(slot.start)
									setEndDate(slot.end)
									setTimeout(() => {
										setVisible(false)
										setReloading(true)
									}, 400)
								}}
							>
								{selectedSlotIndex === index ? (
									<Ionicons name="radio-button-on" size={24} color={colors.primary} />
								) : (
									<Ionicons name="radio-button-off" size={24} color={isDarkMode ? colors.white : colors.black} />
								)}
							</TouchableOpacity>
							<View className="flex-1">
								<Text className="text-black text-[14px] dark:text-white">
									{getFormattedDate(slot.start)} - {getFormattedDate(slot.end)}
								</Text>
							</View>
						</View>
					)
				})}
			</ScrollView>
			<View className="flex flex-row justify-between">
				<View></View>
				<TouchableOpacity
					activeOpacity={0.5}
					onPress={() => setVisible(false)}
					className="border border-[#008000] p-1 rounded-md bg-white dark:bg-gray-700 dark:border-white"
				>
					<Text className="text-[14px] text-[#008000] dark:text-white ">Fechar</Text>
				</TouchableOpacity>
			</View>
		</Dialog>
	)
}
