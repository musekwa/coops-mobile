import { View, Text } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { useColorScheme } from 'nativewind'

export default function ReportEmptyStateMessage({ message }: { message: string  }) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	return (
		<View className="ml-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
			<View className="flex-row items-center justify-center">
				<Ionicons name="information-circle-outline" size={16} color={isDarkMode ? colors.gray600 : colors.lightblack} />
				<Text className="text-[12px] text-gray-500 dark:text-gray-400 ml-2">{message}</Text>
			</View>
		</View>
	)
}
