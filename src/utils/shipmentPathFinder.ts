import { TABLES } from 'src/library/powersync/schemas/AppSchema'

export interface CheckpointPath {
	path: string[]
	checkpointIds: string[]
	totalDistance?: number
}

export interface CheckpointNode {
	id: string
	name: string
	districtName: string
	provinceName: string
	checkpointType: string
	addressId: string
	districtId?: string
	southernNextCheckpointId?: string
	northernNextCheckpointId?: string
	easternNextCheckpointId?: string
	westernNextCheckpointId?: string
	southernNextCheckpoint?: string
	northernNextCheckpoint?: string
	easternNextCheckpoint?: string
	westernNextCheckpoint?: string
}

/**
 * Finds all possible paths through checkpoints from departure district to destination district
 * @param departureDistrictId - The ID of the departure district
 * @param destinationDistrictId - The ID of the destination district
 * @param db - Database connection for executing queries
 * @returns Array of possible paths with checkpoint names and IDs
 */
export async function findAllCheckpointPaths(
	departureDistrictId: string,
	destinationDistrictId: string,
	db: any,
): Promise<CheckpointPath[]> {
	try {
		// First, get all checkpoints with their location information
		const checkpointsQuery = `
      SELECT 
        sc.id,
        sc.name,
        sc.checkpoint_type,
        a.id as address_id,
        scp.southern_next_checkpoint_id,
        scp.northern_next_checkpoint_id,
        scp.eastern_next_checkpoint_id,
        scp.western_next_checkpoint_id,
        d.name as district_name,
        d.id as district_id,
        p.name as province_name
      FROM ${TABLES.CHECKPOINTS} sc
      LEFT JOIN ${TABLES.SHIPMENT_CHECKPOINTS} scp ON scp.id = sc.id
      LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
      LEFT JOIN ${TABLES.DISTRICTS} d ON a.district_id = d.id
      LEFT JOIN ${TABLES.PROVINCES} p ON a.province_id = p.id
    `

		const checkpoints = await db.getAll(checkpointsQuery)

		// Convert to CheckpointNode objects
		const checkpointNodes: CheckpointNode[] = checkpoints.map((cp: any) => ({
			id: cp.id,
			name: cp.name,
			districtName: cp.district_name || 'Unknown District',
			provinceName: cp.province_name || 'Unknown Province',
			checkpointType: cp.checkpoint_type,
			addressId: cp.address_id || null, // Address is now in address_details
			districtId: cp.district_id,
			southernNextCheckpoint: cp.southern_next_checkpoint_id,
			northernNextCheckpoint: cp.northern_next_checkpoint,
			easternNextCheckpoint: cp.eastern_next_checkpoint,
			westernNextCheckpoint: cp.western_next_checkpoint,
		}))

		// Find checkpoints in departure and destination districts
		const departureCheckpoints = checkpointNodes.filter((cp) => cp.districtId && cp.districtId === departureDistrictId)

		const destinationCheckpoints = checkpointNodes.filter(
			(cp) => cp.districtId && cp.districtId === destinationDistrictId,
		)

		if (departureCheckpoints.length === 0) {
			console.warn(`No checkpoints found in departure district: ${departureDistrictId}`)
		}

		if (destinationCheckpoints.length === 0) {
			console.warn(`No checkpoints found in destination district: ${destinationDistrictId}`)
		}

		// Find all possible paths
		const allPaths: CheckpointPath[] = []

		for (const departureCheckpoint of departureCheckpoints) {
			for (const destinationCheckpoint of destinationCheckpoints) {
				const paths = findPathsBetweenCheckpoints(
					departureCheckpoint,
					destinationCheckpoint,
					checkpointNodes,
					new Set<string>(),
					[],
				)
				allPaths.push(...paths)
			}
		}

		// If no paths found through checkpoints, create a direct path
		if (allPaths.length === 0) {
			const departureDistrictName = await getDistrictName(departureDistrictId, db)
			const destinationDistrictName = await getDistrictName(destinationDistrictId, db)

			allPaths.push({
				path: [departureDistrictName, destinationDistrictName],
				checkpointIds: [],
			})
		}

		return allPaths
	} catch (error) {
		console.error('Error finding checkpoint paths:', error)
		throw error
	}
}

/**
 * Helper function to get district name
 */
async function getDistrictName(districtId: string, db: any): Promise<string> {
	try {
		const query = `
      SELECT name
      FROM ${TABLES.DISTRICTS}
      WHERE id = ?
    `
		const result = await db.getFirst(query, [districtId])
		return result?.name || 'Unknown District'
	} catch (error) {
		console.error('Error getting district name:', error)
		return 'Unknown District'
	}
}

/**
 * Recursive function to find all paths between two checkpoints
 */
function findPathsBetweenCheckpoints(
	current: CheckpointNode,
	destination: CheckpointNode,
	allCheckpoints: CheckpointNode[],
	visited: Set<string>,
	currentPath: string[],
): CheckpointPath[] {
	// If we've reached the destination
	if (current.id === destination.id) {
		const fullPath = [...currentPath, current.districtName]
		const fullCheckpointIds = [...currentPath.map(() => ''), current.id]
		return [
			{
				path: fullPath,
				checkpointIds: fullCheckpointIds,
			},
		]
	}

	// If we've already visited this checkpoint, return empty array (avoid cycles)
	if (visited.has(current.id)) {
		return []
	}

	// Mark current checkpoint as visited
	visited.add(current.id)

	// Add current checkpoint to path
	const newPath = [...currentPath, current.districtName]
	const newCheckpointIds = [...currentPath.map(() => ''), current.id]

	const paths: CheckpointPath[] = []

	// Check all four directions
	const directions = [
		{ id: current.southernNextCheckpointId, name: 'southern' },
		{ id: current.northernNextCheckpointId, name: 'northern' },
		{ id: current.easternNextCheckpointId, name: 'eastern' },
		{ id: current.westernNextCheckpointId, name: 'western' },
	]

	for (const direction of directions) {
		if (direction.id) {
			const nextCheckpoint = allCheckpoints.find((cp) => cp.id === direction.id)
			if (nextCheckpoint) {
				const subPaths = findPathsBetweenCheckpoints(
					nextCheckpoint,
					destination,
					allCheckpoints,
					new Set(visited), // Create new set to avoid affecting other branches
					newPath,
				)
				paths.push(...subPaths)
			}
		}
	}

	return paths
}

/**
 * Simplified function to get checkpoint paths for a shipment
 * @param shipmentId - The shipment ID
 * @param db - Database connection
 * @returns Array of possible paths
 */
export async function getShipmentCheckpointPaths(shipmentId: string, db: any): Promise<CheckpointPath[]> {
	try {
		// Get shipment direction information
		const directionQuery = `
      SELECT 
        sd.departure_address_id,
        sd.destination_address_id,
        departure_district.id as departure_district_id,
        destination_district.id as destination_district_id
      FROM ${TABLES.SHIPMENT_DIRECTIONS} sd
      LEFT JOIN ${TABLES.ADDRESS_DETAILS} departure_address ON sd.departure_address_id = departure_address.id
      LEFT JOIN ${TABLES.DISTRICTS} departure_district ON departure_address.district_id = departure_district.id
      LEFT JOIN ${TABLES.ADDRESS_DETAILS} destination_address ON sd.destination_address_id = destination_address.id
      LEFT JOIN ${TABLES.DISTRICTS} destination_district ON destination_address.district_id = destination_district.id
      WHERE sd.shipment_id = ?
    `

		const direction = await db.getFirst(directionQuery, [shipmentId])

		if (!direction) {
			throw new Error(`No shipment direction found for shipment: ${shipmentId}`)
		}

		return await findAllCheckpointPaths(direction.departure_district_id, direction.destination_district_id, db)
	} catch (error) {
		console.error('Error getting shipment checkpoint paths:', error)
		throw error
	}
}
