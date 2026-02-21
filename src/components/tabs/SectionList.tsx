import { Text } from 'react-native'
import { Pressable } from 'react-native'
import { View, FlatList } from 'react-native'
import ActorListEmpty from '../not-found/ActorListEmpty'
import { ActionType } from 'src/types'

interface SectionListProps {
	data: Array<{ id: string; title: string; photo?: string; phone_number?: string; number_of_members?: number }>
	callback?: (id: string, title: string) => void
	renderItem?: (item: { id: string; title: string; photo?: string; phone_number?: string; number_of_members?: number }) => React.ReactNode
	bottomPadding?: number
}

export default function SectionList({ data, callback, renderItem, bottomPadding = 0 }: SectionListProps) {
	return (
		<FlatList
			keyExtractor={(item: { id: string; title: string }) => item.id.toString()}
			contentContainerStyle={{
				paddingHorizontal: 15,
				paddingTop: 10,
				paddingBottom: bottomPadding,
			}}
			ListEmptyComponent={() => <ActorListEmpty actionType={ActionType.UNKNOWN} />}
			showsVerticalScrollIndicator={false}
			data={data}
			renderItem={({ item }: { item: { id: string; title: string } }) => {
				return (
					<Pressable
						onPress={() => {
							if (callback) {
								callback(item.id, item.title)
							}
						}}
						style={{ width: '100%' }}
					>
						{renderItem ? renderItem(item) : <Text>{item.title}</Text>}
					</Pressable>
				)
			}}
		/>
	)
}
