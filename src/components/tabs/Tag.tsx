import { Ionicons } from '@expo/vector-icons'
import { Pressable, Text } from 'react-native'
import { cn } from 'src/utils/tailwind'

interface TagProps {
	onPress: () => void
	title: string
	selected: boolean
	iconName: keyof typeof Ionicons.glyphMap
}

export default function Tag({ onPress, title, selected, iconName }: TagProps) {
	return (
		<Pressable
			onPress={onPress}
			className={cn(
				`flex flex-row items-center justify-center px-1 py-1 rounded-lg overflow-x-hidden border min-w-[100px] space-x-2`,
				{
					'border-[#008000] ': selected,
					'border-gray-300': !selected,
				},
			)}
		>
			{iconName && <Ionicons name={iconName} size={18} color={`${selected ? '#008000' : 'black'}`} />}
			<Text className={`text-sm font-[12px] ${selected ? 'text-[#008000]' : 'text-black'}`}>{title}</Text>
		</Pressable>
	)
}
