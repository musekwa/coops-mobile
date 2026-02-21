// React and React Native imports
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { useColorScheme } from 'nativewind'

// Navigation
import { useNavigation, useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'

// Third party libraries
import { Ionicons } from '@expo/vector-icons'
import BottomSheet from '@gorhom/bottom-sheet'

// Components
import CustomPopUpMenu from 'src/components/menus/CustomPopUpMenu'
import DisplayPDF from 'src/components/data-preview/PdfDisplayer'
import DistrictOverview from 'src/components/trades/DistrictOverview'

// Hooks and Store
import { useActionStore } from 'src/store/actions/actions'
import { useHeaderOptions } from 'src/hooks/useNavigationSearch'

// Constants and Types
import { colors } from 'src/constants'
import { useUserDetails } from 'src/hooks/queries'

// Helpers
import { commercializationCampainsdateRange } from 'src/helpers/dates'
import { getAdminPostsByDistrictId } from 'src/library/sqlite/selects'
import RouteProtection from 'src/components/auth/route-protection'
import { ActorDetailRecord, WarehouseDetailRecord } from 'src/library/powersync/schemas/AppSchema'

interface Address {
	province: string
	district: string
	admin_post: string
	village: string
}

export default function TradesScreen() {
	const { setPdfUri, pdfUri } = useActionStore()
	const { userDetails } = useUserDetails()
	const navigation = useNavigation()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [reportHint, setReportHint] = useState('')
	const [warehousesByType, setWarehousesByType] = useState<{
		buyingPoints: (WarehouseDetailRecord & Address)[]
		aggregationPoints: (WarehouseDetailRecord & Address)[]
		destinationPoints: (WarehouseDetailRecord & Address)[]
	} | null>(null)
	const [orgsByType, setOrgsByType] = useState<{
		associations: (ActorDetailRecord & Address)[]
		cooperatives: (ActorDetailRecord & Address)[]
		coop_unions: (ActorDetailRecord & Address)[]
	} | null>(null)
	const [tradersByType, setTradersByType] = useState<{
		primaries: (ActorDetailRecord & Address)[]
		secondaries: (ActorDetailRecord & Address)[]
		finals: (ActorDetailRecord & Address)[]
	} | null>(null)

	const [foundAdminPosts, setFoundAdminPosts] = useState<
		{
			name: string
			id: string
		}[]
	>([])
	const [, setRefresh] = useState({})

	// Scrollable BottomSheet Modal
	const sheetRef = useRef<BottomSheet>(null)

	// Handle BottomSheet Snap Press
	const handleSnapPress = useCallback((index: number) => {
		sheetRef.current?.snapToIndex(index)
	}, [])

	// Handle BottomSheet Close Press
	const handleClosePress = useCallback(() => {
		sheetRef.current?.close()
		setReportHint('')
	}, [])

	useFocusEffect(
		useCallback(() => {
			setRefresh({})
		}, []),
	)

	useHeaderOptions()
	useEffect(() => {
		navigation.setOptions({
			headerTitle: () => <HeaderTitle title="Comercialização" />,
			headerRight: () => <HeaderRight />,
		})

		// Get admin posts by district id
		if (userDetails?.district_id) {
			getAdminPostsByDistrictId(userDetails?.district_id).then((adminPosts) => {
				if (adminPosts) {
					setFoundAdminPosts(adminPosts)
				} else {
					setFoundAdminPosts([{ name: 'N/A', id: 'N/A' }])
				}
			})
		}
	}, [userDetails])

	if (pdfUri) {
		return <DisplayPDF />
	}

	return (
		<RouteProtection>
			<View style={{ flex: 1 }}>
				<View className="flex-1 bg-white dark:bg-black">
					<DistrictOverview
						tradersByType={tradersByType}
						setTradersByType={setTradersByType}
						setOrgsByType={setOrgsByType}
						warehousesByType={warehousesByType}
						setWarehousesByType={setWarehousesByType}
						handleSnapPress={handleSnapPress}
						reportHint={reportHint}
						setReportHint={setReportHint}
					/>
				</View>
			</View>
		</RouteProtection>
	)
}

const HeaderTitle = ({ title }: { title: string }) => {
	return (
		<View className="items-center ">
			<Text className="text-black dark:text-white text-[14px] font-bold " ellipsizeMode="tail" numberOfLines={1}>
				{title}
			</Text>
			<Text className="text-gray-600 dark:text-gray-400 font-mono text-[12px]">
				{commercializationCampainsdateRange}
			</Text>
		</View>
	)
}

const HeaderRight = () => {
	const router = useRouter()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	return (
		<CustomPopUpMenu
			options={[
				{
					label: 'Postos de Compras',
					icon: <Ionicons color={isDarkMode ? colors.white : colors.black} name="list-outline" size={18} />,
					action: async () => router.push('/(tabs)/trades/buying-points'),
				},
				{
					label: 'Armazéns de Trânsito',
					icon: <Ionicons name="git-merge-outline" size={18} color={isDarkMode ? colors.white : colors.black} />,
					action: async () => router.push(`/(tabs)/trades/aggregation-points`),
				},
				{
					label: 'Armazéns de Destino',
					icon: <Ionicons name="storefront-outline" size={18} color={isDarkMode ? colors.white : colors.black} />,
					action: () => router.push('/(tabs)/trades/destionation-points'),
				},
				{
					label: 'Grupos',
					icon: <Ionicons name="people-outline" size={18} color={isDarkMode ? colors.white : colors.black} />,
					action: () => router.push('/(tabs)/trades/organization-points'),
				},
				{
					label: 'Monitoria de Trânsito',
					icon: <Ionicons name="shield-checkmark-outline" size={18} color={isDarkMode ? colors.white : colors.black} />,
					action: () => router.push('/(tabs)/trades/shipments'),
				},
			]}
		/>
	)
}
