import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'

export interface ShipmentCheckRecordType {
	shipment_id: string
	checkpoint_id: string
	checkpoint_type: 'DEPARTURE' | 'AT_ARRIVAL' | 'IN_TRANSIT'
	shipment_direction_id: string
	checked_by_id: string
	checked_at: string
	notes?: string | null
	sync_id: string
}

export default new Table({
	id: column.text,
	shipment_id: column.text,
	checkpoint_id: column.text,
	checkpoint_type: column.text,
	shipment_direction_id: column.text,
	checked_by_id: column.text,
	checked_at: column.text,
	notes: column.text,
	sync_id: column.text,
})

export const buildShipmentCheck = (shipmentCheck: ShipmentCheckRecordType) => {
	const {
		shipment_id,
		checkpoint_id,
		checkpoint_type,
		shipment_direction_id,
		checked_by_id,
		checked_at,
		notes,
		sync_id,
	} = shipmentCheck

	const shipment_check_id = uuidv4()

	const shipment_check_row = {
		id: shipment_check_id,
		shipment_id,
		checkpoint_id,
		checkpoint_type,
		shipment_direction_id,
		checked_by_id,
		checked_at,
		notes: notes || null,
		sync_id,
	}

	return shipment_check_row
}
