// React and React Native imports
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, View } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'

// Components
import ActorListItem from 'src/components/actors/ActorListItem'
import AdminPostFilterModal from 'src/components/modals/AdminPostFilterModal'
import CustomShimmerPlaceholder from 'src/components/placeholder/CustomShimmerPlaceholder'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'
import SkeletonLoader from 'src/components/skeleton/SkeletonLoader'

// Hooks
import { useNavigationSearch } from 'src/hooks/useNavigationSearch'
import { useActorsHeader } from 'src/hooks/useActorsHeader'
import { useLocationName } from 'src/hooks/useLocationName'

import { MultiCategory, ResourceName } from 'src/types'
import { useQueryMany, useSearchOptions, useUserDetails } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useActionStore } from 'src/store/actions/actions'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'

type Item = {
	title: string
	category: string
}

type FarmerItem = {
	id: string
	surname: string
	other_names: string
	multicategory: string
	admin_post_id: string
	primary_phone: string
	secondary_phone: string
}

const items: Item[] = [
	{ title: 'Todos', category: 'ALL' },
	{ title: 'Familiares', category: MultiCategory.FARMER_SMALL_SCALE },
	{ title: 'Comerciais', category: MultiCategory.FARMER_LARGE_SCALE },
	{ title: 'Provedores', category: MultiCategory.FARMER_SPRAYING_SERVICE_PROVIDER },
]

export default function FarmersScreen() {
	const { userDetails } = useUserDetails()
	const { resetCurrentResource } = useActionStore()
	const locationName = useLocationName()

	const { search, setSearch } = useNavigationSearch({
		searchBarOptions: { placeholder: 'Procurar Produtores' },
	})
	const [newSearchKey, setNewSearchKey] = useState<string>('')
	const [isLoading, setIsLoading] = useState(false)

	const { searchKeys, loadSearchKeys } = useSearchOptions(userDetails?.district_id || '')

	// Perform a JOIN with address_details and contact_details tables to get admin_post, primary_phone and secondary_phone for each farmer
	// Filter by user's district so only farmers from this district are shown
	const farmersQuery = useMemo(() => {
		const baseQuery = `SELECT 
			ad.actor_id as id, 
			ad.surname, 
			ad.other_names, 
			GROUP_CONCAT(ac.subcategory, ';') as multicategory, 
			addr.admin_post_id, 
			cd.primary_phone, 
			cd.secondary_phone 
		FROM ${TABLES.ACTOR_DETAILS} ad
		INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'FARMER'
		LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'FARMER'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'FARMER'`
		const districtFilter = userDetails?.district_id
			? ` WHERE addr.district_id = '${userDetails.district_id}'`
			: ' WHERE 1=0'
		return `${baseQuery}${districtFilter}
		GROUP BY ad.actor_id, ad.surname, ad.other_names, addr.admin_post_id, cd.primary_phone, cd.secondary_phone`
	}, [userDetails?.district_id])

	const {
		data: farmersWithAdminPostAndContact,
		isLoading: isFarmersWithAdminPostAndContactLoading,
		error: farmersWithAdminPostAndContactError,
		isError: isFarmersWithAdminPostAndContactError,
	} = useQueryMany<{
		id: string
		surname: string
		other_names: string
		multicategory: string
		admin_post_id: string
		primary_phone: string
		secondary_phone: string
	}>(farmersQuery)

	const [activeTab, setActiveTab] = useState('')

	const filteredFarmers = useMemo(() => {
		// Ensure farmersWithAdminPostAndContact is an array
		if (!Array.isArray(farmersWithAdminPostAndContact)) {
			return []
		}

		if (!search && !newSearchKey) {
			if (activeTab === 'ALL') {
				return farmersWithAdminPostAndContact.reverse()
			} else if (activeTab === MultiCategory.FARMER_SPRAYING_SERVICE_PROVIDER) {
				return farmersWithAdminPostAndContact
					.filter((farmer) => farmer?.multicategory?.includes(MultiCategory.FARMER_SPRAYING_SERVICE_PROVIDER))
					.reverse()
			} else if (activeTab === MultiCategory.FARMER_SMALL_SCALE) {
				return farmersWithAdminPostAndContact
					.filter((farmer) => farmer?.multicategory?.includes(MultiCategory.FARMER_SMALL_SCALE))
					.reverse()
			} else if (activeTab === MultiCategory.FARMER_LARGE_SCALE) {
				return farmersWithAdminPostAndContact
					.filter((farmer) => farmer?.multicategory?.includes(MultiCategory.FARMER_LARGE_SCALE))
					.reverse()
			}
		}
		if (newSearchKey) {
			// filter by adminPost
			return farmersWithAdminPostAndContact
				.filter((farmer) => farmer?.admin_post_id?.toLowerCase().includes(newSearchKey.toLowerCase()))
				.reverse()
		}
		return farmersWithAdminPostAndContact
			.filter(
				(farmer) =>
					farmer?.surname?.toLowerCase().includes(search.toLowerCase()) ||
					farmer?.other_names?.toLowerCase().includes(search.toLowerCase()) ||
					farmer?.primary_phone?.includes(search.toString()) ||
					farmer?.secondary_phone?.includes(search.toString()),
			)
			.reverse()
	}, [search, farmersWithAdminPostAndContact, activeTab, newSearchKey])

	const { bottomSheetModalRef, handleModalPress } = useActorsHeader({
		locationName,
		subtitle: 'Produtores',
		onResetResource: resetCurrentResource,
		showOptionsButton: true,
	})

	const handleSearchKeys = () => loadSearchKeys()

	const handleFilterSelect = (key: string) => {
		handleModalPress()
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


	// Render each farmer with a photo, name, surname, phone number, and cashew stock
	const renderItem = useCallback(
		({ item }: { item: FarmerItem }) => <ActorListItem item={item} resource_name={ResourceName.FARMER} />,
		[],
	)

	// Check if farmers array is undefined
	// check if farmers array is undefined
	// if it is undefined, show a skeleton loader
	// else show the farmers in a flatlist
	if (!filteredFarmers) {
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
		<CustomSafeAreaView edges={['bottom']} style={{ paddingTop: 0 }}>

			<View className="px-2">
				{isLoading ? (
					<FlatList
						showsVerticalScrollIndicator={false}
						data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]}
						numColumns={1}
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
					<Animated.FlatList<FarmerItem>
						className="bg-white dark:bg-black"
						contentContainerStyle={{
							flexGrow: 1,
							paddingBottom: 100,
						}}
						data={filteredFarmers}
						onScroll={scrollHandler}
						scrollEventThrottle={16}
						showsVerticalScrollIndicator={false}
						renderItem={renderItem}
						keyExtractor={(item) => item.id}
						ListEmptyComponent={() => (
							<View className="flex-1 items-center justify-center h-[400px]">
								<EmptyPlaceholder message="Não há produtores para mostrar" />
							</View>
						)}
					/>
				)}
			</View>

			<AdminPostFilterModal
				bottomSheetModalRef={bottomSheetModalRef}
				handleDismissModalPress={handleModalPress}
				searchKeys={searchKeys}
				selectedValue={newSearchKey || 'All'}
				onSelect={handleFilterSelect}
				title="Filtrar registos"
			/>
			<SingleFloatingButton route="/(tabs)/actors/registration/farmer" />
		</CustomSafeAreaView>
	)
}
