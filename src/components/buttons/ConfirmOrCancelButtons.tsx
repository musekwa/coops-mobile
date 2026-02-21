import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import SubmitButton from './SubmitButton'

interface ConfirmOrCancelButtonsProps {
	onCancel: () => void
	onConfirm: () => void
	confirmText?: string
	cancelText?: string
	onConfirmDisabled?: boolean
	onCancelDisabled?: boolean
	isLoading?: boolean
}

export default function ConfirmOrCancelButtons({
	onCancel,
	onConfirm,
	confirmText = 'Gravar',
	cancelText = 'Cancelar',
	onConfirmDisabled = false,
	onCancelDisabled = false,
	isLoading = false,
}: ConfirmOrCancelButtonsProps) {
	return (
		<View className="h-16 flex flex-row justify-around items-center space-x-4 ">
			<TouchableOpacity
				activeOpacity={0.5}
				onPress={onCancel}
				disabled={onCancelDisabled || isLoading}
				className={`flex-1 flex-row space-x-1 items-center h-[50px] rounded-md justify-center border border-gray-600 dark:border-gray-400 ${onCancelDisabled ? 'opacity-60' : ''}`}
			>
				<Text className="text-[14px] text-black dark:text-white ">{cancelText}</Text>
			</TouchableOpacity>
			<View className="flex-1 items-center">
				<SubmitButton onPress={onConfirm} title={confirmText} disabled={onConfirmDisabled || isLoading} isSubmitting={isLoading} />
			</View>
		</View>
	)
}
