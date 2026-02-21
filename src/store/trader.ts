import { create } from 'zustand'
import { TraderType, TradingPurpose } from '../types'

export type TraderFormDataType = {
	surname: string
	otherNames: string
	birthDate?: Date
	primaryPhone?: string
	secondaryPhone?: string

	traderType?: string
	purposes?: string[]

	nuit?: string
	license?: string
	licenseType?: string
	nuel?: string
}

export type TraderStore = {
	formData: TraderFormDataType
	setFormData: (data: TraderFormDataType) => void
	getFormData: () => TraderFormDataType
	resetFormData: () => void
	validateFormData: () => { [key: string]: string }
	updateFormData: (field: keyof TraderFormDataType, value: string | number | Date | boolean) => void
}

export const initialState: TraderFormDataType = {
	surname: '',
	otherNames: '',
	birthDate: new Date(),
	primaryPhone: undefined,
	secondaryPhone: undefined,
	traderType: '',
	purposes: [],

	nuit: undefined,
	license: '',
	licenseType: '',
	nuel: '',
}

export const useTraderStore = create<TraderStore>((set, get) => ({
	// FarmerFormData: Farmer being registered
	formData: initialState,
	setFormData: (data) => set({ formData: data }),
	getFormData: () => get().formData,
	resetFormData: () =>
		set({
			formData: initialState,
		}),
	validateFormData: () => {
		const {
			formData: {
				surname,
				// otherNames,
				birthDate,
				primaryPhone,
				secondaryPhone,
				traderType,
				purposes,
				// nuit,
				// nuel,
				// license,
			},
		} = get()
		let errors: { [key: string]: string } = {}

		// Not allowed to have both large and small scale processing as purposes at the same time
		if (
			purposes?.includes(TradingPurpose.LARGE_SCALE_PROCESSING) &&
			purposes?.includes(TradingPurpose.SMALL_SCALE_PROCESSING)
		) {
			errors = {
				...errors,
				purposes: 'O Processador não pode ser artesanal e industrial ao mesmo tempo',
			}
		}

		if (
			purposes?.includes(TradingPurpose.RESELLING) &&
			(purposes?.includes(TradingPurpose.SMALL_SCALE_PROCESSING) || purposes?.includes(TradingPurpose.LARGE_SCALE_PROCESSING) || purposes?.includes(TradingPurpose.EXPORT) || purposes?.includes(TradingPurpose.LOCAL))
		) {
			errors = {
				...errors,
				purposes: 'O Comerciante não pode ser Final e Intermediário ou Primário ao mesmo tempo',
			}
		}
		
		// If tradingpurpose is selling and the trader type is final, then the trader type should be either primary or secondary
		if (purposes?.includes(TradingPurpose.RESELLING) && traderType === TraderType.FINAL) {
			errors = {
				...errors,
				traderType: 'O Comerciante não pode ser Final e Intermediário ou Primário ao mesmo tempo',
				purposes: 'O Comerciante não pode ser Final e Intermediário ou Primário ao mesmo tempo',
			}
		}


		// birthDate should be a valid date and not empty
		if (!surname.toLowerCase().includes('company') && (!birthDate || isNaN(birthDate.getTime()))) {
			errors = { ...errors, birthDate: 'Indica a data de nascimento' }
		}

		// traderType should not be empty
		if (!traderType) {
			errors = { ...errors, traderType: 'Indica o tipo de trader' }
		}

		// if traderType is FINAL then purposes should not be empty
		if (traderType === TraderType.FINAL && purposes?.length === 0) {
			errors = { ...errors, purposes: 'Indica a finalidade (utilização) da castanha' }
		}


		// primaryPhone should not be empty
		if (!primaryPhone) {
			errors = { ...errors, primaryPhone: 'Indica o telefone' }
		}

		// primaryPhone and secondaryPhone should not be the same
		if (primaryPhone && secondaryPhone && primaryPhone === secondaryPhone) {
			errors = { ...errors, primaryPhone: 'Os telefones devem ser diferentes' }
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
