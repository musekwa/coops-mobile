import 'react-native-get-random-values'
import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Database } from 'src/library/powersync/schemas/AppSchema'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

const authStorage = {
	setItem: async (key: string, value: string) => await AsyncStorage.setItem(key, value),
	getItem: async (key: string) => await AsyncStorage.getItem(key),
	removeItem: async (key: string) => await AsyncStorage.removeItem(key),
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: authStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
		// Extended session configuration
		// flowType: 'pkce',
	},
	global: {
		headers: {
			'X-Client-Info': 'mycoop-mobile',
		},
	},
})

AppState.addEventListener('change', async (state: any) => {
	if (state === 'active') {
		await supabase.auth.startAutoRefresh()
	} else {
		await supabase.auth.stopAutoRefresh()
	}
})

// Initialize session restoration
// const initializeSession = async () => {
// 	try {
// 		const networkState = await NetInfo.fetch()
// 		const {
// 			data: { session },
// 			error,
// 		} = await supabase.auth.getSession()

// 		if (error) {
// 			console.error('Error restoring session:', error)
// 			return
// 		}

// 		if (!session) {
// 			// Only attempt to restore session with credentials if we're online
// 			if (networkState.isConnected) {
// 				const email = await AsyncStorage.getItem('user_email')
// 				const password = await AsyncStorage.getItem('user_password')

// 				if (email && password) {
// 					const { data, error } = await supabase.auth.signInWithPassword({
// 						email,
// 						password,
// 					})
// 					if (error) {
// 						console.error('Error restoring session with stored credentials:', error)
// 						// Only clear stored credentials if we're sure they're invalid
// 						// Don't clear them if we're offline
// 						if (networkState.isConnected) {
// 							await AsyncStorage.removeItem('user_email')
// 							await AsyncStorage.removeItem('user_password')
// 						}
// 					}
// 				}
// 			} else {
// 				console.log('Offline mode: Using stored session data')
// 			}
// 		}
// 	} catch (error) {
// 		console.error('Error in initializeSession:', error)
// 	}
// }

// Call initializeSession when the app starts
// initializeSession()

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
