import { View } from 'react-native'
import React, { useState } from 'react'
import Animated, { SlideInLeft, SlideOutRight } from 'react-native-reanimated'
import AddInvidualTrader from '../traders/AddInvidualTrader'
import AddCompanyTrader from '../traders/AddCompanyTrader'
import { match } from 'ts-pattern'
import { TradingPurpose } from 'src/types'
import RadioButton from '../buttons/RadioButton'

export default function AddTraderForm() {
	const [isCompany, setIsCompany] = useState(false)
	const [proceed, setProceed] = useState(false)

	const handleChipSelection = (selectedItems: string[], cb: (list: string[]) => void) => {
		const purposes = selectedItems.map((item) => {
			return match(item)
				.with('Exportação', () => TradingPurpose.EXPORT)
				.with('Processamento Artesanal', () => TradingPurpose.SMALL_SCALE_PROCESSING)
				.with('Processamento Industrial', () => TradingPurpose.LARGE_SCALE_PROCESSING)
				.with('Compra e Venda', () => TradingPurpose.RESELLING)
				.otherwise(() => TradingPurpose.LOCAL)
		})

		cb(purposes)
	}

	return (
		<Animated.View
			entering={SlideInLeft.duration(500)}
			exiting={SlideOutRight}
			className="flex-1 w-full space-y-4 bg-white dark:bg-black"
		>
			<View className="flex flex-row  justify-around space-x-4 w-full">
				<View>
					<RadioButton label="Empresa" value="company" checked={isCompany} onChange={() => setIsCompany(true)} />
				</View>
				<View>
					<RadioButton label="Singular" value="individual" checked={!isCompany} onChange={() => setIsCompany(false)} />
				</View>
			</View>

			{/* Add individual trader */}
			{!isCompany && (
				<AddInvidualTrader handleChipSelection={handleChipSelection} setProceed={setProceed} proceed={proceed} />
			)}

			{/* Add Company */}
			{isCompany && (
				<AddCompanyTrader handleChipSelection={handleChipSelection} setProceed={setProceed} proceed={proceed} />
			)}
		</Animated.View>
	)
}
