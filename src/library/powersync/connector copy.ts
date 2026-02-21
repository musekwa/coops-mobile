import {
	AbstractPowerSyncDatabase,
	CrudEntry,
	PowerSyncBackendConnector,
	PowerSyncCredentials,
	UpdateType,
} from '@powersync/react-native'
// import { ApiClient } from './api-client'
import { AppConfig } from './app-config'
// import { createClient } from '@supabase/supabase-js'
import { supabase } from '../supabase/supabase'

/// Postgres Response codes that we cannot recover from by retrying.
const FATAL_RESPONSE_CODES = [
	// Class 22 — Data Exception
	// Examples include data type mismatch.
	new RegExp('^22...$'),
	// Class 23 — Integrity Constraint Violation.
	// Examples include NOT NULL, FOREIGN KEY and UNIQUE violations.
	new RegExp('^23...$'),
	// INSUFFICIENT PRIVILEGE - typically a row-level security violation
	new RegExp('^42501$'),
]

export class Connector implements PowerSyncBackendConnector {
	async fetchCredentials() {
		try {
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession()
		if (error || !session) {
			console.log('Could not fetch supabase credentials', error)
			return null
		}

		return {
			endpoint: AppConfig.powerSyncUrl ?? '',
			token: session?.access_token ?? '',
			expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
			userID: session.user.id,
			} 
		}
		catch (error) {
			console.log('Could not fetch supabase credentials', error)
			return null
		}
	}
	async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
		const transaction = await database.getNextCrudTransaction()
		if (!transaction) {
			return
		}
		let lastOp: CrudEntry | null = null
		try {
			for (const op of transaction.crud) {
				lastOp = op
				const table = supabase.from(op.table)
				let result: any
				switch (op.op) {
					case UpdateType.PUT: {
						const record = { ...op.opData, id: op.id }
						result = await table.upsert(record)
						break
					}
					case UpdateType.PATCH: {
						result = await table.update(op.opData).eq('id', op.id)
						break
					}
					case UpdateType.DELETE: {
						result = await table.delete().eq('id', op.id)
						break
					}
				}
				if (result.error) {
					console.error(result.error)
					result.error.message = `Could not update supabase. Received error: ${result.error.message}`
					throw result.error
				}
			}
			await transaction.complete()
		} catch (ex: any) {
			console.debug('Error uploading data', ex)
			if (typeof ex.code === 'string' && FATAL_RESPONSE_CODES.some((regex) => regex.test(ex.code))) {
				console.error('Data upload error - discarding:', lastOp, ex)
				await transaction.complete()
			} else {
				throw ex
			}
		}
	}
}
