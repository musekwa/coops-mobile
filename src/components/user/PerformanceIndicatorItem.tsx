import { View, Text } from 'react-native'
import React from 'react'
import { MetricName, } from 'src/types'
import { translateMetricName } from 'src/helpers/helpersToUser'
import { Metric } from 'src/models/embeddable'

interface PerformanceIndicatorItemProps {
	item: Metric
}

export default function PerformanceIndicatorItem({ item }: PerformanceIndicatorItemProps) {
	return (
		<View className="w-[30%] bg-gray-50 dark:bg-gray-800 border border-slate-300 shadow-sm shadow-black rounded-lg p-1 m-1">
			<View className=" ">
				<Text className="text-center text-[12px] font-semibold text-gray-600 dark:text-gray-400">{item.value}</Text>
				<Text className="text-center text-[8px] text-gray-600 dark:text-gray-400">{translateMetricName(item.name as MetricName)}</Text>
			</View>
		</View>
	)
}
