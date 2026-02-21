
import { View, Text } from 'react-native'
import React from 'react'

interface CurrentStockProps {
	currentStock: number
	label: string
}

export default function CurrentStock({ currentStock, label = "Estoque Disponível" }: CurrentStockProps) {
	return (
		<View className=" flex flex-row justify-between bg-green-100 dark:bg-green-900 rounded-lg p-2">
			<Text className="text-[14px] font-semibold text-green-800 dark:text-green-200 mb-2">{label}</Text>
			<Text className="text-[18px] font-bold text-green-600 dark:text-green-400">
				{Intl.NumberFormat('pt-BR', { style: 'decimal', maximumFractionDigits: 2 }).format(currentStock)} kg
			</Text>
		</View>
	)
}
