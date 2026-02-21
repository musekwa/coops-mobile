import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'

export interface ShipmentLoadRecordType {
	shipment_id: string
	product_type: string
	quantity: number
	unit: string
	number_of_bags: number
	weight_per_bag: number
	bag_type: string
	driver_id: string
	car_id: string
	sync_id: string
}

export default new Table({
	id: column.text,
	shipment_id: column.text,
	product_type: column.text,
	quantity: column.integer,
	unit: column.text,
	number_of_bags: column.integer,
	weight_per_bag: column.real,
	bag_type: column.text,
	driver_id: column.text,
	car_id: column.text,
	sync_id: column.text,
})

export const buildShipmentLoad = (shipmentLoad: ShipmentLoadRecordType) => {
	const {
		shipment_id,
		product_type,
		quantity,
		unit,
		number_of_bags,
		weight_per_bag,
		bag_type,
		driver_id,
		car_id,
		sync_id,
	} = shipmentLoad
	const id = uuidv4()
	return {
		id,
		shipment_id,
		product_type,
		quantity,
		unit,
		number_of_bags,
		weight_per_bag,
		bag_type,
		driver_id,
		car_id,
		sync_id,
	}
}
