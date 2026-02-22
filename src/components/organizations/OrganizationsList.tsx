import React from 'react'
import { OrganizationTypes } from 'src/types'
import { View } from 'react-native'
import Animated, { SlideInRight } from 'react-native-reanimated'
import OrgListItem from './OrgListItem'
import EmptyPlaceholder from '../not-found/EmptyPlaceholder'
import { useColorScheme } from 'nativewind'
import type { OrganizationItem } from 'src/hooks/useOrganizationList'

type Props = {
	items: OrganizationItem[]
	organizationType: OrganizationTypes
}

export default function OrganizationsList({ items, organizationType }: Props) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const renderItem = ({ item }: { item: OrganizationItem }) => <OrgListItem item={item} />

	const translatedOrganizationType =
		organizationType === OrganizationTypes.COOPERATIVE
			? 'Cooperativas'
			: organizationType === OrganizationTypes.ASSOCIATION
				? 'Associações'
				: organizationType === OrganizationTypes.COOP_UNION
					? 'Uniões de Cooperativas'
					: 'Grupos'

	return (

		<Animated.FlatList
			entering={SlideInRight.duration(500)}
			// exiting={SlideOutRight.duration(500)}
			contentContainerStyle={{
				flexGrow: 1,
				backgroundColor: isDarkMode ? 'black' : 'white',
				paddingBottom: 200,
			}}
			showsVerticalScrollIndicator={false}
			ListEmptyComponent={() => (
				<View className="flex-1 items-center justify-center h-[400px]">
					<EmptyPlaceholder message={`Não há ${translatedOrganizationType} para mostrar`} />
				</View>
			)}
			data={items}
			renderItem={renderItem}
		/>
		
	)
}
