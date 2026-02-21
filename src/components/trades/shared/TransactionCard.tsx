import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import TransactionHeader from './TransactionHeader'
import TransactionInfoRow from './TransactionInfoRow'

interface TransactionCardProps {
	index: number
	quantity: number
	startDate: string
	endDate: string
	warehouseType: string
	description: string
	headerLabel: string
	locationLabel: string // "Destino" or "Proveniência"
	statusBadge?: {
		icon: keyof typeof Ionicons.glyphMap
		text: string
		iconColor: string
		textClassName: string
		bgClassName: string
	}
	children?: React.ReactNode // For additional content like confirmation buttons
}

export default function TransactionCard({
	index,
	quantity,
	startDate,
	endDate,
	warehouseType,
	description,
	headerLabel,
	locationLabel,
	statusBadge,
	children,
}: TransactionCardProps) {
	const formattedStartDate = Intl.DateTimeFormat('pt-BR').format(new Date(startDate))
	const formattedEndDate = Intl.DateTimeFormat('pt-BR').format(new Date(endDate))

	return (
		<View className="rounded-lg bg-white dark:bg-gray-800 my-3 p-2 shadow-sm border border-gray-200 dark:border-gray-700">
			{/* Header with Transaction Number and Quantity */}
			<TransactionHeader index={index} quantity={quantity} label={headerLabel} />

			{/* Divider */}
			<View className="border-b border-gray-200 dark:border-gray-700 my-3" />

			{/* Transaction Details */}
			<View className="space-y-3">
				{/* Period */}
				<TransactionInfoRow
					icon="calendar-outline"
					label="Período"
					value={`${formattedStartDate} - ${formattedEndDate}`}
				/>

				{/* Location/Destination */}
				<TransactionInfoRow
					icon="location-outline"
					label={locationLabel}
					value={`${warehouseType} de ${description}`}
					numberOfLines={2}
				/>
			</View>

			{/* Additional Content (e.g., confirmation buttons) */}
			{children && (
				<>
					<View className="border-b border-gray-200 dark:border-gray-700 my-3" />
					{children}
				</>
			)}

			{/* Status Badge */}
			{statusBadge && (
				<View className="flex-row justify-end items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
					<View className={`flex-row items-center space-x-2 px-3 py-1.5 rounded-full ${statusBadge.bgClassName}`}>
						<Ionicons name={statusBadge.icon} size={12} color={statusBadge.iconColor} />
						<Text className={`text-[10px] font-medium ${statusBadge.textClassName}`}>{statusBadge.text}</Text>
					</View>
				</View>
			)}
		</View>
	)
}

