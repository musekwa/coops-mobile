import React from 'react'
import { View, ScrollView } from 'react-native'
import { OrganizationTransferredTransactionItem } from 'src/features/trades/data/types'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'
import TransactionCard from './shared/TransactionCard'
import TransactionShimmer from './shared/TransactionShimmer'
import { getWarehouseTypeLabel } from './shared/transaction-helpers'
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated'

interface OrganizationTransferredInfoProps {
	transactions: OrganizationTransferredTransactionItem[]
}

const TransactionItem = ({ item, index }: { item: OrganizationTransferredTransactionItem; index: number }) => {
	const warehouseType = getWarehouseTypeLabel(item.destination_org_organization_type)
	const description = item.destination_org_group_name

	return (
		<TransactionCard
			index={index}
			quantity={item.quantity!}
			startDate={item.start_date!}
			endDate={item.end_date!}
			warehouseType={warehouseType}
			description={description}
			headerLabel="Transferência"
			locationLabel="Destino"
			statusBadge={{
				icon: 'time-outline',
				text: 'Aguardando confirmação',
				iconColor: '#DC2626',
				textClassName: 'text-red-600 dark:text-red-400',
				bgClassName: 'bg-red-50 dark:bg-red-900/20',
			}}
		/>
	)
}

export default function OrganizationTransferredInfo({ transactions }: OrganizationTransferredInfoProps) {
	// Show shimmer only when transactions is undefined (initial load)
	const isLoading = transactions === undefined
	const isEmpty = !isLoading && transactions.length === 0

	const data = isLoading ? Array(3).fill({}) : transactions

	if (isLoading) {
		return (
			<View>
				{Array(1)
					.fill({})
					.map((_, index) => (
						<TransactionShimmer key={index} />
					))}
			</View>
		)
	}

	if (isEmpty) {
		return <EmptyPlaceholder message="Não há transações aguardando confirmação no momento." />
	}

	return (
		<Animated.ScrollView
			contentContainerStyle={{ paddingBottom: 200, paddingTop: 4, paddingHorizontal: 4, flexGrow: 1 }}
			showsVerticalScrollIndicator={false}
		>
			{data.map((item, index) => (
				<Animated.View
					key={item.id}
					entering={FadeInDown.delay(index * 100).springify()}
					layout={LinearTransition.springify()}
				>
					<TransactionItem item={item} index={index} />
				</Animated.View>
			))}
		</Animated.ScrollView>
	)
}
