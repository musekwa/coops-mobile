import { shareAsync } from 'expo-sharing'
import { generate7DaySlot } from 'src/helpers/dates'
import { ActionType, ResourceName } from 'src/types'
import { create } from 'zustand'

export type CurrentResourceType = {
	id: string
	name: ResourceName
}

export type ToastPlayloadType = {
	description: string
	type: 'success' | 'error' | 'warning' | 'info' | 'default'
	title: string
	duration: number
}


export type ActionStore = {
	// 
	toastPayload: {
		description: string
		type: 'success' | 'error' | 'warning' | 'info' | 'default' 
		title: string
		duration: number
	}
	setToast: (data: ToastPlayloadType) => void
	getToast: () => ToastPlayloadType
	resetToast: () => void


	// current resource
	currentResource: CurrentResourceType
	setCurrentResource: (data: CurrentResourceType) => void
	getCurrentResource: () => CurrentResourceType
	resetCurrentResource: () => void


	// base64
	base64: string
	setBase64: (data: string)=>void
	getBase64: ()=>string
	resetBase64: ()=>void

	// next route
	nextRoute: string
	setNextRoute: (data: string) => void
	getNextRoute: () => string
	resetNextRoute: () => void

	// previous route
	previousRoute: string
	setPreviousRoute: (data: string) => void
	getPreviousRoute: () => string
	resetPreviousRoute: () => void

	// start and end dates
	startDate: Date
	setStartDate: (data: Date) => void
	getStartDate: () => Date
	resetStartDate: () => void
	endDate: Date
	setEndDate: (data: Date) => void
	getEndDate: () => Date
	resetEndDate: () => void


	// reloading
	reloading: boolean
	setReloading: (data: boolean) => void
	getReloading: () => boolean
	resetReloading: () => void

	// success
	success: boolean
	setSuccess: (data: boolean) => void
	getSuccess: () => boolean
	resetSuccess: () => void


	// document visibility
	arquiving: boolean
	setArquiving: (data: boolean) => void
	getArquiving: () => boolean
	resetArquiving: () => void

	// show pdf file
	pdfUri: string
	setPdfUri: (data: string) => void
	getPdfUri: () => string
	resetPdfUri: () => void
	sharePdf: (uri: string) => void

	drawerStatus: 'open' | 'closed'
	// check if drawer is open or close
	setDrawerStatus: (status: 'open' | 'closed') => void
	getDrawerStatus: () => 'open' | 'closed'
	resetDrawerStatus: () => void

	// set action type
	addActionType: ActionType
	setAddActionType: (data: ActionType) => void
	getAddActionType: () => ActionType
	resetAddActionType: () => void

	// formal shipment registration form step
	currentStep: number
	totalSteps: number
	setTotalSteps: (data: number) => void
	getTotalSteps: () => number
	resetTotalSteps: () => void
	setCurrentStep: (data: number) => void
	getCurrentStep: () => number
	resetCurrentStep: () => void
	
}

export const useActionStore = create<ActionStore>((set, get) => ({


	// toast
	toastPayload: {
		description: '',
		type: 'default',
		title: '',
		duration: 3000,
	},
	setToast: (data) => set({ toastPayload: data }),
	getToast: () => get().toastPayload,
	resetToast: () =>
		set({
			toastPayload: {
				description: '',
				type: 'default',
				title: '',
				duration: 3000,
			},
		}),


	currentResource: {
		id: '',
		name: ResourceName.UNKNOWN,
	},
	setCurrentResource: (data) => set({ currentResource: data }),
	getCurrentResource: () => get().currentResource,
	resetCurrentResource: () =>
		set({
			currentResource: {
				id: '',
				name: ResourceName.UNKNOWN,
			},
		}),


	// base64
	base64: '',
	setBase64: (data)=>set({
		base64: data
	}),
	getBase64: ()=>get().base64,
	resetBase64: ()=>set({
		base64: ''
	}),

	// next history
	nextRoute: '',
	setNextRoute: (data) => set({ nextRoute: data }),
	getNextRoute: () => get().nextRoute,
	resetNextRoute: () =>
		set({
			nextRoute: '',
		}),


	// previous history
	previousRoute: '',
	setPreviousRoute: (data) => set({ previousRoute: data }),
	getPreviousRoute: () => get().previousRoute,
	resetPreviousRoute: () =>
		set({
			previousRoute: '',
		}),


	// start and end dates
	startDate: generate7DaySlot().start,
	setStartDate: (data) => set({ startDate: data }),
	getStartDate: () =>  get().startDate,
	resetStartDate: () =>
		set({
			startDate: generate7DaySlot().start,
		}),

	endDate: generate7DaySlot().end,
	setEndDate: (data) => set({ endDate: data }),
	getEndDate: () => get().endDate,
	resetEndDate: () =>
		set({
			endDate: generate7DaySlot().end,
		}),


	// reloading
	reloading: false,
	setReloading: (data) => set({ reloading: data }),
	getReloading: () => get().reloading,
	resetReloading: () =>
		set({
			reloading: false,
		}),


	// success
	success: false,
	setSuccess: (data) => set({ success: data }),
	getSuccess: () => get().success,
	resetSuccess: () =>
		set({
			success: false,
		}),

	// document visibility
	arquiving: false,
	setArquiving: (data) => set({ arquiving: data }),
	getArquiving: () => get().arquiving,
	resetArquiving: () =>
		set({
			arquiving: false,
		}),

	// show pdf file
	pdfUri: '',
	setPdfUri: (data) => set({ pdfUri: data }),
	getPdfUri: () => get().pdfUri,
	resetPdfUri: () =>
		set({
			pdfUri: '',
		}),

	sharePdf: async (uri: string) => {
		await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' })
	},

	// check if drawer is open or close
	drawerStatus: 'closed',
	setDrawerStatus: (status) => set({ drawerStatus: status }),
	getDrawerStatus: () => get().drawerStatus,
	resetDrawerStatus: () =>
		set({
			drawerStatus: 'closed',
		}),

	// set action type
	addActionType: ActionType.UNKNOWN,
	setAddActionType: (data) => set({ addActionType: data }),
	getAddActionType: () => get().addActionType,
	resetAddActionType: () =>
		set({
			addActionType: ActionType.UNKNOWN,
		}),


	// formal shipment registration form step
	currentStep: 0,
	totalSteps: 6,
	setTotalSteps: (data: number) => set({ totalSteps: data }),
	getTotalSteps: () => get().totalSteps,
	resetTotalSteps: () =>
		set({
			totalSteps: 6,
		}),
	setCurrentStep: (data) => set({ currentStep: data }),
	getCurrentStep: () => get().currentStep,
	resetCurrentStep: () =>
		set({
			currentStep: 0,
		}),

}))
