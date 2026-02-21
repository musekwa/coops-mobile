import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'

export interface ShipmentCheckpointInspectorType {
	checkpoint_id: string
	inspector_id: string
	sync_id: string
}

export default new Table({
	id: column.text,
	checkpoint_id: column.text,
	inspector_id: column.text,
	sync_id: column.text,
})

export const buildShipmentCheckpointInspector = (shipmentCheckpointInspector: ShipmentCheckpointInspectorType) => {
	const id = uuidv4()
	return {
		...shipmentCheckpointInspector,
		id,
	}
}
