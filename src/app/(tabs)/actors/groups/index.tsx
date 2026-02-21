// React and React Native imports
import React, { useEffect, useMemo, useState } from 'react'
import { FlatList, View } from 'react-native'

// Navigation
import { useNavigation } from 'expo-router'

// Animations
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'

// Components
import BackButton from 'src/components/buttons/BackButton'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'
import OrgTypeCard from 'src/components/organizations/OrgTypeCard'
import CustomShimmerPlaceholder, {
	CustomShimmerPlaceholderItem,
} from 'src/components/placeholder/CustomShimmerPlaceholder'

// Constants and Types
import { organizationTypes } from 'src/constants/categories'
import { OrganizationTypes } from 'src/types'

// Hooks and Models
import { useHeaderOptions } from 'src/hooks/useNavigationSearch'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useQueryMany } from 'src/hooks/queries'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'

export default function OrganizationsScreen() {
	const navigation = useNavigation()
	const [showSkeleton, setShowSkeleton] = useState(false)
	const {
		data: groups,
		isLoading: isGroupsLoading,
		error: groupsError,
		isError: isGroupsError,
	} = useQueryMany<{
		organization_type: string
		count: number
	}>(`SELECT ac.subcategory as organization_type, COUNT(*) as count 
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
		WHERE a.category = 'GROUP'
		GROUP BY ac.subcategory`)

	// Update header options
	useHeaderOptions({}, 'Actores Agrupados')
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton route="/(tabs)/actors" />,
		})
		setShowSkeleton(true)
		setTimeout(() => {
			setShowSkeleton(false)
		}, 1000)
	}, [])

	return (
		<CustomSafeAreaView>
					{showSkeleton && (
						<FlatList
							data={[1, 2, 3]}
							numColumns={2}
							keyExtractor={(item: number) => item.toString()}
							renderItem={() => (
								<View className="w-1/2 flex items-center space-y-1">
									<CustomShimmerPlaceholder
										style={{
											width: 80,
											height: 80,
											margin: 20,
											borderRadius: 120,
										}}
									/>
									<CustomShimmerPlaceholderItem
										props={{
											style: {
												width: 100,
												height: 20,
												borderRadius: 10,
											},
										}}
									/>
									<CustomShimmerPlaceholderItem
										props={{
											style: {
												width: 100,
												height: 10,
												borderRadius: 10,
											},
										}}
									/>
								</View>
							)}
						/>
					)}
					{!showSkeleton && (
						<Animated.FlatList
							numColumns={2}
							contentContainerStyle={{
								padding: 15,
								rowGap: 16,
								columnGap: 16,
							}}
							showsVerticalScrollIndicator={false}
							ListHeaderComponent={<View className="h-4" />}
							data={organizationTypes}
							keyExtractor={(item: (typeof organizationTypes)[0]) => item.routeSegment}
							renderItem={({ item }: { item: (typeof organizationTypes)[0] }) => {
								if (item.orgType === OrganizationTypes.COOPERATIVE) {
									item.count =
										groups.find((group) => group.organization_type === OrganizationTypes.COOPERATIVE)?.count || 0
								}
								if (item.orgType === OrganizationTypes.ASSOCIATION) {
									item.count =
										groups.find((group) => group.organization_type === OrganizationTypes.ASSOCIATION)?.count || 0
								}
								if (item.orgType === OrganizationTypes.COOP_UNION) {
									item.count =
										groups.find((group) => group.organization_type === OrganizationTypes.COOP_UNION)?.count || 0
								}
								return (
									<OrgTypeCard
										title={item.title}
										imageUri={item.imageUri}
										count={item.count}
										description={item.description}
										routeSegment={item.routeSegment}
									/>
								)
							}}
						/>
					)}
					<SingleFloatingButton route="/(tabs)/actors/registration/org-registration" />
		</CustomSafeAreaView>
	)
}
