import React, { useState } from 'react'
import { View, Text } from 'react-native'
import SubmitButton from 'src/components/buttons/SubmitButton'

import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import { OrganizationTypes } from 'src/types'

import DateRangeSelector from 'src/components/dates/DateRangeSelector'
import OrganizationTransactionDataPreview from 'src/components/data-preview/OrganizationTransactionDataPreview'
import { OrganizationTransactionRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useQueryOneAndWatchChanges } from 'src/hooks/queries'
import AddResoldInfo from './AddResoldInfo'
import AddLostInfo from './AddLostInfo'
import AddTransferredByOrgInfo from './AddTransferredByOrgInfo'
import AddAggregatedInfo from './AddAggregatedInfo'
import {
	useAggregatedInfoStore,
	useDateRangeStore,
	useInfoProviderStore,
	useLostInfoStore,
	useResoldInfoStore,
	useTransferredByOrgInfoStore,
	useTransferredInfoStore,
} from 'src/store/trades'
import AddInfoProviderInfo from './AddInfoProviderInfo'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'


interface AddOrganizationTransactionProps {
	setIsShowingExistingTransactions: (isShowingExistingTransactions: boolean) => void
	setShowOverview: (showOverview: boolean) => void
	currentStock: number
	organization: {
		id: string
		name: string
		photo: string
		organization_type: string
		uaid: string
		creation_year: number
		sync_id: string
		address_id: string
		admin_post: string
		district: string
		province: string
		village: string
	}
}

export default function AddOrganizationTransactions({
	currentStock,
	organization,
	setIsShowingExistingTransactions,
	setShowOverview,
}: AddOrganizationTransactionProps) {
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	const [showPreview, setShowPreview] = useState(false)
	const [customErrors, setCustomErrors] = useState<Record<string, string>>({})
	const [showInfoProviderModal, setShowInfoProviderModal] = useState(false)

	const {
		data: lastTransaction,
		isLoading: isLastTransactionLoading,
		error: lastTransactionError,
		isError: isLastTransactionError,
	} = useQueryOneAndWatchChanges<OrganizationTransactionRecord>(
		`SELECT end_date FROM ${TABLES.ORGANIZATION_TRANSACTIONS} WHERE store_id = $1 ORDER BY end_date DESC LIMIT 1`,
		[organization.id],
	)

	const { assertAggregatedInfo } = useAggregatedInfoStore()
	const { assertResoldInfo } = useResoldInfoStore()
	const { assertLostInfo } = useLostInfoStore()
	const { assertTransferredInfo } = useTransferredInfoStore()
	const { assertTransferredByOrgInfo } = useTransferredByOrgInfoStore()
	const { assertDateRange, startDate, endDate } = useDateRangeStore()
	const { infoProvider } = useInfoProviderStore()

	const assertAllInfo = () => {
		if (!infoProvider?.info_provider_id || !infoProvider?.info_provider_name) {
			setCustomErrors((prev) => ({ ...prev, infoProvider: 'Por favor, selecione o fornecedor de informações.' }))
			return false
		}
		const { status: transferredByOrgStatus, message: transferredByOrgMessage } = assertTransferredByOrgInfo()
		const {
			status: aggregatedStatus,
			message: aggregatedMessage,
			quantity: aggregatedQuantity,
		} = assertAggregatedInfo()
		const { status: resoldStatus, message: resoldMessage, quantity: resoldQuantity } = assertResoldInfo()
		const { status: lostStatus, message: lostMessage, quantity: lostQuantity } = assertLostInfo()
		const {
			status: transferredStatus,
			message: transferredMessage,
			quantity: transferredQuantity,
		} = assertTransferredInfo()
		const { status: dateRangeStatus, message: dateRangeMessage } = assertDateRange()

		let newErrors = { ...customErrors }

		// Clear infoProvider error if it was previously set
		if (newErrors.infoProvider) {
			newErrors.infoProvider = ''
		}

		if (!dateRangeStatus) {
			newErrors.dateRange = dateRangeMessage
		}

		// Validate that neither startDate nor endDate is less than lastTransactionEndDate
		if (lastTransaction?.end_date) {
			const lastTransactionEndDate = new Date(lastTransaction.end_date)
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			const lastDate = new Date(lastTransactionEndDate.getTime())
			lastDate.setHours(0, 0, 0, 0)

			// Check if lastTransactionEndDate is today - no new transactions allowed
			if (lastDate.getTime() === today.getTime()) {
				newErrors.dateMismatch =
					'Não é possível registar transacções quando a data da última monitoria é hoje. Aguarde até amanhã.'
			} else {
				const startDateInvalid = startDate && startDate < lastTransactionEndDate
				const endDateInvalid = endDate && endDate < lastTransactionEndDate

				if (startDateInvalid && endDateInvalid) {
					newErrors.dateMismatch =
						'As datas de início e fim devem ser posteriores ou iguais à data da última monitoria.'
				} else if (startDateInvalid) {
					newErrors.dateMismatch = 'A data de início deve ser posterior ou igual à data da última monitoria.'
				} else if (endDateInvalid) {
					newErrors.dateMismatch = 'A data de fim deve ser posterior ou igual à data da última monitoria.'
				}
			}
		}

		if (!resoldStatus) {
			newErrors.resold = resoldMessage
		}
		if (!lostStatus) {
			newErrors.lost = lostMessage
		}
		if (!transferredStatus) {
			newErrors.transferred = transferredMessage
		}

		const availableStock = currentStock + aggregatedQuantity
		const outgoingQuantity = resoldQuantity + lostQuantity + transferredQuantity

		if (availableStock < outgoingQuantity) {
			newErrors.outgoing = 'A quantidade transaccionada é maior que a quantidade disponível.'
		}

		if (!aggregatedStatus) {
			newErrors.aggregated = aggregatedMessage
		}
		if (aggregatedStatus) {
			newErrors.aggregated = aggregatedMessage
		}

		if (!transferredByOrgStatus) {
			newErrors.transferredByOrg = transferredByOrgMessage
		}
		if (transferredByOrgStatus) {
			newErrors.transferredByOrg = transferredByOrgMessage
		}

		setCustomErrors(newErrors)
		if (Object.values(newErrors).some((error) => error !== '')) {
			return false
		}
		return true
	}

	const onSubmit = () => {
		const isValid = assertAllInfo()
		if (isValid) {
			setShowPreview(true)
			setShowOverview(false)
		} else {
			console.log('customErrors', customErrors)
			setHasError(true)
			setErrorMessage('Por favor, verifique os campos obrigatórios.')
		}
	}

	return (
		<KeyboardAwareScrollView
			decelerationRate={'normal'}
			fadingEdgeLength={2}
			keyboardDismissMode="on-drag"
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
			scrollEventThrottle={16}
			contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 80 }}
			className="px-3 bg-white dark:bg-black"
		>
			<View className="bg-gray-50 dark:bg-gray-800 px-2 py-1  my-2 rounded-md">
				<Text className="text-right text-[#008000]">
					<Text className="text-[#008000] text-[20px] text-end font-bold">
						{Intl.NumberFormat('pt-BR').format(currentStock)}{' '}
					</Text>
					Kg.
				</Text>
				<Text className=" text-[12px] text-right italic text-gray-400">Estoque disponível</Text>
			</View>

			<View className="flex flex-col space-y-6">
				<DateRangeSelector
					customErrors={customErrors}
					setCustomErrors={setCustomErrors}
					lastTransactionEndDate={lastTransaction?.end_date ? new Date(lastTransaction.end_date) : null}
				/>
			</View>

			<View className="flex flex-col space-y-6">
				<AddInfoProviderInfo
					customErrors={customErrors}
					setCustomErrors={setCustomErrors}
					setShowInfoProviderModal={setShowInfoProviderModal}
					showInfoProviderModal={showInfoProviderModal}
					ownerId={organization.id as string}
					storeId={organization.id as string}
					storeType="GROUP"
				/>
			</View>

			<View className="flex flex-col space-y-6">
				{/* activeMember participations (quantity by member) for cooperative and association */}
				{organization?.organization_type !== OrganizationTypes.COOP_UNION && (
					<AddAggregatedInfo
						group_id={organization.id as string}
						customErrors={customErrors}
						setCustomErrors={setCustomErrors}
					/>
				)}

				{/* Resold Info */}
				<AddResoldInfo customErrors={customErrors} setCustomErrors={setCustomErrors} />

				{/* Transferred transaction only for cooperative and association */}
				{organization?.organization_type !== OrganizationTypes.COOP_UNION && (
					<AddTransferredByOrgInfo
						customErrors={customErrors}
						setCustomErrors={setCustomErrors}
						organizationId={organization.id as string}
					/>
				)}

				{/* Lost Info */}
				<AddLostInfo customErrors={customErrors} setCustomErrors={setCustomErrors} />

				{customErrors.outgoing && (
					<View className="flex-row justify-center items-center mt-4 bg-red-100 p-2 rounded-md">
						<Text className="text-red-500 text-[12px]">{customErrors.outgoing}</Text>
					</View>
				)}

				<View className="flex-row justify-center items-center mt-4">
					<SubmitButton title="Pré-visualizar" onPress={onSubmit} />
				</View>
			</View>

			<ErrorAlert
				visible={hasError}
				setVisible={setHasError}
				title=""
				message={errorMessage}
				setMessage={setErrorMessage}
			/>

			{showPreview && (
				<OrganizationTransactionDataPreview
					previewData={showPreview}
					setPreviewData={setShowPreview}
					organization={organization}
					setIsShowingExistingTransactions={setIsShowingExistingTransactions}
				/>
			)}
		</KeyboardAwareScrollView>
	)
}
