import { View, Text } from 'react-native'
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getToastStyles } from 'src/helpers/getToastStyles'
import LottiesView from './LottiesView'

interface ToastProps {
	title: string
	description: string
	type: 'success' | 'info' | 'warning' | 'error'
	duration: number
}

const Toast = forwardRef(({}, ref) => {
	const toastTopAnimation = useSharedValue<number>(-100)
	const [state, setState] = useState({
		isShow: false,
		title: '',
		description: '',
		type: 'info',
	})

	const { backgroundColor, titleColor, descriptionColor, animationSource } = getToastStyles(state.type)

	const updateState = (newState: Object) => {
		setState((prev: any) => ({
			...prev,
			...newState,
		}))
	}

	const insets = useSafeAreaInsets()

	const show = useCallback(
		({
			type,
			title,
			description,
			duration = 2000,
		}: {
			type: 'success' | 'info' | 'warning' | 'error'
			duration: number
			title: string
			description: string
		}) => {
			updateState({ isShow: true, title: title, description: description, type: type })
			toastTopAnimation.value = withSequence(
				withTiming(Math.max(Number(insets.top), 15)),
				withDelay(
					duration,
					withTiming(-100, undefined, (finish: any) => {
						if (finish) {
							runOnJS(() => {
								updateState({
									isShow: false,
									// title: '',
									// description: '',
									// type: 'info',
								})
							})
						}
					}),
				),
			)
		},
		[insets, toastTopAnimation],
	)

	useImperativeHandle(
		ref,
		() => ({
			show: (props: ToastProps) => show(props),
		}),
		[show],
	)

	const animatedTopStyle = useAnimatedStyle(() => {
		return {
			top: toastTopAnimation.value,
		}
	})

	return (
		<>
			{state.isShow && (
				<>
					{/* @ts-expect-error - react-native-reanimated Animated.View type definitions don't include children */}
					<Animated.View style={[styles.container, { backgroundColor }, animatedTopStyle]}>
						{animationSource && (
							<LottiesView
								animationViewStyle={styles.icon}
								animationStyle={styles.icon}
								source={animationSource}
								loop={false}
								autoPlay={true}
								speed={2.5}
							/>
						)}
						<View style={styles.titleCard}>
							<Text
								style={[
									styles.title,
									{
										color: titleColor,
									},
								]}
							>
								{state.title}
							</Text>
							{state.description && (
								<Text
									style={[
										styles.description,
										{
											color: descriptionColor,
										},
									]}
								>
									{state.description}
								</Text>
							)}
						</View>
					</Animated.View>
				</>
			)}
		</>
	)
})

export default Toast

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 10,
		paddingHorizontal: 25,
		paddingVertical: 8,
		marginHorizontal: 15,
		borderRadius: 15,
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'center',
		flex: 1,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.15,
		shadowRadius: 5,
		elevation: 6,
		backgroundColor: '#def1d7',
	},
	titleCard: {
		flexDirection: 'column',
		// alignItems: 'center',
		marginHorizontal: 5,
	},
	title: {
		// color: '#000',
		fontSize: 14,
		fontWeight: '700',
	},
	description: {
		// color: '#000',
		fontSize: 10,
		fontWeight: '500',
	},
	icon: {
		width: 30,
		height: 30,
	},
})
