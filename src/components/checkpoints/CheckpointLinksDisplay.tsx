import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { useColorScheme } from 'nativewind'

type CheckpointWithLocation = {
	id: string
	name: string | null
	province_name: string | null
	district_name: string | null
	northern_next_checkpoint_id?: string | null
	southern_next_checkpoint_id?: string | null
	eastern_next_checkpoint_id?: string | null
	western_next_checkpoint_id?: string | null
}

interface CheckpointLinksDisplayProps {
	checkpoint: CheckpointWithLocation
	linkedCheckpoints: {
		north?: CheckpointWithLocation
		south?: CheckpointWithLocation
		east?: CheckpointWithLocation
		west?: CheckpointWithLocation
	}
	onEditLinks: () => void
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

export default function CheckpointLinksDisplay({
	checkpoint,
	linkedCheckpoints,
	onEditLinks,
}: CheckpointLinksDisplayProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	const hasAnyLinks = Object.values(linkedCheckpoints).some((link) => !!link)
	const linkCount = Object.values(linkedCheckpoints).filter((link) => !!link).length

	const renderDirectionLink = (direction: keyof typeof directionConfig) => {
		const config = directionConfig[direction]
		const linkedCheckpoint = linkedCheckpoints[direction]
		const hasLink = !!linkedCheckpoint

		return (
			<View
				key={direction}
				className={`p-3 rounded-lg mb-2 border ${
					hasLink
						? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
						: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
				}`}
			>
				<View className="flex-row items-center">
					<View
						className="w-10 h-10 rounded-full items-center justify-center"
						style={{ backgroundColor: config.color + '20' }}
					>
						<Ionicons name={config.icon as any} size={20} color={config.color} />
					</View>
					<View className="flex-1">
						<Text className="font-medium text-black dark:text-white">{config.label}</Text>
						{hasLink ? (
							<Text className="text-sm text-green-600 dark:text-green-400">{linkedCheckpoint.name}</Text>
						) : (
							<Text className="text-sm text-gray-500 dark:text-gray-400">Sem ligação</Text>
						)}
					</View>
				</View>
			</View>
		)
	}

	return (
		<View className="bg-white dark:bg-gray-800 rounded-lg py-2 shadow-sm">
			<View className="flex-row items-center justify-between mb-3">
				<View className="flex-row items-center">
					<Ionicons name="git-network" size={24} color={colors.primary} />
					<Text className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">Ligações ({linkCount}/4)</Text>
				</View>
				<TouchableOpacity onPress={onEditLinks} className="bg-blue-500 px-3 py-1 rounded-full">
					<Text className="text-white text-xs font-medium">{hasAnyLinks ? 'Editar' : 'Adicionar'}</Text>
				</TouchableOpacity>
			</View>

			{hasAnyLinks ? (
				<View>
					{renderDirectionLink('north')}
					{renderDirectionLink('south')}
					{renderDirectionLink('east')}
					{renderDirectionLink('west')}
				</View>
			) : (
				<View className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 items-center">
					<Ionicons name="git-network-outline" size={32} color={colors.gray600} />
					<Text className="text-gray-500 dark:text-gray-400 text-center mt-2">Nenhuma ligação configurada</Text>
					<Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
						Toque em "Adicionar" para configurar ligações
					</Text>
				</View>
			)}
		</View>
	)
}
