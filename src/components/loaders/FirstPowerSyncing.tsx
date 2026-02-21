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
	withDelay,
	Easing,
} from 'react-native-reanimated'

export default function FirstPowerSyncing() {
	const progressBarWidth = useSharedValue(0)
	const syncIconScale = useSharedValue(1)
	const textOpacity = useSharedValue(0.7)
	const dotsOpacity = useSharedValue(0)

	React.useEffect(() => {
		// Progress bar animation
		progressBarWidth.value = withTiming(100, { duration: 3000, easing: Easing.inOut(Easing.ease) })

		// Sync icon pulsing animation
		syncIconScale.value = withRepeat(
			withSequence(
				withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
				withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
			),
			-1,
			false,
		)

		// Text fading animation
		textOpacity.value = withRepeat(
			withSequence(
				withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
				withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
			),
			-1,
			false,
		)

		// Animated dots
		dotsOpacity.value = withRepeat(
			withSequence(
				withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
				withDelay(500, withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })),
			),
			-1,
			false,
		)
	}, [])

	const progressBarStyle = useAnimatedStyle(() => ({
		width: `${progressBarWidth.value}%`,
	}))

	const syncIconStyle = useAnimatedStyle(() => ({
		transform: [{ scale: syncIconScale.value }],
	}))

	const textStyle = useAnimatedStyle(() => ({
		opacity: textOpacity.value,
	}))

	const dotsStyle = useAnimatedStyle(() => ({
		opacity: dotsOpacity.value,
	}))

	return (
		<View style={{ flex: 1 }}>
			<View className="flex-1 bg-white dark:bg-gray-900">
				<View className="flex-1 items-center justify-center px-6">
					{/* Main sync icon */}
					<Animated.ScrollView
						style={syncIconStyle}
						className="w-28 h-28 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-8"
					>
						<Ionicons name="cloud-download" size={56} color="#10b981" />
					</Animated.ScrollView>

					{/* Main title */}
					<Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
						Primeira Sincronização
					</Text>

					{/* Status description */}
					<Text
						style={textStyle}
						className="text-base text-gray-600 dark:text-gray-400 text-center mb-8 leading-6"
					>
						Estamos a descarregar e sincronizar todos os dados necessários para a primeira utilização.
					</Text>

					{/* Progress section */}
					<View className="w-full max-w-sm mb-8">
						{/* Progress bar */}
						<View className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
							<Animated.View
								style={progressBarStyle}
								className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
							/>
						</View>

						{/* Progress text */}
						<View className="flex-row justify-between items-center">
							<Text className="text-sm text-gray-600 dark:text-gray-400">Sincronizando dados</Text>
							<Animated.Text style={dotsStyle} className="text-sm text-gray-600 dark:text-gray-400">
								...
							</Animated.Text>
						</View>
					</View>

					{/* Sync status cards */}
					<View className="w-full max-w-sm space-y-3 mb-8">
						{/* Database sync status */}
						<View className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-800">
							<View className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
							<Text className="text-sm font-medium text-blue-700 dark:text-blue-300">Base de dados local</Text>
						</View>

						{/* Server sync status */}
						<View className="flex-row items-center bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
							<View className="w-3 h-3 rounded-full bg-yellow-500 mr-3" />
							<Text className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
								Sincronizando com servidor
							</Text>
						</View>
					</View>

					{/* Bottom info */}
					<View className="absolute bottom-20 items-center">
						<Text className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
							Esta operação pode demorar alguns minutos dependendo da quantidade de dados
						</Text>
						<View className="flex-row items-center">
							<Ionicons name="information-circle-outline" size={16} color={colors.primary} className="mr-2" />
							<Text className="text-xs text-gray-500 dark:text-gray-400">
								Não feche a aplicação durante este processo
							</Text>
						</View>
					</View>
				</View>
			</View>
		</View>
	)
}
