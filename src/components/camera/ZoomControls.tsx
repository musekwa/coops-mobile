import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Animated, { BounceIn } from 'react-native-reanimated'
import { useWindowDimensions } from 'react-native'
import { TouchableHighlight } from 'react-native'

const MIN_ZOOM = 1
const MAX_ZOOM = 128
const NEUTRAL_ZOOM = 1
const zoomOptions = [1, 2, 3, 4, 5]

export default function ZoomControls({
	setZoom,
	setShowZoomControls,
	zoom,
}: {
	setZoom: (zoom: number) => void
	setShowZoomControls: (show: boolean) => void
	zoom: number
}) {
	const { width, height } = useWindowDimensions()
	const radius = Math.min(width, height - 100) * 0.35

	const handleZoomPress = (zoomFactor: number) => {
		if (zoomFactor === -1) {
			setZoom(NEUTRAL_ZOOM)
		} else {
			const newZoom = Math.min(Math.max(zoomFactor, MIN_ZOOM), MAX_ZOOM)
			setZoom(newZoom)
		}
	}

	return (
		<View style={{ flex: 1, padding: 10 }}>
			{zoomOptions.map((z, index) => {
				const angle = (index / zoomOptions.length / 3) * Math.PI * 2 - Math.PI / 2
				const x = Math.cos(angle) * radius + 40
				const y = Math.sin(angle) * radius + height / 4
				return (
					<Animated.ScrollView
						key={index}
						entering={BounceIn.delay(index * 100)}
						style={{
							position: 'absolute',
							left: x,
							top: y,
						}}
					>
						<TouchableHighlight
							onPress={() => handleZoomPress(z)}
							style={{
								width: 50,
								height: 50,
								borderRadius: 25,
								backgroundColor: zoom === z ? '#ffffff' : '#ffffff30',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Text
								style={{
									color: zoom === z ? 'black' : 'white',
									fontWeight: '600',
								}}
							>
								{z}x
							</Text>
						</TouchableHighlight>
					</Animated.ScrollView>
				)
			})}
			<TouchableOpacity
				onPress={() => setShowZoomControls(false)}
				style={{
					width: 50,
					height: 50,
					borderRadius: 25,
					backgroundColor: '#ffffff30',
					justifyContent: 'center',
					alignItems: 'center',
					position: 'absolute',
					left: 30,
					top: height / 4,
				}}
			>
				<Text style={{ color: 'white', fontWeight: '600' }}>X</Text>
			</TouchableOpacity>
		</View>
	)
}
