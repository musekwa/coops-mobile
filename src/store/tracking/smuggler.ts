import { create } from 'zustand'

type SmugglerDetails = {
	smugglerId: string
	smugglerCategory: 'FARMER' | 'TRADER' | ''
	smugglerOtherNames: string
	smugglerSurname: string
	smugglerPhone: string
	smugglerVillage: string
	smugglerVillageId: string
	smugglerAdminPost: string
	smugglerAdminPostId: string
	smugglerDistrict: string
	smugglerDistrictId: string
	smugglerProvince: string
	smugglerProvinceId: string
    isAlreadyRegistered: boolean
}

export type SmugglerDetailsStore = {
	smugglerDetails: SmugglerDetails
	setSmugglerDetails: (data: SmugglerDetails) => void
	setSmugglerId: (smugglerId: string) => void
	setSmugglerOtherNames: (smugglerOtherNames: string) => void
	setSmugglerSurname: (smugglerSurname: string) => void
	setSmugglerPhone: (smugglerPhone: string) => void
	setSmugglerVillage: (smugglerVillage: string) => void
	setSmugglerVillageId: (smugglerVillageId: string) => void
	setSmugglerAdminPost: (smugglerAdminPost: string) => void
	setSmugglerAdminPostId: (smugglerAdminPostId: string) => void
	setSmugglerDistrict: (smugglerDistrict: string) => void
	setSmugglerDistrictId: (smugglerDistrictId: string) => void
	setSmugglerProvince: (smugglerProvince: string) => void
	setSmugglerProvinceId: (smugglerProvinceId: string) => void
	resetSmugglerDetails: () => void
	getSmugglerDetails: () => SmugglerDetails
	updateSmugglerDetails: (field: keyof SmugglerDetails, value: string) => void
}

export const initialState: SmugglerDetails = {
	smugglerId: '',
	smugglerCategory: '',
	smugglerOtherNames: '',
	smugglerSurname: '',
	smugglerPhone: '',
	smugglerVillage: '',
	smugglerVillageId: '',
	smugglerAdminPost: '',
	smugglerAdminPostId: '',
	smugglerDistrict: '',
	smugglerDistrictId: '',
	smugglerProvince: '',
	smugglerProvinceId: '',
    isAlreadyRegistered: false
}

export const useSmugglerDetailsStore = create<SmugglerDetailsStore>((set, get) => ({
	smugglerDetails: initialState,
	setSmugglerDetails: (data: SmugglerDetails) => set({ smugglerDetails: data }),
	setSmugglerId: (smugglerId: string) => set({ smugglerDetails: { ...get().smugglerDetails, smugglerId: smugglerId } }),
	setSmugglerOtherNames: (smugglerOtherNames: string) =>
		set({ smugglerDetails: { ...get().smugglerDetails, smugglerOtherNames: smugglerOtherNames } }),
	setSmugglerSurname: (smugglerSurname: string) =>
		set({ smugglerDetails: { ...get().smugglerDetails, smugglerSurname: smugglerSurname } }),
	setSmugglerPhone: (smugglerPhone: string) =>
		set({ smugglerDetails: { ...get().smugglerDetails, smugglerPhone: smugglerPhone } }),
	setSmugglerVillage: (smugglerVillage: string) =>
		set({ smugglerDetails: { ...get().smugglerDetails, smugglerVillage: smugglerVillage } }),
	setSmugglerVillageId: (smugglerVillageId: string) =>
		set({ smugglerDetails: { ...get().smugglerDetails, smugglerVillageId: smugglerVillageId } }),
	setSmugglerAdminPost: (smugglerAdminPost: string) =>
		set({ smugglerDetails: { ...get().smugglerDetails, smugglerAdminPost: smugglerAdminPost } }),
	setSmugglerAdminPostId: (smugglerAdminPostId: string) =>
		set({ smugglerDetails: { ...get().smugglerDetails, smugglerAdminPostId: smugglerAdminPostId } }),
	setSmugglerDistrict: (smugglerDistrict: string) =>
		set({ smugglerDetails: { ...get().smugglerDetails, smugglerDistrict: smugglerDistrict } }),
	setSmugglerDistrictId: (smugglerDistrictId: string) =>
		set({ smugglerDetails: { ...get().smugglerDetails, smugglerDistrictId: smugglerDistrictId } }),
	setSmugglerProvince: (smugglerProvince: string) =>
		set({ smugglerDetails: { ...get().smugglerDetails, smugglerProvince: smugglerProvince } }),
	setSmugglerProvinceId: (smugglerProvinceId: string) =>
		set({ smugglerDetails: { ...get().smugglerDetails, smugglerProvinceId: smugglerProvinceId } }),
	resetSmugglerDetails: () => set({ smugglerDetails: initialState }),
	getSmugglerDetails: () => get().smugglerDetails,
	updateSmugglerDetails: (field: keyof SmugglerDetails, value: string) =>
		set({ smugglerDetails: { ...get().smugglerDetails, [field]: value } }),
}))
