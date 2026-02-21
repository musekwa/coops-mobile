import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import AddFormalShipment from 'src/components/forms/tracking/AddFormalShipment'
import BackButton from 'src/components/buttons/BackButton'
import { useShipmentOwnerDetailsStore } from 'src/store/shipment/shipment_owner_details'
import { useShipmentReceiverDetailsStore } from 'src/store/tracking/receiverDetails'
import { useTransporterInfoStore } from 'src/store/tracking/transporterInfo'
import { useActionStore } from 'src/store/actions/actions'
import { usePreconditionsStore } from 'src/store/tracking/pre-conditions'
import { useInformalShipmentInfoStore } from 'src/store/tracking/informalShipmentInfo'
import useBackHandler from 'src/hooks/useBackHandler'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import SuccessAlert from 'src/components/dialogs/SuccessAlert'
import { colors } from 'src/constants'
import AddSmuggling from 'src/components/forms/informal-shipment/AddSmuggling'
import { useSmugglerDetailsStore } from 'src/store/tracking/smuggler'
import { useSmuggledLoadDetailsStore } from 'src/store/tracking/smuggled_load'

export default function ShipmentRegistrationScreen() {
	const navigation = useNavigation<any>()
	const { resetShipmentOwnerDetails } = useShipmentOwnerDetailsStore()
	const { resetShipmentReceiverDetails } = useShipmentReceiverDetailsStore()
	const { resetTrailerInfo, resetTransporterInfo } = useTransporterInfoStore()
	const { resetInformalShipmentInfo } = useInformalShipmentInfoStore()
	const { resetSmugglerDetails } = useSmugglerDetailsStore()
	const { resetSmuggledLoadDetails } = useSmuggledLoadDetailsStore()
	const {
		resetCurrentStep,
		currentStep,
		totalSteps,
		setTotalSteps,
		getSuccess,
		setSuccess,
		success,
		nextRoute,
		resetBase64,
		reloading,
	} = useActionStore()
	const { preconditions } = usePreconditionsStore()

	const [message, setMessage] = useState('')
	const [hasError, setHasError] = useState(false)

	const resetAll = () => {
		resetShipmentOwnerDetails()
		resetShipmentReceiverDetails()
		resetTrailerInfo()
		resetTransporterInfo()
		resetInformalShipmentInfo()
		resetSmugglerDetails()
		resetSmuggledLoadDetails()
		resetCurrentStep()
		resetBase64()
	}

	useEffect(() => {
		// set the back button
		navigation.setOptions({
			headerLeft: () => <BackButton route={`/(tabs)/trades/shipments`} callback={resetAll} />,
		})

		// set the total steps based on the preconditions
		if (
			preconditions.subKeys.length > 0 &&
			preconditions.subKeys.find((subKey) => subKey.key === 'hasTransitLicense')?.value
		) {
			setTotalSteps(7)
		} else {
			setTotalSteps(5)
		}
		// set the reloading to true
		// setReloading(true)
	}, [])

	useBackHandler({
		navigationAction: () => navigation.navigate('/(tabs)/trades/shipments'),
		title: 'Descartar Registo?',
		message: 'Tem a certeza de que pretende descartar este registo?',
		okText: 'Descartar',
		cancelText: 'Cancelar',
	})

	useEffect(() => {
		if (getSuccess()) {
			setSuccess(true)
			resetAll()
		}
	}, [getSuccess])

	return (
		<View className="flex-1 bg-white dark:bg-black w-full  justify-center">
			{preconditions.subKeys.find((subKey) => subKey.key === 'hasTransitLicense')?.value ? (
				<AddFormalShipment currentStep={currentStep} totalSteps={totalSteps} />
			) : (
				<AddSmuggling currentStep={currentStep} totalSteps={totalSteps} />
			)}
			<ErrorAlert title="" message={message} visible={hasError} setVisible={setHasError} setMessage={setMessage} />
			<SuccessAlert visible={success} setVisible={setSuccess} route={nextRoute} />
			{reloading && (
				<View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black/30">
					<ActivityIndicator size="large" color={colors.primary} />
				</View>
			)}
		</View>
	)
}
