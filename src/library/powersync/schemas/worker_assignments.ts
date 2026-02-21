import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'

export type WorkerAssignmentRecord = {
	worker_id: string
	facility_id: string
	facility_type: string
	position: string
	is_active: string
	sync_id: string
}

export default new Table(
	{
		id: column.text,
		worker_id: column.text,
		facility_id: column.text,
		facility_type: column.text,
		position: column.text,
		is_active: column.text,
		sync_id: column.text,
		created_at: column.text,
		updated_at: column.text,
	},
	{
		indexes: {
			WorkerAssignment: ['worker_id', 'facility_id', 'facility_type', 'position', 'is_active'],
		},
	},
)

export const buildWorkerAssignment = (workerAssignment: WorkerAssignmentRecord) => {
    const { worker_id, facility_id, facility_type, position, is_active, sync_id } = workerAssignment
    const id = uuidv4() 
    return {
        id,
        worker_id,
        facility_id,
        facility_type,
        position,
        is_active: String(is_active),
        sync_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
}