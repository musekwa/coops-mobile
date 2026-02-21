import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { ActorCategory } from 'src/types';
import { useActorStore } from 'src/store/actor';
import { TouchableOpacity } from 'react-native';
import { cn } from 'src/utils/tailwind';

type CategoryTabProps = {
	category: { title: string; actorCategory: ActorCategory; icon: string }
	onPress: () => void
	activeCategory: ActorCategory | undefined
	setActiveCategory: (category: ActorCategory) => void
}


export default function CategoryTab({ category, activeCategory, setActiveCategory, onPress }: CategoryTabProps){
	const { getCategory, resetCategory } = useActorStore()
	useEffect(() => {
		if (getCategory().title) {
			setActiveCategory(getCategory().actorCategory)
			resetCategory()
		}
	}, [])

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			className={cn("border border-gray-400 bg-white dark:border-gray-800 dark:bg-gray-900  items-center justify-center mx-1 px-2 py-2.5 rounded-md my-2", {
				'bg-[#008000]': activeCategory === category.actorCategory,
			})}
		>
			<Text
				className={cn('text-sm text-black dark:text-white font-bold ', {
					'text-white': activeCategory === category.actorCategory,
				} )}
			>
				{category.title}
			</Text>
		</TouchableOpacity>
	)
}