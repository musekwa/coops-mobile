// React and React Native imports
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'

// Third-party libraries
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import { useColorScheme } from 'nativewind'

// Components
import ActorListItem from 'src/components/actors/ActorListItem'
import BackButton from 'src/components/buttons/BackButton'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'
import CustomBottomSheetModal from 'src/components/modals/CustomBottomSheetModal'
import { CustomShimmerPlaceholderItemList } from 'src/components/placeholder/CustomShimmerPlaceholder'

// Constants and Types
import { colors } from 'src/constants'

// Hooks
import { useHeaderOptions, useNavigationSearch } from 'src/hooks/useNavigationSearch'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useQueryMany, useSearchOptions, useUserDetails } from 'src/hooks/queries'
import { MultiCategory, ResourceName } from 'src/types'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'

export default function Page() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	const navigation = useNavigation()
	const [isLoading, setIsLoading] = React.useState(true)
	const [isOptionsVisible, setIsOptionsVisible] = React.useState(false)
	const [newSearchKey, setNewSearchKey] = React.useState<string>('')
	const {userDetails} = useUserDetails()
	const {searchKeys, loadSearchKeys} = useSearchOptions(userDetails?.district_id || '')
	
	const { search, setSearch } = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Procurar Processadores',
		},
	})
	const {data: processors, isLoading: isProcessorsLoading, error: processorsError, isError: isProcessorsError} = useQueryMany<{
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
		WHERE ac.subcategory LIKE '%${MultiCategory.TRADER_LARGE_SCALE_PROCESSING}%' OR ac.subcategory LIKE '%${MultiCategory.TRADER_SMALL_SCALE_PROCESSING}%'
		GROUP BY ad.actor_id, ad.surname, ad.other_names, cd.id, addr.admin_post_id, cd.primary_phone, cd.secondary_phone`,
	)
	
	const filteredProcessors = useMemo(() => {
		if (!search && !newSearchKey) return processors

		if (newSearchKey) {
			return processors.filter((trader) => trader.admin_post_id?.toLowerCase().includes(newSearchKey.toLowerCase()))
		}
		return processors.filter(
			(trader) =>
				trader.surname.toLowerCase().includes(search.toLowerCase()) ||
				trader.other_names.toLowerCase().includes(search.toLowerCase()) ||
				String(trader.primary_phone).toLowerCase().includes(search.toLowerCase()) ||
				String(trader.secondary_phone).toLowerCase().includes(search.toLowerCase()),
		)
	}, [search, processors])

	useHeaderOptions({}, 'Processadores')
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton route="/(tabs)/actors/traders" />,
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
	}, [isOptionsVisible])

	const handleSearchKeys = () => {
		// get all adminPosts
		// const adminPostsByDistrict = userDetails?.district ? adminPosts[userDetails?.district]?.map((post) => ({ label: post, value: post })) : []
		// const {searchKeys, loadSearchKeys} = useSearchOptions(userDetails?.district_id || '')
		// get all villages
		// adminPostsByDistrict.push({
		// 	label: 'Todos',
		// 	value: 'All',
		// })
		// setSearchKeys(adminPostsByDistrict)
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

	useEffect(() => {
		handleSearchKeys()
		if (isLoading) {
			setTimeout(() => {
				setIsLoading(false)
			}, 500)
		}
	}, [isLoading])

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

	const renderItem = ({ item }: { item: {
		id: string
		surname: string
		other_names: string
		multicategory: string
		contact_id: string
		admin_post_id: string
		primary_phone: string
		secondary_phone: string } }) => <ActorListItem item={item} resource_name={ResourceName.TRADER} />
	return (
		<View className="flex-1 bg-white dark:bg-black">
			{isLoading ? (
				<CustomShimmerPlaceholderItemList count={10} />
			) : (
				<FlatList
					contentContainerStyle={{
						flexGrow: 1,
						paddingBottom: 100,
					}}
					data={filteredProcessors}
					showsVerticalScrollIndicator={false}
					renderItem={renderItem}
					keyExtractor={(item: { id: string }) => item.id}
					ListEmptyComponent={() => (
						<View className="flex-1 items-center justify-center h-[400px]">
							<EmptyPlaceholder message="Não há comerciantes para mostrar" />
						</View>
					)}
				/>
			)}

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
			{filteredProcessors.length > 0 && <SingleFloatingButton route="/(tabs)/actors/registration/trader-registration" />}
		</View>
	)
}
