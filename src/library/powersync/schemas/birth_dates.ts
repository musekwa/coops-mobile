import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'

export type BirthDateType = {
	owner_id: string
	owner_type: string // FARMER, TRADER, GROUP
	day: number
	month: number
	year: number
	sync_id: string
}

export default new Table(
	{
		id: column.text,
		owner_id: column.text,
		owner_type: column.text,
		day: column.integer,
		month: column.integer,
		year: column.integer,
		sync_id: column.text,
	},
	{
		indexes: {
			BirthDate: ['day', 'month', 'year'],
		},
	},
)

export const buildBirthDate = (birthDate: BirthDateType) => {
	const { ...rest } = birthDate
	const uuid = uuidv4()
	return {
		...rest,
		id: uuid,
	}
}
