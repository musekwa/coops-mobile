import { Stack } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'

export default function CheckpointsLayout() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	return (
		<>
			<Stack
				screenOptions={{
					headerShown: true,
					// headerTitle: 'Postos de fiscalização',
					headerTitleAlign: 'center',
					headerStyle: {
						backgroundColor: isDarkMode ? colors.lightblack : colors.white,
						elevation: 0,
						shadowOpacity: 0,
						borderBottomWidth: 0,
					},
					headerTitleStyle: {
						color: isDarkMode ? colors.white : colors.black,
					},
					headerShadowVisible: false,
				}}
			>
				<Stack.Screen name="index" options={{ headerShown: true }} />
				<Stack.Screen name="registration" options={{ headerShown: true }} />
				<Stack.Screen name="[checkpoint_id]" options={{ headerShown: true }} />
			</Stack>
		</>
	)
}
