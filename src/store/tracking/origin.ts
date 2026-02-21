import { ActorCategory, CategoryCardType } from 'src/types'
import { create } from 'zustand'

interface LocationType {
	district: string
    province: string
    setLocation: (district: string, province: string) => void
    setDistrict: (district: string) => void
    setProvince: (province: string) => void
    getLocation: () => { district: string, province: string }
    getDistrict: () => string
    getProvince: () => string
    resetLocation: () => void
    resetDistrict: () => void
    resetProvince: () => void

	
}

export const useLocationStore = create<LocationType>((set, get) => ({

    district: '',
    province: '',

    setLocation: (district: string, province: string) => {
        set({ district, province })
    },

    setDistrict: (district: string) => {
        set({ district })
    },

    setProvince: (province: string) => {
        set({ province })
    },

    getLocation: () => {
        return { district: get().district, province: get().province }
    },

    getDistrict: () => {
        return get().district
    },

    getProvince: () => {
        return get().province
    },

    resetLocation: () => {
        set({ district: '', province: '' })
    },

    resetDistrict: () => {
        set({ district: '' })
    },

    resetProvince: () => {
        set({ province: '' })
    },


	
}))
