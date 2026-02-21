// React and React Native imports
import { useState } from 'react'
import { View, useWindowDimensions } from 'react-native'

// Components
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import FormStepIndicator from 'src/components/tracking/FormStepIndicator'
import SuccessAlert from 'src/components/dialogs/SuccessAlert'

// Local components
// import AddInformalShipmentMarchandiseInfo from './AddInformalShipmentMarchandiseInfo'
// import AddInformalShipmentOriginAndDestination from './AddInformalShipmentOriginAndDestination'
// import AddOrSelectInformalTrader from './AddSmuggler'
// import SearchByPhoneOrName from './SearchByPhoneOrName'

// Types
// import { InformalTraderFormDataType } from 'src/store/informalTrader'
import PreviewAddedInformalShipmentInfo from 'src/components/informal-shipment/PreviewSmugglingInfo'
import AddInformalShipmentMarchandiseInfo from './AddLoadInfo'
import AddInformalShipmentOriginOrDestination from './AddSmugglingFlow'
// import SearchSmugglerByPhoneOrName from './SearchSmuggler'
import AddSmugglerInfo from './AddSmugglerInfo'
import SearchSmuggler from './SearchSmuggler'
import AddSmugglingFlow from './AddSmugglingFlow'
import AddLoadInfo from './AddLoadInfo'
// import { InformalSmugglerFormDataType } from 'src/store/informalSmuggler'

interface AddSmugglingProps {
	currentStep: number
	totalSteps: number
}

export default function AddSmuggling({ currentStep, totalSteps }: AddSmugglingProps) {
	const { width } = useWindowDimensions()
	const barWidth = (width - 5 * 8) / totalSteps
	const [hasError, setHasError] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string>('')
	const [success, setSuccess] = useState<boolean>(false)
	const [searchInformalSmugglerByPhoneCount, setSearchInformalSmugglerByPhoneCount] = useState<number>(0)
	const [searchInformalSmugglerByNameCount, setSearchInformalSmugglerByNameCount] = useState<number>(0)
	// const [informalSmugglers, setInformalSmugglers] = useState<InformalSmugglerFormDataType[]>([])

	return (
		<View className="flex-1 bg-white dark:bg-black w-full  justify-center">
			<FormStepIndicator barWidth={barWidth} totalSteps={totalSteps} currentStep={currentStep} />

			{currentStep === 0 && <SearchSmuggler />}
			{currentStep === 1 && (
				<AddSmugglerInfo
					hasError={hasError}
					setHasError={setHasError}
					errorMessage={errorMessage}
					setErrorMessage={setErrorMessage}
				/>
			)}
			{currentStep === 2 && <AddSmugglingFlow />}
			{currentStep === 3 && <AddLoadInfo />}

			{currentStep === 4 && <PreviewAddedInformalShipmentInfo totalSteps={totalSteps} />}

			<ErrorAlert
				visible={hasError}
				setVisible={setHasError}
				message={errorMessage}
				setMessage={setErrorMessage}
				title="Erro"
			/>
			<SuccessAlert visible={success} setVisible={setSuccess} route="" noAction={true} />
		</View>
	)
}
