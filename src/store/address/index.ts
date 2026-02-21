import { getAdminPostById, getCountryById, getDistrictById, getProvinceById, getVillageById } from 'src/library/sqlite/selects'
import { AddressLevel } from 'src/types'
import { create } from 'zustand'

type AddressStore = {
	countryId: string | null
	nationality: 'NATIONAL' | 'FOREIGN'
	partialAddress: {
		provinceId?: string | null
		districtId?: string | null
		adminPostId?: string | null
		villageId?: string | null
	}
	fullAddress: {
		provinceId: string | null
		districtId: string | null
		adminPostId: string | null
		villageId: string | null
	}

	// setters of country
	setCountryId: (countryId?: string) => void

	// setters of nationality
	setNationality: (nationality: 'NATIONAL' | 'FOREIGN') => void

	// setters of partial
	setPartialProvinceId: (provinceId?: string) => void
	setPartialDistrictId: (districtId?: string) => void
	setPartialAdminPostId: (adminPostId?: string) => void
	setPartialVillageId: (villageId?: string) => void

	// setters of residence
	setFullProvinceId: (provinceId?: string) => void
	setFullDistrictId: (districtId?: string) => void
	setFullAdminPostId: (adminPostId?: string) => void
	setFullVillageId: (villageId?: string) => void

	// reset
	reset: () => void

	// reset of partial
	resetPartialProvinceId: () => void
	resetPartialDistrictId: () => void
	resetPartialAdminPostId: () => void
	resetPartialVillageId: () => void

	// reset of full
	resetFullProvinceId: () => void
	resetFullDistrictId: () => void
	resetFullAdminPostId: () => void
	resetFullVillageId: () => void

	// getters of partial
	getPartialProvinceId: () => string | null | undefined
	getPartialDistrictId: () => string | null | undefined
	getPartialAdminPostId: () => string | null | undefined
	getPartialVillageId: () => string | null | undefined

	// getters of full
	getFullProvinceId: () => string | null
	getFullDistrictId: () => string | null
	getFullAdminPostId: () => string | null
	getFullVillageId: () => string | null

	// get partial address names
	getPartialProvinceNameById: (provinceId: string) => Promise<string | null | undefined>
	getPartialDistrictNameById: (districtId: string) => Promise<string | null | undefined>
	getPartialAdminPostNameById: (adminPostId: string) => Promise<string | null | undefined>
	getPartialVillageNameById: (villageId: string) => Promise<string | null | undefined>

	// get full address names
	getCountryNameById: (countryId: string) => Promise<string | null | undefined>
	getFullProvinceNameById: (provinceId: string) => Promise<string | null | undefined>
	getFullDistrictNameById: (districtId: string) => Promise<string | null | undefined>
	getFullAdminPostNameById: (adminPostId: string) => Promise<string | null | undefined>
	getFullVillageNameById: (villageId: string) => Promise<string | null | undefined>

	// validate by address level
	validateByAddressLevel: (addressLevel: AddressLevel) => {
		success: boolean
		message: string
	}
}

export const useAddressStore = create<AddressStore>((set, get) => ({
	countryId: null,
	nationality: 'NATIONAL',
	partialAddress: {
		provinceId: null,
		districtId: null,
		adminPostId: null,
		villageId: null,
	},
	fullAddress: {
		provinceId: null,
		districtId: null,
		adminPostId: null,
		villageId: null,
	},

	// setters of country
	setCountryId: (countryId?: string) => set({ countryId: countryId || null }),

	// setters of nationality
	setNationality: (nationality: 'NATIONAL' | 'FOREIGN') => set({ nationality: nationality }),

	// setters of partial
	setPartialProvinceId: (provinceId?: string) =>
		set({ partialAddress: { ...get().partialAddress, provinceId: provinceId || null } }),
	setPartialDistrictId: (districtId?: string) =>
		set({ partialAddress: { ...get().partialAddress, districtId: districtId || null } }),
	setPartialAdminPostId: (adminPostId?: string) =>
		set({ partialAddress: { ...get().partialAddress, adminPostId: adminPostId || null } }),
	setPartialVillageId: (villageId?: string) =>
		set({ partialAddress: { ...get().partialAddress, villageId: villageId || null } }),

	// setters of residence
	setFullProvinceId: (provinceId?: string) =>
		set({ fullAddress: { ...get().fullAddress, provinceId: provinceId || null } }),
	setFullDistrictId: (districtId?: string) =>
		set({ fullAddress: { ...get().fullAddress, districtId: districtId || null } }),
	setFullAdminPostId: (adminPostId?: string) =>
		set({ fullAddress: { ...get().fullAddress, adminPostId: adminPostId || null } }),
	setFullVillageId: (villageId?: string) =>
		set({ fullAddress: { ...get().fullAddress, villageId: villageId || null } }),

	// reset
	reset: () =>
		set({
			partialAddress: { provinceId: null, districtId: null, adminPostId: null, villageId: null },
			fullAddress: { provinceId: null, districtId: null, adminPostId: null, villageId: null },
			countryId: null,
			nationality: 'NATIONAL',
		}),

	// reset of country
	resetCountryId: () => set({ countryId: null }),

	// reset of partial
	resetPartialProvinceId: () => set({ partialAddress: { ...get().partialAddress, provinceId: null } }),
	resetPartialDistrictId: () => set({ partialAddress: { ...get().partialAddress, districtId: null } }),
	resetPartialAdminPostId: () => set({ partialAddress: { ...get().partialAddress, adminPostId: null } }),
	resetPartialVillageId: () => set({ partialAddress: { ...get().partialAddress, villageId: null } }),

	resetFullProvinceId: () => set({ fullAddress: { ...get().fullAddress, provinceId: null } }),
	resetFullDistrictId: () => set({ fullAddress: { ...get().fullAddress, districtId: null } }),
	resetFullAdminPostId: () => set({ fullAddress: { ...get().fullAddress, adminPostId: null } }),
	resetFullVillageId: () => set({ fullAddress: { ...get().fullAddress, villageId: null } }),

	// getters of country
	getCountryId: () => get().countryId,

	// getters
	getPartialProvinceId: () => get().partialAddress.provinceId,
	getPartialDistrictId: () => get().partialAddress.districtId,
	getPartialAdminPostId: () => get().partialAddress.adminPostId,
	getPartialVillageId: () => get().partialAddress.villageId,

	getFullProvinceId: () => get().fullAddress.provinceId,
	getFullDistrictId: () => get().fullAddress.districtId,
	getFullAdminPostId: () => get().fullAddress.adminPostId,
	getFullVillageId: () => get().fullAddress.villageId,

	// get full address names
	getCountryNameById: (countryId: string) => {
		const getCountryName = async (countryId: string) => {
			const countryName = await getCountryById(countryId)
			return countryName
		}
		return getCountryName(countryId)
	},

	getFullProvinceNameById: (provinceId: string) => {
		const getProvinceName = async (provinceId: string) => {
			const provinceName = await getProvinceById(provinceId)
			return provinceName
		}
		return getProvinceName(provinceId)
	},
	getFullDistrictNameById: (districtId: string) => {
		const getDistrictName = async (districtId: string) => {
			const districtName = await getDistrictById(districtId)
			return districtName
		}
		return getDistrictName(districtId)
	},
	getFullAdminPostNameById: (adminPostId: string) => {
		const getAdminPostName = async (adminPostId: string) => {
			const adminPostName = await getAdminPostById(adminPostId)
			return adminPostName
		}
		return getAdminPostName(adminPostId)
	},
	getFullVillageNameById: (villageId: string) => {
		const getVillageName = async (villageId: string) => {
			const villageName = await getVillageById(villageId)
			return villageName
		}
		return getVillageName(villageId)
	},

	// get partial address names
	getPartialProvinceNameById: (provinceId: string) => {
		const getProvinceName = async (provinceId: string) => {
			const provinceName = await getProvinceById(provinceId)
			return provinceName
		}
		return getProvinceName(provinceId)
	},
	getPartialDistrictNameById: (districtId: string) => {
		const getDistrictName = async (districtId: string) => {
			const districtName = await getDistrictById(districtId)
			return districtName
		}
		return getDistrictName(districtId)
	},
	getPartialAdminPostNameById: (adminPostId: string) => {
		const getAdminPostName = async (adminPostId: string) => {
			const adminPostName = await getAdminPostById(adminPostId)
			return adminPostName
		}
		return getAdminPostName(adminPostId)
	},
	getPartialVillageNameById: (villageId: string) => {
		const getVillageName = async (villageId: string) => {
			const villageName = await getVillageById(villageId)
			return villageName
		}
		return getVillageName(villageId)
	},

	// validate by address level
	validateByAddressLevel: (addressLevel: AddressLevel) => {
		const countryId = get().countryId
		const provinceId = get().partialAddress.provinceId
		const districtId = get().partialAddress.districtId
		const adminPostId = get().partialAddress.adminPostId
		const villageId = get().partialAddress.villageId

		if (addressLevel === AddressLevel.FROM_COUNTRIES) {
			if (!countryId || countryId === 'N/A') {
				return {
					success: false,
					message: 'País é obrigatório',
				}
			}
			return {
				success: true,
				message: '',
			}
		}

		if (addressLevel === AddressLevel.FROM_PROVINCES) {
			const provinceId = get().fullAddress.provinceId
			const districtId = get().fullAddress.districtId
			const adminPostId = get().fullAddress.adminPostId
			const villageId = get().fullAddress.villageId

			if (!provinceId || provinceId === 'N/A') {
				return {
					success: false,
					message: 'Província é obrigatória',
				}
			}
			if (!districtId || districtId === 'N/A') {
				return {
					success: false,
					message: 'Distrito é obrigatório',
				}
			}
			if (!adminPostId || adminPostId === 'N/A') {
				return {
					success: false,
					message: 'Posto Administrativo é obrigatório',
				}
			}
			if (!villageId && villageId !== 'N/A') {
				return {
					success: false,
					message: 'Localidade é obrigatória',
				}
			}
		}

		if (addressLevel === AddressLevel.FROM_DISTRICTS) {
			if (!districtId) {
				return {
					success: false,
					message: 'Distrito é obrigatório',
				}
			}
		}

		if (addressLevel === AddressLevel.FROM_ADMIN_POSTS) {
			if (!adminPostId || adminPostId === 'N/A') {
				return {
					success: false,
					message: 'Posto Administrativo é obrigatório',
				}
			}

			if (!villageId && villageId !== 'N/A') {
				return {
					success: false,
					message: 'Localidade é obrigatória',
				}
			}
		}

		if (addressLevel === AddressLevel.FROM_VILLAGES) {
			if (!villageId) {
				return {
					success: false,
					message: 'Localidade é obrigatória',
				}
			}
		}

		return {
			success: true,
			message: '',
		}
	},
}))
