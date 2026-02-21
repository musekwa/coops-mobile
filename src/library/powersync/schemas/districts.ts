import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'

export interface DistrictType { 
    name: string
    code: string
    province_id: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        name: column.text,
        code: column.text,
        province_id: column.text,
        sync_id: column.text
    },
    {
        indexes: {
            District: ['code']
        }
    }
)

export const buildDistrict = (district: DistrictType) => {
    const { ...rest } = district
    const uuid = uuidv4()
    return {
        ...rest,
        id: uuid,
    }
}