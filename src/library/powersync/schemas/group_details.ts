import { column, Table } from '@powersync/react-native'
import { generateUAID } from 'src/helpers/generateUAID'

export type GroupDetailsRecordType = {
    id: string
    name: string
    number_of_members: number
    number_of_women: number
    organization_type: string
    is_active: string
    purposes: string
    photo: string
    creation_year: number
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        name: column.text,
        number_of_members: column.integer,
        number_of_women: column.integer,
        organization_type: column.text,
        is_active: column.text,
        purposes: column.text,
        uaid: column.text,
        photo: column.text,
        creation_year: column.integer,
        sync_id: column.text,
    },
    {
        indexes: {
            GroupDetails: ['name'],
        },
    },
)


export const buildGroupDetails = (groupDetails: GroupDetailsRecordType) => {
    const { id, name, number_of_members, number_of_women, organization_type, is_active, purposes, photo, creation_year, sync_id } = groupDetails
    const uaid = generateUAID(id)
    const groupDetails_row = {
        id,
        uaid,
        name: name,
        number_of_members,
        number_of_women,
        organization_type,
        is_active,
        purposes,
        photo,
        creation_year,
        sync_id,
    } 
    return groupDetails_row
}
    