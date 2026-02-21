import { create } from 'zustand'

export type TrailerPlateNumberStore = {
	trailerPlateNumbers: string[]
	setTrailerPlateNumber: (index: number, plateNumber: string) => void
	initializeTrailerPlateNumbers: (numberOfTrailers: number) => void
	resetTrailerPlateNumbers: () => void
	getTrailerPlateNumber: (index: number) => string
	validateTrailerPlateNumbers: () => { message: string; isValid: boolean }
}

export const useTrailerPlateNumberStore = create<TrailerPlateNumberStore>((set, get) => ({
	trailerPlateNumbers: [],
	setTrailerPlateNumber: (index: number, plateNumber: string) => {
		const currentPlateNumbers = [...get().trailerPlateNumbers]
		currentPlateNumbers[index] = plateNumber
		set({ trailerPlateNumbers: currentPlateNumbers })
	},
	initializeTrailerPlateNumbers: (numberOfTrailers: number) => {
		const trailerPlateNumbers = Array(numberOfTrailers).fill('')
		set({ trailerPlateNumbers })
	},
	resetTrailerPlateNumbers: () => set({ trailerPlateNumbers: [] }),
	getTrailerPlateNumber: (index: number) => {
		return get().trailerPlateNumbers[index] || ''
	},
	validateTrailerPlateNumbers: () => {
		const { trailerPlateNumbers } = get()

		for (let i = 0; i < trailerPlateNumbers.length; i++) {
			if (!trailerPlateNumbers[i] || trailerPlateNumbers[i].trim() === '') {
				return {
					message: `Indique a matrícula do trailer ${i + 1}`,
					isValid: false,
				}
			}
		}

		return {
			message: '',
			isValid: true,
		}
	},
}))
