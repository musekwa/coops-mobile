import { Stack } from 'expo-router'
import { Text } from 'react-native'

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="login" options={{ headerShown: false }} />
			<Stack.Screen
				name="sign-up"
				options={{
					headerShown: true,
					headerTitle: '',
					headerBackVisible: true,
					headerShadowVisible: false,
					headerTransparent: false,
					headerLargeTitle: false,
				}}
			/>
			<Stack.Screen
				name="pending-user-authorization"
				options={{
					headerShown: true,
					headerTitle: '',
					headerBackVisible: false,
					headerShadowVisible: false,
					headerTransparent: false,
					headerLargeTitle: false,
				}}
			/>
			<Stack.Screen name="pending-email-verification" options={{
					headerShown: true,
					headerTitle: '',
					headerBackVisible: true,
					headerShadowVisible: false,
					headerTransparent: false,
					headerLargeTitle: false,
				}} />
			<Stack.Screen name="banned-user" options={{ headerShown: false }} />
			<Stack.Screen
				name="reset-password"
				options={{
					headerShown: true,
					headerTitle: '',
					headerShadowVisible: false,
					headerBackVisible: true,
					headerTransparent: false,
					headerLargeTitle: false,
				}}
			/>
			<Stack.Screen
				name="forgot-password"
				options={{
					headerShown: true,
					headerTitle: '',
					headerTitleAlign: 'center',
					headerBackVisible: true,
					headerShadowVisible: false,
					headerTransparent: false,
					headerLargeTitle: false,
				}}
			/>
			<Stack.Screen
				name="pending-password-reset"
				options={{
					headerShown: true,
					headerShadowVisible: false,
					headerBackVisible: true,
					headerTitle: '',
					headerTitleAlign: 'center',
					headerLargeTitle: false,
				}}
			/>
		</Stack>
	)
}
