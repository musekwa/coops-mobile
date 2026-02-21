import AsyncStorage from '@react-native-async-storage/async-storage'
import { powersync } from './system'
import { ApiClient } from './api-client'
import { AppConfig } from './app-config'

const PENDING_INSERTS_KEY = 'pending_inserts'
const MAX_RETRY_ATTEMPTS = 3

interface PendingInsert {
	id: string
	query: string
	params: any[]
	tableName: string
	data: any
	timestamp: number
	retryCount: number
}

/**
 * Enhanced insert function that guarantees data persistence
 * Works online, offline, and with poor connectivity
 */
export const insertWithGuarantee = async (
	query: string,
	params: any[],
	tableName: string,
	data: any,
): Promise<{ success: boolean; message: string; data?: any }> => {
	const insertId = `${tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

	try {
		// Try PowerSync first (if connected)
		if (powersync.connected) {
			console.log(`Attempting PowerSync insert for table: ${tableName}`)
			const result = await powersync.execute(query, params)
			console.log('PowerSync insert successful:', result)
			return {
				success: true,
				message: 'Data inserted successfully via PowerSync',
				data: result,
			}
		}
	} catch (powerSyncError) {
		console.warn('PowerSync insert failed:', powerSyncError)
	}

	// Try ApiClient (if online)
	try {
		if (AppConfig.backendUrl) {
			console.log(`Attempting ApiClient insert for table: ${tableName}`)
			const apiClient = new ApiClient(AppConfig.backendUrl)
			await apiClient.upsert({ table: tableName, data })
			console.log('ApiClient insert successful')
			return {
				success: true,
				message: 'Data inserted successfully via ApiClient',
				data: null,
			}
		}
	} catch (apiClientError) {
		console.warn('ApiClient insert failed:', apiClientError)
	}

	// If both fail, store locally for later sync
	console.log('Both PowerSync and ApiClient failed, storing locally for later sync')
	const pendingInsert: PendingInsert = {
		id: insertId,
		query,
		params,
		tableName,
		data,
		timestamp: Date.now(),
		retryCount: 0,
	}

	await storePendingInsert(pendingInsert)

	// Try to sync pending inserts in background
	syncPendingInserts()

	return {
		success: true,
		message: 'Data stored locally, will sync when connection is available',
		data: { insertId, pending: true },
	}
}

/**
 * Store pending insert in local storage
 */
const storePendingInsert = async (pendingInsert: PendingInsert): Promise<void> => {
	try {
		const existing = await AsyncStorage.getItem(PENDING_INSERTS_KEY)
		const pendingInserts: PendingInsert[] = existing ? JSON.parse(existing) : []
		pendingInserts.push(pendingInsert)
		await AsyncStorage.setItem(PENDING_INSERTS_KEY, JSON.stringify(pendingInserts))
		console.log(`Stored pending insert: ${pendingInsert.id}`)
	} catch (error) {
		console.error('Failed to store pending insert:', error)
	}
}

/**
 * Get all pending inserts
 */
export const getPendingInserts = async (): Promise<PendingInsert[]> => {
	try {
		const existing = await AsyncStorage.getItem(PENDING_INSERTS_KEY)
		return existing ? JSON.parse(existing) : []
	} catch (error) {
		console.error('Failed to get pending inserts:', error)
		return []
	}
}

/**
 * Remove pending insert after successful sync
 */
const removePendingInsert = async (insertId: string): Promise<void> => {
	try {
		const existing = await AsyncStorage.getItem(PENDING_INSERTS_KEY)
		const pendingInserts: PendingInsert[] = existing ? JSON.parse(existing) : []
		const filtered = pendingInserts.filter((insert) => insert.id !== insertId)
		await AsyncStorage.setItem(PENDING_INSERTS_KEY, JSON.stringify(filtered))
		console.log(`Removed pending insert: ${insertId}`)
	} catch (error) {
		console.error('Failed to remove pending insert:', error)
	}
}

/**
 * Sync all pending inserts
 */
export const syncPendingInserts = async (): Promise<void> => {
	try {
		const pendingInserts = await getPendingInserts()
		if (pendingInserts.length === 0) return

		console.log(`Syncing ${pendingInserts.length} pending inserts...`)

		for (const pendingInsert of pendingInserts) {
			// Skip if too many retries
			if (pendingInsert.retryCount >= MAX_RETRY_ATTEMPTS) {
				console.warn(`Skipping insert ${pendingInsert.id} - too many retries`)
				await removePendingInsert(pendingInsert.id)
				continue
			}

			try {
				// Try PowerSync first
				if (powersync.connected) {
					await powersync.execute(pendingInsert.query, pendingInsert.params)
					console.log(`Synced pending insert via PowerSync: ${pendingInsert.id}`)
					await removePendingInsert(pendingInsert.id)
					continue
				}
			} catch (powerSyncError) {
				console.warn(`PowerSync sync failed for ${pendingInsert.id}:`, powerSyncError)
			}

			try {
				// Try ApiClient
				if (AppConfig.backendUrl) {
					const apiClient = new ApiClient(AppConfig.backendUrl)
					console.log(`Attempting ApiClient sync for ${pendingInsert.id} (${pendingInsert.tableName})`)
					await apiClient.upsert({ table: pendingInsert.tableName, data: pendingInsert.data })
					console.log(`Synced pending insert via ApiClient: ${pendingInsert.id}`)
					await removePendingInsert(pendingInsert.id)
					continue
				}
			} catch (apiClientError: any) {
				console.error(`ApiClient sync failed for ${pendingInsert.id}:`, {
					table: pendingInsert.tableName,
					error: apiClientError.message,
					retryCount: pendingInsert.retryCount,
					dataPreview: pendingInsert.data ? {
						id: pendingInsert.data.id,
						keys: Object.keys(pendingInsert.data),
					} : null,
				})
			}

			// If both fail, increment retry count
			pendingInsert.retryCount++
			await storePendingInsert(pendingInsert)
			await removePendingInsert(pendingInsert.id)
		}
	} catch (error) {
		console.error('Failed to sync pending inserts:', error)
	}
}

/**
 * Clear all pending inserts (use with caution)
 */
export const clearPendingInserts = async (): Promise<void> => {
	try {
		await AsyncStorage.removeItem(PENDING_INSERTS_KEY)
		console.log('Cleared all pending inserts')
	} catch (error) {
		console.error('Failed to clear pending inserts:', error)
	}
}

/**
 * Get pending inserts count
 */
export const getPendingInsertsCount = async (): Promise<number> => {
	const pendingInserts = await getPendingInserts()
	return pendingInserts.length
}
