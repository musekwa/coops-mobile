import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { splash123Uri } from 'src/constants/imageURI'

const images = [splash123Uri]

export default function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentImageIndex((prevIndex) => {
				if (prevIndex === images.length - 1) {
					clearInterval(interval)
					onFinish()
					return prevIndex
				}
				return prevIndex + 1
			})
		}, 2000) // Change image every 1 second

		return () => clearInterval(interval)
	}, [])

	return (
		<View style={styles.container}>
			<Image source={{ uri: images[currentImageIndex] }} style={styles.image} contentFit="cover" />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ffffff', // Set your desired background color
	},
	image: {
		width: '100%',
		height: '100%',
		resizeMode: 'contain',
	},
})
