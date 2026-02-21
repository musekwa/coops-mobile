import '@azure/core-asynciterator-polyfill'
import { FetchStrategy, PowerSyncDatabase } from '@powersync/react-native'
import { Connector } from './connector'
import { AppSchema } from './schemas/AppSchema'

export const powersync = new PowerSyncDatabase({
	database: {
		dbFilename: process.env.EXPO_PUBLIC_POWERSYNC_DB_FILENAME ?? 'powersync.db',
		debugMode: true,
	},
	schema: AppSchema,
}) 

export const setupPowerSync = async () => {
	const connector = new Connector()
	await powersync.init() // initialize the database before connecting to the connector
	await powersync.connect(connector, {
		fetchStrategy: FetchStrategy.Sequential, // useful for syncing big datasets without timing out even if the connection is poor
		params: {
			batchSize: 100,
		},
	})
	if (powersync.connected) {
		console.log('PowerSync connected')
		try {
			// console.log('PowerSync is starting first sync')
			await powersync.waitForFirstSync({
				priority: 1,
			}) // wait for the first sync to complete
			console.log('PowerSync first sync complete')
			return true
		} catch (error) {
			console.error('PowerSync error: ', error)
			return true
		}
	} else {
		console.log('PowerSync not connected')
		// force sync	
		// return await forceSync()
		return true
	}
}

export const forceSync = async () => {
	console.log('Forcing PowerSync sync...')
	await powersync.disconnect()
	const connector = new Connector()
	await powersync.connect(connector, {
		fetchStrategy: FetchStrategy.Sequential,
		params: {
			batchSize: 100,
		},
	})
	if (powersync.connected) {
		try {
			await powersync.waitForFirstSync({
				priority: 1,
			})
			console.log('PowerSync force sync complete')
			return true
		} catch (error) {
			console.error('PowerSync force sync error: ', error)
			return false
		}
	}
	else {
		console.log('PowerSync not connected')
		return false
	}
}