
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import {Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
// import { Check} from 'src/models/embeddable'
import { colors } from 'src/constants'

import { cn } from 'src/utils/tailwind'
import CheckpointInspectorList from './check-point-inspector-list'

interface CheckpointInfoProps {
	checkpointName: string
	district: string
	handleCheckpointPress: (district: string, checkpointName: string) => void
	checked: any | null
}

export function CheckpointInfo({ checkpointName, district, handleCheckpointPress, checked }: CheckpointInfoProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	return (
		<TouchableOpacity onPress={() => handleCheckpointPress(district, checkpointName)} className="py-3">
			<View className="flex flex-row space-x-2 items-start justify-between">
				<View
					className={cn('flex items-center', {
						'bg-[#008000] rounded-full p-1': checked && checked.point === checkpointName,
					})}
				>
					<Ionicons   
						name="location-outline"
						size={15}
						color={
							checked && checked.point === checkpointName ? colors.white : isDarkMode ? colors.white : colors.black
						}
					/>
				</View>
				<View className="flex-1 items-start">
					<Text className="text-sm text-gray-800 dark:text-gray-400 text-[12px] font-semibold">
						Posto de {checkpointName}
					</Text>
					<View className="flex flex-wrap">
						<CheckpointInspectorList checked={checked ?? null} district={district} checkpointName={checkpointName} handleCheckpointPress={handleCheckpointPress} />
					</View>
				</View>
				<View className="">
					{checked && checked.point === checkpointName ? (
						<Ionicons name="checkmark-done" size={15} color={colors.primary} />
					) : (
						<Ionicons name="radio-button-off-outline" size={15} color={isDarkMode ? colors.white : colors.black} />
					)}
				</View>
			</View>
		</TouchableOpacity>
	)
}

