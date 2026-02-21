import { v4 as uuidv4 } from 'uuid'
import { column, Table } from '@powersync/react-native'
import { ActorDocumentRecord } from './AppSchema'

export interface ActorDocumentRecordType {
	type: string
	number: string
	date: string
	place: string
	owner_id: string
	owner_type: string
	sync_id: string
}


export default new Table(
  {
    id: column.text,
    type: column.text,
    number: column.text,
    date: column.text,
    place: column.text,
    owner_id: column.text,
    owner_type: column.text,
		sync_id: column.text
  },
  {
    indexes: {
      Document: ['number', 'owner_id'],
    },
  },
)   

export const buildActorDocument = (actorDocument: ActorDocumentRecordType) => {
	const { type, number, date, place, owner_id, owner_type, sync_id } = actorDocument

  const actor_document_row = {
    id: uuidv4(),
    type: type ? type : 'N/A',
    number: number ? number : 'N/A',
    date: date ? date : new Date().toISOString(),
    place: place ? place : "N/A",
    owner_id: owner_id,
    owner_type: owner_type,
    sync_id: sync_id
} as ActorDocumentRecord

	return actor_document_row
}

