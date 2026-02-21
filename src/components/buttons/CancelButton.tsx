import { TouchableOpacity, Text } from "react-native";


type CancelButtonProps = {
    onCancel: () => void
    disabled?: boolean
    isLoading?: boolean
    cancelText?: string
    onCancelDisabled?: boolean
}

export default function CancelButton({ onCancel, disabled = false, isLoading = false, cancelText = 'Cancelar', onCancelDisabled = false }: CancelButtonProps) { 

    return (
        <TouchableOpacity
        activeOpacity={0.5}
        onPress={onCancel}
        disabled={onCancelDisabled || isLoading}
        className={`flex-1 flex-row space-x-1 items-center h-[50px] rounded-md justify-center border border-gray-600 dark:border-gray-400 ${onCancelDisabled ? 'opacity-60' : ''}`}
    >
        <Text className="text-[14px] text-black dark:text-white ">{cancelText}</Text>
    </TouchableOpacity>
    )
}
