import { Text, TouchableOpacity, View } from 'react-native'
import { Href, Link } from 'expo-router'
import { Image } from 'expo-image'

type OrgTypeCardProps = {
	title: string
	routeSegment: string
	count: number
	imageUri?: string
	description?: string
}

export default function OrgTypeCard({ title, routeSegment, count, imageUri, description }: OrgTypeCardProps) {
	return (
		<Link href={`/actors/groups/${routeSegment}` as Href} asChild>
			<TouchableOpacity className="w-1/2 flex items-center">
				<View className="border border-slate-300 rounded-full p-1 bg-gray-50 dark:bg-slate-900 dark:border-slate-400 shadow-sm shadow-black">
					<Image
						source={{
							uri: imageUri,
						}}
						style={{
							width: 80,
							height: 80,
							borderRadius: 120,
						}}
						contentFit="cover"
					/>
				</View>
				<View className="flex ">
					<Text
						numberOfLines={1}
						ellipsizeMode={'tail'}
						className="text-[14px] font-bold text-center text-black dark:text-white"
					>
						{title}
					</Text>
					{/* <Text className="text-gray-400 italic font-normal text-[14px] text-center ">{count}</Text> */}
					<Text numberOfLines={2} className="text-gray-400 italic font-normal text-[10px] text-center ">
						{description}
					</Text>
				</View>
			</TouchableOpacity>
		</Link>
	)
}
