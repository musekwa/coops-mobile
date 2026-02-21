import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'

export interface ProvinceType { 
    name: string
    initials: string
    code: string
    country_id: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        name: column.text,
        initials: column.text,
        code: column.text,
        country_id: column.text,
        sync_id: column.text
    },
    {
        indexes: {
            Province: ['code']
        }
    }
)

export const buildProvince = (province: ProvinceType) => {
    const { ...rest } = province
    const uuid = uuidv4()
    return {
        ...rest,
        id: uuid,
    }
}