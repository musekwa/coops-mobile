import { create } from 'zustand'

export type InspectionConditionsType = {
    hasInspectedShipment: string, // YES | NO | DEFAULT
    hasNotInspectedShipment: string, // YES | NO | DEFAULT
    hasShipmentIrregularities: string, // YES | NO | DEFAULT
    hasNotShipmentIrregularities: string, // YES | NO | DEFAULT
    notes?: string
}

export type InspectionStore = {
	formData: InspectionConditionsType
	setFormData: (data: InspectionConditionsType) => void
	getFormData: () => InspectionConditionsType
	resetFormData: () => void
	updateFormData: (field: keyof InspectionConditionsType, value: string) => void
}

export const initialState: InspectionConditionsType = {
    hasInspectedShipment: 'DEFAULT',
    hasNotInspectedShipment: 'DEFAULT',
    hasShipmentIrregularities: 'DEFAULT',
    hasNotShipmentIrregularities: 'DEFAULT',
    notes: '',
	
}

export const useInspectionStore = create<InspectionStore>((set, get) => ({
	formData: initialState,
	setFormData: (data) => set({ formData: data }),
	getFormData: () => get().formData,
	resetFormData: () =>
		set({
			formData: initialState,
		}),
	updateFormData: (field, value) =>
		set((state) => ({
			formData: {
				...state.formData,
				[field]: value,
			},
		})),
}))
