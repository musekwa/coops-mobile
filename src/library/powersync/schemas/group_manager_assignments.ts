import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'
export type GroupManagerAssignmentType = {
    group_manager_id: string
    group_id: string
    position: string
    is_active: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        group_manager_id: column.text,
        group_id: column.text,
        position: column.text,
        is_active: column.text,
        sync_id: column.text,
    },
)

export const buildGroupManagerAssignment = (groupManagerAssignment: GroupManagerAssignmentType) => {
    const { group_manager_id, group_id, position, is_active, sync_id } = groupManagerAssignment;
    const id = uuidv4()
    return {
        id,
        group_manager_id,
        group_id,
        position,
        is_active: String(is_active),
        sync_id,
    }
}