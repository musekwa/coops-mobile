import { View, Text } from 'react-native'
import React, { useEffect, useCallback, useMemo } from 'react'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { z } from 'zod'

import NextAndPreviousButtons from 'src/components/buttons/NextAndPreviousButtons'
import Label from '../Label'
import FormItemDescription from '../FormItemDescription'
import { useActionStore } from 'src/store/actions/actions'
import FormWrapper from '../FormWrapper'
import { useShipmentCarStore } from 'src/store/shipment/shipment_car'
import RadioButton from 'src/components/buttons/RadioButton'
import { useShipmentLoadStore, LoadInfoType } from 'src/store/shipment/shipment_load'
import { useTrailerPlateNumberStore } from 'src/store/shipment/trailer_plate_numbers'
import { hasTrailer } from 'src/data/car_types'

// Schema for load information validation
const LoadInfoSchema = z.object({
	productType: z.string().min(1, 'Selecione o tipo de produto'),
	numberOfBags: z
		.number({
			message: 'Indica o número de sacos',
		})
		.int({
			message: 'Indica o número de sacos',
		})
		.positive({
			message: 'Indica o número de sacos',
		}),
	bagWeight: z
		.number({ message: 'Indica capacidade do saco em Kg' })
		.positive('Peso deve ser positivo')
		.max(120, 'Peso máximo é 120 kg'),
})

type LoadInfoFormData = z.infer<typeof LoadInfoSchema>

// Types for component props
interface LoadInfoInputsProps {
	plateNumber: string
	title: string
	loadInfo: any
	onLoadChange: (value: string | number, key: keyof LoadInfoType) => void
	index?: number
}

interface ProductTypeSelectorProps {
	loadInfo: any
	onLoadChange: (value: string | number, key: keyof LoadInfoType) => void
}

interface LoadDetailsInputsProps {
	loadInfo: any
	onLoadChange: (value: string | number, key: keyof LoadInfoType) => void
}

// Component for product type selection
const ProductTypeSelector: React.FC<ProductTypeSelectorProps> = ({ loadInfo, onLoadChange }) => (
	<View className="flex-col">
		<Label label="Tipo de carga" />
		<RadioButton
			label="Castanha de caju"
			checked={loadInfo.productType === 'CASHEW_NUT'}
			value="CASHEW_NUT"
			onChange={() => onLoadChange('CASHEW_NUT', 'productType')}
		/>
		<RadioButton
			label="Amêndoa de caju"
			checked={loadInfo.productType === 'CASHEW_KERNEL'}
			value="CASHEW_KERNEL"
			onChange={() => onLoadChange('CASHEW_KERNEL', 'productType')}
		/>
	</View>
)

// Component for load details inputs (number of bags and bag weight)
const LoadDetailsInputs: React.FC<LoadDetailsInputsProps> = ({ loadInfo, onLoadChange }) => (
	<View className="flex-row space-x-2">
		<View className="flex-1">
			<Label label="Número de sacos" />
			<CustomTextInput
				label=""
				value={loadInfo.numberOfBags?.toString() || ''}
				keyboardType="numeric"
				onChangeText={(text) => {
					const numValue = parseInt(text) || 0
					onLoadChange(numValue, 'numberOfBags')
				}}
				placeholder="Número de sacos"
			/>
		</View>
		<View className="flex-1">
			<Label label="Peso do saco (Kg)" />
			<CustomTextInput
				label=""
				value={loadInfo.bagWeight?.toString() || ''}
				keyboardType="numeric"
				onChangeText={(text) => {
					const numValue = parseFloat(text) || 0
					// Limit weight to maximum 120 kg
					const limitedValue = Math.min(numValue, 120)
					onLoadChange(limitedValue, 'bagWeight')
				}}
				placeholder="Peso do saco (máx. 120 kg)"
			/>
		</View>
	</View>
)

// Component for rendering load information inputs
const LoadInfoInputs: React.FC<LoadInfoInputsProps> = ({ plateNumber, title, loadInfo, onLoadChange }) => (
	<View className="flex-col space-y-2 border p-4 rounded-md border-gray-300 dark:border-gray-700 mb-4">
		<Text className="text-sm text-[#008000] font-bold">{title}</Text>
		<View className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md mb-2">
			<Text className="text-sm font-mono text-gray-800 dark:text-gray-200 text-center">{plateNumber}</Text>
		</View>

		<ProductTypeSelector loadInfo={loadInfo} onLoadChange={onLoadChange} />
		<LoadDetailsInputs loadInfo={loadInfo} onLoadChange={onLoadChange} />
	</View>
)

// Hook for managing shipment loads logic
const useShipmentLoadsLogic = () => {
	const { currentStep, setCurrentStep, totalSteps } = useActionStore()
	const { shipmentCarInfo } = useShipmentCarStore()
	const { shipmentLoadInfo, setTruckLoadInfo, setTrailerLoadInfo, initializeTrailerLoads, validateLoadInfo } =
		useShipmentLoadStore()
	const { trailerPlateNumbers } = useTrailerPlateNumberStore()

	// Initialize trailer loads when component mounts or when number of trailers changes
	useEffect(() => {
		// Set truck plate number
		const truckPlate =
			`${shipmentCarInfo.firstPartPlate} ${shipmentCarInfo.secondPartPlate} ${shipmentCarInfo.thirdPartPlate}`.trim()
		if (truckPlate && truckPlate !== '') {
			setTruckLoadInfo(truckPlate, 'plateNumber')
		}

		// Initialize trailer loads
		if (hasTrailer(shipmentCarInfo.carType) && shipmentCarInfo.numberOfTrailers) {
			const numTrailers = parseInt(shipmentCarInfo.numberOfTrailers)
			if (numTrailers > 0) {
				initializeTrailerLoads(numTrailers, trailerPlateNumbers)
			}
		}
	}, [
		shipmentCarInfo.firstPartPlate,
		shipmentCarInfo.secondPartPlate,
		shipmentCarInfo.thirdPartPlate,
		shipmentCarInfo.carType,
		shipmentCarInfo.numberOfTrailers,
		initializeTrailerLoads,
		setTruckLoadInfo,
		trailerPlateNumbers,
	])

	const handlePreviousStep = useCallback(() => {
		setCurrentStep(currentStep - 1)
	}, [currentStep, setCurrentStep])

	const handleNextStep = useCallback(() => {
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1)
		}
	}, [currentStep, totalSteps, setCurrentStep])

	const carPlateNumber = useMemo(
		() => `${shipmentCarInfo.firstPartPlate} ${shipmentCarInfo.secondPartPlate} ${shipmentCarInfo.thirdPartPlate}`,
		[shipmentCarInfo.firstPartPlate, shipmentCarInfo.secondPartPlate, shipmentCarInfo.thirdPartPlate],
	)

	const isFormValid = useCallback(() => {
		const validation = validateLoadInfo()
		return !validation.isValid
	}, [validateLoadInfo])

	// Memoized change handlers to prevent unnecessary re-renders
	const handleTruckLoadChange = useCallback(
		(value: string | number, key: keyof LoadInfoType) => {
			setTruckLoadInfo(value, key)
		},
		[setTruckLoadInfo],
	)

	const handleTrailerLoadChange = useCallback(
		(index: number, value: string | number, key: keyof LoadInfoType) => {
			setTrailerLoadInfo(index, value, key)
		},
		[setTrailerLoadInfo],
	)

	return {
		currentStep,
		carPlateNumber,
		shipmentLoadInfo,
		trailerPlateNumbers,
		shipmentCarInfo,
		handlePreviousStep,
		handleNextStep,
		isFormValid,
		handleTruckLoadChange,
		handleTrailerLoadChange,
	}
}

// Component for rendering trailer loads
const TrailerLoadsSection: React.FC<{
	shipmentCarInfo: any
	trailerPlateNumbers: string[]
	shipmentLoadInfo: any
	handleTrailerLoadChange: (index: number, value: string | number, key: keyof LoadInfoType) => void
}> = ({ shipmentCarInfo, trailerPlateNumbers, shipmentLoadInfo, handleTrailerLoadChange }) => {
	if (hasTrailer(shipmentCarInfo.carType) && shipmentCarInfo.numberOfTrailers) {
		return trailerPlateNumbers.map((trailerPlate: string, index: number) => {
			// Ensure trailer plate number is properly formatted and displayed
			const formattedPlate =
				trailerPlate && trailerPlate.trim() !== ''
					? trailerPlate.trim()
					: `Trailer ${index + 1} (Matrícula não definida)`

			return (
				<LoadInfoInputs
					key={index}
					plateNumber={formattedPlate}
					title={`Carga do Trailer ${index + 1}`}
					loadInfo={shipmentLoadInfo.trailerLoads[index] || {}}
					onLoadChange={(value, key) => handleTrailerLoadChange(index, value, key as any)}
					index={index}
				/>
			)
		})
	}
	return null
}

// Main component
export default function AddShipmentLoads() {
	const {
		currentStep,
		carPlateNumber,
		shipmentLoadInfo,
		trailerPlateNumbers,
		shipmentCarInfo,
		handlePreviousStep,
		handleNextStep,
		isFormValid,
		handleTruckLoadChange,
		handleTrailerLoadChange,
	} = useShipmentLoadsLogic()

	return (
		<View className="flex-1 bg-white dark:bg-black">
			<FormWrapper>
				<FormItemDescription description="Informações da carga" />

				{/* Truck Load */}
				<LoadInfoInputs
					plateNumber={carPlateNumber}
					title="Carga do Camião"
					loadInfo={shipmentLoadInfo.truckLoad}
					onLoadChange={handleTruckLoadChange}
				/>

				{/* Trailer Loads */}
				<TrailerLoadsSection
					shipmentCarInfo={shipmentCarInfo}
					trailerPlateNumbers={trailerPlateNumbers}
					shipmentLoadInfo={shipmentLoadInfo}
					handleTrailerLoadChange={handleTrailerLoadChange}
				/>
			</FormWrapper>

			<NextAndPreviousButtons
				handlePreviousStep={handlePreviousStep}
				handleNextStep={handleNextStep}
				nextButtonDisabled={isFormValid()}
				previousButtonDisabled={currentStep === 0}
			/>
		</View>
	)
}
