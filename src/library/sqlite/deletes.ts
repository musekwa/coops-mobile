import { powersync } from '../powersync/system'

export async function deleteRecord(tableName: string, where: Record<string, any>) {
	const keys = Object.keys(where)
	if (keys.length === 0) throw new Error('No where clause provided')
	const conditions = keys.map((key) => `${key} = ?`).join(' AND ')
	const values = keys.map((key) => where[key])
	const sql = `DELETE FROM ${tableName} WHERE ${conditions}`
	try {
		await powersync.execute(sql, values)
		console.log(`Record(s) deleted from ${tableName} where ${JSON.stringify(where)}`)
	} catch (error) {
		console.error(`Error deleting record from ${tableName}:`, error)
		throw error
	}
}
