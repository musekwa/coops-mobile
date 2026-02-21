import { Text } from 'react-native'
import React, { RefObject, useEffect, useRef, useState } from 'react'
import { ScrollView } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { cn } from 'src/utils/tailwind'


function ItemTab({ item, activeTab, onPress }: any) {
	useEffect(() => {}, [])

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			className={cn(
				'border border-gray-400 bg-white dark:border-gray-800 dark:bg-gray-900  items-center justify-center mx-1 px-2 py-2 rounded-md my-2',
				{
					'bg-[#008000]': item.category === activeTab,
				},
			)}
		>
			<Text
				className={cn('text-[12px] text-black dark:text-white font-mono', {
					'text-white': item.category === activeTab,
				})}
			>
				{item.title}
			</Text>
		</TouchableOpacity>
	)
}

type RenderTabBarProps = {
	activeTab: string
	handleActiveTab: (category: string) => void
	items: any[]
}

export default function RenderTabBar({ items, activeTab, handleActiveTab }: RenderTabBarProps) {
	const scrollViewRef: RefObject<any> = useRef(null)
	
	return (
		<ScrollView
			ref={scrollViewRef}
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				paddingHorizontal: 10,
			}}
		>
			{items.map((item) => (
				<ItemTab key={item.title} item={item} activeTab={activeTab} onPress={() => handleActiveTab(item.category)} />
			))}
		</ScrollView>
	)
}
