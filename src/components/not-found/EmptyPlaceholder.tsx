import { View, Text } from 'react-native'

export default function EmptyPlaceholder({ message }: { message: string }) {
	return (
		<View className="flex-1 items-center justify-center mt-10 px-4">
			<View className="items-center space-y-4">
				<View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
					<Text className="text-2xl">📦</Text>
				</View>
				<View className="items-center space-y-2">
					<Text className="text-[12px] italic text-gray-500 dark:text-gray-400 text-center">{message}</Text>
				</View>
			</View>
		</View>
	)
}
