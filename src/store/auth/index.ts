import { create } from 'zustand'

export type AuthStore = {
    currentEmail: string
    setCurrentEmail: (email: string) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
	currentEmail: '',

    setCurrentEmail: (email: string) => set({ currentEmail: email }),
}))

