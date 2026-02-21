import { powersync } from 'src/library/powersync/system'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'

/**
 * Interface for driver check results
 */
export interface DriverCheckResult {
	id: string
	full_name: string
	phone: string
	has_actor_details: boolean
	has_contact_details: boolean
	sync_id: string
}

/**
 * Check all drivers in the actors table
 * Returns all actors with category 'DRIVER' along with their details
 */
export const checkAllDrivers = async (): Promise<DriverCheckResult[]> => {
	try {
		const query = `
			SELECT 
				a.id,
				TRIM(COALESCE(ad.other_names, '') || ' ' || COALESCE(ad.surname, '')) as full_name,
				COALESCE(cd.primary_phone, 'N/A') as phone,
				CASE WHEN ad.id IS NOT NULL THEN 1 ELSE 0 END as has_actor_details,
				CASE WHEN cd.id IS NOT NULL THEN 1 ELSE 0 END as has_contact_details,
				a.sync_id
			FROM ${TABLES.ACTORS} a
			LEFT JOIN ${TABLES.ACTOR_DETAILS} ad ON a.id = ad.actor_id
			LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON a.id = cd.owner_id AND cd.owner_type = 'DRIVER'
			WHERE a.category = 'DRIVER'
			ORDER BY a.sync_id, full_name
		`

		const drivers = await powersync.getAll<DriverCheckResult>(query)
		return drivers || []
	} catch (error) {
		console.error('Error checking drivers:', error)
		throw error
	}
}

/**
 * Check for drivers with missing actor_details or contact_details
 * Returns drivers that are incomplete (missing required data)
 */
export const checkIncompleteDrivers = async (): Promise<DriverCheckResult[]> => {
	try {
		const query = `
			SELECT 
				a.id,
				TRIM(COALESCE(ad.other_names, '') || ' ' || COALESCE(ad.surname, '')) as full_name,
				COALESCE(cd.primary_phone, 'N/A') as phone,
				CASE WHEN ad.id IS NOT NULL THEN 1 ELSE 0 END as has_actor_details,
				CASE WHEN cd.id IS NOT NULL THEN 1 ELSE 0 END as has_contact_details,
				a.sync_id
			FROM ${TABLES.ACTORS} a
			LEFT JOIN ${TABLES.ACTOR_DETAILS} ad ON a.id = ad.actor_id
			LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON a.id = cd.owner_id AND cd.owner_type = 'DRIVER'
			WHERE a.category = 'DRIVER'
				AND (ad.id IS NULL OR cd.id IS NULL)
			ORDER BY a.sync_id, full_name
		`

		const incompleteDrivers = await powersync.getAll<DriverCheckResult>(query)
		return incompleteDrivers || []
	} catch (error) {
		console.error('Error checking incomplete drivers:', error)
		throw error
	}
}

/**
 * Count total drivers
 */
export const countDrivers = async (): Promise<number> => {
	try {
		const query = `
			SELECT COUNT(*) as count
			FROM ${TABLES.ACTORS}
			WHERE category = 'DRIVER'
		`

		const result = await powersync.get<{ count: number }>(query)
		return result?.count || 0
	} catch (error) {
		console.error('Error counting drivers:', error)
		throw error
	}
}

/**
 * Check if a specific actor_id is a driver
 */
export const isDriver = async (actorId: string): Promise<boolean> => {
	try {
		const query = `
			SELECT COUNT(*) as count
			FROM ${TABLES.ACTORS}
			WHERE id = ? AND category = 'DRIVER'
		`

		const result = await powersync.get<{ count: number }>(query, [actorId])
		return (result?.count || 0) > 0
	} catch (error) {
		console.error('Error checking if actor is driver:', error)
		return false
	}
}

/**
 * Get driver by phone number
 */
export const getDriverByPhone = async (phone: string): Promise<DriverCheckResult | null> => {
	try {
		const query = `
			SELECT 
				a.id,
				TRIM(COALESCE(ad.other_names, '') || ' ' || COALESCE(ad.surname, '')) as full_name,
				COALESCE(cd.primary_phone, 'N/A') as phone,
				CASE WHEN ad.id IS NOT NULL THEN 1 ELSE 0 END as has_actor_details,
				CASE WHEN cd.id IS NOT NULL THEN 1 ELSE 0 END as has_contact_details,
				a.sync_id
			FROM ${TABLES.ACTORS} a
			INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON a.id = ad.actor_id
			INNER JOIN ${TABLES.CONTACT_DETAILS} cd ON a.id = cd.owner_id AND cd.owner_type = 'DRIVER'
			WHERE a.category = 'DRIVER' 
				AND (cd.primary_phone = ? OR cd.secondary_phone = ?)
			LIMIT 1
		`

		const driver = await powersync.get<DriverCheckResult>(query, [phone, phone])
		return driver || null
	} catch (error) {
		console.error('Error getting driver by phone:', error)
		return null
	}
}

/**
 * Validate driver data integrity
 * Returns validation results with issues found
 */
export const validateDrivers = async (): Promise<{
	total: number
	complete: number
	incomplete: number
	missing_actor_details: number
	missing_contact_details: number
	issues: DriverCheckResult[]
}> => {
	try {
		const allDrivers = await checkAllDrivers()
		const incompleteDrivers = await checkIncompleteDrivers()

		const missingActorDetails = allDrivers.filter((d) => !d.has_actor_details)
		const missingContactDetails = allDrivers.filter((d) => !d.has_contact_details)

		return {
			total: allDrivers.length,
			complete: allDrivers.length - incompleteDrivers.length,
			incomplete: incompleteDrivers.length,
			missing_actor_details: missingActorDetails.length,
			missing_contact_details: missingContactDetails.length,
			issues: incompleteDrivers,
		}
	} catch (error) {
		console.error('Error validating drivers:', error)
		throw error
	}
}
