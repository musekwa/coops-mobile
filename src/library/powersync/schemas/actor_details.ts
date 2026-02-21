import {column, Table} from "@powersync/react-native"
import { generateUAID } from "src/helpers/generateUAID"
import { v4 as uuidv4 } from 'uuid'


export type ActorDetailsType = {
    actor_id: string
    surname: string
    other_names: string
    photo: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        actor_id: column.text,
        surname: column.text,
        other_names: column.text,
        uaid: column.text,
        photo: column.text,
        sync_id: column.text,
        created_at: column.text,
        updated_at: column.text,
    },
    {
        indexes: {
            ActorDetails: ['actor_id'],
        },
    }
)

export const buildActorDetails = (data: ActorDetailsType) => {
    const { actor_id, surname, other_names, photo, sync_id } = data
    const uaid = generateUAID(actor_id)
    const id = uuidv4()
    return {
        id,
        actor_id,
        surname,
        other_names,
        uaid,
        photo,
        sync_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
}