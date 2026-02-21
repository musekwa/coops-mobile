import React from 'react'
import { View } from 'react-native'

export default function TransactionShimmer() {
	return (
		<View className="rounded-lg bg-white dark:bg-gray-800 my-3 p-1 shadow-sm border border-gray-100 dark:border-gray-700">
			<View className="flex flex-col space-y-3">
				{/* Header Shimmer */}
				<View className="flex-row justify-between items-center">
					<View className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					<View className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
				</View>

				{/* Info Shimmer */}
				<View className="space-y-2">
					<View className="flex-row items-start space-x-2">
						<View className="w-[35%] h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
						<View className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					</View>
					<View className="flex-row items-start space-x-2">
						<View className="w-[35%] h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
						<View className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					</View>
				</View>

				{/* Confirmation Buttons Shimmer */}
				<View className="pt-2">
					<View className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
					<View className="flex-row space-x-4">
						<View className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
						<View className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					</View>
				</View>
			</View>
		</View>
	)
}

