import { create } from 'zustand'
import { CashewWarehouseType } from 'src/types'


export type CashewWarehouseInfoType = {
	_id: string
    warehouseType: CashewWarehouseType | 'N/A'
    description: string
    village?: string
    adminPost: string
    district: string
    province: string

}

export type CashewWarehouseStore = {
	cashewWarehouseInfo: CashewWarehouseInfoType
	setCashewWarehouseInfo: (data: CashewWarehouseInfoType) => void
	getCashewWarehouseInfo: () => CashewWarehouseInfoType
	resetCashewWarehouseInfo: () => void
	validateCashewWarehouseInfo: () => { [key: string]: string }
	updateCashewWarehouseInfo: (field: keyof CashewWarehouseInfoType, value: string | boolean | string[]) => void

}

export const initialState: CashewWarehouseInfoType = {
	_id: '',
	warehouseType: 'N/A',
	description: '',
	village: '',
	province: '',
	district: '',
	adminPost: '',
}

export const useCashewWarehouseStore = create<CashewWarehouseStore>((set, get) => ({
	cashewWarehouseInfo: initialState,
	setCashewWarehouseInfo: (data) => set({ cashewWarehouseInfo: data }),
	getCashewWarehouseInfo: () => get().cashewWarehouseInfo,
	resetCashewWarehouseInfo: () =>
		set({
			cashewWarehouseInfo: initialState,
		}),
	validateCashewWarehouseInfo: () => {
		const {
			cashewWarehouseInfo: {
				warehouseType,
				description,
				province,
				district,
				adminPost,
				village,
			},
		} = get()

		let errors: { [key: string]: string } = {}
		// If province is empty or is undefined or null, cast the error message
		if (!province) {
			errors = {
				...errors,
				province: 'Indica a província do posto',
			}
		}

		if (!district && !province.toLowerCase().includes('cidade')) {
			errors = {
				...errors,
				district: 'Indica o distrito do posto',
			}
		}

		if (!district){
			errors = {
				...errors,
				district: 'Indica o distrito do posto',
			}
		}
		if (!province){
			errors = {
				...errors,
				province: 'Indica a província do posto',
			}
		}
		if (!adminPost) {
			errors = {
				...errors,
				adminPost: 'Indica o posto admin. ou "Não Aplicável".',
			}
		}

		if (!village) {
			errors = {
				...errors,
				village: 'Indica a localidade ou "Não Aplicável".',
			}
		}
		return errors
	},
	updateCashewWarehouseInfo: (field, value) =>
		set((state) => ({
			...state,
			cashewWarehouseInfo: {
				...state.cashewWarehouseInfo,
				[field]: value,
			},
		})),

	
}))
