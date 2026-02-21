import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, FlatList, Modal, Alert } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { useColorScheme } from 'nativewind'
import { useQueryMany } from 'src/hooks/queries'
import { ShipmentCheckpointRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'

type CheckpointWithLocation = ShipmentCheckpointRecord & {
	province_name: string | null
	district_name: string | null
	admin_post_name: string | null
	village_name: string | null
	northern_next_checkpoint_id?: string
	southern_next_checkpoint_id?: string
	eastern_next_checkpoint_id?: string
	western_next_checkpoint_id?: string
}

type Direction = 'north' | 'south' | 'east' | 'west'

interface CheckpointLinkingModalProps {
	visible: boolean
	setVisible: (visible: boolean) => void
	currentCheckpoint: CheckpointWithLocation
	onSaveLinks: (links: {
		northern_next_checkpoint_id?: string
		southern_next_checkpoint_id?: string
		eastern_next_checkpoint_id?: string
		western_next_checkpoint_id?: string
	}) => void
}

const directionConfig = {
	north: {
		icon: 'arrow-up',
		label: 'Norte',
		color: '#3B82F6',
		field: 'northern_next_checkpoint_id' as const,
	},
	south: {
		icon: 'arrow-down',
		label: 'Sul',
		color: '#EF4444',
		field: 'southern_next_checkpoint_id' as const,
	},
	east: {
		icon: 'arrow-forward',
		label: 'Este',
		color: '#10B981',
		field: 'eastern_next_checkpoint_id' as const,
	},
	west: {
		icon: 'arrow-back',
		label: 'Oeste',
		color: '#F59E0B',
		field: 'western_next_checkpoint_id' as const,
	},
}

export default function CheckpointLinkingModal({
	visible,
	setVisible,
	currentCheckpoint,
	onSaveLinks,
}: CheckpointLinkingModalProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedLinks, setSelectedLinks] = useState<{
		northern_next_checkpoint_id?: string
		southern_next_checkpoint_id?: string
		eastern_next_checkpoint_id?: string
		western_next_checkpoint_id?: string
	}>({})

	// Fetch all checkpoints for selection - simplified query
	const { data: allCheckpoints, isLoading: isLoadingCheckpoints } = useQueryMany<CheckpointWithLocation>(
		`SELECT * FROM ${TABLES.CHECKPOINTS} WHERE id != '${currentCheckpoint.id}' ORDER BY name`,
	)

	console.log('Modal - Current checkpoint ID:', currentCheckpoint.id)
	console.log('Modal - All checkpoints:', allCheckpoints)
	console.log('Modal - Is loading checkpoints:', isLoadingCheckpoints)

	// Filter checkpoints based on search
	const filteredCheckpoints =
		allCheckpoints?.filter(
			(checkpoint) =>
				checkpoint.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				checkpoint.district_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				checkpoint.province_name?.toLowerCase().includes(searchQuery.toLowerCase()),
		) || []

	// Debug logging
	console.log('All checkpoints:', allCheckpoints?.length)
	console.log('Filtered checkpoints:', filteredCheckpoints.length)
	console.log('Selected direction:', selectedDirection)
	console.log('Modal visible:', visible)

	const getCurrentLink = (direction: Direction) => {
		const field = directionConfig[direction].field
		return selectedLinks[field]
	}

	const getLinkedCheckpointName = (direction: Direction) => {
		const linkedId = getCurrentLink(direction)
		if (!linkedId) return null
		return allCheckpoints?.find((cp) => cp.id === linkedId)?.name
	}

	const handleDirectionSelect = (direction: Direction) => {
		console.log('Direction selected:', direction)
		setSelectedDirection(direction)
		setSearchQuery('')
		console.log('selectedDirection after set:', direction)
	}

	const handleCheckpointSelect = async (checkpointId: string) => {
		if (!selectedDirection) return

		const field = directionConfig[selectedDirection].field
		const oppositeDirection = getOppositeDirection(selectedDirection)
		const oppositeField = directionConfig[oppositeDirection].field

		// Check if the target checkpoint already has a link in the opposite direction
		const targetCheckpoint = allCheckpoints?.find((cp) => cp.id === checkpointId)
		const hasExistingOppositeLink = targetCheckpoint?.[oppositeField]

		// If target checkpoint already has a link in opposite direction, warn user
		if (hasExistingOppositeLink && hasExistingOppositeLink !== currentCheckpoint.id) {
			// For now, we'll replace the existing link
			// In a more sophisticated implementation, you might want to show a confirmation dialog
			console.log(
				`Warning: ${targetCheckpoint?.name} already has a ${oppositeDirection} link to ${hasExistingOppositeLink}`,
			)
		}

		setSelectedLinks((prev) => ({
			...prev,
			[field]: checkpointId,
		}))
		setSelectedDirection(null)
	}

	const getOppositeDirection = (direction: Direction): Direction => {
		switch (direction) {
			case 'north':
				return 'south'
			case 'south':
				return 'north'
			case 'east':
				return 'west'
			case 'west':
				return 'east'
		}
	}

	const handleRemoveLink = (direction: Direction) => {
		const field = directionConfig[direction].field
		const currentLink = selectedLinks[field]

		// Remove the link from current checkpoint
		setSelectedLinks((prev) => ({
			...prev,
			[field]: undefined,
		}))

		// Also remove the reverse link from the target checkpoint
		if (currentLink) {
			const oppositeDirection = getOppositeDirection(direction)
			const oppositeField = directionConfig[oppositeDirection].field

			// We'll handle this in the save function by passing null values
			// for the removed links
		}
	}

	const handleSave = () => {
		// Create bidirectional links
		const bidirectionalLinks = { ...selectedLinks }

		// For each link we're creating, also create the reverse link
		Object.entries(selectedLinks).forEach(([field, targetCheckpointId]) => {
			if (targetCheckpointId) {
				const direction = Object.keys(directionConfig).find(
					(key) => directionConfig[key as Direction].field === field,
				) as Direction
				const oppositeDirection = getOppositeDirection(direction)
				const oppositeField = directionConfig[oppositeDirection].field

				// Add the reverse link to our links object
				// This will be handled by the parent component
				bidirectionalLinks[oppositeField] = targetCheckpointId
			}
		})

		onSaveLinks(bidirectionalLinks)
		setVisible(false)
		setSelectedLinks({})
		setSelectedDirection(null)
	}

	const renderDirectionCard = (direction: Direction) => {
		const config = directionConfig[direction]
		const isSelected = selectedDirection === direction
		const linkedCheckpointName = getLinkedCheckpointName(direction)
		const hasLink = !!linkedCheckpointName

		return (
			<TouchableOpacity
				onPress={() => {
					console.log('TouchableOpacity pressed for direction:', direction)
					handleDirectionSelect(direction)
				}}
				activeOpacity={0.7}
				className={`p-4 rounded-lg mb-3 border-2 ${
					isSelected
						? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
						: hasLink
							? 'border-green-500 bg-green-50 dark:bg-green-900/20'
							: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
				}`}
			>
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center flex-1">
						<View
							className="w-12 h-12 rounded-full items-center justify-center mr-3"
							style={{ backgroundColor: config.color + '20' }}
						>
							<Ionicons name={config.icon as any} size={24} color={config.color} />
						</View>
						<View className="flex-1">
							<Text className="font-semibold text-black dark:text-white">{config.label}</Text>
							{hasLink ? (
								<Text className="text-sm text-green-600 dark:text-green-400">{linkedCheckpointName}</Text>
							) : (
								<Text className="text-sm text-gray-500 dark:text-gray-400">Selecionar próximo posto</Text>
							)}
						</View>
					</View>
					{hasLink && (
						<TouchableOpacity
							onPress={() => {
								handleRemoveLink(direction)
							}}
							className="p-2"
						>
							<Ionicons name="close-circle" size={20} color={colors.red} />
						</TouchableOpacity>
					)}
				</View>
			</TouchableOpacity>
		)
	}

	const renderCheckpointItem = ({ item }: { item: CheckpointWithLocation }) => (
		<TouchableOpacity
			onPress={() => handleCheckpointSelect(item.id)}
			className="p-4 bg-white dark:bg-gray-800 rounded-lg mb-2 border border-gray-200 dark:border-gray-700"
		>
			<Text className="font-semibold text-black dark:text-white">{item.name || 'Sem nome'}</Text>
		</TouchableOpacity>
	)

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<View className="flex-1 bg-white dark:bg-gray-900">
				{/* Header */}
				<View className="bg-green-500 p-4 pt-12">
					<View className="flex-row items-center justify-between">
						<TouchableOpacity onPress={() => setVisible(false)}>
							<Ionicons name="close" size={24} color={colors.white} />
						</TouchableOpacity>
						<Text className="text-white font-bold text-lg">Ligar Postos</Text>
						<TouchableOpacity onPress={handleSave}>
							<Text className="text-white font-semibold">Guardar</Text>
						</TouchableOpacity>
					</View>
					<Text className="text-green-100 text-center mt-2">{currentCheckpoint.name}</Text>
				</View>

				{selectedDirection ? (
					<View className="flex-1 p-4">
						{/* Debug info */}
						<View className="bg-blue-100 dark:bg-blue-900 p-2 mb-2 rounded">
							<Text className="text-blue-800 dark:text-blue-200 text-xs">
								DEBUG: Direction selected: {selectedDirection} | Checkpoints: {allCheckpoints?.length || 0}
							</Text>
						</View>

						{/* Current Checkpoint Info */}
						<View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
							<Text className="font-bold text-black dark:text-white mb-2">Posto Atual</Text>
							<Text className="text-black dark:text-white">{currentCheckpoint.name}</Text>
							<Text className="text-sm text-gray-600 dark:text-gray-400">
								{currentCheckpoint.district_name}, {currentCheckpoint.province_name}
							</Text>
						</View>

						{/* Directional Links */}
						<Text className="font-bold text-black dark:text-white mb-3">Ligações por Direção</Text>
						{renderDirectionCard('north')}
						{renderDirectionCard('south')}
						{renderDirectionCard('east')}
						{renderDirectionCard('west')}

						{/* Checkpoint Selection */}
						<View className="mt-6 flex-1">
							<Text className="font-bold text-black dark:text-white mb-3">
								Selecionar próximo posto para {directionConfig[selectedDirection].label}
							</Text>
							<View className="mb-3">
								<CustomTextInput
									label="Procurar postos"
									placeholder="Procurar postos..."
									value={searchQuery}
									onChangeText={setSearchQuery}
								/>
							</View>

							{isLoadingCheckpoints ? (
								<View className="flex-1 justify-center items-center">
									<Text className="text-gray-500 dark:text-gray-400">Carregando postos...</Text>
								</View>
							) : (
								<FlatList
									data={filteredCheckpoints}
									renderItem={renderCheckpointItem}
									keyExtractor={(item: CheckpointWithLocation) => item.id}
									showsVerticalScrollIndicator={false}
									ListEmptyComponent={() => (
										<View className="flex-1 justify-center items-center p-4">
											<Text className="text-gray-500 dark:text-gray-400 text-center">
												{allCheckpoints?.length === 0
													? 'Nenhum posto disponível para ligação'
													: 'Nenhum posto encontrado com essa pesquisa'}
											</Text>
											<Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
												Total de postos: {allCheckpoints?.length || 0}
											</Text>
										</View>
									)}
								/>
							)}
						</View>
					</View>
				) : (
					<ScrollView className="flex-1 p-4">
						{/* Current Checkpoint Info */}
						<View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
							<Text className="font-bold text-black dark:text-white mb-2">Posto Atual</Text>
							<Text className="text-black dark:text-white">{currentCheckpoint.name}</Text>
							<Text className="text-sm text-gray-600 dark:text-gray-400">
								{currentCheckpoint.district_name}, {currentCheckpoint.province_name}
							</Text>
						</View>

						{/* Directional Links */}
						<Text className="font-bold text-black dark:text-white mb-3">Ligações por Direção</Text>
						{renderDirectionCard('north')}
						{renderDirectionCard('south')}
						{renderDirectionCard('east')}
						{renderDirectionCard('west')}
					</ScrollView>
				)}
			</View>
		</Modal>
	)
}
