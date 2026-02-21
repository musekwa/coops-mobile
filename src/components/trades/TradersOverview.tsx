import React, { useEffect, useState } from 'react'
import { GeneratedReportHint, MultiCategory, OverviewItemProps } from 'src/types'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import { colors } from 'src/constants'

type TraderWithMulticategory = {
	multicategory: string | string[]
	[key: string]: any
}

interface TradersOverviewProps {
	activeTraders: TraderWithMulticategory[]
	handleSnapPress: (index: number) => void
	reportHint: string
	setReportHint: (hint: string) => void
	setTradersByType: (tradersByType: {
		primaries: TraderWithMulticategory[]
		secondaries: TraderWithMulticategory[]
		finals: TraderWithMulticategory[]
	}) => void
	tradersByType: {
		primaries: TraderWithMulticategory[]
		secondaries: TraderWithMulticategory[]
		finals: TraderWithMulticategory[]
	} | null
}

const traderCategories = {
	PRIMARY: [MultiCategory.TRADER_PRIMARY] as MultiCategory[],
	SECONDARY: [MultiCategory.TRADER_SECONDARY] as MultiCategory[],
	FINAL: [
		MultiCategory.TRADER_FINAL,
		MultiCategory.TRADER_EXPORT,
		MultiCategory.TRADER_SMALL_SCALE_PROCESSING,
		MultiCategory.TRADER_LARGE_SCALE_PROCESSING,
	] as MultiCategory[],
}

export default function TradersOverview({
	activeTraders,
	handleSnapPress,
	reportHint,
	setReportHint,
	setTradersByType,
	tradersByType,
}: TradersOverviewProps) {
	const [overviewItems, setOverviewItems] = useState<OverviewItemProps[]>([])

	const handleReportPress = () => {
		handleSnapPress(2)
		setReportHint(GeneratedReportHint.TRADERS)
	}

	useEffect(() => {
		if (activeTraders.length > 0) {
			const primaries: TraderWithMulticategory[] = []
			const secondaries: TraderWithMulticategory[] = []
			const finals: TraderWithMulticategory[] = []
			activeTraders.forEach((trader) => {
				const castedTrader = trader as TraderWithMulticategory
				// Handle multicategory as string (from GROUP_CONCAT) or array (for backward compatibility)
				const categories =
					typeof castedTrader.multicategory === 'string'
						? castedTrader.multicategory.split(';').filter((cat: string) => cat.trim() !== '')
						: Array.isArray(castedTrader.multicategory)
							? castedTrader.multicategory
							: []

				if (
					categories.some((category: string | MultiCategory) =>
						traderCategories.PRIMARY.includes(category as MultiCategory),
					)
				) {
					primaries.push(castedTrader)
				} else if (
					categories.some((category: string | MultiCategory) =>
						traderCategories.SECONDARY.includes(category as MultiCategory),
					)
				) {
					secondaries.push(castedTrader)
				} else if (
					categories.some((category: string | MultiCategory) =>
						traderCategories.FINAL.includes(category as MultiCategory),
					)
				) {
					finals.push(castedTrader)
				}
			})
			setTradersByType({ primaries, secondaries, finals })
			setOverviewItems([
				{ title: 'Primários', value: primaries.length },
				{ title: 'Intermediários', value: secondaries.length },
				{ title: 'Finais', value: finals.length },
			])
		} else {
			setTradersByType({
				primaries: [],
				secondaries: [],
				finals: [],
			})
			setOverviewItems([
				{ title: 'Primários', value: 0 },
				{ title: 'Intermediários', value: 0 },
				{ title: 'Finais', value: 0 },
			])
		}
	}, [activeTraders])

	return (
		<View className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 pt-1 my-2">
			<View className="flex-row justify-between items-center">
				<View className="flex-row flex-1 items-center">
					<Text className="text-gray-900 dark:text-gray-100 text-[14px] font-bold">Comerciantes</Text>
				</View>
				<TouchableOpacity
					className="mb-2 flex-row items-center p-2 rounded-full bg-gray-50 dark:bg-gray-800"
					onPress={handleReportPress}
				>
					<Ionicons name="list" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>
			<View className="flex-row justify-between items-center">
				<View className="flex-row w-full flex space-x-2 py-2 justify-between">
					{overviewItems.map((item, index) => (
						<View
							key={index}
							className={`flex-1 p-1 rounded-lg ${
								index === 0
									? 'bg-red-50 dark:bg-gray-900'
									: index === 1
										? 'bg-green-50 dark:bg-gray-900'
										: 'bg-blue-50 dark:bg-gray-900'
							}`}
						>
							<Text className="text-sm text-gray-600 dark:text-gray-300 mb-1 text-center text-[10px]">
								{item.title}
							</Text>
							<Text className="font-bold text-center text-[16px] text-gray-900 dark:text-gray-100">{item.value}</Text>
						</View>
					))}
				</View>
			</View>
		</View>
	)
}
