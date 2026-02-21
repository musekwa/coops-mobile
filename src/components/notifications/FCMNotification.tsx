import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import messaging from '@react-native-firebase/messaging'
import { Alert } from 'react-native'

export default function FCMNotification() {
    const requestUserPermission = async () => {
		const authStatus = await messaging().requestPermission()
		const enabled =
			authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
			authStatus === messaging.AuthorizationStatus.PROVISIONAL
		if (enabled) {
			console.log('Authorization status:', authStatus)
			return enabled
		}
		return false
	}

	useEffect(() => {
		requestUserPermission()

		// get the device token
		messaging()
			.getToken()
			.then((token) => {
				console.log('Token: ', token)
			})

		//
		messaging()
			.getInitialNotification()
			.then(async (remoteMessage) => {
				if (remoteMessage) {
					console.log('Initial notification:', remoteMessage.notification)
				}
			})

		// Assume a message-notification contains a "type" property in the data payload of the screen to open
		messaging().onNotificationOpenedApp((remoteMessage) => {
			console.log('Notification caused app to open from background state:', remoteMessage.notification)
		})

		messaging().setBackgroundMessageHandler(async (remoteMessage) => {
			console.log('Message handled in the background!', remoteMessage)
		})

		const unsubscribe = messaging().onMessage(async (remoteMessage) => {
			Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage))
		})
		return unsubscribe
	}, [])
  return (
    <View>
      <Text>FCMNotification</Text>
    </View>
  )
}