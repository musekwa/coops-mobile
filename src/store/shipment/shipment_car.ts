import { create } from 'zustand'

export type ShipmentCarInfoType = {
	brandName: string
	carType: string
	carTypeLabel: string
	firstPartPlate: string
	secondPartPlate: string
	thirdPartPlate: string
	numberOfTrailers: string
	carId: string
}

export type ShipmentCarStore = {
	shipmentCarInfo: ShipmentCarInfoType
	setShipmentCarInfo: (value: string, key: keyof ShipmentCarInfoType) => void
	resetCarInfo: () => void
	validateCarInfo: () => { message: string; isValid: boolean }
}

export const initialState: ShipmentCarInfoType = {
	brandName: '',
	carType: '',
	carTypeLabel: '',
	firstPartPlate: '',
	secondPartPlate: '',
	thirdPartPlate: '',
	numberOfTrailers: '',
	carId: '',
}

export const useShipmentCarStore = create<ShipmentCarStore>((set, get) => ({
	shipmentCarInfo: initialState,
	setShipmentCarInfo: (value: string, key: keyof ShipmentCarInfoType) => {
		const currentState = get().shipmentCarInfo
		set({ shipmentCarInfo: { ...currentState, [key]: value } })
	},
	resetCarInfo: () => set({ shipmentCarInfo: initialState }),
	validateCarInfo: () => {
		const { numberOfTrailers } = get().shipmentCarInfo

		if (numberOfTrailers.length === 0) {
			return {
				message: 'Indique o número de trailers',
				isValid: false,
			}
		}

		return {
			message: '',
			isValid: true,
		}
	},
}))
