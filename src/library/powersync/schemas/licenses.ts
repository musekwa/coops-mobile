import { column, Table } from "@powersync/react-native"
import { v4 as uuidv4 } from 'uuid'
import { LicenseRecord } from "./AppSchema"


export interface LicenseType {  
    photo: string
    owner_type: string
    owner_id: string
    number: string
    issue_date: string
    expiration_date: string
    issue_place_id: string
    issue_place_type: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        owner_type: column.text,
        photo: column.text,
        owner_id: column.text,
        number: column.text,
        issue_date: column.text,
        expiration_date: column.text,
        issue_place_id: column.text,
        issue_place_type: column.text,
        sync_id: column.text
    },
    {
        indexes: {
            License: ['number', 'owner_type', 'owner_id']
        }
    }
)

export const buildLicense = (license: LicenseType) => {
    const { photo, owner_type, owner_id, number, issue_date, expiration_date, issue_place_id, issue_place_type, sync_id } = license
    const uuid = uuidv4()
    return {
        photo: photo ? photo : '',
        owner_type: owner_type ? owner_type : '',
        owner_id: owner_id ? owner_id : '',
        number: number ? number : '',
        issue_date: issue_date ? issue_date : '',
        expiration_date: expiration_date ? expiration_date : '',
        issue_place_id: issue_place_id ? issue_place_id : '',
        issue_place_type: issue_place_type ? issue_place_type : '',
        sync_id: sync_id ? sync_id : '',
        id: uuid
    } 
}