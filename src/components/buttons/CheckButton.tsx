import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";
import { colors } from "src/constants";

interface CheckButtonProps {
	label: string
	value: string 
	checked: boolean
	onChange: (value: string) => void
    disabled?: boolean
}

export default function CheckButton({ label, value, checked, onChange, disabled = false }: CheckButtonProps) {
	return (
		<TouchableOpacity
        className="flex flex-row space-x-2 my-2 items-center"
			activeOpacity={0.5}
            onPress={() => onChange(value)}
            disabled={disabled}
        >
            {checked ? (
                <Ionicons name="checkbox" color={colors.primary} size={24} />
            ) : (
                <Ionicons name="square-outline" color={colors.gray600} size={24} />
            )}
            <Text className="text-gray-500 dark:text-white text-[14px]">{label}</Text>
		</TouchableOpacity>
	)
}
