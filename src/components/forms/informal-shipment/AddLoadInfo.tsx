// React & React Native imports
import { View, Text } from 'react-native'

// Third party imports
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Components
import FormWrapper from '../FormWrapper'
import NextAndPreviousButtons from 'src/components/buttons/NextAndPreviousButtons'
import Label from '../Label'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import FormItemDescription from '../FormItemDescription'
import { CustomPicker } from 'src/components/custom-select-item/CustomPicker'

// Constants
import { TransitType, TransportTypes } from 'src/constants/tracking'

// Helpers
import { transportTypeToPortuguese } from 'src/helpers/translate'

// Store
import { useActionStore } from 'src/store/actions/actions'
import { useInformalShipmentInfoStore } from 'src/store/tracking/informalShipmentInfo'
import { useSmuggledLoadDetailsStore } from 'src/store/tracking/smuggled_load'
import { TradingPurpose } from 'src/types'
import { useEffect } from 'react'

// Constants

const LoadInfoSchema = z.object({
	quantity: z.number().min(1),
	transportType: z.string().min(1),
})

type LoadInfoFormData = z.infer<typeof LoadInfoSchema>

export default function AddLoadInfo() {
	const { currentStep, setCurrentStep, totalSteps } = useActionStore()
	const { informalShipmentInfo } = useInformalShipmentInfoStore()
	const { setSmuggledLoadDetails } = useSmuggledLoadDetailsStore()
	const isInterDistrict = informalShipmentInfo.transitType === TransitType.INTERDISTRITAL
	const isInterProvince = informalShipmentInfo.transitType === TransitType.INTERPROVINCIAL

	const purpose = informalShipmentInfo.purpose
	const isForExport = purpose === TradingPurpose.INFORMAL_EXPORT
	const isForReselling = purpose === TradingPurpose.RESELLING

	const destination = isInterDistrict
		? 'no distrito de destino'
		: isInterProvince
			? 'na província de destino'
			: 'no país de destino'

	const { control, setValue, watch } = useForm<LoadInfoFormData>({
		defaultValues: {
			quantity: 0,
			transportType: '',
		},
		resolver: zodResolver(LoadInfoSchema),
	})

	const quantityValue = watch('quantity')
	const transportTypeValue = watch('transportType')

	const handlePreviousStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleNextStep = () => {
		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1)
			setSmuggledLoadDetails({
				quantity: quantityValue,
				transportType: transportTypeValue,
			})
		}
	}

	const isFormValid = () => {
		const quantity = quantityValue > 0
		const transportType = transportTypeValue.length > 0
		return quantity && transportType
	}


	return (
		<View className="flex-1">
			<FormWrapper>
				<View>
					<Controller
						control={control}
						name="quantity"
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<View>
								<CustomTextInput
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									placeholder="Indica a quantidade (kg.)"
									label="Quantidade (kg.)"
									keyboardType="numeric"
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : (
									<FormItemDescription description="Indica a quantidade da castanha em kg." />
								)}
							</View>
						)}
					/>
				</View>

				<View>
					<Label label="Tipo de transporte" />
					<Controller
						control={control}
						name="transportType"
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<View>
								<CustomPicker
									value={value}
									setValue={onChange}
									placeholder={{ label: 'Indica o tipo de transporte', value: null }}
									items={Object.values(TransportTypes).map((type) => transportTypeToPortuguese(type))}
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : (
									<FormItemDescription description="Indica o tipo de transporte" />
								)}
							</View>
						)}
					/>
				</View>
			</FormWrapper>
			<NextAndPreviousButtons
				// currentStep={currentStep}
				handlePreviousStep={handlePreviousStep}
				handleNextStep={handleNextStep}
				showPreviousButton={currentStep > 0}
				showNextButton={currentStep < totalSteps - 1}
				nextButtonDisabled={!isFormValid()}
				previousButtonDisabled={currentStep === 0}
			/>
		</View>
	)
}
