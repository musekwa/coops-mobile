import {
	BorderRecord,
	CashewCrossbordersSmugglingRecord,
	CashewInbordersSmugglingRecord,
	CashewShipmentRecord,
	CheckpointRecord,
	ShipmentCarRecord,
	ShipmentCheckpointInspectorRecord,
	ShipmentCheckpointRecord,
	ShipmentCheckpointSequenceRecord,
	ShipmentCheckRecord,
	ShipmentDirectionRecord,
	ShipmentDriverRecord,
	ShipmentLoadRecord,
	TABLES,
} from '../powersync/schemas/AppSchema'
import { powersync } from '../powersync/system'
import { insertWithGuarantee } from '../powersync/insert-utils'

export const insertCashewShipment = async (shipment: CashewShipmentRecord) => {
	const { id, shipment_number, owner_id, owner_type, status, sync_id } = shipment

	const query = `
        INSERT INTO ${TABLES.CASHEW_SHIPMENTS} 
            (
            id,
            shipment_number, 
            owner_id, 
            owner_type,
            status, 
            sync_id
        )
        VALUES (
            ?,
            ?, 
            ?, 
            ?, 
            ?, 
            ?
        )
    `

	const params = [id, shipment_number, owner_id, owner_type, status, sync_id]

	// Use guaranteed insert mechanism for maximum reliability (online/offline)
	const result = await insertWithGuarantee(query, params, TABLES.CASHEW_SHIPMENTS, shipment)
	console.log('Cashew shipment insert result:', result)
	return result
}

export const insertShipmentCar = async (shipmentCar: ShipmentCarRecord) => {
	const { id, car_type, plate_number, sync_id } = shipmentCar

	const query = `
        INSERT INTO ${TABLES.SHIPMENT_CARS} 
            (
            id,
            car_type, 
            plate_number, 
            sync_id
        )
        VALUES (
            ?,
            ?, 
            ?, 
            ?
        )
    `

	const params = [id, car_type, plate_number, sync_id]

	const result = await powersync.execute(query, params)
	console.log('Shipment car inserted', result)
	return result
}

export const insertShipmentDriver = async (shipmentDriver: ShipmentDriverRecord) => {
	const { id, driver_name, driver_phone, sync_id } = shipmentDriver

	const query = `
        INSERT INTO ${TABLES.SHIPMENT_DRIVERS} 
            (
            id,
            driver_name, 
            driver_phone, 
            sync_id
        )
        VALUES (
            ?, 
            ?, 
            ?, 
            ?
        )
    `

	const params = [id, driver_name, driver_phone, sync_id]

	const result = await powersync.execute(query, params)
	console.log('Shipment driver inserted', result)
	return result
}

export const insertShipmentDirection = async (shipmentDirection: ShipmentDirectionRecord) => {
	const { id, direction, departure_address_id, destination_address_id, shipment_id, sync_id } = shipmentDirection

	const query = `
        INSERT INTO ${TABLES.SHIPMENT_DIRECTIONS} 
            (
            id,
            direction, 
            departure_address_id, 
            destination_address_id, 
            shipment_id,    
            sync_id
        )
        VALUES (
            ?,
            ?, 
            ?, 
            ?, 
            ?,
            ?
        )
    `

	// Ensure null is passed correctly for optional foreign key
	const params = [id, direction, departure_address_id, destination_address_id, shipment_id, sync_id]

	const result = await powersync.execute(query, params)
	console.log('Shipment direction inserted', result)
	return result
}

export const insertShipmentLoad = async (shipmentLoad: ShipmentLoadRecord) => {
	const {
		id,
		shipment_id,
		product_type,
		quantity,
		unit,
		number_of_bags,
		weight_per_bag,
		bag_type,
		driver_id,
		car_id,
		sync_id,
	} = shipmentLoad

	const query = `
        INSERT INTO ${TABLES.SHIPMENT_LOADS} 
            (
            id,
            shipment_id, 
            product_type, 
            quantity, 
            unit, 
            number_of_bags, 
            weight_per_bag, 
            bag_type, 
            driver_id, 
            car_id, 
            sync_id
        )
        VALUES (
            ?,
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            ?,
            ?,
            ?
        )
    `

	const params = [
		id,
		shipment_id,
		product_type,
		quantity,
		unit,
		number_of_bags,
		weight_per_bag,
		bag_type,
		driver_id,
		car_id,
		sync_id,
	]

	const result = await powersync.execute(query, params)
	console.log('Shipment load inserted', result)
	return result
}

// export const insertShipmentCheckpoint = async (shipmentCheckpoint: ShipmentCheckpointRecord) => {
// 	const { id, name, checkpoint_type, description, address_id, sync_id } = shipmentCheckpoint

// 	const query = `
//         INSERT INTO ${TABLES.SHIPMENT_CHECKPOINTS}
//             (
//             id,
//             name,
//             checkpoint_type,
//             description,
//             address_id,
//             sync_id
//         )
//         VALUES (
//             ?,
//             ?,
//             ?,
//             ?,
//             ?,
//             ?
//         )
//     `

// 	const params = [id, name, checkpoint_type, description, address_id, sync_id]

// 	const result = await powersync.execute(query, params)
// 	console.log('Shipment checkpoint inserted', result)
// 	return result
// }

export const insertShipmentCheckpointInspector = async (
	shipmentCheckpointInspector: ShipmentCheckpointInspectorRecord,
) => {
	const { id, checkpoint_id, inspector_id, sync_id } = shipmentCheckpointInspector

	const query = `
        INSERT INTO ${TABLES.SHIPMENT_CHECKPOINT_INSPECTORS} 
            (
            id,
            checkpoint_id,
            inspector_id,
            sync_id
        )
        VALUES (
            ?,
            ?,
            ?,
            ?
        )
    `

	const params = [id, checkpoint_id, inspector_id, sync_id]

	const result = await powersync.execute(query, params)
	console.log('Shipment checkpoint inspector inserted', result)
	return result
}

export const insertShipmentCheckpointSequence = async (sequence: ShipmentCheckpointSequenceRecord) => {
	const { id, shipment_id, shipment_direction_id, checkpoint_id, sequence_order, sync_id, created_at } = sequence

	const query = `
        INSERT INTO ${TABLES.SHIPMENT_CHECKPOINT_SEQUENCE} 
            (
            id,
            shipment_id,
            shipment_direction_id,
            checkpoint_id,
            sequence_order,
            sync_id,
            created_at
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
    `

	const params = [
		id,
		shipment_id,
		shipment_direction_id,
		checkpoint_id,
		sequence_order,
		sync_id,
		created_at || new Date().toISOString(),
	]

	const result = await powersync.execute(query, params)
	console.log('Shipment checkpoint sequence inserted', result)
	return result
}

/**
 * Save checkpoint sequence for a shipment
 * Deletes existing sequence and inserts new one
 */
export const saveCheckpointSequence = async (
	shipmentId: string,
	shipmentDirectionId: string,
	checkpointIds: string[],
	syncId: string,
) => {
	try {
		// Delete existing sequence
		const deleteQuery = `
			DELETE FROM ${TABLES.SHIPMENT_CHECKPOINT_SEQUENCE}
			WHERE shipment_id = ? AND shipment_direction_id = ?
		`
		await powersync.execute(deleteQuery, [shipmentId, shipmentDirectionId])

		// Insert new sequence
		const { v4: uuidv4 } = require('uuid')
		const { buildShipmentCheckpointSequence } = require('../powersync/schemas/shipment_checkpoint_sequence')

		for (let i = 0; i < checkpointIds.length; i++) {
			const sequence = buildShipmentCheckpointSequence({
				shipment_id: shipmentId,
				shipment_direction_id: shipmentDirectionId,
				checkpoint_id: checkpointIds[i],
				sequence_order: i + 1,
				sync_id: syncId,
			})
			await insertShipmentCheckpointSequence(sequence)
		}

		console.log('Checkpoint sequence saved successfully')
		return { success: true, message: 'Sequence saved successfully' }
	} catch (error) {
		console.error('Error saving checkpoint sequence:', error)
		return { success: false, message: 'Error saving sequence: ' + error }
	}
}

export const insertCheckpoint = async (checkpoint: CheckpointRecord) => {
	const {
		id,
		name,
		description,
		sync_id,
		is_active,
		checkpoint_type,
		southern_next_checkpoint_id,
		northern_next_checkpoint_id,
		eastern_next_checkpoint_id,
		western_next_checkpoint_id,
	} = checkpoint
	const query = `
		INSERT INTO ${TABLES.CHECKPOINTS} 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	const params = [
		id,
		name,
		description,
		sync_id,
		is_active,
		checkpoint_type,
		southern_next_checkpoint_id || null,
		northern_next_checkpoint_id || null,
		eastern_next_checkpoint_id || null,
		western_next_checkpoint_id || null,
	]
	const result = await powersync.execute(query, params)
	console.log('Checkpoint inserted', result)
	return result
}

export const insertShipmentCheck = async (shipmentCheck: ShipmentCheckRecord) => {
	const {
		id,
		shipment_id,
		checkpoint_id,
		checkpoint_type,
		shipment_direction_id,
		checked_by_id,
		checked_at,
		notes,
		sync_id,
	} = shipmentCheck

	const query = `
        INSERT INTO ${TABLES.SHIPMENT_CHECKS} 
            (
            id,
            shipment_id,
            checkpoint_id,
            checkpoint_type,
            shipment_direction_id,
            checked_by_id,
            checked_at,
            notes,
            sync_id
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
    `

	const params = [
		id,
		shipment_id,
		checkpoint_id,
		checkpoint_type,
		shipment_direction_id,
		checked_by_id,
		checked_at,
		notes || null,
		sync_id,
	]

	// Use guaranteed insert mechanism for maximum reliability (online/offline)
	const result = await insertWithGuarantee(query, params, TABLES.SHIPMENT_CHECKS, shipmentCheck)
	console.log('Shipment check inserted', result)

	// If inspection is at destination (AT_ARRIVAL), update shipment status to DELIVERED
	if (checkpoint_type === 'AT_ARRIVAL') {
		try {
			const updateQuery = `
				UPDATE ${TABLES.CASHEW_SHIPMENTS}
				SET status = 'DELIVERED'
				WHERE id = ?
			`
			await powersync.execute(updateQuery, [shipment_id])
			console.log('Shipment status updated to DELIVERED')
		} catch (error) {
			console.error('Error updating shipment status to DELIVERED:', error)
			// Don't throw - we don't want to fail the inspection save if status update fails
		}
	}

	return result
}

export const insertBorder = async (border: BorderRecord) => {
	const { id, name, border_type, province_id, country_id, description, sync_id } = border
	const query = `
        INSERT INTO ${TABLES.BORDERS} 
            (
            id,
            name,
            border_type,
            province_id,
            country_id,
            description,
            sync_id
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
    `
	const params = [id, name, border_type, province_id, country_id, description, sync_id]
	const result = await powersync.execute(query, params)
	console.log('Border inserted', result)
	return result
}

export const insertCashewInbordersSmuggling = async (inbordersSmuggling: CashewInbordersSmugglingRecord) => {
	const { id, shipment_id, destination_district_id, departure_district_id, smuggling_notes, sync_id } =
		inbordersSmuggling
	const query = `
		INSERT INTO ${TABLES.CASHEW_INBORDERS_SMUGGLING} 
        (id, shipment_id, destination_district_id, departure_district_id, smuggling_notes, sync_id)
		VALUES (?, ?, ?, ?, ?, ?)
	`
	const params = [id, shipment_id, destination_district_id, departure_district_id, smuggling_notes, sync_id]
	const result = await powersync.execute(query, params)
	console.log('Cashew inborders smuggling inserted', result)
	return result
}

export const insertCashewCrossbordersSmuggling = async (crossbordersSmuggling: CashewCrossbordersSmugglingRecord) => {
	const { id, shipment_id, destination_country_id, border_name, smuggling_notes, sync_id } = crossbordersSmuggling
	const query = `
		INSERT INTO ${TABLES.CASHEW_CROSSBORDERS_SMUGGLING} 
        (id, shipment_id, destination_country_id, border_name, smuggling_notes, sync_id)
		VALUES (?, ?, ?, ?, ?, ?)
	`
	const params = [id, shipment_id, destination_country_id, border_name, smuggling_notes, sync_id]
	const result = await powersync.execute(query, params)
	console.log('Cashew crossborders smuggling inserted', result)
	return result
}
