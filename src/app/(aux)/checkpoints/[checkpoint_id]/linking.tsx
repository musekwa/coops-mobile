import React, { useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { colors } from 'src/constants'
import { useColorScheme } from 'nativewind'
import { useQueryMany, useQueryOneAndWatchChanges } from 'src/hooks/queries'
import { ShipmentCheckpointRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { updateCheckpointLinks } from 'src/library/sqlite/updates'
import { powersync } from 'src/library/powersync/system'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import Spinner from 'src/components/loaders/Spinner'

type CheckpointWithLocation = ShipmentCheckpointRecord & {
	province_name: string | null
	district_name: string | null
	admin_post_name: string | null
	village_name: string | null
}

type Direction = 'north' | 'south' | 'east' | 'west'

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

export default function CheckpointLinkingScreen() {
	const { checkpoint_id } = useLocalSearchParams()
	const navigation = useNavigation()
	const router = useRouter()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedLinks, setSelectedLinks] = useState<{
		northern_next_checkpoint_id?: string
		southern_next_checkpoint_id?: string
		eastern_next_checkpoint_id?: string
		western_next_checkpoint_id?: string
	}>({})

	// Fetch current checkpoint
	const { data: currentCheckpoint } = useQueryOneAndWatchChanges<CheckpointWithLocation>(
		`SELECT 
			sc.*,
			p.name as province_name,
			d.name as district_name,
			ap.name as admin_post_name,
			v.name as village_name
		FROM ${TABLES.CHECKPOINTS} sc
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
		LEFT JOIN ${TABLES.PROVINCES} p ON a.province_id = p.id
		LEFT JOIN ${TABLES.DISTRICTS} d ON a.district_id = d.id
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON a.admin_post_id = ap.id
		LEFT JOIN ${TABLES.VILLAGES} v ON a.village_id = v.id
		WHERE sc.id = ?`,
		[checkpoint_id as string],
	)

	// Initialize selectedLinks with current checkpoint's existing links
	React.useEffect(() => {
		if (currentCheckpoint) {
			setSelectedLinks({
				northern_next_checkpoint_id: currentCheckpoint.northern_next_checkpoint_id || undefined,
				southern_next_checkpoint_id: currentCheckpoint.southern_next_checkpoint_id || undefined,
				eastern_next_checkpoint_id: currentCheckpoint.eastern_next_checkpoint_id || undefined,
				western_next_checkpoint_id: currentCheckpoint.western_next_checkpoint_id || undefined,
			})
		}
	}, [currentCheckpoint])
	const [showErrorAlert, setShowErrorAlert] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	// Fetch all checkpoints for selection
	const { data: allCheckpoints, isLoading: isLoadingCheckpoints } = useQueryMany<CheckpointWithLocation>(
		`SELECT 
			sc.*,
			p.name as province_name,
			d.name as district_name,
			ap.name as admin_post_name,
			v.name as village_name
		FROM ${TABLES.CHECKPOINTS} sc
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
		LEFT JOIN ${TABLES.PROVINCES} p ON a.province_id = p.id
		LEFT JOIN ${TABLES.DISTRICTS} d ON a.district_id = d.id
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON a.admin_post_id = ap.id
		LEFT JOIN ${TABLES.VILLAGES} v ON a.village_id = v.id
		WHERE sc.id != '${checkpoint_id}' ORDER BY sc.name`,
	)

	// Filter checkpoints based on search and exclude already linked ones
	const filteredCheckpoints =
		allCheckpoints?.filter(
			(checkpoint) =>
				checkpoint.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
				// Exclude checkpoints that are already linked in any direction
				checkpoint.id !== selectedLinks.northern_next_checkpoint_id &&
				checkpoint.id !== selectedLinks.southern_next_checkpoint_id &&
				checkpoint.id !== selectedLinks.eastern_next_checkpoint_id &&
				checkpoint.id !== selectedLinks.western_next_checkpoint_id,
		) || []

	const getCurrentLink = (direction: Direction) => {
		const field = directionConfig[direction].field
		return selectedLinks[field]
	}

	const getLinkedCheckpointName = (direction: Direction) => {
		const linkedId = getCurrentLink(direction)
		if (!linkedId) return null
		return allCheckpoints?.find((cp) => cp.id === linkedId)?.name
	}

	const getLinkedCheckpointLocation = (direction: Direction) => {
		const linkedId = getCurrentLink(direction)
		if (!linkedId) return null
		const linkedCheckpoint = allCheckpoints?.find((cp) => cp.id === linkedId)
		if (!linkedCheckpoint) return null
		return `${linkedCheckpoint.district_name || 'N/A'}, ${linkedCheckpoint.province_name || 'N/A'}`
	}

	const handleDirectionSelect = (direction: Direction) => {
		console.log('Direction selected:', direction)
		setSelectedDirection(direction)
		setSearchQuery('')
	}

	const handleCheckpointSelect = async (checkpointId: string) => {
		if (!selectedDirection) return

		const field = directionConfig[selectedDirection].field
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
		setSelectedLinks((prev) => ({
			...prev,
			[field]: undefined,
		}))
	}

	const handleSave = async () => {
		try {
			// Get current checkpoint data to compare with new links
			const currentCheckpointData = currentCheckpoint

			// First, update the current checkpoint's links
			await updateCheckpointLinks(powersync, checkpoint_id as string, selectedLinks)

			// Then, handle bidirectional updates
			const updates = []

			// Handle new links - create reverse links
			if (selectedLinks.northern_next_checkpoint_id) {
				updates.push(
					updateCheckpointLinks(powersync, selectedLinks.northern_next_checkpoint_id, {
						southern_next_checkpoint_id: checkpoint_id as string,
					}),
				)
			}

			if (selectedLinks.southern_next_checkpoint_id) {
				updates.push(
					updateCheckpointLinks(powersync, selectedLinks.southern_next_checkpoint_id, {
						northern_next_checkpoint_id: checkpoint_id as string,
					}),
				)
			}

			if (selectedLinks.eastern_next_checkpoint_id) {
				updates.push(
					updateCheckpointLinks(powersync, selectedLinks.eastern_next_checkpoint_id, {
						western_next_checkpoint_id: checkpoint_id as string,
					}),
				)
			}

			if (selectedLinks.western_next_checkpoint_id) {
				updates.push(
					updateCheckpointLinks(powersync, selectedLinks.western_next_checkpoint_id, {
						eastern_next_checkpoint_id: checkpoint_id as string,
					}),
				)
			}

			// Handle removed links - remove reverse links
			if (currentCheckpointData) {
				if (currentCheckpointData.northern_next_checkpoint_id && !selectedLinks.northern_next_checkpoint_id) {
					updates.push(
						updateCheckpointLinks(powersync, currentCheckpointData.northern_next_checkpoint_id, {
							southern_next_checkpoint_id: undefined,
						}),
					)
				}

				if (currentCheckpointData.southern_next_checkpoint_id && !selectedLinks.southern_next_checkpoint_id) {
					updates.push(
						updateCheckpointLinks(powersync, currentCheckpointData.southern_next_checkpoint_id, {
							northern_next_checkpoint_id: undefined,
						}),
					)
				}

				if (currentCheckpointData.eastern_next_checkpoint_id && !selectedLinks.eastern_next_checkpoint_id) {
					updates.push(
						updateCheckpointLinks(powersync, currentCheckpointData.eastern_next_checkpoint_id, {
							western_next_checkpoint_id: undefined,
						}),
					)
				}

				if (currentCheckpointData.western_next_checkpoint_id && !selectedLinks.western_next_checkpoint_id) {
					updates.push(
						updateCheckpointLinks(powersync, currentCheckpointData.western_next_checkpoint_id, {
							eastern_next_checkpoint_id: undefined,
						}),
					)
				}
			}

			// Wait for all updates to complete
			await Promise.all(updates)

			// Navigate back
			router.back()
		} catch (error) {
			console.error('Error updating checkpoint links:', error)
			setShowErrorAlert(true)
			setErrorMessage('Erro ao atualizar ligações do posto')
		}
	}

	const renderDirectionCard = (direction: Direction) => {
		const config = directionConfig[direction]
		const isSelected = selectedDirection === direction
		const linkedCheckpointName = getLinkedCheckpointName(direction)
		const linkedCheckpointLocation = getLinkedCheckpointLocation(direction)
		const hasLink = !!linkedCheckpointName

		return (
			<TouchableOpacity
				onPress={() => handleDirectionSelect(direction)}
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
								<>
									<Text className="text-sm text-green-600 dark:text-green-400 font-medium">{linkedCheckpointName}</Text>
									<Text className="text-xs text-gray-500 dark:text-gray-400">{linkedCheckpointLocation}</Text>
								</>
							) : (
								<Text className="text-sm text-gray-500 dark:text-gray-400">Selecionar próximo posto</Text>
							)}
						</View>
					</View>
					{hasLink && (
						<TouchableOpacity onPress={() => handleRemoveLink(direction)} className="p-2">
							<Ionicons name="close-circle" size={20} color={colors.red} />
						</TouchableOpacity>
					)}
				</View>
			</TouchableOpacity>
		)
	}

	React.useEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View className="flex flex-col items-center">
					<Text className="text-black dark:text-white text-[14px] font-bold text-center">Ligar Postos</Text>
				</View>
			),
			headerRight: () => (
				<TouchableOpacity onPress={handleSave} className="mr-4">
					<Text className="text-blue-500 font-semibold">Guardar</Text>
				</TouchableOpacity>
			),
		})
	}, [selectedLinks])

	if (!currentCheckpoint) {
		return <Spinner />
	}

	return (
		<View className="flex-1 bg-white dark:bg-gray-900">
			{/* Current Checkpoint Info */}
			<View className="bg-green-500 p-4">
				<Text className="text-white font-bold text-lg text-center">{currentCheckpoint.name}</Text>
				<Text className="text-green-100 text-center mt-1">
					{currentCheckpoint.district_name}, {currentCheckpoint.province_name}
				</Text>
			</View>

			{selectedDirection ? (
				<ScrollView className="flex-1 p-4">
					{/* Directional Links */}
					<Text className="font-bold text-black dark:text-white mb-3">Ligações por Direção</Text>
					{renderDirectionCard('north')}
					{renderDirectionCard('south')}
					{renderDirectionCard('east')}
					{renderDirectionCard('west')}

					{/* Checkpoint Selection */}
					<View className="mt-6">
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
							<View className="justify-center items-center py-8">
								<Text className="text-gray-500 dark:text-gray-400">Carregando postos...</Text>
							</View>
						) : (
							<View>
								{filteredCheckpoints.map((checkpoint) => (
									<TouchableOpacity
										key={checkpoint.id}
										onPress={() => handleCheckpointSelect(checkpoint.id)}
										className="p-4 bg-white dark:bg-gray-800 rounded-lg mb-2 border border-gray-200 dark:border-gray-700"
									>
										<Text className="font-semibold text-black dark:text-white">{checkpoint.name || 'Sem nome'}</Text>
									</TouchableOpacity>
								))}
								{filteredCheckpoints.length === 0 && (
									<View className="justify-center items-center p-4">
										<Text className="text-gray-500 dark:text-gray-400 text-center">
											{allCheckpoints?.length === 0
												? 'Nenhum posto disponível para ligação'
												: searchQuery
													? 'Nenhum posto encontrado com essa pesquisa'
													: 'Todos os postos já estão ligados'}
										</Text>
										<Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
											Postos disponíveis: {filteredCheckpoints.length} de {allCheckpoints?.length || 0}
										</Text>
									</View>
								)}
							</View>
						)}
					</View>
				</ScrollView>
			) : (
				<ScrollView className="flex-1 p-4">
					{/* Directional Links */}
					<Text className="font-bold text-black dark:text-white mb-3">Ligações por Direção</Text>
					{renderDirectionCard('north')}
					{renderDirectionCard('south')}
					{renderDirectionCard('east')}
					{renderDirectionCard('west')}
				</ScrollView>
			)}

			{/* Error Alert */}
			<ErrorAlert
				title="Erro"
				message={errorMessage}
				setMessage={setErrorMessage}
				visible={showErrorAlert}
				setVisible={setShowErrorAlert}
			/>
		</View>
	)
}
