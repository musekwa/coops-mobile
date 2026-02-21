import { View, Text } from 'react-native'
import React from 'react'
import Animated from 'react-native-reanimated'
import StockItem from './StockItem'
import { CashewWarehouseType } from 'src/types'
import { ScrollView } from 'react-native'
import TransactionsOverViewCharts from './TransactionsOverViewCharts'
import CurrentStock from './CurrentStock'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'

type TransactionsOverviewProps = {
	currentStock: number
	stockDetails: {
		bought: number
		sold: number
		transferredOut: number
		transferredIn: number
		exported: number
		processed: number
		lost: number
		aggregated: number
	}
	warehouseType: CashewWarehouseType
	warehouseStatus: boolean
}
export default function TransactionsOverview({
	warehouseStatus,
	currentStock,
	stockDetails,
	warehouseType,
}: TransactionsOverviewProps) {
	return (
		<Animated.ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
			<View className={`px-3 ${!warehouseStatus ? 'opacity-20' : ''}`}>
				<View className="flex justify-between w-[100%] h-[250px]">
					<TransactionsOverViewCharts stockDetails={stockDetails} />
				</View>

				<CurrentStock label="Estoque Disponível" currentStock={currentStock} />

				<Text className="text-[14px] pt-4 font-semibold text-gray-800 dark:text-white mb-2">
					Detalhes das Transacções
				</Text>

				{warehouseType === CashewWarehouseType.COOPERATIVE && (
					<View className="border border-gray-300 rounded-md p-1">
						<StockItem icon="group" label="Agregado" value={stockDetails.aggregated} color="#166534" />
						<StockItem icon="cart-arrow-down" label="Vendido" value={stockDetails.sold} color="#1e40af" />
						<StockItem
							icon="arrow-up-bold-box"
							label="Transferido"
							value={stockDetails.transferredOut}
							color="#1e40af"
						/>
						<StockItem icon="trash-can-outline" label="Desperdiçado" value={stockDetails.lost} color="#991b1b" />
					</View>
				)}

				{warehouseType === CashewWarehouseType.ASSOCIATION && (
					<View className="border border-gray-300 rounded-md p-1">
						<StockItem icon="cart-plus" label="Agregado" value={stockDetails.aggregated} color="#166534" />
						<StockItem icon="cart-arrow-down" label="Vendido" value={stockDetails.sold} color="#1e40af" />
						<StockItem
							icon="arrow-up-bold-box"
							label="Transferido"
							value={stockDetails.transferredOut}
							color="#1e40af"
						/>
						<StockItem icon="trash-can-outline" label="Desperdiçado" value={stockDetails.lost} color="#991b1b" />
					</View>
				)}

				{warehouseType === CashewWarehouseType.COOP_UNION && (
					<View className="border border-gray-300 rounded-md p-1">
						<StockItem icon="arrow-down-bold-box" label="Recebido" value={stockDetails.transferredIn} color="#166534" />
						<StockItem icon="cart-arrow-down" label="Vendido" value={stockDetails.sold} color="#1e40af" />
						<StockItem
							icon="arrow-up-bold-box"
							label="Transferido"
							value={stockDetails.transferredOut}
							color="#1e40af"
						/>
						<StockItem icon="trash-can-outline" label="Desperdiçado" value={stockDetails.lost} color="#991b1b" />
					</View>
				)}

				{warehouseType === CashewWarehouseType.BUYING && (
					<View className="border border-gray-300 rounded-md p-1">
						<StockItem icon="cart-plus" label="Comprado" value={stockDetails.bought} color="#166534" />
						<StockItem icon="cart-arrow-down" label="Vendido" value={stockDetails.sold} color="#1e40af" />
						<StockItem
							icon="arrow-up-bold-box"
							label="Transferido"
							value={stockDetails.transferredOut}
							color="#1e40af"
						/>
						<StockItem icon="trash-can-outline" label="Desperdiçado" value={stockDetails.lost} color="#991b1b" />
					</View>
				)}

				{warehouseType === CashewWarehouseType.AGGREGATION && (
					<View className="border border-gray-300 rounded-md p-1">
						<StockItem icon="cart-plus" label="Comprado" value={stockDetails.bought} color="#166534" />
						<StockItem icon="arrow-down-bold-box" label="Recebido" value={stockDetails.transferredIn} color="#166534" />
						<StockItem icon="cart-arrow-down" label="Vendido" value={stockDetails.sold} color="#1e40af" />
						<StockItem
							icon="arrow-up-bold-box"
							label="Transferido"
							value={stockDetails.transferredOut}
							color="#1e40af"
						/>
						<StockItem icon="factory" label="Processado" value={stockDetails.processed} color="#166534" />
						<StockItem icon="sail-boat" label="Exportado" value={stockDetails.exported} color="#166534" />
						<StockItem icon="trash-can-outline" label="Desperdiçado" value={stockDetails.lost} color="#991b1b" />
					</View>
				)}

				{warehouseType === CashewWarehouseType.DESTINATION && (
					<View className="border border-gray-300 rounded-md p-1">
						<StockItem icon="cart-plus" label="Comprado" value={stockDetails.bought} color="#166534" />
						<StockItem icon="arrow-down-bold-box" label="Recebido" value={stockDetails.transferredIn} color="#166534" />
						<StockItem icon="cart-arrow-down" label="Vendido" value={stockDetails.sold} color="#1e40af" />
						<StockItem
							icon="arrow-up-bold-box"
							label="Transferido"
							value={stockDetails.transferredOut}
							color="#1e40af"
						/>
						<StockItem icon="factory" label="Processado" value={stockDetails.processed} color="#166534" />
						<StockItem icon="sail-boat" label="Exportado" value={stockDetails.exported} color="#166534" />
						<StockItem icon="trash-can-outline" label="Desperdiçado" value={stockDetails.lost} color="#991b1b" />
					</View>
				)}
			</View>
			{!warehouseStatus && (
				<View className="absolute top-0 bottom-0 left-0 right-0 items-center justify-center">
					<Ionicons name="lock-closed-outline" size={24} color={colors.red} />
					<Text className="text-red-500 font-bold text-2xl">Encerrado</Text>
				</View>
			)}
		</Animated.ScrollView>
	)
}
