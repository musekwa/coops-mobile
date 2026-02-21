import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface TransactionInfoRowProps {
	icon: keyof typeof Ionicons.glyphMap
	label: string
	value: string
	numberOfLines?: number
}

export default function TransactionInfoRow({
	icon,
	label,
	value,
	numberOfLines = 2,
}: TransactionInfoRowProps) {
	return (
		<View className="flex-row items-start space-x-3">
			<Ionicons name={icon} size={16} color="#6B7280" style={{ marginTop: 2 }} />
			<View className="flex-1">
				<Text className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">{label}</Text>
				<Text
					className="text-[12px] font-medium text-gray-800 dark:text-gray-200"
					numberOfLines={numberOfLines}
				>
					{value}
				</Text>
			</View>
		</View>
	)
}

