import { useState, useEffect } from 'react'
import { powersync } from 'src/library/powersync/system'
import { isPowerSyncReady, getPowerSyncStatus } from 'src/library/powersync/insert-utils'

export const usePowerSyncStatus = () => {
	const [isReady, setIsReady] = useState(false)
	const [isConnected, setIsConnected] = useState(false)
	const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const checkStatus = () => {
			try {
				const ready = isPowerSyncReady()
				const status = getPowerSyncStatus()

				setIsReady(ready)
				setIsConnected(status.connected)
				setLastSyncedAt(status.lastSyncedAt ? new Date(status.lastSyncedAt) : null)
				setError(null)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error')
				setIsReady(false)
				setIsConnected(false)
			}
		}

		// Check status immediately
		checkStatus()

		// Set up interval to check status periodically
		const interval = setInterval(checkStatus, 5000) // Check every 5 seconds

		// Listen to PowerSync status changes
		const unsubscribe = powersync.registerListener({
			onStatusChanged: (status) => {
				setIsConnected(status.connected)
				setLastSyncedAt(status.lastSyncedAt ? new Date(status.lastSyncedAt) : null)
			},
		})

		return () => {
			clearInterval(interval)
			unsubscribe()
		}
	}, [])

	return {
		isReady,
		isConnected,
		lastSyncedAt,
		error,
		status: getPowerSyncStatus(),
	}
}
