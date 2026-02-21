import { Text } from 'react-native'

type FieldLabelProps = {
	label: string
}

export default function FieldLabel({ label }: FieldLabelProps) {  
    return (
        <Text className="text-[12px] font-normal text-gray-500 dark:text-gray-400">{label}{' '}</Text>
    )
}