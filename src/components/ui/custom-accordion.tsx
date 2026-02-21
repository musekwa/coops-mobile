import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { View, Text, TouchableOpacity } from 'react-native'
import Animated, { LinearTransition, FadeInDown } from 'react-native-reanimated'

interface AccordionProps {
	title: string
	description: string
	isExpanded: boolean
	onToggle: () => void
	children: React.ReactNode
	badgeCount?: number
}

export default function Accordion({
	title,
	description,
	isExpanded,
	onToggle,
	children,
	badgeCount = 0,
}: AccordionProps) {
	return (
		<View className="mb-4">
			<TouchableOpacity
				activeOpacity={0.5}
				onPress={onToggle}
				className="relative flex-row items-center justify-between py-2 px-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
			>
				<View className="flex-1 items-start space-y-1 w-[70%]">
					<View className="flex-row items-center justify-between w-full">
						<View className="w-35%">
							<Text className="text-[14px] font-medium text-gray-900 dark:text-gray-100">{title}</Text>
						</View>
					</View>
					<Text className="text-[12px] italic text-gray-500 dark:text-gray-400">{description}</Text>
				</View>
				<View className="">
					<Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={colors.primary} />
				</View>
				<View className="absolute right-1 top-1">
					{badgeCount > 0 && (
						<View className="bg-red-500 rounded-full px-1.5 py-0.5">
							<Text className="text-white text-[10px] font-medium">{badgeCount > 5 ? '5+' : badgeCount}</Text>
						</View>
					)}
				</View>
			</TouchableOpacity>
			{isExpanded && (
				<Animated.ScrollView
					entering={FadeInDown.springify()}
					layout={LinearTransition.springify()}
					contentContainerStyle={{
						flexGrow: 1,
						paddingHorizontal: 8,
						paddingBottom: 250,
					}}
					showsVerticalScrollIndicator={false}
				>
					<View className="flex-1">{children}</View>
				</Animated.ScrollView>
			)}
		</View>
	)
}
