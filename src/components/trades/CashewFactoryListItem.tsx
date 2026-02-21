import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useColorScheme } from 'nativewind'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import { colors } from 'src/constants'
import CurrentStock from './CurrentStock'
import { capitalize } from 'lodash'
import Label from '../forms/Label'

type CashewFactoryProps = {
	factory: any
	label: string
	index: number
	traderId: string
}

export default function CashewFactoryListItem({ factory, label, index, traderId }: CashewFactoryProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const { province, district, adminPost, village } = factory
	const router = useRouter()
	const [currentStock, setCurrentStock] = useState(0)
	const factoryName = capitalize(factory.name)

	// get the workers assigned to the warehouse
	const workers = []

	// combine the address into a single string:
	// province, district, and adminPost
	// if any of the fields is empty or 'N/A', ignore it
	// if the village is not empty, add it to the address
	const address = [province, district, adminPost, village]
		.filter((item) => item && item !== 'N/A')
		.reverse()
		.join(', ')

	return (
		<TouchableOpacity
			onPress={() => {
				// router.push(`/(aux)/trades/cashew-factories/${factory._id}`)
			}}
			className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 mr-4 w-80 h-34 border border-slate-200 dark:border-slate-700`}
		>
			<View className={`${!factory.isActive ? 'opacity-20' : ''}`}>
				<View className="flex-1">
					<View className="flex-row justify-between items-center">
						<View className="flex-row items-center">
							<Label label={factoryName} />
						</View>
					</View>

					<Text className="text-[12px] text-gray-600 dark:text-gray-300" numberOfLines={2}>
						{address}
					</Text>

					<CurrentStock label="Estoque Disponível" currentStock={currentStock} />
				</View>
			</View>
			{!factory?.isActive && (
				<View className="absolute top-0  right-5 flex flex-row items-center space-x-1">
					<Ionicons name="lock-closed-outline" color={colors.red} size={15} />
					<Text className="text-red-500 font-bold text-[12px]">Encerrado</Text>
				</View>
			)}
		</TouchableOpacity>
	)
}
