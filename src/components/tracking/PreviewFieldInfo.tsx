import { Ionicons, FontAwesome6 } from "@expo/vector-icons"
import { View, Text } from "react-native"
import { colors } from "src/constants"
interface PreviewFieldProps {
	label: string
	value: string
	Icon: React.ElementType
	iconName: keyof typeof Ionicons.glyphMap | keyof typeof FontAwesome6.glyphMap
	iconSize?: number
}

export default function PreviewFieldInfo({ label, value, Icon, iconName, iconSize = 20 }: PreviewFieldProps) {
	return (
		<View className="flex-row items-center my-2 space-x-2">
			<Icon name={iconName} size={iconSize} className="mr-2" color={colors.gray600} />
			<View className="w-[100px]">
				<Text className="text-[12px] text-gray-500 dark:text-gray-400">{label}</Text>
			</View>
			<View className="flex-1">
				<Text className="font-semibold text-[12px] text-gray-500 dark:text-gray-400">{value}</Text>
			</View>
		</View>
	)
}