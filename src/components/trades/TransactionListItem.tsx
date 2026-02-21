import { View, Text } from 'react-native'
import React from 'react'
import { TransactionFlowType } from 'src/types'
import { translateTransactionFlowToPortuguese } from 'src/helpers/helpersToTrades'
import {
	CashewWarehouseTransactionRecord,
	OrganizationTransactionRecord,
} from 'src/library/powersync/schemas/AppSchema'
import { Ionicons } from '@expo/vector-icons'
import { formatDate } from 'src/helpers/dates'

type TransactionListItemProps = {
	item: CashewWarehouseTransactionRecord | OrganizationTransactionRecord
}

export default function TransactionListItem({ item }: TransactionListItemProps) {
	// get the transaction flow color
	const getFlowColor = (flow: string) => {
		switch (flow) {
			case String(TransactionFlowType.SOLD):
			case String(TransactionFlowType.TRANSFERRED_OUT):
			case String(TransactionFlowType.EXPORTED):
			case String(TransactionFlowType.PROCESSED):
				return {
					container: 'bg-blue-100 dark:bg-blue-800',
					text: 'text-blue-800 dark:text-blue-100',
					icon: 'text-blue-600 dark:text-blue-300',
				}
			case String(TransactionFlowType.TRANSFERRED_IN):
			case String(TransactionFlowType.BOUGHT):
			case String(TransactionFlowType.AGGREGATED):
				return {
					container: 'bg-green-100 dark:bg-green-800',
					text: 'text-green-800 dark:text-green-100',
					icon: 'text-green-600 dark:text-green-300',
				}
			case String(TransactionFlowType.LOST):
				return {
					container: 'bg-red-100 dark:bg-red-800',
					text: 'text-red-800 dark:text-red-100',
					icon: 'text-red-600 dark:text-red-300',
				}
			default:
				return {
					container: 'bg-gray-100 dark:bg-gray-800',
					text: 'text-gray-800 dark:text-gray-100',
					icon: 'text-gray-600 dark:text-gray-300',
				}
		}
	}

	const colors = getFlowColor(item.transaction_type!)

	const formatUnitPrice = (price: number | null | undefined) => {
		if (price === null || price === undefined || price <= 0) return '-'
		return `${Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)}`
	}

	return (
		<View className="flex-row border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
			{/* Transaccao Column */}
			<View className="flex-1 p-2 border-r border-gray-200 dark:border-gray-700">
				<View className={`rounded-full px-2 py-1 self-start ${colors.container}`}>
					<Text className={`font-semibold text-[10px] ${colors.text}`}>
						{translateTransactionFlowToPortuguese(item.transaction_type! as TransactionFlowType)}
					</Text>
				</View>
			</View>

			{/* Quantidade (Kg) Column */}
			<View className="flex-1 p-2 border-r border-gray-200 dark:border-gray-700 items-center justify-center">
				<Text className="text-[10px] font-semibold text-gray-800 dark:text-white text-center">
					{Intl.NumberFormat('pt-BR').format(item.quantity || 0)}
				</Text>
			</View>

			{/* Preco (MZN) Column */}
			<View className="flex-1 p-2 items-center justify-center">
				<Text className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center">
					{formatUnitPrice(item.unit_price)}
				</Text>
			</View>
		</View>
	)
}
