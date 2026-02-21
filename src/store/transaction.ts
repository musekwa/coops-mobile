import { create } from 'zustand'
import { TransactionDetailsType, TransactionFlowType } from '../types'
import { getCurrentStock } from 'src/helpers/helpersToTrades'

export type TransactionFormDataType = {
    startDate: Date
    endDate: Date
	lostQuantity: number
	hasLost: boolean
	quantityBought: number
	boughtPrice: number
	hasBought: boolean
	hasResold: boolean
	hasTransferred: boolean
	quantityResold: number
	resoldPrice: number
	quantityTransferred: number
	transferredWarehouseId: string
	transferredWarehouseLabel: string
	hasReceivedTransfer: boolean
	quantityReceived: number
	receivedFromWarehouseId: string
	receivedFromWarehouseLabel: string
	
	hasSentToExportation: boolean
	exportations: Array<{country: string, quantity: number}>
	quantitySentToExportation: number
	// sentToExportationLabel: string
	quantitySentToSmallScaleProcessing: number
	quantitySentToLargeScaleProcessing: number
	
	hasSentToProcessing: boolean
	quantitySentToProcessing: number
	// sentToProcessingLabel: string
	// purchases: Array<{sellerId: string, quantity: number, price: number}>
}

export type TransactionStore = {

	formData: TransactionFormDataType
	setFormData: (data: TransactionFormDataType) => void
	getFormData: () => TransactionFormDataType
	resetFormData: () => void
	validateFormData: (transactions: TransactionDetailsType[], data: TransactionFormDataType) => { [key: string]: string }
	updateFormData: (field: keyof TransactionFormDataType, value: string | number | Date | boolean) => void
}


export const initialState: TransactionFormDataType = {
	startDate: new Date(),
	endDate: new Date(),
	lostQuantity: 0,
	hasLost: false,
	quantityBought: 0,
	boughtPrice: 0,
	hasBought: false,
	hasResold: false,
	hasTransferred: false,
	quantityResold: 0,
	resoldPrice: 0,
	quantityTransferred: 0,
	transferredWarehouseId: '',
	transferredWarehouseLabel: '',
	hasReceivedTransfer: false,
	quantityReceived: 0,
	receivedFromWarehouseId: '',
	receivedFromWarehouseLabel: '',
	hasSentToExportation: false,
	quantitySentToExportation: 0,
	// sentToExportationLabel: '',
	hasSentToProcessing: false,
	quantitySentToSmallScaleProcessing: 0,
	quantitySentToLargeScaleProcessing: 0,
	quantitySentToProcessing: 0,
	// sentToProcessingLabel: '',
	// purchases: [],
	exportations: [],
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({


	formData: initialState,
	setFormData: (data) => set({ formData: data }),
	getFormData: () => get().formData,
	resetFormData: () =>
		set({
			formData: initialState,
		}),
	validateFormData: (transactions: TransactionDetailsType[], data: TransactionFormDataType) => {
		const {
			// startDate,
			// endDate,
			// boughtPrice,
			lostQuantity,
			quantityBought,
			quantityReceived,
			quantityResold,
			quantityTransferred,
			hasResold,
			hasTransferred,
			hasSentToProcessing,
			hasSentToExportation,
			// quantitySentToExportation,
			exportations,
			quantitySentToSmallScaleProcessing,
			quantitySentToLargeScaleProcessing,
		} = data
		let errors: { [key: string]: string } = {}

		// Calculate current stock from existing transactions
		const currentStock = getCurrentStock([])

		// Calculate new total stock
		const newTotalStock = currentStock + quantityBought + quantityReceived;

		if (hasSentToProcessing && (quantitySentToSmallScaleProcessing + quantitySentToLargeScaleProcessing) > newTotalStock) {
			errors = { ...errors, quantitySentToSmallScaleProcessing: 'Quantidade processada excede o estoque disponível' };
			errors = { ...errors, quantitySentToLargeScaleProcessing: 'Quantidade processada excede o estoque disponível' };
		}

		if (hasSentToProcessing && (quantitySentToSmallScaleProcessing + quantitySentToLargeScaleProcessing) === 0	) {
			errors = { ...errors, quantitySentToSmallScaleProcessing: 'Indicar a quantidade processada é obrigatório' };
			errors = { ...errors, quantitySentToLargeScaleProcessing: 'Indicar a quantidade processada' };
		}

		// Check if quantity lost exceeds available stock
		if (lostQuantity > newTotalStock) {
			errors = { ...errors, lostQuantity: 'Quantidade perdida excede o estoque disponível' };
		}

		// Check if there's enough stock for selling or transferring out
		if (hasResold && quantityResold > newTotalStock) {
			errors = { ...errors, quantityResold: 'Quantidade a vender excede o estoque disponível' };
		}

		if (hasTransferred && quantityTransferred > newTotalStock) {
			errors = { ...errors, quantityTransferred: 'Quantidade a transferir excede o estoque disponível' };
		}

		// Check if total outgoing quantity exceeds available stock
		if (hasResold && hasTransferred && (quantityResold + quantityTransferred > newTotalStock)) {
			errors = { ...errors, general: 'A soma das quantidades a vender e transferir excede o estoque disponível' };
		}

		if (hasSentToExportation && exportations.reduce((total, exportation) => total + exportation.quantity, 0) > newTotalStock) {
			errors = { ...errors, exportations: 'Quantidade a enviar excede o estoque disponível' };
		}

		if (hasSentToExportation && exportations.some((exportation) => exportation.quantity === 0)) {
			errors = { ...errors, exportations: 'Indicar as quantidades enviadas para exportação' };
		}


		return errors
	},
	updateFormData: (field, value) =>
		set((state) => ({
			formData: {
				...state.formData,
				[field]: value,
			},
		})),
}))     

