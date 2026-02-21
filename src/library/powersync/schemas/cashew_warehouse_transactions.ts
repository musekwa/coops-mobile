import { Table, column } from "@powersync/react-native";
import { v4 as uuidv4 } from 'uuid';

export interface CashewWarehouseTransactionType {
    transaction_type: string;
    quantity: number;
    unit_price: number;
    start_date: string;
    end_date: string;
    store_id: string;
    confirmed: string;
    reference_store_id: string;
    info_provider_id: string;
    created_by: string;
    sync_id: string;
    destination: string;
}

export default new Table({
    id: column.text,
    transaction_type: column.text,
    quantity: column.integer,
    unit_price: column.integer,
    start_date: column.text,
    end_date: column.text,
    store_id: column.text,
    confirmed: column.text,
    destination: column.text,
    reference_store_id: column.text,
    info_provider_id: column.text,
    created_by: column.text,
    sync_id: column.text,
    created_at: column.text,
    updated_at: column.text,
}, 
{
    indexes: {
        CashewWarehouseTransaction: ['transaction_type'],
    },
}
)

export const buildCashewWarehouseTransaction = (cashewWarehouseTransaction: CashewWarehouseTransactionType) => {
    const { transaction_type, quantity, unit_price, start_date, end_date, store_id, reference_store_id, created_by, sync_id, confirmed, destination, info_provider_id } = cashewWarehouseTransaction

    const created_at = new Date().toISOString()
    const updated_at = new Date().toISOString()
    const id = uuidv4()

    const transaction = {
        id,
        transaction_type,
        quantity,
        unit_price,
        start_date,
        end_date,
        store_id,
        confirmed,
        reference_store_id,
        created_by,
        sync_id,
        created_at,
        updated_at,
        destination,
        info_provider_id,
    }

    return transaction
}
