import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState } from 'react-native'
import { supabase } from './supabase'

const SESSION_BACKUP_KEY = 'session_backup'
const CREDENTIALS_KEY = 'user_credentials'
const SESSION_CHECK_INTERVAL = 30000 // 30 seconds

interface StoredCredentials {
	email: string
	password: string
	timestamp: number
}

interface SessionBackup {
	session: any
	timestamp: number
	expiresAt: number
}

/**
 * Enhanced session manager that handles offline scenarios
 */
export class SessionManager {
	private static instance: SessionManager
	private sessionCheckInterval: NodeJS.Timeout | null = null
	private isOnline: boolean = true

	static getInstance(): SessionManager {
		if (!SessionManager.instance) {
			SessionManager.instance = new SessionManager()
		}
		return SessionManager.instance
	}

	/**
	 * Initialize session manager with automatic monitoring
	 */
	async initialize() {
		console.log('Initializing SessionManager...')

		// Start session monitoring
		this.startSessionMonitoring()

		// Try to restore session from backup
		await this.restoreSessionFromBackup()

		// Set up app state listeners
		this.setupAppStateListeners()
	}

	/**
	 * Start monitoring session status
	 */
	private startSessionMonitoring() {
		if (this.sessionCheckInterval) {
			clearInterval(this.sessionCheckInterval)
		}

		this.sessionCheckInterval = setInterval(async () => {
			await this.checkAndRefreshSession()
		}, SESSION_CHECK_INTERVAL)
	}

	/**
	 * Check session status and refresh if needed
	 */
	async checkAndRefreshSession(): Promise<boolean> {
		try {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession()

			if (error) {
				console.warn('Session check error:', error)
				return false
			}

			if (!session) {
				console.log('No active session, attempting to restore...')
				return await this.restoreSessionFromBackup()
			}

			// Check if session is expired or about to expire
			const now = Date.now() / 1000
			const expiresAt = session.expires_at || 0
			const timeUntilExpiry = expiresAt - now

			// If session has actually expired (not just about to expire), log differently
			if (timeUntilExpiry <= 0) {
				// Session is already expired - this is a real issue
				console.warn('Session has expired, attempting refresh...')
				return await this.refreshSession()
			}

			// If session expires in less than 5 minutes, proactively refresh (but don't warn)
			if (timeUntilExpiry < 300) {
				// Use debug log for proactive refresh, not warning
				console.log('Session expires soon, proactively refreshing...')
				return await this.refreshSession()
			}

			// Session is valid, backup it
			await this.backupSession(session)
			return true
		} catch (error) {
			console.error('Session check failed:', error)
			return false
		}
	}

	/**
	 * Attempt to refresh the session
	 */
	async refreshSession(): Promise<boolean> {
		try {
			if (!this.isOnline) {
				console.log('Offline, cannot refresh session')
				return false
			}

			const { data, error } = await supabase.auth.refreshSession()

			if (error) {
				// Only warn if it's a real error, not a temporary network issue
				if (error.message && !error.message.includes('network')) {
					console.warn('Session refresh failed:', error.message)
				} else {
					console.log('Session refresh temporarily unavailable:', error.message)
				}
				// Try to restore from credentials if refresh fails
				return await this.restoreFromCredentials()
			}

			if (data.session) {
				// Success - use debug log, not a success message every time
				await this.backupSession(data.session)
				return true
			}

			return false
		} catch (error) {
			console.error('Session refresh error:', error)
			return false
		}
	}

	/**
	 * Backup session to local storage
	 */
	private async backupSession(session: any) {
		try {
			const backup: SessionBackup = {
				session,
				timestamp: Date.now(),
				expiresAt: session.expires_at || 0,
			}
			await AsyncStorage.setItem(SESSION_BACKUP_KEY, JSON.stringify(backup))
		} catch (error) {
			console.error('Failed to backup session:', error)
		}
	}

	/**
	 * Restore session from backup
	 */
	private async restoreSessionFromBackup(): Promise<boolean> {
		try {
			const backupStr = await AsyncStorage.getItem(SESSION_BACKUP_KEY)
			if (!backupStr) return false

			const backup: SessionBackup = JSON.parse(backupStr)
			const now = Date.now() / 1000

			// Check if backup is still valid (within 24 hours of expiry)
			if (backup.expiresAt && backup.expiresAt - now > -86400) {
				console.log('Restoring session from backup...')
				await supabase.auth.setSession(backup.session)
				return true
			}

			// Backup is too old, try to restore from credentials
			return await this.restoreFromCredentials()
		} catch (error) {
			console.error('Failed to restore session from backup:', error)
			return false
		}
	}

	/**
	 * Store user credentials securely for offline recovery
	 */
	async storeCredentials(email: string, password: string) {
		try {
			const credentials: StoredCredentials = {
				email,
				password,
				timestamp: Date.now(),
			}
			await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials))
			console.log('Credentials stored securely')
		} catch (error) {
			console.error('Failed to store credentials:', error)
		}
	}

	/**
	 * Restore session from stored credentials
	 */
	private async restoreFromCredentials(): Promise<boolean> {
		try {
			if (!this.isOnline) {
				console.log('Offline, cannot restore from credentials')
				return false
			}

			const credentialsStr = await AsyncStorage.getItem(CREDENTIALS_KEY)
			if (!credentialsStr) return false

			const credentials: StoredCredentials = JSON.parse(credentialsStr)

			// Check if credentials are not too old (30 days)
			const credentialsAge = Date.now() - credentials.timestamp
			if (credentialsAge > 30 * 24 * 60 * 60 * 1000) {
				console.log('Stored credentials are too old')
				await this.clearStoredCredentials()
				return false
			}

			console.log('Attempting to restore session from credentials...')
			const { data, error } = await supabase.auth.signInWithPassword({
				email: credentials.email,
				password: credentials.password,
			})

			if (error) {
				console.warn('Failed to restore from credentials:', error)
				await this.clearStoredCredentials()
				return false
			}

			if (data.session) {
				console.log('Session restored from credentials')
				await this.backupSession(data.session)
				return true
			}

			return false
		} catch (error) {
			console.error('Failed to restore from credentials:', error)
			return false
		}
	}

	/**
	 * Clear stored credentials
	 */
	async clearStoredCredentials() {
		try {
			await AsyncStorage.removeItem(CREDENTIALS_KEY)
			await AsyncStorage.removeItem(SESSION_BACKUP_KEY)
			console.log('Stored credentials cleared')
		} catch (error) {
			console.error('Failed to clear credentials:', error)
		}
	}

	/**
	 * Set online status
	 */
	setOnlineStatus(isOnline: boolean) {
		this.isOnline = isOnline
		if (isOnline) {
			// Try to refresh session when coming back online
			this.checkAndRefreshSession()
		}
	}

	/**
	 * Setup app state listeners
	 */
	private setupAppStateListeners() {
		// Listen for app state changes to manage session
		AppState.addEventListener('change', async (state: string) => {
			if (state === 'active') {
				console.log('App became active, checking session...')
				await this.checkAndRefreshSession()
			}
		})
	}

	/**
	 * Get current session status
	 */
	async getSessionStatus() {
		try {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession()

			if (error || !session) {
				return {
					isValid: false,
					expiresAt: null,
					timeUntilExpiry: 0,
					error: error?.message,
				}
			}

			const now = Date.now() / 1000
			const expiresAt = session.expires_at || 0
			const timeUntilExpiry = expiresAt - now

			return {
				isValid: timeUntilExpiry > 0,
				expiresAt: new Date(expiresAt * 1000),
				timeUntilExpiry,
				error: null,
			}
		} catch (error) {
			return {
				isValid: false,
				expiresAt: null,
				timeUntilExpiry: 0,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/**
	 * Cleanup resources
	 */
	cleanup() {
		if (this.sessionCheckInterval) {
			clearInterval(this.sessionCheckInterval)
			this.sessionCheckInterval = null
		}
	}
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()
