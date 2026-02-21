// React and React Native imports
import React, { useMemo } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'

// Third-party libraries
import { Feather } from '@expo/vector-icons'
import { Href, Link } from 'expo-router'
import { Image } from 'expo-image'

// Constants
import { colors } from 'src/constants'
import { avatarPlaceholderUri } from 'src/constants/imageURI'

// Hooks
import { useNavigationSearch } from 'src/hooks/useNavigationSearch'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useQueryMany } from 'src/hooks/queries'
import { MultiCategory } from 'src/types'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'

export default function PrimariesTradersScreen() {
	const {
		data: traders,
		isLoading: isTradersLoading,
		error: tradersError,
		isError: isTradersError,
	} = useQueryMany<{
		id: string
		surname: string
		other_names: string
		multicategory: string
		contact_id: string
		admin_post: string
		primary_phone: string
		secondary_phone: string
	}>(
		`SELECT 
			ad.actor_id as id,
			ad.surname,
			ad.other_names,
			GROUP_CONCAT(ac.subcategory, ';') as multicategory,
			cd.id as contact_id,
			COALESCE(ap.name, 'N/A') as admin_post,
			cd.primary_phone,
			cd.secondary_phone
		FROM ${TABLES.ACTOR_DETAILS} ad
		INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'TRADER'
		LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'TRADER'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'TRADER'
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON ap.id = addr.admin_post_id
		WHERE ac.subcategory LIKE '%${MultiCategory.TRADER_PRIMARY}%'
		GROUP BY ad.actor_id, ad.surname, ad.other_names, cd.id, ap.name, cd.primary_phone, cd.secondary_phone`,
	)
	const { search } = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Procurar Comerciantes',
		},
	})
	const filteredTraders = useMemo(() => {
		if (!search) return traders
		return traders.filter(
			(trader) =>
				trader.surname.toLowerCase().includes(search.toLowerCase()) ||
				trader.other_names.toLowerCase().includes(search.toLowerCase()) ||
				String(trader.primary_phone).toLowerCase().includes(search.toLowerCase()) ||
				String(trader.secondary_phone).toLowerCase().includes(search.toLowerCase()),
		)
	}, [search, traders])

	// Extract farmer phone numbers
	// Render each farmer with a photo, name, surname, phone number, and cashew stock
	const renderItem = ({
		item,
	}: {
		item: {
			id: string
			surname: string
			other_names: string
			multicategory: string
			contact_id: string
			admin_post: string
			primary_phone: string
			secondary_phone: string
		}
	}) => {
		const phoneNumber =
			item.primary_phone && item.primary_phone !== 'N/A'
				? item.primary_phone
				: item.secondary_phone && item.secondary_phone !== 'N/A'
					? item.secondary_phone
					: 'N/A'
		return (
			<Link href={`/actors/traders/${item.id}` as Href} asChild>
				<TouchableOpacity
					activeOpacity={0.7}
					className="flex flex-row space-x-2 items-center p-2 border m-2 rounded-md border-slate-50 shadow-sm shadow-black bg-gray-50"
				>
					<Image
						source={{ uri: avatarPlaceholderUri }}
						style={{
							width: 50,
							height: 50,
							borderRadius: 25,
						}}
					/>
					<View className="flex flex-col space-y-2 flex-1">
						<Text className="text-black dark:text-white font-bold text-[16px]">
							{item.other_names} {item.surname}
						</Text>
						<View className="flex flex-row space-x-1">
							<Feather name="phone" size={15} color={colors.primary} />
							<Text> {phoneNumber}</Text>
						</View>
					</View>
				</TouchableOpacity>
			</Link>
		)
	}

	return (
		<View className="flex-1 bg-white dark:bg-black">
			<FlatList
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: 100,
				}}
				data={filteredTraders}
				showsVerticalScrollIndicator={false}
				renderItem={renderItem}
				keyExtractor={(item: { id: string }) => item.id}
				ListEmptyComponent={() => (
					<View className="flex-1 items-center justify-center h-[400px]">
						<EmptyPlaceholder message="Não há comerciantes primários para mostrar" />
					</View>
				)}
			/>
		</View>
	)
}
