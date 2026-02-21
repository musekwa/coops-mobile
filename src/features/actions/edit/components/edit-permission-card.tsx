import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type EditPermissionCardProps = {
    setShowPermissionDialog: (show: boolean) => void
    title: string
    description: string
    buttonText: string
}

export const EditPermissionCard = ({ setShowPermissionDialog, title, description, buttonText }: EditPermissionCardProps) => {
    return (
        <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
        <View className="flex-row items-start mb-3">
            <Ionicons name="lock-closed" size={24} color="#d97706" />
            <View className="flex-1 ml-3">
                <Text className="text-[14px] font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    {title}
                </Text>
                <Text className="text-[12px] text-amber-800 dark:text-amber-300 leading-4">
                    {description}
                </Text>
            </View>
        </View>
        <TouchableOpacity
            onPress={() => setShowPermissionDialog(true)}
            className="bg-amber-600 dark:bg-amber-700 rounded-xl py-2 px-3 items-center justify-center mt-2"
            activeOpacity={0.8}
        >
            <View className="flex-row items-center">
                <Ionicons name="key-outline" size={20} color="white" />
                <Text className="text-white font-semibold text-[14px] ml-2">{buttonText}</Text>
            </View>
        </TouchableOpacity>
    </View>
    )
}