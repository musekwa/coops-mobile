import React from 'react'
import { Stack } from 'expo-router'

export default function FarmersLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" />
			<Stack.Screen name="service-providers" />
		</Stack>
	)
}
