import { FlatList, View } from 'react-native'
import CustomShimmerPlaceholder from 'src/components/placeholder/CustomShimmerPlaceholder'

export default function FormalShipmentListSkeleton() {
	return (
		<FlatList
			showsVerticalScrollIndicator={false}
			data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]}
			numColumns={1}
			keyExtractor={(item: number) => item.toString()}
			renderItem={() => (
				<View className=" items-center mx-3">
					<CustomShimmerPlaceholder
						style={{
							width: '100%',
							height: 60,
							margin: 10,
							borderRadius: 10,
						}}
					/>
				</View>
			)}
		/>
	)
}
