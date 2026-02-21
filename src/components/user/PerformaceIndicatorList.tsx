import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import PerformanceIndicatorItem from './PerformanceIndicatorItem'
import { MetricName, UserRoles } from 'src/types'
import {
	getPerformanceIndicatorsPlaceholdersByRole,
} from 'src/helpers/helpersToUser'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { monthNames } from 'src/helpers/dates'

interface PerformaceIndicatorListProps {
	userPerformance: any[]
	userRole: UserRoles
}

const REGISTRATION_METRICS = [
	MetricName.FARMERS_REGISTERED,
	MetricName.TRADERS_REGISTERED,
	MetricName.ASSOCIATIONS_REGISTERED,
	MetricName.COOPERATIVES_REGISTERED,
	MetricName.COOP_UNIONS_REGISTERED,
	MetricName.WAREHOUSES_REGISTERED,
	MetricName.BUYING_POSTS_REGISTERED,
] as MetricName[];

const MONITORING_METRICS = [
	MetricName.TRANSITING_CASHEWS_INSPECTED,
	MetricName.MONITORING_TO_BUYING_POSTS,
	MetricName.MONITORING_TO_WAREHOUSES,
	MetricName.MONITORING_TO_ASSOCIATIONS,
	MetricName.MONITORING_TO_COOPERATIVES,
	MetricName.MONITORING_TO_COOP_UNIONS,
] as MetricName[];

const CollapsibleMetricBlock = ({ 
	metrics, 
	title, 
	periodIndex 
}: { 
	metrics: any[], 
	title: string, 
	periodIndex: number 
}) => {
	const [isExpanded, setIsExpanded] = useState(false)

	return (
		<View className="space-y-3">
			{/* Header */}
			<Pressable 
				onPress={() => setIsExpanded(!isExpanded)}
				className={`flex-row justify-between items-center h-[55px] px-4 rounded-md my-2 border border-gray-200 dark:border-gray-700 ${
					isExpanded ? 'bg-[#008000]' : 'bg-white dark:bg-gray-800'
				}`}
			>
				<Text className={`text-[13px] font-medium ${
					isExpanded ? 'text-white' : 'text-gray-600 dark:text-gray-400'
				}`}>
					{title}
				</Text>
				<Ionicons 
					name={isExpanded ? "chevron-up" : "chevron-down"} 
					size={20} 
					color={isExpanded ? '#ffffff' : '#008000'} 
				/>
			</Pressable>

			{/* Content */}
			{isExpanded && (
				<View className="flex-row flex-wrap justify-between px-2">
					{metrics.map((metric, metricIndex) => (
						<PerformanceIndicatorItem 
							key={`${periodIndex}-${metricIndex}`} 
							item={metric} 
						/>
					))}
				</View>
			)}
		</View>
	)
}

export default function PerformaceIndicatorList({ userPerformance, userRole }: PerformaceIndicatorListProps) {
	const performanceIndicatorsPlaceholders = getPerformanceIndicatorsPlaceholdersByRole(userRole)

	return (
		<View className="space-y-4 py-4">
			<Text className="text-[14px] font-semibold mb-2 text-black dark:text-white">
				Indicadores de Desempenho
			</Text>

			{userPerformance.length > 0 ? userPerformance.map((period, periodIndex) => (
				<View key={periodIndex} className="space-y-3">
					{/* Date Range Header */}
					<View className="flex flex-row space-x-3 items-center">
						<Ionicons name="calendar-outline" size={15} color={colors.primary} />
						<Text className="text-[12px] font-semibold text-[#008000]">
							{monthNames[new Date(period.startDate).getMonth()]}{" "}{new Date(period.startDate).getFullYear()}
							{' - '}
							{monthNames[new Date(period.endDate).getMonth()]}{" "}{new Date(period.endDate).getFullYear()}
						</Text>
					</View>

					{/* Registration Metrics */}
					<CollapsibleMetricBlock
						metrics={performanceIndicatorsPlaceholders
							.filter(metric => REGISTRATION_METRICS.includes(metric.name as MetricName))
							.map(metric => {
								const found = period.metrics.find((m: any) => m.name === metric.name)
								return found || metric as any
							})}
						title="Desempenho de Registos"
						periodIndex={periodIndex}
					/>

					{/* Monitoring Metrics */}
					<CollapsibleMetricBlock
						metrics={performanceIndicatorsPlaceholders
							.filter(metric => MONITORING_METRICS.includes(metric.name as MetricName))
							.map(metric => {
								const found = period.metrics.find((m: any) => m.name === metric.name)
								return found || metric as any
							})}
						title="Desempenho de Monitorias"
						periodIndex={periodIndex}
					/>

					{/* Separator if not last item */}
					{/* {periodIndex < userPerformance.length - 1 && (
						<View className="h-[1px] bg-gray-200 dark:bg-gray-700 my-2" />
					)} */}
				</View>
			)) : (
				<View className="space-y-4">
					{/* Date Range Header */}
					<View className="flex flex-row space-x-3 items-center">
						<Ionicons name="calendar-outline" size={15} color={colors.gray600} />
						<Text className="text-[12px] font-semibold text-gray-600 dark:text-gray-400">
							{monthNames[new Date().getMonth()]}{" "}{new Date().getFullYear()}
							{' - '}
							{monthNames[new Date().getMonth()]}{" "}{new Date().getFullYear() + 1}
						</Text>
					</View>

					{/* Empty state blocks */}
					<CollapsibleMetricBlock
						metrics={performanceIndicatorsPlaceholders.filter(
							metric => REGISTRATION_METRICS.includes(metric.name as MetricName)
						)}
						title="Desempenho de Registos"
						periodIndex={0}
					/>
					<CollapsibleMetricBlock
						metrics={performanceIndicatorsPlaceholders.filter(
							metric => MONITORING_METRICS.includes(metric.name as MetricName)
						)}
						title="Desempenho de Monitorias"
						periodIndex={0}
					/>
				</View>
			)}
		</View>
	)
}
