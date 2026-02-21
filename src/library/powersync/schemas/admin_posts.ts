import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'

export interface AdminPostType {
    name: string
    code: string
    district_id: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,        
        name: column.text,
        code: column.text,
        district_id: column.text,
        sync_id: column.text
    },
    {
        indexes: {
            AdminPost: ['code']
        }
    }
)

export const buildAdminPost = (adminPost: AdminPostType) => {
    const { ...rest } = adminPost
    const uuid = uuidv4()
    return {
        ...rest,
        id: uuid,
    }
}