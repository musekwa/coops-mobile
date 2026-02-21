import { create } from 'zustand'

export type PreconditionsType = {
	ownerType: 'FARMER' | 'GROUP' | 'TRADER' | 'INFORMAL_TRADER' | 'OTHER'
	subKeys: Array<{
		key: 'isFinalTrader' | 'isTraderACompany' | 'isCommercialFarmer' | 'hasTransitLicense'
		value: boolean
	}>
}

export type PreconditionsStore = {
	preconditions: PreconditionsType
	setOwnerType: (value: PreconditionsType['ownerType']) => void
	setSubKeys: (
		value: PreconditionsType['subKeys'][number]['value'],
		key: PreconditionsType['subKeys'][number]['key'],
	) => void
	resetPreconditions: () => void
	validatePreconditions: () => { isValid: boolean; message: string }
}

export const initialState: PreconditionsType = {
	ownerType: 'OTHER',
	subKeys: [],
}

export const usePreconditionsStore = create<PreconditionsStore>((set, get) => ({
	preconditions: initialState,
	setOwnerType: (value) => set({ preconditions: { ...get().preconditions, ownerType: value } }),
	setSubKeys: (value, key) => {
		const currentSubKeys = get().preconditions.subKeys
		const existingSubKeyIndex = currentSubKeys.findIndex((subKey) => subKey.key === key)

		let newSubKeys
		if (existingSubKeyIndex >= 0) {
			// Update existing subKey
			newSubKeys = currentSubKeys.map((subKey, index) =>
				index === existingSubKeyIndex ? { ...subKey, value } : subKey,
			)
		} else {
			// Add new subKey
			newSubKeys = [...currentSubKeys, { key, value }]
		}

		set({ preconditions: { ...get().preconditions, subKeys: newSubKeys } })
	},
	resetPreconditions: () =>
		set({
			preconditions: initialState,
		}),

	validatePreconditions: () => {
		const preconditions = get().preconditions
		if (
			(preconditions.ownerType === 'TRADER' ||
				preconditions.ownerType === 'FARMER' ||
				preconditions.ownerType === 'GROUP') &&
			!preconditions.subKeys.find((subKey) => subKey.key === 'hasTransitLicense')?.value
		) {
			return {
				isValid: false,
				message: 'O proprietário desta mercadoria deveria ter uma Guia de Trânsito.',
			}
		}
		if (preconditions.ownerType === 'INFORMAL_TRADER') {
			return {
				isValid: true,
				message: '',
			}
		}
		if (preconditions.ownerType === 'OTHER') {
			return {
				isValid: false,
				message: 'Indica a categoria do proprietário.',
			}
		}
		return {
			isValid: true,
			message: '',
		}
	},
}))
