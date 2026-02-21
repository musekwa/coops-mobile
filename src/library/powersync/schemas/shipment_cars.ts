import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'

export interface ShipmentCarRecordType {
	car_type: string
	plate_number: string
	sync_id: string
}

export default new Table(
	{
		id: column.text,
		car_type: column.text,
		plate_number: column.text,
		sync_id: column.text,
})

export const buildShipmentCar = (shipmentCar: ShipmentCarRecordType) => {
	const { car_type, plate_number, sync_id } = shipmentCar
	const id = uuidv4()
	return {
		id,
		car_type,
		plate_number,
		sync_id
	}
}