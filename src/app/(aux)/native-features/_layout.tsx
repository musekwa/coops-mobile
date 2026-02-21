import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'react-native'
import { useStyles } from 'src/hooks/useStyles'

export default function DeviceFeaturesLayout() {
	const { headerStyle, headerTitleStyle } = useStyles()
	return (
		<>
		<Stack
			>

			<Stack.Screen name="camera" options={{
				headerShown: false,
			}} />
			<Stack.Screen name="device-permissions" options={{
				headerShown: true,
				headerShadowVisible: false,

			}} />
			<Stack.Screen name="media-preview" options={{
				headerShown: false,
			}} />
			</Stack>

			<StatusBar  />
			</>
	)
}