import { column, Table } from "@powersync/react-native"
export type WarehouseDetailType = {
    id: string
    name: string
    description: string
    owner_id: string
    type: string
    is_active: boolean
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        name: column.text,
        description: column.text,
        owner_id: column.text,
        type: column.text,
        is_active: column.text,
        sync_id: column.text,
        created_at: column.text,
        updated_at: column.text,
    },
    {
        indexes: {
            WarehouseDetail: ['name', 'description', 'owner_id', 'type'],
        },
    }
)

export const buildWarehouseDetail = (warehouseDetail: WarehouseDetailType) => {
    const { id, name, description, owner_id, type, sync_id, is_active } = warehouseDetail
    return {
        id,
        name,
        description,
        owner_id,
        type,
        is_active: String(is_active), // Convert boolean to string for database
        sync_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
}