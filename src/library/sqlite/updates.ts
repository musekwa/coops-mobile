import { TABLES, UserDetailsRecord } from 'src/library/powersync/schemas/AppSchema'
import { supabase } from '../supabase/supabase'

export const updateCheckpointLinks = async (
	db: any,
	checkpointId: string,
	links: {
		northern_next_checkpoint_id?: string
		southern_next_checkpoint_id?: string
		eastern_next_checkpoint_id?: string
		western_next_checkpoint_id?: string
	},
) => {
	const {
		northern_next_checkpoint_id,
		southern_next_checkpoint_id,
		eastern_next_checkpoint_id,
		western_next_checkpoint_id,
	} = links

	const query = `
		UPDATE ${TABLES.SHIPMENT_CHECKPOINTS}
		SET 
			northern_next_checkpoint_id = ?,
			southern_next_checkpoint_id = ?,
			eastern_next_checkpoint_id = ?,
			western_next_checkpoint_id = ?
		WHERE id = ?
	`

	await db.execute(query, [
		northern_next_checkpoint_id || null,
		southern_next_checkpoint_id || null,
		eastern_next_checkpoint_id || null,
		western_next_checkpoint_id || null,
		checkpointId,
	])
}

export const updateDistrictUserDetailsById = async (updates: Record<string, string>, userId: string) => {
	try {
	const { data, error } = await supabase.from(TABLES.USER_DETAILS).update(updates).eq('user_id', userId).select("*").single()
	if (error) {
		console.error('Error updating district user details by id:', error)
			return {
				data: null,
				success: false,
				message: 'Error updating district user details by id',
			}
		}
		return {
			data: data as UserDetailsRecord,
			success: true,
			message: 'District user details updated by id',
		}
	} catch (error) {
		console.error('Error updating district user details by id:', error)
		return {
			data: null,
			success: false,
			message: 'Error updating district user details by id',
		}
	}
}
