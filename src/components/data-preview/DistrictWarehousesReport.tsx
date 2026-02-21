import { View, Text } from 'react-native'
import React from 'react'
import ReportEmptyStateMessage from '../trades/ReportEmptyStateMessage'
import { CashewWarehouse } from 'src/models/cashewWarehouse'
import { calculateWeightedPrice } from 'src/helpers/helpersToTrades'
import { isVisitOverdue } from 'src/helpers/dates'
import ReportSectionHeader from '../trades/ReportSectionHeader'
import { getLastVisitDateAtWarehouse } from 'src/helpers/dates'
import ReportAdminPostHeader from '../trades/ReportAdminPostHeader'
import { calculateTotalByTransactionFlow } from 'src/helpers/helpersToTrades'
import { TransactionFlowType } from 'src/types'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { useColorScheme } from 'nativewind'

interface DistrictWarehousesReportProps {
	warehousesByAdminPost: {
		buyingPoints: Record<string, CashewWarehouse[]>
		aggregationPoints: Record<string, CashewWarehouse[]>
		destinationPoints: Record<string, CashewWarehouse[]>
	}
    adminPosts: string[]
}

export default function DistrictWarehousesReport({ warehousesByAdminPost, adminPosts }: DistrictWarehousesReportProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	const renderWarehouseSection = (title: string, warehouses: Record<string, CashewWarehouse[]>) => {
		const sortWarehouses = (warehouseList: CashewWarehouse[]) => {
			return [...warehouseList].sort((a, b) => {
				const aLastVisit = getLastVisitDateAtWarehouse(a.transactions)
				const bLastVisit = getLastVisitDateAtWarehouse(b.transactions)
				
				// No visits come first
				if (!aLastVisit && !bLastVisit) return 0
				if (!aLastVisit) return -1
				if (!bLastVisit) return 1
				
				const aOverdue = isVisitOverdue(aLastVisit)
				const bOverdue = isVisitOverdue(bLastVisit)
				
				// Then overdue visits (sorted by oldest first)
				if (aOverdue && bOverdue) {
					return new Date(aLastVisit).getTime() - new Date(bLastVisit).getTime()
				}
				if (aOverdue) return -1
				if (bOverdue) return 1
				
				// Finally, recent visits (sorted by most recent first)
				return new Date(bLastVisit).getTime() - new Date(aLastVisit).getTime()
			})
		}

		const hasWarehouses = adminPosts.some((adminPost) => warehouses[adminPost]?.length > 0)

		return (
			<View className="space-y-2 mt-4">
				<ReportSectionHeader title={title} />
				{hasWarehouses ? (
					adminPosts.map(
						(adminPost) =>
							warehouses[adminPost]?.length > 0 && (
								<View key={`${title}-${adminPost}`} className="ml-4 mb-4">
									<ReportAdminPostHeader name={adminPost} />
									{sortWarehouses(warehouses[adminPost]).map((warehouse, index) => {
										const lastVisitDate = getLastVisitDateAtWarehouse(warehouse.transactions)
										const visitOverdue = isVisitOverdue(lastVisitDate)

										return (
											<View
												key={warehouse._id}
												className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
											>
												{/* Header Section: Name & Total */}
												<View className="flex-row items-center justify-between mb-2">
													<View className="flex-1">
														<Text className="text-[14px] font-semibold text-gray-800 dark:text-gray-200">
															{index + 1}. {warehouse.description?.split('-')[0].trim()}
														</Text>
													</View>
													<View className="flex-col items-end">
														<Text className="text-[14px] font-bold text-gray-700 dark:text-gray-300">
															{Intl.NumberFormat('pt-BR', {
																style: 'unit',
																unit: 'kilogram',
																unitDisplay: 'short',
															}).format(
																calculateTotalByTransactionFlow(warehouse.transactions, TransactionFlowType.BOUGHT),
															)}
														</Text>
														<Text className="text-[12px] text-gray-600 dark:text-gray-400">
															{warehouse.transactions && calculateWeightedPrice(warehouse.transactions).toFixed(2)} MZN
															/ Kg
														</Text>
													</View>
												</View>

												{/* Status Section */}
												<View className="bg-white dark:bg-gray-800 rounded-md p-2">
													<View className="flex-row items-center justify-between">
														<View className="flex-row items-center flex-1">
															<Ionicons
																name={
																	warehouse.isActive
																		? lastVisitDate
																			? visitOverdue
																				? 'warning'
																				: 'checkmark-circle'
																			: 'alert-circle'
																		: 'lock-closed-outline'
																}
																size={14}
																color={
																	warehouse.isActive
																		? lastVisitDate
																			? visitOverdue
																				? colors.warning
																				: colors.primary
																			: colors.red
																		: colors.red
																}
															/>
															<Text className="text-[12px] text-gray-600 dark:text-gray-400 ml-2">
																{warehouse.isActive
																	? lastVisitDate
																		? `Última visita: ${new Date(lastVisitDate).toLocaleDateString('pt-BR')}`
																		: 'Nunca visitado'
																	: 'Encerrado'}
															</Text>
														</View>
														{warehouse.isActive ? (
															visitOverdue &&
															lastVisitDate && (
																<View className="flex-row items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
																	<Ionicons name="time-outline" size={12} color={colors.warning} />
																	<Text className="text-[10px] text-yellow-700 dark:text-yellow-500 ml-1">
																		Visita pendente
																	</Text>
																</View>
															)
														) : (
															<View className="flex-row items-center bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
																<Ionicons name="close-circle-outline" size={12} color={colors.red} />
																<Text className="text-[10px] text-red-700 dark:text-red-500 ml-1">Inativo</Text>
															</View>
														)}
													</View>
												</View>
											</View>
										)
									})}
								</View>
							),
					)
				) : (
					<View className="ml-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
						<View className="flex-row items-center justify-center">
							<Ionicons
								name="information-circle-outline"
								size={16}
								color={isDarkMode ? colors.gray600 : colors.lightblack}
							/>
							<Text className="text-[12px] text-gray-500 dark:text-gray-400 ml-2">
								Nenhum {title.toLowerCase()} encontrado
							</Text>
						</View>
					</View>
				)}
			</View>
		)
	}

	return (
		<>
			{Object.keys(warehousesByAdminPost.buyingPoints).length > 0 ? (
				renderWarehouseSection('Postos de Compra', warehousesByAdminPost.buyingPoints)
			) : (
				<ReportEmptyStateMessage message="Nenhum posto de compra registado" />
			)}

			{Object.keys(warehousesByAdminPost.aggregationPoints).length > 0 ? (
				renderWarehouseSection('Armazéns de Trânsito', warehousesByAdminPost.aggregationPoints)
			) : (
				<ReportEmptyStateMessage message="Nenhum armazém de trânsito registado" />
			)}

			{Object.keys(warehousesByAdminPost.destinationPoints).length > 0 ? (
				renderWarehouseSection('Armazéns de Destino', warehousesByAdminPost.destinationPoints)
			) : (
				<ReportEmptyStateMessage message="Nenhum armazém de destino registado" />
			)}
		</>
	)
}
