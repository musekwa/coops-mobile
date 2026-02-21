
import { View, Text } from 'react-native'
import React from 'react'
import ReportSectionHeader from '../trades/ReportSectionHeader'
import { Trader } from 'src/models/trader'
import ReportAdminPostHeader from '../trades/ReportAdminPostHeader'
import { TransactionFlowType } from 'src/types'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { useColorScheme } from 'nativewind'
import ReportEmptyStateMessage from '../trades/ReportEmptyStateMessage'
import { calculateTotalByTransactionFlow } from 'src/helpers/helpersToTrades'
import { CashewWarehouse } from 'src/models/cashewWarehouse'

interface DistrictTradersReportPreviewProps {
    tradersByAdminPost:  {
        primaries: Record<string, {
            traderId: string;
            name: string;
            warehouses: CashewWarehouse[];
        }[]>;
        secondaries: Record<string, {
            traderId: string;
            name: string;
            warehouses: CashewWarehouse[];
        }[]>;
        finals: Record<string, {
            traderId: string;
            name: string;
            warehouses: CashewWarehouse[];
        }[]>;
    };
    adminPosts: string[]

}

export default function DistrictTradersReportPreview({ tradersByAdminPost, adminPosts }: DistrictTradersReportPreviewProps) {
    const isDarkMode = useColorScheme().colorScheme === 'dark'
  return (
    <View className="space-y-2">
    {Object.entries(tradersByAdminPost).map(([traderCategory, adminPosts]) => {
        const hasTraders = Object.values(adminPosts).some((traders) => traders.length > 0)
        const categoryLabel =
            traderCategory === 'primaries'
                ? 'primário'
                : traderCategory === 'secondaries'
                    ? 'intermediário'
                    : 'final'

        return (
            <View key={traderCategory}>
                <ReportSectionHeader
                    title={
                        traderCategory === 'primaries'
                            ? 'Primários'
                            : traderCategory === 'secondaries'
                                ? 'Intermediários'
                                : 'Finais'
                    }
                />
                {hasTraders ? (
                    Object.entries(adminPosts).map(([adminPost, traders]) => (
                        <View key={`${traderCategory}-${adminPost}`} className="ml-4 mb-4">
                            <ReportAdminPostHeader name={adminPost} />
                            {traders.length > 0 ? (
                                traders.map((trader, index) => {
                                    const totalQuantity = trader.warehouses.reduce(
                                        (total, warehouse) =>
                                            total +
                                            calculateTotalByTransactionFlow(
                                                warehouse.transactions,
                                                TransactionFlowType.BOUGHT,
                                            ),
                                        0,
                                    )

                                    return (
                                        <View
                                            key={trader.traderId}
                                            className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
                                        >
                                            {/* Header Section: Name & Total */}
                                            <View className="flex-row items-center justify-between mb-2">
                                                <View className="flex-1">
                                                    <Text className="text-[14px] font-semibold text-gray-800 dark:text-gray-200">
                                                        {index + 1}. {trader.name}
                                                    </Text>
                                                </View>
                                                <Text className="text-[14px] font-bold text-gray-700 dark:text-gray-300 min-w-[100px] text-right">
                                                    {Intl.NumberFormat('pt-BR', {
                                                        style: 'unit',
                                                        unit: 'kilogram',
                                                        unitDisplay: 'short',
                                                    }).format(totalQuantity)}
                                                </Text>
                                            </View>

                                            {/* Warehouses Section */}
                                            <View className="bg-white dark:bg-gray-800 rounded-md p-2">
                                                <View className="flex-row items-center mb-1">
                                                    <Ionicons name="business" size={14} color={colors.primary} />
                                                    <Text className="text-[12px] font-medium text-gray-700 dark:text-gray-300 ml-1">
                                                        Armazéns ({trader.warehouses.length})
                                                    </Text>
                                                </View>
                                                {trader.warehouses.map((warehouse, idx) => (
                                                    <View key={idx} className="flex-row justify-between items-center ml-4 mt-1">
                                                        <Text className="text-[11px] text-gray-600 dark:text-gray-400">
                                                            • {warehouse.description?.split('-')[0].trim()}
                                                        </Text>
                                                        <Text className="text-[11px] text-gray-600 dark:text-gray-400">
                                                            {Intl.NumberFormat('pt-BR', {
                                                                style: 'unit',
                                                                unit: 'kilogram',
                                                                unitDisplay: 'short',
                                                            }).format(
                                                                calculateTotalByTransactionFlow(
                                                                    warehouse.transactions,
                                                                    TransactionFlowType.BOUGHT,
                                                                ),
                                                            )}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )
                                })
                            ) : (
                                <View className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                    <View className="flex-row items-center justify-center">
                                        <Ionicons
                                            name="information-circle-outline"
                                            size={16}
                                            color={isDarkMode ? colors.gray600 : colors.lightblack}
                                        />
                                        <Text className="text-[12px] text-gray-500 dark:text-gray-400 ml-2">
                                            Nenhum comerciante registado em {adminPost}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    ))
				) : (
					<ReportEmptyStateMessage message={`Nenhum comerciante ${categoryLabel} registado`} />
				)}
			</View>
        )
    })}
</View>
  )
}