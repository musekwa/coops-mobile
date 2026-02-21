import { create } from 'zustand'

type ShipmentOwnerDetails = {
 ownerId: string;
 ownerType: 'TRADER' | 'FARMER' | 'GROUP' | 'OTHER'
 ownerName: string
 ownerPhone: string
}

export type ShipmentOwnerDetailsStore = {
	shipmentOwnerDetails: ShipmentOwnerDetails
	setShipmentOwnerDetails: (value: string, key: keyof ShipmentOwnerDetails) => void
	resetShipmentOwnerDetails: () => void
}

export const initialState: ShipmentOwnerDetails = {
	ownerId: '',
	ownerType: 'OTHER',
	ownerName: '',
	ownerPhone: '',
}

export const useShipmentOwnerDetailsStore = create<ShipmentOwnerDetailsStore>((set, get) => ({
	shipmentOwnerDetails: initialState,
	setShipmentOwnerDetails: (value: string, key: keyof ShipmentOwnerDetails) => set({ shipmentOwnerDetails: { ...get().shipmentOwnerDetails, [key]: value } }),
	resetShipmentOwnerDetails: () => set({ shipmentOwnerDetails: initialState }),
}))


