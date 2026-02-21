import { column, Table } from '@powersync/react-native'

export default new Table(
	{
		id: column.text,
		full_name: column.text,
		email: column.text,
		phone: column.text,
		district_id: column.text,
		province_id: column.text,
		user_role: column.text,
		user_id: column.text,
		created_at: column.text,
		updated_at: column.text,
		status: column.text,
	},
	{
		indexes: {
			UserDetails: ['email'],
		},
	},
)
