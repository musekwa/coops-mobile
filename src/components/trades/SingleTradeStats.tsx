import clsx from 'clsx'
import React from 'react'
import { Text, View } from 'react-native'

interface SingleTradeStatsProps {
	label: string
	value: number | string
	containerClassName?: string
	valueClassName?: string
	labelClassName?: string
	icon?: React.ReactNode
}

const SingleTradeStats = ({
	label,
	value,
	containerClassName,
	valueClassName,
	labelClassName,
	icon,
}: SingleTradeStatsProps) => {
	return (
		<View className={clsx('flex-col justify-between items-center', containerClassName)}>
			{icon}
			<Text className={clsx('text-2xl font-bold text-[#008000] -mb-0.5', valueClassName)} numberOfLines={1}>
				{value}
			</Text>
			<Text
				className={clsx('text-[10px] text-gray-500 dark:text-gray-400 italic -mt-0.5', labelClassName)}
				numberOfLines={1}
			>
				{label}
			</Text>
		</View>
	)
}

export default SingleTradeStats
