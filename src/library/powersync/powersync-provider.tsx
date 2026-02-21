import { Fragment, useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { setupPowerSync, powersync } from './system'
import { useNetworkStatus } from 'src/hooks/useNetworkStatus'
import { useOfflineSync } from 'src/hooks/useOfflineSync'
import { useSessionManager } from 'src/hooks/useSessionManager'

export default function PowersyncProvider({ children }: { children: React.ReactNode }) {
	const [isPowerSyncReady, setIsPowerSyncReady] = useState(false)
	const [powerSyncError, setPowerSyncError] = useState<string | null>(null)
	const isConnected = useNetworkStatus()
	const { pendingCount, isSyncing, lastSyncTime } = useOfflineSync()
	const {
		sessionStatus,
		isInitialized: sessionInitialized,
		needsAttention,
		isExpired,
		refreshSession,
	} = useSessionManager()

	// Setup PowerSync when component mounts and session is ready
	useEffect(() => {
		if (!sessionInitialized) return

		const setup = async () => {
			try {
				console.log('Setting up PowerSync...')
				const success = await setupPowerSync()
				setIsPowerSyncReady(success)
				setPowerSyncError(null)

				if (success) {
					const status = powersync.currentStatus
					console.log('PowerSync status:', JSON.stringify(status, null, 2))
				}
			} catch (error) {
				console.error('Error setting up PowerSync:', error)
				setPowerSyncError(error instanceof Error ? error.message : 'Unknown error')
				setIsPowerSyncReady(false)
			}
		}

		setup()
	}, [sessionInitialized])

	// Handle session expiration and refresh
	useEffect(() => {
		if (!sessionInitialized) return

		const handleSessionIssue = async () => {
			if (isExpired) {
				// Only log warning if refresh actually fails
				const refreshed = await refreshSession()
				if (!refreshed) {
					console.warn('Session expired and could not be refreshed')
					setPowerSyncError('Session expired and could not be refreshed')
					setIsPowerSyncReady(false)
				} else {
					// Successfully refreshed - use debug log instead of warn
					console.log('Session refreshed successfully')
				}
			} else if (needsAttention) {
				// Proactive refresh - use debug log, not warning
				console.log('Session expires soon, proactively refreshing...')
				await refreshSession()
			}
		}

		handleSessionIssue()
	}, [sessionInitialized, isExpired, needsAttention, refreshSession])

	// Handle network changes and session recovery
	useEffect(() => {
		if (isConnected && !isPowerSyncReady && !powerSyncError && sessionInitialized) {
			// Retry PowerSync setup when network comes back
			const retrySetup = async () => {
				try {
					console.log('Retrying PowerSync setup after network recovery...')

					// First try to refresh session if needed
					if (isExpired || needsAttention) {
						await refreshSession()
					}

					const success = await setupPowerSync()
					setIsPowerSyncReady(success)
					setPowerSyncError(null)
				} catch (error) {
					console.error('Error retrying PowerSync setup:', error)
					setPowerSyncError(error instanceof Error ? error.message : 'Unknown error')
				}
			}
			retrySetup()
		}
	}, [isConnected, isPowerSyncReady, powerSyncError, sessionInitialized, isExpired, needsAttention, refreshSession])

	return (
		<Fragment>
			{children}
			{/* Optional: Add connection status indicator for debugging */}
			{__DEV__ && (
				<View
					style={{
						position: 'absolute',
						top: 0,
						right: 0,
						backgroundColor: isPowerSyncReady ? 'green' : 'red',
						padding: 4,
						borderRadius: 4,
						zIndex: 1000,
						minWidth: 140,
					}}
				>
					<Text style={{ color: 'white', fontSize: 10 }}>
						PowerSync: {isPowerSyncReady ? 'Connected' : 'Disconnected'}
					</Text>
					<Text style={{ color: 'white', fontSize: 9 }}>Session: {sessionStatus.isValid ? 'Valid' : 'Invalid'}</Text>
					{pendingCount > 0 && <Text style={{ color: 'yellow', fontSize: 9 }}>Pending: {pendingCount}</Text>}
					{isSyncing && <Text style={{ color: 'cyan', fontSize: 9 }}>Syncing...</Text>}
					{needsAttention && <Text style={{ color: 'orange', fontSize: 9 }}>Session expires soon</Text>}
					{isExpired && <Text style={{ color: 'red', fontSize: 9 }}>Session expired</Text>}
				</View>
			)}
		</Fragment>
	)
}
