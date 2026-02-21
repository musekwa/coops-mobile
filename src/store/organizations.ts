import { CoopAffiliationStatus } from 'src/types'
import { create } from 'zustand'

// 1. COOPERATIVE
export type CoopFormDataType = {
	name: string
	creationYear: string
	affiliationYear?: string
	affiliationStatus?: string
	license?: string
	nuel?: string
	nuit?: string

	adminPost?: string
	village?: string
}

export type CoopStore = {
	formData: CoopFormDataType
	setFormData: (data: CoopFormDataType) => void
	getFormData: () => CoopFormDataType
	resetFormData: () => void
	validateFormData: () => { [key: string]: string }
	updateFormData: (field: keyof CoopFormDataType, value: string | number) => void
}

export const coopInitialState: CoopFormDataType = {
	name: '',
	creationYear: '',
	affiliationYear: '',
	affiliationStatus: '',
	license: '',
	nuel: '',
	nuit: '',

	adminPost: '',
	village: '',
}

export const useCoopStore = create<CoopStore>((set, get) => ({
	// CoopFormData: Cooperative being registered
	formData: coopInitialState,
	setFormData: (data) => set({ formData: data }),
	getFormData: () => get().formData,
	resetFormData: () =>
		set({
			formData: coopInitialState,
		}),
	validateFormData: () => {
		let errors: { [key: string]: string } = {}
		const {
			formData: { name, creationYear, affiliationYear, affiliationStatus, license, nuel, nuit, adminPost, village },
		} = get()

		// creationYear should not be empty
		if (!creationYear) {
			errors = { ...errors, creationYear: 'Indica o ano de criação' }
		}

		// If affiliationStatus is "AFFILIATED" then affiliationYear should not be empty
		if (affiliationStatus === CoopAffiliationStatus.AFFILIATED && !affiliationYear) {
			errors = { ...errors, affiliationYear: 'Indica o ano de afiliação' }
		}

		// If affiliationStatus is "AFFILIATED" and creationYear and affiliationYear are provided, then affiliationYear must be equal or greater than creationYear
		if (affiliationStatus === CoopAffiliationStatus.AFFILIATED && creationYear && affiliationYear) {
			if (Number(affiliationYear) < Number(creationYear)) {
				errors = {
					...errors,
					affiliationYear: 'Ano de legalização deve ser maior ou igual ao ano de criação',
					creationYear: 'Ano de criação deve ser menor ou igual ao ano de legalização',
				}
			}
		}

		return errors
	},

	updateFormData: (field, value) =>
		set((state) => ({
			formData: {
				...state.formData,
				[field]: value,
			},
		})),
}))

// 2. ASSOCIATION
export type AssociationFormDataType = {
	name: string
	creationYear: string
	affiliationYear?: string
	affiliationStatus?: string
	license?: string
	nuel?: string
	nuit?: string

	adminPost?: string
	village?: string
}

export type AssociationStore = {
	formData: AssociationFormDataType
	setFormData: (data: AssociationFormDataType) => void
	getFormData: () => AssociationFormDataType
	resetFormData: () => void
	validateFormData: () => { [key: string]: string }
	updateFormData: (field: keyof AssociationFormDataType, value: string | number) => void
}

export const associationInitialState: AssociationFormDataType = {
	name: '',
	creationYear: '',
	affiliationYear: '',
	affiliationStatus: '',
	license: '',
	nuel: '',
	nuit: '',

	adminPost: '',
	village: '',
}

export const useAssociationStore = create<AssociationStore>((set, get) => ({
	formData: associationInitialState,
	setFormData: (data) => set({ formData: data }),
	getFormData: () => get().formData,
	resetFormData: () =>
		set({
			formData: associationInitialState,
		}),
	validateFormData: () => {
		let errors: { [key: string]: string } = {}
		const {
			formData: { name, creationYear, affiliationYear, affiliationStatus, license, nuel, nuit, adminPost, village },
		} = get()

		// creationYear should not be empty
		if (!creationYear) {
			errors = { ...errors, creationYear: 'Indica o ano de criação' }
		}

		// If affiliationStatus is "AFFILIATED" then affiliationYear should not be empty
		if (affiliationStatus === CoopAffiliationStatus.AFFILIATED && !affiliationYear) {
			errors = { ...errors, affiliationYear: 'Indica o ano de afiliação' }
		}

		// If affiliationStatus is "AFFILIATED" and creationYear and affiliationYear are provided, then affiliationYear must be equal or greater than creationYear
		if (affiliationStatus === CoopAffiliationStatus.AFFILIATED && creationYear && affiliationYear) {
			if (Number(affiliationYear) < Number(creationYear)) {
				errors = {
					...errors,
					affiliationYear: 'Ano de legalização deve ser maior ou igual ao ano de criação',
					creationYear: 'Ano de criação deve ser menor ou igual ao ano de legalização',
				}
			}
		}

		return errors
	},

	updateFormData: (field, value) =>
		set((state) => ({
			formData: {
				...state.formData,
				[field]: value,
			},
		})),
}))

// 3 COOP_UNION

export type CoopUnionFormDataType = {
	name: string
	affiliationYear?: string
	license?: string
	nuel?: string
	nuit?: string

	adminPost?: string
	village?: string
}

export type CoopUnionStore = {
	formData: CoopUnionFormDataType
	setFormData: (data: CoopUnionFormDataType) => void
	getFormData: () => CoopUnionFormDataType
	resetFormData: () => void
	validateFormData: () => { [key: string]: string }
	updateFormData: (field: keyof OrgFormDataType, value: string | number) => void
}

export const coopUnionInitialState: CoopUnionFormDataType = {
	name: '',
	affiliationYear: '',
	license: '',
	nuel: '',
	nuit: '',

	adminPost: '',
	village: '',
}

export const useCoopUnionStore = create<CoopUnionStore>((set, get) => ({
	formData: coopUnionInitialState,
	setFormData: (data) => set({ formData: data }),
	getFormData: () => get().formData,
	resetFormData: () =>
		set({
			formData: coopUnionInitialState,
		}),
	validateFormData: () => {
		let errors: { [key: string]: string } = {}
		const {
			formData: { name, affiliationYear, license, nuel, nuit, adminPost, village },
		} = get()

		return errors
	},

	updateFormData: (field, value) =>
		set((state) => ({
			formData: {
				...state.formData,
				[field]: value,
			},
		})),
}))

export type OrgFormDataType = {
	name: string
	totalMembers: number | string
	totalWomen: number | string
	purposes: string[]
	creationYear: string
	affiliationYear?: string
	affiliationStatus?: string
	license?: string
	nuel?: string
	nuit?: string

	adminPost?: string
	village?: string
}

export type OrgStore = {
	formData: OrgFormDataType
	setFormData: (data: OrgFormDataType) => void
	getFormData: () => OrgFormDataType
	resetFormData: () => void
	validateFormData: () => { [key: string]: string }
	updateFormData: (field: keyof OrgFormDataType, value: string | number) => void
}

export const initialState: OrgFormDataType = {
	name: '',
	totalMembers: '',
	totalWomen: '',
	purposes: [],
	creationYear: '',
	affiliationYear: '',
	affiliationStatus: '',
	license: '',
	nuel: '',
	nuit: '',

	adminPost: '',
	village: '',
}

export const useOrganizationStore = create<OrgStore>((set, get) => ({
	formData: initialState,
	setFormData: (data) => set({ formData: data }),
	getFormData: () => get().formData,
	resetFormData: () =>
		set({
			formData: initialState,
		}),
	validateFormData: () => {
		let errors: { [key: string]: string } = {}
		const {
			formData: {
				name,
				totalMembers,
				totalWomen,
				purposes,
				creationYear,
				affiliationYear,
				affiliationStatus,
				license,
				nuel,
				nuit,
				adminPost,
				village,
			},
		} = get()

		// TotalMembers should not be empty and should be greater than 0
		if (!totalMembers) {
			errors = { ...errors, totalMembers: 'Indica o número de membros' }
		}

		// TotalWomen should be their 0 or greater than 0 and should not be greater than totalMembers
		if (!totalWomen) {
			errors = { ...errors, totalWomen: 'Indica o número de mulheres' }
		} else if (Number(totalWomen) > Number(totalMembers)) {
			errors = {
				...errors,
				totalWomen: 'O número superior ao total de membros',
			}
		}

		// purposes should not be empty
		if (purposes.length === 0) {
			errors = { ...errors, purposes: 'Selecciona pelo menos uma finalidade' }
		}

		// creationYear should not be empty
		if (!creationYear) {
			errors = { ...errors, creationYear: 'Indica o ano de criação' }
		}

		// If affiliationStatus is "AFFILIATED" then affiliationYear should not be empty
		if (affiliationStatus === CoopAffiliationStatus.AFFILIATED && !affiliationYear) {
			errors = { ...errors, affiliationYear: 'Indica o ano de afiliação' }
		}

		// If affiliationStatus is "AFFILIATED" and creationYear and affiliationYear are provided, then affiliationYear must be equal or greater than creationYear
		if (affiliationStatus === CoopAffiliationStatus.AFFILIATED && creationYear && affiliationYear) {
			if (Number(affiliationYear) < Number(creationYear)) {
				errors = {
					...errors,
					affiliationYear: 'Ano de legalização deve ser maior ou igual ao ano de criação',
					creationYear: 'Ano de criação deve ser menor ou igual ao ano de legalização',
				}
			}
		}

		// affiliationStatus should not be empty
		if (!affiliationStatus) {
			errors = { ...errors, affiliationStatus: 'Indica o estado de afiliação' }
		}

		// If affiliationStatus is "AFFILIATED" then affiliationYear should not be empty
		if (affiliationStatus === CoopAffiliationStatus.AFFILIATED && !affiliationYear) {
			errors = { ...errors, affiliationYear: 'Indica o ano de afiliação' }
		}

		// If affiliationStatus is "AFFILIATED" then license should not be empty
		if (affiliationStatus === CoopAffiliationStatus.AFFILIATED && !license) {
			errors = { ...errors, license: 'Indica a licença' }
		}

		// If affiliationStatus is "AFFILIATED" then nuel should not be empty
		if (affiliationStatus === CoopAffiliationStatus.AFFILIATED && !nuel) {
			errors = { ...errors, nuel: 'Indica o NUEL' }
		}

		// If affiliationStatus is "AFFILIATED" then nuit should not be empty
		if (affiliationStatus === CoopAffiliationStatus.AFFILIATED && !nuit) {
			errors = { ...errors, nuit: 'Indica o NUIT' }
		}

		// adminPost should not be empty
		if (!adminPost) {
			errors = { ...errors, adminPost: 'Indica o posto administrativo' }
		}

		// village should not be empty
		if (!village) {
			errors = { ...errors, village: 'Indica a localidade' }
		}

		return errors
	},

	updateFormData: (field, value) =>
		set((state) => ({
			formData: {
				...state.formData,
				[field]: value,
			},
		})),
}))
