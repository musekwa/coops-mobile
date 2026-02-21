import { useState, useEffect, useRef } from 'react'
import { powersync } from 'src/library/powersync/system'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { CheckpointPath, CheckpointNode } from 'src/utils/shipmentPathFinder'
import { queryMany, queryOne } from 'src/library/powersync/sql-statements'

export interface CheckpointPathWithDetails extends CheckpointPath {
	checkpointDetails?: CheckpointNode[]
}

export const useCheckpointPaths = (shipmentId: string) => {
	const [paths, setPaths] = useState<CheckpointPathWithDetails[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isError, setIsError] = useState(false)
	const abortControllerRef = useRef<AbortController | null>(null)

	// State to force refresh when sequence changes
	const [refreshTrigger, setRefreshTrigger] = useState(0)

	// Watch for changes in the checkpoint sequence table to trigger refresh
	useEffect(() => {
		if (!shipmentId) return

		const watchSequence = async () => {
			// Abort previous watch if exists
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}

			abortControllerRef.current = new AbortController()

			try {
				// Get shipment direction ID first using queryOne
				const directionIdQuery = `SELECT id FROM ${TABLES.SHIPMENT_DIRECTIONS} WHERE shipment_id = ? LIMIT 1`
				const directionIdResult = await queryOne<{ id: string }>(directionIdQuery, [shipmentId])
				if (!directionIdResult || !directionIdResult.id) return

				const watchQuery = `
					SELECT COUNT(*) as count
					FROM ${TABLES.SHIPMENT_CHECKPOINT_SEQUENCE}
					WHERE shipment_id = ? AND shipment_direction_id = ?
				`

				powersync.watchWithCallback(
					watchQuery,
					[shipmentId, directionIdResult.id],
					{
						onResult: () => {
							// Trigger a refresh when sequence changes
							setRefreshTrigger((prev) => prev + 1)
						},
						onError: (err) => {
							console.log('Error watching checkpoint sequence:', err)
						},
					},
					{
						signal: abortControllerRef.current!.signal,
					},
				)
			} catch (error) {
				console.error('Error setting up sequence watch:', error)
			}
		}

		watchSequence()

		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}
		}
	}, [shipmentId])

	useEffect(() => {
		const fetchCheckpointPaths = async () => {
			try {
				setIsLoading(true)
				setError(null)
				setIsError(false)

				// Get shipment direction information
				const directionQuery = `
          SELECT 
            sd.departure_address_id,
            sd.destination_address_id,
            departure_district.id as departure_district_id,
            destination_district.id as destination_district_id,
            departure_district.name as departure_district_name,
            destination_district.name as destination_district_name
          FROM ${TABLES.SHIPMENT_DIRECTIONS} sd
          LEFT JOIN ${TABLES.ADDRESS_DETAILS} departure_address ON sd.departure_address_id = departure_address.id
          LEFT JOIN ${TABLES.DISTRICTS} departure_district ON departure_address.district_id = departure_district.id
          LEFT JOIN ${TABLES.ADDRESS_DETAILS} destination_address ON sd.destination_address_id = destination_address.id
          LEFT JOIN ${TABLES.DISTRICTS} destination_district ON destination_address.district_id = destination_district.id
          WHERE sd.shipment_id = ?
        `

				const direction = await queryOne<{
					departure_address_id: string
					destination_address_id: string
					departure_district_id: string
					destination_district_id: string
					departure_district_name: string
					destination_district_name: string
				}>(directionQuery, [shipmentId])

				if (!direction) {
					throw new Error(`No shipment direction found for shipment: ${shipmentId}`)
				}

				// Check if there's a user-selected checkpoint sequence
				// Get shipment direction ID first
				const directionIdQuery = `SELECT id FROM ${TABLES.SHIPMENT_DIRECTIONS} WHERE shipment_id = ? LIMIT 1`
				const directionIdResult = await queryOne<{ id: string }>(directionIdQuery, [shipmentId])

				if (directionIdResult) {
					const sequenceQuery = `
						SELECT 
							scs.checkpoint_id,
							scs.sequence_order,
							sc.id,
							sc.name,
							sc.checkpoint_type,
							a.id as address_id,
							d.name as district_name,
							d.id as district_id,
							p.name as province_name
						FROM ${TABLES.SHIPMENT_CHECKPOINT_SEQUENCE} scs
						JOIN ${TABLES.CHECKPOINTS} sc ON scs.checkpoint_id = sc.id
						LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
						LEFT JOIN ${TABLES.DISTRICTS} d ON a.district_id = d.id
						LEFT JOIN ${TABLES.PROVINCES} p ON a.province_id = p.id
						WHERE scs.shipment_id = ? AND scs.shipment_direction_id = ?
						ORDER BY scs.sequence_order
					`

					const selectedSequence = await queryMany<{
						checkpoint_id: string
						sequence_order: number
						id: string
						name: string
						checkpoint_type: string
						address_id: string
						district_name: string
						district_id: string
						province_name: string
					}>(sequenceQuery, [shipmentId, directionIdResult.id])

					// If a sequence exists, use it instead of calculating shortest path
					if (selectedSequence && selectedSequence.length > 0) {
						const sequenceNodes: CheckpointNode[] = selectedSequence.map((seq: any) => ({
							id: seq.id,
							name: seq.name,
							districtName: seq.district_name || 'Distrito desconhecido',
							provinceName: seq.province_name || 'Província desconhecida',
							checkpointType: seq.checkpoint_type,
							addressId: seq.address_id,
							districtId: seq.district_id,
							southernNextCheckpointId: undefined,
							northernNextCheckpointId: undefined,
							easternNextCheckpointId: undefined,
							westernNextCheckpointId: undefined,
							southernNextCheckpoint: undefined,
							northernNextCheckpoint: undefined,
							easternNextCheckpoint: undefined,
							westernNextCheckpoint: undefined,
						}))

						// Build path from sequence
						const path: CheckpointPathWithDetails = {
							path: [
								direction.departure_district_name,
								...sequenceNodes.map((cp) => cp.name),
								direction.destination_district_name,
							],
							checkpointIds: [...sequenceNodes.map((cp) => cp.id)],
							checkpointDetails: [
								// Add departure checkpoint (virtual)
								{
									id: '',
									name: direction.departure_district_name,
									districtName: direction.departure_district_name,
									provinceName: '',
									checkpointType: '',
									addressId: '',
									districtId: direction.departure_district_id,
									southernNextCheckpointId: undefined,
									northernNextCheckpointId: undefined,
									easternNextCheckpointId: undefined,
									westernNextCheckpointId: undefined,
									southernNextCheckpoint: undefined,
									northernNextCheckpoint: undefined,
									easternNextCheckpoint: undefined,
									westernNextCheckpoint: undefined,
								},
								...sequenceNodes,
								// Add destination checkpoint (virtual)
								{
									id: '',
									name: direction.destination_district_name,
									districtName: direction.destination_district_name,
									provinceName: '',
									checkpointType: '',
									addressId: '',
									districtId: direction.destination_district_id,
									southernNextCheckpointId: undefined,
									northernNextCheckpointId: undefined,
									easternNextCheckpointId: undefined,
									westernNextCheckpointId: undefined,
									southernNextCheckpoint: undefined,
									northernNextCheckpoint: undefined,
									easternNextCheckpoint: undefined,
									westernNextCheckpoint: undefined,
								},
							],
						}

						setPaths([path])
						setIsLoading(false)
						return
					}
				}

				// Get all checkpoints with their location information and connected checkpoint names
				const checkpointsQuery = `
          SELECT 
            sc.id,
            sc.name,
            sc.checkpoint_type,
            a.id as address_id,
					sc.southern_next_checkpoint_id,
					sc.northern_next_checkpoint_id,
					sc.eastern_next_checkpoint_id,
					sc.western_next_checkpoint_id,
            d.name as district_name,
            d.id as district_id,
            p.name as province_name,
            southern_checkpoint.name as southern_checkpoint_name,
            northern_checkpoint.name as northern_checkpoint_name,
            eastern_checkpoint.name as eastern_checkpoint_name,
            western_checkpoint.name as western_checkpoint_name
          FROM ${TABLES.CHECKPOINTS} sc
          LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
          LEFT JOIN ${TABLES.DISTRICTS} d ON a.district_id = d.id
          LEFT JOIN ${TABLES.PROVINCES} p ON a.province_id = p.id
          LEFT JOIN ${TABLES.CHECKPOINTS} southern_checkpoint ON sc.southern_next_checkpoint_id = southern_checkpoint.id
          LEFT JOIN ${TABLES.CHECKPOINTS} northern_checkpoint ON sc.northern_next_checkpoint_id = northern_checkpoint.id
          LEFT JOIN ${TABLES.CHECKPOINTS} eastern_checkpoint ON sc.eastern_next_checkpoint_id = eastern_checkpoint.id
          LEFT JOIN ${TABLES.CHECKPOINTS} western_checkpoint ON sc.western_next_checkpoint_id = western_checkpoint.id
        `

				const checkpoints = await queryMany<{
					id: string
					name: string
					checkpoint_type: string
					address_id: string
					southern_next_checkpoint_id: string
					northern_next_checkpoint_id: string
					eastern_next_checkpoint_id: string
					western_next_checkpoint_id: string
					district_name: string
					district_id: string
					province_name: string
					southern_checkpoint_name: string
					northern_checkpoint_name: string
					eastern_checkpoint_name: string
					western_checkpoint_name: string
				}>(checkpointsQuery)

				// Convert to CheckpointNode objects
				const checkpointNodes: CheckpointNode[] = checkpoints.map((cp: any) => ({
					id: cp.id,
					name: cp.name,
					districtName: cp.district_name || 'Distrito desconhecido',
					provinceName: cp.province_name || 'Província desconhecida',
					checkpointType: cp.checkpoint_type,
					addressId: cp.address_id,
					districtId: cp.district_id,
					southernNextCheckpointId: cp.southern_next_checkpoint_id,
					northernNextCheckpointId: cp.northern_next_checkpoint_id,
					easternNextCheckpointId: cp.eastern_next_checkpoint_id,
					westernNextCheckpointId: cp.western_next_checkpoint_id,
					southernNextCheckpoint: cp.southern_checkpoint_name,
					northernNextCheckpoint: cp.northern_checkpoint_name,
					easternNextCheckpoint: cp.eastern_checkpoint_name,
					westernNextCheckpoint: cp.western_checkpoint_name,
				}))

				// Find checkpoints in departure and destination districts
				const departureCheckpoints = checkpointNodes.filter(
					(cp) => cp.districtId && cp.districtId === direction.departure_district_id,
				)

				const destinationCheckpoints = checkpointNodes.filter(
					(cp) => cp.districtId && cp.districtId === direction.destination_district_id,
				)

				// Debug: Show all checkpoints with their connections
				console.log('=== ALL CHECKPOINTS WITH CONNECTIONS ===')
				checkpointNodes.forEach((cp) => {
					console.log(`Checkpoint: ${cp.name} (${cp.districtName})`)
					console.log(
						`  - Southern: ${cp.southernNextCheckpoint || 'none'} (ID: ${cp.southernNextCheckpointId || 'none'})`,
					)
					console.log(
						`  - Northern: ${cp.northernNextCheckpoint || 'none'} (ID: ${cp.northernNextCheckpointId || 'none'})`,
					)
					console.log(
						`  - Eastern: ${cp.easternNextCheckpoint || 'none'} (ID: ${cp.easternNextCheckpointId || 'none'})`,
					)
					console.log(
						`  - Western: ${cp.westernNextCheckpoint || 'none'} (ID: ${cp.westernNextCheckpointId || 'none'})`,
					)
				})

				// Debug: Show checkpoints in specific districts
				const nampulaCheckpoints = checkpointNodes.filter(
					(cp) => cp.districtName && cp.districtName.toLowerCase().includes('nampula'),
				)
				const namialoCheckpoints = checkpointNodes.filter(
					(cp) => cp.districtName && cp.districtName.toLowerCase().includes('namialo'),
				)
				console.log(
					'Nampula checkpoints:',
					nampulaCheckpoints.map((cp) => ({ name: cp.name, district: cp.districtName })),
				)
				console.log(
					'Namialo checkpoints:',
					namialoCheckpoints.map((cp) => ({ name: cp.name, district: cp.districtName })),
				)

				// Find all possible paths
				const allPaths: CheckpointPathWithDetails[] = []

				// Get the first checkpoint from departure and destination districts as default
				// These will always be included as the origin and destination checkpoints
				const defaultDepartureCheckpoint = departureCheckpoints.length > 0 ? departureCheckpoints[0] : null
				const defaultDestinationCheckpoint = destinationCheckpoints.length > 0 ? destinationCheckpoints[0] : null

				// If we have checkpoints in both districts, find paths between them
				if (departureCheckpoints.length > 0 && destinationCheckpoints.length > 0) {
					for (const departureCheckpoint of departureCheckpoints) {
						for (const destinationCheckpoint of destinationCheckpoints) {
							const paths = findPathsBetweenCheckpoints(
								departureCheckpoint,
								destinationCheckpoint,
								checkpointNodes,
								new Set<string>(),
								[],
							)
							allPaths.push(
								...paths.map((path) => {
									// Include departure and destination checkpoints in checkpointDetails
									const checkpointDetails: CheckpointNode[] = []
									if (defaultDepartureCheckpoint) {
										checkpointDetails.push(defaultDepartureCheckpoint)
									}
									// Add transit checkpoints (exclude departure and destination districts)
									const transitCheckpoints = path.checkpointIds
										.filter((id) => id)
										.map((id) => checkpointNodes.find((cp) => cp.id === id))
										.filter(
											(cp) =>
												cp &&
												cp.districtId !== direction.departure_district_id &&
												cp.districtId !== direction.destination_district_id,
										) as CheckpointNode[]
									checkpointDetails.push(...transitCheckpoints)
									if (defaultDestinationCheckpoint) {
										checkpointDetails.push(defaultDestinationCheckpoint)
									}
									return {
										...path,
										checkpointDetails,
									}
								}),
							)
						}
					}
				}

				// If no paths found but we have checkpoints, try to find a path from departure to destination
				if (allPaths.length === 0 && checkpointNodes.length > 0) {
					// Try to find a path from any departure checkpoint to any destination checkpoint
					if (defaultDepartureCheckpoint && defaultDestinationCheckpoint) {
						const path = findPathFromDepartureToDestination(
							defaultDepartureCheckpoint,
							defaultDestinationCheckpoint,
							checkpointNodes,
						)

						if (path && path.length > 0) {
							// Include departure and destination checkpoints
							const checkpointDetails: CheckpointNode[] = []
							checkpointDetails.push(defaultDepartureCheckpoint)
							// Add transit checkpoints (exclude departure and destination districts)
							const transitCheckpoints = path.filter(
								(cp) =>
									cp.districtId !== direction.departure_district_id &&
									cp.districtId !== direction.destination_district_id,
							)
							checkpointDetails.push(...transitCheckpoints)
							checkpointDetails.push(defaultDestinationCheckpoint)

							const pathWithCheckpoints = {
								path: [
									direction.departure_district_name,
									...path.map((cp) => cp.districtName),
									direction.destination_district_name,
								],
								checkpointIds: checkpointDetails.map((cp) => cp.id),
								checkpointDetails,
							}
							allPaths.push(pathWithCheckpoints)
						} else if (defaultDepartureCheckpoint || defaultDestinationCheckpoint) {
							// If no path found but we have at least one checkpoint, include it
							const checkpointDetails: CheckpointNode[] = []
							if (defaultDepartureCheckpoint) {
								checkpointDetails.push(defaultDepartureCheckpoint)
							}
							if (defaultDestinationCheckpoint) {
								checkpointDetails.push(defaultDestinationCheckpoint)
							}
							allPaths.push({
								path: [direction.departure_district_name, direction.destination_district_name],
								checkpointIds: checkpointDetails.map((cp) => cp.id),
								checkpointDetails,
							})
						}
					}
				}

				// If no paths found through checkpoints, create a direct path
				// But still include departure and destination checkpoints if they exist
				if (allPaths.length === 0) {
					const checkpointDetails: CheckpointNode[] = []
					if (defaultDepartureCheckpoint) {
						checkpointDetails.push(defaultDepartureCheckpoint)
					}
					if (defaultDestinationCheckpoint) {
						checkpointDetails.push(defaultDestinationCheckpoint)
					}
					allPaths.push({
						path: [direction.departure_district_name, direction.destination_district_name],
						checkpointIds: checkpointDetails.map((cp) => cp.id),
						checkpointDetails,
					})
				}

				console.log('allPaths', allPaths)

				// Find the shortest path
				const shortestPath = allPaths.reduce((shortest, current) => {
					return current.path.length < shortest.path.length ? current : shortest
				}, allPaths[0])

				setPaths([shortestPath]) // Return only the shortest path
				setIsLoading(false)
			} catch (error) {
				console.error('Error fetching checkpoint paths:', error)
				setError(error instanceof Error ? error.message : 'Unknown error occurred')
				setIsError(true)
				setIsLoading(false)
			}
		}

		if (shipmentId) {
			fetchCheckpointPaths()
		}
	}, [shipmentId, refreshTrigger])
	return { paths, isLoading, error, isError }
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

	// If we've reached the destination district (even if not the exact checkpoint)
	if (current.districtId === destination.districtId) {
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
 * Find a path from departure checkpoint to destination checkpoint through intermediate checkpoints
 */
function findPathFromDepartureToDestination(
	departure: CheckpointNode,
	destination: CheckpointNode,
	allCheckpoints: CheckpointNode[],
): CheckpointNode[] {
	const visited = new Set<string>()
	const path: CheckpointNode[] = []

	// Use DFS to find a path from departure to destination
	const found = findPathDFS(departure, destination, allCheckpoints, visited, path)

	if (found) {
		// Remove the departure and destination checkpoints from the path
		// since we only want intermediate checkpoints
		return path.filter((cp) => cp.id !== departure.id && cp.id !== destination.id)
	}

	return []
}

/**
 * DFS to find path from current to destination
 */
function findPathDFS(
	current: CheckpointNode,
	destination: CheckpointNode,
	allCheckpoints: CheckpointNode[],
	visited: Set<string>,
	path: CheckpointNode[],
): boolean {
	// If we've reached the destination
	if (current.id === destination.id) {
		return true
	}

	// If we've already visited this checkpoint, return false (avoid cycles)
	if (visited.has(current.id)) {
		return false
	}

	// Mark current checkpoint as visited
	visited.add(current.id)
	path.push(current)

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
				const found = findPathDFS(nextCheckpoint, destination, allCheckpoints, visited, path)
				if (found) {
					return true
				}
			}
		}
	}

	// If no path found through this checkpoint, remove it from path and backtrack
	path.pop()
	return false
}
