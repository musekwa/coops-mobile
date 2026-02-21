import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import BackButton from 'src/components/buttons/BackButton'

export default function OrganizationsLayout() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	return (
		<Stack
			screenOptions={{
				headerTitleAlign: 'center',
				headerTintColor: isDarkMode ? colors.white : colors.black,
				headerStyle: {
					backgroundColor: isDarkMode ? colors.lightblack : colors.white,
				},
				headerTitleStyle: {
					fontSize: 14,
				},
				headerShadowVisible: false,
			}}
		>
			<Stack.Screen name="[organizationId]" options={{ headerShown: true }} />
			<Stack.Screen name="transactions" options={{ headerShown: true, }} />
		</Stack>
	)
}
