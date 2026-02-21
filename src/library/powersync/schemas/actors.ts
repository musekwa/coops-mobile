import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'

export interface ActorType {
    category: string
    sync_id: string
}

export default new Table(   
    {
        id: column.text,
        category: column.text,
        sync_id: column.text
    },
    {
        indexes: {
            Actor: ['category']
        }
    }
)

export const buildActor = (actor: ActorType) => {
    const { ...rest } = actor
    const uuid = uuidv4()
    return {
        ...rest,
        id: uuid
    }
}