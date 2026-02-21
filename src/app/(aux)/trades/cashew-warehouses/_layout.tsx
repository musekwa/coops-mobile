import React from 'react'
import { Stack } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'

export default function CashewWarehousesLayout() {
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
			<Stack.Screen name="[warehouseId]" options={{ headerShown: true }} />
			<Stack.Screen name="transactions" options={{ headerShown: true, }} />
		</Stack>
	)
}
