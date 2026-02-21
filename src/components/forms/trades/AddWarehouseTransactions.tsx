import React, { useState } from 'react'
import { View } from 'react-native'

import SubmitButton from 'src/components/buttons/SubmitButton'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import TransactionDataPreview from 'src/components/data-preview/TransactionDataPreview'
import DateRangeSelector from 'src/components/dates/DateRangeSelector'
import { WarehouseWithAddressAndOwnerAndContact } from 'src/features/trades/data/types'
import { useQueryOneAndWatchChanges } from 'src/hooks/queries'
import { CashewWarehouseTransactionRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import AddBoughtInfo from './AddBoughtInfo'
import AddResoldInfo from './AddResoldInfo'
import AddTransferredInfo from './AddTransferredInfo'
import AddExportedInfo from './AddExportedInfo'
import AddProcessedInfo from './AddProcessedInfo'
import AddLostInfo from './AddLostInfo'
import {
	useBoughtInfoStore,
	useDateRangeStore,
	useExportationInfoStore,
	useInfoProviderStore,
	useLostInfoStore,
	useProcessingInfoStore,
	useResoldInfoStore,
	useTransferredInfoStore,
} from 'src/store/trades'
import { Text } from 'react-native'
import { CashewWarehouseType } from 'src/types'
import AddInfoProviderInfo from './AddInfoProviderInfo'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import { useColorScheme } from 'nativewind'

interface AddWarehouseTransactionProps {
	currentStock: number
	warehouse: {
		id: string
		description: string
		warehouse_type: string
		is_active: string
		owner_id: string
		address_id: string
	}
	setIsShowingExistingTransactions: (isShowingExistingTransactions: boolean) => void
	setShowOverview: (showOverview: boolean) => void
}

export default function AddWarehouseTransactions({
	currentStock,
	warehouse,
	setIsShowingExistingTransactions,
	setShowOverview,
}: AddWarehouseTransactionProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const backgroundColor = isDarkMode ? 'black' : 'white'
	const { assertDateRange } = useDateRangeStore()
	const { assertBoughtInfo } = useBoughtInfoStore()
	const { assertResoldInfo } = useResoldInfoStore()
	const { assertExportationInfo } = useExportationInfoStore()
	const { assertProcessingInfo } = useProcessingInfoStore()
	const { assertLostInfo } = useLostInfoStore()
	const { assertTransferredInfo } = useTransferredInfoStore()
	const { startDate, endDate } = useDateRangeStore()
	const { infoProvider } = useInfoProviderStore()
	const [customErrors, setCustomErrors] = useState<Record<string, string>>({})
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [showPreview, setShowPreview] = useState(false)
	const [showInfoProviderModal, setShowInfoProviderModal] = useState(false)

	const {
		data: lastTransaction,
		isLoading: isLastTransactionLoading,
		error: lastTransactionError,
		isError: isLastTransactionError,
	} = useQueryOneAndWatchChanges<CashewWarehouseTransactionRecord>(
		`SELECT end_date FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} WHERE store_id = $1 ORDER BY end_date DESC LIMIT 1`,
		[warehouse.id],
	)

	const assertAllInfo = () => {
		if (!infoProvider?.info_provider_id || !infoProvider?.info_provider_name) {
			setCustomErrors((prev) => ({ ...prev, infoProvider: 'Por favor, selecione o fornecedor de informações.' }))
			return false
		}

		const { status: boughtStatus, message: boughtMessage, quantity: boughtQuantity } = assertBoughtInfo()
		const { status: resoldStatus, message: resoldMessage, quantity: resoldQuantity } = assertResoldInfo()
		const { status: exportedStatus, message: exportedMessage, quantity: exportedQuantity } = assertExportationInfo()
		const { status: processedStatus, message: processedMessage, quantity: processedQuantity } = assertProcessingInfo()
		const { status: lostStatus, message: lostMessage, quantity: lostQuantity } = assertLostInfo()
		const {
			status: transferredStatus,
			message: transferredMessage,
			quantity: transferredQuantity,
		} = assertTransferredInfo()
		const { status: dateRangeStatus, message: dateRangeMessage } = assertDateRange()

		let newErrors: Record<string, string> = {}

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

		if (!boughtStatus) {
			newErrors.bought = boughtMessage
		}
		if (!resoldStatus) {
			newErrors.resold = resoldMessage
		}
		if (!exportedStatus) {
			newErrors.exported = exportedMessage
		}
		if (!processedStatus) {
			newErrors.processed = processedMessage
		}
		if (!lostStatus) {
			newErrors.lost = lostMessage
		}
		if (!transferredStatus) {
			newErrors.transferred = transferredMessage
		}

		const availableStock = currentStock + boughtQuantity
		const outgoingQuantity = resoldQuantity + exportedQuantity + processedQuantity + lostQuantity + transferredQuantity

		if (availableStock < outgoingQuantity) {
			newErrors.outgoing = 'A quantidade transaccionada é maior que a quantidade disponível.'
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
			contentContainerStyle={{
				flexGrow: 1,
				justifyContent: 'center',
				paddingBottom: 80,
				paddingHorizontal: 15,
				backgroundColor: backgroundColor,
			}}
		>	
			<View className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
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
					lastTransactionEndDate={lastTransaction?.end_date ? new Date(lastTransaction.end_date) : null}
					customErrors={customErrors}
					setCustomErrors={setCustomErrors}
				/>
			</View>
			{/* Info Provider Selection */}
			<AddInfoProviderInfo
				customErrors={customErrors}
				setCustomErrors={setCustomErrors}
				setShowInfoProviderModal={setShowInfoProviderModal}
				showInfoProviderModal={showInfoProviderModal}
				ownerId={warehouse.owner_id}
				storeId={warehouse.id}
				storeType="WAREHOUSE"
			/>
			<View className="flex flex-col space-y-6">
				{/* Bought Info */}
				<AddBoughtInfo customErrors={customErrors} setCustomErrors={setCustomErrors} />

				{/* Resold Info */}
				<AddResoldInfo customErrors={customErrors} setCustomErrors={setCustomErrors} />

				{/* Transferred Info */}
				<AddTransferredInfo
					currentWarehouseId={warehouse.id}
					ownerId={warehouse.owner_id}
					customErrors={customErrors}
					setCustomErrors={setCustomErrors}
				/>

				{warehouse.warehouse_type !== CashewWarehouseType.BUYING && (
					<>
						{/* Exported Info */}
						<AddExportedInfo customErrors={customErrors} setCustomErrors={setCustomErrors} />

						{/* Processed Info */}
						<AddProcessedInfo customErrors={customErrors} setCustomErrors={setCustomErrors} />
					</>
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
				<TransactionDataPreview
					previewData={showPreview}
					setPreviewData={setShowPreview}
					warehouse={warehouse as WarehouseWithAddressAndOwnerAndContact}
					setIsShowingExistingTransactions={setIsShowingExistingTransactions}
				/>
			)}
		</KeyboardAwareScrollView>
	)
}