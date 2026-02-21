import { View, Text } from 'react-native'
import React from 'react'
import { getIntlDate } from 'src/helpers/dates'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { TradingPurpose } from 'src/types'
import { match } from 'ts-pattern'

interface SectionedListItemProps {
	expandedSections: Set<string>
	item: any
	section: any
}

export default function SectionedListItem({ expandedSections, item, section }: SectionedListItemProps) {
		const userData = {}
	const userDistrict = ''
	const isExpanded = expandedSections.has(section.owner.fullName + section.owner.phone)
	if (!isExpanded) return null

	const purpose = match(item.purpose)
		.with(TradingPurpose.INFORMAL_EXPORT, () => 'Exportação informal')
		.with(TradingPurpose.LOCAL, () => 'Consumo local')
		.with(TradingPurpose.RESELLING, () => 'Revenda')
		.with(TradingPurpose.SMALL_SCALE_PROCESSING, () => 'Processamento artesanal')
		.with(TradingPurpose.INFORMAL_PROCESSING, () => 'Processamento informal')
		.otherwise(() => 'Desconhecido')

	const isInternational = item.transitType === 'INTERNATIONAL'
	const isInterDistrict = item.transitType === 'INTERDISTRITAL'
	const isInterProvince = item.transitType === 'INTERPROVINCIAL'

	const isComingIn = item.destinationDistrict === userDistrict
	// const isGoingOut = item.originDistrict === userDistrict

    const priceAtDestination = !!item.priceAtDestination
        ? Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'MZN' }).format(item.priceAtDestination)
        : 'N/A'

	const destination = !!item.destinationDistrict
		? item.destinationDistrict
		: !!item.destinationCountry
			? item.destinationCountry
			: item.destinationProvince

	const labelDescription = isInternational
		? 'Trânsito internacional'
		: isInterDistrict
			? 'Trânsito interdistrital'
			: isInterProvince
				? 'Trânsito interprovincial'
				: 'Desconhecido'

	return (
		<View className={`ml-4 mt-2 flex flex-col border rounded-md p-2 border-slate-300 dark:border-gray-900`}>
			<View className="flex flex-row items-center justify-between space-x-2">
				<View className="flex flex-row items-center space-x-1">
					<Ionicons name={isComingIn ? 'arrow-down' : 'arrow-up'} size={22} color={isComingIn ? 'green' : colors.red} />
					<View className="flex flex-col space-y-1">
						<Text className="text-black dark:text-white font-bold text-[12px]">{labelDescription}</Text>
						<Text className="text-black dark:text-white font-normal text-[12px]">
							{item.originDistrict} - {destination}
						</Text>
						<Text className="text-black dark:text-white font-normal text-[12px]">{purpose}</Text>
					</View>
				</View>
				<View>
					<View className="flex flex-row items-center space-x-1 rounded-full border border-slate-300 dark:border-gray-900 p-2 bg-gray-50 dark:bg-gray-900">
						<Text className="text-black dark:text-white font-bold text-[14px]">
							{Intl.NumberFormat('pt-BR').format(item.quantity)}
						</Text>
						<Text className="text-black dark:text-white font-normal text-[12px]">{item.unit}</Text>
					</View>
					{!!item.priceAtDestination && (
						<View className="border-b-2 my-2">
							<Text className="text-right font-bold">
								{priceAtDestination}
							</Text>
						</View>
					)}
				</View>
			</View>

			<Text className="text-black dark:text-white font-normal italic text-[10px] text-right">
				{getIntlDate(item.createdAt)}
			</Text>
			<Text className="text-black dark:text-white font-normal italic text-[10px] text-right">
				Interceptado em {item.registeredIn} por {item.registeredBy}
			</Text>
		</View>
	)
}
