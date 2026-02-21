import { Table, column } from "@powersync/react-native";
import { v4 as uuidv4 } from 'uuid'
export interface OrganizationTransactionParticipantType {
    transaction_id: string
    quantity: number
    participant_id: string
    participant_type: string
    sync_id: string
}

export default new Table({
    id: column.text,
    transaction_id: column.text,
    quantity: column.integer,
    participant_id: column.text,
    participant_type: column.text,
    sync_id: column.text,
}, {
    indexes: {
        OrganizationTransactionParticipant: ['transaction_id'],
    },
})

export const buildOrganizationTransactionParticipant = (data: OrganizationTransactionParticipantType) => {
    const { transaction_id, quantity, participant_id, sync_id, participant_type } = data
    const id = uuidv4()
    return {
        id,
        transaction_id,
        quantity,
        participant_id,
        participant_type,
        sync_id,
    }
}
