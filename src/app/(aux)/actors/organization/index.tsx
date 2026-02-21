// React and React Native imports
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'

// Third-party libraries
import Ionicons from '@expo/vector-icons/build/Ionicons'

// Components
import ActorListEmpty from 'src/components/not-found/ActorListEmpty'
import CurrentStock from 'src/components/trades/CurrentStock'

// Constants and Types
import { colors } from 'src/constants'
import { ActionType } from 'src/types'
import CustomPopUpMenu from 'src/components/menus/CustomPopUpMenu'
import { Href, useNavigation, useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { useActionStore } from 'src/store/actions/actions'
import { FontAwesome } from '@expo/vector-icons'

export default function OrganizationIndexScreen() {
	const navigation = useNavigation()
	const router = useRouter()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const { currentResource } = useActionStore()
	const [currentStock, setCurrentStock] = useState(0)

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<CustomPopUpMenu
					options={[
						{
							label: 'Actualizar Dados',
							icon: <FontAwesome name="edit" size={18} />,
							action: () =>
								router.navigate(
									`/(actions)/edit?resourceName=${currentResource.name}&id=${currentResource.id}` as Href,
								),
						},
						{
							label: 'Adicionar Representante',
							icon: <Ionicons name="person-add-outline" color={isDarkMode ? colors.white : colors.black} size={18} />,
							action: () => router.navigate('/(aux)/actors/employees/add-organization-manager' as Href),
						},
					]}
				/>
			),
		})
	}, [])

	return (
		<View style={{ flex: 1 }}>
			{false ? (
				<ScrollView
					className="py-4"
					contentContainerStyle={{
						gap: 10,
						flexGrow: 1,
						paddingBottom: 100,
					}}
					showsVerticalScrollIndicator={false}
				>
					<View className="space-y-2">
						{/* Current stock */}
						<CurrentStock label="Estoque Disponível" currentStock={currentStock} />

						<View className="space-y-2 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
							<View className="flex-row justify-between items-center h-[50px]">
								<View className="flex-row items-center space-x-2">
									<Ionicons name="stats-chart" size={24} color="#4A90E2" className="mr-2" />
									<Text className="text-gray-900 dark:text-gray-100 text-[12px]">Visitas de Monitoria:</Text>
								</View>
								<View className="flex-row items-center border border-gray-200 dark:border-gray-800 rounded-full px-2 bg-gray-200 dark:bg-gray-800">
									<Text className="text-gray-900 dark:text-gray-100 font-semibold text-base">
										{/* {Intl.NumberFormat('pt-BR').format(transactionsDetails.orgTransactions.length)} */}
									</Text>
								</View>
							</View>

							<View className="h-[50px] flex-row justify-between items-center ">
								<View className="flex-row items-center space-x-2">
									<Ionicons name="people" size={24} color={colors.primary} className="mr-2" />
									<Text className="text-gray-900 dark:text-gray-100 text-[12px]">Membros activos:</Text>
								</View>
								<View className="flex-row items-center border border-gray-200 dark:border-gray-800 rounded-full px-2 bg-gray-200 dark:bg-gray-800">
									<Text className="text-gray-900 dark:text-gray-100 font-semibold text-base">
										{/* {Intl.NumberFormat('pt-BR').format(activeMembers.length)} */}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</ScrollView>
			) : (
				<View className="flex-1 justify-center items-center">
					<ActorListEmpty actionType={ActionType.UNKNOWN} />
				</View>
			)}
		</View>
	)
}
