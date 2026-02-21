import { create } from 'zustand'

export type TransporterInfoType = {
	truckBrand: string
	firstPartPlate: string
	secondPartPlate: string
	thirdPartPlate: string
	driverName: string
	driverPhone: string
	numberOfSacks: number
	sackWeight: number
	unit?: string
	sackType: string
	hasTrailer: 'YES' | 'NO'
}

export type TransporterInfoStore = {
	transporterInfo: TransporterInfoType[]
	trailerInfo: TransporterInfoType[]
	setTransportersInfo: (data: TransporterInfoType[]) => void
	setTransporterInfo: (data: TransporterInfoType) => void
	setTrailerInfo: (data: TransporterInfoType) => void
	removeTrailerInfo: (index: number) => void
	resetTrailerInfo: () => void
	setTruckBrand: (data: string) => void
	setTruckPlate: (data: string) => void
	setDriverName: (data: string) => void
	setDriverPhone: (data: string) => void
	setNumberOfSacks: (data: number) => void
	setQuantity: (data: number) => void
	setUnit: (data: string) => void
	setSackType: (data: string) => void
	resetTransporterInfo: () => void
	updateTransporterInfo: (field: keyof TransporterInfoType, value: string) => void
}


export const useTransporterInfoStore = create<TransporterInfoStore>((set, get) => ({
	transporterInfo: [],
	trailerInfo: [],
	setTransportersInfo: (data: TransporterInfoType[]) =>{
		const transportersInfo = get().transporterInfo
		set((state) => ({
			transporterInfo: [...transportersInfo, ...data],
		}))
	},
	setTrailerInfo: (data: TransporterInfoType) =>
		set((state) => ({
			trailerInfo: [
				...state.trailerInfo,
				data,
			],
		})),
	removeTrailerInfo: (index: number) =>
		set((state) => ({
			trailerInfo: state.trailerInfo.filter((_, i) => i !== index),
		})),
	resetTrailerInfo: () =>
		set((state) => ({
			trailerInfo: [],
		})),	
	setTransporterInfo: (data: TransporterInfoType) =>
		set((state) => ({
			transporterInfo: [
				...state.transporterInfo,
				{
					...state.transporterInfo[state.transporterInfo.length - 1],
					...data,
				},
			],
		})),
	setTruckBrand: (data) => set((state) => ({
		transporterInfo: [
			...state.transporterInfo,
			{	
				...state.transporterInfo[state.transporterInfo.length - 1],
				truckBrand: data,
			},
		],
	})),
	setTruckPlate: (data) => set((state) => ({
		transporterInfo: [
			...state.transporterInfo,
			{	
				...state.transporterInfo[state.transporterInfo.length - 1],
				truckPlate: data,
			},
		],
	})),
	setDriverName: (data) => set((state) => ({
		transporterInfo: [
			...state.transporterInfo,
			{		
				...state.transporterInfo[state.transporterInfo.length - 1],
				driverName: data,
			},
		],
	})),
	setDriverPhone: (data) => set((state) => ({
		transporterInfo: [
			...state.transporterInfo,
			{			
				...state.transporterInfo[state.transporterInfo.length - 1],
				driverPhone: data,
			},
		],
	})),
	setNumberOfSacks: (data) => set((state) => ({
		transporterInfo: [
			...state.transporterInfo,
			{	
				...state.transporterInfo[state.transporterInfo.length - 1],
				numberOfSacks: data,
			},
		],
	})),
	setQuantity: (data) => set((state) => ({
		transporterInfo: [
			...state.transporterInfo,
			{		
				...state.transporterInfo[state.transporterInfo.length - 1],
				quantity: data,
			},
		],
	})),
	setUnit: (data) => set((state) => ({
		transporterInfo: [
			...state.transporterInfo,
			{			
				...state.transporterInfo[state.transporterInfo.length - 1],
				unit: data,
			},
		],
	})),
	setSackType: (data) => set((state) => ({
		transporterInfo: [
			...state.transporterInfo,
			{	
				...state.transporterInfo[state.transporterInfo.length - 1],
				sackType: data,
			},
		],
	})),
	
	resetTransporterInfo: () =>
		set((state) => ({
			transporterInfo: [],
		})),

	updateTransporterInfo: (field, value) =>
		set((state) => ({
			transporterInfo: [
				...state.transporterInfo,
				{	
					...state.transporterInfo[state.transporterInfo.length - 1],
					[field]: value,
				},
			],
		})),
}))
