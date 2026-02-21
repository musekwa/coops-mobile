import { View, Text } from 'react-native'
import React from 'react'
import { TransactionFlowType } from 'src/types'
import ReportEmptyStateMessage from '../trades/ReportEmptyStateMessage'
import { OrganizationTransaction } from 'src/models/organizationTransaction'
import ReportSectionHeader from '../trades/ReportSectionHeader'
import { ActorOrganization } from 'src/models/actorOrganization'
import ReportAdminPostHeader from '../trades/ReportAdminPostHeader'
import { getLastVisitDateAtOrg, isVisitOverdue } from 'src/helpers/dates'
import { calculateTotalByTransactionFlow, getFlattenedOrganizationTransactions } from 'src/helpers/helpersToTrades'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'

interface DistrictOrganizationsReportProps {
	orgsByAdminPost: {
		associations: Record<string, ActorOrganization[]>
		cooperatives: Record<string, ActorOrganization[]>
		coop_unions: Record<string, ActorOrganization[]>
	}
	adminPosts: string[]
	orgsTransactions: OrganizationTransaction[] | null
}

export default function DistrictOrganizationsReport({
	orgsByAdminPost,
	adminPosts,
	orgsTransactions,
}: DistrictOrganizationsReportProps) {
	// Render functions for different section types
	const renderOrganizationSection = (
		title: string,
		organizations: Record<string, ActorOrganization[]>,
		transactionType: TransactionFlowType,
	) => {
		const sortOrganizations = (orgs: ActorOrganization[]) => {
			return [...orgs].sort((a, b) => {
				const aLastVisit = orgsTransactions ? getLastVisitDateAtOrg(orgsTransactions, a._id) : undefined
				const bLastVisit = orgsTransactions ? getLastVisitDateAtOrg(orgsTransactions, b._id) : undefined
				
				// No visits come first
				if (!aLastVisit && !bLastVisit) return 0
				if (!aLastVisit) return -1
				if (!bLastVisit) return 1
				
				const aOverdue = isVisitOverdue(aLastVisit)
				const bOverdue = isVisitOverdue(bLastVisit)
				
				// Then overdue visits (sorted by oldest first)
				if (aOverdue && bOverdue) {
					return new Date(aLastVisit).getTime() - new Date(bLastVisit).getTime()
				}
				if (aOverdue) return -1
				if (bOverdue) return 1
				
				// Finally, recent visits (sorted by most recent first)
				return new Date(bLastVisit).getTime() - new Date(aLastVisit).getTime()
			})
		}

		return (
			<View className="space-y-2 mt-4">
				<ReportSectionHeader title={title} />
				{adminPosts.map(
					(adminPost) =>
						organizations[adminPost]?.length > 0 && (
							<View key={`${title}-${adminPost}`} className="ml-4 mb-4">
								<ReportAdminPostHeader name={adminPost} />

								{sortOrganizations(organizations[adminPost]).map((org, index) => {
									const lastVisitDate = orgsTransactions ? getLastVisitDateAtOrg(orgsTransactions, org._id) : undefined
									const visitOverdue = isVisitOverdue(lastVisitDate)

									return (
										<View
											key={org._id}
											className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
										>
											{/* Header Section: Name & Total */}
											<View className="flex-row items-center justify-between mb-2">
												<View className="flex-1">
													<Text className="text-[14px] font-semibold text-gray-800 dark:text-gray-200">
														{index + 1}. {org.name}
													</Text>
												</View>
												<Text className="text-[14px] font-bold text-gray-700 dark:text-gray-300 min-w-[100px] text-right">
													{orgsTransactions &&
														getFlattenedOrganizationTransactions(orgsTransactions, org._id) &&
														Intl.NumberFormat('pt-BR', {
															style: 'unit',
															unit: 'kilogram',
															unitDisplay: 'short',
														}).format(
															calculateTotalByTransactionFlow(
																getFlattenedOrganizationTransactions(orgsTransactions, org._id),
																transactionType,
															),
														)}
												</Text>
											</View>

											{/* Status Section */}
											<View className="bg-white dark:bg-gray-800 rounded-md p-2">
												<View className="flex-row items-center justify-between">
													<View className="flex-row items-center flex-1">
														<Ionicons
															name={lastVisitDate ? (visitOverdue ? 'warning' : 'checkmark-circle') : 'alert-circle'}
															size={14}
															color={lastVisitDate ? (visitOverdue ? colors.warning : colors.primary) : colors.red}
														/>
														<Text className="text-[12px] text-gray-600 dark:text-gray-400 ml-2">
															{lastVisitDate
																? `Última visita: ${new Date(lastVisitDate).toLocaleDateString('pt-BR')}`
																: 'Nunca visitado'}
														</Text>
													</View>
													{visitOverdue && lastVisitDate && (
														<View className="flex-row items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
															<Ionicons name="time-outline" size={12} color={colors.warning} />
															<Text className="text-[10px] text-yellow-700 dark:text-yellow-500 ml-1">
																Visita pendente
															</Text>
														</View>
													)}
												</View>
											</View>
										</View>
									)
								})}
							</View>
						),
				)}
			</View>
		)
	}

	return (
		<>
			{Object.keys(orgsByAdminPost.associations).length > 0 ? (
				renderOrganizationSection('Associações', orgsByAdminPost.associations, TransactionFlowType.AGGREGATED)
			) : (
				<ReportEmptyStateMessage message="Nenhuma associação registada" />
			)}

			{Object.keys(orgsByAdminPost.cooperatives).length > 0 ? (
				renderOrganizationSection('Cooperativas', orgsByAdminPost.cooperatives, TransactionFlowType.AGGREGATED)
			) : (
				<ReportEmptyStateMessage message="Nenhuma cooperativa registada" />
			)}

			{Object.keys(orgsByAdminPost.coop_unions).length > 0 ? (
				renderOrganizationSection('Uniões', orgsByAdminPost.coop_unions, TransactionFlowType.TRANSFERRED_IN)
			) : (
				<ReportEmptyStateMessage message="Nenhuma união registada" />
			)}
		</>
	)
}
