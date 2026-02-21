import { View, Text } from 'react-native'
import React from 'react'
import { PolarChart, Pie } from 'victory-native'
import { PieChartData } from 'src/types'

interface TransactionsPieChartProps {
	pieChartData: PieChartData[]
	innerRadius?: number
	height?: number
}

export default function TransactionsPieChart({
	pieChartData,
	innerRadius = 5,
	height = 200,
}: TransactionsPieChartProps) {
	return (
		<View className="flex-col">
			<View className="h-[200px]">
				<PolarChart data={pieChartData} colorKey="color" labelKey="label" valueKey="value">
					<Pie.Chart innerRadius={innerRadius} />
				</PolarChart>
			</View>

			<View className="p-4">
				{pieChartData.map((item, index) => (
					<View key={index} className="flex-row justify-between items-center mb-2">
						<View className="flex-row items-center">
							<View style={{ backgroundColor: item.color }} className="w-4 h-4 mr-2" />
							<Text className="text-gray-900 dark:text-gray-100">{item.label}</Text>
						</View>
						<Text className="text-gray-900 dark:text-gray-100">
							{Intl.NumberFormat('pt-BR').format(item.value)}{' '}
							<Text style={{ color: item.color }} className="text-[14px]">
								{' '}
								kg
							</Text>
						</Text>
					</View>
				))}
			</View>
		</View>
	)
}
