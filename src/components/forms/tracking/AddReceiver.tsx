import { View, Text } from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import NextAndPreviousButtons from 'src/components/buttons/NextAndPreviousButtons'
import { useShipmentReceiverDetailsStore } from 'src/store/tracking/receiverDetails'
import { shipmentParticipants } from 'src/constants/tracking'
import { useEffect, useState } from 'react'
import { colors } from 'src/constants'
import Label from '../Label'
import { useShipmentOwnerDetailsStore } from 'src/store/shipment/shipment_owner_details'
import { cn } from 'src/utils/tailwind'
import { Image } from 'expo-image'
import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { useActionStore } from 'src/store/actions/actions'
import FormItemDescription from '../FormItemDescription'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import FormWrapper from '../FormWrapper'
import RadioButton from 'src/components/buttons/RadioButton'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CustomPicker } from 'src/components/custom-select-item/CustomPicker'
import { destinationDistricts } from 'src/constants/districts'
import { destinationProvinces } from 'src/constants/provinces'

const ReceiverSchema = z.object({
	destinationDistrict: z.string().min(1, 'Indica o distrito de destino'),
	destinationProvince: z.string().min(1, 'Indica a província de destino'),
	receiverType: z.string().min(1, 'Indica o tipo de destinatário'),
})

type ReceiverFormData = z.infer<typeof ReceiverSchema>

export default function AddReceiver() {
	const { currentStep, setCurrentStep, totalSteps } = useActionStore()
	const { shipmentReceiverDetails, setShipmentReceiverDetails, updateShipmentReceiverDetails } =
		useShipmentReceiverDetailsStore()
	const { receiverId, receiverName, receiverPhone, receiverType } = shipmentReceiverDetails
	const { shipmentOwnerDetails } = useShipmentOwnerDetailsStore()
	const [hasError, setHasError] = useState(false)
	const [message, setMessage] = useState('')

	const {
		control,
		formState: { errors, isValid, isDirty },
		setValue,
		getValues,
		resetField,
		watch,
	} = useForm<ReceiverFormData>({
		defaultValues: {
			destinationDistrict: '',
			destinationProvince: '',
			receiverType: '',
		},
		resolver: zodResolver(ReceiverSchema),
	})

	const destinationDistrictValue = watch('destinationDistrict')
	const destinationProvinceValue = watch('destinationProvince')
	const receiverTypeValue = watch('receiverType')
	const handleNextStep = () => {
		if (destinationDistrictValue === '') {
			setHasError(true)
			setMessage('O distrito de destino não pode ser o mesmo que o distrito de emissão da Guia de Trânsito.')
			resetField('destinationDistrict')
			updateShipmentReceiverDetails('destinationDistrict', '')
			return
		}
		if (receiverName === '' || receiverId === '') {
			setHasError(true)
			setMessage('Seleccione o destinatário.')
			return
		}
		if (destinationDistrictValue === '') {
			setHasError(true)
			setMessage('Seleccione o distrito de destino.')
			return
		} else {
			console.log('destinationDistrictValue', destinationDistrictValue)
		}
		if (currentStep < totalSteps && isValid) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handlePreviousStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1)
		}
	}

	useEffect(() => {
		if (destinationDistrictValue) {
			updateShipmentReceiverDetails('destinationDistrict', destinationDistrictValue)
		}
		if (destinationProvinceValue) {
			updateShipmentReceiverDetails('destinationProvince', destinationProvinceValue)
		}
		if (receiverTypeValue === shipmentParticipants.OWNER) {
			setShipmentReceiverDetails({
				...shipmentReceiverDetails,
				receiverId: shipmentOwnerDetails.ownerId,
				receiverName: shipmentOwnerDetails.ownerName,
				receiverPhone: shipmentOwnerDetails.ownerPhone,
				receiverType: shipmentParticipants.OWNER,
			})
		}
		if (receiverTypeValue === shipmentParticipants.WORKER) {
			setShipmentReceiverDetails({
				...shipmentReceiverDetails,
				receiverId: '',
				receiverName: '',
				receiverPhone: '',
				receiverType: shipmentParticipants.WORKER,
			})
		}
		if (receiverTypeValue === shipmentParticipants.OTHER) {
			setShipmentReceiverDetails({
				...shipmentReceiverDetails,
				receiverId: '',
				receiverName: '',
				receiverPhone: '',
				receiverType: shipmentParticipants.OTHER,
			})
		}
	}, [destinationDistrictValue, destinationProvinceValue, receiverTypeValue])

	return (
		<View className="flex-1">
			<FormWrapper>
				{/* <FormItemDescription description="Destino da mercadoria" /> */}
				{/* Destination */}
				<View className="space-y-6">
					<View className="flex-1">
						<Label label="Destino da mercadoria" />
						<Controller
							control={control}
							name="destinationProvince"
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<View className="flex-1">
									<CustomPicker
										value={value}
										setValue={onChange}
										items={destinationProvinces?.map((province) => ({ label: province, value: province }))}
										placeholder={{ label: 'Seleccione a província', value: null }}
									/>
									{error ? (
										<Text className="text-xs text-red-500">{error.message}</Text>
									) : (
										<FormItemDescription description="Seleccione a província" />
									)}
								</View>
							)}
						/>
					</View>

					<View className="flex-1">
						<Controller
							control={control}
							name="destinationDistrict"
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<View className="flex-1">
									<CustomPicker
										value={value}
										setValue={onChange}
										items={destinationDistricts[getValues().destinationProvince]?.map((district) => ({
											label: district,
											value: district,
										}))}
										placeholder={{ label: 'Seleccione o distrito', value: null }}
									/>
									{error ? (
										<Text className="text-xs text-red-500">{error.message}</Text>
									) : (
										<FormItemDescription description="Seleccione o distrito" />
									)}
								</View>
							)}
						/>
					</View>
				</View>

				<View className="space-y-3 pt-4">
					<View className="">
						<Label label="Quem vai receber a mercadoria ao destino?" />
						<View className="space-y-2">
							<Controller
								control={control}
								name="receiverType"
								render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
									<View className="flex flex-col justify-around space-y-4">
										<RadioButton
											label="O proprietário da mercadoria"
											value={shipmentParticipants.OWNER}
											checked={receiverType === shipmentParticipants.OWNER}
											onChange={(value) => onChange(String(shipmentParticipants.OWNER))}
										/>

										<RadioButton
											label="Um colaborador (trabalhador)"
											value={shipmentParticipants.WORKER}
											checked={receiverType === shipmentParticipants.WORKER}
											onChange={(value) => onChange(String(shipmentParticipants.WORKER))}
										/>

										<RadioButton
											label="Outra empresa"
											value={shipmentParticipants.OTHER}
											checked={receiverType === shipmentParticipants.OTHER}
											onChange={(value) => onChange(String(shipmentParticipants.OTHER))}
										/>

										{errors.receiverType && <Text className="text-red-500">{errors.receiverType.message}</Text>}
									</View>
								)}
							/>
						</View>
					</View>
				</View>

				{receiverId !== '' && receiverName !== '' && (
					<View
						className={cn(
							'flex flex-row items-center mt-6 mb-2 space-x-2 rounded-md w-fullbg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-900',
						)}
					>
						<View className="w-[50px] h-[50px]">
							<Image source={{ uri: avatarPlaceholderUri }} style={{ width: 50, height: 50, borderRadius: 100 }} />
						</View>
						<View className="flex-1">
							<Label label={receiverName} />
							<View className="flex flex-row space-x-2 items-center">
								<Feather name="phone" size={12} color={colors.gray600} />
								<Text className="text-[12px] text-gray-500">{receiverPhone ? receiverPhone : 'Não disponível'}</Text>
							</View>
						</View>
						<View className="p-1 flex items-center justify-center">
							<Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
						</View>
					</View>
				)}
			</FormWrapper>
			<NextAndPreviousButtons
				// currentStep={currentStep}
				handlePreviousStep={handlePreviousStep}
				handleNextStep={handleNextStep}
				previousButtonDisabled={currentStep === 0}
				nextButtonDisabled={!isValid}
			/>
			<ErrorAlert title="Erro" visible={hasError} message={message} setVisible={setHasError} setMessage={setMessage} />
		</View>
	)
}
