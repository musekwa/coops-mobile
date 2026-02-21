import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { View } from 'react-native'
import { StyleSheet } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import { colors } from 'src/constants'

type CustomPickerProps = {
	items: { label: string; value: string }[]
	setValue: (value: string) => void
	placeholder: { label: string; value: null }
	value: string
}

export const CustomPicker = ({ items, setValue, placeholder, value }: CustomPickerProps) => {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	
	// Safely filter and provide fallback items
	const safeItems = items && Array.isArray(items)
		? items.filter(item => item && item.label && item.value)
		: [{ label: 'Não Aplicável', value: 'N/A' }]

	return (
		<RNPickerSelect
			placeholder={placeholder}
			value={value}
			onValueChange={(value, index) => setValue(value)}
			items={safeItems.length > 0 ? safeItems : [{ label: 'Não Aplicável', value: 'N/A' }]}
			style={{
				...pickerSelectStyles,
				inputAndroid: {
					...pickerSelectStyles.inputAndroid,
					color: isDarkMode ? colors.white : colors.black,
					backgroundColor: isDarkMode ? colors.black : colors.white,
				},
		
					
			}}
			useNativeAndroidPickerStyle={false}
			Icon={() => {
				return (
					<Ionicons name="chevron-down-sharp" size={18} color={colors.gray600} />
				)
			}}
		/>
	)
}

const pickerSelectStyles = StyleSheet.create({
	iconContainer: {
		top: 15,
		right: 10,
	},
	placeholder: {
		color: colors.gray600,
		fontSize: 14,
		// fontWeight: 'bold',
	},
	inputAndroid: {
		fontSize: 14,
		borderWidth: 1,
		backgroundColor: colors.gray50,
		borderColor: colors.slate300,
		borderRadius: 10,
		paddingHorizontal: 5,
		height: 50,
	},



})
