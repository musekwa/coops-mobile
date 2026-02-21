import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { colors } from 'src/constants'
import { useColorScheme } from 'nativewind'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useQueryManyAndWatchChanges } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { TransactionFlowType } from 'src/types'

type ToggleStockOverViewButtonProps = {
	showOverview: boolean
	setShowOverview: (showOverview: boolean) => void
	setIsShowingExistingTransactions: (isShowingExistingTransactions: boolean) => void
	isShowingExistingTransactions: boolean
	handleModalPress: () => void
	showReceivedTransactions: boolean
	setShowReceivedTransactions: (showReceivedTransactions: boolean) => void
	warehouseId?: string
	organizationId?: string
}

interface CountResult {
	count: number
}

export default function TransactionActionButtons({
	showOverview,
	setShowOverview,
	setIsShowingExistingTransactions,
	handleModalPress,
	showReceivedTransactions,
	setShowReceivedTransactions,
	isShowingExistingTransactions,
	warehouseId,
	organizationId,
}: ToggleStockOverViewButtonProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const isMonitoringSelected = !showOverview && !showReceivedTransactions && !isShowingExistingTransactions
	const isReceivedTransactionsSelected = !showOverview && showReceivedTransactions && !isShowingExistingTransactions
	const isOverviewSelected =
		(showOverview || isShowingExistingTransactions) && !showReceivedTransactions && !isMonitoringSelected
	const isReportSelected =
		!showOverview &&
		!showReceivedTransactions &&
		isShowingExistingTransactions === false /* or another dedicated state */

	const {data: unconfirmedTransactions, isLoading: isUnconfirmedTransactionsLoading, error: unconfirmedTransactionsError, isError: isUnconfirmedTransactionsError} = useQueryManyAndWatchChanges<CountResult>(
		`SELECT COUNT(*) as count 
		FROM ${warehouseId ? TABLES.CASHEW_WAREHOUSE_TRANSACTIONS : TABLES.ORGANIZATION_TRANSACTIONS} 
		WHERE confirmed = 'false' 
		AND reference_store_id = '${warehouseId || organizationId}'
		AND transaction_type = '${TransactionFlowType.TRANSFERRED_OUT}'`,
	)

	const unconfirmedCount = unconfirmedTransactions?.[0]?.count || 0

	return (
		<View className="flex flex-row justify-around items-center pb-4 mx-3 rounded-md border-gray-300 space-x-3">
			<TouchableOpacity
				onPress={() => {
					setShowOverview(!showOverview)
					setShowReceivedTransactions(false)
					setIsShowingExistingTransactions(true)
				}}
				className={`p-0.5 flex flex-col items-center justify-center ${isOverviewSelected ? 'border-b border-[#008000]' : ''}`}
			>
				<View className="p-0 rounded-md">
					<Ionicons
						name={
							showOverview
								? isOverviewSelected
									? 'pie-chart'
									: 'pie-chart-outline'
								: isOverviewSelected
									? 'list'
									: 'list-outline'
						}
						size={28}
						color={isOverviewSelected ? colors.primary : isDarkMode ? colors.white : colors.black}
					/>
				</View>
				<Text
					className={`text-[7px] font-monospace text-center ${isOverviewSelected ? 'text-[#008000]' : 'text-black dark:text-white'}`}
				>
					{showOverview ? 'Resumo' : 'Transacções'}
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={handleModalPress}
				className={`p-0.5 flex flex-col items-center justify-center ${isReportSelected ? 'border-b border-[#008000]' : ''}`}
			>
				<View className="p-0 rounded-md">
					<Ionicons
						name={isReportSelected ? 'document-text' : 'document-text-outline'}
						size={28}
						color={isReportSelected ? colors.primary : isDarkMode ? colors.white : colors.black}
					/>
				</View>
				<Text
					className={`text-[7px] font-monospace text-center ${isReportSelected ? 'text-[#008000]' : 'text-black dark:text-white'}`}
				>
					Relatório
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				activeOpacity={1}
				onPress={() => {
					if (showReceivedTransactions) {
						setShowReceivedTransactions(false)
						setShowOverview(true)
						setIsShowingExistingTransactions(true)
					} else {
						setShowReceivedTransactions(true)
						setShowOverview(false)
						setIsShowingExistingTransactions(false)
					}
				}}
				className={`p-0.5 flex flex-col items-center justify-center ${isReceivedTransactionsSelected ? 'border-b border-[#008000]' : ''}`}
			>
				<View className="p-0 rounded-md">
					<View className="relative">
						<Ionicons
							name={isReceivedTransactionsSelected ? 'notifications' : 'notifications-outline'}
							size={28}
							color={isReceivedTransactionsSelected ? colors.primary : isDarkMode ? colors.white : colors.black}
						/>
						{unconfirmedCount > 0 && (
							<View className="absolute -top-0 -right-0 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
								<Text className="text-white text-[10px] font-medium">
									{unconfirmedCount > 5 ? '5+' : unconfirmedCount}
								</Text>
							</View>
						)}
					</View>
				</View>
				<Text
					className={`text-[7px] font-monospace text-center ${isReceivedTransactionsSelected ? 'text-[#008000]' : 'text-black dark:text-white'}`}
				>
					Entradas e Saídas
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={() => {
					setIsShowingExistingTransactions(false)
					setShowReceivedTransactions(false)
					setShowOverview(false)
				}}
				className={`p-0.5 flex flex-col items-center justify-center ${isMonitoringSelected ? 'border-b border-[#008000]' : ''}`}
			>
				<View className="p-0 rounded-md">
					<MaterialCommunityIcons
						name={isMonitoringSelected ? 'square-edit-outline' : 'square-edit-outline'}
						size={28}
						color={isMonitoringSelected ? colors.primary : isDarkMode ? colors.white : colors.black}
					/>
				</View>
				<Text
					className={`text-[7px] font-monospace text-center ${isMonitoringSelected ? 'text-[#008000]' : 'text-black dark:text-white'}`}
				>
					Monitoria
				</Text>
			</TouchableOpacity>
		</View>
	)
}
