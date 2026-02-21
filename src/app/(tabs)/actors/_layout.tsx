import React from 'react'
import { Stack } from 'expo-router'
import { useStyles } from 'src/hooks/useStyles'
import { StatusBar } from 'expo-status-bar'

export default function ActorsLayout() {
	const { headerStyle, headerTitleStyle } = useStyles()

	const stackHeaderTitleStyle = {
		color: headerTitleStyle.color,
		fontSize: headerTitleStyle.fontSize,
		fontWeight: 'bold' as const,
	}

	return (
		<>
			<Stack>
				<Stack.Screen name="index" 
				options={{
				headerShown: false,
				headerBackVisible: false
				}}
				/>
				<Stack.Screen name="registration" options={{
					headerShown: false,
					headerBackVisible: false
				}} />
				<Stack.Screen
					name="farmers"
					options={{
						headerShown: true,
					headerShadowVisible: false,
						headerTitle: 'Produtores',
						headerTitleAlign: 'center',
						headerTitleStyle: stackHeaderTitleStyle,
						headerStyle: headerStyle,
					}}
				/>
				<Stack.Screen
					name="cooperatives"
					options={{
						headerShown: true,
						headerShadowVisible: false,
						headerTitle: 'Cooperativas',
						headerTitleAlign: 'center',
						headerTitleStyle: stackHeaderTitleStyle,
						headerStyle: headerStyle,
					}}
				/>
				<Stack.Screen
					name="coop-unions"
					options={{
						headerShown: true,
						headerShadowVisible: false,
						headerTitle: 'Uniões das Cooperativas',
						headerTitleAlign: 'center',
						headerTitleStyle: stackHeaderTitleStyle,
						headerStyle: headerStyle,
					}}
				/>
				<Stack.Screen
					name="associations"
					options={{
						headerShown: true,
						headerShadowVisible: false,
						headerTitle: 'Associações',
						headerTitleAlign: 'center',
						headerTitleStyle: stackHeaderTitleStyle,
						headerStyle: headerStyle,
					}}
				/>
			</Stack>
			<StatusBar style="auto" />
		</>
	)
}
