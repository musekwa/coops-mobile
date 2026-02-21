import { View } from 'react-native'
import React, { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Components
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import NextAndPreviousButtons from 'src/components/buttons/NextAndPreviousButtons'
import FormWrapper from '../FormWrapper'

// Hooks & Utils
import { useActionStore } from 'src/store/actions/actions'
import SelectAddress from 'src/custom-ui/select-address'
import { AddressLevel } from 'src/types'
import { useAddressStore } from 'src/store/address'

const DestinationSchema = z.object({})

type DestinationFormData = z.infer<typeof DestinationSchema>

export default function AddDestination() {

	const { currentStep, setCurrentStep, totalSteps } = useActionStore()
	const {
		fullAddress: { districtId, provinceId, adminPostId, villageId },
	} = useAddressStore()

	const [hasError, setHasError] = useState(false)
	const [message, setMessage] = useState('')

	const {
		control,
		formState: { errors },
	} = useForm<DestinationFormData>({
		defaultValues: {},
		resolver: zodResolver(DestinationSchema),
	})

	const handleNextStep = () => {
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handlePreviousStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1)
		}
	}

	return (
		<View className="flex-1">
			<FormWrapper>
				<View className="py-4">
					<SelectAddress
						control={control}
						errors={errors}
						customErrors={errors}
						clearFieldError={() => {}}
						addressLevel={AddressLevel.FROM_PROVINCES}
						description="Destino da Mercadoria"
					/>
				</View>
			</FormWrapper>

			<NextAndPreviousButtons
				// currentStep={currentStep}
				handlePreviousStep={handlePreviousStep}
				handleNextStep={handleNextStep}
				nextButtonDisabled={!districtId || !provinceId || !adminPostId || !villageId}
				previousButtonDisabled={currentStep === 0}
				showPreviousButton={true}
			/>

			<ErrorAlert title="" visible={hasError} message={message} setVisible={setHasError} setMessage={setMessage} />
		</View>
	)
}
