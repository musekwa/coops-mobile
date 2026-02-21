import React, { useCallback, useState } from 'react'
import { View, Text } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { Checkbox } from 'react-native-paper'
import { TransactionFlowType } from 'src/types'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { CashewWarehouseTransactionRecord, UserDetailsRecord } from 'src/library/powersync/schemas/AppSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated'
import { TouchableOpacity } from 'react-native'
import { ReceivedTransactionItem } from 'src/features/trades/data/types'
import SubmitButton from '../../buttons/SubmitButton'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import { buildCashewWarehouseTransaction } from 'src/library/powersync/schemas/cashew_warehouse_transactions'
import { insertCashewWarehouseTransaction, updateOne } from 'src/library/powersync/sql-statements'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'
import AddInfoProviderInfo from './AddInfoProviderInfo'
import { useInfoProviderStore } from 'src/store/trades'
import FormItemDescription from '../FormItemDescription'
import TransactionCard from 'src/components/trades/shared/TransactionCard'
import TransactionShimmer from 'src/components/trades/shared/TransactionShimmer'
import { getWarehouseTypeLabel, getDescriptionString } from 'src/components/trades/shared/transaction-helpers'
const ReceivedInfoSchema = z.object({
	hasReceived: z.boolean(),
	receivedQuantity: z.number().optional(),
	confirmations: z.record(z.string(), z.boolean()),
})

type TransactionData = z.infer<typeof ReceivedInfoSchema>

interface AddReceivedInfoProps {
	storeType: 'WAREHOUSE' | 'GROUP'
	userDetails: UserDetailsRecord
	warehouseId: string
	transactions: ReceivedTransactionItem[]
}

const ConfirmationButtons = ({
	control,
	itemId,
	onConfirm,
}: {
	control: any
	itemId: string
	onConfirm: (confirmed: boolean) => void
}) => (
	<Controller
		control={control}
		name={`confirmations.${itemId}`}
		rules={{ required: 'Por favor, confirme esta transação' }}
		render={({ field: { onChange, value }, fieldState: { error } }) => (
			<View>
				<View className="flex flex-row space-x-4">
					<View className="flex-1">
						<TouchableOpacity
							onPress={() => {
								if (value !== true) {
									onChange(true)
									onConfirm(true)
								}
							}}
							className={`flex-row items-center space-x-2 p-1 rounded-lg border ${
								value === true
									? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
									: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700'
							}`}
						>
							<Checkbox
								status={value === true ? 'checked' : 'unchecked'}
								onPress={() => {
									if (value !== true) {
										onChange(true)
										onConfirm(true)
									}
								}}
								color={value === true ? '#059669' : '#6B7280'}
							/>
							<Text
								className={`text-sm font-medium ${
									value === true ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
								}`}
							>
								Sim
							</Text>
						</TouchableOpacity>
					</View>
					<View className="flex-1">
						<TouchableOpacity
							onPress={() => {
								if (value !== false) {
									onChange(false)
									onConfirm(false)
								}
							}}
							className={`flex-row items-center space-x-2 p-1 rounded-lg border ${
								value === false
									? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
									: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700'
							}`}
						>
							<Checkbox
								status={value === false ? 'checked' : 'unchecked'}
								onPress={() => {
									if (value !== false) {
										onChange(false)
										onConfirm(false)
									}
								}}
								color={value === false ? '#DC2626' : '#6B7280'}
							/>
							<Text
								className={`text-sm font-medium ${
									value === false ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
								}`}
							>
								Não
							</Text>
						</TouchableOpacity>
					</View>
				</View>
				{error && <Text className="text-xs text-red-500 mt-2 ml-1">{error.message}</Text>}
			</View>
		)}
	/>
)

const TransactionItem = ({
	item,
	index,
	control,
	onConfirm,
}: {
	item: ReceivedTransactionItem
	index: number
	control: any
	onConfirm: (confirmed: boolean) => void
}) => {
	const warehouseType = getWarehouseTypeLabel(item.cw_warehouse_type)
	const description = getDescriptionString(item)

	return (
		<TransactionCard
			index={index}
			quantity={item.quantity!}
			startDate={item.start_date!}
			endDate={item.end_date!}
			warehouseType={warehouseType}
			description={description}
			headerLabel="Recebimento"
			locationLabel="Proveniência"
		>
			<FormItemDescription description="Confirma ter recebido?" />
			<ConfirmationButtons control={control} itemId={item.id!} onConfirm={onConfirm} />
		</TransactionCard>
	)
}

export default function AddReceivedInfo({ storeType, userDetails, warehouseId, transactions }: AddReceivedInfoProps) {
	const {
		control,
		handleSubmit,
		formState: { errors, isValid, isDirty, isSubmitting, isSubmitSuccessful, submitCount },
		reset,
		resetField,
		getValues,
		setValue,
		watch,
		setError,
		clearErrors,
	} = useForm<TransactionData>({
		defaultValues: {
			hasReceived: false,
			receivedQuantity: undefined,
		},
		resolver: zodResolver(ReceivedInfoSchema),
	})
	const [confirmedTransactions, setConfirmedTransactions] = useState<CashewWarehouseTransactionRecord[]>([])
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [customErrors, setCustomErrors] = useState<Record<string, string>>({})
	const [showInfoProviderModal, setShowInfoProviderModal] = useState(false)
	const { infoProvider } = useInfoProviderStore()
	const [isLoading, setIsLoading] = useState(false)

	const onSubmit = async () => {
		if (!infoProvider?.info_provider_id || infoProvider.info_provider_id === 'N/A') {
			setHasError(true)
			setErrorMessage('Por favor, seleccione o trabalhador que está a fornecer as informações')
			setCustomErrors({
				infoProvider: 'Seleccione um trabalhador',
			})
			return
		}
		if (confirmedTransactions.length === 0) {
			setHasError(true)
			setErrorMessage('Nenhuma transação confirmada')
			return
		}
		try {
			setIsLoading(true)
			await Promise.all(
				confirmedTransactions.map(async (transaction) => {
					const transaction_row = buildCashewWarehouseTransaction({
						transaction_type: TransactionFlowType.TRANSFERRED_IN,
						quantity: transaction.quantity || 0,
						unit_price: 0,
						start_date: transaction.start_date ?? '',
						end_date: transaction.end_date ?? '',
						store_id: transaction.reference_store_id ?? '',
						created_by: userDetails?.full_name ?? '',
						confirmed: 'true',
						reference_store_id: transaction.store_id ?? '',
						destination: 'N/A',
						info_provider_id: infoProvider.info_provider_id,
						sync_id: userDetails?.district_id ?? '',
					})
					await insertCashewWarehouseTransaction(transaction_row)
					await updateOne(
						`UPDATE ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} 
                        SET 
                            confirmed = 'true', 
                            updated_at = ? 
                        WHERE id = ?`,
						[new Date().toISOString(), transaction.id],
					)
				}),
			)
		} catch (error) {
			setHasError(true)
			setErrorMessage('Erro ao gravar transações')
			console.error(error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleUpdateTransaction = useCallback(
		(item: ReceivedTransactionItem, confirmed: boolean) => {
			if (confirmed) {
				// Add or update transaction in confirmedTransactions
				const updatedTransaction = {
					...item,
					confirmed: 'true',
					updated_at: new Date().toISOString(),
					created_by: userDetails?.full_name,
					transaction_type: TransactionFlowType.TRANSFERRED_IN,
				} as CashewWarehouseTransactionRecord

				setConfirmedTransactions((prev) => {
					const exists = prev.find((t) => t.id === item.id)
					if (exists) {
						// Update existing transaction
						return prev.map((t) => (t.id === item.id ? updatedTransaction : t))
					}
					// Add new transaction
					return [...prev, updatedTransaction]
				})
			} else {
				// Remove transaction from confirmedTransactions if it exists
				setConfirmedTransactions((prev) => prev.filter((t) => t.id !== item.id))
			}
		},
		[userDetails],
	)

	// Show shimmer only when transactions is undefined (initial load)
	const isTransactionsLoading = transactions === undefined
	const isEmpty = !isLoading && transactions.length === 0

	if (isLoading || isTransactionsLoading) {
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
		<View className="flex-1">
			<Animated.ScrollView
				contentContainerStyle={{
					paddingLeft: 8,
					paddingBottom: 120,
					paddingTop: 0,
				}}
				showsVerticalScrollIndicator={false}
			>
				<AddInfoProviderInfo
					customErrors={customErrors}
					setCustomErrors={setCustomErrors}
					setShowInfoProviderModal={setShowInfoProviderModal}
					showInfoProviderModal={showInfoProviderModal}
					ownerId={transactions[0].cw_owner_id!}
					storeId={warehouseId}
					storeType={storeType}
				/>

				<View>
					{transactions.map((item, index) => (
						<Animated.View
							key={item.id}
							entering={FadeInDown.delay(index * 100).springify()}
							layout={LinearTransition.springify()}
						>
							<TransactionItem
								item={item}
								index={index}
								control={control}
								onConfirm={(confirmed) => handleUpdateTransaction(item, confirmed)}
							/>
						</Animated.View>
					))}

					<View className="py-4">
						<SubmitButton
							disabled={confirmedTransactions.length === 0}
							title="Gravar"
							onPress={onSubmit}
							isSubmitting={isLoading}
						/>
					</View>
				</View>
			</Animated.ScrollView>
			<ErrorAlert
				visible={hasError}
				setVisible={setHasError}
				message={errorMessage}
				setMessage={setErrorMessage}
				title="Erro"
			/>
		</View>
	)
}
