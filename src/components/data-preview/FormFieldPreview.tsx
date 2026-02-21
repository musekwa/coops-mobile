import { View, Text } from 'react-native'
import React from 'react'

import { cn } from 'src/utils/tailwind'

export default function FormFieldPreview({ title, value }: { title: string; value: string }) {
	return (
		<View className="flex flex-row space-x-2 my-2">
			<View className="w-[110px]  justify-center">
				<Text className="text-[12px] text-gray-600 dark:text-gray-400">{title}</Text>
			</View>
			<View
				className={cn('flex-1 min-h-[50px] justify-center bg-gray-50 dark:bg-gray-900 rounded-xl pl-1', {
					'bg-red-200 dark:bg-slate-600': !value,
				})}
			>
				<Text className="text-[14px] text-black dark:text-white">{value}</Text>
			</View>
		</View>
	)
}
