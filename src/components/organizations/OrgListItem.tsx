import { View, Text } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { noImageUri } from 'src/constants/imageURI'
import { OrganizationTypes } from 'src/types'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { StyleSheet } from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useActionStore } from 'src/store/actions/actions'
import { ResourceName } from 'src/types'
import { useQueryOne } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { translateWarehouseTypeToPortuguese } from 'src/helpers/helpersToTrades'

type OrgListItemProps = {
	item: {
		id: string
		group_name: string
		organization_type: string
		admin_post: string
	}
}

export default function OrgListItem({ item }: OrgListItemProps) {
	const router = useRouter()
	const { setCurrentResource } = useActionStore()

	const { data: membersCount } = useQueryOne<{ count: number }>(
		`SELECT COUNT(*) as count FROM ${TABLES.GROUP_MEMBERS} WHERE group_id = ?`,
		[item.id],
	)

	const handleNavigation = (item: {
		id: string
		group_name: string
		organization_type: string
		admin_post: string
	}) => {
		setCurrentResource({
			name: ResourceName.GROUP,
			id: item.id,
		})
		router.navigate('/(aux)/actors/organization')
	}

	const registeredCount = membersCount?.count || 0

	// Get organization type label
	const orgTypeLabel = translateWarehouseTypeToPortuguese(item.organization_type as OrganizationTypes)

	return (
		<TouchableOpacity
			onPress={() => handleNavigation(item)}
			activeOpacity={0.8}
			className="mx-3 my-1.5"
			style={styles.cardContainer}
		>
			<View className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
				{/* Header Row */}
				<View className="flex-row items-center justify-between mb-2">
					<View className="flex-row items-center flex-1">
						<Image source={{ uri: noImageUri }} style={styles.image} contentFit="cover" />
						<View className="flex-1 ml-2.5">
							<Text
								numberOfLines={1}
								ellipsizeMode="tail"
								className="text-gray-900 dark:text-white font-bold text-sm mb-0.5"
							>
								{item.group_name}
							</Text>
							<View className="flex-row items-center">
								<View className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
									<Text className="text-gray-700 dark:text-blue-300 text-[10px] font-medium">{orgTypeLabel}</Text>
								</View>
							</View>
						</View>
					</View>
					<Entypo name="chevron-right" color={colors.primary} size={20} />
				</View>

				{/* Members Section */}
				<View className="mb-2">
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center">
							<Ionicons name="people-outline" size={14} color={colors.primary} />
							<Text className="ml-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Membros</Text>
						</View>
						<Text className="text-xs font-bold text-gray-900 dark:text-white">{registeredCount}</Text>
					</View>
				</View>

				{/* Stats Row */}
				<View className="flex-row justify-between items-center pt-1.5 border-t border-gray-100 dark:border-gray-700">
					<View className="flex-row items-center">
						<AntDesign name="check-circle" size={12} color="#10b981" />
						<Text className="ml-1 text-[10px] text-gray-600 dark:text-gray-400">
							<Text className="font-semibold text-gray-900 dark:text-white">{registeredCount}</Text> registados
						</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	cardContainer: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	image: {
		width: 50,
		height: 50,
		borderRadius: 10,
		borderWidth: 1.5,
		borderColor: '#e5e7eb',
	},
})
