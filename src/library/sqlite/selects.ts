import { TABLES } from '../powersync/schemas/AppSchema'
import { powersync } from '../powersync/system'

// select district name by id and return the district name
export const getDistrictById = async (id: string): Promise<string | null> => {
	if (!id) return null
	try {
		const data = await powersync.get<{ name: string }>(`SELECT name FROM ${TABLES.DISTRICTS} WHERE id = ?`, [id])
		return data?.name || null
	} catch (error) {
		console.error('Error getting district by id:', error)
		return null
	}
}

// select districts by province_id and return the districts
export const getDistrictsByProvinceId = async (province_id: string): Promise<{ name: string; id: string }[] | null> => {
	try {
		const data = await powersync.getAll<{ name: string; id: string }>(
			`SELECT name, id FROM ${TABLES.DISTRICTS} WHERE province_id = ?`,
			[province_id],
		)
		return data || []
	} catch (error) {
		console.error('Error getting districts by province_id:', error)
		return []
	}
}

// select province name by id and return the province name
export const getProvinceById = async (id: string): Promise<string | null> => {
	try {
		const data = await powersync.get<{ name: string }>(`SELECT name FROM ${TABLES.PROVINCES} WHERE id = ?`, [id])
		return data?.name || null
	} catch (error) {
		console.error('Error getting province by id:', error)
		return null
	}
}

// select admin_post by id and return the admin_post name
export const getAdminPostById = async (id: string): Promise<string | null> => {
	try {
		const data = await powersync.get<{ name: string }>(`SELECT name FROM ${TABLES.ADMIN_POSTS} WHERE id = ?`, [id])
		return data?.name || null
	} catch (error) {
		console.error('Error getting admin_post by id:', error)
		return null
	}
}

// select admin_posts by district_id and return the admin_posts
export const getAdminPostsByDistrictId = async (
	district_id: string,
): Promise<{ name: string; id: string }[] | null> => {
	try {
		const data = await powersync.getAll<{ name: string; id: string }>(
			`SELECT name, id FROM ${TABLES.ADMIN_POSTS} WHERE district_id = ?`,
			[district_id],
		)
		return data || []
	} catch (error) {
		console.error('Error getting admin_posts by district_id:', error)
		return []
	}
}

// select village name by id and return the village name
export const getVillageById = async (id: string): Promise<string | null> => {
	try {
		const data = await powersync.get<{ name: string }>(`SELECT name FROM ${TABLES.VILLAGES} WHERE id = ?`, [id])
		return data?.name || null
	} catch (error) {
		console.error('Error getting village by id:', error)
		return null
	}
}

// select villages by admin_post_id and return the villages
export const getVillagesByAdminPostId = async (
	admin_post_id: string,
): Promise<{ name: string; id: string }[] | null> => {
	try {
		const data = await powersync.getAll<{ name: string; id: string }>(
			`SELECT name, id FROM ${TABLES.VILLAGES} WHERE admin_post_id = ?`,
			[admin_post_id],
		)
		return data || []
	} catch (error) {
		console.error('Error getting villages by admin_post_id:', error)
		return []
	}
}

export const getCountryById = async (id: string): Promise<string | null> => {
	try {
		const data = await powersync.get<{ name: string }>(`SELECT name FROM ${TABLES.COUNTRIES} WHERE id = ?`, [id])
		return data?.name || null
	} catch (error) {
		console.error('Error getting country by id:', error)
		return null
	}
}

export const getAdminPostIdByName = async (name: string): Promise<string | null> => {
	try {
		const data = await powersync.get<{ id: string }>(`SELECT id FROM ${TABLES.ADMIN_POSTS} WHERE name = ?`, [name])
		return data?.id || null
	} catch (error) {
		console.error('Error getting admin_post id by name:', error)
		return null
	}
}

export const getVillageIdByName = async (name: string): Promise<string | null> => {
	try {
		const data = await powersync.get<{ id: string }>(`SELECT id FROM ${TABLES.VILLAGES} WHERE name = ?`, [name])
		return data?.id || null
	} catch (error) {
		console.error('Error getting village id by name:', error)
		return null
	}
}

export const getLinkedCheckpoints = async (db: any, checkpointId: string) => {
	const query = `
		SELECT 
			sc.*,
			p.name as province_name,
			d.name as district_name,
			ap.name as admin_post_name,
			v.name as village_name
		FROM ${TABLES.CHECKPOINTS} sc
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
		LEFT JOIN ${TABLES.PROVINCES} p ON a.province_id = p.id
		LEFT JOIN ${TABLES.DISTRICTS} d ON a.district_id = d.id
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON a.admin_post_id = ap.id
		LEFT JOIN ${TABLES.VILLAGES} v ON a.village_id = v.id
		WHERE sc.id IN (
			SELECT northern_next_checkpoint_id FROM ${TABLES.SHIPMENT_CHECKPOINTS} WHERE id = ?
			UNION
			SELECT southern_next_checkpoint_id FROM ${TABLES.SHIPMENT_CHECKPOINTS} WHERE id = ?
			UNION
			SELECT eastern_next_checkpoint_id FROM ${TABLES.SHIPMENT_CHECKPOINTS} WHERE id = ?
			UNION
			SELECT western_next_checkpoint_id FROM ${TABLES.SHIPMENT_CHECKPOINTS} WHERE id = ?
		)
	`

	const result = await db.getAll(query, [checkpointId, checkpointId, checkpointId, checkpointId])
	return result
}
