import { View, FlatList, StyleSheet } from 'react-native'
import React from 'react'
import ActorListEmpty from '../not-found/ActorListEmpty'
import { ActionType } from 'src/types'

import { useActionStore } from 'src/store/actions/actions'
import FormItemDescription from '../forms/FormItemDescription'
import { getIntlDate } from 'src/helpers/dates'
type ShipmentsListProps = {
	shipments: any[]
}

export default function ShipmentList({ shipments }: ShipmentsListProps) {

	const { getPdfUri, startDate, endDate } = useActionStore()

	const renderItem = ({ item }: { item: any }) => (
		<View />
	)

	const listHeaderComponent = () => {
		const userDistrict = ''
		return (
			<View className="py-3">
				<FormItemDescription
					description={`Mercadorias em trânsito para, de, ou pelo distrito de ${userDistrict} entre ${getIntlDate(startDate)} e ${getIntlDate(endDate)}`}
				/>
			</View>
		)
	}

	return (
		<View className="flex-1">
			{!getPdfUri() && (
				<FlatList
					showsVerticalScrollIndicator={false}
					keyExtractor={(item: any) => item._id}
					ListHeaderComponent={listHeaderComponent}
					ListFooterComponent={<View style={{ height: 20 }} />}
					contentContainerStyle={styles.listContainer}
					ListEmptyComponent={() => <ActorListEmpty actionType={ActionType.ADD_SHIPMENT} />}
					data={shipments}
					renderItem={renderItem}
				/>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	listContainer: {
		flexGrow: 1,
		paddingVertical: 20,
	},
})
