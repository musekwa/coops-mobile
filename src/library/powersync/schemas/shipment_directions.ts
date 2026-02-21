import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'

export interface ShipmentDirectionRecordType {
	direction: string
	departure_address_id: string
	destination_address_id: string
	shipment_id: string
	sync_id: string
}

export default new Table({
	id: column.text,
	direction: column.text,
	departure_address_id: column.text,
	destination_address_id: column.text,
	shipment_id: column.text,
	sync_id: column.text,
})

export const buildShipmentDirection = (shipmentDirection: ShipmentDirectionRecordType) => {
	const { direction, departure_address_id, destination_address_id, shipment_id, sync_id } =
		shipmentDirection

	const id = uuidv4()
	const shipment_direction_row = {
		id,
		direction,
		departure_address_id,
		destination_address_id,
		shipment_id,
		sync_id,
	}
	return shipment_direction_row
}
