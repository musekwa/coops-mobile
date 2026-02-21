// React and React Native imports
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

// Third-party libraries
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { useLocalSearchParams, useNavigation } from 'expo-router'

// Components
import AddOrganizationTransactions from 'src/components/forms/trades/AddOrganizationTransactions'
import BackButton from 'src/components/buttons/BackButton'
import CustomBottomSheetModal from 'src/components/modals/CustomBottomSheetModal'
import CustomPopUpMenu from 'src/components/menus/CustomPopUpMenu'
import DisplayPDF from 'src/components/data-preview/PdfDisplayer'
import { CustomShimmerPlaceholderItemList } from 'src/components/placeholder/CustomShimmerPlaceholder'
import TransactionActionButtons from 'src/components/trades/TransactionActionButtons'
import TransactionsOverview from 'src/components/trades/TransactionsOverview'
import ReportFiltering from 'src/components/trades/ReportFiltering'

// Models

// Types
import {
	CashewWarehouseType,
	StockDetailsType,
	TransactionDetailsType,
	TransactionFlowType,
	WarehouseDetailsType,
} from 'src/types'

// Hooks and Store
import { useActionStore } from 'src/store/actions/actions'

// Helpers and Constants
import { getCurrentStock, getStockDetails } from 'src/helpers/helpersToTrades'
import { colors } from 'src/constants'
import { ActorDetailRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useOrganizationTransactions, useQueryOneAndWatchChanges } from 'src/hooks/queries'
import OrganizationTransactionList from 'src/components/trades/OrganizationTransactionList'
import OrganizationReceivedAndTransferredTransactions from 'src/components/trades/OrganizationReceivedAndTransferredTransactions'
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
	const { organizationId } = useLocalSearchParams()
	const { pdfUri, setPdfUri, resetPdfUri } = useActionStore()

	const navigation = useNavigation()
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	const bottomSheetModalRef = useRef<BottomSheetModal>(null)
	const [state, setState] = useState<TransactionScreenState>(initialState)

	const {
		data: currentOrganization,
		isLoading: isCurrentOrganizationLoading,
		error: currentOrganizationError,
		isError: isCurrentOrganizationError,
	} = useQueryOneAndWatchChanges<{
		id: string
		name: string
		photo: string
		organization_type: string
		uaid: string
		creation_year: number
		sync_id: string
		address_id: string
		admin_post: string
		district: string
		province: string
		village: string
	}>(
		`
		SELECT 
			a.id,
			ad.other_names as name,
			ad.photo,
			ac.subcategory as organization_type,
			ad.uaid,
			CAST(bd.year AS INTEGER) as creation_year,
			a.sync_id,
			addr.id as address_id,
			COALESCE(ap.name, 'N/A') as admin_post,
			COALESCE(d.name, 'N/A') as district,
			COALESCE(p.name, 'N/A') as province,
			COALESCE(v.name, 'N/A') as village
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
		LEFT JOIN ${TABLES.BIRTH_DATES} bd ON bd.owner_id = a.id AND bd.owner_type = 'GROUP'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON ap.id = addr.admin_post_id
		LEFT JOIN ${TABLES.DISTRICTS} d ON d.id = addr.district_id
		LEFT JOIN ${TABLES.PROVINCES} p ON p.id = addr.province_id
		LEFT JOIN ${TABLES.VILLAGES} v ON v.id = addr.village_id
		WHERE a.id = ? AND a.category = 'GROUP'
	`,
		[organizationId as string],
	)
	const { transactions, currentStock, isTransactionsLoading, transactionsError, isTransactionsError } =
		useOrganizationTransactions(organizationId as string)

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

		// set the header title
		const headerTitle = currentOrganization?.name

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
			headerTitle: () => (
				<View className="flex flex-col items-center w-[80%]">
					<Text
						ellipsizeMode="middle"
						numberOfLines={1}
						className="text-black dark:text-white text-[14px] font-bold text-center"
					>
						Transacções
					</Text>
					<Text
						ellipsizeMode="middle"
						numberOfLines={1}
						className="text-gray-600 font-semibold dark:text-gray-400 text-[12px] text-center"
					>
						{headerTitle}
					</Text>
				</View>
			),
			headerRight: () => (state.isShowingExistingTransactions ? <CustomPopUpMenu options={[]} /> : undefined),
			headerBackVisible: false, // This hides the native back arrow
		})
	}, [state.isShowingExistingTransactions, currentOrganization, transactions])

	if (pdfUri) {
		return <DisplayPDF />
	}

	return (
		<View className="flex-1 bg-white dark:bg-black space-y-2">
			{(state.isShowingExistingTransactions || state.showReceivedTransactions) && currentOrganization && (
				<TransactionActionButtons
					warehouseId={undefined}
					organizationId={organizationId as string}
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
					warehouseStatus={true}
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
					warehouseType={currentOrganization?.organization_type as CashewWarehouseType}
				/>
			)}

			{!state.isShowingExistingTransactions &&
				!state.showOverview &&
				!state.isLoading &&
				!state.showReceivedTransactions && (
					<AddOrganizationTransactions
						setIsShowingExistingTransactions={(isShowingExistingTransactions) =>
							setState((prev) => ({ ...prev, isShowingExistingTransactions }))
						}
						setShowOverview={(showOverview) => setState((prev) => ({ ...prev, showOverview }))}
						currentStock={getCurrentStock(
							transactions.map((transaction) => ({
								quantity: transaction.quantity || 0,
								transaction_type: transaction.transaction_type as TransactionFlowType,
							})),
						)}
						organization={currentOrganization!}
					/>
				)}

			{state.isLoading && <CustomShimmerPlaceholderItemList count={10} height={100} />}

			{state.showReceivedTransactions && !state.isLoading && (
				<OrganizationReceivedAndTransferredTransactions storeType={'GROUP'} organizationId={organizationId as string} />
			)}

			{state.isShowingExistingTransactions && !state.isLoading && !state.showOverview && (
				<OrganizationTransactionList transactions={transactions} />
			)}

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
							hint={'grupo'}
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
							storeDetails={
								currentOrganization
									? {
											id: currentOrganization.id,
											description: currentOrganization.name,
											is_active: 'true',
											owner_id: currentOrganization.id,
											address_id: currentOrganization.address_id,
											warehouse_type: currentOrganization.organization_type,
										}
									: null
							}
						/>
					</View>
				</View>
			</CustomBottomSheetModal>
		</View>
	)
}
