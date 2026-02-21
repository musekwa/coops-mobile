import React from 'react'
import { Href, Stack } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import BackButton from 'src/components/buttons/BackButton'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { useStyles } from 'src/hooks/useStyles'

const optionsProps = (isDarkMode: boolean, title: string, headerStyle?: any, headerTitleStyle?: any): NativeStackNavigationOptions => ({
	headerShadowVisible: false,
	headerTitle: title,
	headerTitleAlign: 'center',
	headerTitleStyle: headerTitleStyle,
	headerStyle: headerStyle,
})
export default function TransitLayout() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const { headerStyle, headerTitleStyle } = useStyles()

	return (
		<Stack>
			<Stack.Screen
				name="path-management"
				options={{
					presentation: 'modal',
					...optionsProps(isDarkMode, 'Gestão de Rota', headerStyle, headerTitleStyle),
				}}
			/>
			<Stack.Screen
				name="registration"
				options={{
					...optionsProps(isDarkMode, 'Registo de Mercadoria', headerStyle, headerTitleStyle),
				}}
			/>
			<Stack.Screen
				name="shipment-inspection"
				options={{
					presentation: 'modal',
					headerLeft: () => <BackButton route={`/(tabs)/trades/shipments`} />,
					...optionsProps(isDarkMode, 'Inspecção de Mercadoria', headerStyle, headerTitleStyle),
				}}
			/>
		</Stack>
	)
}
