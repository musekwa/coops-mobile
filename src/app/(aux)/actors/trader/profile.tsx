import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, Linking } from 'react-native'
import { Href, useNavigation, useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { colors } from 'src/constants'
import CustomPopUpMenu from 'src/components/menus/CustomPopUpMenu'
import { PopMenuOption } from 'src/types'
import { useAddressById, useContactById, useQueryOneAndWatchChanges } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useActionStore } from 'src/store/actions/actions'
import { Spinner } from 'src/components/loaders'

export default function TraderProfileScreen() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const navigation = useNavigation()
	const router = useRouter()
	const { currentResource } = useActionStore()

	const {
		data: trader,
		isLoading: isTraderLoading,
		error: traderError,
		isError: isTraderError,
	} = useQueryOneAndWatchChanges<{
		id: string
		surname: string
		other_names: string
		identifier: string
		gender: string
		multicategory: string
		address_id: string
		contact_id: string
	}>(
		`SELECT 
			ad.actor_id as id,
			ad.surname,
			ad.other_names,
			COALESCE(n.nuit, 'N/A') as identifier,
			COALESCE(g.name, 'N/A') as gender,
			GROUP_CONCAT(ac.subcategory, ';') as multicategory,
			addr.id as address_id,
			cd.id as contact_id
		FROM ${TABLES.ACTOR_DETAILS} ad
		LEFT JOIN ${TABLES.NUITS} n ON n.actor_id = ad.actor_id
		LEFT JOIN ${TABLES.GENDERS} g ON g.actor_id = ad.actor_id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'TRADER'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'TRADER'
		LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'TRADER'
		WHERE ad.actor_id = $0
		GROUP BY ad.actor_id, ad.surname, ad.other_names, n.nuit, g.name, addr.id, cd.id`,
		[currentResource.id],
	)

	const { provinceName, districtName, adminPostName, villageName, isLoading, error, isError } = useAddressById(
		trader?.address_id || '',
	)
	const {
		primaryPhone,
		secondaryPhone,
		isLoading: isContactLoading,
		error: contactError,
		isError: isContactError,
	} = useContactById(trader?.contact_id || '')

	const phone1 = primaryPhone || ''
	const phone2 = secondaryPhone || ''
	const nuit = trader?.identifier || 'N/A'
	const gender = trader?.gender || 'N/A'
	const multicategory = trader?.multicategory || 'N/A'

	const initials = (trader?.surname?.[0] || 'C').toUpperCase()

	const menuOptions: PopMenuOption[] = [
		{
			label: 'Actualizar Dados',
			icon: <FontAwesome name="edit" size={18} />,
			action: () =>
				router.navigate(`/(actions)/edit?resourceName=${currentResource.name}&id=${currentResource.id}` as Href),
		},
	]

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => <CustomPopUpMenu title="Menu" options={menuOptions} />,
		})
	}, [])

	if (isTraderLoading) {
		return <Spinner />
	}

	return (
			<Animated.ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				showsVerticalScrollIndicator={false}
				entering={FadeIn.duration(300)}
				exiting={FadeOut.duration(300)}
				className="flex-1 bg-white dark:bg-black"
			>
				{/* Hero */}
				<View className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 mx-4 mt-4">
					<View className="flex-row items-center">
						<View className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-800/50 items-center justify-center mr-3">
							<Text className="text-xl font-bold text-green-900 dark:text-green-100">{initials}</Text>
						</View>
						<View className="flex-1">
							<Text className="text-lg font-bold text-green-900 dark:text-green-100" numberOfLines={1}>
								{trader?.surname} {trader?.other_names}
							</Text>
							<Text className="text-xs text-green-700 dark:text-green-300">Comerciante</Text>
						</View>
						{/* <CustomPopUpMenu title="Menu" options={menuOptions} /> */}
					</View>

					{/* Phone Call Button */}
					<View className="flex-row mt-4 justify-end">
						<TouchableOpacity
							onPress={() => (phone1 || phone2 ? Linking.openURL(`tel:${phone1 || phone2}`) : null)}
							className="w-12 h-12 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-xl items-center justify-center"
							activeOpacity={0.85}
						>
							<Ionicons name="call" size={20} color={colors.primary} />
						</TouchableOpacity>
					</View>
				</View>

				{/* Info grid */}
				<View className="mx-4 mt-4">
					<View className="flex-row">
						<View className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mr-2">
							<Text className="text-[11px] text-gray-500 dark:text-gray-400">NUIT</Text>
							<Text className="text-sm font-semibold text-gray-900 dark:text-white mt-1" numberOfLines={1}>
								{nuit}
							</Text>
						</View>
						<View className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 ml-2">
							<Text className="text-[11px] text-gray-500 dark:text-gray-400">Género</Text>
							<Text className="text-sm font-semibold text-gray-900 dark:text-white mt-1" numberOfLines={1}>
								{gender}
							</Text>
						</View>
					</View>
					<View className="flex-row mt-3">
						<View className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mr-2">
							<Text className="text-[11px] text-gray-500 dark:text-gray-400">Categoria</Text>
							<Text className="text-sm font-semibold text-gray-900 dark:text-white mt-1" numberOfLines={1}>
								{multicategory}
							</Text>
						</View>
						<View className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 ml-2">
							<Text className="text-[11px] text-gray-500 dark:text-gray-400">Identificador</Text>
							<Text className="text-sm font-semibold text-gray-900 dark:text-white mt-1" numberOfLines={1}>
								{trader?.identifier || 'N/A'}
							</Text>
						</View>
					</View>
				</View>

				{/* Address */}
				<View className="mx-4 mt-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
					<View className="flex-row items-center mb-3">
						<Ionicons name="location-outline" size={18} color={colors.primary} />
						<Text className="ml-2 text-base font-semibold text-gray-900 dark:text-white">Endereço</Text>
					</View>
					<View className="space-y-2">
						<Text className="text-sm text-gray-700 dark:text-gray-300">
							Província: {provinceName ? provinceName : 'N/A'}
						</Text>
						<Text className="text-sm text-gray-700 dark:text-gray-300">
							Distrito: {districtName ? districtName : 'N/A'}
						</Text>
						<Text className="text-sm text-gray-700 dark:text-gray-300">
							Posto Adm.: {adminPostName ? adminPostName : 'N/A'}
						</Text>
						<Text className="text-sm text-gray-700 dark:text-gray-300">
							Localidade: {villageName ? villageName : 'N/A'}
						</Text>
					</View>
				</View>

				{/* Contacts */}
				<View className="mx-4 mt-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
					<View className="flex-row items-center mb-3">
						<Ionicons name="call-outline" size={18} color={colors.primary} />
						<Text className="ml-2 text-base font-semibold text-gray-900 dark:text-white">Contactos</Text>
					</View>
					<View className="space-y-3">
						<View className="flex-row items-center justify-between">
							<Text className="text-sm text-gray-700 dark:text-gray-300">Telefone 1: {phone1 || 'N/A'}</Text>
							{phone1 ? (
								<TouchableOpacity onPress={() => Linking.openURL(`tel:${phone1}`)}>
									<Ionicons name="call" size={18} color={colors.primary} />
								</TouchableOpacity>
							) : null}
						</View>
						<View className="flex-row items-center justify-between">
							<Text className="text-sm text-gray-700 dark:text-gray-300">Telefone 2: {phone2 || 'N/A'}</Text>
							{phone2 ? (
								<TouchableOpacity onPress={() => Linking.openURL(`tel:${phone2}`)}>
									<Ionicons name="call" size={18} color={colors.primary} />
								</TouchableOpacity>
							) : null}
						</View>
					</View>
				</View>
			</Animated.ScrollView>
	)
}
