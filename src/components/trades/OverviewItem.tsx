import { View, Text } from 'react-native'
import { OverviewItemProps } from 'src/types'

export default function OverviewItem({ title, value }: OverviewItemProps) {
	return (
		<View className="flex flex-col items-center justify-center w-[25%]">
			<Text className="text-black dark:text-white text-lg font-bold text-center">{value}</Text>
			<Text className="text-gray-600 dark:text-gray-400 text-[8px] text-center">{title}</Text>
		</View>
	)
}