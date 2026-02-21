// React and React Native imports
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, TouchableOpacity, View, Text } from 'react-native'
import { useColorScheme } from 'nativewind'

// Third-party libraries
import { Ionicons } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useNavigation } from 'expo-router'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'

// Components
import ActorListItem from 'src/components/actors/ActorListItem'
import BackButton from 'src/components/buttons/BackButton'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'
import CustomBottomSheetModal from 'src/components/modals/CustomBottomSheetModal'
import CustomShimmerPlaceholder from 'src/components/placeholder/CustomShimmerPlaceholder'

// Constants and types
import { colors } from 'src/constants'
import { MultiCategory, ResourceName } from 'src/types'

// Hooks
import { useHeaderOptions, useNavigationSearch } from 'src/hooks/useNavigationSearch'
import { useActionStore } from 'src/store/actions/actions'
import { useQueryMany, useSearchOptions, useUserDetails } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'
export default function ServiceProvidersScreen() {
	const { userDetails } = useUserDetails()
	const navigation = useNavigation()
	const { resetCurrentResource } = useActionStore()
	const { searchKeys, loadSearchKeys } = useSearchOptions(userDetails?.district_id || '')
	const [newSearchKey, setNewSearchKey] = useState<string>('')
	const { search, setSearch } = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Procurar Provedores de Serviços',
		},
	})
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [isLoading, setIsLoading] = useState(true)
	const [isSearchOptionsVisible, setIsSearchOptionsVisible] = useState(false)

	const {
		data: serviceProviders,
		isLoading: isServiceProvidersLoading,
		error: serviceProvidersError,
		isError: isServiceProvidersError,
	} = useQueryMany<{
		id: string
		surname: string
		other_names: string
		multicategory: string
		admin_post_id: string
		primary_phone: string
		secondary_phone: string
	}>(
		`SELECT 
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
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'FARMER'
		WHERE INSTR(ac.subcategory, '${MultiCategory.FARMER_SPRAYING_SERVICE_PROVIDER}') > 0
		GROUP BY ad.actor_id, ad.surname, ad.other_names, addr.admin_post_id, cd.primary_phone, cd.secondary_phone`,
	)

	const filteredFarmers = useMemo(() => {
		if (!search && !newSearchKey) {
			return serviceProviders.reverse()
		}
		if (newSearchKey) {
			return serviceProviders
				.filter((farmer) => farmer.admin_post_id?.toLowerCase().includes(newSearchKey.toLowerCase()))
				.reverse()
		}
		return serviceProviders
			.filter(
				(farmer) =>
					farmer.surname?.toLowerCase().includes(search.toLowerCase()) ||
					farmer.other_names?.toLowerCase().includes(search.toLowerCase()) ||
					farmer.primary_phone?.toLowerCase().includes(search.toLowerCase()) ||
					farmer.secondary_phone?.toLowerCase().includes(search.toLowerCase()),
			)
			.reverse()
	}, [search, serviceProviders, newSearchKey])

	// Update header options
	useHeaderOptions({}, 'Provedores de Serviços')
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton />,
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

		// reset current resource
		resetCurrentResource()
	}, [isSearchOptionsVisible])

	const bottomSheetModalRef = useRef<BottomSheetModal>(null)

	const handleModalPress = useCallback(() => {
		if (!isSearchOptionsVisible) {
			bottomSheetModalRef.current?.present()
			setIsSearchOptionsVisible(true)
		} else {
			bottomSheetModalRef.current?.dismiss()
			setIsSearchOptionsVisible(false)
		}
	}, [])

	const handleSearchKeys = () => {
		// get all adminPosts
		loadSearchKeys()
	}

	useEffect(() => {
		handleSearchKeys()
		if (isLoading) {
			setTimeout(() => {
				setIsLoading(false)
			}, 500)
		}
	}, [isLoading])

	const renderItem = ({
		item,
	}: {
		item: {
			id: string
			surname: string
			other_names: string
			multicategory: string
			contact_id: string
			admin_post_id: string
			primary_phone: string
			secondary_phone: string
		}
	}) => <ActorListItem item={item} resource_name={ResourceName.FARMER} />

	const isFabVisible = useSharedValue(true)
	const scrollY = useSharedValue(0)

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			const currentOffset = event.contentOffset.y
			isFabVisible.value = currentOffset < 0 || scrollY.value > currentOffset
			scrollY.value = currentOffset
		},
	})

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

	// Render the farmers in a flatlist
	return (
		<>
			<View className="flex-1 bg-white dark:bg-black">
				<View className="">
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
					<Animated.FlatList
						className="bg-white dark:bg-black"
						data={filteredFarmers}
						contentContainerStyle={{
							flexGrow: 1,
							paddingBottom: 100,
						}}
						onScroll={scrollHandler}
						scrollEventThrottle={16}
						showsVerticalScrollIndicator={false}
						renderItem={renderItem}
						keyExtractor={(item: { id: string }) => item.id}
						ListEmptyComponent={() => (
							<View className="flex-1 items-center justify-center h-[400px]">
								<EmptyPlaceholder message="Não há provedores de serviços para mostrar" />
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
			<SingleFloatingButton route="/(tabs)/actors/registration/farmer-registration" />
		</View>
		</>
	)
}
