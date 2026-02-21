import { useFocusEffect, useNavigation } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import { BackHandler, Alert } from 'react-native'

type Props = {
	navigationAction?: () => void
	title: string
	message: string
	cancelText?: string
	okText?: string
}

export default function useBackHandler({ navigationAction, title, message, cancelText, okText }: Props) {
	const navigation = useNavigation()

	const handleBackPress = () => {
		const alertOptions = {
			title: title,
			message: message,
			buttons: [
				{ text: okText ? okText : 'Sim', onPress: () => navigation.goBack() },
				{
					text: cancelText ? cancelText : 'Cancelar',
					onPress: () => null,
					style: 'cancel',
				},
			],
		}
		Alert.alert(alertOptions.title, alertOptions.message, alertOptions.buttons)
		return true // Prevent default behavior of closing the screen
	}

	useFocusEffect(
		useCallback(() => {
			const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress)
			return () => backHandler.remove()
		}, []),
	)
}
