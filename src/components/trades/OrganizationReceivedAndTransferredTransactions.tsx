import { View } from 'react-native'
import { useUserDetails } from 'src/hooks/queries'
import { useQueryManyAndWatchChanges } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { TransactionFlowType } from 'src/types'
import { useMemo, useState } from 'react'
import {
	OrganizationReceivedTransactionItem,
	OrganizationTransferredTransactionItem,
} from 'src/features/trades/data/types'
import AddOrganizationReceivedInfo from '../forms/trades/AddOrganizationReceivedInfo'
import Accordion from '../ui/custom-accordion'
import OrganizationTransferredInfo from './OrganizationTransferredInfo'

export default function OrganizationReceivedAndTransferredTransactions({
	storeType,
	organizationId,
}: {
	storeType: 'GROUP' | 'WAREHOUSE'
	organizationId: string
}) {
	const { userDetails } = useUserDetails()
	const [expandedSection, setExpandedSection] = useState<'received' | 'transferred' | null>(null)

	const {
		data: receivedTransactions,
		isLoading: isReceivedTransactionsLoading,
		error: receivedTransactionsError,
		isError: isReceivedTransactionsError,
	} = useQueryManyAndWatchChanges<OrganizationReceivedTransactionItem>(
		`SELECT 
            orgt.*,
			origin_org.id as origin_org_id,
			ad.other_names as origin_org_group_name,
			ac.subcategory as origin_org_organization_type
        FROM ${TABLES.ORGANIZATION_TRANSACTIONS} orgt 
            JOIN ${TABLES.ACTORS} origin_org ON orgt.store_id = origin_org.id AND origin_org.category = 'GROUP'
            LEFT JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = origin_org.id
            LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = origin_org.id AND ac.category = 'GROUP'
            WHERE orgt.reference_store_id = '${organizationId}'
			AND orgt.confirmed = 'false'
            AND orgt.transaction_type = '${TransactionFlowType.TRANSFERRED_OUT}'`,
	)

	const {
		data: transferredTransactions,
		isLoading: isTransferredTransactionsLoading,
		error: transferredTransactionsError,
		isError: isTransferredTransactionsError,
	} = useQueryManyAndWatchChanges<OrganizationTransferredTransactionItem>(
		`SELECT 
            orgt.*,
			destination_org.id as destination_org_id,
			ad.other_names as destination_org_group_name,
			ac.subcategory as destination_org_organization_type
        FROM ${TABLES.ORGANIZATION_TRANSACTIONS} orgt 
            JOIN ${TABLES.ACTORS} destination_org ON orgt.reference_store_id = destination_org.id AND destination_org.category = 'GROUP'
            LEFT JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = destination_org.id
            LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = destination_org.id AND ac.category = 'GROUP'
            WHERE orgt.store_id = '${organizationId}'
			AND orgt.confirmed = 'false'
            AND orgt.transaction_type = '${TransactionFlowType.TRANSFERRED_OUT}'`,
	)

	const flattenedReceivedTransactions = useMemo(() => {
		return receivedTransactions.flat()
	}, [receivedTransactions])

	const flattenedTransferredTransactions = useMemo(() => {
		return transferredTransactions.flat()
	}, [transferredTransactions])

	const toggleSection = (section: 'received' | 'transferred') => {
		setExpandedSection(expandedSection === section ? null : section)
	}

	if (!userDetails) return null

	return (
		<View className="bg-white dark:bg-black px-3">
			<Accordion
				title="Entradas"
				description="Castanha de caju recebida de outro armazém do mesmo comerciante."
				isExpanded={expandedSection === 'received'}
				onToggle={() => toggleSection('received')}
				badgeCount={flattenedReceivedTransactions.length}
			>
				<AddOrganizationReceivedInfo
					storeType={storeType}
					userDetails={userDetails}
					organizationId={organizationId}
					transactions={flattenedReceivedTransactions}
				/>
			</Accordion>

			<Accordion
				title="Saídas"
				description="Castanha de caju transferida para a união das cooperativas."
				isExpanded={expandedSection === 'transferred'}
				onToggle={() => toggleSection('transferred')}
				badgeCount={flattenedTransferredTransactions.length}
			>
				<OrganizationTransferredInfo transactions={flattenedTransferredTransactions} />
			</Accordion>
		</View>
	)
}
