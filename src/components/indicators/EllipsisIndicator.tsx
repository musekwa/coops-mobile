import { View } from 'react-native'

export default function EllipsisIndicator({ currentIndex, totalItems }: { currentIndex: number; totalItems: number }) {
	return (
        <View className="absolute bottom-4 left-0 right-0 flex flex-row justify-center items-center space-x-1">
            {Array.from({ length: totalItems }).map((_, idx) => (
                <View
                    key={idx}
                    className={`w-3 h-3 rounded-full ${
                        idx === currentIndex ? 'bg-[#008000]/80 dark:bg-[#008000]/80' : 'bg-gray-300/50 dark:bg-gray-600/50'
                    }`}
                />
            ))}
        </View>
    )
}
