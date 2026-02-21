import { View, Text } from 'react-native'
import FormWrapper from '../FormWrapper'
import FormItemDescription from '../FormItemDescription'
import { Controller } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import CustomSelectItem from 'src/components/ui/custom-select-item'
import { useQueryMany } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import CustomSelectItemTrigger from 'src/components/ui/custom-select-item-trigger'

interface DriverOption {
	id: string
	full_name: string
	phone: string
}
import { useState, useEffect } from 'react'
import { useCheckDriverDuplicate } from 'src/hooks/useCheckDriverDuplicate'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Label from '../Label'
import NextAndPreviousButtons from 'src/components/buttons/NextAndPreviousButtons'
import { useActionStore } from 'src/store/actions/actions'
import { useShipmentDriverStore } from 'src/store/shipment/shipment_driver'

const DriverSchema = z.object({
	driverName: z
		.string()
		.trim()
		.min(2, 'Digite o nome do motorista.')
		.regex(/.*\s.*/, 'Indica o nome completo do motorista.'),
	driverPhone: z
		.string({
			message: 'Indica o número de telefone',
		})
		.regex(/^(84|86|87|85|82|83)\d{7}$/, {
			message: 'Indica número válido',
		}),
	driverId: z.string().min(1),
})

type DriverFormData = z.infer<typeof DriverSchema>

export default function AddDriverInfo() {
	const { currentStep, setCurrentStep, totalSteps } = useActionStore()
	const { shipmentDriverInfo, setShipmentDriverInfo } = useShipmentDriverStore()

	const {
		control,
		handleSubmit,
		setValue,
		getValues,
		watch,
		resetField,
		setError,
		formState: { errors, isValid, isDirty, isSubmitting, isSubmitSuccessful, submitCount },
		reset,
	} = useForm<DriverFormData>({
		defaultValues: {
			driverName: shipmentDriverInfo.driverName,
			driverPhone: shipmentDriverInfo.driverPhone,
			driverId: shipmentDriverInfo.driverId,
		},
		resolver: zodResolver(DriverSchema),
	})
	const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
	const [showModal, setShowModal] = useState(false)
	const drivers = useQueryMany<DriverOption>(`
		SELECT 
			a.id,
			TRIM(ad.other_names || ' ' || ad.surname) as full_name,
			cd.primary_phone as phone
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON a.id = ad.actor_id
		INNER JOIN ${TABLES.CONTACT_DETAILS} cd ON a.id = cd.owner_id AND cd.owner_type = 'DRIVER'
		WHERE a.category = 'DRIVER'
	`)
	const driverNameValue = watch('driverName')
	const driverPhoneValue = watch('driverPhone')
	const driverIdValue = watch('driverId')

	// Check for duplicate drivers (only when not selecting from dropdown)
	const {
		hasDuplicate,
		duplicateType,
		message: duplicateMessage,
		duplicateDriver,
	} = useCheckDriverDuplicate({
		driverName: !selectedDriverId ? driverNameValue : undefined,
		driverPhone: !selectedDriverId ? driverPhoneValue : undefined,
	})

	// Sync form with store values only when driver is selected from dropdown
	useEffect(() => {
		// Only sync when driverId is set (indicating dropdown selection)
		if (shipmentDriverInfo.driverId && shipmentDriverInfo.driverId !== driverIdValue) {
			setValue('driverId', shipmentDriverInfo.driverId)
			setSelectedDriverId(shipmentDriverInfo.driverId)
		}
	}, [shipmentDriverInfo.driverId, setValue, driverIdValue])

	// Handle driver selection from dropdown
	const handleDriverSelection = (driverId: string) => {
		setSelectedDriverId(driverId)

		// Find the selected driver
		const selectedDriver = drivers.data?.find((driver) => driver.id === driverId)
		if (selectedDriver) {
			// Update both form and store
			setValue('driverName', selectedDriver.full_name || '')
			setValue('driverPhone', selectedDriver.phone || '')
			setValue('driverId', driverId)

			// Update store
			setShipmentDriverInfo(selectedDriver.full_name || '', 'driverName')
			setShipmentDriverInfo(selectedDriver.phone || '', 'driverPhone')
			setShipmentDriverInfo(driverId, 'driverId')
		}
	}

	// Handle reset of driver selection
	const handleResetDriver = () => {
		setSelectedDriverId(null)
		resetField('driverName')
		resetField('driverPhone')
		resetField('driverId')

		// Clear store
		setShipmentDriverInfo('', 'driverName')
		setShipmentDriverInfo('', 'driverPhone')
		setShipmentDriverInfo('', 'driverId')
	}

	const handlePreviousStep = () => {
		setCurrentStep(currentStep - 1)
	}

	const handleNextStep = () => {
		// Validate form before proceeding
		const formData = getValues()

		// Check if driver is selected from dropdown
		if (selectedDriverId) {
			if (currentStep < totalSteps - 1) {
				setCurrentStep(currentStep + 1)
			}
			return
		}

		// If manually entering driver info, check if driver already exists
		if (hasDuplicate && duplicateDriver) {
			setError('driverPhone', {
				type: 'manual',
				message: duplicateMessage,
			})
			return
		}

		// If manually entering driver info, validate full name
		if (formData.driverName && !formData.driverName.includes(' ')) {
			setError('driverName', {
				type: 'manual',
				message: 'Indica o nome completo do motorista.',
			})
			return
		}

		// Use the same validation logic as the button disabled state
		if (!canProceed) {
			console.log('Driver validation failed')
			return
		}

		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1)
		}
	}

	// Validation logic: either driverId is selected OR both name and phone are valid AND driver doesn't exist
	const isDriverSelected = !!selectedDriverId
	const hasValidNameAndPhone =
		driverNameValue &&
		driverPhoneValue &&
		driverNameValue.length >= 2 &&
		driverPhoneValue.length >= 9 &&
		driverNameValue.includes(' ') // Ensure full name has at least one space
	const canProceed = isDriverSelected || (hasValidNameAndPhone && !hasDuplicate)

	return (
		<View className="flex-1 bg-white dark:bg-black">
			<FormWrapper>
				<View>
					<Label label="Procure ou Seleccione o Motorista" />
					<CustomSelectItemTrigger
						resetItem={handleResetDriver}
						hasSelectedItem={!!selectedDriverId}
						setShowItems={() => {
							setShowModal(true)
						}}
						selectedItem={driverNameValue ? driverNameValue : 'Procure ou Seleccione o Motorista'}
					/>
					<CustomSelectItem
						label="Seleccione o Motorista"
						emptyMessage="Nenhum motorista encontrado"
						showModal={showModal}
						setShowModal={setShowModal}
						setValue={handleDriverSelection}
						itemsList={drivers.data?.map((driver) => ({
							label: driver.full_name ?? '',
							value: driver.id ?? '',
							description: driver.phone ?? '',
						}))}
					/>
				</View>

				<View className="py-4">
					<Text className="text-center text-sm text-gray-500">Ou</Text>
				</View>

				{/* Driver info */}
				<FormItemDescription description="Adicione o Motorista" />
				<View className="">
					<Controller
						control={control}
						name="driverName"
						defaultValue=""
						rules={{ required: true }}
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<>
								<CustomTextInput
									label="Nome do Motorista"
									value={value}
									onChangeText={(text) => {
										onChange(text)
										setShipmentDriverInfo(text, 'driverName')
									}}
									onBlur={onBlur}
									autoCapitalize="words"
									placeholder="Nome do Motorista"
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : (
									<FormItemDescription description="Indica o nome do motorista" />
								)}
							</>
						)}
					/>
				</View>
				<View className="">
					<Controller
						control={control}
						name="driverPhone"
						rules={{ required: true }}
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<>
								<CustomTextInput
									label="Número do Motorista"
									value={value}
									onChangeText={(text) => {
										onChange(text)
										setShipmentDriverInfo(text, 'driverPhone')
									}}
									onBlur={onBlur}
									keyboardType="phone-pad"
									// autoCapitalize="words"
									placeholder="Número de Telefone Motorista"
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : hasDuplicate && duplicateMessage ? (
									<Text className="text-xs text-red-500">{duplicateMessage}</Text>
								) : (
									<FormItemDescription description="Indica o número de telefone do motorista" />
								)}
							</>
						)}
					/>
				</View>
			</FormWrapper>
			<NextAndPreviousButtons
				// currentStep={currentStep}
				handlePreviousStep={handlePreviousStep}
				handleNextStep={handleNextStep}
				nextButtonDisabled={!canProceed}
				previousButtonDisabled={currentStep === 0}
			/>
		</View>
	)
}
