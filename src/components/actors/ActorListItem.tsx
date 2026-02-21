import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Href, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { Feather } from '@expo/vector-icons'

import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { colors } from 'src/constants'
import { cn } from 'src/utils/tailwind'
import { useActionStore } from 'src/store/actions/actions'
import { ResourceName } from 'src/types'
import { selectAdminPostById } from 'src/library/powersync/sql-statements'

type ActorListItemProps = {
	item: {
		id: string
		surname: string
		other_names: string
		multicategory: string
		admin_post_id: string
		primary_phone: string
		secondary_phone: string
	}
	resource_name: ResourceName
}

export default function ActorListItem({ item, resource_name }: ActorListItemProps) {
	const router = useRouter()
	const { setCurrentResource } = useActionStore()
	const [adminPost, setAdminPost] = useState<string | null>(null)

	const phoneNumber =
		item.primary_phone && item.primary_phone !== 'N/A'
			? item.primary_phone
			: item.secondary_phone && item.secondary_phone !== 'N/A'
				? item.secondary_phone
				: 'Não disponível'
	const surname =
		item.surname?.toLowerCase().includes('company') && item.surname?.split(' - ').length > 1
			? item.surname?.split(' - ')[0]
			: item.surname?.toLowerCase().includes('company')
				? `(Empresa)`
				: item.surname
	const categories = [] as string[]
	if (item.multicategory) {
		const multicategoryArray = item.multicategory.split(';')
		multicategoryArray.forEach((cat) => {
			if (cat.toLowerCase().includes('provider')) {
				categories.push('Provedor de Serviços')
			} else if (cat.toLowerCase().includes('farmer_small_scale')) {
				categories.push('Familiar')
			} else if (cat.toLowerCase().includes('farmer_large_scale')) {
				categories.push('Comercial')
			} else if (cat.toLowerCase().includes('trader_primary')) {
				categories.push('Primário')
			} else if (cat.toLowerCase().includes('trader_secondary')) {
				categories.push('Intermediário')
			} else if (cat.toLowerCase().includes('export')) {
				categories.push('Exportador')
			} else if (cat.toLowerCase().includes('trader_small_scale_processing')) {
				categories.push('Artisanal')
			} else if (cat.toLowerCase().includes('trader_large_scale_processing')) {
				categories.push('Industrial')
			}
		})
	}

	const handleNavigation = (id: string) => {
		setCurrentResource({
			id: id,
			name: resource_name,
		})
		router.navigate(`/(aux)/actors/${resource_name.toLowerCase()}` as Href)
	}

	useEffect(() => {
		const fetchAdminPost = async () => {
			selectAdminPostById(item.admin_post_id, (adminPost) => {
				if (adminPost) {
					setAdminPost(adminPost.name)
				}
			})
		}

		fetchAdminPost()
	}, [item.admin_post_id])

	return (
		<TouchableOpacity
			onPress={() => handleNavigation(item.id)}
			activeOpacity={0.7}
			className="relative flex flex-row space-x-2 items-center p-2 border m-2 rounded-md border-slate-50 shadow-sm shadow-black bg-gray-50 dark:border-slate-600 dark:bg-slate-900"
		>
			<Image
				source={{ uri: avatarPlaceholderUri }}
				style={{
					width: 50,
					height: 50,
					borderRadius: 25,
				}}
			/>
			<View className="flex flex-col space-y-0 flex-1 pb-3">
				<View className="flex flex-row space-x-2 flex-wrap items-center">
					<Text style={{}} className="text-black dark:text-white font-bold text-[15px]">
						{item.other_names}
					</Text>
					<Text
						style={{}}
						className={cn('text-black dark:text-white font-bold text-[15px]', {
							'text-[10px]': item.surname?.toLowerCase().includes('company'),
						})}
					>
						{surname}
					</Text>
				</View>
				<View className="flex flex-row space-x-1">
					<Feather name="phone" size={15} color={colors.primary} />
					<Text className="text-black dark:text-white">{phoneNumber}</Text>
				</View>
			</View>
			<View className="absolute right-0 bottom-0 w-full">
				<View className="flex flex-row space-x-1">
					<View className="flex-1">
						<Text className="text-black text-left dark:text-white text-[10px]">{categories.join(' | ')}</Text>
					</View>
					<View>
						<Text className="text-black dark:text-white text-[10px]">{adminPost}</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	)
}
