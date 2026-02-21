import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { InformalTraderLicenseType } from 'src/types'

interface Section {
	owner: {
		fullName: string
		phone: string | number
		licenseType: string
	}
}

interface SectionedListHeaderProps {
	section: Section
	expandedSections: Set<string>
	toggleSection: (name: string) => void
}

export default function SectionedListHeader({ section, expandedSections, toggleSection }: SectionedListHeaderProps) {
	const isExpanded = expandedSections.has(section.owner.fullName + section.owner.phone)
	const licenseType =
		section.owner.licenseType === InformalTraderLicenseType.CERTIFICATE
			? 'Certificado de Registo'
			: section.owner.licenseType === InformalTraderLicenseType.PRELIMINARY_COMMUNICATION
				? 'Mera Comunicação Prévia'
				: 'Nenhum Documento'
	return (
		<TouchableOpacity activeOpacity={0.8} onPress={() => toggleSection(section.owner.fullName + section.owner.phone)}>
			<View
				className={`relative bg-gray-50 dark:bg-gray-900 p-2 rounded-md flex flex-row items-center space-x-2 border border-slate-300 dark:border-gray-700 ${isExpanded ? 'bg-[#008000]' : ''}`}
			>
				<View className="flex flex-row items-center">
					<Image source={{ uri: avatarPlaceholderUri }} style={{ width: 45, height: 45, borderRadius: 30 }} />
				</View>
				<View className="flex flex-col">
					<Text className={`text-[14px] font-bold text-black dark:text-white ${isExpanded ? 'text-white' : ''}`}>
						{section.owner.fullName}
					</Text>
					<Text
						className={`text-[12px] italic font-normal text-black dark:text-white  ${isExpanded ? 'text-white' : ''}`}
					>
						(Com {licenseType})
					</Text>

					<View className="flex flex-row items-center space-x-1">
						<Ionicons name="call-outline" size={12} color={isExpanded ? colors.white : colors.primary} />
						<Text className={`text-[12px] text-gray-600 dark:text-gray-400 ${isExpanded ? 'text-white' : ''}`}>
							{section.owner.phone}
						</Text>
					</View>
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
