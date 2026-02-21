import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'

export interface CountryType {  
    name: string
    initials: string
    code: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        name: column.text,
        initials: column.text,
        code: column.text,
        sync_id: column.text
    },
    {
        indexes: {
            Country: ['code']
        }
    }
    )

export const buildCountry = (country: CountryType) => {
    const { ...rest } = country
    const uuid = uuidv4()
    return {
        ...rest,
        id: uuid,
    }
}