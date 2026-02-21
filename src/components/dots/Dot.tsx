import Animated, { SharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"

type DotProps = {
    dotSize: number
    index: number
    activeIndex: SharedValue<number>
}


export default function Dot({ dotSize, index, activeIndex }: DotProps) {
	const rDotStyle = useAnimatedStyle(() => {
        const isDotActive = index <= activeIndex.value
        return {
            opacity: withTiming(isDotActive ? 1 : 0.3, {
                duration: 150,
            }),
        }
    }, [])

    return (
        <Animated.View
            style={[{
                    width: dotSize,
                    height: dotSize,
                    backgroundColor: '#45D345FF',
                    borderRadius: dotSize / 2,
                },
                rDotStyle,
            ]}
        />
    )

}

