import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { cn } from 'src/utils/tailwind'


type EditSectionLabelProps = {
	icon: keyof typeof Ionicons.glyphMap
	label: string
	className?: string
	labelClassName?: string
}

export default function EditSectionLabel({ icon, label, className, labelClassName }: EditSectionLabelProps) {
	return (
		<View className={cn("flex-row items-center", className)}>
			<Ionicons name={icon} size={18} color={colors.primary} />
			<Text className={cn("ml-2 font-medium text-[14px] text-gray-600 dark:text-gray-400", labelClassName)}>{label}</Text>
		</View>
	)
}
