import { v4 as uuidv4 } from 'uuid'
import { column, Table } from '@powersync/react-native'
import { DocumentRecord } from './AppSchema'

export interface DocumentRecordType {
	document_type: string
	document_number: string
	document_date: string
	document_place: string
	nuit: string
	nuel: string
	license_type: string
	license_number: string
	license_date: string
	license_place: string	
	sync_id: string
}


export default new Table(
  {
    id: column.text,
    document_type: column.text,
    document_number: column.text,
    document_date: column.text,
    document_place: column.text,
    nuit: column.text,
    nuel: column.text,
    license_type: column.text,
    license_number: column.text,
    license_date: column.text,
    license_place: column.text,
		sync_id: column.text
  },
  {
    indexes: {
      Document: ['document_number', 'nuit'],
    },
  },
)   

export const buildDocument = (document: DocumentRecordType) => {
	const { document_type, document_number, document_date, document_place, nuit, nuel, license_type, license_number, license_date, license_place, sync_id } = document

	const document_id = uuidv4()

  const document_row = {
    id: document_id,
    document_type: document_type ? document_type : 'N/A',
    document_number: document_number ? document_number : 'N/A',
    document_date: document_date ? document_date : new Date().toISOString(),
    document_place: document_place ? document_place : "N/A",
    nuit: nuit ? String(nuit) : '0',
    nuel: nuel ? String(nuel) : '0',
    license_number: license_number ? license_number : 'N/A',
    license_type: license_type ? license_type : 'N/A',
    license_date: license_date ? license_date : new Date().toISOString(),
    license_place: license_place ? license_place : "N/A",
    sync_id: sync_id
} as DocumentRecord

	return document_row
}

