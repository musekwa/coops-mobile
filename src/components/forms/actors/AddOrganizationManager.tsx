import 'react-native-get-random-values'
import { useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
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
import { useQueryMany, useQueryOne } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useActionStore } from 'src/store/actions/actions'
import { insertActor } from 'src/library/powersync/sql-statements'
import {
	insertContactDetail,
	insertAddressDetail,
	insertActorDetails,
	insertGroupManagerAssignment,
} from 'src/library/powersync/sql-statements2'
import { buildActor } from 'src/library/powersync/schemas/actors'
import { buildContactDetail } from 'src/library/powersync/schemas/contact_details'
import { buildAddressDetail } from 'src/library/powersync/schemas/address_details'
import CustomSelectItemTrigger from 'src/components/ui/custom-select-item-trigger'
import CustomSelectItem from 'src/components/ui/custom-select-item'
import FormItemDescription from '../FormItemDescription'
import { groupManagerPositions } from 'src/constants'
import { useUserDetails } from 'src/hooks/queries'
import { buildActorDetails } from 'src/library/powersync/schemas/actor_details'
import { buildGroupManagerAssignment } from 'src/library/powersync/schemas/group_manager_assignments'

// Define the schema for worker form data validation
const OrganizationManagerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, 'Digite o seu nome completo.')
		.refine((value) => value.includes(' '), {
			message: 'Por favor, insira o nome completo.',
		}),
	position: z.string().trim().min(2, 'Indica a função que desempenha.'),
	phone: z
		.union([
			z.literal(''),
			z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, {
				message: 'Indica número válido',
			}),
		])
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
	organizationId: z.string().optional(),
})

type OrganizationManagerFormData = z.infer<typeof OrganizationManagerSchema>

export default function AddOrganizationManager() {
	const { getCurrentResource } = useActionStore()
	const { userDetails } = useUserDetails()
	const userDistrictId = userDetails?.district_id
	const {
		data: organization,
		isLoading,
		isError,
	} = useQueryOne<{
		id: string
		group_name: string
		photo: string
		address_id: string
		address_village_id: string
		address_admin_post_id: string
		address_district_id: string
		address_province_id: string
		address_gps_lat: string
		address_gps_long: string
	}>(
		`SELECT 
			a.id,
			ad.other_names as group_name,
			ad.photo,
			addr.id as address_id,
			addr.village_id as address_village_id,
			addr.admin_post_id as address_admin_post_id,
			addr.district_id as address_district_id,
			addr.province_id as address_province_id,
			addr.gps_lat as address_gps_lat,
			addr.gps_long as address_gps_long
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
		WHERE a.id = ? AND a.category = 'GROUP'`,
		[getCurrentResource().id],
	)

	const {
		control,
		handleSubmit,
		setValue,
		getValues,
		watch,
		resetField,
		setError,
		formState: { isDirty, isSubmitting, isSubmitSuccessful },
		reset,
	} = useForm<OrganizationManagerFormData>({
		defaultValues: {
			name: '',
			position: '',
			phone: undefined,
		},
		resolver: zodResolver(OrganizationManagerSchema),
	})

	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [success, setSuccess] = useState(false)

	const [showModal, setShowModal] = useState(false)

	useEffect(() => {
		if (organization?.id) {
			setValue('organizationId', organization.id)
		} else {
			resetField('organizationId')
		}
	}, [organization])

	// Form submission handler
	const onSubmit = async (data: OrganizationManagerFormData) => {
		const result = OrganizationManagerSchema.safeParse(data)

		if (result.success) {
			if (!result.data.organizationId) {
				setHasError(true)
				setErrorMessage('Seleccione o grupo onde o gestor está afetado.')
				return
			}

			try {
				if (organization && userDistrictId) {
					// 1. Create actor record for GROUP_MANAGER (generate ID first)
					const actor_row = buildActor({
						category: 'GROUP_MANAGER',
						sync_id: userDistrictId,
					})
					await insertActor(actor_row)

					// 2. Split full_name into surname and other_names
					const nameParts = result.data.name.trim().split(/\s+/)
					const surname = nameParts.length > 0 ? nameParts[nameParts.length - 1] : result.data.name
					const other_names = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : ''

					const actor_detail_row = buildActorDetails({
						actor_id: actor_row.id,
						surname: surname,
						other_names: other_names,
						photo: '',
						sync_id: userDistrictId,
					})
					await insertActorDetails(actor_detail_row)

					const groupManagerAssignment = buildGroupManagerAssignment({
						group_manager_id: actor_row.id,
						group_id: organization.id,
						position: result.data.position || 'N/A',
						is_active: 'true',
						sync_id: userDistrictId,
					})
					await insertGroupManagerAssignment(groupManagerAssignment)

					// 6. Create contact_detail record
					const contact_detail_row = buildContactDetail({
						owner_id: actor_row.id,
						owner_type: 'GROUP_MANAGER',
						primary_phone: result.data.phone || 'N/A',
						secondary_phone: result.data.phone || 'N/A',
						email: '',
						sync_id: userDistrictId,
					})
					await insertContactDetail(contact_detail_row)

					// 7. Create address_detail record (copying from organization's address)
					if (organization.address_id) {
						const address_detail_row = buildAddressDetail({
							owner_id: actor_row.id,
							owner_type: 'GROUP_MANAGER',
							village_id: organization.address_village_id || 'N/A',
							admin_post_id: organization.address_admin_post_id || 'N/A',
							district_id: organization.address_district_id || 'N/A',
							province_id: organization.address_province_id || 'N/A',
							gps_lat: organization.address_gps_lat || '0',
							gps_long: organization.address_gps_long || '0',
							sync_id: userDistrictId,
						})
						await insertAddressDetail(address_detail_row)
					}

					setSuccess(true)
					reset()
				}
			} catch (error) {
				console.log(error)
				setHasError(true)
				setErrorMessage(errorMessages.formFields)
			}
		}
	}

	return (
		<>
			<Animated.ScrollView
				entering={SlideInDown.duration(300)}
				exiting={SlideOutDown.duration(300)}
				className="flex-1 bg-white dark:bg-black"
			>
				<Header organizationName={organization?.group_name || ''} organizationPhoto={organization?.photo || ''} />
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						padding: 16,
						flexGrow: 1,
						justifyContent: 'center',
					}}
					className="space-y-5"
				>
					<FormItemDescription description="Registo do Representante do Grupo" />
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
										label="Nome do Representante"
										placeholder="Nome do representante"
										onChangeText={onChange}
										value={value}
										onBlur={onBlur}
										autoCapitalize="words"
									/>
									{error ? (
										<Text className="text-xs text-red-500">{error.message}</Text>
									) : (
										<Text className={`text-xs text-gray-500`}>Nome do representante</Text>
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
								<SelectGroupmanagerPosition
									clearError={() => setError('position', { message: '' })}
									setValue={(val) => setValue('position', val)}
									resetField={() => resetField('position')}
									showModal={showModal}
									setShowModal={setShowModal}
									positionValue={value}
									organizationId={organization?.id || ''}
									error={error?.message}
								/>
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
										<Text className={`text-xs text-gray-500`}>Número de telefone (opcional)</Text>
									)}
								</View>
							)}
						/>
					</View>

					{/* Submit button */}
					<View className="">
						<SubmitButton
							title="Gravar"
							disabled={isSubmitting || (!isDirty && isSubmitSuccessful) || !organization?.id}
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

					<SuccessAlert visible={success} setVisible={setSuccess} route="/(aux)/actors/organization" />
				</ScrollView>
			</Animated.ScrollView>
		</>
	)
}

const SelectGroupmanagerPosition = ({
	setValue,
	resetField,
	showModal,
	setShowModal,
	positionValue,
	organizationId,
	error,
	clearError,
}: {
	setValue: (value: string) => void
	resetField: () => void
	showModal: boolean
	setShowModal: (value: boolean) => void
	positionValue: string
	organizationId: string
	error?: string
	clearError: () => void
}) => {
	const {
		data: existingPositions,
		isLoading: isExistingPositionsLoading,
		error: existingPositionsError,
		isError: isExistingPositionsError,
	} = useQueryMany<{
		position: string
	}>(`
		SELECT 
			gma.position
		FROM ${TABLES.GROUP_MANAGER_ASSIGNMENTS} gma
		WHERE gma.group_id = '${organizationId}'
			AND gma.is_active = 'true'
	`)

	const [selectedPosition, setSelectedPosition] = useState<string | null>(null)
	const [availablePositions, setAvailablePositions] = useState<{ label: string; value: string }[]>([])

	useEffect(() => {
		if (positionValue) {
			setSelectedPosition(positionValue)
		}
	}, [positionValue])

	const getPositionLabel = (position: string) => {
		return groupManagerPositions.find((p) => p.value === position)?.label || 'Seleccione uma função'
	}

	useEffect(() => {
		const remainingPositions = groupManagerPositions.filter(
			(p) => !existingPositions.some((ep) => ep.position === p.value),
		)
		setAvailablePositions(remainingPositions)
	}, [existingPositions])

	return (
		<View>
			<CustomSelectItemTrigger
				resetItem={() => {
					setSelectedPosition(null)
					resetField()
					clearError()
				}}
				hasSelectedItem={!!selectedPosition}
				setShowItems={() => {
					setShowModal(true)
					clearError()
				}}
				selectedItem={getPositionLabel(selectedPosition || '')}
			/>
			<CustomSelectItem
				emptyMessage="Todas as funções já existem para este grupo"
				label="Função que desempenha"
				showModal={showModal}
				setShowModal={setShowModal}
				setValue={setValue}
				itemsList={availablePositions}
			/>
			{error ? (
				<Text className="text-xs text-red-500">{error}</Text>
			) : (
				<Text className="text-xs text-gray-500 ">Função que desempenha</Text>
			)}
		</View>
	)
}

const Header = ({ organizationName, organizationPhoto }: { organizationName: string; organizationPhoto: string }) => {
	const [showTooltip, setShowTooltip] = useState(false)
	return (
		<View className="h-[55px] mt-6 flex flex-row justify-between items-center p-3">
			<BackButton />
			<View className="w-[100px]">
				<Text ellipsizeMode="tail" numberOfLines={1} className="text-black dark:text-white font-bold">
					Representante do Grupo
				</Text>
			</View>
			<View className="flex flex-row justify-between items-center ">
				<Tooltip
					isVisible={showTooltip}
					content={<Text>{organizationName}</Text>}
					placement="bottom"
					onClose={() => setShowTooltip(false)}
				>
					<TouchableOpacity onPress={() => setShowTooltip(true)} className="items-center justify-center">
						<Image
							source={{ uri: organizationPhoto ? organizationPhoto : avatarPlaceholderUri }}
							style={{ width: 40, height: 40, borderRadius: 20 }}
							contentFit="cover"
						/>
					</TouchableOpacity>
				</Tooltip>
			</View>
		</View>
	)
}
