import { View, Text } from 'react-native'
import React from 'react'

// Header component for administrative post sections
type AdminPostHeaderProps = {
	name: string
}

export default function ReportAdminPostHeader({ name }: AdminPostHeaderProps) {
	return <Text className="text-md font-semibold text-[#008000]">{name}</Text>
}
