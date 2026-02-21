import { View, Text } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { UserData } from 'src/types'

interface ContactInfoProps {
	userData: UserData
}

export default function ContactInfo({ userData }: ContactInfoProps) {
	return (
		<View className="border-b border-gray-200 dark:border-gray-700 space-y-2 py-4">
			<Text className="text-[14px] font-semibold mb-2 text-black dark:text-white">Informações de Contacto</Text>
			<View className="flex-row items-center space-x-2">
				<Feather name="mail" size={15} color={colors.gray600} />
				<Text className="text-[12px] text-gray-600 dark:text-gray-400">{userData.email}</Text>
			</View>
			<View className="flex-row items-center space-x-2">
				<Feather name="phone" size={15} color={colors.gray600} />
				<Text className="text-[12px] text-gray-600 dark:text-gray-400">{userData.phone}</Text>
			</View>
			<View className="flex-row items-center space-x-2">
				<Feather name="map-pin" size={15} color={colors.gray600} />
				<Text className="text-[12px] text-gray-600 dark:text-gray-400">{userData.district}</Text>
			</View>
		</View>
	)
}
