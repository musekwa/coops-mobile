import React, { useState, useEffect } from 'react'
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ConfirmOrCancelButtons from '../buttons/ConfirmOrCancelButtons'
import { colors } from 'src/constants'
import EmptyPlaceholder from '../not-found/EmptyPlaceholder'


interface MultiSelectModalProps {
	visible: boolean
	onClose: () => void
	options: { label: string; value: string }[]
	selectedValues: string[]
	onConfirm: (selectedValues: string[]) => void
	title: string
}

const MultiSelectModal: React.FC<MultiSelectModalProps> = ({
	visible,
	onClose,
	options,
	selectedValues,
	onConfirm,
	title,
}) => {
	const [localSelectedValues, setLocalSelectedValues] = useState<string[]>(selectedValues)

	useEffect(() => {
		setLocalSelectedValues(selectedValues)
	}, [selectedValues])

	const toggleSelection = (value: string) => {
		setLocalSelectedValues((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
	}

	const handleConfirm = () => {
		onConfirm(localSelectedValues)
		onClose()
	}

	const renderItem = ({ item }: { item: { label: string; value: string } }) => (
		<TouchableOpacity
			className="flex-row justify-between items-center px-2 py-4 dark:py-4 dark:mt-1 border-b dark:border border-gray-200 dark:border-gray-600 bg-white dark:bg-black dark:rounded-lg"
			onPress={() => toggleSelection(item.value)}
		>
			<Text className="text-base text-black dark:text-white">{item.label}</Text>
			{localSelectedValues.includes(item.value) ? (
				<Ionicons name="checkmark-circle" size={28} color={colors.primary} />
			) : (
				<Ionicons name="radio-button-off" size={28} color={colors.grey} />
			)}
		</TouchableOpacity>
	)

	return (
		<Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
			<View className="flex-1 justify-center items-center bg-black/50 dark:bg-black">
				<View className="bg-white dark:bg-black px-3 pt-3 w-[90%] min-h-[90%] rounded-lg">
					<Text className="text-[12px] italic mb-4 text-center text-black dark:text-gray-400">{title}</Text>
					<FlatList
						showsVerticalScrollIndicator={false}
						ListEmptyComponent={() => (
							<View className="flex-1 justify-center items-center h-[300px]">
								<EmptyPlaceholder message="Não há membros para seleccionar." />
							</View>
						)}
						data={options}
						renderItem={renderItem}
						keyExtractor={(item: { value: string }) => item.value}
						style={styles.list}
					/>
					<ConfirmOrCancelButtons
						onConfirm={handleConfirm}
						onCancel={onClose}
						confirmText="Confirmar"
						cancelText="Cancelar"
					/>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	list: {
		maxHeight: '80%',
	},
	item: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	itemText: {
		fontSize: 16,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 20,
	},
	button: {
		padding: 10,
		borderRadius: 5,
		backgroundColor: '#007AFF',
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
	},
})

export default MultiSelectModal
