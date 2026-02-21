import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	withSequence,
	Easing,
} from 'react-native-reanimated'
import CustomSafeAreaView from '../layouts/safe-area-view'

export default function PowerSyncConnecting() {
	const rotation = useSharedValue(0)
	const scale = useSharedValue(1)
	const opacity = useSharedValue(0.6)

	React.useEffect(() => {
		// Rotating animation for the connection icon
		rotation.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1, false)

		// Pulsing animation for the main container
		scale.value = withRepeat(
			withSequence(
				withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
				withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
			),
			-1,
			false,
		)

		// Fading animation for the status text
		opacity.value = withRepeat(
			withSequence(
				withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
				withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
			),
			-1,
			false,
		)
	}, [])

	const rotatingIconStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotation.value}deg` }],
	}))

	const pulsingContainerStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}))

	const fadingTextStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}))

	return (
		<CustomSafeAreaView>
			<View className="flex-1 items-center justify-center px-6">
				{/* Main container with pulsing animation */}
				<Animated.View style={pulsingContainerStyle} className="items-center">
					{/* Connection icon with rotation animation */}
					<Animated.View
						style={rotatingIconStyle}
						className="w-24 h-24 rounded-full bg-[#008000]/10 dark:bg-[#008000]/30 items-center justify-center mb-8"
					>
						<Ionicons name="sync" size={48} color={colors.primary} />
					</Animated.View>

					{/* Main title */}
					<Text className="text-xl font-bold text-[#008000] dark:text-white text-center mb-4">Conectando ...</Text>

					{/* Status description */}
					<Animated.Text
						style={fadingTextStyle}
						className="text-[12px] italic text-gray-500 dark:text-gray-400 text-center mb-8 leading-3"
					>
						Estamos a estabelecer a ligação com o servidor para sincronizar os seus dados.
					</Animated.Text>

					{/* Connection status indicator */}
					<View className="flex-row items-center bg-[#008000]/20 px-4 py-3 rounded-lg">
						<View className="w-3 h-3 rounded-full bg-[#008000] mr-3 animate-pulse" />
						<Text className="text-sm font-medium text-[#008000] dark:text-[#008000]">A estabelecer ligação...</Text>
					</View>
				</Animated.View>

				{/* Bottom info */}
				<View className="absolute bottom-20 items-center">
					<Text className="text-[12px] text-gray-500 dark:text-gray-400 italic text-center mb-2">
						Certifique-se de que tem uma ligação à internet estável
					</Text>
					<View className="flex-row items-center">
						<Ionicons name="wifi-outline" size={16} color={colors.primary} className="mr-2" />
						<Text className="text-[12px] text-gray-500 dark:text-gray-400 italic">Verificando conectividade...</Text>
					</View>
				</View>
			</View>
		</CustomSafeAreaView>
	)
}
