import { Table, column } from "@powersync/react-native";
import { v4 as uuidv4 } from 'uuid'
export interface CashewWarehouseRecordType {
    description: string;
    name: string;
    owner_id: string;
    address_id: string;
    warehouse_type: string;
    is_active: string;
    sync_id: string;
}

export default new Table({
    id: column.text,
    description: column.text,
    name: column.text,
    owner_id: column.text,
    address_id: column.text,
    warehouse_type: column.text,
    is_active: column.text,
    sync_id: column.text,
    created_at: column.text,
    updated_at: column.text,
}, {
    indexes: {
        CashewWarehouse: ['owner_id'],
    },  
})

export const buildCashewWarehouse = (cashewWarehouse: CashewWarehouseRecordType) => {
    const { description, owner_id, address_id, warehouse_type, is_active, sync_id, name } = cashewWarehouse

    const created_at = new Date().toISOString()
    const updated_at = new Date().toISOString()
    const id = uuidv4()

    return {
        id,
        description,
        owner_id,
        address_id,
        warehouse_type,
        is_active,
        sync_id,
        created_at,
        updated_at,
        name
    }   
}