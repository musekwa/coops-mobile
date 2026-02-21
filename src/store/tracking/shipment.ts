import { create } from 'zustand'

export type Origin = {
	province: string
	district: string
}

export type TransitLicenseInfo = {
	id: string
	photo: string
	issuedIn: string
	day: string
	month: string
	year: string
	label: string
	purpose: string
}

export type TransporterInfoType = {
	truckBrand: string
	truckPlate: string
	driverName: string
	driverPhone: string
	numberOfSacks?: number
	quantity?: number
	unit?: string
	sackType: string
	
}

export type ShipmentType = {
	transitLicense:TransitLicenseInfo
	ownerId: string
	ownerName: string
	ownerPhone: string
	senderId: string // mark it N/A if sender is the transporter
	senderName: string // mark it 'TRANSPORTER' if sender is the transporter
	senderPhone: string 
	receiverId: string
	receiverName: string
	receiverPhone: string

	origins: Origin[] // districts of origin where the goods is coming from
	originProvince: string
	originDistrict: string
	
	destinationDistrict: string // district of destination where the goods is going to
	destinationProvince: string

	transporters: {
		truckBrand: string
		truckPlate: string
		driverName: string
		driverPhone: string
		numberOfSacks?: number
		quantity?: number
		unit?: string
		sackType: string
	}[]
}

export type ShipmentStore = {
	formData: ShipmentType
	setFormData: (data: ShipmentType) => void
	setOrigin: (data: Origin) => void
	setDestination: (data: Origin) => void
	setLicenseInfo: (data: TransitLicenseInfo) => void
	resetLicensePhoto: () => void
	resetLicenseInfo: () => void
	getFormData: () => ShipmentType
	resetFormData: () => void
	updateFormData: (field: keyof ShipmentType, value:  string) => void
}

export const initialState: ShipmentType = {
	transitLicense: {
		id: '',
		photo: '',
		issuedIn: '',
		day: '',
		month: '',
		year: '',
		label: '',
		purpose: '',
	},
	ownerId: '',
	ownerName: '',
	ownerPhone: '',
	senderId: '',
	senderName: '',
	senderPhone: '',
	receiverId: '',
	receiverName: '',
	receiverPhone: '',

	origins: [],

	originDistrict: '',
	originProvince: '',

	destinationDistrict: '',
	destinationProvince: '',

	// transporter info
	transporters: [],	
}

export const useShipmentStore = create<ShipmentStore>((set, get) => ({
	formData: initialState,
	setLicenseInfo: (data) => set((state) => ({
		formData: {
			...state.formData,
			transitLicense: {
				...state.formData.transitLicense,
				issuedIn: data.issuedIn,
				photo: data.photo,
				id: data.id,
				day: data.day,
				month: data.month,
				year: data.year,
				purpose: data.purpose,
				label: data.label
			}
		}
	})),	

	resetLicensePhoto: () => set((state) => ({
		formData: {
			...state.formData,
			transitLicense: {
				...state.formData.transitLicense,
				photo: '',
			}
		}
	})),

	resetLicenseInfo: () => set((state) => ({
		formData: {
			...state.formData,
			transitLicense: {
				...state.formData.transitLicense,
				day: '',
				month: '',
				year: '',
				photo: '',
				id: '',
				issuedIn: '',
				label: '',
				purpose: '',
			}
		}
	})),

	setOrigin: (data) => set((state) => ({
		formData: {
			...state.formData,

			// non duplicate origins
			origins: [...state.formData.origins, data].filter((v, i, a) => a.findIndex(t => (t.province === v.province && t.district === v.district)) === i),
		}
	})),
	setDestination: (data) => set((state) => ({
		formData: {
			...state.formData,
			destinationDistrict: data.district,
			destinationProvince: data.province,
		}
	})),
	setFormData: (data) => set({ formData: data }),
	getFormData: () => get().formData,
	resetFormData: () =>
		set({
			formData: initialState,
		}),
	updateFormData: (field, value) =>
		set((state) => ({
			formData: {
				...state.formData,
				[field]: value,
			},
		})),
}))
