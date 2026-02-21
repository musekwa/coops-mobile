
import { create } from 'zustand'


type SmuggledLoadDetails = {
	quantity: number
	transportType: string
}

export type SmuggledLoadDetailsStore = {
	smuggledLoadDetails: SmuggledLoadDetails
	setSmuggledLoadDetails: (data: SmuggledLoadDetails) => void
	setQuantity: (quantity: number) => void
	setTransportType: (transportType: string) => void
	resetSmuggledLoadDetails: () => void
	getSmuggledLoadDetails: () => SmuggledLoadDetails
	updateSmuggledLoadDetails: (field: keyof SmuggledLoadDetails, value: string) => void
}

export const initialState: SmuggledLoadDetails = {
	quantity: 0,
	transportType: '',
}

export const useSmuggledLoadDetailsStore = create<SmuggledLoadDetailsStore>((set, get) => ({
	smuggledLoadDetails: initialState,
	setSmuggledLoadDetails: (data: SmuggledLoadDetails) => set({ smuggledLoadDetails: data }),
	setQuantity: (quantity: number) => set({ smuggledLoadDetails: { ...get().smuggledLoadDetails, quantity: quantity } }),
	setTransportType: (transportType: string) =>
		set({ smuggledLoadDetails: { ...get().smuggledLoadDetails, transportType: transportType } }),
	resetSmuggledLoadDetails: () => set({ smuggledLoadDetails: initialState }),
	getSmuggledLoadDetails: () => get().smuggledLoadDetails,
	updateSmuggledLoadDetails: (field: keyof SmuggledLoadDetails, value: string) =>
		set({ smuggledLoadDetails: { ...get().smuggledLoadDetails, [field]: value } }),
}))
