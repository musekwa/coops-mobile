import { TouchableOpacity, View } from 'react-native'
import { TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
interface CustomSearchInputProps {
	placeholder: string
	onChangeText: (text: string) => void
	value: string
	setIsSearching: (isSearching: boolean) => void
	setSearch: (search: string) => void
}

export default function CustomSearchInput({
	placeholder,
	onChangeText,
	value,
	setIsSearching,
	setSearch,
}: CustomSearchInputProps) {
	return (
		<View className="relative">
			<View className="flex flex-row items-center justify-between">
				<TextInput
					onChangeText={onChangeText}
					autoFocus={true}
					className="w-full border border-slate-100 p-2 my-2 text-[14px] shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-black"
					placeholder={placeholder}
					placeholderTextColor="gray"
					value={value}
				/>
				<TouchableOpacity
					onPress={() => {
						setIsSearching(false)
						setSearch('')
					}}
					className="absolute right-2"
				>
					<Ionicons name="close" size={18} color={colors.gray600} />
				</TouchableOpacity>
			</View>
		</View>
	)
}
