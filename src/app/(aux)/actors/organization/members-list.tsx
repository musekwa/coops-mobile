// React and React Native imports
import React, { useEffect, useMemo } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { useColorScheme } from 'nativewind'
import { Image } from 'expo-image'
import { useRouter, useNavigation, Href } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

// Components
import CustomPopUpMenu from 'src/components/menus/CustomPopUpMenu'

// Constants and Types
import { colors } from 'src/constants'
import { useActionStore } from 'src/store/actions/actions'
import { useQueryManyAndWatchChanges } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import AnimationTopTab from 'src/components/tabs/AnimationTopTab'
import SectionList from 'src/components/tabs/SectionList'
import { CustomShimmerPlaceholderItem } from 'src/components/placeholder/CustomShimmerPlaceholder'
import CustomShimmerPlaceholder from 'src/components/placeholder/CustomShimmerPlaceholder'
import { avatarPlaceholderUri } from 'src/constants/imageURI'
import Label from 'src/components/forms/Label'
import { ResourceName } from 'src/types'
import { deleteOne } from 'src/library/powersync/sql-statements'
import { Feather } from '@expo/vector-icons'

const IndividualItem = ({
	id,
	title,
	photo,
	phone_number,
	groupMemberId,
	groupId,
	onRemove,
}: {
	id: string
	title: string
	photo: string
	phone_number: string
	groupMemberId: string
	groupId: string
	onRemove: () => void
}) => {
	const { setCurrentResource } = useActionStore()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const router = useRouter()
	const photoUrl = photo && photo !== 'N/A' ? photo : avatarPlaceholderUri

	const handleRemove = async () => {
		try {
			await deleteOne(`DELETE FROM ${TABLES.GROUP_MEMBERS} WHERE id = ?`, [groupMemberId])
			onRemove()
		} catch (error) {
			console.error('Error removing member:', error)
		}
	}

	return (
		<TouchableOpacity
			onPress={() => {
				setCurrentResource({
					id: id,
					name: ResourceName.FARMER,
				})
				router.replace('/(aux)/custom-redirect' as Href)
			}}
			activeOpacity={0.7}
			className="flex-row items-center justify-between w-full py-3 px-3 mb-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800"
			style={{ minHeight: 70 }}
		>
			<View className="flex-row items-center flex-1 mr-2">
				<Image source={{ uri: photoUrl }} style={{ width: 50, height: 50, borderRadius: 25 }} contentFit="cover" />
				<View className="flex-1 ml-3">
					<Label label={title} />
					<Text className="text-[12px] text-gray-500 mt-1">{phone_number}</Text>
				</View>
			</View>
			<View onStartShouldSetResponder={() => true} onTouchEnd={(e: any) => e.stopPropagation()}>
				<CustomPopUpMenu
					options={[
						{
							label: 'Remover',
							icon: <Feather name="trash-2" size={18} color={colors.gray800} />,
							action: handleRemove,
						},
					]}
					icon={<Ionicons name="ellipsis-vertical" size={20} color={isDarkMode ? colors.white : colors.black} />}
				/>
			</View>
		</TouchableOpacity>
	)
}

const GroupItem = ({
	id,
	title,
	photo,
	number_of_members,
	groupMemberId,
	groupId,
	onRemove,
}: {
	id: string
	title: string
	photo: string
	number_of_members: number
	groupMemberId: string
	groupId: string
	onRemove: () => void
}) => {
	const router = useRouter()
	const { setCurrentResource } = useActionStore()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const photoUrl = photo && photo !== 'N/A' ? photo : avatarPlaceholderUri

	const handleRemove = async () => {
		try {
			await deleteOne(`DELETE FROM ${TABLES.GROUP_MEMBERS} WHERE id = ?`, [groupMemberId])
			onRemove()
		} catch (error) {
			console.error('Error removing member:', error)
		}
	}

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={() => {
				setCurrentResource({
					id: id,
					name: ResourceName.GROUP,
				})
				router.push('/(aux)/custom-redirect' as Href)
			}}
			className="flex-row items-center justify-between w-full py-3 px-3 mb-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800"
			style={{ minHeight: 70 }}
		>
			<View className="flex-row items-center flex-1 mr-2">
				<Image source={{ uri: photoUrl }} style={{ width: 50, height: 50, borderRadius: 25 }} contentFit="cover" />
				<View className="flex-1 ml-3">
					<Label label={title} />
					<Text className="text-[12px] text-gray-500 mt-1">{number_of_members} membros</Text>
				</View>
			</View>
			<View onStartShouldSetResponder={() => true} onTouchEnd={(e: any) => e.stopPropagation()}>
				<CustomPopUpMenu
					options={[
						{
							label: 'Remover',
							icon: <Feather name="trash-2" size={18} color={colors.gray800} />,
							action: handleRemove,
						},
					]}
					icon={<Ionicons name="ellipsis-vertical" size={20} color={isDarkMode ? colors.white : colors.black} />}
				/>
			</View>
		</TouchableOpacity>
	)
}

export default function MembersListScreen() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const navigation = useNavigation()
	const router = useRouter()

	const { getCurrentResource } = useActionStore()

	const groupId = getCurrentResource().id

	const {
		data: farmersRaw,
		isLoading: isFarmersLoading,
		error: farmersError,
		isError: isFarmersError,
	} = useQueryManyAndWatchChanges<{
		id: string
		surname: string
		other_names: string
		photo: string
		primary_phone: string
		secondary_phone: string
		group_member_id: string
	}>(
		`		SELECT 
			ad.actor_id as id,
			ad.surname,
			ad.other_names,
			ad.photo,
			cd.primary_phone,
			cd.secondary_phone,
			gm.id as group_member_id
		FROM ${TABLES.ACTOR_DETAILS} ad
		INNER JOIN ${TABLES.GROUP_MEMBERS} gm ON ad.actor_id = gm.member_id
		LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'FARMER'
		WHERE gm.group_id = '${groupId}' AND gm.member_type = 'FARMER'`,
	)

	const farmers = useMemo(
		() =>
			farmersRaw?.map((member) => ({
				id: member.id,
				title: `${member.surname} ${member.other_names}`,
				photo: member.photo,
				phone_number:
					member.primary_phone && member.primary_phone !== 'N/A'
						? member.primary_phone
						: member.secondary_phone && member.secondary_phone !== 'N/A'
							? member.secondary_phone
							: 'N/A',
				group_member_id: member.group_member_id,
			})) || [],
		[farmersRaw],
	)

	const {
		data: groupsRaw,
		isLoading: isGroupsLoading,
		error: groupsError,
		isError: isGroupsError,
	} = useQueryManyAndWatchChanges<{
		id: string
		group_name: string
		organization_type: string
		photo: string
		group_member_id: string
	}>(`SELECT 
			a.id, 
			ad.other_names as group_name, 
			ac.subcategory as organization_type, 
			ad.photo, 
			gm.id as group_member_id
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
		INNER JOIN ${TABLES.GROUP_MEMBERS} gm ON a.id = gm.member_id
		WHERE gm.group_id = '${groupId}' AND gm.member_type = 'GROUP' AND a.category = 'GROUP'`)

	const groups = useMemo(
		() =>
			groupsRaw?.map((member) => ({
				id: member.id,
				title: member.group_name,
				photo: member.photo,
				group_member_id: member.group_member_id,
			})) || [],
		[groupsRaw],
	)

	const horizontalData = [
		{
			title: `Singulares (${farmers.length})`,
			iconName: 'person',
		},
		{
			title: `Agrupados (${groups.length})`,
			iconName: 'people',
		},
	]

	const verticalData = [
		{
			id: 1,
			title: 'Singulares',
			component: (
				<SectionList
					data={farmers}
					renderItem={(item) => {
						const memberItem = item as typeof item & { group_member_id: string; photo?: string }
						return (
							<IndividualItem
								id={memberItem.id}
								title={memberItem.title}
								photo={memberItem.photo ?? ''}
								phone_number={memberItem.phone_number ?? ''}
								groupMemberId={memberItem.group_member_id}
								groupId={groupId}
								onRemove={() => {
									// The query will automatically update via useQueryManyAndWatchChanges
								}}
							/>
						)
					}}
				/>
			),
		},
		{
			id: 2,
			title: 'Agrupados',
			component: (
				<SectionList
					data={groups}
					renderItem={(item) => {
						const memberItem = item as typeof item & { group_member_id: string; photo?: string }
						return (
							<GroupItem
								id={memberItem.id}
								title={memberItem.title}
								photo={memberItem.photo ?? ''}
								number_of_members={memberItem.number_of_members ?? 0}
								groupMemberId={memberItem.group_member_id}
								groupId={groupId}
								onRemove={() => {
									// The query will automatically update via useQueryManyAndWatchChanges
								}}
							/>
						)
					}}
				/>
			),
		},
	]

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<CustomPopUpMenu
					options={[
						{
							label: 'Adicionar Membro',
							icon: <Ionicons name="add-circle-outline" color={isDarkMode ? colors.white : colors.black} size={18} />,
							action: () => router.navigate('/(aux)/actors/org-membership/add-member' as Href),
						},
					]}
				/>
			),
		})
	}, [])

	const isLoading = isFarmersLoading || isGroupsLoading

	if (isLoading) {
		return (
			<FlatList
				data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
				numColumns={2}
				keyExtractor={(item: number) => item.toString()}
				renderItem={() => (
					<View className="w-1/2 flex items-center space-y-1">
						<CustomShimmerPlaceholder
							style={{
								width: 80,
								height: 80,
								margin: 20,
								borderRadius: 120,
							}}
						/>
						<CustomShimmerPlaceholderItem
							props={{
								style: {
									width: 100,
									height: 20,
									borderRadius: 10,
								},
							}}
						/>
						<CustomShimmerPlaceholderItem
							props={{
								style: {
									width: 100,
									height: 10,
									borderRadius: 10,
								},
							}}
						/>
					</View>
				)}
			/>
		)
	}

	return <AnimationTopTab horizontalData={horizontalData} verticalData={verticalData} />
}
