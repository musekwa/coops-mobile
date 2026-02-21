import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'


export interface NuitType {
    nuit: string
    actor_id: string
    sync_id: string
}

export default new Table(   
    {
        id: column.text,
        nuit: column.text,
        actor_id: column.text,
        sync_id: column.text
    },
    {
        indexes: {
            Nuit: ['nuit']
        }
    }
)

export const buildNuit = (nuit: NuitType) => {
    const { ...rest } = nuit
    const uuid = uuidv4()
    return {
        ...rest,
        id: uuid,
    }
}