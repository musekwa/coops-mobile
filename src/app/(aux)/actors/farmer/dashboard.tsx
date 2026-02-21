import { Text, View } from 'react-native'
import React from 'react'
import { ActionType } from 'src/types'
import ActorListEmpty from 'src/components/not-found/ActorListEmpty'
import Animated, { SlideInDown } from 'react-native-reanimated'

export default function FarmerDashboardPage() {
	return (
		<Animated.ScrollView
			entering={SlideInDown.duration(500)}
			className="flex-1 bg-white dark:bg-black"
			contentContainerStyle={{
				flexGrow: 1,
				justifyContent: 'center',
				alignItems: 'center',
				paddingHorizontal: 16,
			}}
		>
			<ActorListEmpty actionType={ActionType.UNKNOWN} />
			<Text className="text-center text-sm text-gray-600 dark:text-gray-400 italic">
				Este é o ecrã de activos e actividades do Produtor. O seu UI será desenvolvido assim que for definido as
				actividades e os activos que podem ser associados a um Produtor.
			</Text>
		</Animated.ScrollView>
	)
}
