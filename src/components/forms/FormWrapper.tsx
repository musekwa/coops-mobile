import { View } from 'react-native'
import Animated, { SlideInLeft, SlideOutRight } from 'react-native-reanimated'

export default function FormWrapper({ children }: { children: React.ReactNode }) {
	return (
		<Animated.ScrollView
			entering={SlideInLeft.duration(500)}
			exiting={SlideOutRight.duration(500)}
			contentContainerStyle={{
				flexGrow: 1,
				paddingHorizontal: 15,
				paddingVertical: 30,
			}}
			className="bg-white dark:bg-black"
			showsVerticalScrollIndicator={false}
			keyboardShouldPersistTaps="handled"
		>
			<View className="pt-2 pb-6 space-y-6">{children}</View>
		</Animated.ScrollView>
	)
}
