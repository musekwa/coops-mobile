import React from 'react'
import { Stack } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import BackButton from 'src/components/buttons/BackButton'

export default function OrgMembershipLayout() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen
				name="add-member"
				options={{
					headerTitleAlign: 'center',
					headerBackTitleVisible: false,
					presentation: 'modal',
					headerShown: true,
					headerShadowVisible: false,
					headerTitle: 'Adicionar Membro',
					headerLargeTitleShadowVisible: false,
					headerTitleStyle: {
						color: isDarkMode ? colors.white : colors.black,
						fontSize: 14,
					},
					headerStyle: {
						backgroundColor: isDarkMode ? colors.black : colors.white,
						elevation: 0,
						shadowOpacity: 0,
						borderBottomWidth: 0,
					},
					headerLeft: () => <BackButton route={'/(aux)/actors/organization/members-list'} />,
				}}
			/>
		</Stack>
	)
}
