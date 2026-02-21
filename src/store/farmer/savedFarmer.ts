import { MultiCategory } from 'src/types'
import { Worker } from 'src/models/embeddable'
import { create } from 'zustand'
import { Farmer } from 'src/models/farmer'

export type FarmerDetailsType = {
	_id: string
	surname: string
	otherNames: string
	isServiceProvider: boolean | undefined
	multicategory: MultiCategory[]
	contacts: {
		phone1: number
		phone2: number
	}
	workers: Worker[]
	photo: string
	province: string
	district: string
	adminPost: string
	village: string
	geoCoordinates:
		| {
				latitude: number
				longitude: number
		  }
		| undefined
}

export type SavedFarmerDetailsStore = {
	farmerList: FarmerDetailsType[]
	farmerDetails: FarmerDetailsType

	// farmer details
	setFarmerDetails: (details: FarmerDetailsType) => void
	setFarmer: (farmer: Farmer) => void
	getFarmerDetails: () => FarmerDetailsType
	resetFarmerDetails: () => void

	// farmer by id
	getFarmerById: (id: string) => FarmerDetailsType | undefined

	// farmer list
	setFarmerList: (list: FarmerDetailsType[]) => void
	getFarmerList: () => FarmerDetailsType[]
	resetFarmerList: () => void
}

export const initialState: FarmerDetailsType = {
	_id: '',
	surname: '',
	otherNames: '',
	isServiceProvider: undefined,
	multicategory: [],
	contacts: {
		phone1: 0,
		phone2: 0,
	},
	workers: [],
	photo: '',
	province: '',
	district: '',
	adminPost: '',
	village: '',
	geoCoordinates: undefined,
}

export const useFarmerDetailsStore = create<SavedFarmerDetailsStore>((set, get) => ({
	farmerList: [],
	farmerDetails: initialState,
	// single farmer details
	setFarmerDetails: (details: FarmerDetailsType) => set({ farmerDetails: details }),
	setFarmer: (farmer: Farmer) => {
		const {
			_id,
			surname,
			otherNames,
			isServiceProvider,
			multicategory,
			contacts,
			workers,
			photo,
			province,
			district,
			adminPost,
			village,
		} = farmer

		set({
			farmerDetails: {
				_id,
				surname,
				otherNames,
				isServiceProvider: undefined,
				multicategory: (multicategory || []) as MultiCategory[],
				contacts: {
					phone1: contacts?.phone1 || 0,
					phone2: contacts?.phone2 || 0,
				},
				workers: (workers || []) as Worker[],
				photo: photo || '',
				province: province || 'N/A',
				district: district || 'N/A',
				adminPost: adminPost || 'N/A',
				village: village || 'N/A',
				geoCoordinates: undefined,
			},
		})
	},
	getFarmerDetails: () => get().farmerDetails,
	resetFarmerDetails: () => set({ farmerDetails: initialState }),

	// farmer by id
	getFarmerById: (id) => get().farmerList.find((farmer) => farmer._id === id),

	// farmer list
	setFarmerList: (list) => set({ farmerList: list }),
	getFarmerList: () => get().farmerList,
	resetFarmerList: () =>
		set({
			farmerList: [],
		}),
}))
