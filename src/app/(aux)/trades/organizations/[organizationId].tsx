
import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'

export default function OrganizationScreen() {
	const { organizationId } = useLocalSearchParams()
	console.log(organizationId)
  return (
		<View>
			<Text>Organization Screen</Text>
		</View>
	)
}