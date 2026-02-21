import React from 'react'
import { Stack } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import { StatusBar } from 'expo-status-bar'

export default function TradesLayout() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	return (
		<>
			<Stack
				screenOptions={{
					headerTitleAlign: 'center',
					headerStyle: {
						backgroundColor: isDarkMode ? colors.lightblack : colors.white,
					},
					headerTintColor: isDarkMode ? colors.white : colors.black,
					headerTitleStyle: {
						fontWeight: 'bold',
						fontSize: 14,
					},
					headerShadowVisible: false,
					animationTypeForReplace: 'push',
				}}
			>
				<Stack.Screen name="index" />
				<Stack.Screen name="shipments" />
				<Stack.Screen name="buying-points" />
				<Stack.Screen name="aggregation-points" />
				<Stack.Screen name="destionation-points" />
				<Stack.Screen name="organization-points" />
			</Stack>
			<StatusBar style="auto" />
		</>
	)
}
