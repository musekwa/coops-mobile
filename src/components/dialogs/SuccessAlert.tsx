import { View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Dialog } from 'react-native-simple-dialogs'
import LottieView from 'lottie-react-native'
import { Href, useRouter } from 'expo-router'
import { useActionStore } from 'src/store/actions/actions'

type DialogProps = {
	visible: boolean
	setVisible: (visible: boolean) => void
	route?: Href
	noAction?: boolean
}

export default function SuccessAlert({ visible, setVisible, route, noAction=false }: DialogProps) {
	const animation = useRef<LottieView>(null)
	const router = useRouter()
	const { setNextRoute } = useActionStore()
	
	useEffect(() => {
		if (visible) {
			const timeout = setTimeout(() => {
				if (noAction) {
					setVisible(false)
					setNextRoute('')
					return
				}

				if (route) {
					router.push(route as Href)
				} else {
					router.back()
				}
				setVisible(false)
				setNextRoute('')
			}, 2000)

			return () => {
				clearTimeout(timeout)
			}
		}
	}, [visible])

	return (
		<Dialog
			animationType={'fade'}
			statusBarTranslucent={true}
			visible={visible}
			dialogStyle={{
				backgroundColor: 'transparent',
				borderWidth: 0,
				elevation: 0,
				shadowOpacity: 0,
				shadowRadius: 0,
				shadowOffset: { width: 0, height: 0 },
			}}
			contentInsetAdjustmentBehavior={'automatic'}
			onRequestClose={() => {}}
			onTouchOutside={() => {}}
		>
			<View className="items-center">
				<LottieView
					autoPlay={true}
					ref={animation}
					style={{
						width: 80,
						height: 80,
					}}
					source={require('../../../assets/lottie/check.json')}
				/>
			</View>
		</Dialog>
	)
}
