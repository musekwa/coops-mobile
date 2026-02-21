import React from 'react'
import { Stack } from 'expo-router'
import { commercializationCampainsdateRange } from 'src/helpers/dates'
import { useStyles } from 'src/hooks/useStyles'

export default function TradersLayout() {
	const { headerStyle, headerTitleStyle } = useStyles()
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					headerShown: false,
					headerTitle: `Campanha ${commercializationCampainsdateRange}`,
					headerTitleAlign: 'center',
					headerLargeTitle: true,
					headerShadowVisible: false,
					headerStyle: headerStyle,
					headerTitleStyle: headerTitleStyle,
				}}
			/>
			<Stack.Screen
				name="primaries"
				options={{
					headerTitle: 'Comerciantes Primários',
					headerTitleAlign: 'center',
					headerLargeTitle: true,
					headerShadowVisible: false,
					headerStyle: headerStyle,
					headerTitleStyle: headerTitleStyle,
				}}
			/>
			<Stack.Screen name="processors" />
			<Stack.Screen name="exporters" />
		</Stack>
	)
}
