import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import TransactionListItem from './TransactionListItem'
import { OrganizationTransactionRecord } from 'src/library/powersync/schemas/AppSchema'
import EmptyPlaceholder from '../not-found/EmptyPlaceholder'
import { Ionicons } from '@expo/vector-icons'
import { formatDate } from 'src/helpers/dates'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { colors } from 'src/constants'

interface TransactionListProps {
	transactions: OrganizationTransactionRecord[]
}

export default function OrganizationTransactionList({ transactions }: TransactionListProps) {
	// State to track expanded accordions
	const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

	// Group transactions by date
	const groupedTransactions = transactions.reduce(
		(groups, transaction) => {
			let date
			try {
				const timestamp = transaction.created_at ? new Date(transaction.created_at) : new Date()
				if (isNaN(timestamp.getTime())) {
					date = 'Data inválida'
				} else {
					date = Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(timestamp)
				}
			} catch (error) {
				console.log('error', error)
				date = 'Data inválida'
			}

			if (!groups[date]) {
				groups[date] = []
			}
			groups[date].push(transaction)
			return groups
		},
		{} as Record<string, OrganizationTransactionRecord[]>,
	)

	// Convert grouped transactions to an array
	const groupedTransactionsArray = Object.entries(groupedTransactions)

	// Toggle accordion
	const toggleAccordion = (dateKey: string) => {
		setExpandedItems((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(dateKey)) {
				newSet.delete(dateKey)
			} else {
				newSet.add(dateKey)
			}
			return newSet
		})
	}

	const isExpanded = (dateKey: string) => expandedItems.has(dateKey)

	return (
		<FlatList
			data={groupedTransactionsArray}
			renderItem={({ item }: { item: [string, OrganizationTransactionRecord[]] }) => {
				const dateKey = item[0]
				const expanded = isExpanded(dateKey)
				const transactionCount = item[1].length

				return (
					<View className="mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
						{/* Accordion Header */}
						<TouchableOpacity
							onPress={() => toggleAccordion(dateKey)}
							activeOpacity={0.7}
							className="flex-row items-center justify-between px-4 py-3"
						>
							<View className="flex-1">
								<View className="flex-row items-center space-x-2 mb-1">
									<Ionicons name="calendar-outline" size={16} color="#6B7280" />
									<Text className="font-bold text-[14px] text-gray-800 dark:text-white">{dateKey}</Text>
									<View className="bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
										<Text className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
											{transactionCount} {transactionCount === 1 ? 'transacção' : 'transacções'}
										</Text>
									</View>
								</View>
								{item[1][0].start_date && item[1][0].end_date && (
									<Text className="text-gray-600 dark:text-gray-400 text-[11px] italic ml-6">
										{formatDate(item[1][0].start_date)} - {formatDate(item[1][0].end_date)}
									</Text>
								)}
							</View>
							<Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
						</TouchableOpacity>

						{/* Accordion Content */}
						{expanded && (
							<Animated.View entering={FadeInDown.duration(200)} className="px-4 pb-3">
								{/* Table Header */}
								<View className="flex-row border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 mb-1">
									<View className="flex-1 p-2 border-r border-gray-200 dark:border-gray-700">
										<Text className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Transacção</Text>
									</View>
									<View className="flex-1 p-2 border-r border-gray-200 dark:border-gray-700 items-center">
										<Text className="text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center">Qt. (Kg)</Text>
									</View>
									<View className="flex-1 p-2 items-center">
										<Text className="text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center">
											Preço (MZN)
										</Text>
									</View>
								</View>
								{/* Transaction Items */}
								{item[1].map((transaction) => (
									<TransactionListItem key={transaction.id} item={transaction} />
								))}
								{/* Footer */}
								<View className="flex flex-row justify-between items-center pt-2 mt-1 border-t border-gray-200 dark:border-gray-700">
									<View className="flex-row items-center space-x-1">
										<Text className="text-gray-600 dark:text-gray-400 text-[10px] italic">
											por {item[1][0].created_by} em {formatDate(item[1][0].created_at)}
										</Text>
									</View>
								</View>
							</Animated.View>
						)}
					</View>
				)
			}}
			keyExtractor={(item: [string, OrganizationTransactionRecord[]]) => item[0]}
			className="px-3 bg-white dark:bg-black"
			contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingBottom: 80 }}
			ItemSeparatorComponent={() => <View className="h-2" />}
			ListFooterComponent={() => <View className="h-2" />}
			ListHeaderComponentStyle={{ marginBottom: 10 }}
			ListEmptyComponent={() => <EmptyPlaceholder message="Nenhuma transação encontrada" />}
			showsVerticalScrollIndicator={false}
		/>
	)
}
