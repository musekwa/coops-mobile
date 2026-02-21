import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { colors } from 'src/constants'

type ItemCardProps = {
	title: string
	number: number
	description: string
	icon?: keyof typeof Ionicons.glyphMap
	onPress?: () => void
	neededActions: number
}

export default function ItemCard({ title = 'Title', icon = 'information-circle-outline', onPress }: ItemCardProps) {
	return (
		<TouchableOpacity onPress={onPress} activeOpacity={0.7} className="w-[48%] h-[140px] mb-4">
			<Animated.View
				entering={FadeInUp.duration(600)}
				className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 items-center justify-center"
			>
				{/* Icon */}
				<View className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-4">
					<Ionicons name={icon} size={28} color={colors.primary} />
				</View>

				{/* Title */}
				<Text
					numberOfLines={2}
					ellipsizeMode={'tail'}
					className="text-base font-semibold text-gray-900 dark:text-white text-center"
				>
					{title}
				</Text>
			</Animated.View>
		</TouchableOpacity>
	)
}
