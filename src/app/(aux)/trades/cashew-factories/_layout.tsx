import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'

export default function CashewFactoriesLayout() {
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

			<Stack.Screen name="registration" options={{ headerShown: false }} />
			{/* <Stack.Screen name="[factoryId]" options={{ headerShown: true }} /> */}
		</Stack>
	)
}
