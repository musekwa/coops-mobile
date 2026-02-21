import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'

export interface ShipmentCheckpointSequenceRecordType {
	shipment_id: string
	shipment_direction_id: string
	checkpoint_id: string
	sequence_order: number
	sync_id: string
	created_at?: string
}

export default new Table({
	id: column.text,
	shipment_id: column.text,
	shipment_direction_id: column.text,
	checkpoint_id: column.text,
	sequence_order: column.integer,
	sync_id: column.text,
	created_at: column.text,
})

export const buildShipmentCheckpointSequence = (sequence: ShipmentCheckpointSequenceRecordType) => {
	const { shipment_id, shipment_direction_id, checkpoint_id, sequence_order, sync_id, created_at } = sequence
	const id = uuidv4()
	return {
		id,
		shipment_id,
		shipment_direction_id,
		checkpoint_id,
		sequence_order,
		sync_id,
		created_at: created_at || new Date().toISOString(),
	}
}
