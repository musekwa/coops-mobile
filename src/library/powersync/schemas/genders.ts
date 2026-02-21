import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'

export type GendersType = {
    actor_id: string
    name: string
    code: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        actor_id: column.text,
        name: column.text,
        code: column.text,
        sync_id: column.text,
    },
)

export const buildGenders = (data: GendersType) => {
    const { actor_id, name, code, sync_id } = data
    const id = uuidv4()
    return {
        id,
        actor_id,
        name,
        code,
        sync_id,
    }
}