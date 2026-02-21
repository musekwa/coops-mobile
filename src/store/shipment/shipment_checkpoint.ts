import { create } from 'zustand'

export type ShipmentCheckpointInfoType = {
	checkpointId: string
	checkpointName: string
	checkpointDistrict: string
}

export type ShipmentCheckpointStore = {
	shipmentCheckpointInfo: ShipmentCheckpointInfoType
	setShipmentCheckpointInfo: (value: string, key: keyof ShipmentCheckpointInfoType) => void
	resetCheckpointInfo: () => void
	validateCheckpointInfo: () => { message: string; isValid: boolean }
}

export const initialState: ShipmentCheckpointInfoType = {
	checkpointId: '',
	checkpointName: '',
	checkpointDistrict: '',
}

export const useShipmentCheckpointStore = create<ShipmentCheckpointStore>((set, get) => ({
	shipmentCheckpointInfo: initialState,
	setShipmentCheckpointInfo: (value: string, key: keyof ShipmentCheckpointInfoType) => {
		const currentState = get().shipmentCheckpointInfo
		set({ shipmentCheckpointInfo: { ...currentState, [key]: value } })
	},
	resetCheckpointInfo: () => set({ shipmentCheckpointInfo: initialState }),
	validateCheckpointInfo: () => {
		const { checkpointId, checkpointName, checkpointDistrict } = get().shipmentCheckpointInfo

		if (checkpointId.length === 0) {
			return {
				message: 'Indique o posto de fiscalização',
				isValid: false,
			}
		}

		return {
			message: '',
			isValid: true,
		}
	},
}))
