import React from 'react'
import { Stack } from 'expo-router'
import { useStyles } from 'src/hooks/useStyles'
import { StatusBar } from 'expo-status-bar'

export default function ActorsLayout() {
	const { headerStyle, headerTitleStyle } = useStyles()
	return (
		<>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			>
				<Stack.Screen name="index" />
				<Stack.Screen name="registration" />
				<Stack.Screen
					name="farmers"
					options={{
						headerTitle: 'Produtores',
						headerTitleAlign: 'center',
						headerTitleStyle: headerTitleStyle,
						headerStyle: headerStyle,
					}}
				/>
				<Stack.Screen
					name="traders"
					options={{
						headerTitle: 'Comerciantes',
						headerTitleAlign: 'center',
						headerTitleStyle: headerTitleStyle,
						headerStyle: headerStyle,
					}}
				/>
			</Stack>
			<StatusBar style="auto" />
		</>
	)
}
