import { Text, TouchableOpacity } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import FormWrapper from 'src/components/forms/FormWrapper'
import { View } from 'react-native'
import CustomSelectItemTrigger from 'src/components/ui/custom-select-item-trigger'
import CustomSelectItem from 'src/components/ui/custom-select-item'
import { useEffect, useState } from 'react'
import Label from 'src/components/forms/Label'
import { checkpointTypes } from 'src/data/checkpoints'
import SelectAddress from 'src/custom-ui/select-address'
import { AddressLevel } from 'src/types'
import SubmitButton from 'src/components/buttons/SubmitButton'
import { TransitType } from 'src/constants/tracking'
import { useUserDetails } from 'src/hooks/queries'
import { useAddressStore } from 'src/store/address'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import { buildAddressDetail } from 'src/library/powersync/schemas/address_details'
import { insertAddressDetail } from 'src/library/powersync/sql-statements2'
import { v4 as uuidv4 } from 'uuid'
import { insertCheckpoint } from 'src/library/sqlite/inserts'
import SuccessAlert from 'src/components/dialogs/SuccessAlert'
import CustomConfirmDialog from 'src/components/modals/CustomConfirmDialog'
import CapturingCoordinates from 'src/components/location/CapturingCoordinates'
import * as Location from 'expo-location'
import { buildCheckpoint } from 'src/library/powersync/schemas/checkpoints'

const CheckPointSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	checkpoint_type: z.nativeEnum(TransitType),
})

type CheckPointType = z.infer<typeof CheckPointSchema>

export default function CheckpointRegistrationScreen() {
	const { userDetails } = useUserDetails()
	const [showCheckpointTypeModal, setShowCheckpointTypeModal] = useState(false)
	const [selectedCheckpointType, setSelectedCheckpointType] = useState<string>('')
	const { fullAddress, reset: resetAddress } = useAddressStore()
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [hasSuccess, setHasSuccess] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [showGpsCaptureDialog, setShowGpsCaptureDialog] = useState(false)
	const [showGpsCaptureComponent, setShowGpsCaptureComponent] = useState(false)
	const [savedAddressId, setSavedAddressId] = useState<string | null>(null)
	const [status, requestPermission] = Location.useForegroundPermissions()
	const {
		control,
		handleSubmit,
		reset,
		resetField,
		setValue,
		clearErrors,
		formState: { errors },
	} = useForm<CheckPointType>({
		resolver: zodResolver(CheckPointSchema),
	})

	const validateAddress = () => {
		if (
			!fullAddress.provinceId ||
			!fullAddress.districtId ||
			!fullAddress.adminPostId ||
			!fullAddress.villageId ||
			(fullAddress.provinceId && fullAddress.provinceId.trim() === '') ||
			(fullAddress.districtId && fullAddress.districtId.trim() === '') ||
			(fullAddress.adminPostId && fullAddress.adminPostId.trim() === '') ||
			(fullAddress.villageId && fullAddress.villageId.trim() === '')
		) {
			return false
		}
		return true
	}

	const insertCheckpointAddress = async (userProvinceId: string, checkpointId: string) => {
		try {
			// Check if any address property is null, undefined, or empty string
			if (
				!fullAddress.provinceId ||
				!fullAddress.districtId ||
				!fullAddress.adminPostId ||
				!fullAddress.villageId ||
				(fullAddress.provinceId && fullAddress.provinceId.trim() === '') ||
				(fullAddress.districtId && fullAddress.districtId.trim() === '') ||
				(fullAddress.adminPostId && fullAddress.adminPostId.trim() === '') ||
				(fullAddress.villageId && fullAddress.villageId.trim() === '')
			) {
				setHasError(true)
				setErrorMessage('Endereço do posto de fiscalização não seleccionado')
				return null
			}

			// Create address_detail for checkpoint
			// Use checkpoint ID as owner_id and 'CHECKPOINT' as owner_type
			// Note: 'CHECKPOINT' needs to be added to address_details owner_type check constraint
			const address_detail_row = buildAddressDetail({
				owner_id: checkpointId,
				owner_type: 'CHECKPOINT',
				province_id: fullAddress.provinceId,
				district_id: fullAddress.districtId,
				admin_post_id: fullAddress.adminPostId,
				village_id: fullAddress.villageId,
				gps_lat: '0',
				gps_long: '0',
				sync_id: userProvinceId,
			})

			await insertAddressDetail(address_detail_row)
			return address_detail_row.id
		} catch (error) {
			console.error(error)
			setHasError(true)
			setErrorMessage('Erro ao inserir endereço do posto de fiscalização')
			return null
		}
	}

	const onSubmit = async (data: CheckPointType) => {
		setIsSaving(true)
		setHasError(false)
		setErrorMessage('')

		try {
			// Validate user details
			if (!userDetails?.province_id) {
				setHasError(true)
				setErrorMessage('Utilizador não tem província seleccionada')
				setIsSaving(false)
				return
			}

			// Validate address before proceeding
			if (!validateAddress()) {
				setHasError(true)
				setErrorMessage('Endereço do posto de fiscalização não seleccionado')
				setIsSaving(false)
				return
			}

			const checkpoint_row = buildCheckpoint({
				name: data.name,
				description: data.description || '',
				sync_id: userDetails?.province_id,
				checkpoint_type: data.checkpoint_type as
					| 'INTERNATIONAL'
					| 'INTERPROVINCIAL'
					| 'INTERDISTRITAL'
					| 'INTRADISTRICTAL',
				is_active: 'true',
			})

			await insertCheckpoint(checkpoint_row)

			if (!fullAddress.provinceId || !fullAddress.districtId || !fullAddress.adminPostId || !fullAddress.villageId) {
				setHasError(true)
				setErrorMessage('Endereço do posto de fiscalização não seleccionado')
				setIsSaving(false)
				return
			}
			const address_detail_row = buildAddressDetail({
				owner_id: checkpoint_row.id,
				owner_type: 'CHECKPOINT',
				province_id: fullAddress.provinceId,
				district_id: fullAddress.districtId,
				admin_post_id: fullAddress.adminPostId,
				village_id: fullAddress.villageId,
				gps_lat: '0',
				gps_long: '0',
				sync_id: userDetails?.province_id,
			})
			setSavedAddressId(address_detail_row.id)
			await insertAddressDetail(address_detail_row)

			setIsSaving(false)

			// Show dialog to ask if user wants to capture GPS coordinates
			setShowGpsCaptureDialog(true)
		} catch (error) {
			console.error('Error creating checkpoint:', error)
			setHasError(true)
			setErrorMessage(error instanceof Error ? error.message : 'Erro ao criar posto de fiscalização. Tente novamente.')
			setIsSaving(false)
		}
	}

	const handleSkipGpsCapture = () => {
		setShowGpsCaptureDialog(false)
		resetAddress()
		reset()
		setHasSuccess(true)
	}

	const handleCaptureGps = async () => {
		// Check location permission first
		if (!status?.granted) {
			const permission = await requestPermission()
			if (!permission.granted) {
				setHasError(true)
				setErrorMessage('Permissão de localização negada. Pode capturar as coordenadas mais tarde.')
				setShowGpsCaptureDialog(false)
				resetAddress()
				reset()
				setHasSuccess(true)
				return
			}
		}

		setShowGpsCaptureDialog(false)
		setShowGpsCaptureComponent(true)
	}

	const handleGpsCaptureComplete = () => {
		setShowGpsCaptureComponent(false)
		resetAddress()
		reset()
		setHasSuccess(true)
		setSavedAddressId(null)
	}

	const getCheckpointTypeLabel = (type: string) => {
		return (
			checkpointTypes.find((checkpointType) => checkpointType.value === type)?.label ||
			'Seleccione um tipo de posto de fiscalização'
		)
	}

	useEffect(() => {
		if (selectedCheckpointType) {
			setValue('checkpoint_type', selectedCheckpointType as TransitType)
		}
	}, [selectedCheckpointType])

	return (
		<View className="flex-1 bg-white dark:bg-gray-900">
			<FormWrapper>
				<FormItemDescription description="Adicione um novo posto de fiscalização" />

				<View>
					<Controller
						control={control}
						name="name"
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<>
								<CustomTextInput
									label="Nome do posto de fiscalização"
									placeholder="Nome do posto de fiscalização"
									keyboardType="default"
									onChangeText={onChange}
									value={value}
								/>
								{error ? (
									<Text className="text-xs text-red-500">{error.message}</Text>
								) : (
									<FormItemDescription description="Nome do posto de fiscalização" />
								)}
							</>
						)}
					/>
				</View>

				<View>
					<Controller
						control={control}
						name="description"
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<>
								<CustomTextInput
									label="Descrição (opcional)"
									placeholder="Descrição do posto de fiscalização"
									keyboardType="default"
									onChangeText={onChange}
									value={value}
									numberOfLines={4}
									multiline
								/>
								<FormItemDescription description="Descrição do posto de fiscalização (opcional)" />
							</>
						)}
					/>
				</View>

				<View>
					<Label label="Tipo de posto de fiscalização" />
					<CustomSelectItemTrigger
						resetItem={() => {
							setSelectedCheckpointType('')
							resetField('checkpoint_type')
							clearErrors()
						}}
						hasSelectedItem={!!selectedCheckpointType}
						setShowItems={() => {
							setShowCheckpointTypeModal(true)
							clearErrors()
						}}
						selectedItem={getCheckpointTypeLabel(selectedCheckpointType)}
					/>
					<CustomSelectItem
						emptyMessage="Nenhum tipo de posto de fiscalização encontrado"
						label="Tipo de posto de fiscalização"
						showModal={showCheckpointTypeModal}
						setShowModal={setShowCheckpointTypeModal}
						setValue={(value) => {
							setSelectedCheckpointType(value)
							setValue('checkpoint_type', value as TransitType)
						}}
						itemsList={checkpointTypes}
						searchPlaceholder="Seleccione um tipo de posto de fiscalização"
					/>
				</View>

				<View>
					<SelectAddress
						description="Endereço do posto de fiscalização"
						control={control}
						errors={errors}
						customErrors={() => {}}
						clearFieldError={() => {}}
						addressLevel={AddressLevel.FROM_PROVINCES}
					/>
				</View>

				<View>
					<SubmitButton
						onPress={handleSubmit(onSubmit)}
						title="Adicionar Posto de Fiscalização"
						disabled={isSaving}
						isSubmitting={isSaving}
					/>
				</View>
			</FormWrapper>
			{/* GPS Capture Prompt Dialog */}
			<CustomConfirmDialog
				showConfirmDialog={showGpsCaptureDialog}
				setShowConfirmDialog={(show) => {
					if (!show) {
						handleSkipGpsCapture()
					}
				}}
				title="Capturar coordenadas GPS"
				content={
					<View className="p-4">
						<Text className="text-gray-700 dark:text-gray-300 mb-4">
							O posto de fiscalização foi registado com sucesso. Deseja capturar as coordenadas GPS agora?
						</Text>
						<View className="flex-row justify-end space-x-3 mt-4">
							<TouchableOpacity
								onPress={handleSkipGpsCapture}
								activeOpacity={0.7}
								className="bg-gray-200 dark:bg-gray-700 flex-1 rounded-lg px-4 py-3 items-center justify-center mr-2"
							>
								<Text className="text-gray-700 dark:text-gray-300 font-semibold">Mais tarde</Text>
							</TouchableOpacity>
							<View className="flex-1">
								<SubmitButton onPress={handleCaptureGps} title="Capturar agora" disabled={false} isSubmitting={false} />
							</View>
						</View>
					</View>
				}
			/>

			{/* GPS Capture Component Dialog */}
			<CustomConfirmDialog
				showConfirmDialog={showGpsCaptureComponent}
				setShowConfirmDialog={setShowGpsCaptureComponent}
				title={''}
				content={
					savedAddressId ? (
						<CapturingCoordinates
							errorMessage={errorMessage}
							showErrorAlert={hasError}
							setShowErrorAlert={setHasError}
							setErrorMessage={setErrorMessage}
							address_id={savedAddressId}
							setShowCapturingCoordinatesDialog={(show) => {
								if (!show) {
									handleGpsCaptureComplete()
								}
							}}
						/>
					) : (
						<Text>Erro: Endereço não encontrado</Text>
					)
				}
			/>

			<ErrorAlert
				title="Erro"
				message={errorMessage}
				setMessage={setErrorMessage}
				visible={hasError}
				setVisible={setHasError}
			/>
			<SuccessAlert visible={hasSuccess} setVisible={setHasSuccess} route={'/checkpoints'} />
		</View>
	)
}
