import React from 'react'
import { Stack } from 'expo-router'

export default function CooperativesLayout() {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					title: 'Cooperativas',
					headerLargeTitle: true,
					headerTitleAlign: 'center',
					headerShadowVisible: false,
					headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
				}}
			/>
		

		</Stack>
	)
}
