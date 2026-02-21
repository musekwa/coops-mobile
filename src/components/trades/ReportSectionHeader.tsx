import { View, Text } from 'react-native'
import React from 'react'

// Section header component for main category titles
type SectionHeaderProps = {
	title: string
}

export default function ReportSectionHeader({ title }: SectionHeaderProps) {
	return <Text className="text-[16px] font-bold dark:text-white">{title}</Text>
}
