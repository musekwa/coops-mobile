// React and React Native imports
import React, { useCallback, useEffect, useState } from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useColorScheme } from 'nativewind'

// Third party imports
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

// Components
import CustomPopUpMenu from '../menus/CustomPopUpMenu'
import { CustomShimmerPlaceholderItemList } from '../placeholder/CustomShimmerPlaceholder'
import SingleTradeStats from './SingleTradeStats'

// Constants and Types
import { colors } from 'src/constants'
import { MultiCategory, TransactionFlowType } from 'src/types'

import { ActorDetailRecord, TABLES, WarehouseDetailRecord } from 'src/library/powersync/schemas/AppSchema'
import { useQueryManyAndWatchChanges, useUserDetails } from 'src/hooks/queries'

interface Address {
	province: string
	district: string
	admin_post: string
	village: string
}

type DistrictOverviewProps = {
	handleSnapPress: (index: number) => void
	reportHint: string
	setReportHint: (hint: string) => void
	setWarehousesByType: (warehouses: {
		buyingPoints: (WarehouseDetailRecord & Address)[]
		aggregationPoints: (WarehouseDetailRecord & Address)[]
		destinationPoints: (WarehouseDetailRecord & Address)[]
	}) => void
	warehousesByType: {
		buyingPoints: (WarehouseDetailRecord & Address)[]
		aggregationPoints: (WarehouseDetailRecord & Address)[]
		destinationPoints: (WarehouseDetailRecord & Address)[]
	} | null

	setOrgsByType: (orgsByType: {
		associations: (ActorDetailRecord & Address)[]
		cooperatives: (ActorDetailRecord & Address)[]
		coop_unions: (ActorDetailRecord & Address)[]
	}) => void
	setTradersByType: (tradersByType: {
		primaries: (ActorDetailRecord & Address)[]
		secondaries: (ActorDetailRecord & Address)[]
		finals: (ActorDetailRecord & Address)[]
	}) => void
	tradersByType: {
		primaries: (ActorDetailRecord & Address)[]
		secondaries: (ActorDetailRecord & Address)[]
		finals: (ActorDetailRecord & Address)[]
	} | null
}

interface TransactionStats {
	quantityProduced: number
	quantityTransferredOut: number
	quantityTransferredIn: number
	quantityExported: number
	quantityProcessed: number
	quantityLost: number
	currentStock: number
}

interface TraderCounts {
	primary: number
	secondary: number
	final: number
	informal: number
	total: number
}

interface GroupsSummary {
	groupsCount: number
	aggregated: number
	sold: number
	available: number
}

interface AdminPostStats {
	adminPost: string
	produced: number
	available: number
}

const useTransactionStats = (): {
	stats: TransactionStats
	isLoading: boolean
	refreshing: boolean
	onRefresh: () => void
} => {
	const { userDetails } = useUserDetails()
	const [isLoading, setIsLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)
	const [refreshTrigger, setRefreshTrigger] = useState(0)
	const [stats, setStats] = useState<TransactionStats>({
		quantityProduced: 0,
		quantityTransferredOut: 0,
		quantityTransferredIn: 0,
		quantityExported: 0,
		quantityProcessed: 0,
		quantityLost: 0,
		currentStock: 0,
	})

	const {
		data: districtOrganizationTransactions,
		isLoading: isDistrictOrganizationTransactionsLoading,
		error: districtOrganizationTransactionsError,
		isError: isDistrictOrganizationTransactionsError,
	} = useQueryManyAndWatchChanges<{
		id: string
		store_id: string
		reference_store_id: string
		quantity: number
		unit_price: number
		transaction_type: string
		reference_store_district?: string
		store_district?: string
	}>(
		`SELECT 
			t.id as id,
			t.store_id,
			t.reference_store_id,
			t.quantity,
			t.unit_price,
			t.transaction_type,
			CASE 
				WHEN t.reference_store_id IS NOT NULL THEN (
					SELECT addr.district_id 
					FROM ${TABLES.ACTORS} a
					LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
					WHERE a.id = t.reference_store_id AND a.category = 'GROUP'
				)
			END as reference_store_district,
			(
				SELECT addr.district_id 
				FROM ${TABLES.ACTORS} a
				LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
				WHERE a.id = t.store_id AND a.category = 'GROUP'
			) as store_district
		FROM ${TABLES.ORGANIZATION_TRANSACTIONS} t
		WHERE store_id IN (
			SELECT a.id FROM ${TABLES.ACTORS} a
			LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
			WHERE addr.district_id = '${userDetails?.district_id}' AND a.category = 'GROUP'
		)
		AND ${refreshTrigger} = ${refreshTrigger}
	`,
	)

	const {
		data: districtWarehouseTransactions,
		isLoading: isDistrictWarehouseTransactionsLoading,
		error: districtWarehouseTransactionsError,
		isError: isDistrictWarehouseTransactionsError,
	} = useQueryManyAndWatchChanges<{
		id: string
		store_id: string
		reference_store_id: string
		quantity: number
		unit_price: number
		transaction_type: string
		reference_store_district?: string
		store_district?: string
	}>(
		`SELECT 
			t.id as id,
			t.store_id,
			t.reference_store_id,
			t.quantity,
			t.unit_price,
			t.transaction_type,
			CASE 
				WHEN t.reference_store_id IS NOT NULL THEN (
					SELECT ad.district_id 
					FROM ${TABLES.WAREHOUSE_DETAILS} wd
					LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
					WHERE wd.id = t.reference_store_id
				)
			END as reference_store_district,
			(
				SELECT ad.district_id 
				FROM ${TABLES.WAREHOUSE_DETAILS} wd
				LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
				WHERE wd.id = t.store_id
			) as store_district
		FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} t
		WHERE store_id IN (
			SELECT wd.id FROM ${TABLES.WAREHOUSE_DETAILS} wd
			LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
			WHERE ad.district_id = '${userDetails?.district_id}'
		)
		AND ${refreshTrigger} = ${refreshTrigger}
		`,
	)

	const onRefresh = useCallback(() => {
		setRefreshing(true)
		setIsLoading(true)
		setStats({
			quantityProduced: 0,
			quantityTransferredOut: 0,
			quantityTransferredIn: 0,
			quantityExported: 0,
			quantityProcessed: 0,
			quantityLost: 0,
			currentStock: 0,
		})
		setRefreshTrigger((prev) => prev + 1)
		setTimeout(() => {
			setRefreshing(false)
		}, 1000)
	}, [])

	useEffect(() => {
		const processData = async () => {
			if (!districtOrganizationTransactions || !districtWarehouseTransactions) {
				return
			}

			try {
				const mergedTransactions = [...districtOrganizationTransactions, ...districtWarehouseTransactions]

				const produced = mergedTransactions.filter(
					(transaction) =>
						transaction.transaction_type === TransactionFlowType.BOUGHT ||
						transaction.transaction_type === TransactionFlowType.AGGREGATED,
				)
				const quantityProduced = produced.reduce((acc, transaction) => acc + transaction.quantity, 0)

				const transferred = mergedTransactions.filter(
					(transaction) =>
						transaction.transaction_type === TransactionFlowType.TRANSFERRED_OUT &&
						transaction.reference_store_district !== userDetails?.district_id,
				)
				const quantityTransferredOut = transferred.reduce((acc, transaction) => acc + transaction.quantity, 0)

				const received = mergedTransactions.filter(
					(transaction) =>
						transaction.transaction_type === TransactionFlowType.TRANSFERRED_IN &&
						transaction.store_district !== userDetails?.district_id,
				)
				const quantityTransferredIn = received.reduce((acc, transaction) => acc + transaction.quantity, 0)

				const exported = mergedTransactions.filter(
					(transaction) => transaction.transaction_type === TransactionFlowType.EXPORTED,
				)
				const quantityExported = exported.reduce((acc, transaction) => acc + transaction.quantity, 0)

				const processed = mergedTransactions.filter(
					(transaction) => transaction.transaction_type === TransactionFlowType.PROCESSED,
				)
				const quantityProcessed = processed.reduce((acc, transaction) => acc + transaction.quantity, 0)

				const lost = mergedTransactions.filter(
					(transaction) => transaction.transaction_type === TransactionFlowType.LOST,
				)
				const quantityLost = lost.reduce((acc, transaction) => acc + transaction.quantity, 0)

				const currentStock =
					quantityProduced +
					quantityTransferredIn -
					(quantityTransferredOut + quantityExported + quantityProcessed + quantityLost)

				setStats({
					quantityProduced,
					quantityTransferredOut,
					quantityTransferredIn,
					quantityExported,
					quantityProcessed,
					quantityLost,
					currentStock,
				})
			} catch (error) {
				console.error('Error processing transaction data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		processData()
	}, [districtOrganizationTransactions, districtWarehouseTransactions, userDetails?.district_id])

	return { stats, isLoading, refreshing, onRefresh }
}

const CampaignSelector = () => {
	const [selectedCampaign, setSelectedCampaign] = useState('2024-2025')
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	return (
		<View className="flex-col justify-between items-center py-4">
			<CustomPopUpMenu
				icon={<Ionicons name="chevron-down" size={24} color={colors.primary} />}
				options={[
					{
						label: '2024-2025',
						action: () => setSelectedCampaign('2024-2025'),
						icon: <Ionicons name="calendar-outline" size={18} color={isDarkMode ? colors.white : colors.black} />,
					},
				]}
			/>
			<Text className="text-[10px] text-gray-500 dark:text-gray-400 italic -mt-1">Campanha</Text>
		</View>
	)
}

const CashewTradesStats = ({ stats }: { stats: TransactionStats }) => {
	return (
		<View className="flex-row justify-between space-x-2 w-full rounded-md border-gray-300">
			<SingleTradeStats
				label="Disponível (kg)"
				value={Intl.NumberFormat('pt-BR').format(stats.currentStock)}
				containerClassName="rounded-md border-gray-300 px-1 px-2"
				labelClassName="text-gray-500 text-[10px] italic"
				valueClassName="text-[14px] font-normal text-black dark:text-white"
				icon={<MaterialCommunityIcons name="point-of-sale" size={18} color={colors.gray600} />}
			/>
			<SingleTradeStats
				label="Transferido (kg)"
				value={Intl.NumberFormat('pt-BR').format(stats.quantityTransferredOut)}
				containerClassName="rounded-md border-gray-300 px-1 px-2"
				labelClassName="text-gray-500 text-[10px] italic"
				valueClassName="text-[14px] font-normal text-black dark:text-white"
				icon={<MaterialCommunityIcons name="arrow-u-up-right" size={24} color={colors.gray600} />}
			/>
			<SingleTradeStats
				label="Recebido (kg)"
				value={Intl.NumberFormat('pt-BR').format(stats.quantityTransferredIn)}
				containerClassName="rounded-md border-gray-300 px-1 px-2"
				labelClassName="text-gray-500 text-[10px] italic"
				valueClassName="text-[14px] font-normal text-black dark:text-white"
				icon={<MaterialCommunityIcons name="arrow-u-down-left" size={24} color={colors.gray600} />}
			/>
		</View>
	)
}

const useTraderCounts = (): TraderCounts => {
	const { userDetails } = useUserDetails()
	const [counts, setCounts] = useState<TraderCounts>({
		primary: 0,
		secondary: 0,
		final: 0,
		informal: 0,
		total: 0,
	})

	const {
		data: districtTraders,
		isLoading: isDistrictTradersLoading,
		error: districtTradersError,
		isError: isDistrictTradersError,
	} = useQueryManyAndWatchChanges<{
		id: string
		multicategory: string
	}>(
		`SELECT DISTINCT 
			t.actor_id as id, 
			GROUP_CONCAT(ac.subcategory, ';') as multicategory
		FROM ${TABLES.ACTOR_DETAILS} t
		INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = t.actor_id AND ac.category = 'TRADER'
		JOIN ${TABLES.WAREHOUSE_DETAILS} wd ON wd.owner_id = t.actor_id
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
		WHERE ad.district_id = '${userDetails?.district_id}'
		AND wd.is_active = 'true'
		GROUP BY t.actor_id`,
	)

	useEffect(() => {
		if (districtTraders) {
			const counts = districtTraders.reduce(
				(acc, trader) => {
					const categories = trader.multicategory.split(';')

					if (categories.includes(MultiCategory.TRADER_PRIMARY)) {
						acc.primary++
					}
					if (categories.includes(MultiCategory.TRADER_SECONDARY)) {
						acc.secondary++
					}
					if (
						categories.some((cat) =>
							[
								MultiCategory.TRADER_EXPORT,
								MultiCategory.TRADER_LARGE_SCALE_PROCESSING,
								MultiCategory.TRADER_SMALL_SCALE_PROCESSING,
							].includes(cat as MultiCategory),
						)
					) {
						acc.final++
					}
					if (categories.includes(MultiCategory.TRADER_INFORMAL)) {
						acc.informal++
					}
					return acc
				},
				{
					primary: 0,
					secondary: 0,
					final: 0,
					informal: 0,
					total: districtTraders.length,
				},
			)

			setCounts(counts)
		}
	}, [districtTraders])
	return counts
}

const ActiveTradersCounts = () => {
	const counts = useTraderCounts()

	return (
		<View className="flex-col justify-between w-full py-2 mt-3 space-y-2 border p-1 rounded-md border-gray-300">
			<View className="flex-row justify-between space-x-3 w-full">
				<View className="flex-row justify-between space-x-2">
					<Ionicons name="people-outline" size={20} color={colors.primary} />
					<Text className="text-[#008000] text-[14px] font-semibold">Comerciantes activos</Text>
				</View>
				<View className="flex-row justify-between space-x-2 bg-green-100 rounded-md px-2 py-1">
					<Text className="text-green-600 font-semibold text-[10px] italic">
						Total: {Intl.NumberFormat('pt-BR').format(counts.total)}
					</Text>
				</View>
			</View>
			<View className="flex-row justify-between space-x-3 w-full">
				<SingleTradeStats
					label="Primários"
					value={counts.primary}
					containerClassName="rounded-md border-gray-300 px-1 px-2"
					labelClassName="text-gray-500 text-[10px] italic"
					valueClassName="text-[14px] font-normal text-black dark:text-white"
				/>
				<SingleTradeStats
					label="Intermediários"
					value={counts.secondary}
					containerClassName="rounded-md border-gray-300 px-1 px-2"
					labelClassName="text-gray-500 text-[10px] italic"
					valueClassName="text-[14px] font-normal text-black dark:text-white"
				/>
				<SingleTradeStats
					label="Finais"
					value={counts.final}
					containerClassName="rounded-md border-gray-300 px-1 px-2"
					labelClassName="text-gray-500 text-[10px] italic"
					valueClassName="text-[14px] font-normal text-black dark:text-white"
				/>
				<SingleTradeStats
					label="Informais"
					value={counts.informal}
					containerClassName="rounded-md border-gray-300 px-1 px-2"
					labelClassName="text-gray-500 text-[10px] italic"
					valueClassName="text-[14px] font-normal text-black dark:text-white"
				/>
			</View>
		</View>
	)
}

const useGroupsSummary = (): GroupsSummary => {
	const { userDetails } = useUserDetails()
	const [summary, setSummary] = useState<GroupsSummary>({
		groupsCount: 0,
		aggregated: 0,
		sold: 0,
		available: 0,
	})

	const {
		data: districtGroups,
		isLoading: isDistrictGroupsLoading,
		error: districtGroupsError,
		isError: isDistrictGroupsError,
	} = useQueryManyAndWatchChanges<{
		id: string
		quantity: number
		transaction_type: string
	}>(
		`SELECT 
			a.id,
			t.quantity,
			t.transaction_type
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
		LEFT JOIN ${TABLES.ORGANIZATION_TRANSACTIONS} t ON t.store_id = a.id
		WHERE addr.district_id = '${userDetails?.district_id}'
		AND a.category = 'GROUP'`,
	)

	useEffect(() => {
		if (districtGroups) {
			const uniqueGroups = new Set(districtGroups.map((g) => g.id))
			const aggregated = districtGroups
				.filter((t) => t.transaction_type === TransactionFlowType.AGGREGATED)
				.reduce((sum, t) => sum + (t.quantity || 0), 0)
			const sold = districtGroups
				.filter((t) => t.transaction_type === TransactionFlowType.SOLD)
				.reduce((sum, t) => sum + (t.quantity || 0), 0)
			const transferredIn = districtGroups
				.filter((t) => t.transaction_type === TransactionFlowType.TRANSFERRED_IN)
				.reduce((sum, t) => sum + (t.quantity || 0), 0)
			const transferredOut = districtGroups
				.filter((t) => t.transaction_type === TransactionFlowType.TRANSFERRED_OUT)
				.reduce((sum, t) => sum + (t.quantity || 0), 0)
			const lost = districtGroups
				.filter((t) => t.transaction_type === TransactionFlowType.LOST)
				.reduce((sum, t) => sum + (t.quantity || 0), 0)

			const available = aggregated + transferredIn - (transferredOut + sold + lost)

			setSummary({
				groupsCount: uniqueGroups.size,
				aggregated,
				sold,
				available,
			})
		}
	}, [districtGroups])

	return summary
}

const GroupsSummaryTable = () => {
	const summary = useGroupsSummary()

	return (
		<View className="flex-col justify-between w-full py-2 mt-3 space-y-2 border p-1 rounded-md border-gray-300">
			<View className="flex-row justify-between space-x-3 w-full">
				<View className="flex-row justify-between space-x-2">
					<Ionicons name="business-outline" size={20} color={colors.primary} />
					<Text className="text-[#008000] text-[14px] font-semibold">Grupos activos</Text>
				</View>
				<View className="flex-row justify-between space-x-2 bg-green-100 rounded-md px-2 py-1">
					<Text className="text-green-600 font-semibold text-[10px] italic">
						Total: {Intl.NumberFormat('pt-BR').format(summary.groupsCount)}
					</Text>
				</View>
			</View>
			<View className="flex-row justify-between space-x-3 w-full">
				<SingleTradeStats
					label="Agregado"
					value={Intl.NumberFormat('pt-BR').format(summary.aggregated)}
					containerClassName="rounded-md border-gray-300 px-1 px-2"
					labelClassName="text-gray-500 text-[10px] italic"
					valueClassName="text-[14px] font-normal text-black dark:text-white"
				/>
				<SingleTradeStats
					label="Vendido"
					value={Intl.NumberFormat('pt-BR').format(summary.sold)}
					containerClassName="rounded-md border-gray-300 px-1 px-2"
					labelClassName="text-gray-500 text-[10px] italic"
					valueClassName="text-[14px] font-normal text-black dark:text-white"
				/>
				<SingleTradeStats
					label="Disponível"
					value={Intl.NumberFormat('pt-BR').format(summary.available)}
					containerClassName="rounded-md border-gray-300 px-1 px-2"
					labelClassName="text-gray-500 text-[10px] italic"
					valueClassName="text-[14px] font-normal text-black dark:text-white"
				/>
			</View>
		</View>
	)
}

const useAdminPostStats = (): AdminPostStats[] => {
	const { userDetails } = useUserDetails()
	const [stats, setStats] = useState<AdminPostStats[]>([])

	const {
		data: adminPostTransactions,
		isLoading: isAdminPostTransactionsLoading,
		error: adminPostTransactionsError,
		isError: isAdminPostTransactionsError,
	} = useQueryManyAndWatchChanges<{
		admin_post_id: string
		admin_post_name: string
		quantity: number
		transaction_type: string
		store_type: 'WAREHOUSE' | 'ORGANIZATION'
		reference_store_admin_post_id?: string
	}>(
		`SELECT 
			ap.id as admin_post_id,
			ap.name as admin_post_name,
			t.quantity,
			t.transaction_type,
			CASE 
				WHEN t.store_id IN (SELECT id FROM ${TABLES.WAREHOUSE_DETAILS}) THEN 'WAREHOUSE'
				ELSE 'ORGANIZATION'
			END as store_type,
			CASE 
				WHEN t.reference_store_id IN (SELECT id FROM ${TABLES.WAREHOUSE_DETAILS}) THEN (
					SELECT ad2.admin_post_id 
					FROM ${TABLES.WAREHOUSE_DETAILS} wd
					LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad2 ON ad2.owner_id = wd.id AND ad2.owner_type = 'WAREHOUSE'
					WHERE wd.id = t.reference_store_id
				)
				WHEN t.reference_store_id IN (SELECT id FROM ${TABLES.ACTORS} WHERE category = 'GROUP') THEN (
					SELECT addr.admin_post_id 
					FROM ${TABLES.ACTORS} a
					LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
					WHERE a.id = t.reference_store_id AND a.category = 'GROUP'
				)
			END as reference_store_admin_post_id
		FROM (
			SELECT store_id, reference_store_id, quantity, transaction_type
			FROM ${TABLES.ORGANIZATION_TRANSACTIONS}
			UNION ALL
			SELECT store_id, reference_store_id, quantity, transaction_type
			FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS}
		) t
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON (
			(t.store_id IN (SELECT id FROM ${TABLES.WAREHOUSE_DETAILS}) AND ad.owner_id = t.store_id AND ad.owner_type = 'WAREHOUSE')
			OR
			(t.store_id IN (SELECT id FROM ${TABLES.ACTORS} WHERE category = 'GROUP') AND ad.owner_id = t.store_id AND ad.owner_type = 'GROUP')
		)
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON ap.id = ad.admin_post_id
		WHERE ad.district_id = '${userDetails?.district_id}'`,
	)

	useEffect(() => {
		if (adminPostTransactions) {
			const adminPosts = new Set(adminPostTransactions.map((t) => t.admin_post_id))
			const stats = Array.from(adminPosts).map((adminPostId) => {
				const adminPostName = adminPostTransactions.find((t) => t.admin_post_id === adminPostId)?.admin_post_name || ''
				const transactions = adminPostTransactions.filter((t) => t.admin_post_id === adminPostId)

				// Calculate bought cashew (BOUGHT for warehouses + AGGREGATED for organizations)
				const bought = transactions
					.filter(
						(t) =>
							(t.transaction_type === TransactionFlowType.BOUGHT && t.store_type === 'WAREHOUSE') ||
							(t.transaction_type === TransactionFlowType.AGGREGATED && t.store_type === 'ORGANIZATION'),
					)
					.reduce((sum, t) => sum + (t.quantity || 0), 0)

				// Calculate available stock
				const aggregated = transactions
					.filter((t) => t.transaction_type === TransactionFlowType.AGGREGATED)
					.reduce((sum, t) => sum + (t.quantity || 0), 0)
				const boughtWarehouse = transactions
					.filter((t) => t.transaction_type === TransactionFlowType.BOUGHT)
					.reduce((sum, t) => sum + (t.quantity || 0), 0)
				const transferredIn = transactions
					.filter(
						(t) =>
							t.transaction_type === TransactionFlowType.TRANSFERRED_IN &&
							t.reference_store_admin_post_id !== adminPostId,
					)
					.reduce((sum, t) => sum + (t.quantity || 0), 0)
				const transferredOut = transactions
					.filter(
						(t) =>
							t.transaction_type === TransactionFlowType.TRANSFERRED_OUT &&
							t.reference_store_admin_post_id !== adminPostId,
					)
					.reduce((sum, t) => sum + (t.quantity || 0), 0)
				const lost = transactions
					.filter((t) => t.transaction_type === TransactionFlowType.LOST)
					.reduce((sum, t) => sum + (t.quantity || 0), 0)
				const exported = transactions
					.filter((t) => t.transaction_type === TransactionFlowType.EXPORTED)
					.reduce((sum, t) => sum + (t.quantity || 0), 0)
				const processed = transactions
					.filter((t) => t.transaction_type === TransactionFlowType.PROCESSED)
					.reduce((sum, t) => sum + (t.quantity || 0), 0)
				const sold = transactions
					.filter((t) => t.transaction_type === TransactionFlowType.SOLD)
					.reduce((sum, t) => sum + (t.quantity || 0), 0)

				const available =
					aggregated + boughtWarehouse + transferredIn - (transferredOut + lost + exported + processed + sold)

				return {
					adminPost: adminPostName,
					produced: bought,
					available,
				}
			})

			setStats(stats)
		}
	}, [adminPostTransactions])

	return stats
}

const AdminPostTransactionsTable = () => {
	const stats = useAdminPostStats()

	return (
		<View className="flex-col justify-between w-full py-2 mt-3 space-y-2 border p-1 rounded-md border-gray-300">
			<View className="flex-row justify-between space-x-3 w-full mb-2">
				<View className="flex-row justify-between space-x-2">
					<Ionicons name="location-outline" size={20} color={colors.primary} />
					<Text className="text-[#008000] text-[14px] font-semibold">Postos administrativos</Text>
				</View>
				<View className="flex-row justify-between space-x-2 bg-green-100 rounded-md px-2 py-1">
					<Text className="text-green-600 font-semibold text-[10px] italic">
						Total: {Intl.NumberFormat('pt-BR').format(stats.length)}
					</Text>
				</View>
			</View>

			{/* Table Header */}
			<View className="flex-row w-full border-b border-gray-200 pb-2">
				<Text className="w-1/3 text-[12px] font-semibold text-gray-600 dark:text-gray-400">Posto administrativo</Text>
				<Text className="w-1/3 text-[12px] font-semibold text-gray-600 dark:text-gray-400 text-center">Comprado (kg)</Text>
				<Text className="w-1/3 text-[12px] font-semibold text-gray-600 dark:text-gray-400 text-center">Disponível (kg)</Text>
			</View>

			{/* Table Body */}
			<View className="flex-col space-y-1">
				{stats.map((stat) => (
					<View key={stat.adminPost} className="flex-row w-full py-2 border-b border-gray-100">
						<Text className="w-1/3 text-[12px] text-gray-800 dark:text-gray-400">{stat.adminPost}</Text>
						<Text className="w-1/3 text-[12px] text-gray-800 dark:text-gray-400 text-center">
							{Intl.NumberFormat('pt-BR').format(stat.produced)}
						</Text>
						<Text className="w-1/3 text-[12px] text-gray-800 dark:text-gray-400 text-center">
							{Intl.NumberFormat('pt-BR').format(stat.available)}
						</Text>
					</View>
				))}
			</View>

			{/* Table Footer */}
			<View className="flex-row w-full pt-4">
				<Text className="w-1/3 text-[12px] font-semibold text-gray-600 dark:text-gray-400">Total</Text>
				<Text className="w-1/3 text-[12px] font-semibold text-gray-600 dark:text-gray-400 text-center">
					{Intl.NumberFormat('pt-BR').format(stats.reduce((sum, stat) => sum + stat.produced, 0))}
				</Text>
				<Text className="w-1/3 text-[12px] font-semibold text-gray-600 dark:text-gray-400 text-center">
					{Intl.NumberFormat('pt-BR').format(stats.reduce((sum, stat) => sum + stat.available, 0))}
				</Text>
			</View>
		</View>
	)
}

const DistrictOverviewSkeleton = () => {
	return (
		<View className="flex-1 bg-white dark:bg-black justify-center px-3">
			<View className="w-full space-y-3">
				{/* Volume Produzido and Campaign Selector */}
				<View className="flex-row justify-between space-x-3 w-full">
					<View className="flex-col justify-between py-4">
						<CustomShimmerPlaceholderItemList count={1} height={40} />
					</View>
					<View className="flex-row space-x-3">
						<CustomShimmerPlaceholderItemList count={1} height={40} />
					</View>
				</View>

				{/* Cashew Trades Stats */}
				<View className="flex-row justify-between space-x-2 w-full">
					<CustomShimmerPlaceholderItemList count={3} height={60} />
				</View>

				{/* Active Traders */}
				<View className="flex-col justify-between w-full py-2 mt-3 space-y-2 border p-1 rounded-md border-gray-300">
					<View className="flex-row justify-between space-x-3 w-full">
						<CustomShimmerPlaceholderItemList count={1} height={20} />
					</View>
					<View className="flex-row justify-between space-x-3 w-full">
						<CustomShimmerPlaceholderItemList count={4} height={40} />
					</View>
				</View>

				{/* Groups Summary */}
				<View className="flex-col justify-between w-full py-2 mt-3 space-y-2 border p-1 rounded-md border-gray-300">
					<View className="flex-row justify-between space-x-3 w-full">
						<CustomShimmerPlaceholderItemList count={1} height={20} />
					</View>
					<View className="flex-row justify-between space-x-3 w-full">
						<CustomShimmerPlaceholderItemList count={3} height={40} />
					</View>
				</View>

				{/* Admin Post Transactions */}
				<View className="flex-col justify-between w-full py-2 mt-3 space-y-2 border p-1 rounded-md border-gray-300">
					<View className="flex-row justify-between space-x-3 w-full mb-2">
						<CustomShimmerPlaceholderItemList count={1} height={20} />
					</View>
					{/* Table Header */}
					<View className="flex-row w-full border-b border-gray-200 pb-2">
						<CustomShimmerPlaceholderItemList count={3} height={20} />
					</View>
					{/* Table Body */}
					<View className="flex-col space-y-1">
						{[1, 2, 3].map((_, index) => (
							<View key={index} className="flex-row w-full py-2 border-b border-gray-100">
								<CustomShimmerPlaceholderItemList count={3} height={20} />
							</View>
						))}
					</View>
					{/* Table Footer */}
					<View className="flex-row w-full pt-2 border-t border-gray-200">
						<CustomShimmerPlaceholderItemList count={3} height={20} />
					</View>
				</View>
			</View>
		</View>
	)
}

const VolumeProduced = ({ quantity }: { quantity: number }) => (
	<View className="flex-col justify-between py-4">
		<SingleTradeStats label="Volume produzido" value={`${Intl.NumberFormat('pt-BR').format(quantity)} kg`} />
	</View>
)

export default function DistrictOverview({
	handleSnapPress,
	reportHint,
	setReportHint,
	setWarehousesByType,
	warehousesByType,
	setOrgsByType,
	setTradersByType,
	tradersByType,
}: DistrictOverviewProps) {
	const { stats, isLoading, refreshing, onRefresh } = useTransactionStats()
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	return (
		<>
			{/* @ts-expect-error - react-native-reanimated Animated.View type definitions don't include children */}
			<Animated.View
				entering={FadeIn.duration(500).delay(100)}
				className="flex-1 bg-white dark:bg-black justify-center px-3"
			>
			{isLoading ? (
				<DistrictOverviewSkeleton />
			) : (
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
						paddingBottom: 50,
					}}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							tintColor={isDarkMode ? colors.white : colors.black}
						/>
					}
				>
					<View className="w-full">
						<View className="flex-row justify-between space-x-3 w-full">
							<VolumeProduced quantity={stats.quantityProduced} />
							<View className="flex-row space-x-3">
								<CampaignSelector />
							</View>
						</View>
						<CashewTradesStats stats={stats} />
						<ActiveTradersCounts />
						<GroupsSummaryTable />
						<AdminPostTransactionsTable />
					</View>
				</ScrollView>
			)}
		</Animated.View>
		</>
	)
}
