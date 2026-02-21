import { create } from 'zustand'

type ShipmentReceiverDetails = {
	receiverId: string
	receiverName: string
	receiverPhone: string
	receiverType: string
	destinationDistrict: string
	destinationProvince: string
}

export type ShipmentReceiverDetailsStore = {
	shipmentReceiverDetails: ShipmentReceiverDetails
	setShipmentReceiverDetails: (data: ShipmentReceiverDetails) => void
	setReceiverId: (receiverId: string) => void
	setReceiverName: (receiverName: string) => void
	setReceiverPhone: (receiverPhone: string) => void
	setReceiverType: (receiverType: string) => void
	resetShipmentReceiverDetails: () => void
	getShipmentReceiverDetails: () => ShipmentReceiverDetails
	getReceiverType: () => string
	updateShipmentReceiverDetails: (field: keyof ShipmentReceiverDetails, value: string) => void
	setDestinationDistrict: (destinationDistrict: string) => void
	setDestinationProvince: (destinationProvince: string) => void
}

export const initialState: ShipmentReceiverDetails = {
	receiverId: '',
	receiverName: '',
	receiverPhone: '',
	receiverType: '',
	destinationDistrict: '',
	destinationProvince: '',
}

export const useShipmentReceiverDetailsStore = create<ShipmentReceiverDetailsStore>((set, get) => ({
	shipmentReceiverDetails: initialState,
	setShipmentReceiverDetails: (data: ShipmentReceiverDetails) => set({ shipmentReceiverDetails: data }),
	setReceiverId: (receiverId: string) =>
		set({ shipmentReceiverDetails: { ...get().shipmentReceiverDetails, receiverId: receiverId } }),
	setReceiverName: (receiverName: string) =>
		set({ shipmentReceiverDetails: { ...get().shipmentReceiverDetails, receiverName: receiverName } }),
	setReceiverPhone: (receiverPhone: string) =>
		set({ shipmentReceiverDetails: { ...get().shipmentReceiverDetails, receiverPhone: receiverPhone } }),
	setReceiverType: (receiverType: string) =>
		set({ shipmentReceiverDetails: { ...get().shipmentReceiverDetails, receiverType: receiverType } }),
	setDestinationDistrict: (destinationDistrict: string) =>
		set({ shipmentReceiverDetails: { ...get().shipmentReceiverDetails, destinationDistrict: destinationDistrict } }),
	setDestinationProvince: (destinationProvince: string) =>
		set({ shipmentReceiverDetails: { ...get().shipmentReceiverDetails, destinationProvince: destinationProvince } }),
	resetShipmentReceiverDetails: () => set({ shipmentReceiverDetails: initialState }),
	getShipmentReceiverDetails: () => get().shipmentReceiverDetails,
	updateShipmentReceiverDetails: (field: keyof ShipmentReceiverDetails, value: string) =>
		set({ shipmentReceiverDetails: { ...get().shipmentReceiverDetails, [field]: value } }),
	getReceiverType: () => get().shipmentReceiverDetails.receiverType,
}))
