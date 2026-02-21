import React, { useEffect, useState, useRef, useMemo } from 'react'
import { View, Text, TouchableOpacity, Dimensions, Linking } from 'react-native'
import { Href, useNavigation, useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import Animated, {
	FadeIn,
	FadeOut,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	interpolate,
	Extrapolation,
	runOnJS,
} from 'react-native-reanimated'

import { colors } from 'src/constants'
import CustomPopUpMenu from 'src/components/menus/CustomPopUpMenu'
import { CashewFactoryType, CashewWarehouseType, PopMenuOption, TransactionFlowType } from 'src/types'
import { useAddressById, useContactById, useQueryMany, useQueryOneAndWatchChanges } from 'src/hooks/queries'
import { useActionStore } from 'src/store/actions/actions'
import { CashewWarehouseTransactionRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { groupBy } from 'lodash'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'
import { getCurrentStock, isAFactory, translateWarehouseTypeToPortuguese } from 'src/helpers/helpersToTrades'
import EllipsisIndicator from 'src/components/indicators/EllipsisIndicator'
import { queryMany } from 'src/library/powersync/sql-statements'
import CustomShimmerPlaceholder from 'src/components/placeholder/CustomShimmerPlaceholder'

export interface WarehouseType {
	id: string
	warehouse_type: string
	owner_id: string
	description: string
	is_active: string
	address_id: string
	employee_id: string
	employee_name: string
	employee_position: string
	employee_workplace_id: string
	employee_contact_id: string
	employee_phone: string
}

export interface WarehouseTypeAndEmployee extends WarehouseType {
	employee_id: string
	employee_name: string
	employee_position: string
	employee_workplace_id: string
	employee_contact_id: string
	employee_phone: string
}

export default function TraderIndexScreen() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const navigation = useNavigation()
	const router = useRouter()
	const { getCurrentResource, currentResource } = useActionStore()
	const [isLoading, setIsLoading] = useState(true)
	const [totalStock, setTotalStock] = useState<number>(0)
	const [lastTransactionDate, setLastTransactionDate] = useState<Date | null>(null)

	const {
		data: trader,
		isLoading: isTraderLoading,
		error: traderError,
		isError: isTraderError,
	} = useQueryOneAndWatchChanges<{
		id: string
		surname: string
		other_names: string
		address_id: string
		contact_id: string
	}>(
		`SELECT 
			ad.actor_id as id,
			ad.surname,
			ad.other_names,
			addr.id as address_id,
			cd.id as contact_id
		FROM ${TABLES.ACTOR_DETAILS} ad
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'TRADER'
		LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'TRADER'
		WHERE ad.actor_id = $0`,
		[getCurrentResource().id],
	)

	const {
		data: warehousesRaw,
		isLoading: isWarehousesLoading,
		error: warehousesError,
		isError: isWarehousesError,
	} = useQueryMany<WarehouseTypeAndEmployee>(
		`SELECT 
			whd.id, 
			whd.type as warehouse_type, 
			whd.owner_id, 
			whd.description, 
			whd.is_active, 
			addr.id as address_id,
			wa.worker_id as employee_id,
			COALESCE(ad.other_names || ' ' || ad.surname, ad.other_names, ad.surname, 'N/A') as employee_name,
			wa.position as employee_position,
			wa.facility_id as employee_workplace_id,
			cd.id as employee_contact_id,
			COALESCE(cd.primary_phone, cd.secondary_phone, 'N/A') as employee_phone
		FROM ${TABLES.WAREHOUSE_DETAILS} whd
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = whd.id AND addr.owner_type = 'WAREHOUSE'
		LEFT JOIN ${TABLES.WORKER_ASSIGNMENTS} wa
			ON whd.id = wa.facility_id AND wa.facility_type = 'WAREHOUSE' AND wa.is_active = 'true'
		LEFT JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = wa.worker_id
		LEFT JOIN ${TABLES.CONTACT_DETAILS} cd
			ON wa.worker_id = cd.owner_id AND (cd.owner_type = 'EMPLOYEE' OR cd.owner_type = 'TRADER')
		WHERE whd.owner_id = '${getCurrentResource().id}'`,
	)
	const warehouses = useMemo(
		() =>
			(warehousesRaw || []).sort((a, b) => {
				const isNotAFactory =
					a.warehouse_type !== CashewFactoryType.LARGE_SCALE &&
					a.warehouse_type !== CashewFactoryType.SMALL_SCALE &&
					a.warehouse_type !== CashewFactoryType.INFORMAL
				return isNotAFactory ? -1 : 1
			}),
		[warehousesRaw],
	)

	const options: PopMenuOption[] = [
		{
			icon: <Ionicons color={isDarkMode ? colors.white : colors.black} name="storefront-outline" size={20} />,
			label: 'Posto ou armazém',
			action: () => router.navigate('/(aux)/trades/cashew-warehouses/registration'),
		},
		{
			icon: <Ionicons color={isDarkMode ? colors.white : colors.black} name="build-outline" size={20} />,
			label: 'Fábrica',
			action: () => router.navigate('/(aux)/trades/cashew-factories/registration'),
		},
		{
			icon: <Ionicons color={isDarkMode ? colors.white : colors.black} name="person-add-outline" size={20} />,
			label: 'Trabalhador',
			action: () => router.navigate(`/(aux)/actors/employees/add-employee`),
		},
	]

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => <CustomPopUpMenu title="Adicionar" options={options} />,
		})
		if (trader) {
			setIsLoading(false)
		}
		if (warehouses) {
			queryMany<{ quantity: number; transaction_type: string; created_at: string }>(
				`SELECT 
					quantity, 
					transaction_type,
					created_at
				FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} 
				WHERE store_id IN ('${warehouses.map((warehouse) => warehouse.id).join("','")}')`,
			).then((transactions) => {
				const totalStock = getCurrentStock(
					transactions.map((transaction) => ({
						quantity: transaction.quantity ?? 0,
						transaction_type: transaction.transaction_type as TransactionFlowType,
					})),
				)
				const lastTransactionDate = transactions.reduce((acc, transaction) => {
					const transactionDate = new Date(transaction.created_at as string)
					return transactionDate > acc ? transactionDate : acc
				}, new Date(0))
				setTotalStock(totalStock)
				setLastTransactionDate(lastTransactionDate)
			})
		}
	}, [trader, warehouses])

	const menuOptions: PopMenuOption[] = [
		{
			label: 'Actualizar Dados',
			icon: <FontAwesome name="edit" size={18} />,
			action: () =>
				router.navigate(`/(edit)/edit?resourceName=${currentResource.name}&id=${currentResource.id}` as Href),
		},
	]

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => <CustomPopUpMenu title="Menu" options={menuOptions} />,
		})
	}, [])

	if (isLoading) {
		return <TraderSkeleton />
	}

	return (
		<Animated.ScrollView
			contentContainerStyle={{
				flexGrow: 1,
			}}
			showsVerticalScrollIndicator={false}
			entering={FadeIn.duration(300)}
			exiting={FadeOut.duration(300)}
			className="flex-1 bg-white dark:bg-black"
		>
			<View className="flex-1 px-3">
				<View className="flex-none">
					<TraderInfo
						addressId={trader?.address_id ?? ''}
						contactId={trader?.contact_id ?? ''}
						totalStock={totalStock}
						lastTransactionDate={lastTransactionDate}
					/>
					<WarehousesCountByType warehouses={warehouses} />
				</View>
				<View className="flex-1 mt-4">
					<WarehouseList warehouses={warehouses} />
				</View>
			</View>
		</Animated.ScrollView>
	)
}

const TraderSkeleton = () => {
	return (
		<View className="flex-1 px-3">
			<View className="flex-none">
				{/* Trader Info Skeleton */}
				<View className="rounded-xl p-1 flex flex-col justify-between border-slate-200 bg-white dark:bg-gray-800 shadow-lg shadow-black/5 dark:shadow-white/5">
					<View className="flex flex-row h-16">
						<View className="flex flex-col w-[50%] justify-center" />
						<View className="flex flex-col w-[50%] items-end">
							<CustomShimmerPlaceholder
								style={{
									width: 120,
									height: 24,
									borderRadius: 8,
								}}
							/>
							<CustomShimmerPlaceholder
								style={{
									width: 160,
									height: 12,
									borderRadius: 6,
									marginTop: 4,
								}}
							/>
						</View>
					</View>
					<View className="flex flex-row justify-between mt-2">
						<View className="w-[50%] flex flex-row space-x-1 items-center justify-start">
							<CustomShimmerPlaceholder
								style={{
									width: 100,
									height: 12,
									borderRadius: 6,
								}}
							/>
						</View>
						<View className="w-[50%] flex flex-row space-x-1 items-center justify-end">
							<CustomShimmerPlaceholder
								style={{
									width: 100,
									height: 12,
									borderRadius: 6,
								}}
							/>
						</View>
					</View>
				</View>

				{/* Warehouses Count Skeleton */}
				<View className="flex flex-row space-x-2 items-center justify-between my-2 border border-slate-200 bg-white dark:bg-gray-800 shadow-lg shadow-black/5 dark:shadow-white/5 rounded-xl p-1">
					{[1, 2, 3].map((_, index) => (
						<View key={index} className="flex-1 flex-col space-y-1 items-center">
							<View className="flex flex-row space-x-1 items-center">
								<CustomShimmerPlaceholder
									style={{
										width: 15,
										height: 15,
										borderRadius: 8,
									}}
								/>
								<CustomShimmerPlaceholder
									style={{
										width: 40,
										height: 12,
										borderRadius: 6,
									}}
								/>
							</View>
							<CustomShimmerPlaceholder
								style={{
									width: 20,
									height: 12,
									borderRadius: 6,
								}}
							/>
						</View>
					))}
				</View>
			</View>

			{/* Warehouse List Skeleton */}
			<View className="flex-1 mt-4">
				<View className="flex flex-row space-x-4 px-10">
					{[1, 2, 3].map((_, index) => (
						<View key={index} className="w-[280px] bg-gray-50 dark:bg-gray-900 rounded-lg p-2 pr-4 h-[400px] relative">
							<View className="flex flex-col space-y-4">
								{/* Header */}
								<View className="flex flex-row space-x-2 items-start justify-between">
									<View className="flex-1 flex flex-col space-y-2">
										<CustomShimmerPlaceholder
											style={{
												width: 80,
												height: 16,
												borderRadius: 8,
											}}
										/>
										<CustomShimmerPlaceholder
											style={{
												width: 60,
												height: 10,
												borderRadius: 6,
											}}
										/>
									</View>
									<View className="flex-1 flex flex-col space-y-2 items-end">
										<CustomShimmerPlaceholder
											style={{
												width: 100,
												height: 12,
												borderRadius: 6,
											}}
										/>
										<CustomShimmerPlaceholder
											style={{
												width: 80,
												height: 10,
												borderRadius: 6,
											}}
										/>
									</View>
								</View>

								{/* Info */}
								<View className="flex flex-col space-y-2 items-center">
									<CustomShimmerPlaceholder
										style={{
											width: 120,
											height: 16,
											borderRadius: 8,
										}}
									/>
									<CustomShimmerPlaceholder
										style={{
											width: 160,
											height: 10,
											borderRadius: 6,
										}}
									/>
									<CustomShimmerPlaceholder
										style={{
											width: 140,
											height: 10,
											borderRadius: 6,
										}}
									/>
								</View>

								{/* Transactions */}
								<View className="flex flex-col space-y-2">
									{[1, 2, 3, 4].map((_, index) => (
										<View key={index} className="flex flex-row space-x-2 items-center justify-between">
											<View className="flex flex-row space-x-2 items-center">
												<CustomShimmerPlaceholder
													style={{
														width: 16,
														height: 16,
														borderRadius: 8,
													}}
												/>
												<CustomShimmerPlaceholder
													style={{
														width: 80,
														height: 12,
														borderRadius: 6,
													}}
												/>
											</View>
											<CustomShimmerPlaceholder
												style={{
													width: 60,
													height: 12,
													borderRadius: 6,
												}}
											/>
										</View>
									))}
								</View>
							</View>
						</View>
					))}
				</View>
			</View>
		</View>
	)
}

const WarehouseList = ({ warehouses }: { warehouses: WarehouseType[] }) => {
	const scrollViewRef = useRef<any>(null)
	const [currentIndex, setCurrentIndex] = useState(0)
	const scrollX = useSharedValue(0)
	const cardWidth = 280
	const cardMargin = 16
	const totalCardWidth = cardWidth + cardMargin

	const updateIndex = (index: number) => {
		setCurrentIndex(index)
	}

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x
			const newIndex = Math.round(event.contentOffset.x / totalCardWidth)
			if (newIndex !== currentIndex) {
				runOnJS(updateIndex)(newIndex)
			}
		},
	})

	const scrollToNext = () => {
		if (currentIndex < warehouses.length - 1) {
			scrollViewRef.current?.scrollTo({
				x: (currentIndex + 1) * totalCardWidth,
				animated: true,
			})
			setCurrentIndex(currentIndex + 1)
		}
	}

	const scrollToPrevious = () => {
		if (currentIndex > 0) {
			scrollViewRef.current?.scrollTo({
				x: (currentIndex - 1) * totalCardWidth,
				animated: true,
			})
			setCurrentIndex(currentIndex - 1)
		}
	}

	useEffect(() => {
		if (scrollViewRef.current && warehouses.length > 0) {
			const screenWidth = Dimensions.get('window').width
			const offset = (screenWidth - totalCardWidth) / 2

			scrollViewRef.current.scrollTo({
				x: offset,
				animated: false,
			})
		}
	}, [])

	if (warehouses.length === 0) {
		return <EmptyPlaceholder message="Nenhum  armazém ou fábrica encontrado" />
	}

	return (
		<View className="flex-1 relative">
			<Animated.ScrollView
				ref={scrollViewRef}
				horizontal
				showsHorizontalScrollIndicator={false}
				className="px-10"
				snapToInterval={totalCardWidth}
				snapToAlignment="center"
				decelerationRate={0}
				bounces={false}
				overScrollMode="never"
				onScroll={scrollHandler}
				scrollEventThrottle={16}
				contentContainerStyle={{
					paddingRight: 40,
					paddingBottom: 16,
				}}
			>
				{warehouses.map((warehouse, index) => {
					const inputRange = [(index - 1) * totalCardWidth, index * totalCardWidth, (index + 1) * totalCardWidth]

					const animatedStyle = useAnimatedStyle(() => {
						const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], Extrapolation.CLAMP)

						return {
							transform: [{ scale }],
						}
					})

					const contentAnimatedStyle = useAnimatedStyle(() => {
						const opacity = interpolate(scrollX.value, inputRange, [0.1, 1, 0.1], Extrapolation.CLAMP)
						return {
							opacity,
						}
					})

					return (
						<WarehouseCard
							key={warehouse.id}
							warehouse={warehouse}
							index={index}
							animatedStyle={animatedStyle}
							contentAnimatedStyle={contentAnimatedStyle}
							currentIndex={currentIndex}
							totalWarehouses={warehouses.length}
						/>
					)
				})}
			</Animated.ScrollView>
		</View>
	)
}

const WarehouseCard = ({
	warehouse,
	index,
	animatedStyle,
	contentAnimatedStyle,
	currentIndex,
	totalWarehouses,
}: {
	warehouse: WarehouseType
	index: number
	animatedStyle: any
	contentAnimatedStyle: any
	currentIndex: number
	totalWarehouses: number
}) => {
	const router = useRouter()
	const [groupedByTransactionType, setGroupedByTransactionType] = useState<{
		[key: string]: CashewWarehouseTransactionRecord[]
	}>({})
	const [transactions, setTransactions] = useState<CashewWarehouseTransactionRecord[]>([])
	const [lastTransactionDate, setLastTransactionDate] = useState<Date | null>(null)
	const [lastTransactionInfoProvider, setLastTransactionInfoProvider] = useState<{
		info_provider_name: string
	} | null>(null)
	const { provinceName, districtName, adminPostName, villageName, isLoading, error, isError } = useAddressById(
		warehouse.address_id,
	)

	useEffect(() => {
		if (isAFactory(warehouse.warehouse_type)) {
			queryMany<
				CashewWarehouseTransactionRecord & {
					info_provider_name: string
				}
			>(
				`SELECT 
					cw_tr.*,
					COALESCE(ad.other_names || ' ' || ad.surname, ad.other_names, ad.surname, 'N/A') as info_provider_name
				FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} cw_tr
				LEFT JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = cw_tr.info_provider_id
				WHERE reference_store_id = '${warehouse.id}'
				`,
			).then((transactions) => {
				const flattenedTransactions = transactions.flat()
				setTransactions(flattenedTransactions)
				setLastTransactionInfoProvider(
					flattenedTransactions[0]?.info_provider_name
						? {
								info_provider_name: flattenedTransactions[0].info_provider_name,
							}
						: null,
				)
			})
		} else {
			queryMany<
				CashewWarehouseTransactionRecord & {
					info_provider_name: string
				}
			>(
				`SELECT 
					cw_tr.*,
					COALESCE(ad.other_names || ' ' || ad.surname, ad.other_names, ad.surname, 'N/A') as info_provider_name
				FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} cw_tr
				LEFT JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = cw_tr.info_provider_id
				WHERE store_id = '${warehouse.id}'`,
			).then((transactions) => {
				const flattenedTransactions = transactions.flat()
				setTransactions(flattenedTransactions)
				setLastTransactionInfoProvider(
					flattenedTransactions[0]?.info_provider_name
						? {
								info_provider_name: flattenedTransactions[0].info_provider_name,
							}
						: null,
				)
			})
		}
	}, [warehouse.id])

	useEffect(() => {
		const groupedByTransactionType = groupBy(transactions, 'transaction_type')
		setGroupedByTransactionType(groupedByTransactionType)

		const sortedTransactions = [...transactions].sort((a, b) => {
			const dateA = new Date(a.created_at as string).getTime()
			const dateB = new Date(b.created_at as string).getTime()
			return dateB - dateA
		})
		setLastTransactionDate(sortedTransactions.length > 0 ? new Date(sortedTransactions[0].created_at as string) : null)
	}, [transactions])

	const address =
		villageName && adminPostName ? `${villageName} - ${adminPostName}` : villageName || adminPostName || 'N/A'

	return (
		<Animated.ScrollView
			key={warehouse.id}
			entering={FadeIn.duration(300)}
			exiting={FadeOut.duration(300)}
			style={[animatedStyle]}
			className={`w-[280px] mr-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-2 pr-4 h-full relative ${index === 0 ? 'mr-0' : ''}`}
			contentContainerStyle={{
				flexGrow: 1,
				justifyContent: 'center',
				alignItems: 'center',
				paddingHorizontal: 16,
			}}
		>
			<TouchableOpacity
				activeOpacity={0.5}
				onPress={() => {
					router.push(`/trades/cashew-warehouses/${warehouse.id}`)
				}}
				className="h-full"
			>
				<Animated.ScrollView style={contentAnimatedStyle} contentContainerStyle={{
					flexGrow: 1,
					justifyContent: 'center',
					alignItems: 'center',
					paddingHorizontal: 16,
				}}>
					<View className="h-full">
						<WarehouseHeader warehouse={warehouse} transactions={transactions} />
						<WarehouseInfo warehouse={warehouse} address={address} lastTransactionDate={lastTransactionDate} />
						<WarehouseTransactions transactions={transactions} warehouseType={warehouse.warehouse_type} />
						<LastTransactionInfo
							lastTransactionDate={lastTransactionDate}
							infoProviderName={lastTransactionInfoProvider?.info_provider_name ?? null}
						/>
						<EllipsisIndicator currentIndex={currentIndex} totalItems={totalWarehouses} />
					</View>
				</Animated.ScrollView>
			</TouchableOpacity>
		</Animated.ScrollView>
	)
}

const WarehouseHeader = ({
	warehouse,
	transactions,
}: {
	warehouse: WarehouseType
	transactions: CashewWarehouseTransactionRecord[]
}) => {
	const stock = getCurrentStock(
		transactions.map((transaction) => ({
			quantity: transaction.quantity ?? 0,
			transaction_type: transaction.transaction_type as TransactionFlowType,
		})),
	)
	// if the warehouse is a factory, the stock is the absolute value of the stock
	const currentStock = isAFactory(warehouse.warehouse_type) ? Math.abs(stock) : stock
	return (
		<View className="flex flex-row space-x-2 items-start justify-between">
			<View className="flex-1 flex flex-col space-y-0">
				<Text className="text-[#008000] font-normal text-[16px] truncate">
					{Intl.NumberFormat('pt-BR').format(currentStock)} kg
				</Text>
				<Text className="text-gray-500 dark:text-gray-400 text-[10px] italic mt-1 text-left truncate">
					Estoque actual
				</Text>
			</View>
			{warehouse.employee_name ? <EmployeeInfo warehouse={warehouse} /> : <NoEmployeeInfo />}
		</View>
	)
}

const EmployeeInfo = ({ warehouse }: { warehouse: WarehouseType }) => (
	<TouchableOpacity
		className="flex flex-col space-y-0 items-end h-8 flex-1"
		activeOpacity={0.5}
		onPress={() => Linking.openURL(`tel:${warehouse.employee_phone}`)}
	>
		<Text
			className="text-gray-800 dark:text-gray-200 font-normal text-[12px] truncate"
			numberOfLines={1}
			ellipsizeMode="tail"
		>
			{warehouse.employee_name}
		</Text>
		<Text className="text-gray-500 dark:text-gray-400 text-[10px] italic mt-1 text-right truncate">
			<Ionicons name="call-outline" size={12} color={colors.primary} /> {warehouse.employee_phone}
		</Text>
	</TouchableOpacity>
)

const NoEmployeeInfo = () => (
	<View className="flex flex-col space-y-0 items-end h-8 flex-1">
		<Text className="text-red-500 dark:text-red-500 text-[10px] italic">Sem trabalhador</Text>
	</View>
)

const LastTransactionInfo = ({
	lastTransactionDate,
	infoProviderName,
}: {
	lastTransactionDate: Date | null
	infoProviderName: string | null
}) => {
	return (
		<View className="flex flex-col space-y-1">
			{lastTransactionDate ? (
				<View className="flex flex-col space-x-1 items-center justify-center">
					<View className="flex flex-row space-x-1 items-center">
						<Text
							ellipsizeMode="tail"
							numberOfLines={2}
							className="text-gray-500 dark:text-gray-400 text-[10px] italic mt-1 truncate"
						>
							Actualizado em {Intl.DateTimeFormat('pt-BR').format(lastTransactionDate)}
							{infoProviderName && ` por ${infoProviderName}`}
						</Text>
					</View>
				</View>
			) : (
				<Text className="text-red-500 dark:text-red-500 text-[10px] italic">Nenhuma transacção registada</Text>
			)}
		</View>
	)
}

const WarehouseInfo = ({
	warehouse,
	address,
}: {
	warehouse: WarehouseType
	address: string
	lastTransactionDate: Date | null
}) => (
	<View className="flex flex-col space-y-2 my-2">
		<View className="flex flex-col space-y-0 items-center justify-center">
			<Text className="text-gray-800 dark:text-gray-200 font-medium text-[16px] truncate text-center">
				{translateWarehouseTypeToPortuguese(warehouse.warehouse_type)}
			</Text>
			<Text className="text-[#008000] text-[12px] font-bold mt-1 text-center truncate">{address}</Text>
			<Text
				className="text-gray-500 dark:text-gray-400 text-[10px] italic mt-1 text-center truncate"
				numberOfLines={1}
				ellipsizeMode="tail"
			>
				{warehouse.description.split(' - ')[1]}
			</Text>
		</View>
	</View>
)

const WarehouseTransactions = ({
	transactions,
	warehouseType,
}: {
	transactions: CashewWarehouseTransactionRecord[]
	warehouseType: string
}) => {
	const groupedByTransactionType = groupBy(transactions, 'transaction_type')
	const received = (groupedByTransactionType.TRANSFERRED_IN || []).reduce((acc, curr) => acc + (curr.quantity ?? 0), 0)
	const transferred = (groupedByTransactionType.TRANSFERRED_OUT || []).reduce(
		(acc, curr) => acc + (curr.quantity ?? 0),
		0,
	)
	const processed = (groupedByTransactionType.PROCESSED || []).reduce((acc, curr) => acc + (curr.quantity ?? 0), 0)
	const exported = (groupedByTransactionType.EXPORTED || []).reduce((acc, curr) => acc + (curr.quantity ?? 0), 0)
	const sold = (groupedByTransactionType.SOLD || []).reduce((acc, curr) => acc + (curr.quantity ?? 0), 0)
	const bought = (groupedByTransactionType.BOUGHT || []).reduce((acc, curr) => acc + (curr.quantity ?? 0), 0)
	const lost = (groupedByTransactionType.LOST || []).reduce((acc, curr) => acc + (curr.quantity ?? 0), 0)

	const isFactory = isAFactory(warehouseType)

	if (isFactory) {
		return (
			<View className="flex flex-col space-y-2">
				<TransactionItem transaction={{ description: 'Processado', amount: processed, direction: 'up' }} />
			</View>
		)
	}

	return (
		<View className="flex flex-col space-y-2">
			<TransactionItem transaction={{ description: 'Recebido', amount: received, direction: 'up' }} />
			<TransactionItem transaction={{ description: 'Transferido', amount: transferred, direction: 'up' }} />
			<TransactionItem transaction={{ description: 'Processado', amount: processed, direction: 'up' }} />
			<TransactionItem transaction={{ description: 'Exportado', amount: exported, direction: 'up' }} />
			<TransactionItem transaction={{ description: 'Vendido', amount: sold, direction: 'down' }} />
			<TransactionItem transaction={{ description: 'Comprado', amount: bought, direction: 'down' }} />
			<TransactionItem transaction={{ description: 'Desperdiçado', amount: lost, direction: 'down' }} />
		</View>
	)
}

const TransactionItem = ({
	transaction,
}: {
	transaction: { description: string; amount: number; direction: 'up' | 'down' }
}) => (
	<View className="flex flex-row space-x-2 items-center justify-between my-1">
		<View className="flex flex-row space-x-2 items-center">
			<Ionicons
				name={transaction.direction === 'up' ? 'arrow-up-outline' : 'arrow-down-outline'}
				size={16}
				color={colors.primary}
			/>
			<Text>{transaction.description}</Text>
		</View>
		<Text>{Intl.NumberFormat('pt-BR').format(transaction.amount)} kg</Text>
	</View>
)

const WarehousesCountByType = ({
	warehouses,
}: {
	warehouses: {
		id: string
		warehouse_type: string
		owner_id: string
		description: string
		is_active: string
		address_id: string
	}[]
}) => {
	const groupedByWarehouseType = groupBy(warehouses, 'warehouse_type')

	const buyingPoints = groupedByWarehouseType[CashewWarehouseType.BUYING]?.length || 0
	const aggregationPoints = groupedByWarehouseType[CashewWarehouseType.AGGREGATION]?.length || 0
	const destinationPoints = groupedByWarehouseType[CashewWarehouseType.DESTINATION]?.length || 0
	const largeScaleFactories = groupedByWarehouseType[CashewFactoryType.LARGE_SCALE]?.length || 0
	const smallScaleFactories = groupedByWarehouseType[CashewFactoryType.SMALL_SCALE]?.length || 0
	const informalFactories = groupedByWarehouseType[CashewFactoryType.INFORMAL]?.length || 0

	return (
		<View className="flex flex-row space-x-2 items-center justify-between my-2 border border-slate-200 bg-white dark:bg-gray-800 shadow-lg shadow-black/5 dark:shadow-white/5 rounded-xl p-1">
			<View className="flex-1 flex-col space-y-1 items-center ">
				<View className="flex flex-row space-x-1 items-center">
					<Ionicons name="list-outline" size={15} color={colors.primary} />
					<Text className="font-mono text-[12px] text-gray-600 dark:text-gray-400">Postos</Text>
				</View>
				<Text className="text-gray-600 dark:text-gray-400 text-xs font-bold">{buyingPoints}</Text>
			</View>
			<View className="flex-1 flex-col space-y-1 items-center ">
				<View className="flex flex-row space-x-1 items-center">
					<Ionicons name="storefront-outline" size={15} color={colors.primary} />
					<Text className="font-mono text-[12px] text-gray-600 dark:text-gray-400">Armazéns</Text>
				</View>
				<Text className="text-gray-600 dark:text-gray-400 text-xs font-bold">
					{aggregationPoints + destinationPoints}
				</Text>
			</View>

			<View className="flex-1 flex-col space-y-1 items-center ">
				<View className="flex flex-row space-x-1 items-center">
					<Ionicons name="build-outline" size={15} color={colors.primary} />
					<Text className="font-mono text-[12px] text-gray-600 dark:text-gray-400">Fábricas</Text>
				</View>
				<Text className="text-gray-600 dark:text-gray-400 text-xs font-bold">
					{largeScaleFactories + smallScaleFactories + informalFactories}
				</Text>
			</View>
		</View>
	)
}

const TraderInfo = ({
	addressId,
	contactId,
	totalStock,
	lastTransactionDate,
}: {
	addressId: string
	contactId: string
	totalStock: number
	lastTransactionDate: Date | null
}) => {
	const { provinceName, districtName, adminPostName, villageName, isLoading, error, isError } =
		useAddressById(addressId)
	const {
		primaryPhone,
		secondaryPhone,
		isLoading: isContactLoading,
		error: contactError,
		isError: isContactError,
	} = useContactById(contactId)
	return (
		<View className="rounded-xl p-1 flex flex-col justify-betweenborder-slate-200 bg-white dark:bg-gray-800 shadow-lg shadow-black/5 dark:shadow-white/5">
			<View className="flex flex-row h-16">
				<View className="flex flex-col w-[50%] justify-center" />
				<View className="flex flex-col w-[50%] items-end">
					<Text className="text-center text-[#008000] dark:text-gray-400 text-[24px] font-bold">
						{Intl.NumberFormat('pt-BR').format(totalStock)} kg
					</Text>
					<Text className="text-gray-600 dark:text-gray-400 text-[10px] font-mono">
						Estoque total até {Intl.DateTimeFormat('pt-BR').format(lastTransactionDate ?? new Date())}
					</Text>
				</View>
			</View>
			<View className="flex flex-row justify-between mt-2">
				<View className="w-[50%] flex flex-row space-x-1 items-center justify-start">
					<Ionicons name="location-outline" size={15} color={colors.primary} />
					<Text className="text-gray-800 dark:text-gray-200 text-[10px] font-mono leading-3">
						{districtName}, {adminPostName}, {villageName}
					</Text>
				</View>

				<TouchableOpacity
					className="w-[50%] flex flex-row space-x-1 items-center justify-end"
					onPress={() => Linking.openURL(`tel:${primaryPhone ?? secondaryPhone ?? 'N/A'}`)}
				>
					<Ionicons name="call-outline" size={15} color={colors.primary} />
					<Text className="text-[10px] text-black dark:text-white">{primaryPhone ?? secondaryPhone ?? 'N/A'}</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
