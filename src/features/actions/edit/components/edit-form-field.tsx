import { Text, View } from 'react-native'
import FieldValue from './field-value'
import FieldLabel from './field-label'

type EditFormFieldProps = {
	label: string
	isDisabled?: boolean
	value: string
}

export default function EditFormField({ label, isDisabled = false, value }: EditFormFieldProps) {
	if (isDisabled) {
		return (
			<View className="flex-row items-center">
				<FieldLabel label={label} />
				<View className="ml-2 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">
					<Text className="text-xs text-amber-700 dark:text-amber-300 font-medium">Bloqueado</Text>
				</View>
			</View>
		)
	}
	return (
		<View className="flex-row items-center">
			<FieldLabel label={label} />
			<FieldValue value={value} />
		</View>
	)
}
