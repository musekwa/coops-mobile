import React from 'react'
import { OrganizationTypes } from 'src/types'
import { View } from 'react-native'
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated'
import OrgListItem from './OrgListItem'
import EmptyPlaceholder from '../not-found/EmptyPlaceholder'

type Props = {
	items: {
		id: string
		group_name: string
		organization_type: string
		admin_post: string
	}[]
	organizationType: OrganizationTypes
}

export default function OrganizationsList({ items, organizationType }: Props) {
	const renderItem = ({
		item,
	}: {
		item: {
			id: string
			group_name: string
			organization_type: string
			admin_post: string
		}
	}) => <OrgListItem item={item} />

	const translatedOrganizationType =
		organizationType === OrganizationTypes.COOPERATIVE
			? 'Cooperativas'
			: organizationType === OrganizationTypes.ASSOCIATION
				? 'Associações'
				: organizationType === OrganizationTypes.COOP_UNION
					? 'Uniões de Cooperativas'
					: 'Grupos'

	return (
		<View style={{ flex: 1 }}>
			<View className="flex-1 bg-white dark:bg-black">
				<Animated.FlatList
				entering={SlideInRight.duration(500)}
				exiting={SlideOutRight.duration(500)}
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: 100,
				}}
				ListEmptyComponent={() => (
					<View className="flex-1 items-center justify-center h-[400px]">
						<EmptyPlaceholder message={`Não há ${translatedOrganizationType} para mostrar`} />
					</View>
				)}
				data={items}
				renderItem={renderItem}
			/>
			</View>
		</View>
	)
}
