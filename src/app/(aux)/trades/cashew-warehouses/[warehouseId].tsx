import { View, Text, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Redirect, useLocalSearchParams, useNavigation } from 'expo-router'
import { CashewWarehouseType, ReducedTransactionType } from 'src/types'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import Animated, { FadeIn } from 'react-native-reanimated'
import BackButton from 'src/components/buttons/BackButton'

import { translateWarehouseTypeToPortuguese } from 'src/helpers/helpersToTrades'
import CashewWarehouseHeaderRight from 'src/components/trades/CashewWarehouseHeaderRight'
import { getLastSixMonths } from 'src/helpers/dates'
import CustomShimmerPlaceholder from 'src/components/placeholder/CustomShimmerPlaceholder'
import TransactionActionButtons from 'src/components/trades/TransactionActionButtons'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'
import ReceivedAndTransferredTransactions from 'src/components/trades/ReceivedAndTransferredTransactions'
import TransactionList from 'src/components/trades/TransactionList'
import AddWarehouseTransactions from 'src/components/forms/trades/AddWarehouseTransactions'
import { useAddressById, useWarehouseDetails, useWarehouseTransactions } from 'src/hooks/queries'

type TransactionScreenState = {
	hasError: boolean
	errorMessage: string
	showOverview: boolean
	isShowingExistingTransactions: boolean
	showReceivedTransactions: boolean
}

const initialState: TransactionScreenState = {
	hasError: false,
	errorMessage: '',
	showOverview: true,
	isShowingExistingTransactions: true,
	showReceivedTransactions: false,
}

// Components
const WarehouseHeader = ({ addressId, currentStock }: { addressId: string; currentStock: number }) => {
	const { districtName, adminPostName, villageName } = useAddressById(addressId || '')

	return (
		<View className="bg-white dark:bg-black border-b border-gray-300 dark:border-gray-700 flex justify-center">
			<View className="py-3 flex flex-row justify-between items-center w-full space-x-2">
				<View className="flex flex-row space-x-1">
					<Ionicons name="location-outline" size={20} color={colors.primary} />
					<View>
						<Text className="text-gray-600 dark:text-gray-400 text-[10px] italic">{districtName}</Text>
						<Text className="text-gray-600 dark:text-gray-400 text-[10px] italic">
							{adminPostName} - {villageName}
						</Text>
					</View>
				</View>
				<View className="flex flex-col space-y-0">
					<Text className="text-[#008000] text-[20px] font-bold text-right">
						{Intl.NumberFormat('pt-BR').format(currentStock)} kg
					</Text>
					<Text className="text-gray-600 dark:text-gray-400 text-[10px] italic">Estoque disponível</Text>
				</View>
			</View>
		</View>
	)
}

const MonthSelector = ({
	selectedMonth,
	selectedYear,
	setSelectedMonth,
	setSelectedYear,
	scrollViewRef,
}: {
	selectedMonth: number
	selectedYear: number
	setSelectedMonth: (month: number) => void
	setSelectedYear: (year: number) => void
	scrollViewRef: React.RefObject<any>
}) => {
	const months = getLastSixMonths()

	return (
		<ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} className="mb-4">
			{months.map(({ name, index, year }) => (
				<TouchableOpacity
					key={`${index}-${year}`}
					onPress={() => {
						setSelectedMonth(index)
						setSelectedYear(year)
					}}
					className={`px-4 py-2 mr-2 rounded-full ${
						selectedMonth === index && selectedYear === year ? 'bg-[#008000]' : 'bg-gray-200 dark:bg-gray-700'
					}`}
				>
					<Text
						className={`${
							selectedMonth === index && selectedYear === year ? 'text-white' : 'text-black dark:text-white'
						}`}
					>
						{`${name} ${year}`}
					</Text>
				</TouchableOpacity>
			))}
		</ScrollView>
	)
}

const TransactionItem = ({ item }: { item: ReducedTransactionType }) => (
	<View className="mb-4 p-4 border-b border-gray-200 dark:border-gray-700">
		<View className="flex-row justify-between items-center mb-2">
			<Text className="text-black dark:text-white font-bold">{new Date(item.date).toLocaleDateString('pt-PT')}</Text>
		</View>
		{item.quantityBought > 0 && (
			<View className="flex-row justify-between mb-1">
				<View className="flex-row items-center space-x-2">
					<Ionicons name="cart-outline" size={15} color={colors.primary} />
					<Text className="text-gray-600 dark:text-gray-400">Comprado:</Text>
				</View>
				<Text className="text-black dark:text-white">
					{Intl.NumberFormat('pt-BR').format(item.quantityBought)} kg a{' '}
					{Intl.NumberFormat('pt-BR').format(item.boughtPrice)} MZN/kg
				</Text>
			</View>
		)}
		{item.quantitySold > 0 && (
			<View className="flex-row justify-between mb-1">
				<View className="flex-row items-center space-x-2">
					<Ionicons name="cart-outline" size={15} color={colors.primary} />
					<Text className="text-gray-600 dark:text-gray-400">Vendido:</Text>
				</View>
				<Text className="text-black dark:text-white">
					{Intl.NumberFormat('pt-BR').format(item.quantitySold)} kg a{' '}
					{Intl.NumberFormat('pt-BR').format(item.resoldPrice)} MZN/kg
				</Text>
			</View>
		)}
		{item.quantityTransferredOut > 0 && (
			<View className="flex-row justify-between mb-1">
				<View className="flex-row items-center space-x-2">
					<Ionicons name="cart-outline" size={15} color={colors.primary} />
					<Text className="text-gray-600 dark:text-gray-400">Transferido:</Text>
				</View>
				<Text className="text-black dark:text-white">
					{Intl.NumberFormat('pt-BR').format(item.quantityTransferredOut)} kg
				</Text>
			</View>
		)}
		{item.quantityTransferredIn > 0 && (
			<View className="flex-row justify-between mb-1">
				<View className="flex-row items-center space-x-2">
					<Ionicons name="cart-outline" size={15} color={colors.primary} />
					<Text className="text-gray-600 dark:text-gray-400">Recebido:</Text>
				</View>
				<Text className="text-black dark:text-white">
					{Intl.NumberFormat('pt-BR').format(item.quantityTransferredIn)} kg
				</Text>
			</View>
		)}
		{item.quantityExported > 0 && (
			<View className="flex-row justify-between mb-1">
				<View className="flex-row items-center space-x-2">
					<Ionicons name="cart-outline" size={15} color={colors.primary} />
					<Text className="text-gray-600 dark:text-gray-400">Exportado:</Text>
				</View>
				<Text className="text-black dark:text-white">
					{Intl.NumberFormat('pt-BR').format(item.quantityExported)} kg
				</Text>
			</View>
		)}
		{item.quantityProcessed > 0 && (
			<View className="flex-row justify-between mb-1">
				<View className="flex-row items-center space-x-2">
					<Ionicons name="cart-outline" size={15} color={colors.primary} />
					<Text className="text-gray-600 dark:text-gray-400">Processado:</Text>
				</View>
				<Text className="text-black dark:text-white">
					{Intl.NumberFormat('pt-BR').format(item.quantityProcessed)} kg
				</Text>
			</View>
		)}
		{item.quantityAggregated > 0 && (
			<View className="flex-row justify-between mb-1">
				<View className="flex-row items-center space-x-2">
					<Ionicons name="cart-outline" size={20} color={colors.primary} />
					<Text className="text-gray-600 dark:text-gray-400">Agregado:</Text>
				</View>
				<Text className="text-black dark:text-white">
					{Intl.NumberFormat('pt-BR').format(item.quantityAggregated)} kg
				</Text>
			</View>
		)}
		{item.quantityLost > 0 && (
			<View className="flex-row justify-between mb-1">
				<View className="flex-row items-center space-x-2">
					<Ionicons name="cart-outline" size={15} color={colors.primary} />
					<Text className="text-gray-600 dark:text-gray-400">Desperdiçado:</Text>
				</View>
				<Text className="text-black dark:text-white">{Intl.NumberFormat('pt-BR').format(item.quantityLost)} kg</Text>
			</View>
		)}
		{item.employee_name && (
			<Text className="text-gray-600 dark:text-gray-400 text-[10px] italic text-right">
				Informado por: {item.employee_name}
			</Text>
		)}
	</View>
)

// Main component
export default function WarehouseScreen() {
	const navigation = useNavigation()
	const { warehouseId } = useLocalSearchParams()
	const scrollViewRef = useRef<any>(null)
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
	const [state, setState] = useState<TransactionScreenState>(initialState)

	const { warehouse, isLoading, error } = useWarehouseDetails(warehouseId as string)
	const { transactions, currentStock, groupedTransactions, stockDetails } = useWarehouseTransactions(
		warehouseId as string,
	)

	const handleModalPress = useCallback(() => {
		// Handle modal press if needed
	}, [])

	// Set up navigation header
	useEffect(() => {
		if (warehouse) {
			navigation.setOptions({
				headerLeft: () => <BackButton />,
				headerTitle: translateWarehouseTypeToPortuguese(warehouse.warehouse_type as CashewWarehouseType),
				headerRight: () => <CashewWarehouseHeaderRight warehouse={warehouse} currentStock={currentStock} />,
			})
		}
	}, [warehouse?.id])

	// Scroll to selected month
	useEffect(() => {
		const selectedIndex = getLastSixMonths().findIndex(
			(month) => month.index === selectedMonth && month.year === selectedYear,
		)
		if (selectedIndex !== -1 && scrollViewRef.current) {
			const screenWidth = Dimensions.get('window').width
			const itemWidth = 120
			const scrollToX = Math.max(0, selectedIndex * itemWidth - screenWidth / 2 + itemWidth / 2)
			scrollViewRef.current.scrollTo({ x: scrollToX, animated: false })
		}
	}, [selectedMonth, selectedYear])

	if (isLoading) {
		return <CustomShimmerPlaceholder />
	}

	if (!warehouse) {
		return <Redirect href="/(aux)/actors/trader/dashboard" />
	}

	const filteredTransactions = groupedTransactions.filter((group) => {
		const groupDate = new Date(group.date)
		return groupDate.getMonth() === selectedMonth && groupDate.getFullYear() === selectedYear
	})

	return (
		<>
			<View className="flex-1 bg-white dark:bg-black">
				{(state.isShowingExistingTransactions || state.showReceivedTransactions) && warehouse?.is_active === 'true' && (
					<TransactionActionButtons
						organizationId={undefined}
						warehouseId={warehouseId as string}
						showOverview={state.showOverview}
						setShowOverview={(showOverview) => setState((prev) => ({ ...prev, showOverview }))}
						setIsShowingExistingTransactions={(isShowingExistingTransactions) =>
							setState((prev) => ({ ...prev, isShowingExistingTransactions }))
						}
						isShowingExistingTransactions={state.isShowingExistingTransactions}
						handleModalPress={handleModalPress}
						showReceivedTransactions={state.showReceivedTransactions}
						setShowReceivedTransactions={(showReceivedTransactions) =>
							setState((prev) => ({ ...prev, showReceivedTransactions }))
						}
					/>
				)}

				{state.showOverview && !isLoading && state.isShowingExistingTransactions && (
					<Animated.FlatList
						entering={FadeIn.delay(300)}
						data={filteredTransactions}
						showsVerticalScrollIndicator={false}
						ListHeaderComponent={
							<View className="space-y-2 px-4">
								<WarehouseHeader addressId={warehouse.address_id} currentStock={currentStock} />
								<Text className="text-black dark:text-white text-[14px] font-bold py-2">
									Extratos de transacções mensais
								</Text>
								<MonthSelector
									selectedMonth={selectedMonth}
									selectedYear={selectedYear}
									setSelectedMonth={setSelectedMonth}
									setSelectedYear={setSelectedYear}
									scrollViewRef={scrollViewRef}
								/>
							</View>
						}
						contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 12 }}
						keyExtractor={(item: ReducedTransactionType) => item.date}
						renderItem={({ item }: { item: ReducedTransactionType }) => <TransactionItem item={item} />}
						ListEmptyComponent={<EmptyPlaceholder message="Nenhuma transacção para este mês." />}
					/>
				)}

				{!state.isShowingExistingTransactions &&
					!state.showOverview &&
					!isLoading &&
					!state.showReceivedTransactions && (
						<AddWarehouseTransactions
							currentStock={currentStock}
							warehouse={
								warehouse as {
									id: string
									description: string
									warehouse_type: string
									is_active: string
									owner_id: string
									address_id: string
								}
							}
							setIsShowingExistingTransactions={(isShowingExistingTransactions) =>
								setState((prev) => ({ ...prev, isShowingExistingTransactions }))
							}
							setShowOverview={(showOverview) => setState((prev) => ({ ...prev, showOverview }))}
						/>
					)}
				{state.showReceivedTransactions && !isLoading && (
					<ReceivedAndTransferredTransactions storeType={'WAREHOUSE'} warehouseId={warehouseId as string} />
				)}

				{state.isShowingExistingTransactions && !isLoading && !state.showOverview && (
					<TransactionList transactions={transactions} />
				)}
			</View>
		</>
	)
}
