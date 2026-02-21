import { useState, useEffect, useCallback } from 'react'
import { useNetworkStatus } from './useNetworkStatus'
import { syncPendingInserts, getPendingInsertsCount } from 'src/library/powersync/offline-storage'
import { powersync } from 'src/library/powersync/system'

export const useOfflineSync = () => {
	const [pendingCount, setPendingCount] = useState(0)
	const [isSyncing, setIsSyncing] = useState(false)
	const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
	const isConnected = useNetworkStatus()

	// Update pending count
	const updatePendingCount = useCallback(async () => {
		const count = await getPendingInsertsCount()
		setPendingCount(count)
	}, [])

	// Sync pending inserts
	const syncNow = useCallback(async () => {
		if (isSyncing) return

		setIsSyncing(true)
		try {
			await syncPendingInserts()
			setLastSyncTime(new Date())
			await updatePendingCount()
		} catch (error) {
			console.error('Sync failed:', error)
		} finally {
			setIsSyncing(false)
		}
	}, [isSyncing, updatePendingCount])

	// Auto-sync when network comes back
	useEffect(() => {
		if (isConnected && pendingCount > 0) {
			console.log('Network connected, syncing pending inserts...')
			syncNow()
		}
	}, [isConnected, pendingCount, syncNow])

	// Auto-sync when PowerSync connects
	useEffect(() => {
		if (powersync.connected && pendingCount > 0) {
			console.log('PowerSync connected, syncing pending inserts...')
			syncNow()
		}
	}, [powersync.connected, pendingCount, syncNow])

	// Periodic sync (every 30 seconds)
	useEffect(() => {
		const interval = setInterval(() => {
			if (isConnected && pendingCount > 0) {
				syncNow()
			}
		}, 30000) // 30 seconds

		return () => clearInterval(interval)
	}, [isConnected, pendingCount, syncNow])

	// Update pending count on mount and when syncing
	useEffect(() => {
		updatePendingCount()
	}, [updatePendingCount])

	useEffect(() => {
		if (!isSyncing) {
			updatePendingCount()
		}
	}, [isSyncing, updatePendingCount])

	return {
		pendingCount,
		isSyncing,
		lastSyncTime,
		syncNow,
		updatePendingCount,
	}
}
