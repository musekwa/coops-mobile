import { View, Text, Linking, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { Drawer } from 'expo-router/drawer'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { Feather, Ionicons } from '@expo/vector-icons'
import { useNavigation, useRouter, useSegments } from 'expo-router'
import { Image } from 'expo-image'
import { DrawerActions } from '@react-navigation/native'
import { useActionStore } from 'src/store/actions/actions'
import { match } from 'ts-pattern'
import { UserRoles } from 'src/types'
import { cn } from 'src/utils/tailwind'
import { useUserDetails } from 'src/hooks/queries'
import { useAuthStore } from 'src/store/auth/auth'
import useUserDistrict from 'src/hooks/useUserDistrict'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function CustomDrawerContent(props: any) {
	const { signOut, isSigningOut } = useAuthStore()
	const router = useRouter()
	const segments = useSegments()

	const { userDetails } = useUserDetails()
	const { districtName } = useUserDistrict()

	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const insets = useSafeAreaInsets()

	const userRole = match(userDetails?.user_role)
		.with(UserRoles.COOP_ADMIN, () => 'Gestor de Cooperativa')
		.with(UserRoles.FIELD_AGENT, () => 'Extensionista')
		.with(UserRoles.INSPECTOR, () => 'Fiscal')
		.with(UserRoles.SUPERVISOR, () => 'Supervisor')
		.otherwise(() => 'Usuário')

	const performLogOut = async () => {
		await signOut()
		// The auth store will handle the sign-out process
		// and the root layout will redirect to login
	}

	// Get drawer items from descriptors (expo-router drawer structure)
	const descriptors = props.descriptors || {}
	const state = props.state
	const activeRouteName = state?.routes[state?.index]?.name
	const drawerRoutes = state?.routes || []

	return (
		<View style={{ flex: 1, backgroundColor: isDarkMode ? colors.lightblack : colors.white }}>
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
			>
				<View className="py-12 px-2">
					<View className="flex items-center relative">
						<Image
							source={{ uri: avatarPlaceholderUri }}
							style={{
								width: 100,
								height: 100,
								borderRadius: 75,
								alignSelf: 'center',
								marginTop: 10,
							}}
						/>
					</View>
					<View className="pt-3">
						<View>
							<Text className="text-center text-black dark:text-white font-bold text-[15px]">
								{userDetails?.full_name}
							</Text>
							<Text className="text-gray-600 dark:text-gray-400 text-[10px] text-center">({userRole})</Text>
						</View>

						<View className="flex flex-row justify-between">
							<View className="py-3 flex flex-row space-x-1 items-center">
								<TouchableOpacity
									className="flex flex-row space-x-2 items-center"
									onPress={() => Linking.openURL(`tel:${userDetails?.phone}`)}
								>
									<Feather name="phone-call" size={15} color={colors.primary} />
									<Text className="text-[12px] text-gray-600 dark:text-white">{userDetails?.phone}</Text>
								</TouchableOpacity>
							</View>
							<View className="py-3 flex flex-row space-x-1 items-center">
								<Ionicons name="location-outline" size={15} color={colors.primary} />
								<Text className="text-[12px] text-gray-506 dark:text-white">{districtName}</Text>
							</View>
						</View>
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
							onPress={async () => {
								performLogOut()
							}}
							disabled={isSigningOut}
							className="flex flex-row space-x-2 items-center "
						>
							<Ionicons name="log-out-outline" size={20} color={colors.red} />
							<Text className="text-[12px] text-red-500">
								{isSigningOut ? 'A terminar sessão...' : 'Terminar Sessão'}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</View>
	)
}

export default function UserLayout() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const { userDetails } = useUserDetails()

	const navigation = useNavigation()
	const { getDrawerStatus } = useActionStore()

	const toggleDrawer = () => {
		const drawerNavigation = navigation.getParent('Drawer') || navigation
		drawerNavigation.dispatch(DrawerActions.toggleDrawer())
	}

	const userRole = match(userDetails?.user_role)
		.with(UserRoles.COOP_ADMIN, () => 'Gestor de Cooperativa')
		.with(UserRoles.FIELD_AGENT, () => 'Extensionista')
		.with(UserRoles.INSPECTOR, () => 'Fiscal')
		.with(UserRoles.SUPERVISOR, () => 'Supervisor')
		.otherwise(() => 'Usuário')

	if (userDetails?.user_role === UserRoles.SUPERVISOR) {
		return (
			<>
				<Drawer
					drawerContent={CustomDrawerContent}
					screenOptions={{
						drawerType: 'front',
						drawerPosition: 'left',
						drawerHideStatusBarOnOpen: false,
						drawerActiveTintColor: '#008000',
						drawerActiveBackgroundColor: '#f0f0f0',
						drawerInactiveTintColor: isDarkMode ? colors.white : colors.black,
						drawerLabelStyle: {
							fontWeight: 'normal',
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
						name="index"
						options={{
							drawerLabel: 'Perfil',
							headerTitle: () => null,
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
							drawerIcon: ({ focused }: { focused: boolean }) => {
								const color = focused ? '#008000' : isDarkMode ? colors.white : colors.black
								return <Ionicons name="person-circle-outline" size={24} color={color} />
							},
						}}
					/>

					<Drawer.Screen
						name="user-settings"
						options={{
							drawerLabel: 'Configurações',
							headerTitle: () => (
								<View>
									<Text className="text-[14px] font-bold text-center text-black dark:text-white">
										{userDetails?.full_name}
									</Text>
									<Text className="text-[12px] text-gray-500 text-center">{userRole}</Text>
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
							drawerIcon: ({ focused }: { focused: boolean }) => {
								const color = focused ? '#008000' : isDarkMode ? colors.white : colors.black
								return <Ionicons name="settings-outline" size={22} color={color} />
							},
						}}
					/>
					<Drawer.Screen
						name="district-management"
						options={{
							drawerLabel: 'Gestão do Distrito',
							drawerIcon: ({ focused }: { focused: boolean }) => {
								const color = focused ? '#008000' : isDarkMode ? colors.white : colors.black
								return <Ionicons name="location-outline" size={24} color={color} />
							},
							headerTitle: () => (
								<View>
									<Text className="text-[14px] font-bold text-center text-black dark:text-white">
										Gestão do Distrito
									</Text>
								</View>
							),
							headerTitleAlign: 'center',
						}}
					/>
				</Drawer>
			</>
		)
	}
	return (
		<>
			<Drawer
				drawerContent={CustomDrawerContent}
				screenOptions={{
					drawerType: 'front',
					drawerPosition: 'left',
					drawerHideStatusBarOnOpen: false,
					drawerActiveTintColor: '#008000',
					drawerActiveBackgroundColor: '#f0f0f0',
					drawerInactiveTintColor: isDarkMode ? colors.white : colors.black,
					drawerLabelStyle: {
						fontWeight: 'normal',
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
					name="index"
					options={{
						drawerLabel: 'Perfil',
						headerTitle: () => null,
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
						drawerIcon: ({ focused }: { focused: boolean }) => {
							const color = focused ? '#008000' : isDarkMode ? colors.white : colors.black
							return <Ionicons name="person-circle-outline" size={24} color={color} />
						},
					}}
				/>
				<Drawer.Screen
					name="user-settings"
					options={{
						drawerLabel: 'Configurações',
						headerTitle: () => (
							<View>
								<Text className="text-[14px] font-bold text-center text-black dark:text-white">
									{userDetails?.full_name}
								</Text>
								<Text className="text-[12px] text-gray-500 text-center">{userRole}</Text>
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
						drawerIcon: ({ focused }: { focused: boolean }) => {
							const color = focused ? '#008000' : isDarkMode ? colors.white : colors.black
							return <Ionicons name="settings-outline" size={22} color={color} />
						},
					}}
				/>
				<Drawer.Screen
					name="district-management"
					options={{
						drawerLabel: 'Gestão do Distrito',
						drawerIcon: ({ focused }: { focused: boolean }) => {
							const color = focused ? '#008000' : isDarkMode ? colors.white : colors.black
							return <Ionicons name="location-outline" size={24} color={color} />
						},
						headerTitle: () => (
							<View>
								<Text className="text-[14px] font-bold text-center text-black dark:text-white">Gestão do Distrito</Text>
							</View>
						),
						headerTitleAlign: 'center',
					}}
				/>
			</Drawer>
		</>
	)
}
