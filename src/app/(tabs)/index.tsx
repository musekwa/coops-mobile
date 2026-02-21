// React and React Native imports
import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'

// Third party libraries
import { Ionicons } from '@expo/vector-icons'
import * as Animatable from 'react-native-animatable'
import { Image } from 'expo-image'

// Constants
import { actorOrganizationsImageUri, farmerCategoryImageUri } from 'src/constants/imageURI'

// Types
import { MultiCategory, OrganizationTypes } from 'src/types'

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
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'

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
			!Array.isArray(organizations)
		) {
			return
		}

		const results = foundAdminPosts.map((post) => {
			const postFarmers = (farmers || []).filter((farmer) => farmer?.admin_post_id == post.id)
			const postOrganizations = (organizations || []).filter((organization) => organization?.admin_post_id == post.id)

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
		setOrganizationsByAdminPost(results.map((r) => r.organizations))
	}, [shouldQuery, foundAdminPosts, farmers, organizations])


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
		organizationsByAdminPost,
		computedFarmers,
		computedOrganizations,
		// isLoading,
		foundAdminPosts,
	}
}

// Card Skeleton Component
const CardSkeleton = () => (
	<View className="border rounded-lg border-gray-200 dark:border-gray-700 p-4 mb-3 bg-white dark:bg-gray-800">
		<View className="flex flex-row items-center mb-3">
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
		<View className="flex-row flex-wrap gap-2">
			{[1, 2, 3].map((_, index) => (
				<CustomShimmerPlaceholder
					key={index}
					style={{
						width: 100,
						height: 60,
						borderRadius: 8,
					}}
				/>
			))}
		</View>
	</View>
)

// Helper function to get icon for each label
const getIconForLabel = (label: string): string => {
	const iconMap: { [key: string]: string } = {
		// Farmers
		'Familiares': 'home-outline',
		'Comerciais': 'business-outline',
		'Prov. Serviços': 'construct-outline',
		// Organizations
		'Cooperativas': 'people-outline',
		'Associações': 'people-circle-outline',
		'Uniões': 'link-outline',
	}
	return iconMap[label] || 'ellipse-outline'
}

// Summary Stats Component - Shows totals at the top
const SummaryStats = ({
	totals,
	title,
	iconUri,
	isLoading,
}: {
	totals: any[]
	title: string
	iconUri: string
	isLoading: boolean
}) => {
	if (isLoading) {
		return (
			<View className="mb-4">
				<View className="flex-row items-center mb-3">
					<CustomShimmerPlaceholder style={{ width: 40, height: 40, borderRadius: 20 }} />
					<CustomShimmerPlaceholder style={{ width: 100, height: 20, borderRadius: 4, marginLeft: 8 }} />
				</View>
				<View className="flex-row gap-3">
					{[1, 2, 3].map((_, i) => (
						<CustomShimmerPlaceholder key={i} style={{ flex: 1, height: 80, borderRadius: 12 }} />
					))}
				</View>
			</View>
		)
	}

	return (
		<View className="mb-6">
			<View className="flex-row items-center mb-4">
				<View className="w-10 h-10 rounded-full bg-[#008000]/10 dark:bg-[#008000]/20 items-center justify-center">
					<Image
						source={{ uri: iconUri }}
						style={{ width: 24, height: 24 }}
						contentFit="contain"
					/>
				</View>
				<Text className="text-gray-900 dark:text-white font-bold text-[18px] ml-3">{title}</Text>
			</View>
			<View className="flex-row gap-3">
				{totals.map((total, index) => {
					const totalCount = totals.reduce((sum, t) => sum + t.count, 0)
					const percentage = totalCount > 0 ? ((total.count / totalCount) * 100).toFixed(0) : 0
					
					return (
						<Animated.View
							key={index}
							entering={FadeIn.duration(300).delay(index * 50)}
							className="flex-1 bg-[#008000]/10 dark:bg-[#008000]/20 rounded-xl p-4 border border-[#008000]/20 dark:border-[#008000]/30"
						>
							<View className="flex-row items-center mb-2">
								<View className="w-8 h-8 rounded-full bg-[#008000]/20 dark:bg-[#008000]/30 items-center justify-center">
									<Ionicons 
										name={getIconForLabel(total.name) as any} 
										size={16} 
										color="#008000" 
									/>
								</View>
								<Text className="text-[#008000] dark:text-[#00cc00] text-[10px] ml-2 font-semibold flex-1" numberOfLines={1}>
									{total.name}
								</Text>
							</View>
							<Text className="text-[#008000] dark:text-[#00cc00] font-bold text-[24px] mb-1">
								{total.count}
							</Text>
							<View className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
								<View 
									className="h-full bg-[#008000] rounded-full"
									style={{ width: `${percentage}%` as unknown as number }}
								/>
							</View>
						</Animated.View>
					)
				})}
			</View>
		</View>
	)
}

// Card-based component for displaying data
const DataCard = ({
	title,
	iconUri,
	data,
	totals,
	isLoading,
	labels,
}: {
	title: string
	iconUri: string
	data: any[]
	totals: any[]
	isLoading: boolean
	labels: string[]
}) => {
	return (
		<View className="flex flex-col rounded-2xl p-5 mb-4 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
			<View className="flex flex-row items-center justify-between mb-5">
				<View className="flex flex-row items-center">
					<View className="w-10 h-10 rounded-full bg-[#008000]/10 dark:bg-[#008000]/20 items-center justify-center">
						<Image
							source={{ uri: iconUri }}
							style={{ width: 24, height: 24 }}
							contentFit="contain"
						/>
					</View>
					<Text className="text-gray-900 dark:text-white font-bold text-[18px] ml-3">{title}</Text>
				</View>
				<View className="flex-row items-center bg-[#008000]/10 dark:bg-[#008000]/20 px-3 py-1 rounded-full">
					<Ionicons name="stats-chart-outline" size={14} color="#008000" />
					<Text className="text-[#008000] dark:text-[#00cc00] font-bold text-[12px] ml-1">
						{totals.reduce((sum, t) => sum + t.count, 0)}
					</Text>
				</View>
			</View>

			{isLoading ? (
				<CardSkeleton />
			) : (
				<>
					{data.length === 0 ? (
						<View className="py-8 items-center">
							<Ionicons name="document-outline" size={48} color="#9CA3AF" />
							<Text className="text-gray-400 dark:text-gray-500 text-[14px] mt-2">
								Nenhum dado disponível
							</Text>
						</View>
					) : (
						<View className="space-y-4">
							{data.map((item, index) => {
								// Extract values based on data type
								let values: { label: string; count: number }[] = []
								
								if (item.smallScaleFarmerCount !== undefined) {
									values = [
										{ label: labels[0], count: item.smallScaleFarmerCount || 0 },
										{ label: labels[1], count: item.largeScaleFarmerCount || 0 },
										{ label: labels[2], count: item.sprayingServiceProviderCount || 0 },
									]
								} else if (item.cooperativeCount !== undefined) {
									values = [
										{ label: labels[0], count: item.cooperativeCount || 0 },
										{ label: labels[1], count: item.associationCount || 0 },
										{ label: labels[2], count: item.unionCount || 0 },
									]
								}

								const totalForPost = values.reduce((sum, v) => sum + v.count, 0)

								return (
									<Animated.View
										key={index}
										entering={FadeIn.duration(300).delay(index * 50)}
										className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
									>
										<View className="flex flex-row items-center justify-between mb-4">
											<View className="flex flex-row items-center flex-1">
												<View className="w-8 h-8 rounded-full bg-[#008000]/10 dark:bg-[#008000]/20 items-center justify-center">
													<Ionicons name="location" size={16} color="#008000" />
												</View>
												<Text className="text-gray-900 dark:text-white font-semibold text-[15px] ml-2 flex-1" numberOfLines={1}>
													{item.adminPost?.name || 'N/A'}
												</Text>
											</View>
											<View className="bg-[#008000]/10 dark:bg-[#008000]/20 px-2 py-1 rounded-full">
												<Text className="text-[#008000] dark:text-[#00cc00] font-bold text-[12px]">
													{totalForPost}
												</Text>
											</View>
										</View>
										<View className="flex-row gap-2">
											{values.map((value, valueIndex) => (
												<View
													key={valueIndex}
													className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
												>
													<View className="flex flex-row items-center mb-2">
														<Ionicons 
															name={getIconForLabel(value.label) as any} 
															size={12} 
															color="#008000" 
														/>
														<Text className="text-gray-600 dark:text-gray-400 text-[10px] ml-1 flex-1" numberOfLines={1}>
															{value.label}
														</Text>
													</View>
													<Text className="text-gray-900 dark:text-white font-bold text-[20px]">
														{value.count}
													</Text>
												</View>
											))}
										</View>
									</Animated.View>
								)
							})}
						</View>
					)}
				</>
			)}
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
		organizationsByAdminPost,
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
			<CustomSafeAreaView
				edges={['top']}
			>
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
									MyCoop
								</Animatable.Text>
								<Text className="text-white text-center text-[10px] italic px-10">
									Promovendo o cooperativismo em Moçambique
								</Text>
							</View>
							<View className="h-[50px] flex flex-row items-center justify-between space-x-6 px-3">
								<View className="flex flex-row items-center space-x-1 w-1/2">
									<Ionicons name="location-outline" size={20} color="white" />
									<Text className="text-white text-[14px] font-semibold text-center">
										{districtName || 'Distrito não definido'}
									</Text>
								</View>
							</View>
						</View>
						<View className="flex-1 py-6 px-4 rounded-t-3xl bg-gray-50 dark:bg-black">
							{/* Summary Statistics Section */}
							<View className="mb-6">
								<Text className="text-gray-900 dark:text-white font-bold text-[20px] mb-4">
									Visão Geral
								</Text>
								<SummaryStats
									title="Produtores"
									iconUri={farmerCategoryImageUri}
									totals={computedFarmers}
									isLoading={isUserDetailsLoading}
								/>
								<SummaryStats
									title="Grupos"
									iconUri={actorOrganizationsImageUri}
									totals={computedOrganizations}
									isLoading={isUserDetailsLoading}
								/>
							</View>

							{/* Detailed Breakdown Section */}
							<View className="mb-2">
								<Text className="text-gray-900 dark:text-white font-bold text-[20px] mb-4">
									Detalhes por Posto Administrativo
								</Text>
								<DataCard
									title="Produtores"
									iconUri={farmerCategoryImageUri}
									labels={['Familiares', 'Comerciais', 'Prov. Serviços']}
									data={farmersByAdminPost}
									totals={computedFarmers}
									isLoading={isUserDetailsLoading}
								/>
								<DataCard
									title="Grupos"
									iconUri={actorOrganizationsImageUri}
									labels={['Cooperativas', 'Associações', 'Uniões']}
									data={organizationsByAdminPost}
									totals={computedOrganizations}
									isLoading={isUserDetailsLoading}
								/>
							</View>
						</View>
					</Animated.ScrollView>
				</CustomSafeAreaView>
				<StatusBar style="light" />
		</RouteProtection>
	)
}
