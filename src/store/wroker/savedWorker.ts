import { create } from 'zustand'

export type WorkerDetailsType = {
	_id: string
	name: string
	phone: string
	photo: string
	position: string
	assignedTo: string
	province: string
	district: string
	adminPost: string
	village: string
}

export type WorkerDetailsStore = {
	workerList: WorkerDetailsType[]
	workerDetails: WorkerDetailsType

	// trader details
	setWorkerDetails: (details: WorkerDetailsType) => void
	getWorkerDetails: () => WorkerDetailsType
	resetWorkerDetails: () => void

	// worker list
	setWorkerList: (list: WorkerDetailsType[]) => void
	getWorkerList: () => WorkerDetailsType[]
	resetWorkerList: () => void
}

export const initialState: WorkerDetailsType = {
	_id: '',
	photo: '',
	province: '',
	district: '',
	adminPost: '',
	village: '',
	name: '',
	phone: '',
	position: '',
	assignedTo: '',
}


export const useWorkerDetailsStore = create<WorkerDetailsStore>((set, get) => ({
	workerList: [],
	workerDetails: initialState,
	// single trader details
	setWorkerDetails: (details: WorkerDetailsType) => set({ workerDetails: details }),
	getWorkerDetails: () => get().workerDetails,
	resetWorkerDetails: () => set({ workerDetails: initialState }),

	// worker list
	setWorkerList: (list) => set({ workerList: list }),
	getWorkerList: () => get().workerList,
	resetWorkerList: () =>
		set({
			workerList: [],
		}),
}))
