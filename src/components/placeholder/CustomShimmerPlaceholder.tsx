import React from 'react'

import { LinearGradient } from 'expo-linear-gradient'
import { ShimmerPlaceholderProps, createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import { useColorScheme } from 'nativewind'
import { FlatList } from 'react-native'
import { View } from 'react-native'


const LinearShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

export default function CustomShimmerPlaceholder(props: ShimmerPlaceholderProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	
	const shimmerColor = isDarkMode ? ['rgba(220, 220, 220, 0.05)', 'rgba(220, 220, 220, 0.03)', 'rgba(220, 220, 220, 0.03)'] : ['rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.08)']

	return <LinearShimmerPlaceholder {...props} shimmerColors={shimmerColor} />
}

// Placeholder for list items
export function CustomShimmerPlaceholderItem({props}: { props?: ShimmerPlaceholderProps }) {
	return <View className=" items-center mx-3 ">
		<CustomShimmerPlaceholder
			// visible={isLoading}
			style={[{
				width: '100%',
				height: 60,
				margin: 10,
				borderRadius: 10,
				
			}, props?.style]}
		/>
	</View>
}

// Placeholder for avatar
export function CustomShimmerPlaceholderAvatar({props}: { props?: ShimmerPlaceholderProps }) {
	return <View className=" items-center mx-3 ">
		<CustomShimmerPlaceholder
			// visible={isLoading}
			style={[{
				width: 60,
				height: 60,
				margin: 10,
				borderRadius: 30,
				
			}, props?.style]}
		/>
	</View>
}

// Placeholder for list
export function CustomShimmerPlaceholderItemList({props,  count = 5, height = 60 }: { count?: number, height?: number, props?: ShimmerPlaceholderProps }) {
	return <View className="bg-white dark:bg-black">
	<FlatList
	showsVerticalScrollIndicator={false}
	data={Array(count).fill(0)}
	numColumns={1}
	keyExtractor={(item: number, index: number) => index.toString()}
	renderItem={() => (
		<View className=" items-center mx-3 ">
			<CustomShimmerPlaceholder
			// visible={isLoading}
			style={[{
				width: '100%',
				height: height,
				margin: 10,
				borderRadius: 10,
				
			}, props?.style]}
			/>
		</View>
	)}
/>
	</View> 
}