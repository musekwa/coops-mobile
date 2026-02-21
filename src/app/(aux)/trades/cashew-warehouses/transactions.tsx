import React, { useEffect, useRef, useState } from 'react'
import { Pressable, View, Text } from 'react-native'
import { useColorScheme } from 'nativewind'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { match } from 'ts-pattern'

import { colors } from 'src/constants'
import { CashewWarehouseType, TransactionFlowType } from 'src/types'
import { useActionStore } from 'src/store/actions/actions'

import BackButton from 'src/components/buttons/BackButton'
import { CustomShimmerPlaceholderItemList } from 'src/components/placeholder/CustomShimmerPlaceholder'
import TransactionsOverview from 'src/components/trades/TransactionsOverview'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import TransactionActionButtons from 'src/components/trades/TransactionActionButtons'
import CustomBottomSheetModal from 'src/components/modals/CustomBottomSheetModal'
import ReportFiltering from 'src/components/trades/ReportFiltering'
import DisplayPDF from 'src/components/data-preview/PdfDisplayer'
import AddWarehouseTransactions from 'src/components/forms/trades/AddWarehouseTransactions'
import { getCurrentStock, getStockDetails } from 'src/helpers/helpersToTrades'
import TransactionList from 'src/components/trades/TransactionList'
import HeaderRightComponent from 'src/components/trades/CashewWarehouseHeaderRight'
import { WarehouseWithAddressAndOwnerAndContact } from 'src/features/trades/data/types'
import { useQueryOneAndWatchChanges } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import ReceivedAndTransferredTransactions from 'src/components/trades/ReceivedAndTransferredTransactions'
import { useWarehouseTransactions } from 'src/hooks/queries'
type TransactionScreenState = {
	isLoading: boolean
	hasError: boolean
	errorMessage: string
	showOverview: boolean
	isShowingExistingTransactions: boolean
	showReceivedTransactions: boolean
}

const initialState: TransactionScreenState = {
	isLoading: true,
	hasError: false,
	errorMessage: '',
	showOverview: true,
	isShowingExistingTransactions: true,
	showReceivedTransactions: false,
}

export default function TransactionsScreen() {
	const { pdfUri, setPdfUri, resetPdfUri } = useActionStore()
	const { warehouseId } = useLocalSearchParams()
	const [state, setState] = useState<TransactionScreenState>(initialState)
	const navigation = useNavigation()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const bottomSheetModalRef = useRef<BottomSheetModal>(null)

	const {
		data: cw,
		isLoading: isCwLoading,
		error: cwError,
		isError: isCwError,
	} = useQueryOneAndWatchChanges<{
		id: string
		description: string
		is_active: string
		owner_id: string
		address_id: string
		warehouse_type: string
	}>(
		`SELECT 
			wd.id,
			wd.description,
			wd.is_active,
			wd.owner_id,
			ad.id as address_id,
			wd.type as warehouse_type
		FROM ${TABLES.WAREHOUSE_DETAILS} wd
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad 
			ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
		WHERE wd.id = ?
		`,
		[warehouseId as string],
	)

	const { transactions, currentStock, groupedTransactions, stockDetails } = useWarehouseTransactions(
		warehouseId as string,
	)

	const handleModalPress = () => {
		bottomSheetModalRef.current?.present()
	}

	const handleModalDismiss = () => {
		bottomSheetModalRef.current?.close()
	}

	useEffect(() => {
		if (state.isLoading) {
			setTimeout(() => {
				setState((prev) => ({ ...prev, isLoading: false }))
			}, 500)
		}
	}, [state.isLoading])

	useEffect(() => {
		// reset the pdf uri
		resetPdfUri()

		// set the warehouse type
		const warehouseType = match(cw?.warehouse_type)
			.with(CashewWarehouseType.BUYING, () => 'Posto de Compras')
			.with(CashewWarehouseType.AGGREGATION, () => 'Armazém de Trânsito')
			.with(CashewWarehouseType.DESTINATION, () => 'Armazém de Destino')
			.otherwise(() => 'Comercialização')

		// set the header title
		const headerTitle = state.isShowingExistingTransactions ? 'Transacções' : warehouseType

		// set the header options
		navigation.setOptions({
			headerLeft: () =>
				state.isShowingExistingTransactions ? (
					<BackButton />
				) : (
					<Pressable
						onPress={() =>
							setState((prev) => ({
								...prev,
								isShowingExistingTransactions: true,
								showOverview: true,
								showReceivedTransactions: false,
							}))
						}
					>
						<Ionicons name="arrow-back" size={24} color={isDarkMode ? colors.white : colors.black} />
					</Pressable>
				),
			headerTitle: () =>
				!cw ? (
					<Text />
				) : (
					<View className="flex flex-col items-center">
						<Text className="text-black dark:text-white text-[14px] font-bold text-center">{headerTitle}</Text>
					</View>
				),
			headerRight: () =>
				state.isShowingExistingTransactions && cw ? (
					<HeaderRightComponent
						currentStock={getCurrentStock(
							transactions.map((transaction) => ({
								quantity: transaction.quantity || 0,
								transaction_type: transaction.transaction_type as TransactionFlowType,
							})),
						)}
						warehouse={cw}
					/>
				) : undefined,
			headerBackVisible: false, // This hides the native back arrow
		})
	}, [cw, state.isShowingExistingTransactions, transactions])

	// Show loading state
	if (isCwLoading) {
		return (
			<View className="flex-1 bg-white dark:bg-black">
				<CustomShimmerPlaceholderItemList count={10} height={100} />
			</View>
		)
	}

	// Show error state for warehouse not found
	if (!cw && !isCwLoading) {
		return (
			<View className="flex-1 bg-white dark:bg-black items-center justify-center p-4">
				<View className="items-center space-y-4">
					<Ionicons name="alert-circle-outline" size={64} color={colors.gray600} />
					<Text className="text-gray-600 dark:text-gray-400 text-lg font-semibold text-center">
						Armazém não encontrado
					</Text>
					<Text className="text-gray-500 dark:text-gray-500 text-sm text-center">
						O armazém com ID "{warehouseId}" não foi encontrado na base de dados.
					</Text>
					<Pressable onPress={() => navigation.goBack()} className="bg-primary px-6 py-3 rounded-lg">
						<Text className="text-white font-semibold">Voltar</Text>
					</Pressable>
				</View>
			</View>
		)
	}

	if (pdfUri) {
		return <DisplayPDF />
	}

	return (
		<View className="flex-1 bg-white dark:bg-black space-y-2 ">
			{(state.isShowingExistingTransactions || state.showReceivedTransactions) && cw?.is_active === 'true' && (
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

			{state.showOverview && !state.isLoading && state.isShowingExistingTransactions && (
				<TransactionsOverview
					warehouseStatus={cw?.is_active === 'true'}
					currentStock={getCurrentStock(
						transactions.map((transaction) => ({
							quantity: transaction.quantity || 0,
							transaction_type: transaction.transaction_type as TransactionFlowType,
						})),
					)}
					stockDetails={getStockDetails(
						transactions.map((transaction) => ({
							quantity: transaction.quantity || 0,
							transaction_type: transaction.transaction_type as TransactionFlowType,
						})),
					)}
					warehouseType={cw?.warehouse_type as CashewWarehouseType}
				/>
			)}

			{!state.isShowingExistingTransactions &&
				!state.showOverview &&
				!state.isLoading &&
				!state.showReceivedTransactions && (
					<AddWarehouseTransactions
						currentStock={getCurrentStock(
							transactions.map((transaction) => ({
								quantity: transaction.quantity || 0,
								transaction_type: transaction.transaction_type as TransactionFlowType,
							})),
						)}
						warehouse={cw as WarehouseWithAddressAndOwnerAndContact}
						setIsShowingExistingTransactions={(isShowingExistingTransactions) =>
							setState((prev) => ({ ...prev, isShowingExistingTransactions }))
						}
						setShowOverview={(showOverview) => setState((prev) => ({ ...prev, showOverview }))}
					/>
				)}

			{state.isLoading && <CustomShimmerPlaceholderItemList count={10} height={100} />}

			{state.showReceivedTransactions && !state.isLoading && (
				<ReceivedAndTransferredTransactions storeType={'WAREHOUSE'} warehouseId={warehouseId as string} />
			)}

			{state.isShowingExistingTransactions && !state.isLoading && !state.showOverview && (
				<TransactionList transactions={transactions} />
			)}

			<ErrorAlert
				title=""
				message={state.errorMessage}
				setMessage={(message) => setState((prev) => ({ ...prev, errorMessage: message }))}
				visible={state.hasError}
				setVisible={(hasError) => setState((prev) => ({ ...prev, hasError }))}
			/>

			{/* Bottom Sheet Modal */}
			<CustomBottomSheetModal
				index={4}
				handleDismissModalPress={handleModalPress}
				bottomSheetModalRef={bottomSheetModalRef}
			>
				<View className="flex-1 p-3 h-full">
					<View className="flex-1 space-y-4 pt-8">
						<ReportFiltering
							pdfUri={pdfUri}
							setPdfUri={setPdfUri}
							onGenerateReport={() => {
								handleModalDismiss()
							}}
							hint={'armazém'}
							transactions={transactions.map((transaction) => ({
								id: transaction.id,
								transaction_type: transaction.transaction_type as TransactionFlowType,
								quantity: transaction.quantity || 0,
								unit_price: transaction.unit_price || 0,
								start_date: transaction.start_date || '',
								end_date: transaction.end_date || '',
								store_id: transaction.store_id || '',
								created_by: transaction.created_by || '',
							}))}
							storeDetails={cw}
						/>
					</View>
				</View>
			</CustomBottomSheetModal>
		</View>
	)
}
