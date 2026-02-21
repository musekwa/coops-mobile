import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'
export type ContactDetailRecordType = {
    owner_id: string
    owner_type: string // FARMER, TRADER, GROUP, EMPLOYEE, GROUP_MANAGER, DRIVER
    primary_phone: string
    secondary_phone: string
    email: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        owner_id: column.text,
        owner_type: column.text,
        primary_phone: column.text,
        secondary_phone: column.text,
        email: column.text,
        sync_id: column.text
    },
    {
        indexes: {
            ContactDetail: ['primary_phone', 'secondary_phone'],
        },
    }
)

export const buildContactDetail = (contactDetail: ContactDetailRecordType) => {
    const { owner_id, owner_type, primary_phone, secondary_phone, email, sync_id } = contactDetail
    return {
        id: uuidv4(),
        owner_id: owner_id,
        owner_type: owner_type,
        primary_phone: primary_phone,
        secondary_phone: secondary_phone,
        email: email,
        sync_id: sync_id
    }
}