import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { CheckpointPathWithDetails } from 'src/hooks/useCheckpointPaths'
import { TransitType } from 'src/constants/tracking'

interface CheckpointPathsDisplayProps {
	paths: CheckpointPathWithDetails[]
	isLoading: boolean
	error: string | null
	isError: boolean
	onPathSelect?: (path: CheckpointPathWithDetails, index: number) => void
	selectedPathIndex?: number
}

export default function CheckpointPathsDisplay({
	paths,
	isLoading,
	error,
	isError,
	onPathSelect,
	selectedPathIndex = 0,
}: CheckpointPathsDisplayProps) {
	const [expandedPathIndex, setExpandedPathIndex] = useState<number | null>(null)

	if (isLoading) {
		return (
			<View className="p-4">
				<Text className="text-gray-600 dark:text-gray-400 text-center">Carregando rotas de inspecção...</Text>
			</View>
		)
	}

	if (isError || error) {
		return (
			<View className="p-4">
				<Text className="text-red-600 dark:text-red-400 text-center">Erro ao carregar rotas: {error}</Text>
			</View>
		)
	}

	if (!paths || paths.length === 0) {
		return (
			<View className="p-4">
				<Text className="text-gray-600 dark:text-gray-400 text-center">Nenhuma rota de inspecção encontrada</Text>
			</View>
		)
	}

	const getCheckpointTypeColor = (checkpointType: string) => {
		switch (checkpointType) {
			case TransitType.INTERNATIONAL:
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
			case TransitType.INTERPROVINCIAL:
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
			case TransitType.INTERDISTRITAL:
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
			case TransitType.INTRADISTRICTAL:
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
		}
	}

	const getCheckpointTypeLabel = (checkpointType: string) => {
		switch (checkpointType) {
			case TransitType.INTERNATIONAL:
				return 'Internacional'
			case TransitType.INTERPROVINCIAL:
				return 'Interprovincial'
			case TransitType.INTERDISTRITAL:
				return 'Interdistrital'
			case TransitType.INTRADISTRICTAL:
				return 'Intradistrital'
			default:
				return checkpointType
		}
	}

	return (
		<View className="p-4">
			<Text className="text-lg font-semibold text-black dark:text-white mb-4">Rotas de Inspecção ({paths.length})</Text>

			<ScrollView className="max-h-96">
				{paths.map((path, pathIndex) => (
					<View key={pathIndex} className="mb-4">
						<TouchableOpacity
							onPress={() => {
								setExpandedPathIndex(expandedPathIndex === pathIndex ? null : pathIndex)
								onPathSelect?.(path, pathIndex)
							}}
							className={`p-3 rounded-lg border ${
								selectedPathIndex === pathIndex
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
							}`}
						>
							<View className="flex-row justify-between items-center">
								<Text className="text-sm font-medium text-black dark:text-white">Rota {pathIndex + 1}</Text>
								<Text className="text-xs text-gray-500 dark:text-gray-400">{path.path.length} pontos</Text>
							</View>

							{/* Path overview */}
							<View className="mt-2">
								<Text className="text-xs text-gray-600 dark:text-gray-400">
									{path.path[0]} → {path.path[path.path.length - 1]}
								</Text>
							</View>

							{/* Expandable details */}
							{expandedPathIndex === pathIndex && (
								<View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
									<Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Detalhes da Rota:</Text>

									{path.path.map((location, locationIndex) => (
										<View key={locationIndex} className="flex-row items-center mb-2">
											{/* Path connector */}
											{locationIndex > 0 && <View className="w-4 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2" />}

											{/* Location */}
											<View className="flex-1">
												<Text className="text-sm text-black dark:text-white">{location}</Text>

												{/* Checkpoint details if available */}
												{path.checkpointDetails && path.checkpointDetails[locationIndex - 1] && (
													<View className="mt-1">
														<View className="flex-row items-center space-x-2">
															<Text className="text-xs text-gray-500 dark:text-gray-400">
																{path.checkpointDetails[locationIndex - 1].name}
															</Text>
															<View
																className={`px-2 py-1 rounded-full ${getCheckpointTypeColor(path.checkpointDetails[locationIndex - 1].checkpointType)}`}
															>
																<Text className="text-xs font-medium">
																	{getCheckpointTypeLabel(path.checkpointDetails[locationIndex - 1].checkpointType)}
																</Text>
															</View>
														</View>
														<Text className="text-xs text-gray-400 dark:text-gray-500">
															{path.checkpointDetails[locationIndex - 1].provinceName}
														</Text>
													</View>
												)}
											</View>
										</View>
									))}

									{/* Path summary */}
									<View className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
										<Text className="text-xs text-gray-600 dark:text-gray-400">
											Total de checkpoints: {path.checkpointDetails?.length || 0}
										</Text>
										{path.checkpointDetails && path.checkpointDetails.length > 0 && (
											<Text className="text-xs text-gray-600 dark:text-gray-400">
												Tipos:{' '}
												{Array.from(
													new Set(path.checkpointDetails.map((cp) => getCheckpointTypeLabel(cp.checkpointType))),
												).join(', ')}
											</Text>
										)}
									</View>
								</View>
							)}
						</TouchableOpacity>
					</View>
				))}
			</ScrollView>
		</View>
	)
}
