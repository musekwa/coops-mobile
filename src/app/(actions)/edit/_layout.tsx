import { Stack } from 'expo-router'
import { useStyles } from 'src/hooks/useStyles'

export default function EditLayout() {
	const { headerStyle, headerTitleStyle } = useStyles()
	return (
		<Stack>
            <Stack.Screen name='index' options={{
                headerShown: true,
				headerBackVisible: true,
				headerShadowVisible: false,
				headerTitle: "Actualização",
				headerTitleAlign: "center",
				headerTitleStyle: headerTitleStyle,
				headerStyle: headerStyle,
            }} />
		</Stack>
	)
}
