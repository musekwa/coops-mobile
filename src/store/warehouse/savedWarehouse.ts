import { create } from 'zustand'

import { CashewWarehouseType, TransactionDetailsType } from '../../types'
import { getCurrentStock } from 'src/helpers/helpersToTrades'

export type WarehouseDetailsType = {
	_id: string
	ownerId: string
	workerIds: string[]
	description?: string
	district: string
	province: string
	adminPost: string
	village?: string
	isActive: boolean
	warehouseType: CashewWarehouseType
	// geoCoordinates?: GeoCoordinates
	transactions: TransactionDetailsType[]
	permission: string
	updateDate?: Date
	createDate?: Date
}

export type SavedWarehouseStore = {
    // transaction details
    transactionList: TransactionDetailsType[]

    setTransactionList: (data: TransactionDetailsType[]) => void
    getTransactionList: () => TransactionDetailsType[]
    resetTransactionList: () => void
}

export const initialState: WarehouseDetailsType = {
	_id: '',
	ownerId: '',
	workerIds: [],
	description: '',
	district: '',
	province: '',
	adminPost: '',
	isActive: true,
	warehouseType: CashewWarehouseType.BUYING,
	transactions: [],
	permission: '',
}

export const useSavedWarehouseStore = create<SavedWarehouseStore>((set, get) => ({
    transactionList: [],

    setTransactionList: (data) => set({ transactionList: data }),
    getTransactionList: () => get().transactionList,
    resetTransactionList: () => set({ transactionList: [] }),

}))
