import { View } from 'react-native'
import { useUserDetails } from 'src/hooks/queries'
import { useQueryManyAndWatchChanges } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { TransactionFlowType } from 'src/types'
import { useMemo, useState } from 'react'
import { ReceivedTransactionItem, TransferredTransactionItem } from 'src/features/trades/data/types'
import AddReceivedInfo from '../forms/trades/AddReceivedInfo'
import TransferredInfo from './TransferredInfo'
import Accordion from '../ui/custom-accordion'

export default function ReceivedAndTransferredTransactions({
	storeType,
	warehouseId,
}: {
	storeType: 'WAREHOUSE' | 'GROUP'
	warehouseId: string
}) {
	const { userDetails } = useUserDetails()
	const [expandedSection, setExpandedSection] = useState<'received' | 'transferred' | null>(null)

	const {
		data: receivedTransactions,
		isLoading: isReceivedTransactionsLoading,
		error: receivedTransactionsError,
		isError: isReceivedTransactionsError,
	} = useQueryManyAndWatchChanges<ReceivedTransactionItem>(
		`SELECT 
            cwt.*,
            wd.id as cw_id,
            ad.id as address_id,
            wd.description,
            wd.type as warehouse_type,
			wd.owner_id,
            p.name as province,
            d.name as district,
            ap.name as admin_post,
            v.name as village
        FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} cwt 
            JOIN ${TABLES.WAREHOUSE_DETAILS} wd 
                ON cwt.store_id = wd.id
            LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad 
                ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
            LEFT JOIN ${TABLES.PROVINCES} p 
                ON ad.province_id = p.id
            LEFT JOIN ${TABLES.DISTRICTS} d 
                ON ad.district_id = d.id
            LEFT JOIN ${TABLES.ADMIN_POSTS} ap 
                ON ad.admin_post_id = ap.id
            LEFT JOIN ${TABLES.VILLAGES} v 
                ON ad.village_id = v.id
            WHERE cwt.confirmed = 'false'
            AND cwt.reference_store_id = '${warehouseId}'
            AND cwt.transaction_type = '${TransactionFlowType.TRANSFERRED_OUT}'`,
	)

	const {
		data: transferredTransactions,
		isLoading: isTransferredTransactionsLoading,
		error: transferredTransactionsError,
		isError: isTransferredTransactionsError,
	} = useQueryManyAndWatchChanges<TransferredTransactionItem>(
		`SELECT 
            cwt.*,
            wd.id as cw_id,
            ad.id as address_id,
            wd.description,
            wd.type as warehouse_type,
			wd.owner_id,
            p.name as province,
            d.name as district,
            ap.name as admin_post,
            v.name as village
        FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} cwt 
            JOIN ${TABLES.WAREHOUSE_DETAILS} wd 
                ON cwt.reference_store_id = wd.id
            LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad 
                ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
            LEFT JOIN ${TABLES.PROVINCES} p 
                ON ad.province_id = p.id
            LEFT JOIN ${TABLES.DISTRICTS} d 
                ON ad.district_id = d.id
            LEFT JOIN ${TABLES.ADMIN_POSTS} ap 
                ON ad.admin_post_id = ap.id
            LEFT JOIN ${TABLES.VILLAGES} v 
                ON ad.village_id = v.id
            WHERE 
                cwt.confirmed = 'false'
            AND 
                cwt.transaction_type = '${TransactionFlowType.TRANSFERRED_OUT}'
            AND cwt.store_id = '${warehouseId}'`,
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
		<View className="bg-white dark:bg-black px-3 ">
			<Accordion
				title="Entradas"
				description="Castanha de caju recebida de outro armazém do mesmo comerciante."
				isExpanded={expandedSection === 'received'}
				onToggle={() => toggleSection('received')}
				badgeCount={flattenedReceivedTransactions.length}
			>
				<AddReceivedInfo
					storeType={storeType}
					userDetails={userDetails}
					warehouseId={warehouseId}
					transactions={flattenedReceivedTransactions}
				/>
			</Accordion>

			<Accordion
				title="Saídas"
				description="Castanha de caju transferida para outro armazém do mesmo comerciante."
				isExpanded={expandedSection === 'transferred'}
				onToggle={() => toggleSection('transferred')}
				badgeCount={flattenedTransferredTransactions.length}
			>
				<TransferredInfo transactions={flattenedTransferredTransactions} />
			</Accordion>
		</View>
	)
}
