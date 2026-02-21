import { View } from 'react-native'
import React, { useState, useEffect } from 'react'
import AddIndividualFarmer from '../farmers/AddIndividualFarmer'
import AddCompanyFarmer from '../farmers/AddCompanyFarmer'
import { useFarmerStore } from 'src/store/farmer'
import RadioButton from '../buttons/RadioButton'
import CustomSafeAreaView from '../layouts/safe-area-view'

export default function AddFarmerForm() {
	const [isCompany, setIsCompany] = useState(false)
	const { resetFormData } = useFarmerStore()

	useEffect(() => {
		// reset the form
		resetFormData()
	}, [])

	return (
		<CustomSafeAreaView>
			<View className="flex-1">
				<View className="flex flex-row justify-around space-x-4 w-full px-4 pb-4">
					<View>
						<RadioButton label="Entidade" value="company" checked={isCompany} onChange={() => setIsCompany(true)} />
					</View>
					<View>
						<RadioButton
							label="Singular"
							value="individual"
							checked={!isCompany}
							onChange={() => setIsCompany(false)}
						/>
					</View>
				</View>

				{/* Add individual farmer */}
				{!isCompany && (
					<View key="individual-farmer" className="flex-1">
						<AddIndividualFarmer />
					</View>
				)}

				{/* Add company farmer */}
				{isCompany && (
					<View key="company-farmer" className="flex-1">
						<AddCompanyFarmer />
					</View>
				)}
			</View>
		</CustomSafeAreaView>
	)
}
