import '@azure/core-asynciterator-polyfill'
import { PowerSyncDatabase, FetchStrategy } from '@powersync/react-native'
import { OPSqliteOpenFactory } from '@powersync/op-sqlite'
import { AppSchema } from './schemas/AppSchema'
import { Connector } from './connector'

const opSqlite = new OPSqliteOpenFactory({
	dbFilename: 'powersync.db',
})

export const powersync = new PowerSyncDatabase({
	schema: AppSchema,
	database: opSqlite,
})

export const setupPowerSync = async () => {
	const connector = new Connector()
	await powersync.init() // Initialize the database before connecting
	await powersync.connect(connector, {
		fetchStrategy: FetchStrategy.Sequential, // Useful for syncing big datasets without timing out
		params: {
			batchSize: 100,
		},
	})

	if (powersync.connected) {
		console.log('PowerSync connected')
		try {
			await powersync.waitForFirstSync({
				priority: 1,
			}) // Wait for the first sync to complete
			console.log('PowerSync first sync complete')
			return true
		} catch (error) {
			console.error('PowerSync error: ', error)
			return true
		}
	} else {
		console.log('PowerSync not connected')
		return false
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
	} else {
		console.log('PowerSync not connected')
		return false
	}
}
