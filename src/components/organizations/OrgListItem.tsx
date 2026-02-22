import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useColorScheme } from 'nativewind'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import { noImageUri } from 'src/constants/imageURI'
import { colors } from 'src/constants'
import { OrganizationTypes, ResourceName } from 'src/types'
import { useActionStore } from 'src/store/actions/actions'
import { useQueryOne } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { translateWarehouseTypeToPortuguese } from 'src/helpers/helpersToTrades'
import type { OrganizationItem } from 'src/hooks/useOrganizationList'

type OrgListItemProps = {
	item: OrganizationItem
}

function OrgListItem({ item }: OrgListItemProps) {
	const router = useRouter()
	const { setCurrentResource } = useActionStore()
	const { colorScheme } = useColorScheme()
	const isDarkMode = colorScheme === 'dark'

	const { data: membersCount } = useQueryOne<{ count: number }>(
		`SELECT COUNT(*) as count FROM ${TABLES.GROUP_MEMBERS} WHERE group_id = ?`,
		[item.id],
	)

	const handlePress = useCallback(() => {
		setCurrentResource({ name: ResourceName.GROUP, id: item.id })
		router.navigate('/(aux)/actors/organization')
	}, [item.id, router, setCurrentResource])

	const membersCountDisplay = membersCount?.count ?? 0
	const orgTypeLabel = translateWarehouseTypeToPortuguese(item.organization_type as OrganizationTypes)

	return (
		<TouchableOpacity
			onPress={handlePress}
			activeOpacity={0.8}
			className="mx-3 my-1.5"
			style={styles.cardContainer}
			hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
			accessibilityLabel={`${item.group_name}, ${orgTypeLabel}, ${membersCountDisplay} membros`}
			accessibilityRole="button"
		>
			<View className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
				{/* Header Row */}
				<View className="flex-row items-center justify-between mb-2">
					<View className="flex-row items-center flex-1 min-w-0">
						<Image
							source={{ uri: noImageUri }}
							style={[styles.image, { borderColor: isDarkMode ? colors.gray600 : '#e5e7eb' }]}
							contentFit="cover"
						/>
						<View className="flex-1 ml-2.5 min-w-0">
							<Text
								numberOfLines={1}
								ellipsizeMode="tail"
								className="text-gray-900 dark:text-white font-bold text-sm mb-0.5"
							>
								{item.group_name}
							</Text>
							<View className="flex-row items-center flex-wrap gap-x-1.5 gap-y-0.5">
								<View className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
									<Text className="text-gray-700 dark:text-blue-300 text-[10px] font-medium">{orgTypeLabel}</Text>
								</View>
								{item.admin_post ? (
									<Text
										numberOfLines={1}
										ellipsizeMode="tail"
										className="text-[10px] text-gray-500 dark:text-gray-400"
									>
										{item.admin_post}
									</Text>
								) : null}
							</View>
						</View>
					</View>
					<Entypo name="chevron-right" color={colors.primary} size={20} />
				</View>

				{/* Members */}
				<View className="flex-row items-center pt-1.5 border-t border-gray-100 dark:border-gray-700">
					<Ionicons name="people-outline" size={14} color={colors.primary} />
					<Text className="ml-1.5 text-xs text-gray-600 dark:text-gray-400">
						<Text className="font-semibold text-gray-900 dark:text-white">{membersCountDisplay}</Text>
						{membersCountDisplay === 1 ? ' membro' : ' membros'}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default React.memo(OrgListItem)

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
	},
})
