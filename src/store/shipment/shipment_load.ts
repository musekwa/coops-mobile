import { create } from 'zustand'

export type LoadInfoType = {
	plateNumber: string
	numberOfBags: number | undefined
	bagWeight: number | undefined
	productType: string
}

export type ShipmentLoadInfoType = {
	truckLoad: LoadInfoType
	trailerLoads: LoadInfoType[]
}

export type ShipmentLoadStore = {
	shipmentLoadInfo: ShipmentLoadInfoType
	setTruckLoadInfo: (value: string | number, key: keyof LoadInfoType) => void
	setTrailerLoadInfo: (trailerIndex: number, value: string | number, key: keyof LoadInfoType) => void
	initializeTrailerLoads: (numberOfTrailers: number, trailerPlateNumbers?: string[]) => void
	resetLoadInfo: () => void
	validateLoadInfo: () => { message: string; isValid: boolean }
}

export const initialLoadInfo: LoadInfoType = {
	plateNumber: '',
	numberOfBags: undefined,
	bagWeight: undefined,
	productType: '',
}

export const initialState: ShipmentLoadInfoType = {
	truckLoad: initialLoadInfo,
	trailerLoads: [],
}

export const useShipmentLoadStore = create<ShipmentLoadStore>((set, get) => ({
	shipmentLoadInfo: initialState,
	setTruckLoadInfo: (value: string | number, key: keyof LoadInfoType) => {
		const currentState = get().shipmentLoadInfo
		set({
			shipmentLoadInfo: {
				...currentState,
				truckLoad: { ...currentState.truckLoad, [key]: value },
			},
		})
	},
	setTrailerLoadInfo: (trailerIndex: number, value: string | number, key: keyof LoadInfoType) => {
		const currentState = get().shipmentLoadInfo
		const newTrailerLoads = [...currentState.trailerLoads]
		if (newTrailerLoads[trailerIndex]) {
			newTrailerLoads[trailerIndex] = { ...newTrailerLoads[trailerIndex], [key]: value }
		}
		set({
			shipmentLoadInfo: {
				...currentState,
				trailerLoads: newTrailerLoads,
			},
		})
	},
	initializeTrailerLoads: (numberOfTrailers: number, trailerPlateNumbers?: string[]) => {
		const currentState = get().shipmentLoadInfo
		const trailerLoads = Array(numberOfTrailers)
			.fill(null)
			.map((_, index) => ({
				...initialLoadInfo,
				plateNumber: trailerPlateNumbers?.[index] || '',
			}))
		set({
			shipmentLoadInfo: {
				...currentState,
				trailerLoads,
			},
		})
	},
	resetLoadInfo: () => set({ shipmentLoadInfo: initialState }),
	validateLoadInfo: () => {
		const { truckLoad, trailerLoads } = get().shipmentLoadInfo

		// Validate truck load
		if (!truckLoad.productType || !truckLoad.numberOfBags || !truckLoad.bagWeight) {
			return {
				message: 'Complete as informações da carga do camião',
				isValid: false,
			}
		}

		// Only validate trailer loads if there are trailers
		if (trailerLoads.length > 0) {
			for (let i = 0; i < trailerLoads.length; i++) {
				const trailerLoad = trailerLoads[i]
				if (!trailerLoad.productType || !trailerLoad.numberOfBags || !trailerLoad.bagWeight) {
					return {
						message: `Complete as informações da carga do trailer ${i + 1}`,
						isValid: false,
					}
				}
			}
		}

		return {
			message: '',
			isValid: true,
		}
	},
}))
