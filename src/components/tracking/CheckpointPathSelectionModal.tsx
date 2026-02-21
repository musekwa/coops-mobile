import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native'
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useQueryMany, useQueryManyAndWatchChanges, useQueryOne } from 'src/hooks/queries'
import { getRelevantProvinces } from 'src/utils/provincePathFinder'
import { CheckpointNode } from 'src/utils/shipmentPathFinder'

interface CheckpointWithLocation {
	id: string
	name: string
	checkpoint_type: string
	district_name: string
	province_name: string
	province_code: string
	district_id: string
	province_id: string
}

interface CheckpointPathSelectionModalProps {
	bottomSheetModalRef: React.RefObject<BottomSheetModal>
	shipmentId: string
	shipmentDirectionId: string
	departureProvinceName: string
	destinationProvinceName: string
	onSave: (checkpointIds: string[]) => void
}

export default function CheckpointPathSelectionModal({
	bottomSheetModalRef,
	shipmentId,
	shipmentDirectionId,
	departureProvinceName,
	destinationProvinceName,
	onSave,
}: CheckpointPathSelectionModalProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCheckpoints, setSelectedCheckpoints] = useState<CheckpointWithLocation[]>([])
	const [isSaving, setIsSaving] = useState(false)

	// Get relevant provinces for filtering (using both codes and names for robust matching)
	const relevantProvinces = useMemo(() => {
		if (!departureProvinceName || !destinationProvinceName) {
			return { codes: [], names: [] }
		}
		const provinces = getRelevantProvinces(departureProvinceName, destinationProvinceName)
		return provinces
	}, [departureProvinceName, destinationProvinceName])

	// Query checkpoints in relevant provinces
	// Use both province codes and names for matching to avoid mismatches
	const checkpointsQuery = useMemo(() => {
		if (relevantProvinces.codes.length === 0 && relevantProvinces.names.length === 0) {
			// Fallback: show all checkpoints if province filtering fails
			return `
				SELECT 
					sc.id,
					sc.name,
					sc.checkpoint_type,
					d.name as district_name,
					p.name as province_name,
					p.code as province_code,
					d.id as district_id,
					p.id as province_id
				FROM ${TABLES.CHECKPOINTS} sc
				LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
				LEFT JOIN ${TABLES.DISTRICTS} d ON a.district_id = d.id
				LEFT JOIN ${TABLES.PROVINCES} p ON a.province_id = p.id
				WHERE sc.id IS NOT NULL
				ORDER BY p.name, sc.name
			`
		}

		// Build WHERE clause using both codes and names for robust matching
		const codeConditions =
			relevantProvinces.codes.length > 0
				? `p.code IN (${relevantProvinces.codes.map((c) => `'${c.replace(/'/g, "''")}'`).join(',')})`
				: ''
		const nameConditions =
			relevantProvinces.names.length > 0
				? `p.name IN (${relevantProvinces.names.map((n) => `'${n.replace(/'/g, "''")}'`).join(',')})`
				: ''

		const whereClause = [codeConditions, nameConditions].filter((c) => c).join(' OR ')

		const query = `
			SELECT 
				sc.id,
				sc.name,
				sc.checkpoint_type,
				d.name as district_name,
				p.name as province_name,
				p.code as province_code,
				d.id as district_id,
				p.id as province_id
			FROM ${TABLES.CHECKPOINTS} sc
			LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
			LEFT JOIN ${TABLES.DISTRICTS} d ON a.district_id = d.id
			LEFT JOIN ${TABLES.PROVINCES} p ON a.province_id = p.id
			WHERE ${whereClause}
			ORDER BY p.name, sc.name
		`
		return query
	}, [relevantProvinces])

	const { data: availableCheckpoints, isLoading: isLoadingCheckpoints } =
		useQueryMany<CheckpointWithLocation>(checkpointsQuery)

	// Query existing sequence for this shipment - use watch to ensure it updates when modal opens
	const { data: existingSequence } = useQueryManyAndWatchChanges<{
		id: string
		checkpoint_id: string
		sequence_order: number
		checkpoint_name: string
		district_name: string
		province_name: string
	}>(
		`
		SELECT 
			scs.id,
			scs.checkpoint_id,
			scs.sequence_order,
			sc.name as checkpoint_name,
			d.name as district_name,
			p.name as province_name
		FROM ${TABLES.SHIPMENT_CHECKPOINT_SEQUENCE} scs
		JOIN ${TABLES.CHECKPOINTS} sc ON scs.checkpoint_id = sc.id
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
		LEFT JOIN ${TABLES.DISTRICTS} d ON a.district_id = d.id
		LEFT JOIN ${TABLES.PROVINCES} p ON a.province_id = p.id
		WHERE scs.shipment_id = '${shipmentId}' AND scs.shipment_direction_id = '${shipmentDirectionId}'
		ORDER BY scs.sequence_order
	`,
	)

	// Query for inspections to determine which checkpoints have been inspected
	const { data: inspections } = useQueryManyAndWatchChanges<{
		checkpoint_id: string
		checked_at: string
		sequence_order: number | null
	}>(
		`
		SELECT 
			sc.checkpoint_id,
			sc.checked_at,
			scs.sequence_order
		FROM ${TABLES.SHIPMENT_CHECKS} sc
		LEFT JOIN ${TABLES.SHIPMENT_CHECKPOINT_SEQUENCE} scs 
			ON sc.shipment_id = scs.shipment_id 
			AND sc.checkpoint_id = scs.checkpoint_id
			AND sc.shipment_direction_id = scs.shipment_direction_id
		WHERE sc.shipment_id = '${shipmentId}' AND sc.shipment_direction_id = '${shipmentDirectionId}'
	`,
	)

	// Determine the last inspected checkpoint's sequence order
	const lastInspectedSequenceOrder = useMemo(() => {
		if (!inspections || inspections.length === 0) return null

		// Get all inspected checkpoints with their sequence orders
		const inspectedWithOrders = inspections
			.filter((insp) => insp.sequence_order !== null)
			.map((insp) => insp.sequence_order!) // sequence_order is guaranteed to be number here
			.sort((a, b) => b - a) // Sort descending to get the highest sequence order

		return inspectedWithOrders.length > 0 ? inspectedWithOrders[0] : null
	}, [inspections])

	// Create a set of inspected checkpoint IDs for quick lookup
	const inspectedCheckpointIds = useMemo(() => {
		return new Set(inspections?.map((insp) => insp.checkpoint_id) || [])
	}, [inspections])

	// Check if a checkpoint at a given index can be modified (removed or moved)
	const canModifyCheckpoint = useCallback(
		(checkpointId: string, index: number) => {
			// If there's no inspected checkpoint, all checkpoints can be modified
			if (lastInspectedSequenceOrder === null) return true

			// Find the checkpoint's sequence order in the existing sequence
			const checkpointSequence = existingSequence?.find((seq) => seq.checkpoint_id === checkpointId)

			// If checkpoint is not in existing sequence (newly added), check its position
			// New checkpoints can be modified if they're added after the last inspected position
			if (!checkpointSequence) {
				// Position in current sequence (1-indexed) should be after last inspected
				const currentPosition = index + 1
				return currentPosition > lastInspectedSequenceOrder
			}

			// Checkpoint can only be modified if its sequence order is greater than the last inspected one
			return checkpointSequence.sequence_order > lastInspectedSequenceOrder
		},
		[lastInspectedSequenceOrder, existingSequence],
	)

	// Initialize selected checkpoints from existing sequence
	useEffect(() => {
		// Wait for both data sources to be available
		if (!availableCheckpoints) return

		// If there's no existing sequence, reset to empty array
		if (!existingSequence || existingSequence.length === 0) {
			setSelectedCheckpoints([])
			return
		}

		// If we have existing sequence and available checkpoints, initialize
		if (existingSequence.length > 0) {
			const sorted = existingSequence
				.sort((a, b) => a.sequence_order - b.sequence_order)
				.map((seq) => {
					const checkpoint = availableCheckpoints.find((cp) => cp.id === seq.checkpoint_id)
					return checkpoint
						? {
								id: checkpoint.id,
								name: checkpoint.name,
								checkpoint_type: checkpoint.checkpoint_type,
								district_name: checkpoint.district_name,
								province_name: checkpoint.province_name,
								province_code: checkpoint.province_code,
								district_id: checkpoint.district_id,
								province_id: checkpoint.province_id,
							}
						: null
				})
				.filter((cp): cp is CheckpointWithLocation => cp !== null)

			// Only update if we actually found matching checkpoints
			if (sorted.length > 0) {
				setSelectedCheckpoints(sorted)
			} else {
				// If no matches found, reset to empty
				setSelectedCheckpoints([])
			}
		}
	}, [existingSequence, availableCheckpoints])

	// Filter checkpoints based on search
	const filteredCheckpoints = useMemo(() => {
		if (!availableCheckpoints) return []
		return availableCheckpoints.filter(
			(checkpoint) =>
				checkpoint.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				checkpoint.district_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				checkpoint.province_name?.toLowerCase().includes(searchQuery.toLowerCase()),
		)
	}, [availableCheckpoints, searchQuery])

	const handleAddCheckpoint = (checkpoint: CheckpointWithLocation) => {
		if (!selectedCheckpoints.find((cp) => cp.id === checkpoint.id)) {
			setSelectedCheckpoints([...selectedCheckpoints, checkpoint])
		}
	}

	const handleRemoveCheckpoint = (checkpointId: string, index: number) => {
		// Check if this checkpoint can be removed
		if (!canModifyCheckpoint(checkpointId, index)) {
			return // Silently ignore if checkpoint cannot be modified
		}
		setSelectedCheckpoints(selectedCheckpoints.filter((cp) => cp.id !== checkpointId))
	}

	const handleMoveUp = (index: number) => {
		if (index === 0) return
		const checkpoint = selectedCheckpoints[index]
		// Check if this checkpoint can be moved
		if (!canModifyCheckpoint(checkpoint.id, index)) {
			return // Silently ignore if checkpoint cannot be modified
		}
		// Also check if the checkpoint above can be moved (we're swapping positions)
		const checkpointAbove = selectedCheckpoints[index - 1]
		if (!canModifyCheckpoint(checkpointAbove.id, index - 1)) {
			return // Cannot move if the checkpoint we're swapping with is locked
		}
		const newCheckpoints = [...selectedCheckpoints]
		;[newCheckpoints[index - 1], newCheckpoints[index]] = [newCheckpoints[index], newCheckpoints[index - 1]]
		setSelectedCheckpoints(newCheckpoints)
	}

	const handleMoveDown = (index: number) => {
		if (index === selectedCheckpoints.length - 1) return
		const checkpoint = selectedCheckpoints[index]
		// Check if this checkpoint can be moved
		if (!canModifyCheckpoint(checkpoint.id, index)) {
			return // Silently ignore if checkpoint cannot be modified
		}
		// Also check if the checkpoint below can be moved (we're swapping positions)
		const checkpointBelow = selectedCheckpoints[index + 1]
		if (!canModifyCheckpoint(checkpointBelow.id, index + 1)) {
			return // Cannot move if the checkpoint we're swapping with is locked
		}
		const newCheckpoints = [...selectedCheckpoints]
		;[newCheckpoints[index], newCheckpoints[index + 1]] = [newCheckpoints[index + 1], newCheckpoints[index]]
		setSelectedCheckpoints(newCheckpoints)
	}

	const handleSave = async () => {
		setIsSaving(true)
		try {
			// Save sequence will be handled by parent component
			onSave(selectedCheckpoints.map((cp) => cp.id))
			bottomSheetModalRef.current?.dismiss()
		} catch (error) {
			console.error('Error saving checkpoint sequence:', error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleDismiss = () => {
		setSearchQuery('')
		// Reset to existing sequence when dismissing without saving
		if (existingSequence && existingSequence.length > 0 && availableCheckpoints) {
			const sorted = existingSequence
				.sort((a, b) => a.sequence_order - b.sequence_order)
				.map((seq) => {
					const checkpoint = availableCheckpoints.find((cp) => cp.id === seq.checkpoint_id)
					return checkpoint
						? {
								id: checkpoint.id,
								name: checkpoint.name,
								checkpoint_type: checkpoint.checkpoint_type,
								district_name: checkpoint.district_name,
								province_name: checkpoint.province_name,
								district_id: checkpoint.district_id,
								province_id: checkpoint.province_id,
							}
						: null
				})
				.filter((cp): cp is CheckpointWithLocation => cp !== null)
			setSelectedCheckpoints(sorted)
		} else {
			setSelectedCheckpoints([])
		}
	}

	const snapPoints = useMemo(() => ['75%', '90%'], [])

	const renderBackdrop = useCallback(
		(props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
		[],
	)

	return (
		<BottomSheetModal
			ref={bottomSheetModalRef}
			index={0}
			snapPoints={snapPoints}
			backdropComponent={renderBackdrop}
			onDismiss={handleDismiss}
			enablePanDownToClose={true}
			backgroundStyle={{
				backgroundColor: isDarkMode ? colors.gray800 : colors.white,
			}}
			handleIndicatorStyle={{
				backgroundColor: isDarkMode ? colors.white : colors.gray600,
			}}
		>
			<View style={{ flex: 1, flexDirection: 'column' }}>
				{/* Scrollable Content */}
				<BottomSheetScrollView
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingBottom: 16,
					}}
					style={{ flex: 1 }}
					showsVerticalScrollIndicator={true}
				>
					{/* Header */}
					<View className="flex-row items-center justify-between mb-4">
						<Text className="text-lg font-bold text-gray-900 dark:text-white">Seleccionar Postos de Fiscalização</Text>
						<TouchableOpacity onPress={handleDismiss}>
							<Ionicons name="close" size={24} color={isDarkMode ? colors.white : colors.gray600} />
						</TouchableOpacity>
					</View>

					{/* Selected Checkpoints Section */}
					{selectedCheckpoints.length > 0 && (
						<View className="mb-4">
							<Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
								Sequência Seleccionada ({selectedCheckpoints.length})
							</Text>
							<ScrollView className="max-h-32 mb-2">
								{selectedCheckpoints.map((checkpoint, index) => {
									const canModify = canModifyCheckpoint(checkpoint.id, index)
									const isInspected = inspectedCheckpointIds.has(checkpoint.id)
									return (
										<View
											key={checkpoint.id}
											className={`flex-row items-center justify-between p-2 mb-2 rounded-lg ${
												canModify
													? 'bg-gray-100 dark:bg-gray-700'
													: 'bg-[#008000]/10 dark:bg-[#008000]/20 border border-[#008000]'
											}`}
										>
											<View className="flex-1 flex-row items-center">
												<View
													className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${
														isInspected ? 'bg-[#008000]' : 'bg-[#008000]'
													}`}
												>
													<Text className="text-white text-xs font-bold">{index + 1}</Text>
												</View>
												<View className="flex-1">
													<Text className="text-sm font-medium text-gray-900 dark:text-white">{checkpoint.name}</Text>
													<Text className="text-xs text-gray-600 dark:text-gray-400">
														{checkpoint.district_name}, {checkpoint.province_name}
														{!canModify && ' • Fiscalizado'}
													</Text>
												</View>
											</View>
											<View className="flex-row items-center">
												<TouchableOpacity
													onPress={() => handleMoveUp(index)}
													disabled={index === 0 || !canModify}
													className={`p-1 mr-1 ${index === 0 || !canModify ? 'opacity-30' : ''}`}
												>
													<Ionicons
														name="arrow-up"
														size={18}
														color={index === 0 || !canModify ? colors.gray100 : colors.gray600}
													/>
												</TouchableOpacity>
												<TouchableOpacity
													onPress={() => handleMoveDown(index)}
													disabled={index === selectedCheckpoints.length - 1 || !canModify}
													className={`p-1 mr-1 ${
														index === selectedCheckpoints.length - 1 || !canModify ? 'opacity-30' : ''
													}`}
												>
													<Ionicons
														name="arrow-down"
														size={18}
														color={
															index === selectedCheckpoints.length - 1 || !canModify ? colors.gray100 : colors.gray600
														}
													/>
												</TouchableOpacity>
												<TouchableOpacity
													onPress={() => handleRemoveCheckpoint(checkpoint.id, index)}
													disabled={!canModify}
													className={`p-1 ${!canModify ? 'opacity-30' : ''}`}
												>
													<Ionicons name="close-circle" size={20} color={!canModify ? colors.gray100 : '#ef4444'} />
												</TouchableOpacity>
											</View>
										</View>
									)
								})}
							</ScrollView>
						</View>
					)}

					{/* Search */}
					<View className="mb-4">
						<View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
							<Ionicons name="search" size={20} color={colors.gray600} />
							<TextInput
								className="flex-1 ml-2 text-gray-900 dark:text-white"
								placeholder="Pesquisar posto..."
								placeholderTextColor={colors.gray600}
								value={searchQuery}
								onChangeText={setSearchQuery}
							/>
						</View>
					</View>

					{/* Available Checkpoints */}
					<View>
						<View className="flex-row items-center justify-between mb-2">
							<Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">Postos Disponíveis</Text>
							{availableCheckpoints && (
								<Text className="text-xs text-gray-500 dark:text-gray-400">
									{availableCheckpoints.length} {availableCheckpoints.length === 1 ? 'posto' : 'postos'}
								</Text>
							)}
						</View>
						{isLoadingCheckpoints ? (
							<View className="items-center justify-center py-8">
								<ActivityIndicator size="large" color={colors.primary} />
								<Text className="mt-2 text-gray-500 dark:text-gray-400">A carregar postos...</Text>
							</View>
						) : filteredCheckpoints.length === 0 ? (
							<View className="p-4 items-center">
								<Ionicons name="location-outline" size={48} color={colors.gray600} />
								<Text className="mt-2 text-gray-500 dark:text-gray-400 text-center">
									{availableCheckpoints && availableCheckpoints.length === 0
										? 'Nenhum posto encontrado na base de dados'
										: 'Nenhum posto corresponde à pesquisa'}
								</Text>
								{searchQuery && (
									<TouchableOpacity
										onPress={() => setSearchQuery('')}
										className="mt-2 px-3 py-1 bg-blue-500 rounded-lg"
									>
										<Text className="text-white text-xs">Limpar pesquisa</Text>
									</TouchableOpacity>
								)}
							</View>
						) : (
							filteredCheckpoints.map((checkpoint) => {
								const isSelected = selectedCheckpoints.some((cp) => cp.id === checkpoint.id)
								const selectedIndex = selectedCheckpoints.findIndex((cp) => cp.id === checkpoint.id)
								return (
									<TouchableOpacity
										key={checkpoint.id}
										onPress={() =>
											isSelected && selectedIndex !== -1
												? handleRemoveCheckpoint(checkpoint.id, selectedIndex)
												: handleAddCheckpoint(checkpoint)
										}
										className={`flex-row items-center p-3 mb-2 rounded-lg border ${
											isSelected
												? 'bg-green-50 dark:bg-green-900/20 border-green-500'
												: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
										}`}
									>
										<View
											className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
												isSelected ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
											}`}
										>
											{isSelected && <Ionicons name="checkmark" size={16} color="white" />}
										</View>
										<View className="flex-1">
											<Text
												className={`text-sm font-medium ${
													isSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'
												}`}
											>
												{checkpoint.name}
											</Text>
											<Text className="text-xs text-gray-600 dark:text-gray-400">
												{checkpoint.district_name}, {checkpoint.province_name}
											</Text>
										</View>
										{isSelected && (
											<View className="ml-2">
												<Text className="text-xs text-green-600 dark:text-green-400 font-semibold">
													#{selectedCheckpoints.findIndex((cp) => cp.id === checkpoint.id) + 1}
												</Text>
											</View>
										)}
									</TouchableOpacity>
								)
							})
						)}
					</View>
				</BottomSheetScrollView>

				{/* Fixed Save Button at Bottom */}
				<View
					style={{
						paddingHorizontal: 16,
						paddingTop: 12,
						paddingBottom: 24,
						borderTopWidth: 1,
						borderTopColor: isDarkMode ? '#374151' : '#e5e7eb',
						backgroundColor: isDarkMode ? colors.gray800 : colors.white,
					}}
				>
					<TouchableOpacity
						onPress={handleSave}
						disabled={isSaving}
						className={`flex-row items-center justify-center px-4 py-3 rounded-lg ${
							isSaving ? 'bg-gray-400' : 'bg-[#008000]'
						}`}
					>
						{isSaving ? (
							<ActivityIndicator size="small" color="white" />
						) : (
							<>
								<Ionicons name="checkmark-circle" size={20} color="white" />
								<Text className="ml-2 text-white font-semibold">Gravar Sequência</Text>
							</>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</BottomSheetModal>
	)
}
