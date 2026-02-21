
import React, { useEffect } from 'react'
import { StyleSheet, View, Text } from 'react-native'

type ToastMessageProps = {
	isVisible: boolean
	setIsVisible: (v: boolean) => void
	message: string
}

export default function ToastMessage({ isVisible, setIsVisible, message }: ToastMessageProps) {
	useEffect(() => {
		setTimeout(() => {
			// setIsVisible(false)
		}, 3000)
	}, [])

	return (
		<>
			{true && (
				<View style={styles.container}>
					<View styles={styles.subContainer} className="bg-slate-400 dark:bg-black">
						<Text>ToastMessage</Text>
					</View>
				</View>
			)}
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		width: '100%',
		height: 60,
	},
	subContainer: {
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: '#333',
		gap: 30,
		paddingHorizontal: 20,
		paddingVertical: 15,
		flexDirection: 'row',
		width: '100%',
	},
})
