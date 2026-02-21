import { v4 as uuidv4 } from 'uuid'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useMemo } from 'react'
import SubmitButton from '../buttons/SubmitButton'
import { useNavigationSearch } from 'src/hooks/useNavigationSearch'
import { useRouter } from 'expo-router'
import AnimationTopTab from '../tabs/AnimationTopTab'
import { useOrganizationStore } from 'src/store/organization'
import { colors } from 'src/constants'
import { Ionicons, Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { useQueryMany, useQueryOne, useUserDetails } from 'src/hooks/queries'
import { GroupMemberRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { addMembersToOrganization } from 'src/library/powersync/sql-statements'
import { buildMember } from 'src/library/powersync/schemas/group_members'
import { useActionStore } from 'src/store/actions/actions'
import { useColorScheme } from 'nativewind'
import { OrganizationTypes } from 'src/types'
import { cn } from 'src/utils/tailwind'
import ActorListEmpty from '../not-found/ActorListEmpty'
import { ActionType } from 'src/types'

// Farmer Card Component
const FarmerCard = ({
	farmer,
	selected,
	onToggle,
}: {
	farmer: {
		id: string
		surname: string
		other_names: string
		primary_phone: string
		secondary_phone: string
		admin_post_name: string
		photo?: string
	}
	selected: boolean
	onToggle: () => void
}) => {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const phoneNumber =
		farmer.primary_phone && farmer.primary_phone !== 'N/A'
			? farmer.primary_phone
			: farmer.secondary_phone && farmer.secondary_phone !== 'N/A'
				? farmer.secondary_phone
				: 'N/A'

	return (
		<TouchableOpacity
			onPress={onToggle}
			activeOpacity={0.7}
			className={cn(
				'flex-row items-center p-3 mb-3 rounded-xl border',
				selected
					? 'bg-gray-100 border-gray-400 shadow-sm dark:bg-gray-800/50 dark:border-gray-500'
					: 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700',
			)}
			style={
				selected
					? {
							shadowColor: '#6b7280',
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.12,
							shadowRadius: 3,
							elevation: 2,
						}
					: undefined
			}
		>
			<View className="relative">
				<Image
					source={{ uri: farmer.photo || avatarPlaceholderUri }}
					contentFit="cover"
					style={{ width: 56, height: 56, borderRadius: 28 }}
				/>
				{selected && (
					<View
						className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 border-white"
						style={{ backgroundColor: '#008000' }}
					>
						<Ionicons name="checkmark" size={12} color={colors.white} />
					</View>
				)}
			</View>
			<View className="flex-1 ml-3">
				<Text
					className={cn(
						'text-base font-semibold',
						selected ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white',
					)}
				>
					{farmer.other_names} {farmer.surname}
				</Text>
				<View className="flex-row items-center mt-1">
					<Feather name="phone" size={14} color={selected ? colors.gray800 : colors.gray600} />
					<Text
						className={cn(
							'text-sm ml-1',
							selected ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400',
						)}
					>
						{phoneNumber}
					</Text>
				</View>
				{farmer.admin_post_name && (
					<Text
						className={cn(
							'text-xs mt-1',
							selected ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500',
						)}
					>
						{farmer.admin_post_name}
					</Text>
				)}
			</View>
			<View className="ml-2">
				{selected ? (
					<View
						className="w-7 h-7 rounded-full items-center justify-center shadow-sm"
						style={{ backgroundColor: '#008000' }}
					>
						<Ionicons name="checkmark-circle" size={24} color={colors.white} />
					</View>
				) : (
					<View className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600" />
				)}
			</View>
		</TouchableOpacity>
	)
}

// Group Card Component
const GroupCard = ({
	group,
	selected,
	onToggle,
}: {
	group: {
		id: string
		group_name: string
		admin_post_name: string
		photo?: string
	}
	selected: boolean
	onToggle: () => void
}) => {
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	return (
		<TouchableOpacity
			onPress={onToggle}
			activeOpacity={0.7}
			className={cn(
				'flex-row items-center p-3 mb-3 rounded-xl border',
				selected
					? 'bg-gray-100 border-gray-400 shadow-sm dark:bg-gray-800/50 dark:border-gray-500'
					: 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700',
			)}
			style={
				selected
					? {
							shadowColor: '#6b7280',
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.12,
							shadowRadius: 3,
							elevation: 2,
						}
					: undefined
			}
		>
			<View className="relative">
				<View
					className={cn(
						'w-14 h-14 rounded-full items-center justify-center',
						selected ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700',
					)}
				>
					<Ionicons name="people" size={28} color={selected ? colors.gray800 : colors.gray600} />
				</View>
				{selected && (
					<View
						className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 border-white"
						style={{ backgroundColor: '#008000' }}
					>
						<Ionicons name="checkmark" size={12} color={colors.white} />
					</View>
				)}
			</View>
			<View className="flex-1 ml-3">
				<Text
					className={cn(
						'text-base font-semibold',
						selected ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white',
					)}
				>
					{group.group_name}
				</Text>
				{group.admin_post_name && (
					<Text
						className={cn(
							'text-xs mt-1',
							selected ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500',
						)}
					>
						{group.admin_post_name}
					</Text>
				)}
			</View>
			<View className="ml-2">
				{selected ? (
					<View
						className="w-7 h-7 rounded-full items-center justify-center shadow-sm"
						style={{ backgroundColor: '#008000' }}
					>
						<Ionicons name="checkmark-circle" size={24} color={colors.white} />
					</View>
				) : (
					<View className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600" />
				)}
			</View>
		</TouchableOpacity>
	)
}

type AddFarmerToOrganizationProps = {}

export default function AddMembersToOrganization({}: AddFarmerToOrganizationProps) {
	const { userDetails } = useUserDetails()
	const { getCurrentResource } = useActionStore()
	const { search } = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Procurar Membros',
		},
	})
	const router = useRouter()
	const {
		addOrRemoveIndividualMember,
		individualMembers,
		addOrRemoveGroupMember,
		groupMembers,
		resetGroupMembers,
		resetIndividualMembers,
	} = useOrganizationStore()
	const currentGroupId = getCurrentResource().id

	// Get current group's district_id and organization_type from address_details and actor_categories
	const { data: currentGroupInfo, isLoading: isAddressLoading } = useQueryOne<{
		district_id: string
		organization_type: string
	}>(
		`SELECT 
			addr.district_id,
			ac.subcategory as organization_type
		FROM ${TABLES.ADDRESS_DETAILS} addr
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = addr.owner_id AND ac.category = 'GROUP'
		WHERE addr.owner_id = ? AND addr.owner_type = 'GROUP'`,
		[currentGroupId],
	)

	const districtId = currentGroupInfo?.district_id
	const organizationType = currentGroupInfo?.organization_type
	const isCoopUnion = organizationType === OrganizationTypes.COOP_UNION

	// Query farmers from the same district who are not members (only for cooperatives and associations, not coop unions)
	const { data: farmersRaw, isLoading: isFarmersLoading } = useQueryMany<{
		id: string
		surname: string
		other_names: string
		primary_phone: string
		secondary_phone: string
		admin_post_name: string
		photo: string
	}>(
		districtId && !isCoopUnion
			? `			SELECT 
				ad.actor_id as id,
				ad.surname,
				ad.other_names,
				ad.photo,
				COALESCE(cd.primary_phone, 'N/A') as primary_phone,
				COALESCE(cd.secondary_phone, 'N/A') as secondary_phone,
				COALESCE(ap.name, 'N/A') as admin_post_name
			FROM ${TABLES.ACTOR_DETAILS} ad
			LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'FARMER'
			LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'FARMER'
			LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON ap.id = addr.admin_post_id
			WHERE ad.surname NOT LIKE '%company%'
			AND addr.district_id = '${districtId}'
			AND NOT EXISTS (
				SELECT 1 FROM ${TABLES.GROUP_MEMBERS} gm 
				WHERE gm.member_id = ad.actor_id 
				AND gm.group_id = '${currentGroupId}'
			)`
			: '',
	)

	const farmers = useMemo(() => {
		if (!farmersRaw) return []
		let filtered = farmersRaw
		if (search) {
			const searchLower = search.toLowerCase()
			filtered = farmersRaw.filter(
				(farmer) =>
					`${farmer.other_names} ${farmer.surname}`.toLowerCase().includes(searchLower) ||
					farmer.primary_phone?.toLowerCase().includes(searchLower) ||
					farmer.secondary_phone?.toLowerCase().includes(searchLower),
			)
		}
		return filtered
	}, [farmersRaw, search])

	// Query groups from the same district who are not members
	// For coop unions: only show COOPERATIVE and ASSOCIATION
	// For cooperatives/associations: only show ASSOCIATION
	const groupsQuery = useMemo(() => {
		if (!districtId) return ''
		const subcategoryFilter = isCoopUnion
			? `IN ('${OrganizationTypes.COOPERATIVE}', '${OrganizationTypes.ASSOCIATION}')`
			: `= '${OrganizationTypes.ASSOCIATION}'`
		return `SELECT 
			a.id,
			ad.other_names as group_name,
			ad.photo,
			COALESCE(ap.name, 'N/A') as admin_post_name,
			ac.subcategory as organization_type
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON ap.id = addr.admin_post_id
		WHERE a.category = 'GROUP' 
		AND ac.subcategory ${subcategoryFilter}
		AND addr.district_id = '${districtId}'
		AND a.id != '${currentGroupId}'
		AND NOT EXISTS (
			SELECT 1 FROM ${TABLES.GROUP_MEMBERS} gm 
			WHERE gm.member_id = a.id 
			AND gm.group_id = '${currentGroupId}'
		)`
	}, [districtId, organizationType, currentGroupId])

	const { data: groupsRaw, isLoading: isGroupsLoading } = useQueryMany<{
		id: string
		group_name: string
		admin_post_name: string
		photo: string
		organization_type: string
	}>(groupsQuery)

	const groups = useMemo(() => {
		if (!groupsRaw) return []
		let filtered = groupsRaw
		if (search) {
			const searchLower = search.toLowerCase()
			filtered = groupsRaw.filter((group) => group.group_name.toLowerCase().includes(searchLower))
		}
		return filtered
	}, [groupsRaw, search])

	// Handle the confirmation of adding the selected members to the organization
	const onConfirm = async () => {
		if (!userDetails || !userDetails.district_id || !districtId) return
		let members: GroupMemberRecord[] = []
		let individualMembersToAdd: GroupMemberRecord[] = []
		let groupMembersToAdd: GroupMemberRecord[] = []

		if (individualMembers.length > 0) {
			individualMembersToAdd = individualMembers.map((member) => {
				const id = uuidv4()
				return buildMember({
					id: id,
					group_id: currentGroupId,
					member_id: member.id,
					member_type: 'FARMER',
					sync_id: districtId,
				})
			})
		}

		if (groupMembers.length > 0) {
			groupMembersToAdd = groupMembers.map((member) => {
				const id = uuidv4()
				return buildMember({
					id: id,
					group_id: currentGroupId,
					member_id: member.id,
					member_type: 'GROUP',
					sync_id: districtId,
				})
			})
		}

		members = [...individualMembersToAdd, ...groupMembersToAdd]

		if (members.length === 0) return

		try {
			await addMembersToOrganization(members)
			router.navigate('/(aux)/actors/organization/members-list')
			resetGroupMembers()
			resetIndividualMembers()
		} catch (error) {
			console.error('Error adding members:', error)
		}
	}

	const handleToggleFarmer = (farmer: (typeof farmers)[0]) => {
		addOrRemoveIndividualMember({ id: farmer.id, title: `${farmer.other_names} ${farmer.surname}` })
	}

	const handleToggleGroup = (group: (typeof groups)[0]) => {
		addOrRemoveGroupMember({ id: group.id, title: group.group_name })
	}

	// Filter groups into cooperatives and associations for coop unions
	const cooperatives = useMemo(() => {
		if (!groupsRaw || !isCoopUnion) return []
		return groupsRaw.filter((group) => {
			// We need to check the subcategory, but we don't have it in the query result
			// So we'll need to update the query to include it
			return true // Placeholder - will be filtered by the query
		})
	}, [groupsRaw, isCoopUnion])

	const associations = useMemo(() => {
		if (!groupsRaw || !isCoopUnion) return []
		return groupsRaw.filter((group) => {
			// We need to check the subcategory, but we don't have it in the query result
			// So we'll need to update the query to include it
			return true // Placeholder - will be filtered by the query
		})
	}, [groupsRaw, isCoopUnion])

	const horizontalData = isCoopUnion
		? [
				{
					id: 1,
					title: 'Cooperativas',
					iconName: 'people',
				},
				{
					id: 2,
					title: 'Associações',
					iconName: 'people',
				},
			]
		: [
				{
					id: 1,
					title: 'Produtores',
					iconName: 'person',
				},
				{
					id: 2,
					title: 'Associações',
					iconName: 'people',
				},
			]

	const verticalData = isCoopUnion
		? [
				{
					id: 1,
					title: 'Cooperativas',
					component: (
						<FlatList
							data={cooperatives}
							keyExtractor={(item: (typeof cooperatives)[0]) => item.id}
							contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
							showsVerticalScrollIndicator={false}
							ListEmptyComponent={() => (
								<ActorListEmpty actionType={ActionType.UNKNOWN} message="Nenhuma cooperativa encontrada" />
							)}
							renderItem={({ item }: { item: (typeof cooperatives)[0] }) => (
								<GroupCard
									group={item}
									selected={groupMembers.some((m) => m.id === item.id)}
									onToggle={() => handleToggleGroup(item)}
								/>
							)}
						/>
					),
				},
				{
					id: 2,
					title: 'Associações',
					component: (
						<FlatList
							data={associations}
							keyExtractor={(item: (typeof associations)[0]) => item.id}
							contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
							showsVerticalScrollIndicator={false}
							ListEmptyComponent={() => (
								<ActorListEmpty actionType={ActionType.UNKNOWN} message="Nenhuma associação encontrada" />
							)}
							renderItem={({ item }: { item: (typeof associations)[0] }) => (
								<GroupCard
									group={item}
									selected={groupMembers.some((m) => m.id === item.id)}
									onToggle={() => handleToggleGroup(item)}
								/>
							)}
						/>
					),
				},
			]
		: [
				{
					id: 1,
					title: 'Produtores',
					component: (
						<FlatList
							data={farmers}
							keyExtractor={(item: (typeof farmers)[0]) => item.id}
							contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
							showsVerticalScrollIndicator={false}
							ListEmptyComponent={() => (
								<ActorListEmpty actionType={ActionType.UNKNOWN} message="Nenhum produtor encontrado" />
							)}
							renderItem={({ item }: { item: (typeof farmers)[0] }) => (
								<FarmerCard
									farmer={item}
									selected={individualMembers.some((m) => m.id === item.id)}
									onToggle={() => handleToggleFarmer(item)}
								/>
							)}
						/>
					),
				},
				{
					id: 2,
					title: 'Associações',
					component: (
						<FlatList
							data={groups}
							keyExtractor={(item: (typeof groups)[0]) => item.id}
							contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
							showsVerticalScrollIndicator={false}
							ListEmptyComponent={() => (
								<ActorListEmpty actionType={ActionType.UNKNOWN} message="Nenhuma associação encontrada" />
							)}
							renderItem={({ item }: { item: (typeof groups)[0] }) => (
								<GroupCard
									group={item}
									selected={groupMembers.some((m) => m.id === item.id)}
									onToggle={() => handleToggleGroup(item)}
								/>
							)}
						/>
					),
				},
			]

	const totalSelected = individualMembers.length + groupMembers.length

	return (
		<>
			<AnimationTopTab horizontalData={horizontalData} verticalData={verticalData} />
			{totalSelected > 0 && (
				<View className="absolute bottom-3 left-3 right-3">
					<SubmitButton
						title={`Confirmar (${totalSelected} ${totalSelected === 1 ? 'selecionado' : 'selecionados'})`}
						onPress={onConfirm}
					/>
				</View>
			)}
		</>
	)
}
