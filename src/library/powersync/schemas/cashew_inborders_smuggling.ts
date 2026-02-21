import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'

export interface CashewInbordersSmugglingType {
	shipment_id: string
	destination_district_id: string
	departure_district_id: string
	smuggling_notes?: string
	sync_id: string
}

export default new Table({
	id: column.text,
	shipment_id: column.text,
	destination_district_id: column.text,
	departure_district_id: column.text,
	smuggling_notes: column.text,
	sync_id: column.text,
})

export const buildCashewInbordersSmuggling = (smuggling: CashewInbordersSmugglingType) => {
	const { shipment_id, destination_district_id, departure_district_id, smuggling_notes, sync_id } = smuggling
	const id = uuidv4()
	return {
		id,
		shipment_id,
		destination_district_id,
		departure_district_id,
		smuggling_notes: smuggling_notes ?? 'N/A',
		sync_id,
	}
}
