import React from 'react'
import { Stack } from 'expo-router'

export default function RegistrationLayout() {
	return (
		<Stack>
			<Stack.Screen name="farmer" options={{ headerShown: true }} />
            <Stack.Screen name="cooperative" options={{ headerShown: true }} />
            <Stack.Screen name="association" options={{ headerShown: true }} />
            <Stack.Screen name="coop-union" options={{ headerShown: true }} />
		</Stack>
	)
}
