// React and React Native imports
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, SectionList } from 'react-native'

// Third-party library imports
import { Ionicons } from '@expo/vector-icons'
import { BottomSheetModal, TouchableOpacity } from '@gorhom/bottom-sheet'
import { useRouter, useNavigation } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { Image } from 'expo-image'
import Animated, { SlideInDown } from 'react-native-reanimated'

// Components
import CustomBottomSheetModal from 'src/components/modals/CustomBottomSheetModal'
import ActorListEmpty from 'src/components/not-found/ActorListEmpty'
import { CustomShimmerPlaceholderItemList } from 'src/components/placeholder/CustomShimmerPlaceholder'

// Constants and config
import { colors } from 'src/constants'
import { noImageUri } from 'src/constants/imageURI'

// Hooks
import { useNavigationSearch } from 'src/hooks/useNavigationSearch'

// Models and types
import { ActionType, OrganizationTypes } from 'src/types'
import {
	useQueryMany,
	useUserDetails,
	useLocationName,
	useSearchOptions,
	useGroupedOrganizations,
	getOrganizationTypeConfig,
} from 'src/hooks/queries'
import { TABLES, ActorDetailRecord } from 'src/library/powersync/schemas/AppSchema'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'

export default function OrganizationPointsScreen() {
	const config = getOrganizationTypeConfig()
	const { search, setSearch } = useNavigationSearch({
		searchBarOptions: {
			placeholder: config.searchPlaceholder,
		},
	})
	const { userDetails } = useUserDetails()
	const navigation = useNavigation()
	const router = useRouter()
	const [newSearchKey, setNewSearchKey] = useState('')
	const [isSearchOptionsVisible, setIsSearchOptionsVisible] = useState(false)
	const bottomSheetModalRef = useRef<BottomSheetModal>(null)
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [isLoading, setIsLoading] = useState(true)

	const {
		data: groups,
		isLoading: isGroupsLoading,
		error: groupsError,
		isError: isGroupsError,
	} = useQueryMany<{
		id: string
		name: string
		photo: string
		organization_type: string
		address_id: string
		admin_post_name: string
		district_name: string
		province_name: string
		village_name: string
	}>(`
		SELECT 
			a.id,
			ad.other_names as name,
			ad.photo,
			ac.subcategory as organization_type,
			addr.id as address_id,
			ap.name as admin_post_name,
			d.name as district_name,
			p.name as province_name,
			v.name as village_name
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON ap.id = addr.admin_post_id
		LEFT JOIN ${TABLES.DISTRICTS} d ON d.id = addr.district_id
		LEFT JOIN ${TABLES.PROVINCES} p ON p.id = addr.province_id
		LEFT JOIN ${TABLES.VILLAGES} v ON v.id = addr.village_id
		WHERE addr.district_id = '${userDetails?.district_id}'
		AND a.category = 'GROUP'
	`)

	// Use reusable hooks - declare searchKeys first
	const { searchKeys } = useSearchOptions(userDetails?.district_id || undefined)

	const flattenedGroups = useMemo(() => {
		let filteredGroups = groups.flat()

		// First filter by admin_post if newSearchKey is set
		if (newSearchKey && newSearchKey !== 'All') {
			filteredGroups = filteredGroups.filter((group) => {
				// Find the admin post that matches the selected search key
				const selectedAdminPost = searchKeys.find((key) => key.value === newSearchKey)
				return selectedAdminPost ? group.admin_post_name === selectedAdminPost.label : false
			})
		}

		// Then filter by search term if search is set
		if (search) {
			filteredGroups = filteredGroups.filter((group) => group.name?.toLowerCase().includes(search.toLowerCase()))
		}

		return filteredGroups
	}, [groups, newSearchKey, search, searchKeys])

	const handleModalPress = useCallback(() => {
		if (!isSearchOptionsVisible) {
			bottomSheetModalRef.current?.present()
			setIsSearchOptionsVisible(true)
		} else {
			bottomSheetModalRef.current?.dismiss()
			setIsSearchOptionsVisible(false)
		}
	}, [])

	const handleModalDismissPress = useCallback(() => {
		bottomSheetModalRef.current?.dismiss()
	}, [])

	// Use reusable hooks
	const locationName = useLocationName(newSearchKey, userDetails?.district_id || undefined)
	const groupedData = useGroupedOrganizations(flattenedGroups.filter((group) => group.organization_type))

	useEffect(() => {
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
			setIsSearchOptionsVisible(false)
			return
		}
		setNewSearchKey(key)
	}

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
	}, [isSearchOptionsVisible, newSearchKey, userDetails?.district_id])

	const renderItem = ({
		item,
	}: {
		item: {
			id: string
			name: string
			photo: string
			organization_type: string
			address_id: string
			admin_post_name: string
			district_name: string
			province_name: string
			village_name: string
		}
	}) => (
		<TouchableOpacity
			activeOpacity={0.5}
			onPress={() => router.push(`/(aux)/trades/organizations/transactions?organizationId=${item.id}`)}
			className=""
		>
			<View className="flex-row space-x-2 items-center p-2 border-b border-gray-200 dark:border-gray-700">
				<Image source={{ uri: noImageUri }} style={{ width: 60, height: 60, borderRadius: 30 }} contentFit="cover" />
				<View className="flex-1">
					<Text className="text-black dark:text-white font-bold">{item.name ?? ''}</Text>
					<View className="flex-row items-center">
						<Ionicons name="location-outline" size={16} color={isDarkMode ? colors.gray600 : colors.gray600} />
						<Text className="text-gray-600 dark:text-gray-400 ml-1 text-[12px]">{item.admin_post_name}</Text>
					</View>
				</View>
				<Ionicons name="chevron-forward" size={24} color={colors.primary} />
			</View>
		</TouchableOpacity>
	)

	const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => {
		const translatedTitle =
			title === OrganizationTypes.COOPERATIVE
				? 'Cooperativas'
				: title === OrganizationTypes.ASSOCIATION
					? 'Associações'
					: 'Uniões Cooperativas'

		return (
			<View className="bg-gray-100 dark:bg-gray-800 p-2">
				<Text className="text-black dark:text-white font-bold">{translatedTitle}</Text>
			</View>
		)
	}

	if (isLoading) {
		return <CustomShimmerPlaceholderItemList count={14} />
	}

	return (
		<CustomSafeAreaView>
			{/* <View className=" "> */}

			<SectionList
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 0 }}
				sections={groupedData}
				keyExtractor={(item) => item.id.toString()}
				renderItem={renderItem}
				renderSectionHeader={renderSectionHeader}
				stickySectionHeadersEnabled={true}
				ListEmptyComponent={
					<View className="flex-1 items-center justify-center h-[400px]">
						<ActorListEmpty actionType={ActionType.UNKNOWN} />
					</View>
				}
			/>
			{/* </View> */}
			{/* Bottom Sheet Modal */}
			<CustomBottomSheetModal handleDismissModalPress={handleModalPress} bottomSheetModalRef={bottomSheetModalRef}>
				<View className="flex p-3">
					<Text className="mx-8 text-black dark:text-white italic text-[12px]">
						Filtrar grupos por posto administrativo
					</Text>
					<View className="space-y-4 pt-8 mx-6">
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
		</CustomSafeAreaView>
	)
}
