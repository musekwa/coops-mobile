import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Href, useRouter } from 'expo-router'
import * as Animatable from 'react-native-animatable'
import { getTimeElapsedSinceRegistration } from 'src/helpers/dates'
import { WarehouseGroup, Warehouse } from 'src/features/trades/data/types'
import { Divider } from 'react-native-paper'

interface CashewWarehouseSectionedListItemProps {
	index: number
	item: Warehouse
	section: WarehouseGroup
	expandedSections: Set<string>
	lastVisitedAt: string
	currentStock: number
}

export default function CashewWarehouseSectionedListItem({
	item,
	section,
	index,
	expandedSections,
	lastVisitedAt,
	currentStock,
}: CashewWarehouseSectionedListItemProps) {
	const router = useRouter()
	const isExpanded = expandedSections.has(section.owner.name)

	if (!isExpanded) return null

	const href = `/(aux)/trades/cashew-warehouses/transactions?warehouseId=${item.id}` as Href

	const location =
		item.village_name !== 'N/A'
			? `${item.village_name} - ${item.admin_post_name}`
			: item.admin_post_name !== 'N/A'
				? `${item.admin_post_name}`
				: 'N/A'

	return (
		<TouchableOpacity
			activeOpacity={0.5}
			onPress={() => router.push(href)}
			className={`ml-4 mb-2 flex flex-row border rounded-md p-2 border-slate-300 dark:border-gray-900 w-full ${item.is_active === 'false' ? 'opacity-20' : ''}`}
		>
			<View className="">
				<View className="flex flex-col space-y-2">
					<View className="flex flex-row items-center justify-between space-x-2">
						<View>
							<Text className="text-black dark:text-white font-bold text-[12px]">
								{index + 1}. {location}
							</Text>
							{/* <Text
								className="text-gray-600 dark:text-gray-400 italic text-[10px]"
								ellipsizeMode="tail"
								numberOfLines={1}
							>
								{item.description.split('-')[1].trim()}
							</Text> */}
						</View>
						<Animatable.View
							animation="tada"
							iterationCount="infinite"
							className={`w-2 h-2 rounded-full ${item.is_active === 'true' ? 'bg-green-500' : 'bg-red-500'}`}
						/>
					</View>
				</View>
				<View>
					<Text className="text-gray-600 dark:text-gray-400 italic text-[10px]" ellipsizeMode="tail" numberOfLines={1}>
						{item.description?.split('-')[0].trim()}
					</Text>
				</View>
				<Divider />
				{lastVisitedAt ? (
					<View className="flex flex-row justify-between space-x-2">
						<View className="w-[45%] flex flex-row space-x-1 items-center">
							<Text className="text-gray-600 dark:text-gray-400 text-[10px]">Estoque:</Text>
							<Text className="text-[#008000] font-bold text-[12px]">
								{Intl.NumberFormat('pt-BR').format(currentStock)}
							</Text>
							<Text className="text-gray-600 dark:text-gray-400 text-[10px]">Kg.</Text>
						</View>
						<View className="w-[45%]">
							<Text className="text-right text-gray-600 dark:text-gray-400 pt-2 text-[10px] italic">
								Visitado há {getTimeElapsedSinceRegistration(new Date(lastVisitedAt))}
							</Text>
						</View>
					</View>
				) : (
					<View className="flex flex-row justify-between space-x-2">
						<View className="w-[45%] flex flex-row space-x-1 items-center">
							<Text className="text-gray-600 dark:text-gray-400 text-[10px]">Estoque:</Text>
							<Text className="text-[#008000] font-bold text-[12px]">
								{Intl.NumberFormat('pt-BR').format(currentStock)}
							</Text>
							<Text className="text-gray-600 dark:text-gray-400 text-[10px]">Kg.</Text>
						</View>
						<View className="w-[45%]">
							<Text className="text-red-500 pt-2 text-[10px] italic text-right">Nunca visitado</Text>
						</View>
					</View>
				)}
			</View>
		</TouchableOpacity>
	)
}
