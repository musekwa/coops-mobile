import { v4 as uuidv4 } from 'uuid'
import { column, Table } from '@powersync/react-native'

export interface GroupManagerType {
	group_id: string
  full_name: string
	position: string
	photo: string
	contact_id: string
	address_id: string
	sync_id: string
}

export default new Table(
  {
    id: column.text,
    group_id: column.text,
    full_name: column.text,
    position: column.text,
    photo: column.text,
    contact_id: column.text,
    address_id: column.text,
    created_at: column.text,
    updated_at: column.text,
    sync_id: column.text
  },
  {
    indexes: {
      GroupManager: ['full_name'],
    },
  },
)


export const buildGroupManager = (groupManager: GroupManagerType) => {
  const { group_id, full_name, position, photo, contact_id, address_id, sync_id } = groupManager
  const id = uuidv4()
  const created_at = new Date().toISOString()
  const updated_at = new Date().toISOString()
  return {
    id,
    group_id,
    full_name,
    position,
    photo,
    contact_id,
    address_id,
    created_at,
    updated_at,
    sync_id,
  }
}