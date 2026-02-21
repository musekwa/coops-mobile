import { powersync } from './system'
import { ApiClient } from './api-client'
import { AppConfig } from './app-config'
import { insertWithGuarantee } from './offline-storage'

/**
 * Utility function to handle insert operations with PowerSync fallback to ApiClient
 * This ensures data is saved even if PowerSync is not properly connected
 * @deprecated Use insertWithGuarantee for better offline support
 */
export const insertWithFallback = async (
	query: string,
	params: any[],
	tableName: string,
	data: any,
): Promise<{ success: boolean; message: string; data?: any }> => {
	try {
		// Try PowerSync first
		console.log(`Attempting PowerSync insert for table: ${tableName}`)
		const result = await powersync.execute(query, params)
		console.log('PowerSync insert successful:', result)
		return {
			success: true,
			message: 'Data inserted successfully via PowerSync',
			data: result,
		}
	} catch (powerSyncError) {
		console.warn('PowerSync insert failed, falling back to ApiClient:', powerSyncError)

		try {
			// Fallback to ApiClient
			if (!AppConfig.backendUrl) {
				throw new Error('Backend URL not configured for ApiClient fallback')
			}

			const apiClient = new ApiClient(AppConfig.backendUrl)
			await apiClient.upsert({ table: tableName, data })

			console.log('ApiClient insert successful')
			return {
				success: true,
				message: 'Data inserted successfully via ApiClient fallback',
				data: null,
			}
		} catch (apiClientError) {
			console.error('Both PowerSync and ApiClient failed:', apiClientError)
			return {
				success: false,
				message: `Insert failed: PowerSync error: ${powerSyncError}, ApiClient error: ${apiClientError}`,
				data: null,
			}
		}
	}
}

/**
 * RECOMMENDED: Guaranteed insert function that works online, offline, and with poor connectivity
 * This function will ALWAYS succeed in storing data, either immediately or locally for later sync
 */
export { insertWithGuarantee } from './offline-storage'

/**
 * Check if PowerSync is properly connected and ready
 */
export const isPowerSyncReady = (): boolean => {
	return powersync.connected && powersync.currentStatus?.connected === true
}

/**
 * Get PowerSync connection status for debugging
 */
export const getPowerSyncStatus = () => {
	return {
		connected: powersync.connected,
		status: powersync.currentStatus,
		lastSyncedAt: powersync.currentStatus?.lastSyncedAt,
	}
}
