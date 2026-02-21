import { Href, Link } from 'expo-router'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
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

export default function CategoryItem({ category }: { category: Props }) {
	// Provide href according to ActoryCategory
	const segment: string = match(category.actorCategory)
		.with(ActorCategory.FARMER, () => `farmers`)
		// .with(ActorCategory.TRADER, () => `traders`)
		// .with(ActorCategory.EXPORTER, () => `traders/exporters`)
		// .with(ActorCategory.PROCESSOR, () => `traders/processors`)
		// .with(ActorCategory.GROUP, () => `groups`)
		// .with(ActorCategory.SERVICE_PROVIDER, () => `farmers/service-providers`)
		.with(ActorCategory.COOP_UNION, () => `groups/coop-unions`)
		.with(ActorCategory.ASSOCIATION, () => `groups/associations`)
		.with(ActorCategory.COOPERATIVE, () => `groups/cooperatives`)
		.run()

	return (
		<Link href={`/actors/${segment}` as Href} asChild>
			<TouchableOpacity className="w-1/2 flex items-center">
				<View className="border border-slate-300 rounded-full p-1 bg-gray-50 dark:bg-slate-900 dark:border-slate-400 shadow-sm shadow-black">
					<Image
						source={{
							uri: category.bannerImage,
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
						{category.title}
					</Text>
					<Text numberOfLines={2} className="text-gray-400 italic font-normal text-[10px] text-center ">
						{category.description}
					</Text>
				</View>
			</TouchableOpacity>
		</Link>
	)
}
