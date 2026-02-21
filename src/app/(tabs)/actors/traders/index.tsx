import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHeaderOptions, useNavigationSearch } from 'src/hooks/useNavigationSearch'
import { MultiCategory, ResourceName } from 'src/types'
import SkeletonLoader from 'src/components/skeleton/SkeletonLoader'

import { useNavigation } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import CustomBottomSheetModal from 'src/components/modals/CustomBottomSheetModal'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useColorScheme } from 'nativewind'
import ActorListItem from 'src/components/actors/ActorListItem'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'
import BackButton from 'src/components/buttons/BackButton'
import RenderTabBar from 'src/components/category-tab/RenderTabBar'
import CustomShimmerPlaceholder from 'src/components/placeholder/CustomShimmerPlaceholder'
import { useQueryMany, useSearchOptions, useUserDetails } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useActionStore } from 'src/store/actions/actions'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'

type Item = {
	title: string
	category: string
}

const items: Item[] = [
	{ title: 'Todos', category: 'ALL' },
	{ title: 'Primários', category: MultiCategory.TRADER_PRIMARY },
	{ title: 'Intermediários', category: MultiCategory.TRADER_SECONDARY },
	{ title: 'Finais', category: MultiCategory.TRADER_FINAL },
]

export default function TradersScreen() {
	const { search, setSearch } = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Procurar Comerciantes',
		},
	})
	const [isOptionsVisible, setIsOptionsVisible] = useState(false)
	const navigation = useNavigation()
	const { userDetails } = useUserDetails()
	const { resetCurrentResource } = useActionStore()
	const { searchKeys, loadSearchKeys } = useSearchOptions(userDetails?.district_id || '')
	const [newSearchKey, setNewSearchKey] = useState<string>('')

	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [isLoading, setIsLoading] = useState(false)
	const [activeTab, setActiveTab] = useState('')
	const handleActiveTab = (tab: string) => {
		setActiveTab(tab)
		setIsLoading(true)
	}

	// Perform a JOIN with actor_details, actor_categories, address_details, and contact_details tables
	const {
		data: tradersWithAdminPostAndContact,
		isLoading: isTradersWithAdminPostAndContactLoading,
		error: tradersWithAdminPostAndContactError,
		isError: isTradersWithAdminPostAndContactError,
	} = useQueryMany<{
		id: string
		surname: string
		other_names: string
		multicategory: string
		contact_id: string
		admin_post_id: string
		primary_phone: string
		secondary_phone: string
	}>(
		`SELECT 
			ad.actor_id as id,
			ad.surname,
			ad.other_names,
			GROUP_CONCAT(ac.subcategory, ';') as multicategory,
			cd.id as contact_id,
			addr.admin_post_id,
			cd.primary_phone,
			cd.secondary_phone
		FROM ${TABLES.ACTOR_DETAILS} ad
		INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'TRADER'
		LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'TRADER'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'TRADER'
		GROUP BY ad.actor_id, ad.surname, ad.other_names, cd.id, addr.admin_post_id, cd.primary_phone, cd.secondary_phone`,
	)

	const filteredTraders = useMemo(() => {
		// Ensure tradersWithAdminPostAndContact is an array
		if (!Array.isArray(tradersWithAdminPostAndContact)) {
			return []
		}

		if (!search && !newSearchKey) {
			if (activeTab === 'ALL') {
				return tradersWithAdminPostAndContact.map((trader) => trader).reverse()
			} else if (activeTab === MultiCategory.TRADER_PRIMARY) {
				return tradersWithAdminPostAndContact
					.filter((trader) => trader?.multicategory?.includes(MultiCategory.TRADER_PRIMARY))
					.reverse()
			} else if (activeTab === MultiCategory.TRADER_SECONDARY) {
				return tradersWithAdminPostAndContact
					.filter((trader) => trader?.multicategory?.includes(MultiCategory.TRADER_SECONDARY))
					.reverse()
			} else if (activeTab === MultiCategory.TRADER_FINAL) {
				return tradersWithAdminPostAndContact
					.filter(
						(trader) =>
							trader?.multicategory?.includes(MultiCategory.TRADER_LARGE_SCALE_PROCESSING) ||
							trader?.multicategory?.includes(MultiCategory.TRADER_SMALL_SCALE_PROCESSING) ||
							trader?.multicategory?.includes(MultiCategory.TRADER_EXPORT),
					)
					.reverse()
			}
		}
		if (newSearchKey) {
			return tradersWithAdminPostAndContact
				.filter((trader) => trader?.admin_post_id?.toLowerCase().includes(newSearchKey.toLowerCase()))
				.reverse()
		}
		return tradersWithAdminPostAndContact
			.filter(
				(trader) =>
					trader?.surname?.toLowerCase().includes(search.toLowerCase()) ||
					trader?.other_names?.toLowerCase().includes(search.toLowerCase()) ||
					trader?.primary_phone?.includes(search.toString()) ||
					trader?.secondary_phone?.includes(search.toString()),
			)
			.reverse()
	}, [search, tradersWithAdminPostAndContact, activeTab, newSearchKey])

	// Update header options
	useHeaderOptions({}, 'Comerciantes ')
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton route="/(tabs)/actors" />,
			headerRight: () => (
				<View className="mx-2">
					<Ionicons
						onPress={handleModalPress}
						name={isOptionsVisible ? 'options' : 'options-outline'}
						size={24}
						color={isOptionsVisible ? colors.primary : colors.gray600}
					/>
				</View>
			),
		})

		// reset current resource
		resetCurrentResource()
	}, [isOptionsVisible])

	const handleSearchKeys = async () => {
		// get all adminPosts
		loadSearchKeys()
	}

	const bottomSheetModalRef = useRef<BottomSheetModal>(null)

	const handleModalPress = useCallback(() => {
		if (!isOptionsVisible) {
			bottomSheetModalRef.current?.present()
			setIsOptionsVisible(true)
		} else {
			bottomSheetModalRef.current?.dismiss()
			setIsOptionsVisible(false)
		}
	}, [])

	const handleModalDismissPress = useCallback(() => {
		bottomSheetModalRef.current?.dismiss()
	}, [])

	const handleSearchKey = (key: string) => {
		handleModalDismissPress()
		setIsLoading(true)
		if (key === 'All') {
			setNewSearchKey('')
			setSearch('')
			return
		}
		setNewSearchKey(key)
	}

	useEffect(() => {
		handleSearchKeys()
		if (isLoading) {
			setTimeout(() => {
				setIsLoading(false)
			}, 500)
		}
		if (activeTab === '') {
			setActiveTab('ALL')
			setIsLoading(true)
		}
	}, [activeTab, isLoading])

	// Define trader item type
	type TraderItem = {
		id: string
		surname: string
		other_names: string
		multicategory: string
		admin_post_id: string
		primary_phone: string
		secondary_phone: string
	}

	// Extract farmer phone numbers
	// 9
	// Render each farmer with a photo, name, surname, phone number, and cashew stock
	const renderItem = ({ item }: { item: TraderItem }) => (
		<ActorListItem item={item} resource_name={ResourceName.TRADER} />
	)

	// if it is undefined, show a skeleton loader
	// else show the farmers in a flatlist
	if (!filteredTraders) {
		return (
			<View
				style={{
					minHeight: 600,
					backgroundColor: 'white',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<SkeletonLoader loading={true} />
			</View>
		)
	}

	const isFabVisible = useSharedValue(true)
	const scrollY = useSharedValue(0)

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			const currentOffset = event.contentOffset.y
			isFabVisible.value = currentOffset < 0 || scrollY.value > currentOffset
			scrollY.value = currentOffset
		},
	})

	// Render the farmers in a flatlist
	return (
		<>
			<View className="flex-1 bg-white dark:bg-black">
				<View>
					<RenderTabBar items={items} activeTab={activeTab} handleActiveTab={handleActiveTab} />
				</View>

				<View className="">
					{isLoading ? (
						<FlatList
							key="loading-list"
							showsVerticalScrollIndicator={false}
							data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]}
							keyExtractor={(item: number) => item.toString()}
							renderItem={() => (
								<View className=" items-center mx-3">
									<CustomShimmerPlaceholder
										// visible={isLoading}
										style={{
											width: '100%',
											height: 60,
											margin: 10,
											borderRadius: 10,
										}}
									/>
								</View>
							)}
						/>
					) : (
						<Animated.FlatList<TraderItem>
							key="data-list"
							data={filteredTraders}
							contentContainerStyle={{
								flexGrow: 1,
								paddingBottom: 100,
							}}
							onScroll={scrollHandler}
							scrollEventThrottle={16}
							showsVerticalScrollIndicator={false}
							renderItem={renderItem}
							keyExtractor={(item) => item.id}
							ListEmptyComponent={() => (
								<View className="flex-1 items-center justify-center h-[400px]">
									<EmptyPlaceholder message="Não há comerciantes para mostrar" />
								</View>
							)}
						/>
					)}
				</View>

				{/* Bottom Sheet Modal */}
				<CustomBottomSheetModal handleDismissModalPress={handleModalPress} bottomSheetModalRef={bottomSheetModalRef}>
					<View className="flex p-3">
						<Text className="mx-8 text-black font-bold dark:text-white">Filtrar registos</Text>
						<View className="space-y-4 pt-8">
							{searchKeys.map((searchKey, index) => (
								<TouchableOpacity onPress={() => handleSearchKey(searchKey.value)} key={index} className="mx-8">
									<View className="flex flex-row space-x-3">
										<View className="">
											{newSearchKey === searchKey.value ? (
												<Ionicons name="radio-button-on" size={24} color={isDarkMode ? colors.white : colors.primary} />
											) : (
												<Ionicons name="radio-button-off" size={24} color={isDarkMode ? colors.white : colors.black} />
											)}
										</View>
										<View>
											<Text className="text-black dark:text-white text-[14px]">{searchKey.label}</Text>
										</View>
									</View>
								</TouchableOpacity>
							))}
						</View>
					</View>
				</CustomBottomSheetModal>
				<SingleFloatingButton route="/(tabs)/actors/registration/trader-registration" />
			</View>
		</>
	)
}
