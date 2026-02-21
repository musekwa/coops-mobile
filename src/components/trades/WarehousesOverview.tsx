import React, { useEffect, useState } from 'react'
import { CashewWarehouse } from 'src/models/cashewWarehouse'
import { CashewWarehouseType, GeneratedReportHint, OverviewItemProps, PieChartData } from 'src/types'
import { Pie, PolarChart } from 'victory-native'
import { View } from 'react-native'
import { Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { TouchableOpacity } from 'react-native'

interface WarehousesOverviewProps {
	warehouses: CashewWarehouse[]
	handleSnapPress: (index: number) => void
	reportHint: string
	setReportHint: (hint: string) => void
	setWarehousesByType: (warehouses: {
		buyingPoints: CashewWarehouse[]
		aggregationPoints: CashewWarehouse[]
		destinationPoints: CashewWarehouse[]
	}) => void
	warehousesByType: {
		buyingPoints: CashewWarehouse[]
		aggregationPoints: CashewWarehouse[]
		destinationPoints: CashewWarehouse[]
	} | null
}

export default function WarehousesOverview({ warehouses, handleSnapPress, reportHint, setReportHint, setWarehousesByType, warehousesByType }: WarehousesOverviewProps) {
	

	const [warehousesByStatus, setWarehousesByStatus] = useState<{
		active: CashewWarehouse[]
		closed: CashewWarehouse[]
	} | null>(null)
	const [overviewItems, setOverviewItems] = useState<OverviewItemProps[]>([])
	const [pieChartData, setPieChartData] = useState<PieChartData[]>([])
	
	const handleReportPress = () => {
		handleSnapPress(2)
		setReportHint(GeneratedReportHint.WAREHOUSES)
	}

	useEffect(() => {
		if (warehouses.length > 0) {
			const buyingPoints: CashewWarehouse[] = []
			const aggregationPoints: CashewWarehouse[] = []
			const destinationPoints: CashewWarehouse[] = []
			const activeWarehouses: CashewWarehouse[] = []
			const closedWarehouses: CashewWarehouse[] = []
			warehouses.forEach((warehouse) => {
				const castedWarehouse = warehouse as unknown as CashewWarehouse
				if (castedWarehouse.warehouseType === CashewWarehouseType.BUYING) {
					buyingPoints.push(castedWarehouse)
				} else if (castedWarehouse.warehouseType === CashewWarehouseType.AGGREGATION) {
					aggregationPoints.push(castedWarehouse)
				} else if (castedWarehouse.warehouseType === CashewWarehouseType.DESTINATION) {
					destinationPoints.push(castedWarehouse)
				}

				if (castedWarehouse.isActive) {
					activeWarehouses.push(castedWarehouse)
				} else {
					closedWarehouses.push(castedWarehouse)
				}
			})
			setWarehousesByType({ buyingPoints, aggregationPoints, destinationPoints })
			setWarehousesByStatus({ active: activeWarehouses, closed: closedWarehouses })
		}
	}, [warehouses])

	useEffect(() => {
		if (warehousesByType) {
			setOverviewItems([
				{ title: 'Postos de Compra', value: warehousesByType?.buyingPoints.length ?? 0 },
				{ title: 'Armazéns de Trânsito', value: warehousesByType?.aggregationPoints.length ?? 0 },
				{ title: 'Armazéns de Destino', value: warehousesByType?.destinationPoints.length ?? 0 },
			])
		} else {
			setOverviewItems([
				{ title: 'Postos de Compra', value: 0 },
				{ title: 'Armazéns de Trânsito', value: 0 },
				{ title: 'Armazéns de Destino', value: 0 },
			])
		}
		if (warehousesByStatus) {
			setPieChartData([
				{ value: warehousesByStatus?.closed.length ?? 0, label: 'encerrados', color: '#a78bfa' },
				{ value: warehousesByStatus?.active.length ?? 0, label: 'em actividade', color: '#818cf8' },
			])
		} else {
			setPieChartData([
				{ value: 0, label: 'encerrados', color: '#a78bfa' },
				{ value: 0, label: 'em actividade', color: '#818cf8' },
			])
		}
	}, [warehousesByType, warehousesByStatus])

	return (
		<View className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 pt-1 my-2">
			<View className="flex-row justify-between items-center ">
				<View className="flex-row flex-1 items-center">
					<Text className="text-gray-900 dark:text-gray-100 text-[14px] font-bold">Postos de Compra e Armazéns</Text>
				</View>

				<TouchableOpacity
					className="mb-2 flex-row items-center p-2 rounded-full bg-gray-50 dark:bg-gray-800"
					onPress={handleReportPress}
				>
					<Ionicons name="list" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>

			<View className="flex-row justify-between items-center">
				<View className="flex-row w-2/3 flex">
					{overviewItems.map((item, index) => (
						<View key={index} className="flex-col justify-between items-center mb-2 w-1/3">
							<Text className="text-gray-900 dark:text-gray-100 text-[16px] font-bold text-center">{item.value}</Text>
							<Text className="text-gray-900 dark:text-gray-100 text-[8px] text-center">{item.title}</Text>
						</View>
					))}
				</View>
				<View className="flex-col w-1/3">
					{pieChartData.some((point) => point.value > 0) ? (
						<>
							<View className="flex flex-col w-full absolute bottom-0 right-0">
								{pieChartData.map((item, index) => (
									<View key={index} className="flex-row items-center justify-end w-full">
										<Text className="text-gray-900 dark:text-gray-100 text-[9px]">
											{item.value} {item.label}
										</Text>
										<View style={{ backgroundColor: item.color }} className="w-2 h-2 ml-2" />
									</View>
								))}
							</View>
							<View className="h-[50px] w-full absolute top-0 right-0">
								<PolarChart data={pieChartData} colorKey="color" labelKey="label" valueKey="value">
									<Pie.Chart circleSweepDegrees={-180} innerRadius={5}></Pie.Chart>
								</PolarChart>
							</View>
						</>
					) : (
						<View className="h-[50px] w-full flex items-center">
							<Ionicons name="alert-circle-outline" size={24} color={colors.gray600} />
							<Text className="text-gray-900 dark:text-gray-100 text-[8px] text-center italic">Nenhum registo</Text>
						</View>
					)}
				</View>
			</View>
		</View>
	)
}
