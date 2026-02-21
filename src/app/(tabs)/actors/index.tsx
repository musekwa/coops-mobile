import { useEffect, useState } from 'react'
import { Text, View, ScrollView } from 'react-native'
import { useNavigation } from 'expo-router'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

import { categoriesCardDetails, categoryOptions } from 'src/constants/categories'
import { useHeaderOptions } from 'src/hooks/useNavigationSearch'

import ActorCategoryCard from 'src/components/list-items/ActorCategoryCard'
import { GroupFloatingButton } from 'src/components/buttons/GroupFloatingButton'
import { useUserDetails } from 'src/hooks/queries'
import { getDistrictById } from 'src/library/sqlite/selects'
import RouteProtection from 'src/components/auth/route-protection'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'

export default function ActorsHomeScreen() {
	const navigation = useNavigation()
	const { userDetails, isLoading: isUserLoading } = useUserDetails()
	const [locationName, setLocationName] = useState<string>('')

	// update Header options
	useHeaderOptions()

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
	}, [userDetails?.district_id, isUserLoading])

	// Update header
	useEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View className="items-center">
					<Text className="text-black dark:text-white text-[14px] font-bold">{locationName}</Text>
					<Text className="text-gray-600 dark:text-gray-400 font-mono text-[12px]">Actores</Text>
				</View>
			),
		})
	}, [locationName, navigation])

	return (
		<RouteProtection>
			<CustomSafeAreaView>
				<Animated.View
					entering={FadeIn.duration(300)}
					className="flex-1 bg-gray-50 dark:bg-black"
				>
					<ScrollView
						contentContainerStyle={{
							padding: 20,
							paddingBottom: 100,
						}}
						showsVerticalScrollIndicator={false}
					>
						<Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
							Tipos de actores
						</Text>
						<Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">
							Seleccione uma categoria para explorar
						</Text>

						{categoriesCardDetails.map((item, index) => (
							<Animated.View
								key={item.actorCategory}
								entering={FadeInDown.duration(400).delay(index * 80).springify()}
							>
								<ActorCategoryCard category={item} />
							</Animated.View>
						))}
					</ScrollView>
					<GroupFloatingButton categories={categoryOptions} />
				</Animated.View>
			</CustomSafeAreaView>
		</RouteProtection>
	)
}
