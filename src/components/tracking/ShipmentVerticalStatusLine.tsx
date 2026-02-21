import React, { useState, useRef } from 'react'
import { View, Text, Platform, UIManager, TouchableOpacity } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { BottomSheetModal } from '@gorhom/bottom-sheet'

import ErrorAlert from '../dialogs/ErrorAlert'
import { ShipmentDirectionRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useQueryOne, useQueryManyAndWatchChanges } from 'src/hooks/queries'
import { useCheckpointPaths } from 'src/hooks/useCheckpointPaths'
import { CheckpointNode } from 'src/utils/shipmentPathFinder'
import CustomShimmerPlaceholder from 'src/components/placeholder/CustomShimmerPlaceholder'
import { colors } from 'src/constants'
import { getUserRole } from 'src/helpers/helpersToUser'
import { UserRoles } from 'src/types'
import CheckpointPathSelectionModal from './CheckpointPathSelectionModal'
import ShipmentInspectionModal from './ShipmentInspectionModal'
import { saveCheckpointSequence } from 'src/library/sqlite/inserts'
import { useUserFromPowerSync } from 'src/hooks/queries'

type ShipmentVerticalStatusLineProps = {
	shipmentId: string
	// setCheck: (check: Check) => void
	handleSnapPress: (index: number) => void
	setSelectedCheckpointName: (name: string) => void
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function ShipmentVerticalStatusLine({
	shipmentId,
	handleSnapPress,
	// setCheck,
	setSelectedCheckpointName,
}: ShipmentVerticalStatusLineProps) {
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [expandedCheckpoint, setExpandedCheckpoint] = useState<string | null>(null)
	const pathSelectionModalRef = useRef<BottomSheetModal>(null)
	const inspectionModalRef = useRef<BottomSheetModal>(null)
	const { userDetails } = useUserFromPowerSync()

	// State for inspection modal
	const [inspectionCheckpointId, setInspectionCheckpointId] = useState<string | null>(null)
	const [inspectionCheckpointType, setInspectionCheckpointType] = useState<
		'DEPARTURE' | 'AT_ARRIVAL' | 'IN_TRANSIT' | null
	>(null)

	const { data: shipmentDirections } = useQueryOne<
		ShipmentDirectionRecord & {
			departure_district_id: string
			destination_district_id: string
			departure_district_name: string
			destination_district_name: string
			departure_province_name: string
			destination_province_name: string
		}
	>(
		`
		SELECT 
			sd.*,
			departure_district.id as departure_district_id,
			destination_district.id as destination_district_id,
			departure_district.name as departure_district_name,
			destination_district.name as destination_district_name,
			departure_province.name as departure_province_name,
			destination_province.name as destination_province_name
		FROM ${TABLES.SHIPMENT_DIRECTIONS} sd
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} departure_address ON sd.departure_address_id = departure_address.id
		LEFT JOIN ${TABLES.DISTRICTS} departure_district ON departure_address.district_id = departure_district.id
		LEFT JOIN ${TABLES.PROVINCES} departure_province ON departure_address.province_id = departure_province.id
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} destination_address ON sd.destination_address_id = destination_address.id
		LEFT JOIN ${TABLES.DISTRICTS} destination_district ON destination_address.district_id = destination_district.id
		LEFT JOIN ${TABLES.PROVINCES} destination_province ON destination_address.province_id = destination_province.id
		WHERE sd.shipment_id = ?
	`,
		[shipmentId],
	)

	// Query shipment status to check if it's DELIVERED
	const { data: shipmentStatus } = useQueryOne<{ status: string }>(
		`
		SELECT status
		FROM ${TABLES.CASHEW_SHIPMENTS}
		WHERE id = ?
	`,
		[shipmentId],
	)

	const isDelivered = shipmentStatus?.status === 'DELIVERED'

	// Get checkpoint paths for the shipment
	const {
		paths: checkpointPaths,
		isLoading: pathsLoading,
		error: pathsError,
		isError: pathsIsError,
	} = useCheckpointPaths(shipmentId)

	// Get the shortest path (first path since we only return one now)
	const shortestPath = checkpointPaths[0]

	// Handle checkpoint expansion - only one checkpoint can be expanded at a time
	const toggleCheckpointExpansion = (checkpointId: string) => {
		if (expandedCheckpoint === checkpointId) {
			// If clicking the same checkpoint, collapse it
			setExpandedCheckpoint(null)
		} else {
			// Expand the new checkpoint (this will automatically collapse the previous one)
			setExpandedCheckpoint(checkpointId)
		}
	}

	// Helper component to check if a checkpoint has been inspected
	const CheckpointInspectionStatus = ({
		checkpointId,
		districtId,
		children,
	}: {
		checkpointId: string | null
		districtId?: string | null
		children: (hasInspection: boolean) => React.ReactNode
	}) => {
		// Query for checkpoints in the district if no checkpointId is provided
		const { data: districtCheckpoints } = useQueryManyAndWatchChanges<{
			id: string
		}>(
			districtId && !checkpointId
				? `
				SELECT sc.id
				FROM ${TABLES.CHECKPOINTS} sc
				LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
				WHERE a.district_id = '${districtId}'
				LIMIT 1
			`
				: `SELECT NULL as id WHERE 1=0`,
		)

		const actualCheckpointId =
			checkpointId || (districtCheckpoints && districtCheckpoints.length > 0 ? districtCheckpoints[0].id : null)

		// Query for existing inspection
		const { data: existingCheck } = useQueryOne<{
			checked_by_id: string
		}>(
			actualCheckpointId
				? `
				SELECT checked_by_id
				FROM ${TABLES.SHIPMENT_CHECKS}
				WHERE shipment_id = '${shipmentId}' AND checkpoint_id = '${actualCheckpointId}'
				LIMIT 1
			`
				: `SELECT NULL as checked_by_id WHERE 1=0`,
			[],
		)

		const hasInspection = !!existingCheck?.checked_by_id
		return <>{children(hasInspection)}</>
	}

	// Determine checkpoint status colors
	const getCheckpointColor = (hasInspection: boolean) => {
		return hasInspection ? '#008000' : '#ef4444' // green if inspected, red otherwise
	}

	const getLineColor = (isAfterInspected: boolean) => {
		return isAfterInspected ? '#008000' : '#9ca3af' // gray-400
	}

	// Component to display inspectors for a checkpoint or district
	const CheckpointInspectors = ({
		checkpointId,
		districtId,
		checkpointType,
		checkpointPosition,
	}: {
		checkpointId: string | null
		districtId?: string | null
		checkpointType?: 'DEPARTURE' | 'AT_ARRIVAL' | 'IN_TRANSIT'
		checkpointPosition?: 'origin' | 'transit' | 'destination'
	}) => {
		const isDarkMode = useColorScheme().colorScheme === 'dark'

		// Query for checkpoints in the district if no checkpointId is provided
		const { data: districtCheckpoints } = useQueryManyAndWatchChanges<{
			id: string
		}>(
			districtId && !checkpointId
				? `
				SELECT sc.id
				FROM ${TABLES.CHECKPOINTS} sc
				LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
				WHERE a.district_id = '${districtId}'
				LIMIT 1
			`
				: `SELECT NULL as id WHERE 1=0`,
		)

		// Use the first checkpoint found in the district, or the provided checkpointId
		const actualCheckpointId =
			checkpointId || (districtCheckpoints && districtCheckpoints.length > 0 ? districtCheckpoints[0].id : null)

		// Query for existing inspection for this checkpoint
		const { data: existingCheck } = useQueryOne<{
			checked_by_id: string
		}>(
			actualCheckpointId
				? `
				SELECT checked_by_id
				FROM ${TABLES.SHIPMENT_CHECKS}
				WHERE shipment_id = '${shipmentId}' AND checkpoint_id = '${actualCheckpointId}'
				LIMIT 1
			`
				: `SELECT NULL as checked_by_id WHERE 1=0`,
			[],
		)

		const hasExistingInspection = !!existingCheck?.checked_by_id
		const performedByInspectorId = existingCheck?.checked_by_id || null

		const { data: inspectors } = useQueryManyAndWatchChanges<{
			id: string
			inspector_id: string
			full_name: string
			phone: string
			user_role: string
		}>(
			actualCheckpointId
				? `
				SELECT 
					sci.id,
					sci.inspector_id,
					ud.full_name,
					ud.phone,
					ud.user_role
				FROM ${TABLES.SHIPMENT_CHECKPOINT_INSPECTORS} sci
				JOIN ${TABLES.USER_DETAILS} ud ON sci.inspector_id = ud.id
				WHERE sci.checkpoint_id = '${actualCheckpointId}'
			`
				: `SELECT NULL as id, NULL as inspector_id, NULL as full_name, NULL as phone, NULL as user_role WHERE 1=0`,
		)

		// Determine checkpoint type based on position if not provided
		const determinedCheckpointType =
			checkpointType ||
			(checkpointPosition === 'origin'
				? 'DEPARTURE'
				: checkpointPosition === 'destination'
					? 'AT_ARRIVAL'
					: 'IN_TRANSIT')

		// Handle inspector press
		const handleInspectorPress = (inspectorId: string) => {
			// Prevent if shipment is delivered
			if (isDelivered) {
				return
			}
			// Prevent if inspection already exists
			if (hasExistingInspection) {
				return
			}
			// Only allow if the inspector is the current user
			if (userDetails?.id === inspectorId && actualCheckpointId) {
				setInspectionCheckpointId(actualCheckpointId)
				setInspectionCheckpointType(determinedCheckpointType)
				inspectionModalRef.current?.present()
			}
		}

		if (!actualCheckpointId) {
			return (
				<View className="ml-9 mt-2 mb-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
					<View className="flex-row items-center justify-center">
						<Ionicons name="information-circle-outline" size={14} color={colors.gray600} />
						<Text className="text-xs text-gray-600 dark:text-gray-400 ml-1.5 text-center">
							Este Posto de Fiscalização ainda não tem fiscais alocados
						</Text>
					</View>
				</View>
			)
		}

		if (!inspectors || inspectors.length === 0) {
			return (
				<View className="ml-9 mt-2 mb-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
					<View className="flex-row items-center justify-center">
						<Ionicons name="information-circle-outline" size={14} color={colors.gray600} />
						<Text className="text-xs text-gray-600 dark:text-gray-400 ml-1.5 text-center">
							Nenhum fiscal atribuído a este posto
						</Text>
					</View>
				</View>
			)
		}

		return (
			<View className="ml-9 mt-2 mb-2">
				<View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
					<Text className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
						Fiscais Alocados ({inspectors.length})
					</Text>
					{inspectors.map((inspector) => {
						const isCurrentUser = userDetails?.id === inspector.inspector_id
						const performedInspection = hasExistingInspection && performedByInspectorId === inspector.inspector_id
						const canPerformInspection = isCurrentUser && !hasExistingInspection && !isDelivered

						return (
							<TouchableOpacity
								key={inspector.id}
								onPress={() => handleInspectorPress(inspector.inspector_id)}
								disabled={!canPerformInspection}
								className={`flex-row items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700 last:mb-0 last:pb-0 last:border-b-0 ${
									performedInspection
										? 'bg-[#008000]/10 dark:bg-[#008000]/20 rounded-lg p-2 -mx-2 border-[#008000]'
										: canPerformInspection
											? 'opacity-100'
											: 'opacity-75'
								}`}
								activeOpacity={canPerformInspection ? 0.7 : 1}
							>
								<View
									className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${
										performedInspection ? 'bg-[#008000] dark:bg-[#008000]' : 'bg-gray-100 dark:bg-gray-700'
									}`}
								>
									<MaterialCommunityIcons
										name={performedInspection ? 'check-circle' : 'account'}
										size={16}
										color={performedInspection ? 'white' : colors.gray600}
									/>
								</View>
								<View className="flex-1">
									<View className="flex-row items-center">
										<Text
											className={`text-xs font-medium ${
												performedInspection
													? 'text-[#008000] dark:text-green-400 font-bold'
													: 'text-gray-900 dark:text-gray-100'
											}`}
										>
											{inspector.full_name}
										</Text>
										{performedInspection && (
											<View className="ml-2 px-2 py-0.5 bg-[#008000] rounded-full">
												<Text className="text-xs font-semibold text-white">Fiscalizado</Text>
											</View>
										)}
										{canPerformInspection && (
											<View className="ml-2 px-2 py-0.5 bg-[#008000]/20 rounded-full">
												<Text className="text-xs font-semibold text-[#008000]">Fiscalizar</Text>
											</View>
										)}
									</View>
									<View className="flex-row items-center mt-0.5">
										<Ionicons name="shield-outline" size={10} color={colors.gray600} />
										<Text className="text-xs text-gray-600 dark:text-gray-400 ml-1">
											{getUserRole(inspector.user_role as UserRoles)}
										</Text>
										<Ionicons name="call-outline" size={10} color={colors.gray600} style={{ marginLeft: 8 }} />
										<Text className="text-xs text-gray-600 dark:text-gray-400 ml-1">{inspector.phone}</Text>
									</View>
								</View>
							</TouchableOpacity>
						)
					})}
				</View>
			</View>
		)
	}

	// Extract departure and destination checkpoints from checkpointDetails
	const departureDistrictId = shipmentDirections?.departure_district_id
	const destinationDistrictId = shipmentDirections?.destination_district_id

	const departureCheckpoint = shortestPath?.checkpointDetails?.find((cp) => cp.districtId === departureDistrictId)
	const destinationCheckpoint = shortestPath?.checkpointDetails?.find((cp) => cp.districtId === destinationDistrictId)

	// Filter out departure and destination checkpoints from transit list
	const transitCheckpoints =
		shortestPath?.checkpointDetails?.filter(
			(cp) => cp.districtId !== departureDistrictId && cp.districtId !== destinationDistrictId,
		) || []

	// Skeleton for loading state
	const renderLoadingSkeleton = () => (
		<View className="flex-1">
			{/* Origin Skeleton */}
			<View className="flex-row items-start mb-4 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
				<CustomShimmerPlaceholder
					style={{
						width: 24,
						height: 24,
						borderRadius: 12,
						marginRight: 12,
						marginTop: 4,
					}}
				/>
				<View className="flex-1">
					<CustomShimmerPlaceholder
						style={{
							width: '80%',
							height: 14,
							borderRadius: 4,
							marginBottom: 6,
						}}
					/>
					<CustomShimmerPlaceholder
						style={{
							width: '60%',
							height: 12,
							borderRadius: 4,
							marginBottom: 4,
						}}
					/>
					<CustomShimmerPlaceholder
						style={{
							width: '70%',
							height: 12,
							borderRadius: 4,
						}}
					/>
				</View>
				<CustomShimmerPlaceholder
					style={{
						width: 24,
						height: 24,
						borderRadius: 4,
						marginTop: 4,
					}}
				/>
			</View>

			{/* Vertical line skeleton */}
			<View className="ml-3 mb-4">
				<CustomShimmerPlaceholder
					style={{
						width: 2,
						height: 64,
						borderRadius: 1,
					}}
				/>
			</View>

			{/* Transit Checkpoints Skeleton */}
			{[1, 2].map((_, index) => (
				<React.Fragment key={index}>
					<View className="flex-row items-start mb-4 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
						<CustomShimmerPlaceholder
							style={{
								width: 24,
								height: 24,
								borderRadius: 12,
								marginRight: 12,
								marginTop: 4,
							}}
						/>
						<View className="flex-1">
							<CustomShimmerPlaceholder
								style={{
									width: '75%',
									height: 14,
									borderRadius: 4,
									marginBottom: 6,
								}}
							/>
							<CustomShimmerPlaceholder
								style={{
									width: '55%',
									height: 12,
									borderRadius: 4,
									marginBottom: 4,
								}}
							/>
							<CustomShimmerPlaceholder
								style={{
									width: '65%',
									height: 12,
									borderRadius: 4,
								}}
							/>
						</View>
						<CustomShimmerPlaceholder
							style={{
								width: 24,
								height: 24,
								borderRadius: 4,
								marginTop: 4,
							}}
						/>
					</View>

					{/* Vertical line skeleton */}
					<View className="ml-3 mb-4">
						<CustomShimmerPlaceholder
							style={{
								width: 2,
								height: 64,
								borderRadius: 1,
							}}
						/>
					</View>
				</React.Fragment>
			))}

			{/* Destination Skeleton */}
			<View className="flex-row items-start p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
				<CustomShimmerPlaceholder
					style={{
						width: 24,
						height: 24,
						borderRadius: 12,
						marginRight: 12,
						marginTop: 4,
					}}
				/>
				<View className="flex-1">
					<CustomShimmerPlaceholder
						style={{
							width: '70%',
							height: 14,
							borderRadius: 4,
							marginBottom: 6,
						}}
					/>
					<CustomShimmerPlaceholder
						style={{
							width: '50%',
							height: 12,
							borderRadius: 4,
							marginBottom: 4,
						}}
					/>
					<CustomShimmerPlaceholder
						style={{
							width: '65%',
							height: 12,
							borderRadius: 4,
						}}
					/>
				</View>
				<CustomShimmerPlaceholder
					style={{
						width: 24,
						height: 24,
						borderRadius: 4,
						marginTop: 4,
					}}
				/>
			</View>
		</View>
	)

	return (
		<View className="flex flex-col justify-center pl-4">
			{/* Display Checkpoint Timeline */}
			{pathsLoading ? (
				renderLoadingSkeleton()
			) : pathsIsError ? (
				<View className="p-4">
					<Text className="text-red-500 text-center">Erro ao carregar rota: {pathsError}</Text>
				</View>
			) : shortestPath ? (
				<View className="flex-1">
					{/* Origin - Show checkpoint if exists, otherwise show district */}
					<View>
						<CheckpointInspectionStatus
							checkpointId={departureCheckpoint?.id || null}
							districtId={departureDistrictId || null}
						>
							{(hasInspection) => {
								const checkpointColor = getCheckpointColor(hasInspection)
								return (
									<TouchableOpacity
										className="flex-row items-start mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
										onPress={() => toggleCheckpointExpansion('origin')}
										activeOpacity={0.7}
									>
										<View
											className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-1"
											style={{ backgroundColor: checkpointColor }}
										>
											<Ionicons name="location-outline" size={18} color="white" />
										</View>
										<View className="flex-1">
											<Text className="text-sm font-semibold dark:text-white" style={{ color: checkpointColor }}>
												Proveniência:{' '}
												{departureCheckpoint?.name ||
													shipmentDirections?.departure_district_name ||
													shortestPath.path[0]}
											</Text>
											<Text className="text-xs text-gray-500 dark:text-gray-400">{hasInspection ? 'Fiscalizado' : 'Origem da carga'}</Text>
											<Text className="text-xs text-gray-600 dark:text-gray-400 font-medium">
												{departureCheckpoint?.districtName ||
													shipmentDirections?.departure_district_name ||
													shortestPath.path[0]}
											</Text>
										</View>
										<View className="justify-center items-center mt-1 ml-auto">
											<Ionicons
												name={expandedCheckpoint === 'origin' ? 'chevron-up' : 'chevron-down'}
												size={24}
												color="#6B7280"
											/>
										</View>
									</TouchableOpacity>
								)
							}}
						</CheckpointInspectionStatus>
						{/* Show inspectors when expanded - origin is always a virtual checkpoint from district */}
						{expandedCheckpoint === 'origin' && (
							<CheckpointInspectors
								checkpointId={departureCheckpoint?.id || null}
								districtId={departureDistrictId || null}
								checkpointType="DEPARTURE"
								checkpointPosition="origin"
							/>
						)}
					</View>

					{/* Vertical line after origin */}
					<View className="ml-3 mb-4">
						<View className="w-0.5 h-16" style={{ backgroundColor: getLineColor(true) }} />
					</View>

					{/* Transit Checkpoints */}
					{transitCheckpoints.length > 0 ? (
						transitCheckpoints.map((checkpoint: CheckpointNode, index: number) => {
							const isExpanded = expandedCheckpoint === checkpoint.id

							return (
								<React.Fragment key={checkpoint.id}>
									<View>
										<CheckpointInspectionStatus checkpointId={checkpoint.id}>
											{(hasInspection) => {
												const checkpointColor = getCheckpointColor(hasInspection)
												return (
													<TouchableOpacity
														className="flex-row items-start mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
														onPress={() => toggleCheckpointExpansion(checkpoint.id)}
														activeOpacity={0.7}
													>
														<View
															className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-1"
															style={{ backgroundColor: checkpointColor }}
														>
															<Ionicons name="location-outline" size={18} color="white" />
														</View>
														<View className="flex-1">
															<Text className="text-sm font-semibold dark:text-white" style={{ color: checkpointColor }}>
																Trânsito: {checkpoint.name}
															</Text>
															<Text className="text-xs text-gray-500 dark:text-gray-400 font-bold">
																{hasInspection ? 'Fiscalizado' : 'Ainda não fiscalizado'}
															</Text>
															<Text className="text-xs text-gray-400 dark:text-gray-400">{checkpoint.districtName}</Text>
														</View>
														<View className="justify-center items-center mt-1 ml-auto">
															<Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#6B7280" />
														</View>
													</TouchableOpacity>
												)
											}}
										</CheckpointInspectionStatus>
										{/* Show inspectors when expanded */}
										{isExpanded && (
											<CheckpointInspectors
												checkpointId={checkpoint.id}
												checkpointType="IN_TRANSIT"
												checkpointPosition="transit"
											/>
										)}
									</View>

									{/* Vertical line after checkpoint */}
									<View className="ml-3 mb-4">
										<View className="w-0.5 h-16" style={{ backgroundColor: getLineColor(false) }} />
									</View>
								</React.Fragment>
							)
						})
					) : (
						// Show message when no transit checkpoints are found
						<>
							<View className="ml-3 mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
								<View className="flex-row items-center mb-2">
									<Ionicons name="information-circle-outline" size={16} color={colors.gray600} />
									<Text className="ml-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
										Nenhum posto de trânsito seleccionado
									</Text>
								</View>
								<Text className="text-xs text-gray-500 dark:text-gray-400">
									Toque no botão acima para seleccionar os postos de fiscalização que o carregamento deve passar
								</Text>
							</View>
							{/* Vertical line after checkpoint */}
							<View className="ml-3 mb-4">
								<View className="w-0.5 h-16" style={{ backgroundColor: getLineColor(false) }} />
							</View>
						</>
					)}

					{/* Destination - Show checkpoint if exists, otherwise show district */}
					<View>
						<CheckpointInspectionStatus
							checkpointId={destinationCheckpoint?.id || null}
							districtId={destinationDistrictId || null}
						>
							{(hasInspection) => {
								const checkpointColor = getCheckpointColor(hasInspection)
								return (
									<TouchableOpacity
										className="flex-row items-start p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
										onPress={() => toggleCheckpointExpansion('destination')}
										activeOpacity={0.7}
									>
										<View
											className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-1"
											style={{ backgroundColor: checkpointColor }}
										>
											<Ionicons name="location-outline" size={18} color="white" />
										</View>
										<View className="flex-1">
											<Text className="text-sm font-semibold dark:text-white" style={{ color: checkpointColor }}>
												Destino:{' '}
												{destinationCheckpoint?.name ||
													shipmentDirections?.destination_district_name ||
													shortestPath.path[shortestPath.path.length - 1]}
											</Text>
											<Text className="text-xs text-gray-500 dark:text-gray-400">{hasInspection ? 'Fiscalizado' : 'Destino final'}</Text>
											<Text className="text-xs text-gray-600 dark:text-gray-400 font-medium">
												{destinationCheckpoint?.districtName ||
													shipmentDirections?.destination_district_name ||
													shortestPath.path[shortestPath.path.length - 1]}
											</Text>
										</View>
										<View className="justify-center items-center mt-1 ml-auto">
											<Ionicons
												name={expandedCheckpoint === 'destination' ? 'chevron-up' : 'chevron-down'}
												size={24}
												color="#6B7280"
											/>
										</View>
									</TouchableOpacity>
								)
							}}
						</CheckpointInspectionStatus>
						{/* Show inspectors when expanded - destination is always a virtual checkpoint from district */}
						{expandedCheckpoint === 'destination' && (
							<CheckpointInspectors
								checkpointId={destinationCheckpoint?.id || null}
								districtId={destinationDistrictId || null}
								checkpointType="AT_ARRIVAL"
								checkpointPosition="destination"
							/>
						)}
					</View>

					{/* Button to select checkpoint path - Moved to bottom - Hide if delivered */}
					{!isDelivered && (
						<View className="mt-6 mb-2">
							<TouchableOpacity
								onPress={() => pathSelectionModalRef.current?.present()}
								className="flex-row items-center justify-center px-4 py-3 bg-[#008000] rounded-lg border border-[#008000]"
								activeOpacity={0.7}
							>
								<Ionicons name="map-outline" size={20} color="white" />
								<Text className="ml-2 text-white font-semibold">
									{transitCheckpoints.length > 0
										? 'Actualizar Postos de Fiscalização'
										: 'Seleccionar Postos de Fiscalização'}
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
			) : (
				<View className="p-4">
					<Text className="text-gray-500 text-center">Nenhuma rota encontrada</Text>
				</View>
			)}

			{/* {shipmentDirections?.map((direction, index) => {
				return (
					<DistrictInfo
						district={direction.direction}
						shipmentId={shipmentId}
						setSelectedCheckpointName={setSelectedCheckpointName}
						// setCheck={setCheck}
						handleSnapPress={handleSnapPress}
						key={index}
						index={index}
						// currentPath={currentPath}
					/>
				)
			})} */}

			<ErrorAlert
				title="Selecção de rota"
				setMessage={setErrorMessage}
				visible={hasError}
				setVisible={setHasError}
				message={errorMessage}
			/>

			{/* Checkpoint Path Selection Modal */}
			{shipmentDirections && (
				<CheckpointPathSelectionModal
					bottomSheetModalRef={pathSelectionModalRef as React.RefObject<BottomSheetModal>}
					shipmentId={shipmentId}
					shipmentDirectionId={shipmentDirections.id}
					departureProvinceName={shipmentDirections.departure_province_name || ''}
					destinationProvinceName={shipmentDirections.destination_province_name || ''}
					onSave={async (checkpointIds: string[]) => {
						try {
							const syncId = `${shipmentId}_${Date.now()}`
							const result = await saveCheckpointSequence(shipmentId, shipmentDirections.id, checkpointIds, syncId)
							if (result.success) {
								// Refresh checkpoint paths
								// The paths will be refreshed automatically via useCheckpointPaths hook
								console.log('Checkpoint sequence saved successfully')
							} else {
								setErrorMessage(result.message)
								setHasError(true)
							}
						} catch (error) {
							console.error('Error saving checkpoint sequence:', error)
							setErrorMessage('Erro ao salvar sequência de postos')
							setHasError(true)
						}
					}}
				/>
			)}

			{/* Inspection Modal */}
			{shipmentDirections && inspectionCheckpointId && inspectionCheckpointType && userDetails?.id && (
				<ShipmentInspectionModal
					bottomSheetModalRef={inspectionModalRef as React.RefObject<BottomSheetModal>}
					shipmentId={shipmentId}
					checkpointId={inspectionCheckpointId}
					checkpointType={inspectionCheckpointType}
					shipmentDirectionId={shipmentDirections.id}
					checkedById={userDetails.id}
					onSuccess={() => {
						// Optionally refresh data or show success message
						console.log('Inspection saved successfully')
					}}
				/>
			)}
		</View>
	)
}
