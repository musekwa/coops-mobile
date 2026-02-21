import 'react-native-get-random-values'
import { useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { RadioButton } from 'react-native-paper'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { Image } from 'expo-image'
import Tooltip from 'react-native-walkthrough-tooltip'

import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { errorMessages } from 'src/constants/errorMessages'

import BackButton from 'src/components/buttons/BackButton'
import SubmitButton from 'src/components/buttons/SubmitButton'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'

import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import SuccessAlert from 'src/components/dialogs/SuccessAlert'
import { useContactById, useQueryOne, useTraderById } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useActionStore } from 'src/store/actions/actions'
import { insertActor } from 'src/library/powersync/sql-statements'
import {
	insertContactDetail,
	insertAddressDetail,
	insertWorkerAssignment,
	insertActorDetails,
} from 'src/library/powersync/sql-statements2'
import LinkEmployeeToWarehouse from './LinkEmployeeToWarehouse'
import { buildActor } from 'src/library/powersync/schemas/actors'
import { buildContactDetail } from 'src/library/powersync/schemas/contact_details'
import { buildAddressDetail } from 'src/library/powersync/schemas/address_details'
import { powersync } from 'src/library/powersync/system'
import { buildActorDetails } from 'src/library/powersync/schemas/actor_details'
import { buildWorkerAssignment } from 'src/library/powersync/schemas/worker_assignments'

// Define the schema for worker form data validation
const WorkerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, 'Digite o seu nome completo.')
		.refine((value) => value.includes(' '), {
			message: 'Por favor, insira o nome completo.',
		}),
	position: z.string().trim().min(2, 'Indica a função que desempenha.').optional(),
	phone: z
		.union([
			z.literal(''),
			z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, {
				message: 'Indica número válido',
			}),
		])
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
	isFacilityOwner: z.enum(['YES', 'NO']).optional(),
	warehouseId: z.string().optional(),
	selectedWarehouse: z
		.object({
			warehouseId: z.string(),
			addressId: z.string(),
			warehouseType: z.string(),
			label: z.string(),
		})
		.optional(),
})

type WorkerFormData = z.infer<typeof WorkerSchema>

export default function AddEmployee() {
	const { getCurrentResource } = useActionStore()
	const [facilityId, setFacilityId] = useState<string | null>(null)

	const { otherNames, surname, photo, contactId } = useTraderById(getCurrentResource().id)
	const { primaryPhone, secondaryPhone } = useContactById(contactId || '')

	const {
		control,
		handleSubmit,
		setValue,
		getValues,
		watch,
		formState: { errors, isValid, isDirty, isSubmitting, isSubmitSuccessful, submitCount },
		reset,
	} = useForm<WorkerFormData>({
		defaultValues: {
			name: '',
			phone: undefined,
			selectedWarehouse: undefined,
		},
		resolver: zodResolver(WorkerSchema),
	})

	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [success, setSuccess] = useState(false)

	const traderName = `${otherNames} ${surname?.toLowerCase().includes('company') ? '(Empresa)' : surname}`

	const [isFacilityOwner, setIsFacilityOwner] = useState<'YES' | 'NO' | null>(null)
	const isCompany = surname?.toLowerCase().includes('company')

	const warehouseIdValue = watch('warehouseId')
	const selectedWarehouseValue = watch('selectedWarehouse')

	// Effect to update form when isFacilityOwner changes and populate warehouse items
	useEffect(() => {
		if (isFacilityOwner === 'YES') {
			setValue('name', `${otherNames} ${surname}`)
			setValue('phone', String(primaryPhone) || String(secondaryPhone) || '')
			setValue('position', 'Proprietário')
		}
	}, [isFacilityOwner, setValue])

	// Effect to update selectedWarehouse when warehouseIdValue changes
	useEffect(() => {
		if (warehouseIdValue) {
			setFacilityId(warehouseIdValue)
		} else {
			setFacilityId(null)
		}
	}, [warehouseIdValue])

	// Form submission handler
	const onSubmit = async (data: WorkerFormData) => {
		const result = WorkerSchema.safeParse(data)

		if (result.success) {
			if (!result.data.selectedWarehouse) {
				setHasError(true)
				setErrorMessage('Seleccione o armazém onde o trabalhador está afetado.')
				return
			}

			if (!getCurrentResource().id) {
				setHasError(true)
				setErrorMessage('Não foi possível encontrar o comerciante proprietário do armazém.')
				return
			}

			try {
				if (isFacilityOwner === 'YES' && result.data.selectedWarehouse?.warehouseId) {
					const worker_assignment_row = buildWorkerAssignment({
						worker_id: getCurrentResource().id,
						facility_id: result.data.selectedWarehouse?.warehouseId,
						facility_type: 'WAREHOUSE',
						position: 'OWNER',
						is_active: 'true',
						sync_id: result.data.selectedWarehouse?.addressId || '',
					})
					await insertWorkerAssignment(worker_assignment_row)
				} else {
					// Split name into surname and other_names
					const nameParts = result.data.name.trim().split(' ')
					const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0]
					const other_names = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : ''

					// Fetch warehouse address details
					const warehouseAddress = await powersync.get<{
						village_id: string
						admin_post_id: string
						district_id: string
						province_id: string
						gps_lat: string
						gps_long: string
						sync_id: string
					}>(
						`SELECT 
					village_id,
					admin_post_id,
					district_id,
					province_id,
					gps_lat,
					gps_long,
					sync_id
					FROM ${TABLES.ADDRESS_DETAILS}
					WHERE owner_id = ? AND owner_type = 'WAREHOUSE'`,
						[result.data.selectedWarehouse?.warehouseId || ''],
					)

					// Build actor record
					const actor_row = buildActor({
						category: 'EMPLOYEE',
						sync_id: result.data.selectedWarehouse?.addressId || '',
					})

					// Insert actor first
					await insertActor(actor_row)

					const actor_detail_row = buildActorDetails({
						actor_id: actor_row.id,
						surname,
						other_names,
						photo: '',
						sync_id: result.data.selectedWarehouse?.addressId || '',
					})

					await insertActorDetails(actor_detail_row)

					const worker_assignement_row = buildWorkerAssignment({
						worker_id: actor_row.id,
						facility_id: result.data.selectedWarehouse?.warehouseId || '',
						facility_type: 'WAREHOUSE',
						position: result.data.position || 'N/A',
						is_active: 'true',
						sync_id: result.data.selectedWarehouse?.addressId || '',
					})

					// Build contact detail record
					const contact_detail_row = buildContactDetail({
						owner_id: actor_row.id,
						owner_type: 'EMPLOYEE',
						primary_phone: result.data.phone || 'N/A',
						secondary_phone: result.data.phone || 'N/A',
						email: 'N/A',
						sync_id: result.data.selectedWarehouse?.addressId || '',
					})

					// Build address detail record (copy from warehouse address)
					const address_detail_row = buildAddressDetail({
						owner_id: actor_row.id,
						owner_type: 'EMPLOYEE',
						village_id: warehouseAddress?.village_id || 'N/A',
						admin_post_id: warehouseAddress?.admin_post_id || 'N/A',
						district_id: warehouseAddress?.district_id || 'N/A',
						province_id: warehouseAddress?.province_id || 'N/A',
						gps_lat: warehouseAddress?.gps_lat || '0',
						gps_long: warehouseAddress?.gps_long || '0',
						sync_id: warehouseAddress?.sync_id || result.data.selectedWarehouse?.addressId || '',
					})

					// Insert worker detail, contact detail, and address detail
					await Promise.all([
						insertWorkerAssignment(worker_assignement_row),
						insertContactDetail(contact_detail_row),
						insertAddressDetail(address_detail_row),
					])
				}

				setSuccess(true)
				reset()
			} catch (error) {
				console.log(error)
				setHasError(true)
				setErrorMessage(errorMessages.formFields)
			}
		}
	}

	return (
			<Animated.View
				entering={SlideInDown.duration(300)}
				exiting={SlideOutDown.duration(300)}
				className="flex-1 bg-white dark:bg-black"
			>
				<Header traderName={traderName} traderPhoto={photo || ''} />
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						padding: 16,
						flexGrow: 1,
						justifyContent: 'center',
					}}
					className="space-y-5"
				>
					{!isCompany && (
						<View>
							<Text className="text-black dark:text-white mb-2 text-[12px] italic">
								Este trabalhador é o mesmo que o comerciante proprietário do armazém?
							</Text>
							<View className="flex-row">
								<View className="flex-row items-center mr-8">
									<RadioButton
										value="yes"
										status={isFacilityOwner === 'YES' ? 'checked' : 'unchecked'}
										onPress={() => {
											setIsFacilityOwner('YES')
											setValue('isFacilityOwner', 'YES')
										}}
									/>
									<Text className="text-black dark:text-white">Sim</Text>
								</View>
								<View className="flex-row items-center">
									<RadioButton
										value="no"
										status={isFacilityOwner === 'NO' ? 'checked' : 'unchecked'}
										onPress={() => {
											setIsFacilityOwner('NO')
											setValue('isFacilityOwner', 'NO')
											reset({ isFacilityOwner: 'NO' }) // Reset form when 'No' is selected
										}}
									/>
									<Text className="text-black dark:text-white">Não</Text>
								</View>
							</View>
						</View>
					)}

					{/* Name input field */}
					<View>
						<Controller
							control={control}
							name="name"
							defaultValue=""
							rules={{ required: 'Nome é obrigatório' }}
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<View>
									<CustomTextInput
										label="Nome do Trabalhador"
										placeholder="Nome do trabalhador"
										onChangeText={onChange}
										value={value}
										onBlur={onBlur}
										autoCapitalize="words"
									/>
									{error ? (
										<Text className="text-xs text-red-500">{error.message}</Text>
									) : (
										<Text className={`text-xs text-gray-500`}>Nome do trabalhador</Text>
									)}
								</View>
							)}
						/>
					</View>

					{/* Position input field */}
					<View>
						<Controller
							control={control}
							name="position"
							defaultValue=""
							rules={{ required: false }}
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<View>
									<CustomTextInput
										label="Função que desempenha"
										placeholder="Função que desempenha"
										onChangeText={onChange}
										value={value}
										onBlur={onBlur}
										autoCapitalize="words"
									/>
									{error ? (
										<Text className="text-xs text-red-500">{error.message}</Text>
									) : (
										<Text className={`text-xs text-gray-500`}>Função que desempenha </Text>
									)}
								</View>
							)}
						/>
					</View>

					{/* Phone input field */}
					<View>
						<Controller
							control={control}
							name="phone"
							defaultValue=""
							rules={{ required: false }}
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<View>
									<CustomTextInput
										label="Número de telefone"
										placeholder="Número de telefone"
										keyboardType="phone-pad"
										onChangeText={onChange}
										value={value}
										onBlur={onBlur}
									/>
									{error ? (
										<Text className="text-xs text-red-500">{error.message}</Text>
									) : (
										<Text className={`text-xs text-gray-500`}>Número de telefone</Text>
									)}
								</View>
							)}
						/>
					</View>

					{/* Add Employee to Warehouse */}
					{getCurrentResource().id && (
						<View className="">
							<LinkEmployeeToWarehouse
								employerId={getCurrentResource().id}
								setValue={setValue}
								selectedWarehouse={selectedWarehouseValue}
							/>
						</View>
					)}

					{/* Submit button */}
					<View className="">
						<SubmitButton
							title="Gravar"
							disabled={isSubmitting || (!isDirty && isSubmitSuccessful) || !facilityId}
							onPress={handleSubmit(onSubmit)}
						/>
					</View>
					{/* <Toast position="bottom" /> */}
					<ErrorAlert
						visible={hasError}
						setVisible={setHasError}
						title="Erro"
						message={errorMessage}
						setMessage={setErrorMessage}
					/>

					<SuccessAlert visible={success} setVisible={setSuccess} route="/(aux)/actors/trader/dashboard" />
				</ScrollView>
			</Animated.View>
	)
}

const Header = ({ traderName, traderPhoto }: { traderName: string; traderPhoto: string }) => {
	const [showTooltip, setShowTooltip] = useState(false)
	return (
		<View className="h-[55px] mt-6 flex flex-row justify-between items-center p-3">
			<BackButton />
			<View>
				<Text className="text-black dark:text-white font-bold">Registo de Trabalhador</Text>
			</View>
			<View className="flex flex-row justify-between items-center ">
				<Tooltip
					isVisible={showTooltip}
					content={<Text>{traderName}</Text>}
					placement="bottom"
					onClose={() => setShowTooltip(false)}
				>
					<TouchableOpacity onPress={() => setShowTooltip(true)} className="items-center justify-center">
						<Image
							source={{ uri: traderPhoto ? traderPhoto : avatarPlaceholderUri }}
							style={{ width: 40, height: 40, borderRadius: 20 }}
							contentFit="cover"
						/>
					</TouchableOpacity>
				</Tooltip>
			</View>
		</View>
	)
}
