import { Ionicons } from '@expo/vector-icons'
import { View, TouchableOpacity, Text } from 'react-native'

type CustomSelectItemTriggerProps = {
	resetItem: () => void
	hasSelectedItem: boolean
	setShowItems: (show: boolean) => void
	selectedItem: string
}

export default function CustomSelectItemTrigger({
	resetItem,
	hasSelectedItem,
	setShowItems,
	selectedItem,
}: CustomSelectItemTriggerProps) {
	return (
		<TouchableOpacity activeOpacity={0.5} onPress={() => setShowItems(true)}>
			<View className="relative border border-slate-300 p-3 text-[14px] shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-black h-[50px]">
				<Text className="text-[#808080]">{selectedItem}</Text>
				{hasSelectedItem ? (
					<TouchableOpacity 
					onPress={resetItem} 
					className="absolute top-3 right-2"
					accessibilityRole="button"
					accessibilityLabel="Clear selection"
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
						<Ionicons name="close" size={20} color="#808080" />
					</TouchableOpacity>
				) : (
					<View
						className="absolute top-5 right-2"
						style={{
							backgroundColor: 'transparent',
							borderTopWidth: 8,
							borderTopColor: 'gray',
							borderRightWidth: 8,
							borderRightColor: 'transparent',
							borderLeftWidth: 8,
							borderLeftColor: 'transparent',
							width: 0,
							height: 0,
						}}
					/>
				)}
			</View>
		</TouchableOpacity>
	)
}

