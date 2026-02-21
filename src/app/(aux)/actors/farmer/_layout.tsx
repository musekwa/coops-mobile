import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Drawer } from 'expo-router/drawer'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import { Image } from 'expo-image'
import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { Feather, Ionicons } from '@expo/vector-icons'
import { useNavigation, useRouter } from 'expo-router'
import UploadPhoto from 'src/components/images/UploadPhoto'
import { useDrawerStatus } from '@react-navigation/drawer'
import { commercializationCampainsdateRange } from 'src/helpers/dates'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'
import { useActionStore } from 'src/store/actions/actions'
import { cn } from 'src/utils/tailwind'
import ActorContactInfo from 'src/components/actors/ActorContactInfo'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useQueryOne, useQueryOneAndWatchChanges } from 'src/hooks/queries'
import { StatusBar } from 'expo-status-bar'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function CustomDrawerContent(props: any) {
	const { setDrawerStatus, getCurrentResource } = useActionStore()
	const drawerStatus = useDrawerStatus()
	const isDrawerOpen = drawerStatus === 'open' ? 'open' : 'closed'
	const router = useRouter()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [showImageHandleModal, setShowImageHandleModal] = useState(false)
	const insets = useSafeAreaInsets()

	const {
		data: farmer,
		isLoading: isFarmerLoading,
		error: farmerError,
		isError: isFarmerError,
	} = useQueryOneAndWatchChanges<{
		id: string
		photo: string
		surname: string
		other_names: string
		contact_id: string | null
		address_id: string | null
	}>(
		`SELECT 
			ad.actor_id as id, 
			ad.photo, 
			ad.surname, 
			ad.other_names,
			cd.id as contact_id,
			addr.id as address_id
		FROM ${TABLES.ACTOR_DETAILS} ad
		LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'FARMER'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'FARMER'
		WHERE ad.actor_id = ?`,
		[getCurrentResource().id],
	)

	useEffect(() => {
		if (isDrawerOpen === 'closed') {
			setDrawerStatus('closed')
		} else {
			setDrawerStatus('open')
		}
	}, [isDrawerOpen])

	// console.log('farmer', JSON.stringify(farmer, null, 2))

	const descriptors = props.descriptors || {}
	const state = props.state
	const activeRouteName = state?.routes[state?.index]?.name
	const drawerRoutes = state?.routes || []

	return (
		<View style={{ flex: 1, backgroundColor: isDarkMode ? '#333333' : '#ffffff' }}>
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
			>
				<View className="py-12 px-2">
					<View className="flex items-center relative">
						<Image
							source={{ uri: farmer?.photo ? farmer?.photo : avatarPlaceholderUri }}
							style={{
								width: 120,
								height: 120,
								borderRadius: 75,
								alignSelf: 'center',
								marginTop: 10,
							}}
						/>
						<TouchableOpacity
							activeOpacity={0.8}
							onPress={() => setShowImageHandleModal(true)}
							className="absolute flex justify-center items-center bg-gray-50  w-8 h-8 border border-slate-300 rounded-full  bottom-0 right-1/3"
						>
							<Feather name="camera" size={20} color={colors.primary} />
						</TouchableOpacity>
					</View>
					<View className="pt-3">
						{farmer?.surname?.toLowerCase().includes('company') ? (
							<View>
								<Text className="text-center text-black dark:text-white font-bold text-[16px]">
									{farmer?.other_names}
								</Text>
								<Text className="text-center text-black dark:text-white text-[12px]">(empresa)</Text>
							</View>
						) : (
							<View>
								<Text className="text-center text-black dark:text-white font-bold text-[15px]">
									{farmer?.other_names} {farmer?.surname}
								</Text>
							</View>
						)}

						{farmer && <ActorContactInfo contact_id={farmer.contact_id ?? ''} address_id={farmer.address_id ?? ''} />}
					</View>
				</View>
				<View className="bg-white dark:bg-[#333333] rounded-mdshadow-sm shadow-black">
					{drawerRoutes.map((route: any) => {
						const descriptor = descriptors[route.key]
						const options = descriptor?.options || {}
						const isFocused = activeRouteName === route.name
						const drawerLabel = options.drawerLabel || route.name
						const drawerIcon = options.drawerIcon

						return (
							<TouchableOpacity
								key={route.key}
								onPress={() => {
									props.navigation?.navigate(route.name)
									props.navigation?.closeDrawer()
								}}
								className={cn('flex flex-row items-center px-4 py-3 rounded-md', {
									'bg-[#f0f0f0]': isFocused && !isDarkMode,
									'bg-[#333333]': isFocused && isDarkMode,
								})}
							>
								{drawerIcon && (
									<View className="mr-3">
										{typeof drawerIcon === 'function' ? drawerIcon({ focused: isFocused }) : drawerIcon}
									</View>
								)}
								<Text
									className="text-[14px]"
									style={{
										color: isFocused ? colors.primary : isDarkMode ? colors.white : colors.black,
									}}
								>
									{drawerLabel}
								</Text>
							</TouchableOpacity>
						)
					})}
				</View>
				<View style={{ flex: 1, justifyContent: 'flex-end' }}>
					<View
						className={cn('px-2 py-3 mt-2', {
							'bg-[#333333]': isDarkMode,
							'bg-white': !isDarkMode,
						})}
						style={{ paddingBottom: Math.max(insets.bottom, 8) }}
					>
						<TouchableOpacity
							onPress={() => router.navigate('/(tabs)/actors/farmers')}
							className="flex flex-row space-x-2 items-center "
						>
							<Ionicons name="log-out-outline" size={20} color={colors.red} />
							<Text className="text-[12px] text-red-500">Sair</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
			{farmer && (
				<UploadPhoto
					showImageHandleModal={showImageHandleModal}
					setShowImageHandleModal={setShowImageHandleModal}
					currentResource={getCurrentResource()}
					title={`Foto do Produtor`}
				/>
			)}
		</View>
	)
}

export default function FarmerLayout() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const navigation = useNavigation()
	const { getDrawerStatus, getCurrentResource } = useActionStore()

	// const toggleDrawer = () => {
	// 	const drawerNavigation = navigation.getParent('Drawer') || navigation
	// 	drawerNavigation.dispatch(DrawerActions.toggleDrawer())
	// }

	const {
		data: farmer,
		isLoading,
		error,
		isError,
	} = useQueryOne<{
		other_names: string
		surname: string
	}>(`SELECT other_names, surname FROM ${TABLES.ACTOR_DETAILS} WHERE actor_id = ?`, [getCurrentResource().id])

	return (
		<>
			<Drawer
				initialRouteName="profile"
				drawerContent={CustomDrawerContent}
				screenOptions={{
					drawerType: 'front',
					drawerPosition: 'left',
					drawerHideStatusBarOnOpen: false,
					drawerActiveTintColor: '#008000',
					drawerActiveBackgroundColor: isDarkMode ? colors.white : colors.gray100,
					drawerInactiveTintColor: isDarkMode ? colors.white : colors.black,
					drawerLabelStyle: {
						// fontWeight: 'bold',
						fontSize: 14,
						marginLeft: -20,
					},
					headerStyle: {
						backgroundColor: isDarkMode ? colors.lightblack : colors.white,
						elevation: 0,
						shadowOpacity: 0,
						borderBottomWidth: 0,
					},
					headerTitleStyle: {
						color: isDarkMode ? colors.white : colors.black,
					},
				}}
			>
				<Drawer.Screen
					name="profile"
					options={{
						drawerLabel: 'Actividades',
						headerTitle: () => (
							<View>
								<Text className="text-[16px] font-bold text-center text-black dark:text-white">
									{commercializationCampainsdateRange}
								</Text>
								<Text className="text-[12px] text-gray-500 text-center">Actidades</Text>
							</View>
						),
						headerTitleAlign: 'center',
						headerStyle: {
							backgroundColor: isDarkMode ? colors.lightblack : colors.white,
							elevation: 0,
							shadowOpacity: 0,
							borderBottomWidth: 0,
						},
						headerTitleStyle: {
							color: isDarkMode ? colors.white : colors.black,
						},
						drawerActiveTintColor: '#008000',
						drawerIcon: ({ focused }: { focused: boolean }) => (
							<View
								className={`flex flex-row space-x-2 items-center border rounded-md p-1 bg-gray-50 dark:bg-[#333333] ${
									focused ? 'border-[#008000]' : 'border-gray-400'
								}`}
							>
								<Ionicons
									name="briefcase-outline"
									size={20}
									color={focused ? '#008000' : isDarkMode ? colors.white : colors.black}
								/>
							</View>
						),
					}}
				/>
				<Drawer.Screen
					name="dashboard"
					options={{
						drawerLabel: 'Activos',
						headerTitleAlign: 'center',
						headerTitle: () => (
							<View>
								{farmer && farmer?.surname?.toLowerCase().includes('company') ? (
									<>
										<Text
											ellipsizeMode={'tail'}
											numberOfLines={1}
											className="text-[14px] font-bold text-center text-black dark:text-white"
										>
											{farmer?.other_names}
										</Text>
										<Text className="text-[12px] text-gray-500 text-center">(Empresa)</Text>
									</>
								) : (
									<>
										<Text
											ellipsizeMode={'tail'}
											numberOfLines={1}
											className="text-[14px] font-bold text-center text-black dark:text-white"
										>
											{farmer?.other_names} {farmer?.surname}
										</Text>
									</>
								)}
							</View>
						),
						drawerIcon: ({ focused }: { focused: boolean }) => (
							<View
								className={`flex flex-row space-x-2 items-center border rounded-md p-1 bg-gray-50 dark:bg-[#333333] ${
									focused ? 'border-[#008000]' : 'border-gray-400'
								}`}
							>
								<Ionicons
									name="cash-outline"
									size={20}
									color={focused ? '#008000' : isDarkMode ? colors.white : colors.black}
								/>
							</View>
						),
					}}
				/>
			</Drawer>
			<StatusBar style="auto" />
			{getDrawerStatus() === 'closed' && <SingleFloatingButton icon="arrow-right" />}
		</>
	)
}
