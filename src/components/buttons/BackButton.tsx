import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Href, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'

type BackButtonProps = {
	route?: Href
	callback?: () => void
}

export default function BackButton({ route, callback }: BackButtonProps) {
	const router = useRouter()
	const { colorScheme } = useColorScheme()
	return (
		<TouchableOpacity
			activeOpacity={0.8}
			onPress={() => {
				if (callback) {
					callback()
				}
				(route ? router.navigate(route) : router.back())
			}}
			style={{ marginRight: 10 }}
		>
			<Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? colors.white : colors.black} />
		</TouchableOpacity>
	)
}
