import { Fontisto } from '@expo/vector-icons'
import { TouchableOpacity, Text } from 'react-native'
import { colors } from 'src/constants'


type RadioButtonProps = {
	label: string
	value: string 
	checked: boolean
	onChange: (value: string) => void
    disabled?: boolean
	textClassNames?: string	
	buttonClassNames?: string
}

export default function RadioButton({ label, value, checked, onChange,  disabled = false, textClassNames, buttonClassNames }: RadioButtonProps) {
	return (
		<TouchableOpacity
			className={`flex flex-row space-x-2 my-2 items-center ${buttonClassNames}`}
			activeOpacity={0.5}
			onPress={() => {
				if (!disabled) {
					onChange(value)	
				}
			}}
			disabled={disabled}
		>
			{checked ? (
				<Fontisto name="radio-btn-active" color={colors.primary} size={22} />
			) : (
				<Fontisto color={colors.gray600} name="radio-btn-passive" size={22} />
			)}
				<Text className={`text-gray-500 dark:text-white text-[14px] ${textClassNames}`}>{label}</Text>
		</TouchableOpacity>
	)
}
