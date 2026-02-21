import React from 'react'
import { View, Text } from 'react-native'
import { Image } from 'expo-image'
import { avatarPlaceholderUri } from 'src/constants/imageURI'

import { cn } from 'src/utils/tailwind'

type CheckpointInspectorProps = {
	checkpointName: string
	district: string
	handleCheckpointPress: (district: string, checkpointName: string) => void
	checked: any | null
}

export default function CheckpointInspectorList({ checked, checkpointName, district }: CheckpointInspectorProps) {
	const checkpoint = {}

	let inspectors: any[] = []

	// give me a set of inspectors removing the duplicates by name
	inspectors = [...new Map(inspectors.map((item: any) => [item.name, item])).values()]

	return (
		<View>
			{inspectors.map((inspector: any, index: any) => (
				<View key={index}>
					<View className="flex flex-row items-center space-x-1 py-1">
						<Image
							source={{ uri: avatarPlaceholderUri }}
							style={{
								width: 15,
								height: 15,
								borderRadius: 100,
							}}
							contentFit="cover"
						/>
						<Text
							className={cn('text-[10px] italic text-gray-600 dark:text-gray-400', {
								'underline text-[#008000]': checked && checked.checkedBy === inspector.name,
							})}
						>
							{inspector.name.split(' ')[0]} ({inspector.phone})
						</Text>
					</View>
				</View>
			))}
		</View>
	)
}
