import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import BackButton from 'src/components/buttons/BackButton'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'
import OrganizationsList from 'src/components/organizations/OrganizationsList'
import { useNavigationSearch } from 'src/hooks/useNavigationSearch'
import { useQueryMany, useSearchOptions, useUserDetails } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { OrganizationTypes } from 'src/types'
import { useActionStore } from 'src/store/actions/actions'
import { colors } from 'src/constants'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'
import { getDistrictById } from 'src/library/sqlite/selects'

export default function CoopUnionsScreen() {
	const { userDetails, isLoading: isUserLoading } = useUserDetails()


	const { resetCurrentResource } = useActionStore()
	const [locationName, setLocationName] = useState<string>('')	
	const { search, setSearch } = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Procurar Uniões das Cooperativas',
		},
	})
	const [isSearchOptionsVisible, setIsSearchOptionsVisible] = useState(false)
	const navigation = useNavigation()
	const [newSearchKey, setNewSearchKey] = useState<string>('')
	
	const [isLoading, setIsLoading] = useState(false)
	
	const { searchKeys, loadSearchKeys } = useSearchOptions(userDetails?.district_id || '')
	const [activeTab, setActiveTab] = useState('')
	
	const bottomSheetModalRef = useRef<BottomSheetModal>(null)
	

	const organizationType = OrganizationTypes.COOP_UNION

	// Perform a JOIN with address_details table to get the admin_post for each coop union
	const {
		data: groupsWithAddressAndDocument,
		isLoading: isGroupsWithAddressAndDocumentLoading,
		error: groupsWithAddressAndDocumentError,
		isError: isGroupsWithAddressAndDocumentError,
	} = useQueryMany<{
		id: string
		group_name: string
		organization_type: string
		admin_post: string
	}>(
		`SELECT 
			a.id, 
			ad.other_names as group_name, 
			ac.subcategory as organization_type, 
			ap.name as admin_post 
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON addr.admin_post_id = ap.id
		WHERE a.category = 'GROUP' AND ac.subcategory = '${organizationType}'`,
	)

	// Search for coops that match the search query and in case of no search query, return all coops
	const coopUnionsFiltered = useMemo(() => {
		if (!search) return groupsWithAddressAndDocument.reverse()
		return groupsWithAddressAndDocument
			.filter((coopUnion) => coopUnion.group_name.toLowerCase().includes(search.toLowerCase()))
			.reverse()
	}, [groupsWithAddressAndDocument, search])

	const handleModalPress = useCallback(() => {
		if (!isSearchOptionsVisible) {
			bottomSheetModalRef.current?.present()
			setIsSearchOptionsVisible(true)
		} else {
			bottomSheetModalRef.current?.dismiss()
			setIsSearchOptionsVisible(false)
		}
	}, [isSearchOptionsVisible])

	const handleSearchKeys = () => {
		// get all adminPosts
		loadSearchKeys()
	}

// Update header options
useEffect(() => {
	navigation.setOptions({
		headerTitle: () => (
			<View className="items-center">
				<Text className="text-black dark:text-white text-[14px] font-bold">{locationName}</Text>
				<Text className="text-gray-600 dark:text-gray-400 font-mono text-[12px]">Cooperativas</Text>
			</View>
		),
		headerLeft: () => <BackButton route="/(tabs)/actors" />,
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
}, [isSearchOptionsVisible, locationName])


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
	

// Fetch location name when userDetails becomes available
useEffect(() => {
	const fetchLocationName = async () => {
		if (userDetails?.district_id) {
			try {
				const district = await getDistrictById(userDetails.district_id) as string
				setLocationName(district || '')
			} catch (error) {
				console.error('Error fetching district name:', error)
				setLocationName('')
			}
		} else if (!isUserLoading) {
			setLocationName('')
		}
	}

	fetchLocationName()
}, [userDetails?.district_id])

	return (
		<CustomSafeAreaView edges={['bottom']} style={{ paddingTop: 0 }}>
			<OrganizationsList items={coopUnionsFiltered} organizationType={organizationType} />
			<SingleFloatingButton route="/(tabs)/actors/registration/coop-union" />
		</CustomSafeAreaView>
	)
}
