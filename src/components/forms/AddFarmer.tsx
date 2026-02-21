import React, { useEffect } from 'react'
import AddIndividualFarmer from '../farmers/AddIndividualFarmer'
import { useFarmerStore } from 'src/store/farmer'
import CustomSafeAreaView from '../layouts/safe-area-view'

export default function AddFarmerForm() {
	const { resetFormData } = useFarmerStore()

	useEffect(() => {
		// reset the form
		resetFormData()
	}, [])

	return (
		<CustomSafeAreaView edges={['bottom']}>
			<AddIndividualFarmer />
		</CustomSafeAreaView>
	)
}
