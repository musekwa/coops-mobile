import { View } from 'react-native'
import React from 'react'
import { useWindowDimensions } from 'react-native'
import Dots from '../dots/Dots'
import Animated, { useAnimatedRef, useDerivedValue, useScrollViewOffset, useSharedValue } from 'react-native-reanimated'
import PreviewLayout from './PreviewLayout'

interface PreviewAddedShipmentInfoProps {
	totalSteps: number
}

export default function PreviewAddedShipmentInfo({ totalSteps = 3 }: PreviewAddedShipmentInfoProps) {
	const { width: screenWidth, height: screenHeight } = useWindowDimensions()
	const scrollRef = useAnimatedRef<any>()
	// find scrollOffset
	const scrollOffset = useScrollViewOffset(scrollRef)

	// Change activeIndex to be a SharedValue
	const activeIndex = useSharedValue(0)

	// Update activeIndex based on scrollOffset
	useDerivedValue(() => {
		activeIndex.value = Math.floor(scrollOffset.value / screenWidth)
	})

	const stepsArray = new Array(3).fill(0)

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
				{totalSteps > 0 && stepsArray.map((_, index) => <PreviewLayout key={index} index={index} />)}
			</Animated.ScrollView>
			<View className="absolute bottom-5">
				<Dots counts={totalSteps - 1} activeIndex={activeIndex} />
			</View>
		</View>
	)
}
