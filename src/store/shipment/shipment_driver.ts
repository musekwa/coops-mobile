import { create } from 'zustand'

export type ShipmentDriverInfoType = {
	driverName: string
	driverPhone: string
	driverId: string
}

export type ShipmentDriverStore = {
	shipmentDriverInfo: ShipmentDriverInfoType
    setShipmentDriverInfo: (value: string, key: keyof ShipmentDriverInfoType) => void
	resetDriverInfo: () => void
    validateDriverInfo: () => { message: string; isValid: boolean }
}

export const initialState: ShipmentDriverInfoType = {
	driverName: '',
	driverPhone: '',
	driverId: '',
}

export const useShipmentDriverStore = create<ShipmentDriverStore>((set, get) => ({
	shipmentDriverInfo: initialState,
	setShipmentDriverInfo: (value: string, key: keyof ShipmentDriverInfoType) =>
		set({ shipmentDriverInfo: { ...get().shipmentDriverInfo, [key]: value } }),
	resetDriverInfo: () => set({ shipmentDriverInfo: initialState }),
    validateDriverInfo: () => {
        const { driverName, driverPhone, driverId } = get().shipmentDriverInfo
        console.log('driverName', driverName)
        console.log('driverPhone', driverPhone)
            
        if (driverId.length === 0 && driverName.length === 0 && driverPhone.length === 0) {
            return {
                message: 'Seleccione o motorista',
                isValid: false
            }
        }
        if (driverName && driverPhone){
            if (!driverName.match(/.*\s.*/)) {
                return {
                    message: 'Indica o nome completo do motorista.',
                    isValid: false
                }
            }
            if (!driverPhone.match(/^(84|86|87|85|82|83)\d{7}$/)) {
                return {
                    message: 'Indica o número de telefone do motorista',
                    isValid: false
                }
            }
        }
        return {
            message: '',
            isValid: true
        }
    }
}))
