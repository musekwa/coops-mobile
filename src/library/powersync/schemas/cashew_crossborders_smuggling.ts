import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'

export interface CashewCrossbordersSmugglingType {
	shipment_id: string
	destination_country_id: string
	border_name: string
	smuggling_notes?: string
	sync_id: string
}

export default new Table({
	id: column.text,
	shipment_id: column.text,
	destination_country_id: column.text,
	border_name: column.text,
	smuggling_notes: column.text,
	sync_id: column.text,
})

export const buildCashewCrossbordersSmuggling = (smuggling: CashewCrossbordersSmugglingType) => {
	const { shipment_id, destination_country_id, border_name, smuggling_notes, sync_id } = smuggling
	const id = uuidv4()
	return {
		id,
		shipment_id,
		destination_country_id,
		border_name,
		smuggling_notes: smuggling_notes ?? 'N/A',
		sync_id,
	}
}
