import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'
import { TransitType } from 'src/constants/tracking'

export interface ShipmentCheckpointRecordType {
	name: string
	checkpoint_type: TransitType
	description: string
	address_id: string
	sync_id: string
	northern_next_checkpoint_id?: string
	southern_next_checkpoint_id?: string
	eastern_next_checkpoint_id?: string
	western_next_checkpoint_id?: string
}

export default new Table({
	id: column.text,
	name: column.text,
	checkpoint_type: column.text,
	description: column.text,
	address_id: column.text,
	sync_id: column.text,
	northern_next_checkpoint_id: column.text,
	southern_next_checkpoint_id: column.text,
	eastern_next_checkpoint_id: column.text,
	western_next_checkpoint_id: column.text,
})

export const buildShipmentCheckpoint = (shipmentCheckpoint: ShipmentCheckpointRecordType) => {
	const {
		name,
		checkpoint_type,
		description,
		address_id,
		sync_id,
		northern_next_checkpoint_id,
		southern_next_checkpoint_id,
		eastern_next_checkpoint_id,
		western_next_checkpoint_id,
	} = shipmentCheckpoint
	const id = uuidv4()
	return {
		id,
		name,
		checkpoint_type,
		description,
		address_id,
		sync_id,
		northern_next_checkpoint_id: northern_next_checkpoint_id || null,
		southern_next_checkpoint_id: southern_next_checkpoint_id || null,
		eastern_next_checkpoint_id: eastern_next_checkpoint_id || null,
		western_next_checkpoint_id: western_next_checkpoint_id || null,
	}
}
