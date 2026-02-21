import { Stack } from 'expo-router'
import { useStyles } from 'src/hooks/useStyles'

export default function AddLayout() {
	const { headerStyle, headerTitleStyle } = useStyles()
	return (
		<Stack>
            <Stack.Screen name='index' options={{
                headerShown: true,
				headerBackVisible: true,
				headerShadowVisible: false,
				headerTitle: "Registo",
				headerTitleAlign: "center",
				headerTitleStyle: headerTitleStyle,
				headerStyle: headerStyle,
            }} />
		</Stack>
	)
}
