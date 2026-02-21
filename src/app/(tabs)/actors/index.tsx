import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { useNavigation } from 'expo-router'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { categoriesCardDetails, categoryOptions } from 'src/constants/categories'
import { useHeaderOptions } from 'src/hooks/useNavigationSearch'
import { CategoryCardType } from 'src/types'

import CategoryItem from 'src/components/list-items/CategoryItem'
import { GroupFloatingButton } from 'src/components/buttons/GroupFloatingButton'
import { useUserDetails } from 'src/hooks/queries'
import { getDistrictById } from 'src/library/sqlite/selects'
import RouteProtection from 'src/components/auth/route-protection'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'

export default function ActorsHomeScreen() {
	const navigation = useNavigation()
	const { userDetails, isLoading: isUserLoading } = useUserDetails()
	const [locationName, setLocationName] = useState<string>('')

	const keyExtractor = (item: CategoryCardType) => item.actorCategory

	// update Header options
	useHeaderOptions()

	// Fetch location name when userDetails becomes available
	useEffect(() => {
		const fetchLocationName = async () => {
			if (userDetails?.district_id) {
				try {
					const district = await getDistrictById(userDetails.district_id)
					setLocationName(district || '')
				} catch (error) {
					console.error('Error fetching district name:', error)
					setLocationName('')
				}
			} else if (!isUserLoading) {
				// Only set empty string if we're not loading and have no district_id
				setLocationName('')
			}
		}

		fetchLocationName()
	}, [userDetails?.district_id, isUserLoading])

	// Update header and show skeleton
	useEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View className="items-center ">
					<Text className="text-black dark:text-white text-[14px] font-bold ">{locationName}</Text>
					<Text className="text-gray-600 dark:text-gray-400 font-mono text-[12px]">Actores</Text>
				</View>
			),
		})
	}, [locationName, navigation])

	return (
		<RouteProtection>
			<CustomSafeAreaView>
					<Animated.FlatList
						entering={FadeIn.duration(300)}
						exiting={FadeOut.duration(300)}
						numColumns={2}
						contentContainerStyle={{
							padding: 16,
							rowGap: 16,
							columnGap: 16,
						}}
						showsVerticalScrollIndicator={false}
						data={categoriesCardDetails}
						keyExtractor={keyExtractor}
						renderItem={({ item }: { item: CategoryCardType }) => {
							return <CategoryItem category={item} />
						}}
					/>
					<GroupFloatingButton categories={categoryOptions} />
				</CustomSafeAreaView>
		</RouteProtection>
	)
}
