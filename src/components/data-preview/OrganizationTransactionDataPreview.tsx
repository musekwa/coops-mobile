import { View, Text } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Modal } from 'react-native'
import { ScrollView } from 'react-native'
import FormFieldPreview from './FormFieldPreview'
import { Divider } from 'react-native-paper'
import ConfirmOrCancelButtons from '../buttons/ConfirmOrCancelButtons'
import { StyleSheet } from 'react-native'
import { colors } from 'src/constants'
import { TransactionFlowType } from 'src/types'
import { useUserDetails } from 'src/hooks/queries'
import {
	useResoldInfoStore,
	useLostInfoStore,
	useAggregatedInfoStore,
	useTransferredByOrgInfoStore,
	useInfoProviderStore,
} from 'src/store/trades'
import { useDateRangeStore } from 'src/store/trades'
import Spinner from '../loaders/Spinner'
import { buildOrganizationTransaction } from 'src/library/powersync/schemas/organization_transactions'
import { buildOrganizationTransactionParticipant } from 'src/library/powersync/schemas/organization_transaction_participants'
import {
	insertOrganizationTransaction,
	insertOrganizationTransactionParticipant,
} from 'src/library/powersync/sql-statements'
import ErrorAlert from '../dialogs/ErrorAlert'
interface OrganizationTransactionDataPreviewProps {
	previewData: boolean
	setPreviewData: (value: boolean) => void
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
	setIsShowingExistingTransactions: (value: boolean) => void
}

export default function OrganizationTransactionDataPreview({
	previewData,
	setPreviewData,
	organization,
	setIsShowingExistingTransactions,
}: OrganizationTransactionDataPreviewProps) {
	const { startDate, endDate } = useDateRangeStore()

	const { hasResold, quantityResold, resoldPrice, resetResoldInfo } = useResoldInfoStore()
	const { hasAggregated, activeParticipantParticipations, resetAggregatedInfo } = useAggregatedInfoStore()
	const { hasTransferredByOrg, transfersOrganizations, resetTransferredByOrgInfo } = useTransferredByOrgInfoStore()
	const { hasLost, quantityLost, resetLostInfo } = useLostInfoStore()
	const { infoProvider, resetInfoProvider } = useInfoProviderStore()
	const [isSaving, setIsSaving] = useState<boolean>(false)
	const { userDetails } = useUserDetails()
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	const addNewTransactions = useCallback(async () => {
		const createdBy = userDetails?.full_name
		const syncId = userDetails?.district_id
		if (!createdBy || !syncId) {
			setHasError(true)
			setErrorMessage('Por favor, verifique os dados do usuário')
			return
		}
		if (!infoProvider?.info_provider_id) {
			setHasError(true)
			setErrorMessage('Por favor, verifique os dados do fornecedor de informação')
			return
		}
		try {
			setIsSaving(true)
			if (hasResold) {
				const newOrganizationTransaction = buildOrganizationTransaction({
					transaction_type: TransactionFlowType.SOLD,
					quantity: quantityResold,
					unit_price: resoldPrice,
					start_date: startDate!.toISOString(),
					end_date: endDate!.toISOString(),
					store_id: organization.id,
					confirmed: 'true',
					info_provider_id: infoProvider?.info_provider_id,
					reference_store_id: organization.id,
					created_by: createdBy,
					updated_by: createdBy,
					sync_id: syncId,
				})
				await insertOrganizationTransaction(newOrganizationTransaction)
			}

			if (hasAggregated) {
				const newAggregatedTransaction = buildOrganizationTransaction({
					transaction_type: TransactionFlowType.AGGREGATED,
					quantity: activeParticipantParticipations.reduce((acc, curr) => acc + curr.quantity, 0),
					unit_price: 0,
					start_date: startDate!.toISOString(),
					end_date: endDate!.toISOString(),
					confirmed: 'true',
					info_provider_id: infoProvider?.info_provider_id,
					reference_store_id: organization.id,
					created_by: createdBy,
					updated_by: createdBy,
					sync_id: syncId,
					store_id: organization.id,
				})

				// First insert the transaction and wait for it to complete
				const transactionResult = await insertOrganizationTransaction(newAggregatedTransaction)

				// Only proceed with participant creation if transaction was successful

				if (transactionResult && newAggregatedTransaction?.id) {
					// Add a small delay to allow PowerSync to sync the transaction before inserting participants
					// This prevents foreign key violations when the participant syncs before the transaction
					await new Promise((resolve) => setTimeout(resolve, 500))

					// Create participants one by one to ensure proper order
					for (const participation of activeParticipantParticipations) {
						const newAggregatedTransactionParticipant = buildOrganizationTransactionParticipant({
							transaction_id: newAggregatedTransaction.id,
							quantity: participation.quantity,
							participant_id: participation.participant_id,
							participant_type: participation.participant_type,
							sync_id: syncId,
						})
						await insertOrganizationTransactionParticipant(newAggregatedTransactionParticipant)
					}
				} else {
					throw new Error('Failed to insert organization transaction')
				}
			}

			if (hasTransferredByOrg) {
				transfersOrganizations.map(async (transfer) => {
					const newTransferredTransaction = buildOrganizationTransaction({
						transaction_type: TransactionFlowType.TRANSFERRED_OUT,
						quantity: transfer.quantity,
						unit_price: 0,
						start_date: startDate!.toISOString(),
						end_date: endDate!.toISOString(),
						confirmed: 'false',
						info_provider_id: infoProvider?.info_provider_id,
						reference_store_id: transfer.group_id,
						created_by: createdBy,
						updated_by: createdBy,
						sync_id: syncId,
						store_id: organization.id,
					})
					await insertOrganizationTransaction(newTransferredTransaction)
				})
			}

			if (hasLost) {
				const newLostTransaction = buildOrganizationTransaction({
					transaction_type: TransactionFlowType.LOST,
					quantity: quantityLost,
					unit_price: 0,
					start_date: startDate!.toISOString(),
					end_date: endDate!.toISOString(),
					confirmed: 'true',
					info_provider_id: infoProvider?.info_provider_id,
					reference_store_id: organization.id,
					created_by: createdBy,
					updated_by: createdBy,
					sync_id: syncId,
					store_id: organization.id,
				})
				await insertOrganizationTransaction(newLostTransaction)
			}

			setPreviewData(false)
			setIsShowingExistingTransactions(true)
			resetResoldInfo()
			resetAggregatedInfo()
			resetTransferredByOrgInfo()
			resetLostInfo()
			resetInfoProvider()
		} catch (error) {
			console.log('Error inserting organization transaction', error)
			setHasError(true)
			setErrorMessage('Erro ao inserir dados')
		} finally {
			setIsSaving(false)
		}
	}, [
		hasResold,
		quantityResold,
		resoldPrice,
		startDate,
		endDate,
		organization,
		userDetails,
		activeParticipantParticipations,
		transfersOrganizations,
		quantityLost,
		resetResoldInfo,
		resetAggregatedInfo,
		resetTransferredByOrgInfo,
		resetLostInfo,
		resetInfoProvider,
	])

	return (
		<Modal
			visible={previewData}
			transparent={false}
			style={styles.fullScreen}
			animationType="slide"
			onRequestClose={() => setPreviewData(false)}
		>
			<View className="flex flex-col justify-between h-full p-3 bg-white dark:bg-black">
				<View className="h-16 flex flex-row justify-between space-x-2 ">
					<View className="flex-1 items-center justify-center">
						<Text className="text-[16px] font-bold text-black dark:text-white ">Confirmar Dados</Text>
					</View>
				</View>

				<ScrollView
					contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 80 }}
					className="p-3  bg-white dark:bg-black"
					showsVerticalScrollIndicator={false}
				>
					<View className="space-y-3 py-3">
						<FormFieldPreview title="Data de início:" value={new Date(startDate!).toLocaleDateString('pt-BR')} />
						<FormFieldPreview title="Até:" value={new Date(endDate!).toLocaleDateString('pt-BR')} />
					</View>
					<Divider />

					{/* Aggregated Info */}
					<View className="space-y-3 py-3">
						<FormFieldPreview title="Houve agregação?" value={hasAggregated ? 'Sim' : 'Não'} />
						{hasAggregated && (
							<View>
								<FormFieldPreview
									title="Quantidade total agregada:"
									value={`${Intl.NumberFormat('pt-BR').format(activeParticipantParticipations.reduce((acc, curr) => acc + curr.quantity, 0) || 0)} Kg`}
								/>
							</View>
						)}
					</View>
					<Divider />
					<View className="space-y-3 py-3">
						<FormFieldPreview title="Vendeu castanha?" value={hasResold ? 'Sim' : 'Não'} />
						{hasResold && (
							<View>
								<FormFieldPreview
									title="Quantidade total vendida:"
									value={`${Intl.NumberFormat('pt-BR').format(quantityResold || 0)} Kg`}
								/>
								<FormFieldPreview
									title="Preço médio ponderado de venda:"
									value={`${resoldPrice?.toFixed(2) || 0} MZN / Kg`}
								/>
							</View>
						)}
					</View>
					<Divider />

					<View className="space-y-3 py-3">
						<FormFieldPreview title="Transferiu castanha para a união?" value={hasTransferredByOrg ? 'Sim' : 'Não'} />
						{hasTransferredByOrg && (
							<View>
								<FormFieldPreview
									title="Quantidade total transferida:"
									value={`${Intl.NumberFormat('pt-BR').format(transfersOrganizations.reduce((acc, curr) => acc + curr.quantity, 0) || 0)} Kg`}
								/>
							</View>
						)}
					</View>
					<Divider />

					<View className="space-y-3 py-3">
						<FormFieldPreview title="Teve desperdício de castanha?" value={hasLost ? 'Sim' : 'Não'} />
						{hasLost && (
							<FormFieldPreview
								title="Quantidade total desperdiçada:"
								value={`${Intl.NumberFormat('pt-BR').format(quantityLost || 0)} Kg`}
							/>
						)}
					</View>
					<Divider />
					<ConfirmOrCancelButtons
						onCancel={() => setPreviewData(false)}
						onConfirm={addNewTransactions}
						isLoading={isSaving}
						onConfirmDisabled={isSaving}
						onCancelDisabled={isSaving}
					/>
				</ScrollView>
			</View>
			<ErrorAlert
				setVisible={setHasError}
				visible={hasError}
				title="Erro ao inserir dados"
				message={errorMessage}
				setMessage={setErrorMessage}
			/>
		</Modal>
	)
}

const styles = StyleSheet.create({
	fullScreen: {
		backgroundColor: colors.black,
	},
})
