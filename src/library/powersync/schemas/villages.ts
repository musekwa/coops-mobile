import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'
export interface VillageType {  
    name: string
    code: string
    admin_post_id: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        name: column.text,
        code: column.text,
        admin_post_id: column.text,
        sync_id: column.text
    },
    {
        indexes: {
            Village: ['code']
        }
    }
)

export const buildVillage = (village: VillageType) => {
    const { ...rest } = village
    const uuid = uuidv4()
    return {
        ...rest,
        id: uuid,
    }
}