import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'

interface Section {
	owner: {
		name: string
		phone: string | number
		photo: string
	}
}

interface CashewWarehouseSectionedListHeaderProps {
	section: Section
	expandedSections: Set<string>
	toggleSection: (name: string) => void
}

export default function CashewWarehouseSectionedListHeader({
	section,
	expandedSections,
	toggleSection,
}: CashewWarehouseSectionedListHeaderProps) {
	const isExpanded = expandedSections.has(section.owner.name)
	return (
		<TouchableOpacity activeOpacity={0.5} onPress={() => toggleSection(section.owner.name)}>
			<View
				className={`relative bg-gray-50 dark:bg-gray-900 p-2 rounded-md flex flex-row items-center space-x-2 border border-slate-300 dark:border-gray-700 ${isExpanded ? 'bg-[#008000]' : ''}`}
			>
				<View className="flex flex-row items-center">
					<Image
						source={{ uri: section.owner.photo ? section.owner.photo : avatarPlaceholderUri }}
						style={{ width: 45, height: 45, borderRadius: 30 }}
					/>
				</View>
				<View className="flex flex-col">
					<Text className={`text-[14px] font-bold text-black dark:text-white ${isExpanded ? 'text-white' : ''}	`}>
						{section.owner.name}
					</Text>
					<Text className={`text-[12px] text-gray-600 dark:text-gray-400 ${isExpanded ? 'text-white' : ''}`}>
						{section.owner.phone}
					</Text>
				</View>
				<View className="absolute right-2">
					<Ionicons
						name={isExpanded ? 'chevron-up' : 'chevron-down'}
						size={24}
						color={isExpanded ? colors.white : colors.primary}
					/>
				</View>
			</View>
		</TouchableOpacity>
	)
}
