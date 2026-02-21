import { create } from 'zustand'

type ShipmentLicenseInfo = {
	shipmentNumber: string
	photoUrl: string
	imageMode: 'camera' | 'gallery' | ''
	day: string
	month: string
	year: string
}

export type ShipmentLicenseStore = {
	shipmentLicenseInfo: ShipmentLicenseInfo
    setShipmentLicenseInfo: (value: string, key: keyof ShipmentLicenseInfo) => void
	resetLicenseInfo: () => void
}

export const initialState: ShipmentLicenseInfo = {
	shipmentNumber: '',
	photoUrl: '',
	imageMode: '',
	day: '',
	month: '',
	year: '',
}

export const useShipmentLicenseStore = create<ShipmentLicenseStore>((set, get) => ({
	shipmentLicenseInfo: initialState,
	setShipmentLicenseInfo: (value: string, key: keyof ShipmentLicenseInfo) =>
		set({ shipmentLicenseInfo: { ...get().shipmentLicenseInfo, [key]: value } }),
	resetLicenseInfo: () => set({ shipmentLicenseInfo: initialState })
}))
