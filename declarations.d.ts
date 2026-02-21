declare module "react-native"
declare module "react-native-vision-camera"
declare module "react-native-svg"

import 'react-native-safe-area-context'

declare module 'react-native-safe-area-context' {
	import { StyleProp, ViewStyle } from 'react-native'
	export interface NativeSafeAreaViewProps {
		style?: StyleProp<ViewStyle>
	}
}