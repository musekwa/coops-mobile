import { create } from 'zustand'
import { userSignOut } from 'src/library/supabase/user-auth'

interface AuthStore {
	isSigningOut: boolean
	signOut: () => Promise<void>
	resetAuthState: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	isSigningOut: false,

	signOut: async () => {
		set({ isSigningOut: true })
		try {
			const result = await userSignOut()
			if (result.success) {
				get().resetAuthState()	
			} else {
				console.error('❌ Sign out failed:', result.error)
			}
		} catch (error) {
			console.error('❌ Error during sign out:', error)
		} finally {
			set({ isSigningOut: false })
		}
	},

	resetAuthState: () => {
		// console.log('🔄 Resetting auth state...')
		// This will trigger a re-render and redirect to login
		// The useUserDetails hook will detect the session change
		// and the root layout will handle the redirect
		set({ isSigningOut: false })
	},
}))
