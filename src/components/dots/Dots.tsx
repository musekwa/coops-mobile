import { View } from 'react-native'
import Animated, { SharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import Dot from './Dot'
type DotsProps = {
	counts: number
	activeIndex: SharedValue<number>
}
const DOT_SIZE = 10
const ACTIVE_COLOR = '#E1E5E1FF'
const DOTS_GAP = 5

export default function Dots({ counts, activeIndex }: DotsProps) {
	const animatedStyle = useAnimatedStyle(() => {
		const width = DOT_SIZE * (activeIndex.value + 1) + DOTS_GAP * (activeIndex.value + 1)
		return {
			width: withSpring(width, {
				// mass: 0.6,
				stiffness: 100,
				damping: 10,
			}),
		}
	}, [])

	return (
		<View
			style={{
				flexDirection: 'row',
				gap: DOTS_GAP,
			}}
		>
			{new Array(counts).fill(0).map((_, index) => {
				return <Dot key={index} dotSize={DOT_SIZE} index={index} activeIndex={activeIndex} />
			})}
			<Animated.View
				style={[
					{
						left: -DOTS_GAP / 2,
						top: -DOT_SIZE / 2,
						height: DOT_SIZE * 2,
						position: 'absolute',
						backgroundColor: ACTIVE_COLOR,
						zIndex: -1,
						borderRadius: DOT_SIZE / 2,
						borderCurve: 'continuous', // ios
					},
					animatedStyle,
				]}
			/>
		</View>
	)
}
