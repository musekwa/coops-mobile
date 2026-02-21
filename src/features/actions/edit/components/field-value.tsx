import { Text } from 'react-native'
import { cn } from 'src/utils/tailwind'

type FieldValueProps = {
	value: string
	className?: string
    isDisabled?: boolean
}

export default function FieldValue({ value, className, isDisabled = false }: FieldValueProps) {
	return (
		<Text
			className={cn(
				'text-[12px] font-medium text-gray-900 dark:text-white',
				isDisabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white',
				className,
			)}
		>
			{value}
		</Text>
	)
}
