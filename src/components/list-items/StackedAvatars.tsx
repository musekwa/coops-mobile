import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { colors } from 'src/constants'

type StackedAvatarProps = {
	avatars: string[]
	handleSnapPress: (index: number) => void
	hint: string
	description: string
}

export default function StackedAvatar({ avatars, handleSnapPress, description, hint }: StackedAvatarProps) {
	const maxAvatars = 8 // Maximum number of avatars to display
	const avatarSize = 24 // Base size for the largest avatar
	const { colorScheme } = useColorScheme()
	const isDarkMode = colorScheme === 'dark'

	return (
		<TouchableOpacity
			activeOpacity={0.5}
			onPress={() => handleSnapPress(3)}
			className="relative items-center border border-slate-300 dark:border-white rounded-xl p-1 bg-gray-50 dark:bg-black"
		>
			<View className="flex flex-row items-center">
				{/* {avatars.length > maxAvatars && (
				<Ionicons name="add-circle-outline" size={45} color={isDarkMode ? colors.white : colors.black} />
			)} */}
				{avatars.slice(0, maxAvatars).map((avatar, index) => (
					<View
						className="relative"
						key={index}
						style={[
							{
								left: index * -15, // Adjust this value to control the overlap
								zIndex: maxAvatars - index, // Ensures the first avatar is on top
							},
						]}
					>
						<Image
							source={{ uri: avatar }}
							style={{
								width: avatarSize - index * 5, // Decrease size for each subsequent avatar
								height: avatarSize - index * 5, // Decrease size for each subsequent avatar
								borderRadius: (avatarSize - index * 5) / 2, // Keep it circular
								// width: avatarSize,
								// height: avatarSize,
								// borderRadius: avatarSize / 2,
							}}
						/>
					</View>
				))}
			</View>
				<View className="absolute top-0 right-0">
					<Ionicons name="add-circle-outline" size={20} color={isDarkMode ? colors.white : colors.black} />
				</View>
			<Text 
				ellipsizeMode="tail"
				numberOfLines={1}
			className="text-black dark:text-white text-center text-xs">{description}</Text>
		</TouchableOpacity>
	)
}
