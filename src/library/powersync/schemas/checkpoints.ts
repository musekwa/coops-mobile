import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'

export type CheckpointRecordType = {
	name: string
	description: string
	sync_id: string
	is_active: 'true' | 'false'
	checkpoint_type: 'INTERNATIONAL' | 'INTERPROVINCIAL' | 'INTERDISTRITAL' | 'INTRADISTRICTAL'
	southern_next_checkpoint_id?: string
	northern_next_checkpoint_id?: string
	eastern_next_checkpoint_id?: string
	western_next_checkpoint_id?: string
}

export default new Table(
	{
		name: column.text,
		description: column.text,
		sync_id: column.text,
		is_active: column.text,
		checkpoint_type: column.text,
		southern_next_checkpoint_id: column.text,
		northern_next_checkpoint_id: column.text,
		eastern_next_checkpoint_id: column.text,
		western_next_checkpoint_id: column.text,
	},
	{
		indexes: {
			Checkpoint: [
				'name',
				'sync_id',
				'southern_next_checkpoint_id',
				'northern_next_checkpoint_id',
				'eastern_next_checkpoint_id',
				'western_next_checkpoint_id',
			],
		},
	},
)

export const buildCheckpoint = (checkpoint: CheckpointRecordType) => {
	const id = uuidv4()
	const checkpoint_row = {
		id: id,
		name: checkpoint.name,
		description: checkpoint.description || null,
		sync_id: checkpoint.sync_id,
		is_active: checkpoint.is_active,
		checkpoint_type: checkpoint.checkpoint_type,
		southern_next_checkpoint_id: checkpoint.southern_next_checkpoint_id || null,
		northern_next_checkpoint_id: checkpoint.northern_next_checkpoint_id || null,
		eastern_next_checkpoint_id: checkpoint.eastern_next_checkpoint_id || null,
		western_next_checkpoint_id: checkpoint.western_next_checkpoint_id || null,
	}
	return checkpoint_row
}
