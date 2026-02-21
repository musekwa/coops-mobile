import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, Dimensions, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface CustomToastProps {
	visible: boolean
	message: string
	type?: ToastType
	duration?: number
	onHide?: () => void
	onPress?: () => void
}

const toastConfig = {
	success: {
		icon: 'checkmark-circle' as const,
		backgroundColor: '#dcfce7',
		iconColor: '#16a34a',
		textColor: '#166534',
		borderColor: '#bbf7d0',
	},
	error: {
		icon: 'close-circle' as const,
		backgroundColor: '#fef2f2',
		iconColor: '#dc2626',
		textColor: '#991b1b',
		borderColor: '#fecaca',
	},
	info: {
		icon: 'information-circle' as const,
		backgroundColor: '#eff6ff',
		iconColor: '#2563eb',
		textColor: '#1e40af',
		borderColor: '#dbeafe',
	},
	warning: {
		icon: 'warning' as const,
		backgroundColor: '#fffbeb',
		iconColor: '#d97706',
		textColor: '#92400e',
		borderColor: '#fed7aa',
	},
}

export default function CustomToast({
	visible,
	message,
	type = 'info',
	type: toastType = 'info',
	duration = 3000,
	onHide,
	onPress,
}: CustomToastProps) {
	const insets = useSafeAreaInsets()
	const translateY = useRef(new Animated.Value(100)).current
	const opacity = useRef(new Animated.Value(0)).current
	const scale = useRef(new Animated.Value(0.8)).current

	useEffect(() => {
		if (visible) {
			// Show animation
			Animated.parallel([
				Animated.timing(translateY, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.spring(scale, {
					toValue: 1,
					tension: 100,
					friction: 8,
					useNativeDriver: true,
				}),
			]).start()

			// Auto hide after duration
			const timer = setTimeout(() => {
				hideToast()
			}, duration)

			return () => clearTimeout(timer)
		}
	}, [visible])

	const hideToast = () => {
		Animated.parallel([
			Animated.timing(translateY, {
				toValue: 100,
				duration: 250,
				useNativeDriver: true,
			}),
			Animated.timing(opacity, {
				toValue: 0,
				duration: 250,
				useNativeDriver: true,
			}),
			Animated.timing(scale, {
				toValue: 0.8,
				duration: 250,
				useNativeDriver: true,
			}),
		]).start(() => {
			onHide?.()
		})
	}

	if (!visible) return null

	const config = toastConfig[toastType]

	return (
		<>
			<Animated.View
				style={{
					position: 'absolute',
					bottom: insets.bottom + 20,
					left: 20,
					right: 20,
					zIndex: 9999,
					opacity,
					transform: [{ translateY }, { scale }],
				}}
			>
			<TouchableOpacity
				onPress={onPress}
				activeOpacity={0.9}
				style={{
					backgroundColor: config.backgroundColor,
					borderRadius: 16,
					paddingHorizontal: 20,
					paddingVertical: 16,
					borderWidth: 1,
					borderColor: config.borderColor,
					shadowColor: '#000',
					shadowOffset: {
						width: 0,
						height: 4,
					},
					shadowOpacity: 0.15,
					shadowRadius: 12,
					elevation: 8,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{/* Icon */}
					<View
						style={{
							width: 24,
							height: 24,
							borderRadius: 12,
							backgroundColor: 'rgba(255, 255, 255, 0.2)',
							alignItems: 'center',
							justifyContent: 'center',
							marginRight: 12,
						}}
					>
						<Ionicons name={config.icon} size={16} color={config.iconColor} />
					</View>

					{/* Message */}
					<Text
						style={{
							flex: 1,
							color: config.textColor,
							fontSize: 16,
							fontWeight: '600',
							lineHeight: 22,
						}}
						numberOfLines={3}
					>
						{message}
					</Text>

					{/* Close button */}
					<TouchableOpacity
						onPress={hideToast}
						style={{
							width: 24,
							height: 24,
							borderRadius: 12,
							backgroundColor: 'rgba(255, 255, 255, 0.2)',
							alignItems: 'center',
							justifyContent: 'center',
							marginLeft: 12,
						}}
					>
						<Ionicons name="close" size={16} color={config.iconColor} />
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		</Animated.View>
		</>
	)
}
