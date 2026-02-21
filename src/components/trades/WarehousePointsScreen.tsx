// React and React Native imports
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SectionList, Text, TouchableOpacity, View } from 'react-native'

// Third-party library imports
import { Ionicons } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useNavigation } from 'expo-router'
import { useColorScheme } from 'nativewind'
import Animated, { SlideInDown } from 'react-native-reanimated'

// Components
import CustomBottomSheetModal from 'src/components/modals/CustomBottomSheetModal'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import ActorListEmpty from 'src/components/not-found/ActorListEmpty'
import { CustomShimmerPlaceholderItemList } from 'src/components/placeholder/CustomShimmerPlaceholder'
import CashewWarehouseSectionedListItem from 'src/components/trades/CashewWarehouseSectionedListItem'
import Accordion from 'src/components/ui/custom-accordion'

// Constants and config
import { colors } from 'src/constants'

// Hooks
import { useNavigationSearch } from 'src/hooks/useNavigationSearch'
import { useLocationName, useSearchOptions, SearchKey } from 'src/hooks/queries'

import { ActionType, CashewWarehouseType, TransactionFlowType } from 'src/types'
import { CashewWarehouseTransactionRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useQueryMany, useUserDetails } from 'src/hooks/queries'
import {
	Warehouse,
	WarehouseGroup,
	WarehouseOwner,
	WarehouseWithAddressAndOwnerAndContact,
} from 'src/features/trades/data/types'
import { getCurrentStock } from 'src/helpers/helpersToTrades'
import CustomSafeAreaView from '../layouts/safe-area-view'

// Types
interface WarehouseTypeConfig {
	title: string
	searchPlaceholder: string
	emptyMessage: string
}

interface CurrentStock {
	id: string
	currentStock: number
}

// Configuration
const getWarehouseTypeConfig = (warehouseType: CashewWarehouseType): WarehouseTypeConfig => {
	const configs: Record<CashewWarehouseType, WarehouseTypeConfig> = {
		[CashewWarehouseType.BUYING]: {
			title: 'Postos de Compras',
			searchPlaceholder: 'Procurar Postos de Compras',
			emptyMessage: 'Ainda não há postos de compras neste distrito',
		},
		[CashewWarehouseType.AGGREGATION]: {
			title: 'Armazéns de Trânsito',
			searchPlaceholder: 'Procurar Armazéns de Trânsito',
			emptyMessage: 'Ainda não há armazéns de trânsito neste distrito',
		},
		[CashewWarehouseType.DESTINATION]: {
			title: 'Armazéns de Destino',
			searchPlaceholder: 'Procurar Armazéns de Destino',
			emptyMessage: 'Ainda não há armazéns de destino neste distrito',
		},
		[CashewWarehouseType.COOPERATIVE]: {
			title: 'Cooperativas',
			searchPlaceholder: 'Procurar Cooperativas',
			emptyMessage: 'Ainda não há cooperativas neste distrito',
		},
		[CashewWarehouseType.COOP_UNION]: {
			title: 'Uniões de Cooperativas',
			searchPlaceholder: 'Procurar Uniões de Cooperativas',
			emptyMessage: 'Ainda não há uniões de cooperativas neste distrito',
		},
		[CashewWarehouseType.ASSOCIATION]: {
			title: 'Associações',
			searchPlaceholder: 'Procurar Associações',
			emptyMessage: 'Ainda não há associações neste distrito',
		},
	}

	return (
		configs[warehouseType] || {
			title: 'Armazéns',
			searchPlaceholder: 'Procurar Armazéns',
			emptyMessage: 'Ainda não há armazéns neste distrito',
		}
	)
}

// Custom Hooks - Warehouse specific
const useWarehouseData = (warehouseType: CashewWarehouseType, userDistrictId?: string) => {
	const {
		data: warehouses,
		isLoading: isWarehousesLoading,
		error: warehousesError,
		isError: isWarehousesError,
	} = useQueryMany<WarehouseWithAddressAndOwnerAndContact>(
		`SELECT 
			wd.id,
			wd.description,
			wd.is_active,
			wd.owner_id,
			ad.id as address_id,
			wd.type as warehouse_type,
			cd.id as contact_id,
			ad.gps_lat,
			ad.gps_long,
			ap.name as admin_post_name,
			ap.id as admin_post_id,
			d.name as district_name,
			p.name as province_name,
			v.name as village_name,
			v.id as village_id,
			t.other_names,
			t.surname,
			t.photo,
			cd.primary_phone,
			cd.secondary_phone
		FROM ${TABLES.WAREHOUSE_DETAILS} wd
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON ap.id = ad.admin_post_id
		LEFT JOIN ${TABLES.DISTRICTS} d ON d.id = ad.district_id
		LEFT JOIN ${TABLES.PROVINCES} p ON p.id = ad.province_id
		LEFT JOIN ${TABLES.VILLAGES} v ON v.id = ad.village_id
		JOIN ${TABLES.ACTOR_DETAILS} t ON wd.owner_id = t.actor_id
		LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = t.actor_id AND cd.owner_type = 'TRADER'
		WHERE wd.type = '${warehouseType}'
		AND ad.district_id = '${userDistrictId}'
		AND wd.is_active = 'true'`,
	)

	const warehouseIds = warehouses.map((warehouse) => `'${warehouse.id}'`).join(',')
	const warehouseIdsQuery = warehouseIds ? warehouseIds : "''"

	const {
		data: transactions,
		isLoading: isTransactionsLoading,
		error: transactionsError,
		isError: isTransactionsError,
	} = useQueryMany<CashewWarehouseTransactionRecord>(
		`SELECT created_at, updated_at, store_id, quantity, transaction_type 
		FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} 
		WHERE store_id IN (${warehouseIdsQuery}) 
		ORDER BY created_at DESC`,
	)

	return {
		warehouses,
		transactions,
		isLoading: isWarehousesLoading || isTransactionsLoading,
		error: warehousesError || transactionsError,
		isError: isWarehousesError || isTransactionsError,
	}
}

const useCurrentStocks = (
	warehouses: WarehouseWithAddressAndOwnerAndContact[],
	transactions: CashewWarehouseTransactionRecord[],
) => {
	return useMemo((): CurrentStock[] => {
		return warehouses.map((warehouse) => {
			const warehouseTransactions = transactions.filter((transaction) => transaction.store_id === warehouse.id)

			return {
				id: warehouse.id,
				currentStock: getCurrentStock(
					warehouseTransactions.map((transaction) => ({
						quantity: transaction.quantity || 0,
						transaction_type: transaction.transaction_type as TransactionFlowType,
					})),
				),
			}
		})
	}, [warehouses, transactions])
}

const useGroupedWarehouses = (warehouses: WarehouseWithAddressAndOwnerAndContact[], searchKey: string) => {
	return useMemo((): WarehouseGroup[] => {
		const filteredWarehouses = searchKey
			? warehouses.filter((warehouse) => warehouse.admin_post_name === searchKey)
			: warehouses

		const grouped: Record<string, WarehouseGroup> = {}

		filteredWarehouses.forEach((warehouse) => {
			const ownerName = `${warehouse.other_names} ${
				warehouse.surname?.toLowerCase().includes('company') ? '(empresa)' : warehouse.surname
			}`

			if (!grouped[ownerName]) {
				grouped[ownerName] = {
					owner: {
						name: ownerName,
						phone: getOwnerPhone(warehouse.primary_phone, warehouse.secondary_phone),
						photo: warehouse.photo,
					},
					data: [],
				}
			}

			const processedWarehouse: Warehouse = {
				id: warehouse.id,
				village_name: warehouse.village_name,
				admin_post_name: warehouse.admin_post_name,
				village_id: warehouse.village_id || 'N/A',
				admin_post_id: warehouse.admin_post_id || 'N/A',
				is_active: warehouse.is_active,
				description: warehouse.description,
			}

			grouped[ownerName].data.push(processedWarehouse)
		})

		return Object.values(grouped)
	}, [warehouses, searchKey])
}

// Utility Functions
const getOwnerPhone = (primaryPhone?: string, secondaryPhone?: string): string => {
	if (primaryPhone && primaryPhone !== 'N/A') return primaryPhone
	if (secondaryPhone && secondaryPhone !== 'N/A') return secondaryPhone
	return 'Sem telefone'
}

const getOwnerName = (otherNames: string, surname: string): string => {
	const companySuffix = surname?.toLowerCase().includes('company') ? '(empresa)' : surname
	return `${otherNames} ${companySuffix}`
}

// Main Component
export default function WarehousePointsScreen({ warehouseType }: { warehouseType: CashewWarehouseType }) {
	const config = getWarehouseTypeConfig(warehouseType)
	const { userDetails } = useUserDetails()
	const navigation = useNavigation()
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	// State
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
	const [showError, setShowError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [searchKey, setSearchKey] = useState<string>('')
	const [isSearchOptionsVisible, setIsSearchOptionsVisible] = useState(false)
	const bottomSheetModalRef = useRef<BottomSheetModal>(null)

	// Custom hooks
	const { search, setSearch } = useNavigationSearch({
		searchBarOptions: { placeholder: config.searchPlaceholder },
	})

	const {
		warehouses,
		transactions,
		isLoading: isDataLoading,
		error,
		isError,
	} = useWarehouseData(warehouseType, userDetails?.district_id || undefined)

	const currentStocks = useCurrentStocks(warehouses, transactions)
	const groupedWarehouses = useGroupedWarehouses(warehouses, searchKey)
	const locationName = useLocationName(searchKey, userDetails?.district_id || undefined)
	const { searchKeys } = useSearchOptions(userDetails?.district_id || undefined)

	// Effects
	useEffect(() => {
		if (isLoading) {
			setTimeout(() => setIsLoading(false), 500)
		}
	}, [isLoading])

	useEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View className="items-center">
					<Text className="text-black dark:text-white font-bold">{config.title}</Text>
					<Text className="text-gray-600 dark:text-gray-400 text-[12px]">{locationName}</Text>
				</View>
			),
			headerRight: () => (
				<View className="mx-2">
					<Ionicons
						onPress={handleModalPress}
						name={isSearchOptionsVisible ? 'options' : 'options-outline'}
						size={24}
						color={isSearchOptionsVisible ? colors.primary : colors.gray600}
					/>
				</View>
			),
		})
	}, [isSearchOptionsVisible, searchKey, config.title, locationName, navigation])

	// Event Handlers
	const toggleSection = useCallback((sectionName: string) => {
		setExpandedSections((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(sectionName)) {
				newSet.delete(sectionName)
			} else {
				newSet.add(sectionName)
			}
			return newSet
		})
	}, [])

	const handleModalPress = useCallback(() => {
		if (!isSearchOptionsVisible) {
			bottomSheetModalRef.current?.present()
			setIsSearchOptionsVisible(true)
		} else {
			bottomSheetModalRef.current?.dismiss()
			setIsSearchOptionsVisible(false)
		}
	}, [isSearchOptionsVisible])

	const handleModalDismiss = useCallback(() => {
		bottomSheetModalRef.current?.dismiss()
	}, [])

	const handleSearchKey = useCallback(
		(key: string) => {
			handleModalDismiss()
			setIsLoading(true)

			if (key === 'All') {
				setSearchKey('')
				setSearch('')
				setIsSearchOptionsVisible(false)
			} else {
				setSearchKey(key)
			}
		},
		[handleModalDismiss, setSearch],
	)

	// Render Functions
	const renderSectionHeader = useCallback(
		({ section }: { section: { owner: WarehouseOwner; data: Warehouse[] } }) => (
			<Accordion
				title={section.owner.name}
				description={`${section.owner.phone}`}
				isExpanded={expandedSections.has(section.owner.name)}
				onToggle={() => toggleSection(section.owner.name)}
				badgeCount={0}
			>
				<View className="space-y-2">
					{section.data.map((item, index) => (
						<CashewWarehouseSectionedListItem
							key={item.id}
							index={index}
							expandedSections={expandedSections}
							item={item}
							section={section}
							lastVisitedAt={transactions.find((t) => t.store_id === item.id)?.updated_at || ''}
							currentStock={currentStocks.find((s) => s.id === item.id)?.currentStock || 0}
						/>
					))}
				</View>
			</Accordion>
		),
		[expandedSections, toggleSection, transactions, currentStocks],
	)

	const renderSearchOptions = useCallback(
		() => (
			<View className="space-y-4 pt-8">
				{searchKeys.map((searchKeyOption, index) => (
					<TouchableOpacity onPress={() => handleSearchKey(searchKeyOption.value)} key={index} className="mx-8">
						<View className="flex flex-row space-x-3">
							<View>
								{searchKey === searchKeyOption.value ? (
									<Ionicons name="radio-button-on" size={24} color={isDarkMode ? colors.white : colors.primary} />
								) : (
									<Ionicons name="radio-button-off" size={24} color={isDarkMode ? colors.white : colors.black} />
								)}
							</View>
							<View>
								<Text className="text-black dark:text-white text-[14px]">{searchKeyOption.label}</Text>
							</View>
						</View>
					</TouchableOpacity>
				))}
			</View>
		),
		[searchKeys, searchKey, handleSearchKey, isDarkMode],
	)

	const renderEmptyState = useCallback(
		() => (
			<View className="flex-1 h-[400px] justify-center items-center">
				<View>
					<ActorListEmpty actionType={ActionType.ADD_CASHEW_WAREHOUSE} />
					<Text className="text-gray-600 dark:text-gray-400 italic text-[12px] text-center">{config.emptyMessage}</Text>
				</View>
			</View>
		),
		[config.emptyMessage],
	)

	// Main Render
	return (
		<CustomSafeAreaView>
			{isLoading || isDataLoading ? (
				<CustomShimmerPlaceholderItemList count={14} />
			) : (
				<SectionList
					sections={groupedWarehouses}
					renderSectionHeader={renderSectionHeader}
					renderItem={() => null}
					keyExtractor={(item: { id: { toString: () => string } }) => item.id.toString()}
					contentContainerStyle={{
						paddingBottom: 60,
						gap: 3,
					}}
					// ListHeaderComponent={<View className="h-10" />}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={renderEmptyState}
				/>
			)}

			<ErrorAlert
				visible={showError}
				setVisible={setShowError}
				title=""
				setMessage={setErrorMessage}
				message={errorMessage}
			/>

			<CustomBottomSheetModal
				handleDismissModalPress={handleModalPress}
				bottomSheetModalRef={bottomSheetModalRef as React.RefObject<BottomSheetModal>}
			>
				<View className="flex p-3">
					<Text className="mx-8 text-black dark:text-white italic text-[12px]">
						Filtrar {config.title.toLowerCase()} por posto administrativo
					</Text>
					{renderSearchOptions()}
				</View>
			</CustomBottomSheetModal>
		</CustomSafeAreaView>
	)
}
