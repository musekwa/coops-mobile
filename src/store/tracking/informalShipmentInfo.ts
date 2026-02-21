import { create } from 'zustand'




type TransitInformalShipmentInfo = {
	transitType: string
	purpose: string
	originDistrict: string
	originProvince: string
	destinationDistrict: string
	destinationProvince: string
	destinationCountry: string
}

export type InformalShipmentInfoStore = {
	informalShipmentInfo: TransitInformalShipmentInfo
	setInformalShipmentInfo: (data: TransitInformalShipmentInfo) => void
    setTransitType: (transitType: string) => void
    setPurpose: (purpose: string) => void
    setOriginDistrict: (originDistrict: string) => void
    setOriginProvince: (originProvince: string) => void
    setDestinationDistrict: (destinationDistrict: string) => void
    setDestinationProvince: (destinationProvince: string) => void
	resetInformalShipmentInfo: () => void
	getInformalShipmentInfo: () => TransitInformalShipmentInfo
	updateInformalShipmentInfo: (field: keyof TransitInformalShipmentInfo, value:  string) => void
}

export const initialState: TransitInformalShipmentInfo = {
	transitType: '',
	purpose: '',
	originDistrict: '',
	originProvince: '',
	destinationDistrict: '',
	destinationProvince: '',
	destinationCountry: '',
}

export const useInformalShipmentInfoStore = create<InformalShipmentInfoStore>((set, get) => ({
	informalShipmentInfo: initialState,
	setInformalShipmentInfo: (data: TransitInformalShipmentInfo) => set({ informalShipmentInfo: data }),
    setTransitType: (transitType: string) => set({ informalShipmentInfo: { ...get().informalShipmentInfo, transitType: transitType } }),
    setPurpose: (purpose: string) => set({ informalShipmentInfo: { ...get().informalShipmentInfo, purpose: purpose } }),
    setOriginDistrict: (originDistrict: string) => set({ informalShipmentInfo: { ...get().informalShipmentInfo, originDistrict: originDistrict } }),
    setOriginProvince: (originProvince: string) => set({ informalShipmentInfo: { ...get().informalShipmentInfo, originProvince: originProvince } }),
    setDestinationDistrict: (destinationDistrict: string) => set({ informalShipmentInfo: { ...get().informalShipmentInfo, destinationDistrict: destinationDistrict } }),
    setDestinationProvince: (destinationProvince: string) => set({ informalShipmentInfo: { ...get().informalShipmentInfo, destinationProvince: destinationProvince } }),
	resetInformalShipmentInfo: () => set({ informalShipmentInfo: initialState }),
	getInformalShipmentInfo: () => get().informalShipmentInfo,
	updateInformalShipmentInfo: (field: keyof TransitInformalShipmentInfo, value: string) => set({ informalShipmentInfo: { ...get().informalShipmentInfo, [field]: value } }),
}))

