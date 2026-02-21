import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Drawer } from 'expo-router/drawer'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import { Image } from 'expo-image'
import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { Feather, Ionicons } from '@expo/vector-icons'
import { useNavigation, useRouter } from 'expo-router'
import UploadPhoto from 'src/components/images/UploadPhoto'
import { DrawerActions } from '@react-navigation/native'
import { useDrawerStatus } from '@react-navigation/drawer'
import { commercializationCampainsdateRange } from 'src/helpers/dates'
import { useActionStore } from 'src/store/actions/actions'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'
import { GroupManagerPosition, OrganizationTypes } from 'src/types'
import { cn } from 'src/utils/tailwind'
import ActorContactInfo from 'src/components/actors/ActorContactInfo'
import { useQueryMany, useQueryOneAndWatchChanges } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function CustomDrawerContent(props: any) {
	const { setDrawerStatus, getCurrentResource } = useActionStore()
	const currentResource = getCurrentResource()
	const drawerStatus = useDrawerStatus()
	const isDrawerOpen = drawerStatus === 'open' ? 'open' : 'closed'
	const router = useRouter()
	const navigation = useNavigation()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [showImageHandleModal, setShowImageHandleModal] = useState(false)
	const [focalPointContactId, setFocalPointContactId] = useState<string>('')
	const insets = useSafeAreaInsets()

	const {
		data: groupManagers,
		isLoading: isGroupManagersLoading,
		error: groupManagersError,
		isError: isGroupManagersError,
	} = useQueryMany<{
		id: string
		position: string
		surname: string
		other_names: string
		contact_id: string
	}>(
		`
		SELECT 
			gma.group_manager_id as id,
			gma.position,
			ad.surname,
			ad.other_names,
			COALESCE(cd.id, '') as contact_id
		FROM ${TABLES.GROUP_MANAGER_ASSIGNMENTS} gma
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = gma.group_manager_id
		LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = gma.group_manager_id AND cd.owner_type = 'GROUP_MANAGER'
		WHERE gma.group_id = '${currentResource.id}'
			AND gma.is_active = 'true'
	`,
	)

	const {
		data: group,
		isLoading: isGroupLoading,
		error: groupError,
		isError: isGroupError,
	} = useQueryOneAndWatchChanges<{
		id: string
		name: string
		organization_type: string
		address_id: string
		photo: string
	}>(
		`SELECT 
			a.id, 
			ad.other_names as name, 
			ac.subcategory as organization_type, 
			addr.id as address_id, 
			ad.photo 
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
		WHERE a.id = ? AND a.category = 'GROUP'`,
		[currentResource.id],
	)
	useEffect(() => {
		if (groupManagers && groupManagers.length > 0) {
			// if there is a PROMOTER, set the focal point to the contact_id of the PROMOTER
			// otherwise, find the PRESIDENT, else find the VICE_PRESIDENT, else find the SECRETARY
			const focalPointManager = groupManagers.find((manager) => manager.position === GroupManagerPosition.PROMOTER)
			if (focalPointManager?.contact_id) {
				setFocalPointContactId(focalPointManager.contact_id)
			} else {
				const president = groupManagers.find((manager) => manager.position === GroupManagerPosition.PRESIDENT)
				if (president?.contact_id) {
					setFocalPointContactId(president.contact_id)
				} else {
					const vicePresident = groupManagers.find(
						(manager) => manager.position === GroupManagerPosition.VICE_PRESIDENT,
					)
					if (vicePresident?.contact_id) {
						setFocalPointContactId(vicePresident.contact_id)
					} else {
						const secretary = groupManagers.find((manager) => manager.position === GroupManagerPosition.SECRETARY)
						if (secretary?.contact_id) {
							setFocalPointContactId(secretary.contact_id)
						} else {
							// If no manager with a contact_id is found, try to get the first manager with any contact_id
							const firstManagerWithContact = groupManagers.find((manager) => manager.contact_id)
							if (firstManagerWithContact?.contact_id) {
								setFocalPointContactId(firstManagerWithContact.contact_id)
							} else {
								// Reset to empty string if no contact found
								setFocalPointContactId('')
							}
						}
					}
				}
			}
		} else {
			// Reset to empty string if no group managers
			setFocalPointContactId('')
		}
	}, [groupManagers])

	useEffect(() => {
		if (isDrawerOpen === 'closed') {
			setDrawerStatus('closed')
		} else {
			setDrawerStatus('open')
		}
	}, [isDrawerOpen])

	// Force drawer content to update when current resource changes
	useEffect(() => {
		// Close and reopen drawer to force refresh
		if (isDrawerOpen === 'open') {
			navigation.dispatch(DrawerActions.closeDrawer())
			setTimeout(() => {
				navigation.dispatch(DrawerActions.openDrawer())
			}, 100)
		}
	}, [currentResource.id])

	const organizationType =
		group?.organization_type === OrganizationTypes.COOPERATIVE
			? 'Cooperativa'
			: group?.organization_type === OrganizationTypes.ASSOCIATION
				? 'Associação'
				: 'União de Cooperativas'

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
							source={{ uri: group?.photo ? group.photo : avatarPlaceholderUri }}
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
						<View>
							<Text className="text-center text-black dark:text-white font-bold text-[16px]">{group?.name}</Text>
							<Text className="text-center text-black dark:text-white text-[12px]">{organizationType}</Text>
						</View>

						{group && <ActorContactInfo contact_id={focalPointContactId} address_id={group?.address_id} />}
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
							onPress={() => router.navigate('/(tabs)/actors/groups')}
							className="flex flex-row space-x-2 items-center "
						>
							<Ionicons name="log-out-outline" size={20} color={colors.red} />
							<Text className="text-[12px] text-red-500">Sair</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
			{group && (
				<UploadPhoto
					showImageHandleModal={showImageHandleModal}
					setShowImageHandleModal={setShowImageHandleModal}
					currentResource={getCurrentResource()}
					title={`Foto de ${group.organization_type === OrganizationTypes.COOPERATIVE ? 'Cooperativa' : group.organization_type === OrganizationTypes.ASSOCIATION ? 'Associação' : 'União de Cooperativas'}`}
				/>
			)}
		</View>
	)
}

export default function OrganizationLayout() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const navigation = useNavigation()
	const { getDrawerStatus } = useActionStore()
	const toggleDrawer = () => {
		const drawerNavigation = navigation.getParent('Drawer') || navigation
		drawerNavigation.dispatch(DrawerActions.toggleDrawer())
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
					drawerActiveBackgroundColor: isDarkMode ? colors.white : colors.gray100,
					drawerInactiveTintColor: isDarkMode ? colors.white : colors.black,
					drawerLabelStyle: {
						// fontWeight: 'bold',
						fontSize: 14,
						marginLeft: -20,
					},
					headerStyle: {
						backgroundColor: isDarkMode ? colors.black : colors.white,
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
						drawerLabel: 'Actividades',
						headerTitle: () => (
							<View>
								<Text className="text-[14px] font-bold text-center text-black dark:text-white">
									{commercializationCampainsdateRange}
								</Text>
								<Text className="text-[12px] text-gray-500 text-center">Actidades</Text>
							</View>
						),
						headerTitleAlign: 'center',
						headerStyle: {
							backgroundColor: isDarkMode ? colors.black : colors.white,
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
					name="members-list"
					options={{
						drawerLabel: 'Membros',
						headerTitle: () => (
							<View>
								<Text className="text-[14px] font-bold text-center text-black dark:text-white">Membros</Text>
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
									name="people-outline"
									size={20}
									color={focused ? '#008000' : isDarkMode ? colors.white : colors.black}
								/>
							</View>
						),
					}}
				/>
			</Drawer>
			{getDrawerStatus() === 'closed' && <SingleFloatingButton icon="arrow-right" />}
		</>
	)
}
