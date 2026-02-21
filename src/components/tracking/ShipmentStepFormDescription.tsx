import { Ionicons } from '@expo/vector-icons'
import FormItemDescription from '../forms/FormItemDescription'
import { View } from 'react-native'
import { colors } from 'src/constants'
type ShipmentStepFormDescriptionProps = {
	description: string
	bgColor?: string
	textColor?: string
	iconName?: keyof typeof Ionicons.glyphMap
}

export default function ShipmentStepFormDescription({
	description,
	bgColor = colors.warningBackground,
	textColor = colors.warningText,
	iconName = 'alert-circle-outline',
}: ShipmentStepFormDescriptionProps) {
	return (
		<View
			style={{
				backgroundColor: bgColor ,
			}}
			className="px-2 py-1 rounded-md flex flex-row items-center space-x-2 justify-center "
		>
			<Ionicons name={iconName} size={16} color={textColor} />
			<View className="flex-1">
				<FormItemDescription
					style={{
						color: textColor,
					}}
					description={description}
				/>
			</View>
			<View className="w-2" />
		</View>
	)
}
