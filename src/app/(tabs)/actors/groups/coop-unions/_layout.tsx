import React from 'react'
import { Stack } from 'expo-router'

export default function CoopUnionsLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown:
					false,
			}}
		>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					title: 'Uniões das Cooperativas',
					headerLargeTitle: true,
					headerTitleAlign: 'center',
					headerShadowVisible: false,
					headerTitleStyle: { fontSize: 14, fontWeight: 'bold' },
				}}
			/>
		</Stack>
	)
}
