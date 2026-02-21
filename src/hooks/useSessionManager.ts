import { useState, useEffect, useCallback } from 'react'
import { sessionManager } from 'src/library/supabase/session-manager'
import { useNetworkStatus } from './useNetworkStatus'

interface SessionStatus {
	isValid: boolean
	expiresAt: Date | null
	timeUntilExpiry: number
	error: string | null
}

export const useSessionManager = () => {
	const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
		isValid: false,
		expiresAt: null,
		timeUntilExpiry: 0,
		error: null,
	})
	const [isInitialized, setIsInitialized] = useState(false)
	const [hasCheckedSession, setHasCheckedSession] = useState(false)
	const isConnected = useNetworkStatus()

	// Initialize session manager
	useEffect(() => {
		const init = async () => {
			try {
				await sessionManager.initialize()
				
				// Get initial session status
				const status = await sessionManager.getSessionStatus()
				setSessionStatus({
					...status,
					error: status.error || null,
				})
				setHasCheckedSession(true)
				setIsInitialized(true)
			} catch (error) {
				console.error('Failed to initialize session manager:', error)
				setIsInitialized(true) // Still mark as initialized to avoid infinite loading
			}
		}

		init()
	}, [])

	// Update online status when network changes
	useEffect(() => {
		sessionManager.setOnlineStatus(isConnected ?? false)
	}, [isConnected])

	// Check session status periodically
	useEffect(() => {
		if (!isInitialized) return

		const interval = setInterval(async () => {
			const status = await sessionManager.getSessionStatus()
			setSessionStatus({
				...status,
				error: status.error || null,
			})
			setHasCheckedSession(true)
		}, 30000) // Check every 30 seconds

		return () => clearInterval(interval)
	}, [isInitialized])

	// Manual session refresh
	const refreshSession = useCallback(async () => {
		try {
			const success = await sessionManager.refreshSession()
			if (success) {
				const status = await sessionManager.getSessionStatus()
				setSessionStatus({
					...status,
					error: status.error || null,
				})
			}
			return success
		} catch (error) {
			console.error('Manual session refresh failed:', error)
			return false
		}
	}, [])

	// Store credentials for offline recovery
	const storeCredentials = useCallback(async (email: string, password: string) => {
		await sessionManager.storeCredentials(email, password)
	}, [])

	// Clear stored credentials
	const clearCredentials = useCallback(async () => {
		await sessionManager.clearStoredCredentials()
	}, [])

	// Check if session needs attention
	// Only mark as expired if we've actually checked the session and confirmed it's expired
	const needsAttention = hasCheckedSession && sessionStatus.timeUntilExpiry < 300 && sessionStatus.timeUntilExpiry > 0 // Less than 5 minutes
	const isExpired = hasCheckedSession && !sessionStatus.isValid && sessionStatus.timeUntilExpiry <= 0

	return {
		sessionStatus,
		isInitialized,
		needsAttention,
		isExpired,
		refreshSession,
		storeCredentials,
		clearCredentials,
	}
}
