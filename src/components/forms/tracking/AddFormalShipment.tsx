
import React from 'react'
import { View, Dimensions } from 'react-native'

// Components
import FormStepIndicator from 'src/components/tracking/FormStepIndicator'
import PreviewAddedShipmentInfo from 'src/components/tracking/PreviewAddedShipmentInfo'

import AddLicenseInfo from 'src/components/forms/tracking/AddLicenseInfo'
import AddOwner from 'src/components/forms/tracking/AddOwner'
import AddShipmentCarInfo from 'src/components/forms/tracking/AddShipmentCarInfo'
import AddDriverInfo from './AddDriverInfo'
import AddShipmentLoads from './AddShipmentLoads'
import AddDestination from './AddDestination'

interface AddFormalShipmentProps {
	currentStep: number
	totalSteps: number
}

export default function AddFormalShipment({ currentStep, totalSteps }: AddFormalShipmentProps) {
	const { width } = Dimensions.get('window')
	const barWidth = (width - 5 * 8) / totalSteps


	return (
		<View className="flex-1 bg-white dark:bg-black w-full  justify-center">
			{/* Form Step Indicator */}
			<FormStepIndicator barWidth={barWidth} totalSteps={totalSteps} currentStep={currentStep} />

			{/* Add License Info */}
			{currentStep === 0 && <AddLicenseInfo />}

			{/* Add Destination */}
			{currentStep === 1 && <AddDestination />}

			{/* Add the goods owner */}
			{currentStep === 2 && <AddOwner />}

			{/* Add Driver info */}
			{currentStep === 3 && <AddDriverInfo />}

			{/* Transporter info */}
			{currentStep === 4 && <AddShipmentCarInfo />}

			{/* Add Shipment Loads */}
			{currentStep === 5 && <AddShipmentLoads />}

			{/* Origin */}
			{currentStep === 6 && <PreviewAddedShipmentInfo totalSteps={4} />}
		</View>
	)
}
