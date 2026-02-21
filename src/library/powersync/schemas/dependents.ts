import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'

export type DependentsType = {
	actor_id: string
	number_of_dependents: number
	sync_id: string
}

export default new Table({
    id: column.text,
	actor_id: column.text,
	number_of_dependents: column.integer,
	sync_id: column.text,
})

export const buildDependents = (data: DependentsType) => {
	const { actor_id, number_of_dependents, sync_id } = data
	const id = uuidv4()
	return {
        id,
		actor_id,
		number_of_dependents,
		sync_id,
	}
}
