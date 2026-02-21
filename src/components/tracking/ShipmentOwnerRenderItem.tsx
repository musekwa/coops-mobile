import { Ionicons } from '@expo/vector-icons'
import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { Feather } from '@expo/vector-icons'
import { Fontisto } from '@expo/vector-icons'
import { TouchableOpacity, View, Text } from 'react-native'
import { colors } from 'src/constants'
import { cn } from 'src/utils/tailwind'
import Label from '../forms/Label'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { getAdminPostById } from 'src/library/sqlite/selects'

type ShipmentOwnerRenderItemProps = {
	item: {
		id: string
		surname: string
		other_names: string
		multicategory: string
		contact_id: string
		admin_post_id: string
		primary_phone: string
		secondary_phone: string
	}
	handlePressListItem: (item: {
		id: string
		surname: string
		other_names: string
		multicategory: string
		contact_id: string
		admin_post_id: string
		primary_phone: string
		secondary_phone: string
	}) => void
	ownerId?: string
}

export default function ShipmentOwnerRenderItem({ item, handlePressListItem, ownerId }: ShipmentOwnerRenderItemProps) {
	const [adminPost, setAdminPost] = useState('')
	const [ownerType, setOwnerType] = useState('')
	const contacts = item.primary_phone
		? item.primary_phone
		: item.secondary_phone
			? item.secondary_phone
			: 'Não disponível'
	const name = `${item.other_names} ${item.surname.toLowerCase().includes('company') ? '(Empresa)' : item.surname}`

	useEffect(() => {
		if (item.admin_post_id) {
			getAdminPostById(item.admin_post_id).then((adminPost) => {
				if (adminPost) {
					setAdminPost(adminPost)
				}
			})
		}
	}, [item.admin_post_id])

	useEffect(() => {
		setOwnerType(getOwnerType(item.multicategory))
	}, [item.multicategory])

	const getOwnerType = (multicategory: string) => {
		if (
			multicategory.includes('TRADER_EXPORT') ||
			multicategory.includes('TRADER_LARGE_SCALE_PROCESSING') ||
			multicategory.includes('TRADER_SMALL_SCALE_PROCESSING')
		) {
			return 'Comerciante Final'
		} else if (multicategory.includes('TRADER_SECONDARY')) {
			return 'Comerciante Intermediário'
		} else if (multicategory.includes('TRADER_PRIMARY')) {
			return 'Comerciante Primário'
		} else if (multicategory.includes('TRADER_LOCAL')) {
			return 'Comerciante Local'
		} else if (multicategory.includes('FARMER_LARGE_SCALE') || multicategory.includes('FARMER_SMALL_SCALE')) {
			return 'Produtor Comercial'
		} else if (multicategory.includes('FARMER_SMALL_SCALE')) {
			return 'Produtor Familiar'
		} else if (multicategory.includes('ASSOCIATION')) {
			return 'Associação'
		} else if (multicategory.includes('COOPERATIVE')) {
			return 'Cooperativa'
		} else if (multicategory.includes('COOP_UNION')) {
			return 'União de Cooperativas'
		} else {
			return 'Outro'
		}
	}

	return (
		<TouchableOpacity
			onPress={() => handlePressListItem(item)}
			className={cn(
				'flex flex-row items-center my-2 space-x-2 rounded-md w-full',
				item.id === ownerId && 'bg-gray-50 dark:bg-slate-900 dark:border-slate-900',
			)}
		>
			<View className="w-[50px] h-[50px]">
				<Image source={{ uri: avatarPlaceholderUri }} style={{ width: 50, height: 50, borderRadius: 100 }} />
			</View>
			<View className="flex-1">
				<Label label={`${name} (${ownerType})`} />
				<View className="flex flex-row space-x-2 items-center">
					<Ionicons name="location-outline" size={12} color={colors.gray600} />
					<Text className="text-[12px] text-gray-500">{adminPost}</Text>
				</View>
				<View className="flex flex-row space-x-2 items-center">
					<Feather name="phone" size={12} color={colors.gray600} />
					<Text className="text-[12px] text-gray-500">{contacts}</Text>
				</View>
			</View>
			<View className="p-1 flex items-center justify-center">
				{item.id === ownerId ? (
					<Fontisto name="radio-btn-active" size={18} color={colors.primary} />
				) : (
					<Fontisto name="radio-btn-passive" size={18} color={colors.gray600} />
				)}
			</View>
		</TouchableOpacity>
	)
}
