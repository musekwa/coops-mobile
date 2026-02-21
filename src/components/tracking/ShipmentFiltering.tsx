import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import Animated, { SlideInDown } from 'react-native-reanimated'
import { AntDesign } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { SingleChipSelect } from '../chips-list/ChipsList'

type ShipmentFilteringProps = {
	handleConfirmFilter: () => void
	handleFilter: () => void
	filteringOptions: string[]
	setFilteringOptions: (options: string[]) => void
}

export default function ShipmentFiltering({
	handleConfirmFilter,
	handleFilter,
	filteringOptions,
	setFilteringOptions,
}: ShipmentFilteringProps) {
	// const isDarkMode = useColorScheme().colorScheme === 'dark'

	const handleMainOptions = (item: string) => {
		setFilteringOptions([item])
	}

	const handleSecondaryOptions = (item: string) => {
		if (filteringOptions.includes('Chegada confirmada') && item === 'Chegada não confirmada') {
			// remove 'Chegada confirmada' and add 'Chegada não confirmada'
			const newOptions = filteringOptions.filter((option) => option !== 'Chegada confirmada')
			setFilteringOptions([...newOptions, item])
			return
		} else if (filteringOptions.includes('Chegada não confirmada') && item === 'Chegada confirmada') {
			// remove 'Chegada não confirmada' and add 'Chegada confirmada'
			const newOptions = filteringOptions.filter((option) => option !== 'Chegada não confirmada')
			setFilteringOptions([...newOptions, item])
			return
		} else if (filteringOptions.includes(item)) {
			// remove item from the list
			const newOptions = filteringOptions.filter((option) => option !== item)
			setFilteringOptions(newOptions)
		} else {
			// add item to the list
			setFilteringOptions([...filteringOptions, item])
		}
	}

	return (
			<Animated.ScrollView
				contentContainerStyle={{ flex: 1 }}
				entering={SlideInDown.duration(500)}
				className="bg-white dark:bg-black px-3"
			>
				<View className="pt-3" />
				<View className="flex-1">
					<Text className="text-gray-400 text[12px] italic ">Filtre mercadorias transitadas por...</Text>
					<SingleChipSelect
						items={['Entradas', 'Saídas']}
						filteringOptions={filteringOptions}
						onSelectionChange={(item: string) => handleMainOptions(item)}
					/>
				</View>
				<View className="flex-1">
					<Text className="text-gray-400 text[12px] italic ">Pode refinar mais a filtragem de mercadorias por...</Text>
					<SingleChipSelect
						items={['Chegada confirmada', 'Chegada não confirmada']}
						filteringOptions={filteringOptions}
						onSelectionChange={(item) => handleSecondaryOptions(item)}
					/>
				</View>
				<View className="flex flex-row justify-around mb-6">
					<TouchableOpacity
						onPress={handleFilter}
						className="flex flex-row space-x-2 justify-center items-center border border-black dark:border-white rounded-full px-4 py-2 min-w-[120px]"
					>
						<Text className="text-black dark:text-white">Cancelar</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={handleConfirmFilter}
						className="flex flex-row space-x-2 bg-[#008000] border border-[#008000] items-center justify-center rounded-full px-4 py-2 min-w-[120px]"
					>
						<AntDesign name="filter" size={18} color={colors.white} />
						<Text className="text-white">Filtrar</Text>
					</TouchableOpacity>
				</View>
			</Animated.ScrollView>
	)
}
