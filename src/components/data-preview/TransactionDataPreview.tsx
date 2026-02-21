import React, { useCallback, useState } from 'react'
import { View, Text, Modal, ScrollView, StyleSheet } from 'react-native'

import { colors } from 'src/constants'
import ConfirmOrCancelButtons from '../buttons/ConfirmOrCancelButtons'
import FormFieldPreview from './FormFieldPreview'
import { errorMessages } from 'src/constants/errorMessages'
import { Divider } from 'react-native-paper'
import { CashewFactoryType, TransactionFlowType } from 'src/types'
import { WarehouseWithAddressAndOwnerAndContact } from 'src/features/trades/data/types'
import {
	useBoughtInfoStore,
	useDateRangeStore,
	useResoldInfoStore,
	useTransferredInfoStore,
	useExportationInfoStore,
	useProcessingInfoStore,
	useLostInfoStore,
	useInfoProviderStore,
} from 'src/store/trades'
import { buildCashewWarehouseTransaction } from 'src/library/powersync/schemas/cashew_warehouse_transactions'
import { insertCashewWarehouseTransaction } from 'src/library/powersync/sql-statements'
import { useUserDetails } from 'src/hooks/queries'
import ErrorAlert from '../dialogs/ErrorAlert'
interface TransactionDataPreviewProps {
	previewData: boolean
	setPreviewData: (visible: boolean) => void
	warehouse: WarehouseWithAddressAndOwnerAndContact
	setIsShowingExistingTransactions: (isShowingExistingTransactions: boolean) => void
}

export default function TransactionDataPreview({
	previewData,
	setPreviewData,
	warehouse,
	setIsShowingExistingTransactions,
}: TransactionDataPreviewProps) {
	const { startDate, endDate } = useDateRangeStore()
	const { boughtPrice, quantityBought, hasBought, resetBoughtInfo } = useBoughtInfoStore()
	const { hasResold, quantityResold, resoldPrice, resetResoldInfo } = useResoldInfoStore()
	const { hasTransferred, transfersWarehouses, resetTransferredInfo } = useTransferredInfoStore()
	const { hasSentToExportation, exportations, resetExportationInfo } = useExportationInfoStore()
	const { hasSentToProcessing, processingWarehouses, resetProcessingInfo } = useProcessingInfoStore()
	const { hasLost, quantityLost, resetLostInfo } = useLostInfoStore()
	const { infoProvider, resetInfoProvider } = useInfoProviderStore()
	const [isSaving, setIsSaving] = useState<boolean>(false)
	const { userDetails } = useUserDetails()
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	//   Add new transactions
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
			setErrorMessage('Por favor, selecione um fornecedor de informação')
			return
		}
		try {
			setIsSaving(true)
			if (hasBought) {
				const newBoughtTransaction = buildCashewWarehouseTransaction({
					store_id: warehouse.id,
					transaction_type: TransactionFlowType.BOUGHT,
					quantity: quantityBought,
					unit_price: boughtPrice,
					start_date: startDate!.toISOString(),
					end_date: endDate!.toISOString(),
					confirmed: 'true',
					info_provider_id: infoProvider?.info_provider_id,
					destination: 'N/A',
					reference_store_id: warehouse.id,
					created_by: createdBy,
					sync_id: syncId,
				})
				await insertCashewWarehouseTransaction(newBoughtTransaction)
			}

			if (hasResold) {
				const newResoldTransaction = buildCashewWarehouseTransaction({
					store_id: warehouse.id,
					transaction_type: TransactionFlowType.SOLD,
					quantity: quantityResold,
					unit_price: resoldPrice,
					start_date: startDate!.toISOString(),
					end_date: endDate!.toISOString(),
					confirmed: 'true',
					info_provider_id: infoProvider?.info_provider_id,
					destination: 'N/A',
					reference_store_id: warehouse.id,
					created_by: createdBy,
					sync_id: syncId,
				})
				await insertCashewWarehouseTransaction(newResoldTransaction)
			}

			if (hasTransferred) {
				transfersWarehouses.forEach(async (w) => {
					const newTransferredTransaction = buildCashewWarehouseTransaction({
						store_id: warehouse.id,
						transaction_type: TransactionFlowType.TRANSFERRED_OUT,
						quantity: w.quantity,
						unit_price: 0,
						start_date: startDate!.toISOString(),
						end_date: endDate!.toISOString(),
						confirmed: 'false',
						info_provider_id: infoProvider?.info_provider_id,
						destination: 'N/A',
						reference_store_id: w.warehouse_id,
						created_by: createdBy,
						sync_id: syncId,
					})
					await insertCashewWarehouseTransaction(newTransferredTransaction)
				})
			}

			if (hasSentToExportation) {
				exportations.forEach(async (e) => {
					const newExportedTransaction = buildCashewWarehouseTransaction({
						store_id: warehouse.id,
						transaction_type: TransactionFlowType.EXPORTED,
						quantity: e.quantity,
						unit_price: 0,
						start_date: startDate!.toISOString(),
						end_date: endDate!.toISOString(),
						confirmed: 'true',
						info_provider_id: infoProvider?.info_provider_id,
						destination: e.country,
						reference_store_id: warehouse.id,
						created_by: createdBy,
						sync_id: syncId,
					})
					insertCashewWarehouseTransaction(newExportedTransaction)
				})
			}

			if (hasSentToProcessing) {
				processingWarehouses.forEach(async (w) => {
					const newProcessedTransaction = buildCashewWarehouseTransaction({
						store_id: warehouse.id,
						transaction_type: TransactionFlowType.PROCESSED,
						quantity: w.quantity,
						unit_price: 0,
						start_date: startDate!.toISOString(),
						end_date: endDate!.toISOString(),
						confirmed: 'true',
						info_provider_id: infoProvider?.info_provider_id,
						destination: 'N/A',
						reference_store_id: w.warehouse_id,
						created_by: createdBy,
						sync_id: syncId,
					})
					await insertCashewWarehouseTransaction(newProcessedTransaction)
				})
			}

			if (hasLost) {
				const newLostTransaction = buildCashewWarehouseTransaction({
					store_id: warehouse.id,
					transaction_type: TransactionFlowType.LOST,
					quantity: quantityLost,
					unit_price: 0,
					start_date: startDate!.toISOString(),
					end_date: endDate!.toISOString(),
					confirmed: 'true',
					info_provider_id: infoProvider?.info_provider_id,
					destination: 'N/A',
					reference_store_id: warehouse.id,
					created_by: createdBy,
					sync_id: syncId,
				})
				await insertCashewWarehouseTransaction(newLostTransaction)
			}

			setPreviewData(false)
			setIsShowingExistingTransactions(true)
			resetBoughtInfo()
			resetResoldInfo()
			resetTransferredInfo()
			resetExportationInfo()
			resetProcessingInfo()
			resetLostInfo()
			resetInfoProvider()
			// Add destinations for small scale and large scale processings
		} catch (error) {
			console.log(error)
			setHasError(true)
			setErrorMessage(errorMessages.failedToSave)
		} finally {
			// setTimeout(() => {
			setIsSaving(false)
			// }, 500)
		}
	}, [
		hasBought,
		hasResold,
		hasTransferred,
		hasSentToExportation,
		hasSentToProcessing,
		hasLost,
		startDate,
		endDate,
		quantityBought,
		boughtPrice,
		quantityResold,
		resoldPrice,
		transfersWarehouses,
		exportations,
		processingWarehouses,
		quantityLost,
		userDetails,
		resetBoughtInfo,
		resetResoldInfo,
		resetTransferredInfo,
		resetExportationInfo,
		resetProcessingInfo,
		resetLostInfo,
		resetInfoProvider,
	])

	return (
		<Modal
			visible={previewData}
			transparent={false}
			style={styles.fullScreen}
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
					className="h-full p-3  bg-white dark:bg-black"
					showsVerticalScrollIndicator={false}
				>
					<View className="space-y-3 py-3">
						<FormFieldPreview title="Data de início:" value={new Date(startDate!).toLocaleDateString('pt-BR')} />
						<FormFieldPreview title="Até:" value={new Date(endDate!).toLocaleDateString('pt-BR')} />
					</View>
					<Divider />
					<View className="space-y-3 py-3">
						<FormFieldPreview title="Comprou castanha?" value={hasBought ? 'Sim' : 'Não'} />
						{hasBought && (
							<View>
								<FormFieldPreview
									title="Quantidade total comprada:"
									value={`${Intl.NumberFormat('pt-BR').format(quantityBought)} Kg`}
								/>
								<FormFieldPreview
									title="Preço médio ponderado de compra:"
									value={`${boughtPrice.toFixed(2)} MZN / Kg`}
								/>
							</View>
						)}
					</View>

					<Divider />
					<View className="space-y-3 py-3">
						<FormFieldPreview title="Revendeu castanha?" value={hasResold ? 'Sim' : 'Não'} />
						{hasResold && (
							<View>
								<FormFieldPreview
									title="Quantidade revendida:"
									value={`${Intl.NumberFormat('pt-BR').format(quantityResold)} Kg`}
								/>
								<FormFieldPreview title="Preço de revenda por Kg:" value={`${resoldPrice.toFixed(2)} MZN / Kg`} />
							</View>
						)}
					</View>

					<Divider />
					<View className="space-y-3 py-3">
						<FormFieldPreview title="Transferiu castanha?" value={hasTransferred ? 'Sim' : 'Não'} />
						{hasTransferred &&
							transfersWarehouses.length > 0 &&
							transfersWarehouses.map((w) => (
								<View key={w.warehouse_id}>
									<FormFieldPreview
										title="Quantidade transferida:"
										value={`${Intl.NumberFormat('pt-BR').format(w.quantity)} Kg`}
									/>
									<FormFieldPreview title="Armazém de destino:" value={w.warehouse_label} />
									{w !== transfersWarehouses[transfersWarehouses.length - 1] && <Divider />}
								</View>
							))}
					</View>

					<Divider />
					<View className="space-y-3 py-3">
						<FormFieldPreview title="Enviou castanha para exportação?" value={hasSentToExportation ? 'Sim' : 'Não'} />

						{hasSentToExportation &&
							exportations.length > 0 &&
							exportations.map((e) => (
								<View key={e.country}>
									<FormFieldPreview
										title="Quantidade exportada:"
										value={`${Intl.NumberFormat('pt-BR').format(e.quantity)} Kg`}
									/>
									<FormFieldPreview title="País de destino:" value={e.country} />
									{e !== exportations[exportations.length - 1] && <Divider />}
								</View>
							))}
					</View>
					<Divider />
					<View className="space-y-3 py-3">
						<FormFieldPreview title="Enviou castanha para processamento?" value={hasSentToProcessing ? 'Sim' : 'Não'} />
						{hasSentToProcessing &&
							processingWarehouses.length > 0 &&
							processingWarehouses.map((w) => (
								<View key={w.warehouse_id}>
									<FormFieldPreview
										title="Quantidade enviada para processamento:"
										value={`${Intl.NumberFormat('pt-BR').format(w.quantity)} Kg`}
									/>
									<FormFieldPreview
										title={
											w.warehouse_type === CashewFactoryType.SMALL_SCALE
												? `Fabriqueta de destino: ${w.warehouse_label}`
												: `Fábrica de destino: ${w.warehouse_label}`
										}
										value={w.warehouse_label}
									/>
									{w !== processingWarehouses[processingWarehouses.length - 1] && <Divider />}
								</View>
							))}
					</View>

					<Divider />
					<View className="space-y-3 py-3">
						<FormFieldPreview title="Teve desperdício da castanha?" value={hasLost ? 'Sim' : 'Não'} />
						{hasLost && (
							<View>
								<FormFieldPreview
									title="Quantidade desperdiçada:"
									value={`${Intl.NumberFormat('pt-BR').format(quantityLost)} Kg`}
								/>
							</View>
						)}
					</View>
					<ConfirmOrCancelButtons
						onCancel={() => setPreviewData(false)}
						onConfirm={addNewTransactions}
						isLoading={isSaving}
					/>
				</ScrollView>
			</View>
			<ErrorAlert
				visible={hasError}
				title="Erro ao inserir dados"
				message={errorMessage}
				setMessage={setErrorMessage}
				setVisible={setHasError}
			/>
		</Modal>
	)
}
const styles = StyleSheet.create({
	fullScreen: {
		backgroundColor: colors.black,
	},
})
