import { View } from 'react-native'
import React from 'react'
import { useWindowDimensions } from 'react-native'
import Dots from '../dots/Dots'
import Animated, { useAnimatedRef, useDerivedValue, useScrollViewOffset, useSharedValue } from 'react-native-reanimated'
import PreviewSmugglingLayout from './PreviewSmugglingLayout'
import { useSmugglerDetailsStore } from 'src/store/tracking/smuggler'

interface PreviewSmugglingInfoProps {
	totalSteps: number
}

export default function PreviewSmugglingInfo({ totalSteps = 3 }: PreviewSmugglingInfoProps) {
	const { width: screenWidth, height: screenHeight } = useWindowDimensions()
	const { smugglerDetails } = useSmugglerDetailsStore()
	const scrollRef = useAnimatedRef<any>()
	// find scrollOffset
	const scrollOffset = useScrollViewOffset(scrollRef)

	// Change activeIndex to be a SharedValue
	const activeIndex = useSharedValue(0)

	// Update activeIndex based on scrollOffset
	useDerivedValue(() => {
		activeIndex.value = Math.floor(scrollOffset.value / screenWidth)
	})

	// If smuggler is already registered, we need 4 screens (Details, Flow, Load, Save)
	// Otherwise, we need 3 screens (Flow, Load, Save)
	const numberOfScreens = smugglerDetails.isAlreadyRegistered ? 4 : 3
	const stepsArray = new Array(numberOfScreens).fill(0)

	return (
		<View className="flex-1 justify-center items-center">
			<Animated.ScrollView
				horizontal
				decelerationRate="fast"
				snapToInterval={screenWidth}
				showsHorizontalScrollIndicator={false}
				ref={scrollRef}
				style={{ height: screenHeight }}
			>
				{totalSteps > 0 && stepsArray.map((_, index) => <PreviewSmugglingLayout key={index} index={index} />)}
			</Animated.ScrollView>
			<View className="absolute bottom-5">
				<Dots counts={numberOfScreens} activeIndex={activeIndex} />
			</View>
		</View>
	)
}
