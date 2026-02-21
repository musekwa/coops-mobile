import { create } from 'zustand'

export type FarmerIdType = {
	farmerId: string
}

export type FarmerIdStore = {
	farmerId: FarmerIdType
	setFarmerId: (data: FarmerIdType) => void
	getFarmerId: () => FarmerIdType
	resetFarmerId: () => void
}

const state: FarmerIdType = {
	farmerId: '',
}

export const useFarmerId = create<FarmerIdStore>((set, get) => ({
	farmerId: state,
	setFarmerId: (data) => set({ farmerId: data }),
	getFarmerId: () => get().farmerId,
	resetFarmerId: () =>
		set({
			farmerId: state,
		}),
}))

export type FarmerFormDataType = {
	isServiceProvider: 'YES' | 'NO' | undefined
	isSmallScale: 'YES' | 'NO' | undefined
	surname: string
	otherNames: string
	gender?: 'Masculino' | 'Feminino' | undefined
	familySize?: number | string
	birthDate: Date
	primaryPhone?: string
	secondaryPhone?: string

	nuit?: string
	docType?: string
	docNumber?: string
}

export type FarmerStore = {
	formData: FarmerFormDataType
	setFormData: (data: FarmerFormDataType) => void
	getFormData: () => FarmerFormDataType
	resetFormData: () => void
	validateFormData: () => { [key: string]: string }
	updateFormData: (field: keyof FarmerFormDataType, value: string | number | Date | boolean) => void
}

export const initialState: FarmerFormDataType = {
	isServiceProvider: undefined,
	isSmallScale: undefined,
	surname: '',
	otherNames: '',
	gender: undefined,
	familySize: '',
	birthDate: new Date(),
	primaryPhone: undefined,
	secondaryPhone: undefined,

	nuit: undefined,
	docType: '',
	docNumber: '',
}

export const useFarmerStore = create<FarmerStore>((set, get) => ({
	// FarmerFormData: Farmer being registered
	formData: initialState,
	setFormData: (data) => set({ formData: data }),
	getFormData: () => get().formData,
	resetFormData: () =>
		set({
			formData: initialState,
		}),
	validateFormData: () => {
		const {
			formData: {
				surname,
				otherNames,
				primaryPhone,
				secondaryPhone,
				docNumber,
				docType,
				birthDate,
				nuit,
				gender,
				familySize,
			},
		} = get()
		let errors: { [key: string]: string } = {}

		if (primaryPhone && secondaryPhone && primaryPhone === secondaryPhone) {
			errors = { ...errors, primaryPhone: 'Os telefones devem ser diferentes' }
		}

		if (!surname.toLowerCase().includes('company')) {
			// check if date is not empty and is valid date
			if (!birthDate || isNaN(birthDate.getTime())) {
				errors = { ...errors, birthDate: 'Indica a data de nascimento' }
			}

			// If docType is "Não tem", then docNumber should be empty
			if (docType === 'Não tem' && docNumber) {
				errors = { ...errors, docType: 'Indica o tipo de Documento válido.' }
			}
			// If docType is empty and docNumber is empty
			if (!docType && !docNumber) {
				errors = { ...errors, docType: 'Indica o tipo de Documento' }
			}

			// If exist and docType is not "Não tem" and docNumber is empty
			if (docType && docType !== 'Não tem' && !docNumber) {
				errors = { ...errors, docNumber: 'Indica o Número do Documento' }
			}

			// check if gender is not empty
			if (!gender) {
				errors = { ...errors, gender: 'Indica o genero' }
			}

			// check if familySize is not empty
			if (!familySize) {
				errors = { ...errors, familySize: 'Indica o número de membros da família' }
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
