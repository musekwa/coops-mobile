import { View, Text, TouchableOpacity, Linking } from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { colors } from 'src/constants'
import { cn } from 'src/utils/tailwind'
import { getIntlDate } from 'src/helpers/dates'

export default function PathInspectionPointItem({
	index,
	check,
	district,
	currentPath,
}: {
	index: number
	check: any
	district: string
	currentPath: string[]
}) {
	return (
		<View key={index} className="relative">
			<View className="flex flex-col relative mr-6">
				<TouchableOpacity
					onPress={() => {
						// handleCheck(check)
					}}
					activeOpacity={1}
					className="flex flex-row space-x-2 items-center"
				>
					<View
						className={`flex items-center justify-center w-10 h-10 rounded-full  ${check?.checkedBy ? 'bg-[#008000]' : 'bg-red-500'}`}
					>
						<Ionicons name="location-outline" size={20} color={colors.white} />
					</View>
					<Text className="text-xs text-gray-600 dark:text-gray-400 font-mono">{district}</Text>
				</TouchableOpacity>
				<View
					className={cn('absolute top-10 left-8 w-[80%] flex flex-row space-x-2  ', {
						' px-2   ': check?.checkedBy,
					})}
				>
					{check?.checkedBy && (
						<View className="flex items-center justify-center">
							<Image
								source={{ uri: avatarPlaceholderUri }}
								style={{
									width: 25,
									height: 25,
									borderRadius: 20,
								}}
								contentFit="cover"
							/>
						</View>
					)}
					<View className="">
						{check?.checkedBy ? (
							<Text className="text-xs font-semibold text-black dark:text-white">{check?.checkedBy}</Text>
						) : (
							<Text className="text-xs font-semibold text-black dark:text-white">Ainda não fiscalizado</Text>
						)}
						{check?.checkedAt && (
							<Text className="text-[10px] text-gray-600 dark:text-gray-400">{getIntlDate(check?.checkedAt)}</Text>
						)}
					</View>
					{check?.phone && (
						<View className="flex items-center justify-center">
							<Feather
								onPress={() => Linking.openURL(`tel:${check?.phone}`)}
								name="phone-call"
								size={20}
								color={colors.primary}
							/>
						</View>
					)}
				</View>
			</View>
			{index < currentPath.length - 1 && (
				<View
					className={cn('ml-5 w-0.5 h-24 bg-gray-300 border-dashed border-2 border-gray-400', {
						'bg-[#008000]': check?.checkedBy,
					})}
				/>
			)}
		</View>
	)
}
