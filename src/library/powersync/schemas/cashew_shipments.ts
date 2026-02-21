import { column, Table } from "@powersync/react-native";
import { v4 as uuidv4 } from 'uuid'

export interface CashewShipmentRecordType {
	shipment_number: string
	owner_id: string
	owner_type: string
	status: string
	sync_id: string
}
export default new Table(
	{
		id: column.text,
		shipment_number: column.text,
		owner_id: column.text,
		owner_type: column.text,
		status: column.text,
		sync_id: column.text
	})

export const buildCashewShipment = (shipment: CashewShipmentRecordType) => {
	const {
		shipment_number,
		owner_id,
		owner_type,
		status,
		sync_id
	} = shipment

    const shipment_id = uuidv4()

    const shipment_row = {
        id: shipment_id,
        shipment_number,
        owner_id,
        owner_type,
        status,
        sync_id
    }

    return shipment_row
}
