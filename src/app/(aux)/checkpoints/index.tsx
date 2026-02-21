import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Href, useNavigation, useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import CustomPopUpMenu from 'src/components/menus/CustomPopUpMenu'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'
import { colors } from 'src/constants'
import { useQueryManyAndWatchChanges } from 'src/hooks/queries'
import { ShipmentCheckpointRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { TransitType } from 'src/constants/tracking'
import BackButton from 'src/components/buttons/BackButton'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'

const CheckpointHeaderRight = () => {
	const router = useRouter()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	return (
		<CustomPopUpMenu
			options={[
				{
					label: 'Novo Posto de Fiscalizacao',
					icon: <Ionicons name="add-circle-outline" size={18} color={isDarkMode ? colors.white : colors.black} />,
					action: () => {
						router.push('/(aux)/checkpoints/registration')
					},
				},
			]}
		/>
	)
}

type CheckpointWithLocation = ShipmentCheckpointRecord & {
	province_name: string
	district_name: string
	admin_post_name: string
	village_name: string
	inspector_count: number
}

type ProvinceGroup = {
	province_name: string
	checkpoints: CheckpointWithLocation[]
}

export default function CheckpointsScreen() {
	const navigation = useNavigation()
	const router = useRouter()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(new Set())

	const { data: checkpointsWithLocation, isLoading } = useQueryManyAndWatchChanges<CheckpointWithLocation>(`
        SELECT 
            sc.*,
            p.name as province_name,
            d.name as district_name,
            ap.name as admin_post_name,
            v.name as village_name,
            COALESCE((
                SELECT COUNT(DISTINCT inspector_id)
                FROM ${TABLES.SHIPMENT_CHECKPOINT_INSPECTORS}
                WHERE checkpoint_id = sc.id
            ), 0) as inspector_count
        FROM ${TABLES.CHECKPOINTS} sc
        LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
        LEFT JOIN ${TABLES.PROVINCES} p ON a.province_id = p.id
        LEFT JOIN ${TABLES.DISTRICTS} d ON a.district_id = d.id
        LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON a.admin_post_id = ap.id
        LEFT JOIN ${TABLES.VILLAGES} v ON a.village_id = v.id
        ORDER BY p.name, sc.name
    `)

	// Group checkpoints by province
	const provincesWithCheckpoints: ProvinceGroup[] = React.useMemo(() => {
		const grouped = checkpointsWithLocation?.reduce(
			(acc, checkpoint) => {
				const provinceName = checkpoint.province_name || 'Sem província'
				if (!acc[provinceName]) {
					acc[provinceName] = {
						province_name: provinceName,
						checkpoints: [],
					}
				}
				acc[provinceName].checkpoints.push(checkpoint)
				return acc
			},
			{} as Record<string, ProvinceGroup>,
		)

		return Object.values(grouped || {})
	}, [checkpointsWithLocation])

	const toggleProvince = (provinceName: string) => {
		setExpandedProvinces((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(provinceName)) {
				newSet.delete(provinceName)
			} else {
				newSet.add(provinceName)
			}
			return newSet
		})
	}

	const renderCheckpoint = ({ item }: { item: CheckpointWithLocation }) => {
		const hasLinks =
			item.northern_next_checkpoint_id ||
			item.southern_next_checkpoint_id ||
			item.eastern_next_checkpoint_id ||
			item.western_next_checkpoint_id

		const checkpointType =
			item.checkpoint_type === TransitType.INTERDISTRITAL
				? 'Interdistrital'
				: item.checkpoint_type === TransitType.INTRADISTRICTAL
					? 'Intradistrital'
					: item.checkpoint_type === TransitType.INTERPROVINCIAL
						? 'Interprovincial'
						: item.checkpoint_type === TransitType.INTERNATIONAL
							? 'Internacional'
							: null

		const typeColor =
			item.checkpoint_type === TransitType.INTERDISTRITAL
				? '#008000'
				: item.checkpoint_type === TransitType.INTRADISTRICTAL
					? '#0000FF'
					: item.checkpoint_type === TransitType.INTERPROVINCIAL
						? '#FF0000'
						: item.checkpoint_type === TransitType.INTERNATIONAL
							? '#0000FF'
							: colors.gray600

		return (
			<TouchableOpacity
				activeOpacity={0.7}
				className="ml-4 mr-2 mb-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
				onPress={() => {
					router.push(`/(aux)/checkpoints/${item.id}`)
				}}
				style={{
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.08,
					shadowRadius: 4,
					elevation: 2,
				}}
			>
				<View className="p-3.5">
					{/* Header Row */}
					<View className="flex-row items-start justify-between mb-2.5">
						<View className="flex-row items-center flex-1">
							<View className="w-10 h-10 rounded-full items-center justify-center mr-2.5 bg-green-50 dark:bg-green-900/20">
								<MaterialCommunityIcons name="police-badge" size={20} color={colors.primary} />
							</View>
							<View className="flex-1">
								<Text className="text-sm font-bold text-black dark:text-white mb-1" numberOfLines={1}>
									{item.name}
								</Text>
								{checkpointType && (
									<View className="flex-row items-center">
										<View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${typeColor}15` }}>
											<View className="flex-row items-center">
												<View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: typeColor }} />
												<Text className="text-[10px] font-medium" style={{ color: typeColor }}>
													{checkpointType}
												</Text>
											</View>
										</View>
									</View>
								)}
							</View>
						</View>
						<View className="flex-row items-center ml-2">
							{hasLinks && (
								<View className="bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-full mr-2">
									<Ionicons name="git-network" size={14} color="#3b82f6" />
								</View>
							)}
							<Ionicons name="chevron-forward" size={18} color={colors.gray600} />
						</View>
					</View>

					{/* Info Section */}
					<View className="border-t border-gray-100 dark:border-gray-700 pt-2.5">
						<View className="flex-row items-center mb-1.5">
							<Ionicons name="location-outline" size={13} color={colors.gray600} />
							<Text className="ml-1.5 text-xs text-gray-600 dark:text-gray-400 flex-1" numberOfLines={1}>
								{item.district_name}, {item.admin_post_name}
							</Text>
						</View>
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Ionicons name="people-outline" size={13} color={colors.gray600} />
								<Text className="ml-1.5 text-xs text-gray-600 dark:text-gray-400">
									{item.inspector_count || 0} {item.inspector_count !== 1 ? 'Fiscais' : 'Fiscal'}
								</Text>
							</View>
							{item.inspector_count > 0 && (
								<View className="bg-[#008000]/10 dark:bg-[#008000]/20 px-2 py-0.5 rounded-full">
									<Text className="text-[10px] font-semibold text-[#008000] dark:text-green-400">Ativo</Text>
								</View>
							)}
						</View>
						{item.description && (
							<Text className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-4" numberOfLines={2}>
								{item.description}
							</Text>
						)}
					</View>
				</View>
			</TouchableOpacity>
		)
	}

	const renderSkeletonProvince = () => (
		<View className="mb-4">
			{/* Province Header Skeleton */}
			<View className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
				<View className="flex-1">
					<View className="h-6 w-32 mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					<View className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
				</View>
				<View className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
			</View>

			{/* Checkpoints Skeleton */}
			<View className="px-4 pb-4">
				{[1, 2, 3].map((index) => (
					<View key={index} className="ml-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-md mb-2">
						<View className="h-5 w-40 mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
						<View className="h-4 w-32 mb-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
						<View className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					</View>
				))}
			</View>
		</View>
	)

	const renderProvince = ({ item }: { item: ProvinceGroup }) => {
		const isExpanded = expandedProvinces.has(item.province_name)

		return (
			<View className="mb-3">
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => toggleProvince(item.province_name)}
					className={`flex-row items-center justify-between p-4 rounded-xl border-2 ${
						isExpanded
							? 'bg-[#008000] dark:bg-green-900 border-green-600 dark:border-green-700'
							: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
					}`}
					style={
						isExpanded
							? {
									shadowColor: '#008000',
									shadowOffset: { width: 0, height: 2 },
									shadowOpacity: 0.1,
									shadowRadius: 4,
									elevation: 3,
								}
							: {
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.05,
									shadowRadius: 2,
									elevation: 1,
								}
					}
				>
					<View className="flex-row items-center flex-1">
						<View
							className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
								isExpanded ? 'bg-white/20 dark:bg-white/10' : 'bg-green-100 dark:bg-green-900/30'
							}`}
						>
							<MaterialCommunityIcons name="map-marker" size={20} color={isExpanded ? '#ffffff' : colors.primary} />
						</View>
						<View className="flex-1">
							<Text className={`font-bold text-base ${isExpanded ? 'text-white' : 'text-black dark:text-white'}`}>
								{item.province_name}
							</Text>
							<Text
								className={`text-sm mt-0.5 ${
									isExpanded ? 'text-green-50 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'
								}`}
							>
								{item.checkpoints.length} posto{item.checkpoints.length !== 1 ? 's' : ''} de fiscalização
							</Text>
						</View>
					</View>
					<View
						className={`w-7 h-7 rounded-full items-center justify-center ${
							isExpanded ? 'bg-white/20 dark:bg-white/10' : 'bg-gray-100 dark:bg-gray-800'
						}`}
					>
						<Ionicons
							name={isExpanded ? 'chevron-up' : 'chevron-down'}
							size={18}
							color={isExpanded ? '#ffffff' : colors.gray600}
						/>
					</View>
				</TouchableOpacity>

				{isExpanded && (
					<View className="mt-2 px-2 pb-2">
						<FlatList
							data={item.checkpoints}
							renderItem={renderCheckpoint}
							keyExtractor={(checkpoint: CheckpointWithLocation) => checkpoint.id}
							scrollEnabled={false}
						/>
					</View>
				)}
			</View>
		)
	}

	useEffect(() => {
		navigation.setOptions({
			headerBackVisible: false, // Hide default back button
			headerLeft: () => <BackButton route="/(tabs)/user/user-settings" />,
			headerTitle: () => (
				<View className="flex flex-col items-center">
					<Text className="text-black dark:text-white text-[14px] font-bold text-center">Postos de fiscalização</Text>
				</View>
			),
			headerRight: () => <CheckpointHeaderRight />,
		})
	}, [checkpointsWithLocation])

	return (
		<View className="flex-1 bg-white dark:bg-gray-900">
			{isLoading ? (
				<View className="flex-1 p-4">
					{[1, 2, 3].map((index) => (
						<View key={index}>{renderSkeletonProvince()}</View>
					))}
				</View>
			) : (
				<FlatList
					data={provincesWithCheckpoints}
					renderItem={renderProvince}
					keyExtractor={(item: ProvinceGroup) => item.province_name}
					contentContainerStyle={{ padding: 16 }}
					ListEmptyComponent={() => (
						<View className="flex-1 justify-center items-center mt-10">
							<EmptyPlaceholder message="Nenhum posto de fiscalização encontrado" />
						</View>
					)}
				/>
			)}
			<SingleFloatingButton icon="arrow-right" route="/(tabs)/user/user-settings" />
		</View>
	)
}
