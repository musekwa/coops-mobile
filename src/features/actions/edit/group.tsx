import { View, Text } from 'react-native'
import { useState, useEffect, useMemo } from 'react'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useQueryOneAndWatchChanges } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { ResourceName, LocationType, OrganizationTypes } from 'src/types'
import { Checkbox } from 'react-native-paper'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import { colors } from 'src/constants'
import { useToast } from 'src/components/ToastMessage'
import SelectLocationName from 'src/custom-ui/select-location-name'
import { useAddressStore } from 'src/store/address'
import SubmitButton from 'src/components/buttons/SubmitButton'
import { updateOne } from 'src/library/powersync/sql-statements'
import { powersync } from 'src/library/powersync/system'
import { insertActorCategory } from 'src/library/powersync/sql-statements2'
import { buildActorCategories } from 'src/library/powersync/schemas/actor_categories'
import { buildLicense } from 'src/library/powersync/schemas/licenses'
import { insertLicense } from 'src/library/powersync/sql-statements'
import CustomConfirmDialg from 'src/components/dialogs/CustomConfirmDialg'
import ResourcePersonalCard from './components/resource-personal-card'
import { Spinner } from 'src/components/loaders'
import CustomSelectItem from 'src/components/ui/custom-select-item'
import CustomSelectItemTrigger from 'src/components/ui/custom-select-item-trigger'
import { EditPermissionCard } from './components/edit-permission-card'
import EditSectionLabel from './components/edit-section-label'
import EditFormField from './components/edit-form-field'
import FieldLabel from './components/field-label'
import { Redirect } from 'expo-router'
import { ToPortuguese } from 'src/helpers/translate'

type FieldGroup = 'names' | 'address' | 'nuit' | 'nuel' | 'license' | 'organizationType'

type SelectedFields = {
	names: {
		other_names: boolean
	}
	address: {
		province: boolean
		district: boolean
		admin_post: boolean
		village: boolean
	}
	nuit: boolean
	nuel: boolean
	license: boolean
	organizationType: boolean
}

type FormData = {
	names: {
		other_names: string
	}
	address: {
		province: string
		district: string
		admin_post: string
		village: string
	}
	nuit: string
	nuel: string
	license: string
	organizationType: string
}

type OrganizationData = {
	id: string
	other_names: string
	photo?: string
	nuit: string
	nuel: string
	license?: string
	license_id?: string
	organizationType: string
	address_id?: string
	updated_at?: string
	province_id?: string
	district_id?: string
	admin_post_id?: string
	village_id?: string
}

type Props = {
	id: string
	resourceName: string
	success: boolean
	setSuccess: (v: boolean) => void
	hasError: boolean
	setHasError: (v: boolean) => void
	errorMessage: string
	setErrorMessage: (m: string) => void
}

export const GroupEdit = ({
	id,
	resourceName,
	hasError,
	setHasError,
	success,
	setSuccess,
	errorMessage,
	setErrorMessage,
}: Props) => {
	const { showSuccess, showError } = useToast()
	const { getFullProvinceNameById, getFullDistrictNameById, getFullAdminPostNameById, getFullVillageNameById } =
		useAddressStore()

	const [selectedFields, setSelectedFields] = useState<SelectedFields>({
		names: { other_names: false },
		address: { province: false, district: false, admin_post: false, village: false },
		nuit: false,
		nuel: false,
		license: false,
		organizationType: false,
	})

	const [formData, setFormData] = useState<FormData>({
		names: { other_names: '' },
		address: { province: '', district: '', admin_post: '', village: '' },
		nuit: '',
		nuel: '',
		license: '',
		organizationType: '',
	})

	// State for location names
	const [provinceName, setProvinceName] = useState<string>('')
	const [districtName, setDistrictName] = useState<string>('')
	const [adminPostName, setAdminPostName] = useState<string>('')
	const [villageName, setVillageName] = useState<string>('')
	const [showPermissionDialog, setShowPermissionDialog] = useState(false)
	const [showOrganizationTypeModal, setShowOrganizationTypeModal] = useState(false)

	// Query organization data with all related information from normalized tables
	const organizationQuery = `
		SELECT 
			ad.actor_id as id,
			ad.other_names,
			ad.photo,
			ad.updated_at,
			COALESCE(n.nuit, 'N/A') as nuit,
			COALESCE(nel.nuel, 'N/A') as nuel,
			COALESCE(ac.subcategory, 'N/A') as organizationType,
			addr.id as address_id,
			addr.province_id,
			addr.district_id,
			addr.admin_post_id,
			addr.village_id,
			l.id as license_id,
			CASE 
				WHEN l.number IS NOT NULL AND l.number LIKE '%-%' 
				THEN SUBSTR(l.number, 1, INSTR(l.number, '-') - 1)
				ELSE COALESCE(l.number, 'N/A')
			END as license
		FROM ${TABLES.ACTOR_DETAILS} ad
		INNER JOIN ${TABLES.ACTORS} a ON a.id = ad.actor_id AND a.category = 'GROUP'
		LEFT JOIN ${TABLES.NUITS} n ON n.actor_id = ad.actor_id
		LEFT JOIN ${TABLES.NUELS} nel ON nel.actor_id = ad.actor_id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'GROUP'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'GROUP'
		LEFT JOIN ${TABLES.LICENSES} l ON l.owner_id = ad.actor_id AND l.owner_type = 'GROUP'
		WHERE ad.actor_id = ?
	`

	const { data: organization, isLoading: isLoadingOrganization } = useQueryOneAndWatchChanges<OrganizationData>(
		organizationQuery,
		[String(id)],
	)

	// Check if organization data is locked (updated more than 24 hours ago)
	const isDataLocked = useMemo(() => {
		if (!organization?.updated_at) return false
		const updatedAt = new Date(organization.updated_at)
		const now = new Date()
		const hoursSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)
		return hoursSinceUpdate > 24
	}, [organization?.updated_at])

	// Update form data when organization data loads
	useEffect(() => {
		if (organization) {
			setFormData({
				names: {
					other_names: organization.other_names || '',
				},
				address: {
					province: organization.province_id || '',
					district: organization.district_id || '',
					admin_post: organization.admin_post_id || '',
					village: organization.village_id || '',
				},
				nuit: organization.nuit || '',
				nuel: organization.nuel || '',
				license: organization.license || '',
				organizationType: organization.organizationType || '',
			})
		}
	}, [organization])

	// Fetch location names when organization data loads
	useEffect(() => {
		const fetchLocationNames = async () => {
			if (organization) {
				if (organization.province_id) {
					const name = await getFullProvinceNameById(organization.province_id)
					setProvinceName(name || 'N/A')
				} else {
					setProvinceName('N/A')
				}

				if (organization.district_id) {
					const name = await getFullDistrictNameById(organization.district_id)
					setDistrictName(name || 'N/A')
				} else {
					setDistrictName('N/A')
				}

				if (organization.admin_post_id) {
					const name = await getFullAdminPostNameById(organization.admin_post_id)
					setAdminPostName(name || 'N/A')
				} else {
					setAdminPostName('N/A')
				}

				if (organization.village_id) {
					const name = await getFullVillageNameById(organization.village_id)
					setVillageName(name || 'N/A')
				} else {
					setVillageName('N/A')
				}
			}
		}
		fetchLocationNames()
	}, [organization, getFullProvinceNameById, getFullDistrictNameById, getFullAdminPostNameById, getFullVillageNameById])

	const toggleField = (group: FieldGroup, field?: string) => {
		setSelectedFields((prev) => {
			if (group === 'nuit' || group === 'nuel' || group === 'license' || group === 'organizationType') {
				return { ...prev, [group]: !prev[group] }
			}
			if (field) {
				const groupData = prev[group] as Record<string, boolean>
				const newValue = !groupData[field]

				// Handle cascading for address fields
				if (group === 'address') {
					if (field === 'province' && newValue) {
						return {
							...prev,
							address: {
								province: true,
								district: false,
								admin_post: false,
								village: false,
							},
						}
					}
					if (field === 'district' && newValue) {
						if (!prev.address.province) {
							return prev
						}
						return {
							...prev,
							address: {
								...prev.address,
								district: true,
								admin_post: false,
								village: false,
							},
						}
					}
					if (field === 'admin_post' && newValue) {
						if (!prev.address.district) {
							return prev
						}
						return {
							...prev,
							address: {
								...prev.address,
								admin_post: true,
								village: false,
							},
						}
					}
					if (field === 'village' && newValue) {
						if (!prev.address.admin_post) {
							return prev
						}
					}
				}

				return {
					...prev,
					[group]: {
						...groupData,
						[field]: newValue,
					},
				}
			}
			return prev
		})
	}

	const updateFormData = (group: FieldGroup, field: string, value: string) => {
		setFormData((prev) => {
			if (group === 'nuit') {
				return { ...prev, nuit: value }
			}
			if (group === 'nuel') {
				return { ...prev, nuel: value }
			}
			if (group === 'license') {
				return { ...prev, license: value }
			}
			if (group === 'organizationType') {
				return { ...prev, organizationType: value }
			}
			const groupData = prev[group] as Record<string, string>

			// Handle cascading reset for address fields
			if (group === 'address') {
				if (field === 'province') {
					return {
						...prev,
						address: {
							province: value,
							district: '',
							admin_post: '',
							village: '',
						},
					}
				}
				if (field === 'district') {
					return {
						...prev,
						address: {
							...prev.address,
							district: value,
							admin_post: '',
							village: '',
						},
					}
				}
				if (field === 'admin_post') {
					return {
						...prev,
						address: {
							...prev.address,
							admin_post: value,
							village: '',
						},
					}
				}
			}

			return {
				...prev,
				[group]: {
					...groupData,
					[field]: value,
				},
			}
		})
	}

	const handleSubmit = async () => {
		// Check if at least one field is selected
		const hasSelection =
			selectedFields.names.other_names ||
			selectedFields.address.province ||
			selectedFields.address.district ||
			selectedFields.address.admin_post ||
			selectedFields.address.village ||
			selectedFields.nuit ||
			selectedFields.nuel ||
			selectedFields.license ||
			selectedFields.organizationType

		if (!hasSelection) {
			setHasError(true)
			setErrorMessage('Seleccione pelo menos um campo para actualizar')
			return
		}

		if (!organization) {
			setHasError(true)
			setErrorMessage('Dados da organização não encontrados')
			return
		}

		// Validate cascading address requirements
		const provinceChanged =
			selectedFields.address.province &&
			formData.address.province &&
			formData.address.province !== organization.province_id
		const districtChanged =
			selectedFields.address.district &&
			formData.address.district &&
			formData.address.district !== organization.district_id
		const adminPostChanged =
			selectedFields.address.admin_post &&
			formData.address.admin_post &&
			formData.address.admin_post !== organization.admin_post_id
		const villageChanged =
			selectedFields.address.village && formData.address.village && formData.address.village !== organization.village_id

		// Validation: If province changes, district, admin_post, and village must also be selected and filled
		if (provinceChanged) {
			if (!selectedFields.address.district || !formData.address.district) {
				setHasError(true)
				setErrorMessage('Ao alterar a província, deve também seleccionar e preencher o distrito')
				return
			}
			if (!selectedFields.address.admin_post || !formData.address.admin_post) {
				setHasError(true)
				setErrorMessage('Ao alterar a província, deve também seleccionar e preencher o posto administrativo')
				return
			}
			if (!selectedFields.address.village || !formData.address.village) {
				setHasError(true)
				setErrorMessage('Ao alterar a província, deve também seleccionar e preencher a localidade')
				return
			}
		}

		// Validation: If district changes (but province doesn't), admin_post and village must also be selected and filled
		if (districtChanged && !provinceChanged) {
			if (!selectedFields.address.admin_post || !formData.address.admin_post) {
				setHasError(true)
				setErrorMessage('Ao alterar o distrito, deve também seleccionar e preencher o posto administrativo')
				return
			}
			if (!selectedFields.address.village || !formData.address.village) {
				setHasError(true)
				setErrorMessage('Ao alterar o distrito, deve também seleccionar e preencher a localidade')
				return
			}
		}

		// Validation: If admin_post changes (but province and district don't), village must also be selected and filled
		if (adminPostChanged && !provinceChanged && !districtChanged) {
			if (!selectedFields.address.village || !formData.address.village) {
				setHasError(true)
				setErrorMessage('Ao alterar o posto administrativo, deve também seleccionar e preencher a localidade')
				return
			}
		}

		try {
			setHasError(false)
			setErrorMessage('')

			// Validate for duplicates before proceeding with updates
			// Check for duplicate NUIT
			if (selectedFields.nuit && formData.nuit.trim() && formData.nuit.trim() !== 'N/A') {
				try {
					const existingNuit = await powersync.get<{ actor_id: string }>(
						`SELECT actor_id FROM ${TABLES.NUITS} WHERE nuit = ? AND actor_id != ? LIMIT 1`,
						[formData.nuit.trim(), id],
					)
					if (existingNuit) {
						setHasError(true)
						setErrorMessage(`NUIT ${formData.nuit.trim()} já está registado para outra organização.`)
						return
					}
				} catch (error: any) {
					// Ignore "Result set is empty" error - means no duplicate
					if (!error?.message?.includes('Result set is empty') && !String(error).includes('Result set is empty')) {
						console.error('Error checking duplicate NUIT:', error)
					}
				}
			}

			// Check for duplicate NUEL
			if (selectedFields.nuel && formData.nuel.trim() && formData.nuel.trim() !== 'N/A') {
				try {
					const existingNuel = await powersync.get<{ actor_id: string }>(
						`SELECT actor_id FROM ${TABLES.NUELS} WHERE nuel = ? AND actor_id != ? LIMIT 1`,
						[formData.nuel.trim(), id],
					)
					if (existingNuel) {
						setHasError(true)
						setErrorMessage(`NUEL ${formData.nuel.trim()} já está registado para outra organização.`)
						return
					}
				} catch (error: any) {
					// Ignore "Result set is empty" error - means no duplicate
					if (!error?.message?.includes('Result set is empty') && !String(error).includes('Result set is empty')) {
						console.error('Error checking duplicate NUEL:', error)
					}
				}
			}

			// Determine if district will change (needed for sync_id update)
			const districtWillChange =
				(selectedFields.address.province &&
					formData.address.province &&
					formData.address.province !== organization.province_id) ||
				(selectedFields.address.district &&
					formData.address.district &&
					formData.address.district !== organization.district_id)

			const newDistrictId =
				districtWillChange && formData.address.district ? formData.address.district : organization.district_id || ''

			// Update actor_details table (names and updated_at)
			const actorUpdates: string[] = []
			const actorParams: string[] = []

			if (selectedFields.names.other_names && formData.names.other_names.trim()) {
				actorUpdates.push('other_names = ?')
				actorParams.push(formData.names.other_names.trim())
			}

			if (actorUpdates.length > 0) {
				actorUpdates.push('updated_at = ?')
				actorParams.push(new Date().toISOString(), id)
				await updateOne(`UPDATE ${TABLES.ACTOR_DETAILS} SET ${actorUpdates.join(', ')} WHERE actor_id = ?`, actorParams)
			}

			// Update address_details table with cascading logic
			if (provinceChanged || districtChanged || adminPostChanged || villageChanged) {
				const addressUpdates: string[] = []
				const addressParams: string[] = []

				// Cascading logic:
				// 1. If province changes → district, admin_post, and village must also be updated
				if (provinceChanged) {
					addressUpdates.push('province_id = ?')
					addressParams.push(formData.address.province)

					if (formData.address.district) {
						addressUpdates.push('district_id = ?')
						addressParams.push(formData.address.district)
					} else {
						addressUpdates.push('district_id = ?')
						addressParams.push('')
					}

					if (formData.address.admin_post) {
						addressUpdates.push('admin_post_id = ?')
						addressParams.push(formData.address.admin_post)
					} else {
						addressUpdates.push('admin_post_id = ?')
						addressParams.push('')
					}

					if (formData.address.village) {
						addressUpdates.push('village_id = ?')
						addressParams.push(formData.address.village)
					} else {
						addressUpdates.push('village_id = ?')
						addressParams.push('')
					}
				}
				// 2. If district changes (but province doesn't) → admin_post and village must also be updated
				else if (districtChanged && !provinceChanged) {
					addressUpdates.push('district_id = ?')
					addressParams.push(formData.address.district)

					if (formData.address.admin_post) {
						addressUpdates.push('admin_post_id = ?')
						addressParams.push(formData.address.admin_post)
					} else {
						addressUpdates.push('admin_post_id = ?')
						addressParams.push('')
					}

					if (formData.address.village) {
						addressUpdates.push('village_id = ?')
						addressParams.push(formData.address.village)
					} else {
						addressUpdates.push('village_id = ?')
						addressParams.push('')
					}
				}
				// 3. If admin_post changes (but province and district don't) → village must be updated
				else if (adminPostChanged && !provinceChanged && !districtChanged) {
					addressUpdates.push('admin_post_id = ?')
					addressParams.push(formData.address.admin_post)

					if (formData.address.village) {
						addressUpdates.push('village_id = ?')
						addressParams.push(formData.address.village)
					} else {
						addressUpdates.push('village_id = ?')
						addressParams.push('')
					}
				}
				// 4. If village changes (but province, district, admin_post don't) → only village is updated
				else if (villageChanged && !provinceChanged && !districtChanged && !adminPostChanged) {
					addressUpdates.push('village_id = ?')
					addressParams.push(formData.address.village)
				}
				// Handle other cases
				else {
					if (selectedFields.address.province && formData.address.province) {
						addressUpdates.push('province_id = ?')
						addressParams.push(formData.address.province)
					}
					if (selectedFields.address.district && formData.address.district) {
						addressUpdates.push('district_id = ?')
						addressParams.push(formData.address.district)
					}
					if (selectedFields.address.admin_post && formData.address.admin_post) {
						addressUpdates.push('admin_post_id = ?')
						addressParams.push(formData.address.admin_post)
					}
					if (selectedFields.address.village && formData.address.village) {
						addressUpdates.push('village_id = ?')
						addressParams.push(formData.address.village)
					}
				}

				// Update sync_id if district changes
				if (districtWillChange && newDistrictId) {
					addressUpdates.push('sync_id = ?')
					addressParams.push(newDistrictId)
				}

				if (addressUpdates.length > 0) {
					addressParams.push(id, 'GROUP')
					await updateOne(
						`UPDATE ${TABLES.ADDRESS_DETAILS} SET ${addressUpdates.join(', ')} WHERE owner_id = ? AND owner_type = ?`,
						addressParams,
					)
				}
			}

			// Update nuits table for NUIT
			if (selectedFields.nuit && formData.nuit.trim() && formData.nuit.trim() !== 'N/A') {
				const nuitUpdates: string[] = []
				const nuitParams: string[] = []

				nuitUpdates.push('nuit = ?')
				nuitParams.push(formData.nuit.trim())

				// Update sync_id if district changes
				if (districtWillChange && newDistrictId) {
					nuitUpdates.push('sync_id = ?')
					nuitParams.push(newDistrictId)
				}

				if (nuitUpdates.length > 0) {
					nuitParams.push(id)
					await updateOne(`UPDATE ${TABLES.NUITS} SET ${nuitUpdates.join(', ')} WHERE actor_id = ?`, nuitParams)
				}
			}

			// Update nuels table for NUEL
			if (selectedFields.nuel && formData.nuel.trim() && formData.nuel.trim() !== 'N/A') {
				const nuelUpdates: string[] = []
				const nuelParams: string[] = []

				nuelUpdates.push('nuel = ?')
				nuelParams.push(formData.nuel.trim())

				// Update sync_id if district changes
				if (districtWillChange && newDistrictId) {
					nuelUpdates.push('sync_id = ?')
					nuelParams.push(newDistrictId)
				}

				if (nuelUpdates.length > 0) {
					nuelParams.push(id)
					await updateOne(`UPDATE ${TABLES.NUELS} SET ${nuelUpdates.join(', ')} WHERE actor_id = ?`, nuelParams)
				}
			}

			// Update licenses table for license
			if (selectedFields.license && formData.license.trim() && formData.license.trim() !== 'N/A') {
				const licenseNumber = `${formData.license.trim()}-BUSINESS_LICENSE`

				// Check if license already exists
				if (organization.license_id) {
					// Update existing license
					const licenseUpdates: string[] = []
					const licenseParams: string[] = []

					licenseUpdates.push('number = ?')
					licenseParams.push(licenseNumber)

					// Update sync_id if district changes
					if (districtWillChange && newDistrictId) {
						licenseUpdates.push('sync_id = ?')
						licenseParams.push(newDistrictId)
					}

					if (licenseUpdates.length > 0) {
						licenseParams.push(organization.license_id)
						await updateOne(`UPDATE ${TABLES.LICENSES} SET ${licenseUpdates.join(', ')} WHERE id = ?`, licenseParams)
					}
				} else {
					// Insert new license
					const syncId = districtWillChange && newDistrictId ? newDistrictId : organization.district_id || ''
					const licenseRow = buildLicense({
						number: licenseNumber,
						owner_id: id,
						owner_type: 'GROUP',
						photo: '',
						issue_date: new Date().toISOString(),
						expiration_date: new Date().toISOString(),
						issue_place_id: syncId,
						issue_place_type: 'DISTRICT',
						sync_id: syncId,
					})
					await insertLicense(licenseRow)
				}
			}

			// Update actor_categories table for organizationType
			if (selectedFields.organizationType && formData.organizationType) {
				// Delete existing actor_categories for this organization
				await updateOne(`DELETE FROM ${TABLES.ACTOR_CATEGORIES} WHERE actor_id = ? AND category = 'GROUP'`, [id])

				// Insert new actor_category
				const syncId = districtWillChange && newDistrictId ? newDistrictId : organization.district_id || ''
				const actorCategoryRow = buildActorCategories({
					actor_id: id,
					category: 'GROUP',
					subcategory: formData.organizationType,
					sync_id: syncId,
				})
				await insertActorCategory(actorCategoryRow)
			}

			setSuccess(true)
		} catch (error) {
			console.error('Error updating organization:', error)
			setHasError(true)
			setErrorMessage('Erro ao actualizar os dados. Tente novamente.')
		}
	}

	const handleRequestPermission = () => {
		// TODO: Implement permission request logic
		console.log('Requesting update permission for organization:', id)
		showSuccess('Pedido de permissão para actualização enviado. Aguarde a aprovação.')
		setShowPermissionDialog(false)
	}

	// Organization type options
	const organizationTypeOptions = [
		{ label: 'Cooperativa', value: OrganizationTypes.COOPERATIVE },
		{ label: 'Associação', value: OrganizationTypes.ASSOCIATION },
		{ label: 'União de Cooperativas', value: OrganizationTypes.COOP_UNION },
	]

	if (resourceName !== ResourceName.GROUP) {
		return <Redirect href={'/(aux)/custom-redirect'} />
	}

	if (isLoadingOrganization) {
		return <Spinner />
	}

	return (
		<Animated.ScrollView
			entering={FadeIn.duration(500)}
			exiting={FadeOut.duration(500)}
			contentContainerStyle={{
				flexGrow: 1,
				paddingHorizontal: 16,
				paddingVertical: 24,
				paddingBottom: 100,
			}}
			className="bg-white dark:bg-black"
			showsVerticalScrollIndicator={false}
			keyboardShouldPersistTaps="handled"
		>
			{/* Header */}
			{!isDataLocked && (
				<FormItemDescription description="Seleccione os campos que deseja actualizar e forneça os novos valores" />
			)}

			{/* Current Organization Info Card */}
			{organization && (
				<ResourcePersonalCard
					photo={organization.photo}
					surname={ToPortuguese.formattedSurname('GROUP', ResourceName.GROUP)}
					otherNames={organization.other_names}
					nuit={organization.nuit && organization.nuit !== 'N/A' ? organization.nuit : 'N/A'}
				/>
			)}

			{/* Locked Data Warning */}
			{isDataLocked && (
				<EditPermissionCard
					setShowPermissionDialog={setShowPermissionDialog}
					title="Dados Guardados"
					description="Os dados desta organização foram actualizados há mais de 24 horas e não estão disponíveis para edição
					directa. Para actualizar os dados, é necessário solicitar permissão."
					buttonText="Solicitar Permissão"
				/>
			)}

			{!isDataLocked && organization && (
				<View>
					{/* Names Section */}
					<View className="mb-6">
						<EditSectionLabel icon="person-outline" label="Nome do Grupo" />
						<View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4">
							{/* Organization Name */}
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.names.other_names ? 'checked' : 'unchecked'}
									onPress={() => toggleField('names', 'other_names')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Nome do Grupo" />
									{selectedFields.names.other_names && (
										<CustomTextInput
											label=""
											value={formData.names.other_names}
											onChangeText={(text) => updateFormData('names', 'other_names', text)}
											placeholder="Digite o novo nome"
											autoCapitalize="words"
										/>
									)}
									{!selectedFields.names.other_names && organization && (
										<EditFormField label="" value={organization.other_names || 'N/A'} />
									)}
								</View>
							</View>
						</View>
					</View>

					{/* Organization Type Section */}
					<View className="mb-6">
						<EditSectionLabel icon="grid-outline" label="Tipo de Grupo" />
						<View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.organizationType ? 'checked' : 'unchecked'}
									onPress={() => toggleField('organizationType')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Tipo de Grupo" />
									{selectedFields.organizationType && (
										<View>
											<CustomSelectItemTrigger
												resetItem={() => {
													updateFormData('organizationType', 'organizationType', '')
												}}
												hasSelectedItem={!!formData.organizationType}
												setShowItems={() => setShowOrganizationTypeModal(true)}
												selectedItem={
													formData.organizationType
														? organizationTypeOptions.find((opt) => opt.value === formData.organizationType)?.label ||
															'Seleccione o tipo'
														: 'Seleccione o tipo'
												}
											/>
											<CustomSelectItem
												label="Tipo de Grupo"
												searchPlaceholder="Pesquise por tipo"
												showModal={showOrganizationTypeModal}
												emptyMessage="Nenhum tipo encontrado"
												setShowModal={setShowOrganizationTypeModal}
												itemsList={organizationTypeOptions}
												setValue={(val) => {
													updateFormData('organizationType', 'organizationType', val)
												}}
											/>
										</View>
									)}
									{!selectedFields.organizationType && organization && (
										<EditFormField
											label=""
											value={
												organization.organizationType === OrganizationTypes.COOPERATIVE
													? 'Cooperativa'
													: organization.organizationType === OrganizationTypes.ASSOCIATION
														? 'Associação'
														: organization.organizationType === OrganizationTypes.COOP_UNION
															? 'União de Cooperativas'
															: organization.organizationType || 'N/A'
											}
										/>
									)}
								</View>
							</View>
						</View>
					</View>

					{/* Address Section */}
					<View className="mb-6">
						<EditSectionLabel icon="location-outline" label="Endereço" />
						<View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4">
							{/* Province */}
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.address.province ? 'checked' : 'unchecked'}
									onPress={() => toggleField('address', 'province')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Província" />
									{selectedFields.address.province && (
										<SelectLocationName
											currentValue={formData.address.province}
											onChange={(value) => updateFormData('address', 'province', value)}
											placeholder="Seleccione a província"
											valueName="province"
											locationType={LocationType.PROVINCE}
											referenceId=""
										/>
									)}
									{!selectedFields.address.province && organization && (
										<EditFormField label="" value={provinceName || 'N/A'} />
									)}
								</View>
							</View>

							{/* District */}
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.address.district ? 'checked' : 'unchecked'}
									onPress={() => toggleField('address', 'district')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Distrito" />
									{selectedFields.address.district && selectedFields.address.province && (
										<SelectLocationName
											currentValue={formData.address.district}
											onChange={(value) => updateFormData('address', 'district', value)}
											placeholder="Seleccione o distrito"
											valueName="district"
											locationType={LocationType.DISTRICT}
											referenceId={formData.address.province}
										/>
									)}
									{!selectedFields.address.district && organization && (
										<EditFormField label="" value={districtName || 'N/A'} />
									)}
									{selectedFields.address.district && !selectedFields.address.province && (
										<FieldLabel label="Seleccione primeiro a província" />
									)}
								</View>
							</View>

							{/* Admin Post */}
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.address.admin_post ? 'checked' : 'unchecked'}
									onPress={() => toggleField('address', 'admin_post')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Posto Administrativo" />
									{selectedFields.address.admin_post && selectedFields.address.district && (
										<SelectLocationName
											currentValue={formData.address.admin_post}
											onChange={(value) => updateFormData('address', 'admin_post', value)}
											placeholder="Seleccione o posto administrativo"
											valueName="admin_post"
											locationType={LocationType.ADMIN_POST}
											referenceId={formData.address.district}
										/>
									)}
									{!selectedFields.address.admin_post && organization && (
										<EditFormField label="" value={adminPostName || 'N/A'} />
									)}
									{selectedFields.address.admin_post && !selectedFields.address.district && (
										<FieldLabel label="Seleccione primeiro o distrito" />
									)}
								</View>
							</View>

							{/* Village */}
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.address.village ? 'checked' : 'unchecked'}
									onPress={() => toggleField('address', 'village')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Localidade" />
									{selectedFields.address.village && selectedFields.address.admin_post && (
										<SelectLocationName
											currentValue={formData.address.village}
											onChange={(value) => updateFormData('address', 'village', value)}
											placeholder="Seleccione a localidade"
											valueName="village"
											locationType={LocationType.VILLAGE}
											referenceId={formData.address.admin_post}
										/>
									)}
									{!selectedFields.address.village && organization && (
										<EditFormField label="" value={villageName || 'N/A'} />
									)}
									{selectedFields.address.village && !selectedFields.address.admin_post && (
										<FieldLabel label="Seleccione primeiro o posto administrativo" />
									)}
								</View>
							</View>
						</View>
					</View>

					{/* NUIT Section */}
					<View className="mb-6">
						<EditSectionLabel icon="card-outline" label="NUIT" />
						<View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.nuit ? 'checked' : 'unchecked'}
									onPress={() => toggleField('nuit')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Número de Identificação Fiscal" />
									{selectedFields.nuit && (
										<CustomTextInput
											label=""
											value={formData.nuit}
											onChangeText={(text) => updateFormData('nuit', 'nuit', text)}
											placeholder="Digite o novo NUIT (9 dígitos)"
											keyboardType="numeric"
										/>
									)}
									{!selectedFields.nuit && organization && (
										<EditFormField
											label=""
											value={organization.nuit && organization.nuit !== 'N/A' ? organization.nuit : 'N/A'}
										/>
									)}
								</View>
							</View>
						</View>
					</View>

					{/* NUEL Section */}
					<View className="mb-6">
						<EditSectionLabel icon="card-outline" label="NUEL" />
						<View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.nuel ? 'checked' : 'unchecked'}
									onPress={() => toggleField('nuel')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Número Único de Entidade Legal" />
									{selectedFields.nuel && (
										<CustomTextInput
											label=""
											value={formData.nuel}
											onChangeText={(text) => updateFormData('nuel', 'nuel', text)}
											placeholder="Digite o novo NUEL (9 dígitos)"
											keyboardType="numeric"
										/>
									)}
									{!selectedFields.nuel && organization && (
										<EditFormField
											label=""
											value={organization.nuel && organization.nuel !== 'N/A' ? organization.nuel : 'N/A'}
										/>
									)}
								</View>
							</View>
						</View>
					</View>

					{/* License Section */}
					<View className="mb-6">
						<EditSectionLabel icon="document-text-outline" label="Licença" />
						<View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.license ? 'checked' : 'unchecked'}
									onPress={() => toggleField('license')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Número da Licença" />
									{selectedFields.license && (
										<CustomTextInput
											label=""
											value={formData.license}
											onChangeText={(text) => updateFormData('license', 'license', text)}
											placeholder="Digite o novo número da licença"
										/>
									)}
									{!selectedFields.license && organization && (
										<EditFormField
											label=""
											value={organization.license && organization.license !== 'N/A' ? organization.license : 'N/A'}
										/>
									)}
								</View>
							</View>
						</View>
					</View>

					{/* Submit Button */}
					<View className="pt-6">
						<SubmitButton onPress={handleSubmit} title="Actualizar" disabled={isDataLocked} />
					</View>
				</View>
			)}

			{/* Permission Request Dialog */}
			<CustomConfirmDialg
				visible={showPermissionDialog}
				setVisible={setShowPermissionDialog}
				title="Solicitar Permissão para Actualização"
				message="Deseja solicitar permissão para actualizar os dados desta organização? O pedido será enviado para aprovação."
				yesText="Sim, Solicitar"
				noText="Cancelar"
				yesCallback={handleRequestPermission}
				noCallback={() => setShowPermissionDialog(false)}
			/>
		</Animated.ScrollView>
	)
}
