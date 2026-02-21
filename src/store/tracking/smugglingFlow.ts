import { create } from 'zustand'

type SmugglingFlow = {
	borderType: string // 'INBORDERS' | 'CROSSBORDERS'
	shipmentDirection: string // 'INBOUND' | 'OUTBOUND' (only for INBORDERS)
	// Address fields for INBORDERS shipments
	provinceId: string
	districtId: string
	adminPostId: string
	villageId: string
	// Destination country for CROSSBORDERS shipments (country ID)
	destinationCountryId: string
	// Selected border for CROSSBORDERS shipments
	borderId: string
	borderName: string
}

export type SmugglingFlowStore = {
	smugglingFlowInfo: SmugglingFlow
	setSmugglingFlowInfo: (data: SmugglingFlow) => void
	setDestinationCountryId: (destinationCountryId: string) => void
	resetSmugglingFlowInfo: () => void
}

export const initialState: SmugglingFlow = {
	borderType: '',
	shipmentDirection: '',
	provinceId: '',
	districtId: '',
	adminPostId: '',
	villageId: '',
	destinationCountryId: '',
	borderId: '',
	borderName: '',
}

export const useSmugglingFlowStore = create<SmugglingFlowStore>((set, get) => ({
	smugglingFlowInfo: initialState,
	setSmugglingFlowInfo: (data: SmugglingFlow) => set({ smugglingFlowInfo: data }),
	setProvinceId: (provinceId: string) =>
		set({
			smugglingFlowInfo: { ...get().smugglingFlowInfo, provinceId },
		}),
	setDistrictId: (districtId: string) =>
		set({
			smugglingFlowInfo: { ...get().smugglingFlowInfo, districtId },
		}),
	setAdminPostId: (adminPostId: string) =>
		set({
			smugglingFlowInfo: {
				...get().smugglingFlowInfo,
				adminPostId,
			},
		}),
	setVillageId: (villageId: string) =>
		set({
			smugglingFlowInfo: { ...get().smugglingFlowInfo, villageId },
		}),
	setDestinationCountryId: (destinationCountryId: string) =>
		set({
			smugglingFlowInfo: {
				...get().smugglingFlowInfo,
				destinationCountryId,
			},
		}),
	resetSmugglingFlowInfo: () => set({ smugglingFlowInfo: initialState }),
	getSmugglingFlowInfo: () => get().smugglingFlowInfo,
	updateSmugglingFlowInfo: (field: keyof SmugglingFlow, value: string) =>
		set({
			smugglingFlowInfo: {
				...get().smugglingFlowInfo,
				[field]: value,
			},
		}),
}))
