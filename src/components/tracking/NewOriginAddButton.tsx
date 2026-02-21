import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity, View, Text, Switch } from 'react-native'
import { colors } from 'src/constants'

type NewOriginAddButtonProps = {
	setIsAddingOrigin: (value: boolean) => void
	isAddingOrigin: boolean
}

export default function NewOriginAddButton({ setIsAddingOrigin, isAddingOrigin }: NewOriginAddButtonProps) {
	const description = isAddingOrigin
		? 'Não há mais proveniências? Fechar opção de adicionar outra.'
		: 'Há mais proveniências? Abrir opção de adicionar outra.'

	const handleAddOrigin = () => {
		if (isAddingOrigin) {
			setIsAddingOrigin(false)
		} else {
			setIsAddingOrigin(true)
		}
	}

	return (
		<View className="py-1 justify-between flex flex-row my-1">
			<View className="w-2/3">
				<Text className="italic text text-[12px] text-gray-500">{description}</Text>
			</View>
			<TouchableOpacity onPress={handleAddOrigin}>
				<Switch
					value={isAddingOrigin}
					onValueChange={() => {
						const newValue = !isAddingOrigin
						setIsAddingOrigin(newValue)
					}}
					thumbColor={isAddingOrigin ? colors.primary : colors.gray600}
				/>
			</TouchableOpacity>
		</View>
	)
}
