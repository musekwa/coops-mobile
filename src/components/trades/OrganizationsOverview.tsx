import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { ActorOrganization } from 'src/models/actorOrganization'
import {  GeneratedReportHint, OrganizationTypes, OverviewItemProps } from 'src/types'
import { TouchableOpacity } from 'react-native'

interface TradersOverviewProps {
	orgs: ActorOrganization[]
	handleSnapPress: (index: number) => void
	reportHint: string
	setReportHint: (hint: string) => void
	setOrgsByType: (orgsByType: {
		associations: ActorOrganization[]
		cooperatives: ActorOrganization[]
		coop_unions: ActorOrganization[]
	}) => void
}

export default function OrganizationsOverview({ orgs, handleSnapPress, reportHint, setReportHint, setOrgsByType }: TradersOverviewProps) {
	const [overviewItems, setOverviewItems] = useState<OverviewItemProps[]>([])

	const handleReportPress = () => {
		setReportHint(GeneratedReportHint.ORGANIZATIONS)
		handleSnapPress(2)
	}

	useEffect(() => {
		if (orgs.length > 0) {
			const associations: ActorOrganization[] = []
			const cooperatives: ActorOrganization[] = []
			const coop_unions: ActorOrganization[] = []
			orgs.forEach((org) => {
				const castedWarehouse = org as unknown as ActorOrganization
				if (castedWarehouse.organizationType === OrganizationTypes.ASSOCIATION) {
					associations.push(castedWarehouse)
				} else if (castedWarehouse.organizationType === OrganizationTypes.COOPERATIVE) {
					cooperatives.push(castedWarehouse)
				} else if (castedWarehouse.organizationType === OrganizationTypes.COOP_UNION) {
					coop_unions.push(castedWarehouse)
				}
			})
			setOrgsByType({ associations, cooperatives, coop_unions })
			setOverviewItems([
				{ title: 'Associações', value: associations.length },
				{ title: 'Cooperativas', value: cooperatives.length },
				{ title: 'Uniões', value: coop_unions.length },
			])
		} else {
			setOrgsByType({
				associations: [],
				cooperatives: [],
				coop_unions: [],
			})
			setOverviewItems([
				{ title: 'Associações', value: 0 },
				{ title: 'Cooperativas', value: 0 },
				{ title: 'Uniões', value: 0 },
			])
		}
	}, [orgs])


	return (
		<View className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 pt-1 my-2">
			<View className="flex-row justify-between items-center">
				<View className="flex-row flex-1 items-center">
					<Text className="text-gray-900 dark:text-gray-100 text-[14px] font-bold">Grupos</Text>
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
									? 'bg-gray-50 dark:bg-gray-900'
									: index === 1
										? 'bg-gray-50 dark:bg-gray-900'
										: 'bg-gray-50 dark:bg-gray-900'
							}`}
						>
							<Text className="text-sm leading-3 text-gray-600 dark:text-gray-300 mb-1 text-center text-[10px]">
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
