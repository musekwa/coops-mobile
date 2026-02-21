import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useColorScheme } from 'nativewind'
import * as Animatable from 'react-native-animatable'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { colors } from 'src/constants'
import { useSavedWarehouseStore } from 'src/store/warehouse/savedWarehouse'
import { getCurrentStock } from 'src/helpers/helpersToTrades'
import CurrentStock from './CurrentStock'
import Label from '../forms/Label'

type CashewWarehouseProps = {
	warehouse: any
	label: string
	index: number
	traderId: string
}

export default function CashewWarehouseItem({ warehouse, label, index, traderId }: CashewWarehouseProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const { province, district, adminPost, village } = warehouse
	const router = useRouter()
	const [currentStock, setCurrentStock] = useState(0)

	// get the workers assigned to the warehouse
	const workers: any[] = []

	// combine the address into a single string:
	// province, district, and adminPost
	// if any of the fields is empty or 'N/A', ignore it
	// if the village is not empty, add it to the address
	const address = [province, district, adminPost, village]
		.filter((item) => item && item !== 'N/A')
		.reverse()
		.join(', ')

	useEffect(() => {
		// 1. each transaction has a quantity and flow properties
		// 2. flow is either 'BOUGHT', 'SOLD', 'TRANSFERRED_IN', 'TRANSFERRED_OUT',
		// 3. sum up the quantities based on the flow
		const currentStock = getCurrentStock(warehouse.transactions as any[])
		setCurrentStock(currentStock)
	}, [warehouse])

	return (
		<TouchableOpacity
			onPress={() => {
				// if the workers array is empty, navigate to the add workers screen
				if (workers && workers.length === 0) {
					// router.push(`/(aux)/actors/workers/registration?ownerId=${traderId}&resourceId=${warehouse._id}`)
				} else {
					// router.push(`/(aux)/trades/cashew-warehouses/${warehouse._id}`)
				}
			}}
			className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 mr-4 w-80 h-34 border border-slate-200 dark:border-slate-700`}
		>
			<View className={`${!warehouse.isActive ? 'opacity-20' : ''}`}>
				<View className="flex-1">
					<View className="flex-row justify-between items-center">
						<View className="flex-row items-center">
							<Label label={`${label} ${index + 1}`} />
						</View>
					</View>

					<Text className="text-[12px] text-gray-600 dark:text-gray-300" numberOfLines={2}>
						{address}
					</Text>

					<CurrentStock label="Estoque Disponível" currentStock={currentStock} />

					<View className="flex-row justify-between items-center mt-2">
						{workers && workers.length > 0 ? (
							<View className="flex-row items-center">
								<Ionicons name="people" size={16} color={isDarkMode ? colors.slate300 : colors.gray600} />
								<Text className="text-sm text-gray-600 dark:text-gray-300 ml-1">{workers.length}</Text>
								{workers && workers.length > 0 && (
									<View className="flex-row -space-x-2">
										{workers.slice(0, 3).map((worker) => (
											<Image
												key={worker._id}
												source={{ uri: worker.photo ? worker.photo : avatarPlaceholderUri }}
												style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: 'white' }}
											/>
										))}
										{workers.length > 3 && (
											<View className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 items-center justify-center">
												<Text className="text-xs text-gray-600 dark:text-gray-300">+{workers.length - 3}</Text>
											</View>
										)}
									</View>
								)}
							</View>
						) : (
							<View className="flex-row items-center">
								<Ionicons name="person-add" size={16} color={colors.red} />
								<Text className="text-sm text-red-500 ml-1">Adicionar Trabalhador</Text>
							</View>
						)}
					</View>
				</View>
			</View>
			{!warehouse?.isActive && (
				<View className="absolute top-0  right-5 flex flex-row items-center space-x-1">
					<Ionicons name="lock-closed-outline" color={colors.red} size={15} />
					<Text className="text-red-500 font-bold text-[12px]">Encerrado</Text>
				</View>
			)}
		</TouchableOpacity>
	)
}
