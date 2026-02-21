// React and React Native imports
import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'

// Third party libraries
import { Ionicons } from '@expo/vector-icons'
import * as Animatable from 'react-native-animatable'
import { Image } from 'expo-image'

// Constants
import { actorOrganizationsImageUri, farmerCategoryImageUri, warehouseImageUri } from 'src/constants/imageURI'

// Types
import { CashewWarehouseType, MultiCategory, OrganizationTypes } from 'src/types'

import { useRouter } from 'expo-router'
import { useQueryMany, useUserDetails } from 'src/hooks/queries'
import { TABLES, UserDetailsRecord } from 'src/library/powersync/schemas/AppSchema'
import CustomShimmerPlaceholder from 'src/components/placeholder/CustomShimmerPlaceholder'
import { getUserSession } from 'src/library/supabase/user-auth'
import { getAdminPostsByDistrictId } from 'src/library/sqlite/selects'
import { Session } from '@supabase/supabase-js'
import RouteProtection from 'src/components/auth/route-protection'
import useUserDistrict from 'src/hooks/useUserDistrict'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

// Custom hook for data processing
const useProcessedData = (userDetails: UserDetailsRecord | null) => {
	const [foundAdminPosts, setFoundAdminPosts] = useState<{ id: string; name: string }[]>([])
	const [farmersByAdminPost, setFarmersByAdminPost] = useState<
		Array<{
			adminPost: { id: string; name: string }
			smallScaleFarmerCount: number
			largeScaleFarmerCount: number
			sprayingServiceProviderCount: number
		}>
	>([])
	const [warehousesByAdminPost, setWarehousesByAdminPost] = useState<
		Array<{
			adminPost: { id: string; name: string }
			buyingPointCount: number
			aggregationPointCount: number
			destinationPointCount: number
		}>
	>([])
	const [organizationsByAdminPost, setOrganizationsByAdminPost] = useState<
		Array<{
			adminPost: { id: string; name: string }
			cooperativeCount: number
			associationCount: number
			unionCount: number
		}>
	>([])

	// Only run queries if PowerSync is ready and we have a district ID
	const districtId = userDetails?.district_id
	const shouldQuery = !!districtId

	const {
		data: farmers,
		isLoading: isFarmersLoading,
		error: farmersError,
		isError: isFarmersError,
	} = useQueryMany<{
		id: string
		admin_post_id: string
		multicategory: string
	}>(
		shouldQuery
			? `
		SELECT 
			ad.actor_id as id,
			GROUP_CONCAT(ac.subcategory, ';') as multicategory,
			addr.admin_post_id as admin_post_id
		FROM ${TABLES.ACTOR_DETAILS} ad
		INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'FARMER'
		JOIN ${TABLES.ADDRESS_DETAILS} addr 
			ON addr.owner_id = ad.actor_id AND addr.owner_type = 'FARMER'
		WHERE addr.district_id = '${districtId}'
		GROUP BY ad.actor_id, addr.admin_post_id
	`
			: '',
	)

	const {
		data: organizations,
		isLoading: isOrganizationsLoading,
		error: organizationsError,
		isError: isOrganizationsError,
	} = useQueryMany<{
		id: string
		admin_post_id: string
		organization_type: OrganizationTypes
	}>(
		shouldQuery
			? `
		SELECT 
			a.id as id,
			ac.subcategory as organization_type,
			addr.admin_post_id as admin_post_id
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr 
			ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
		WHERE addr.district_id = '${districtId}' AND a.category = 'GROUP'
	`
			: '',
	)

	const {
		data: warehouses,
		isLoading: isWarehousesLoading,
		error: warehousesError,
		isError: isWarehousesError,
	} = useQueryMany<{
		id: string
		admin_post_id: string
		warehouse_type: CashewWarehouseType
	}>(
		shouldQuery
			? `
		SELECT 
			wd.id as id,
			wd.type as warehouse_type,
			ad.admin_post_id as admin_post_id
		FROM ${TABLES.WAREHOUSE_DETAILS} wd
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad 
			ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
		WHERE ad.district_id = '${districtId}'
	`
			: '',
	)

	// Only fetch admin posts if PowerSync is ready
	useEffect(() => {
		if (!shouldQuery) {
			setFoundAdminPosts([])
			return
		}

		const fetchAdminPosts = async () => {
			try {
				const posts = await getAdminPostsByDistrictId(districtId!)
				if (posts && posts.length > 0) {
					setFoundAdminPosts(posts.map((post) => ({ id: post.id, name: post.name })))
				} else {
					setFoundAdminPosts([])
				}
			} catch (error) {
				console.error('Error getting admin posts:', error)
				setFoundAdminPosts([])
			}
		}

		fetchAdminPosts()
	}, [shouldQuery, districtId])

	// Only process data if we have all required data
	useEffect(() => {
		// Ensure all data arrays exist before processing
		if (
			!Array.isArray(foundAdminPosts) ||
			!Array.isArray(farmers) ||
			!Array.isArray(organizations) ||
			!Array.isArray(warehouses)
		) {
			return
		}

		const results = foundAdminPosts.map((post) => {
			const postFarmers = (farmers || []).filter((farmer) => farmer?.admin_post_id == post.id)
			const postOrganizations = (organizations || []).filter((organization) => organization?.admin_post_id == post.id)
			const postWarehouses = (warehouses || []).filter((warehouse) => warehouse?.admin_post_id == post.id)

			return {
				farmers: {
					adminPost: post,
					smallScaleFarmerCount: postFarmers.filter((farmer) =>
						farmer.multicategory?.includes(MultiCategory.FARMER_SMALL_SCALE),
					).length,
					largeScaleFarmerCount: postFarmers.filter((farmer) =>
						farmer.multicategory?.includes(MultiCategory.FARMER_LARGE_SCALE),
					).length,
					sprayingServiceProviderCount: postFarmers.filter((farmer) =>
						farmer.multicategory?.includes(MultiCategory.FARMER_SPRAYING_SERVICE_PROVIDER),
					).length,
				},
				warehouses: {
					adminPost: post,
					buyingPointCount: postWarehouses.filter((warehouse) => warehouse.warehouse_type == CashewWarehouseType.BUYING)
						.length,
					aggregationPointCount: postWarehouses.filter(
						(warehouse) => warehouse.warehouse_type == CashewWarehouseType.AGGREGATION,
					).length,
					destinationPointCount: postWarehouses.filter(
						(warehouse) => warehouse.warehouse_type == CashewWarehouseType.DESTINATION,
					).length,
				},
				organizations: {
					adminPost: post,
					cooperativeCount: postOrganizations.filter(
						(organization) => organization.organization_type == OrganizationTypes.COOPERATIVE,
					).length,
					associationCount: postOrganizations.filter(
						(organization) => organization.organization_type == OrganizationTypes.ASSOCIATION,
					).length,
					unionCount: postOrganizations.filter(
						(organization) => organization.organization_type == OrganizationTypes.COOP_UNION,
					).length,
				},
			}
		})

		setFarmersByAdminPost(results.map((r) => r.farmers))
		setWarehousesByAdminPost(results.map((r) => r.warehouses))
		setOrganizationsByAdminPost(results.map((r) => r.organizations))
	}, [shouldQuery, foundAdminPosts, farmers, organizations, warehouses])

	const computedWarehouses = useMemo(
		() => [
			{
				name: 'Postos de Compra',
				icon: 'person',
				count: warehousesByAdminPost.reduce((sum, post) => sum + post.buyingPointCount, 0),
			},
			{
				name: 'Armazéns de Trânsito',
				icon: 'person',
				count: warehousesByAdminPost.reduce((sum, post) => sum + post.aggregationPointCount, 0),
			},
			{
				name: 'Armazéns de Destino',
				icon: 'person',
				count: warehousesByAdminPost.reduce((sum, post) => sum + post.destinationPointCount, 0),
			},
		],
		[warehousesByAdminPost],
	)

	const computedFarmers = useMemo(
		() => [
			{
				name: 'Familiares',
				icon: 'person',
				count: farmersByAdminPost.reduce((sum, post) => sum + post.smallScaleFarmerCount, 0),
			},
			{
				name: 'Comerciais',
				icon: 'person',
				count: farmersByAdminPost.reduce((sum, post) => sum + post.largeScaleFarmerCount, 0),
			},
			{
				name: 'Prov. de Serviços',
				icon: 'person',
				count: farmersByAdminPost.reduce((sum, post) => sum + post.sprayingServiceProviderCount, 0),
			},
		],
		[farmersByAdminPost],
	)

	const computedOrganizations = useMemo(
		() => [
			{
				name: 'Cooperativas',
				icon: 'people',
				count: organizationsByAdminPost.reduce((sum, post) => sum + post.cooperativeCount, 0),
			},
			{
				name: 'Associações',
				icon: 'people',
				count: organizationsByAdminPost.reduce((sum, post) => sum + post.associationCount, 0),
			},
			{
				name: 'Uniões',
				icon: 'people',
				count: organizationsByAdminPost.reduce((sum, post) => sum + post.unionCount, 0),
			},
		],
		[organizationsByAdminPost],
	)

	return {
		farmersByAdminPost,
		warehousesByAdminPost,
		organizationsByAdminPost,
		computedWarehouses,
		computedFarmers,
		computedOrganizations,
		// isLoading,
		foundAdminPosts,
	}
}

// Table Skeleton Component
const TableSkeleton = () => (
	<View className="flex flex-col border p-2 rounded-lg border-gray-200 dark:border-gray-700">
		<View className="flex flex-row items-center">
			<CustomShimmerPlaceholder
				style={{
					width: 24,
					height: 24,
					borderRadius: 100,
					borderWidth: 1,
					borderColor: '#008000',
					padding: 2,
				}}
			/>
			<CustomShimmerPlaceholder
				style={{
					width: 120,
					height: 20,
					borderRadius: 4,
					marginLeft: 8,
				}}
			/>
		</View>
		<View className="flex-1 flex-col justify-between mt-2">
			{/* Header row skeleton */}
			<View className="flex-1 flex-row justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
				{[1, 2, 3, 4].map((_, index) => (
					<CustomShimmerPlaceholder
						key={index}
						style={{
							width: '23%',
							height: 20,
							borderRadius: 4,
							margin: 4,
						}}
					/>
				))}
			</View>

			{/* Data rows skeleton */}
			{[1, 2, 3].map((_, rowIndex) => (
				<View
					key={rowIndex}
					className={`flex-1 flex-row justify-between border-b border-gray-200 dark:border-gray-700 ${
						rowIndex % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-gray-900'
					}`}
				>
					{[1, 2, 3, 4].map((_, colIndex) => (
						<CustomShimmerPlaceholder
							key={colIndex}
							style={{
								width: '23%',
								height: 16,
								borderRadius: 4,
								margin: 4,
							}}
						/>
					))}
				</View>
			))}

			{/* Total row skeleton */}
			<View className="flex-1 flex-row justify-between border-t-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
				<CustomShimmerPlaceholder
					style={{
						width: '23%',
						height: 20,
						borderRadius: 4,
						margin: 4,
					}}
				/>
				{[1, 2, 3].map((_, index) => (
					<CustomShimmerPlaceholder
						key={index}
						style={{
							width: '23%',
							height: 20,
							borderRadius: 4,
							margin: 4,
						}}
					/>
				))}
			</View>
		</View>
	</View>
)

// Reusable table component
const DataTable = ({
	title,
	iconUri,
	headers,
	data,
	totals,
	isLoading,
}: {
	title: string
	iconUri: string
	headers: string[]
	data: any[]
	totals: any[]
	isLoading: boolean
}) => {
	// Helper function to extract values from data items
	const extractValues = (item: any) => {
		// Handle farmers data structure
		if (item.adminPost && typeof item.adminPost === 'object' && item.smallScaleFarmerCount !== undefined) {
			return [
				item.adminPost.name || '',
				item.smallScaleFarmerCount || 0,
				item.largeScaleFarmerCount || 0,
				item.sprayingServiceProviderCount || 0,
			]
		}

		// Handle organizations data structure
		if (item.adminPost && typeof item.adminPost === 'object' && item.cooperativeCount !== undefined) {
			return [item.adminPost.name || '', item.cooperativeCount || 0, item.associationCount || 0, item.unionCount || 0]
		}

		// Handle warehouses data structure
		if (item.adminPost && typeof item.adminPost === 'object' && item.buyingPointCount !== undefined) {
			return [
				item.adminPost.name || '',
				item.buyingPointCount || 0,
				item.aggregationPointCount || 0,
				item.destinationPointCount || 0,
			]
		}

		// Fallback: try to use Object.values if they're all primitive
		const values = Object.values(item)
		if (values.every((val) => typeof val === 'string' || typeof val === 'number')) {
			return values
		}

		// Last resort: return empty array
		return []
	}

	return (
		<View className="flex flex-col border p-2 rounded-lg border-gray-200 dark:border-gray-700">
			<View className="flex flex-row items-center">
				<Image
					source={{ uri: iconUri }}
					style={{
						width: 24,
						height: 24,
						borderRadius: 100,
						borderWidth: 1,
						borderColor: '#008000',
						padding: 2,
					}}
					contentFit="contain"
				/>
				<Text className="text-[#008000] font-semibold text-[14px] p-2">{title}</Text>
			</View>
			<View className="flex-1 flex-col justify-between">
				{/* Header row */}
				<View className="flex-1 flex-row justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
					{headers.map((header, index) => (
						<Text
							key={index}
							className={`w-1/4 text-gray-600 dark:text-gray-400 font-semibold text-[10px] ${
								index < headers.length - 1 ? 'border-r border-gray-200 dark:border-gray-700' : ''
							} ${index === 0 ? 'p-2' : 'text-center p-2'}`}
						>
							{header}
						</Text>
					))}
				</View>

				{isLoading ? (
					<View className="flex-1 items-center justify-center py-4">
						<TableSkeleton />
					</View>
				) : (
					<>
						{/* Data rows */}
						{data.map((item, index) => {
							const values = extractValues(item)

							return (
								<View
									key={index}
									className={`flex-1 flex-row justify-between border-b border-gray-200 dark:border-gray-700 ${
										index % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-gray-900'
									}`}
								>
									{values.map((value, valueIndex) => (
										<Text
											key={valueIndex}
											className={`w-1/4 text-gray-600 dark:text-gray-400 text-[10px] ${
												valueIndex < values.length - 1 ? 'border-r border-gray-200 dark:border-gray-700' : ''
											} ${valueIndex === 0 ? 'p-2' : 'text-center p-2'}`}
										>
											{value}
										</Text>
									))}
								</View>
							)
						})}

						{/* Total row */}
						<View className="flex-1 flex-row justify-between border-t-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
							<Text className="w-1/4 text-gray-700 dark:text-gray-300 font-bold text-[10px] p-2 border-r border-gray-200 dark:border-gray-700">
								Total
							</Text>
							{totals.map((total, index) => (
								<Text
									key={index}
									className={`w-1/4 text-gray-700 dark:text-gray-300 font-bold text-[10px] text-center p-2 ${
										index < totals.length - 1 ? 'border-r border-gray-200 dark:border-gray-700' : ''
									}`}
								>
									{total.count}
								</Text>
							))}
						</View>
					</>
				)}
			</View>
		</View>
	)
}

export default function HomeScreen() {
	const { userDetails, isLoading: isUserDetailsLoading } = useUserDetails()
	const { districtName } = useUserDistrict()
	const [session, setSession] = useState<Session | null>(null)

	const router = useRouter()
	const {
		farmersByAdminPost,
		warehousesByAdminPost,
		organizationsByAdminPost,
		computedWarehouses,
		computedFarmers,
		computedOrganizations,
		// isLoading: isDataLoading,
		// foundAdminPosts,
	} = useProcessedData(userDetails)

	// Check session
	useEffect(() => {
		const checkSession = async () => {
			const { session, error } = await getUserSession()
			setSession(session)
			if (!session) {
				router.replace('/(auth)/login')
			}
		}

		if (!session) {
			checkSession()
		}
	}, [session, router])

	useEffect(() => {}, [])

	return (
		<RouteProtection>
			{/* <CustomSafeAreaView> */}
					<Animated.ScrollView
						entering={FadeIn.duration(300)}
						exiting={FadeOut.duration(300)}
						contentContainerStyle={{
							flexGrow: 1,
							justifyContent: 'center',
							paddingBottom: 20,
						}}
						className="bg-white dark:bg-black"
						showsVerticalScrollIndicator={false}
					>
						<View className="h-[150px] bg-[#008000]">
							<View className="relative justify-center items-center pt-10">
								<Animatable.Text
									animation="pulse"
									easing="ease-out"
									iterationCount="infinite"
									style={{ textAlign: 'center' }}
									className="text-[22px] font-bold text-white"
								>
									Connect Caju
								</Animatable.Text>
								<Text className="text-white text-center text-[10px] italic px-10">
									Digitalizando o sector de amêndoas em Moçambique
								</Text>
							</View>

							{/* <Button
								title="Try!"
								onPress={() => {
									Sentry.captureException(new Error('First error'))
								}}
							/> */}
							<View className="h-[50px] flex flex-row items-center justify-between space-x-6 px-3">
								<View className="flex flex-row items-center space-x-1 w-1/2">
									<Ionicons name="location-outline" size={20} color="white" />
									<Text className="text-white text-[14px] font-semibold text-center">
										{districtName || 'Distrito não definido'}
									</Text>
								</View>
							</View>
						</View>
						<View className="flex-1 py-4 space-y-3 justify-center px-3 rounded-t-3xl bg-white dark:bg-black">
							<DataTable
								title="Produtores"
								iconUri={farmerCategoryImageUri}
								headers={['Posto Admin.', 'Familiares', 'Comerciais', 'Prov. Serviços']}
								data={farmersByAdminPost}
								totals={computedFarmers}
								isLoading={isUserDetailsLoading}
							/>
							<DataTable
								title="Grupos"
								iconUri={actorOrganizationsImageUri}
								headers={['Posto Admin.', 'Cooperativas', 'Associações', 'Uniões']}
								data={organizationsByAdminPost}
								totals={computedOrganizations}
								isLoading={isUserDetailsLoading}
							/>
							<DataTable
								title="Armazéns e Postos de Compra"
								iconUri={warehouseImageUri}
								headers={['Posto Admin.', 'Postos de Compra', 'Armazéns de Trânsito', 'Armazéns de Destino']}
								data={warehousesByAdminPost}
								totals={computedWarehouses}
								isLoading={isUserDetailsLoading}
							/>
						</View>
					</Animated.ScrollView>
				<StatusBar style="light" />
		</RouteProtection>
	)
}
