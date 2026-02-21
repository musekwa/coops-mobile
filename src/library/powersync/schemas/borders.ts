import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'

export interface BorderType {
	name: string
	border_type: 'OFFICIAL' | 'INFORMAL'
	province_id: string
	country_id: string
	description: string
	sync_id: string
}

export default new Table(
	{
		id: column.text,
		name: column.text,
		border_type: column.text,
		province_id: column.text,
		country_id: column.text,
		description: column.text,
		sync_id: column.text,
	},
	{
		indexes: {
			BordersCountryProvince: ['country_id', 'province_id'],
		},
	},
)

export const buildBorder = (border: BorderType) => {
	const { ...rest } = border
	const uuid = uuidv4()

	return {
		...rest,
		id: uuid,
	}
}
