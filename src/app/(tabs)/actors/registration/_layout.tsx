import React from 'react'
import { Stack } from 'expo-router'

export default function RegistrationLayout() {
	return (
		<Stack>
			<Stack.Screen name="farmer-registration" options={{ headerShown: true }} />
            <Stack.Screen name="trader-registration" options={{ headerShown: true }} />
            <Stack.Screen name="org-registration" options={{ headerShown: true }} />
		</Stack>
	)
}
