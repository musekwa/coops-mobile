import { Href, Link } from 'expo-router'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { ActorCategory } from 'src/types'
import { match } from 'ts-pattern'

type Props = {
	actorCategory: ActorCategory
	description: string
	title: string
	bannerImage: string
	total?: number
	icon?: string
}

export default function ActorCategoryCard({ category }: { category: Props }) {
	const segment: string = match(category.actorCategory)
		.with(ActorCategory.FARMER, () => `farmers`)
		.with(ActorCategory.COOP_UNION, () => `groups/coop-unions`)
		.with(ActorCategory.ASSOCIATION, () => `groups/associations`)
		.with(ActorCategory.COOPERATIVE, () => `groups/cooperatives`)
		.run()

	return (
		<Link href={`/actors/${segment}` as Href} asChild>
			<TouchableOpacity
				activeOpacity={0.7}
				className="flex-row items-center bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
			>
				<View className="w-16 h-16 rounded-2xl overflow-hidden bg-[#008000]/5 dark:bg-[#008000]/10 mr-4">
					<Image
						source={{ uri: category.bannerImage }}
						style={{ width: 64, height: 64 }}
						contentFit="cover"
					/>
				</View>
				<View className="flex-1 flex justify-center min-w-0">
					<Text
						numberOfLines={1}
						className="text-base font-bold text-gray-900 dark:text-white"
					>
						{category.title}
					</Text>
					<Text
						numberOfLines={2}
						className="text-sm text-gray-500 dark:text-gray-400 mt-0.5"
					>
						{category.description}
					</Text>
				</View>
				<View className="w-9 h-9 rounded-full bg-[#008000]/10 dark:bg-[#008000]/20 items-center justify-center ml-2">
					<Ionicons
						name="chevron-forward"
						size={20}
						color="#008000"
					/>
				</View>
			</TouchableOpacity>
		</Link>
	)
}
