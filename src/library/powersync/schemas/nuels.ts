import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'

export interface NuelType {   
    nuel: string
    actor_id: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        nuel: column.text,
        actor_id: column.text,
        sync_id: column.text
    },
    {
        indexes: {
            Nuel: ['nuel']
        }
    }
)

export const buildNuel = (nuel: NuelType) => {
    const { ...rest } = nuel
    const uuid = uuidv4()
    return {
        ...rest,
        id: uuid,
    }
}