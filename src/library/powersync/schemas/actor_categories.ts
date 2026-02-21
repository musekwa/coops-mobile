import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'


export type ActorCategoriesType = { 
    actor_id: string
    category: string
    subcategory: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        actor_id: column.text,
        category: column.text,
        subcategory: column.text,
        sync_id: column.text,
    },
    {
        indexes: {
            ActorCategories: ['actor_id'],
        },
    }
)

export const buildActorCategories = (data: ActorCategoriesType) => {
    const { actor_id, category, subcategory, sync_id } = data
    const id = uuidv4()
    return {
        id,
        actor_id,
        category,
        subcategory,
        sync_id,
    }
}