import { View, Text, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { avatarPlaceholderUri } from 'src/constants/imageURI'

type ResourcePersonalCardProps = {
	photo?: string
	surname: string
	otherNames: string
	nuit: string
}

export default function ResourcePersonalCard({
	photo,
	surname,
	otherNames,
	nuit,
}: ResourcePersonalCardProps) {

	return (
		<View className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-2xl p-1 mb-6">
			<View className="flex-row items-center mb-4">
				<View className="bg-gray-100 dark:bg-gray-800/50 rounded-full p-2.5 mr-3">
					<Image source={{ uri: photo ? photo : avatarPlaceholderUri }} className="w-20 h-20 rounded-full" />
				</View>
				<View className="flex-1">
					<Text className="text-[14px] font-bold text-gray-900 dark:text-gray-100 leading-5 ">
						{otherNames} {surname}
					</Text>
				</View>
			</View>
			{nuit && nuit !== 'N/A' && (
				<View className="flex-row items-center bg-white dark:bg-gray-800/50 rounded-xl px-4 py-2.5 border border-gray-200 dark:border-gray-700">
					<Ionicons name="card" size={18} color={colors.gray600} />
					<Text className="text-[12px] font-medium text-gray-600 dark:text-gray-400 ml-2.5">
						NUIT: <Text className="font-bold text-[12px]">{nuit}</Text>
					</Text>
				</View>
			)}
		</View>
	)
}
