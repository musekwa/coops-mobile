import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'

export interface ShipmentDriverRecordType {
	driver_name: string
	driver_phone: string
	sync_id: string
}

export default new Table(
    {
        id: column.text,
        driver_name: column.text,
        driver_phone: column.text,
        sync_id: column.text,
    }
)

export const buildShipmentDriver = (shipmentDriver: ShipmentDriverRecordType) => { 
    const { driver_name, driver_phone, sync_id } = shipmentDriver
    const id = uuidv4()
    return {
        id,
        driver_name,
        driver_phone,
        sync_id
    }
}