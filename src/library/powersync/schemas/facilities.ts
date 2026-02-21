import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'
export type FacilityType = {
	name: string
	type: string // FARM, WAREHOUSE, GROUP, FACTORY, NURSERY
	owner_id: string
	sync_id: string
}

export default new Table(
	{
		id: column.text,
		name: column.text,
		type: column.text,
		owner_id: column.text,
		sync_id: column.text,
	},
	{
		indexes: {
			Facility: ['name'],
		},
	},
)

export const buildFacility = (facility: FacilityType) => {
	const { name, type, owner_id, sync_id } = facility
	const id = uuidv4()
	return {
		id,
		name: name ? name : '',
		type,
		owner_id,
		sync_id,
	}
}
