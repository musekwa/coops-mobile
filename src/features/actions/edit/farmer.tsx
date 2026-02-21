import { View, Text } from 'react-native'
import { useState, useEffect, useMemo } from 'react'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useQueryOneAndWatchChanges } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { ResourceName, LocationType } from 'src/types'
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
import CustomConfirmDialg from 'src/components/dialogs/CustomConfirmDialg'
import ResourcePersonalCard from './components/resource-personal-card'
import { Spinner } from 'src/components/loaders'
import CustomSelectItem from 'src/components/ui/custom-select-item'
import CustomSelectItemTrigger from 'src/components/ui/custom-select-item-trigger'
import idDocTypes from 'src/constants/idDocTypes'
import { EditPermissionCard } from './components/edit-permission-card'
import EditSectionLabel from './components/edit-section-label'
import EditFormField from './components/edit-form-field'
import FieldLabel from './components/field-label'
import { Redirect } from 'expo-router'
import { ToPortuguese } from 'src/helpers/translate'

type FieldGroup = 'names' | 'address' | 'contacts' | 'nuit' | 'documents'

type SelectedFields = {
	names: {
		surname: boolean
		other_names: boolean
	}
	address: {
		province: boolean
		district: boolean
		admin_post: boolean
		village: boolean
	}
	contacts: {
		phone1: boolean
		phone2: boolean
	}
	nuit: boolean
	documents: {
		document_type: boolean
		document_number: boolean
	}
}

type FormData = {
	names: {
		surname: string
		other_names: string
	}
	address: {
		province: string
		district: string
		admin_post: string
		village: string
	}
	contacts: {
		phone1: string
		phone2: string
	}
	nuit: string
	documents: {
		document_type: string
		document_number: string
	}
}

type FarmerData = {
	id: string
	surname: string
	other_names: string
	photo?: string
	nuit?: string
	address_id?: string
	contact_id?: string
	document_id?: string
	updated_at?: string
	province_id?: string
	district_id?: string
	admin_post_id?: string
	village_id?: string
	phone1?: string
	phone2?: string
	document_type?: string
	document_number?: string
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

export const FarmerEdit = ({
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
		names: { surname: false, other_names: false },
		address: { province: false, district: false, admin_post: false, village: false },
		contacts: { phone1: false, phone2: false },
		nuit: false,
		documents: { document_type: false, document_number: false },
	})

	const [formData, setFormData] = useState<FormData>({
		names: { surname: '', other_names: '' },
		address: { province: '', district: '', admin_post: '', village: '' },
		contacts: { phone1: '', phone2: '' },
		nuit: '',
		documents: { document_type: '', document_number: '' },
	})

	// State for location names
	const [provinceName, setProvinceName] = useState<string>('')
	const [districtName, setDistrictName] = useState<string>('')
	const [adminPostName, setAdminPostName] = useState<string>('')
	const [villageName, setVillageName] = useState<string>('')
	const [showPermissionDialog, setShowPermissionDialog] = useState(false)
	const [showDocumentTypeModal, setShowDocumentTypeModal] = useState(false)

	// Query farmer data with all related information from normalized tables
	const farmerQuery = `
		SELECT 
			ad.actor_id as id,
			ad.surname,
			ad.other_names,
			ad.photo,
			ad.updated_at,
			addr.id as address_id,
			addr.province_id,
			addr.district_id,
			addr.admin_post_id,
			addr.village_id,
			cd.id as contact_id,
			cd.primary_phone as phone1,
			cd.secondary_phone as phone2,
			adoc.id as document_id,
			adoc.type as document_type,
			adoc.number as document_number,
			n.nuit
		FROM ${TABLES.ACTOR_DETAILS} ad
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'FARMER'
		LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'FARMER'
		LEFT JOIN ${TABLES.ACTOR_DOCUMENTS} adoc ON adoc.owner_id = ad.actor_id AND adoc.owner_type = 'FARMER'
		LEFT JOIN ${TABLES.NUITS} n ON n.actor_id = ad.actor_id
		WHERE ad.actor_id = ?
	`

	const { data: farmer, isLoading: isLoadingFarmer } = useQueryOneAndWatchChanges<FarmerData>(farmerQuery, [String(id)])

	// Check if farmer data is locked (updated more than 24 hours ago)
	const isDataLocked = useMemo(() => {
		if (!farmer?.updated_at) return false
		const updatedAt = new Date(farmer.updated_at)
		const now = new Date()
		const hoursSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)
		return hoursSinceUpdate > 24
	}, [farmer?.updated_at])

	// Surname editing is not allowed for farmers
	const isSurnameDisabled = useMemo(() => {
		return true
	}, [])

	// Update form data when farmer data loads
	useEffect(() => {
		if (farmer) {
			setFormData({
				names: {
					surname: farmer.surname || '',
					other_names: farmer.other_names || '',
				},
				address: {
					province: farmer.province_id || '',
					district: farmer.district_id || '',
					admin_post: farmer.admin_post_id || '',
					village: farmer.village_id || '',
				},
				contacts: {
					phone1: farmer.phone1 || '',
					phone2: farmer.phone2 || '',
				},
				nuit: farmer.nuit || '',
				documents: {
					document_type: farmer.document_type || '',
					document_number: farmer.document_number || '',
				},
			})
		}
	}, [farmer])

	// Unselect surname if it contains 'company'
	useEffect(() => {
		if (isSurnameDisabled && selectedFields.names.surname) {
			setSelectedFields((prev) => ({
				...prev,
				names: {
					...prev.names,
					surname: false,
				},
			}))
		}
	}, [isSurnameDisabled, selectedFields.names.surname])

	// Fetch location names when farmer data loads
	useEffect(() => {
		const fetchLocationNames = async () => {
			if (farmer) {
				if (farmer.province_id) {
					try {
						const name = await getFullProvinceNameById(farmer.province_id)
						setProvinceName(name || 'N/A')
					} catch (error) {
						setProvinceName('N/A')
					}
				}
				if (farmer.district_id) {
					try {
						const name = await getFullDistrictNameById(farmer.district_id)
						setDistrictName(name || 'N/A')
					} catch (error) {
						setDistrictName('N/A')
					}
				}
				if (farmer.admin_post_id) {
					try {
						const name = await getFullAdminPostNameById(farmer.admin_post_id)
						setAdminPostName(name || 'N/A')
					} catch (error) {
						setAdminPostName('N/A')
					}
				}
				if (farmer.village_id) {
					try {
						const name = await getFullVillageNameById(farmer.village_id)
						setVillageName(name || 'N/A')
					} catch (error) {
						setVillageName('N/A')
					}
				}
			}
		}
		fetchLocationNames()
	}, [farmer, getFullProvinceNameById, getFullDistrictNameById, getFullAdminPostNameById, getFullVillageNameById])

	const toggleField = (group: FieldGroup, field?: string) => {
		// Prevent toggling surname if it contains 'company'
		if (group === 'names' && field === 'surname' && isSurnameDisabled) {
			return
		}

		setSelectedFields((prev) => {
			if (group === 'nuit') {
				return { ...prev, nuit: !prev.nuit }
			}
			if (field) {
				const groupData = prev[group] as Record<string, boolean>
				const newValue = !groupData[field]

				// Handle cascading for address fields
				if (group === 'address') {
					if (field === 'province' && newValue) {
						// When province is selected, unselect and reset district, admin_post, village
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
						// When district is selected, ensure province is selected, unselect admin_post and village
						if (!prev.address.province) {
							return prev // Can't select district without province
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
						// When admin_post is selected, ensure district is selected, unselect village
						if (!prev.address.district) {
							return prev // Can't select admin_post without district
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
						// When village is selected, ensure admin_post is selected
						if (!prev.address.admin_post) {
							return prev // Can't select village without admin_post
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
			const groupData = prev[group] as Record<string, string>

			// Handle cascading reset for address fields
			if (group === 'address') {
				if (field === 'province') {
					// When province changes, reset district, admin_post, and village
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
					// When district changes, reset admin_post and village
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
					// When admin_post changes, reset village
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
		// Check if at least one field is selected (exclude documents for companies)
		const hasSelection =
			selectedFields.names.surname ||
			selectedFields.names.other_names ||
			selectedFields.address.province ||
			selectedFields.address.district ||
			selectedFields.address.admin_post ||
			selectedFields.address.village ||
			selectedFields.contacts.phone1 ||
			selectedFields.contacts.phone2 ||
			selectedFields.nuit ||
			(!isSurnameDisabled && (selectedFields.documents.document_type || selectedFields.documents.document_number))

		if (!hasSelection) {
			setHasError(true)
			setErrorMessage('Seleccione pelo menos um campo para actualizar')
			return
		}

		if (!farmer) {
			setHasError(true)
			setErrorMessage('Dados do produtor não encontrados')
			return
		}

		// Validate cascading address requirements
		// Check if province actually changed
		const provinceChanged =
			selectedFields.address.province && formData.address.province && formData.address.province !== farmer.province_id
		// Check if district actually changed
		const districtChanged =
			selectedFields.address.district && formData.address.district && formData.address.district !== farmer.district_id
		// Check if admin_post actually changed
		const adminPostChanged =
			selectedFields.address.admin_post &&
			formData.address.admin_post &&
			formData.address.admin_post !== farmer.admin_post_id
		// Check if village actually changed
		const villageChanged =
			selectedFields.address.village && formData.address.village && formData.address.village !== farmer.village_id

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
				setErrorMessage('Ao alterar o posto administrativo, deve também seleccionar e preencher a aldeia')
				return
			}
		}

		try {
			setHasError(false)
			setErrorMessage('')

			// Validate for duplicates before proceeding with updates
			// Check for duplicate phone numbers
			if (selectedFields.contacts.phone1 && formData.contacts.phone1.trim()) {
				try {
					const existingPhone = await powersync.get<{ owner_id: string }>(
						`SELECT owner_id FROM ${TABLES.CONTACT_DETAILS} WHERE (primary_phone = ? OR secondary_phone = ?) AND owner_id != ? AND owner_type = 'FARMER' LIMIT 1`,
						[formData.contacts.phone1.trim(), formData.contacts.phone1.trim(), id],
					)
					if (existingPhone) {
						setHasError(true)
						setErrorMessage(`Este número de telefone principal já está registado para outro actor.`)
						return
					}
				} catch (error: any) {
					// Ignore "Result set is empty" error - means no duplicate
					if (!error?.message?.includes('Result set is empty') && !String(error).includes('Result set is empty')) {
						console.error('Error checking duplicate phone1:', error)
					}
				}
			}

			if (selectedFields.contacts.phone2 && formData.contacts.phone2.trim()) {
				try {
					const existingPhone = await powersync.get<{ owner_id: string }>(
						`SELECT owner_id FROM ${TABLES.CONTACT_DETAILS} WHERE (primary_phone = ? OR secondary_phone = ?) AND owner_id != ? AND owner_type = 'FARMER' LIMIT 1`,
						[formData.contacts.phone2.trim(), formData.contacts.phone2.trim(), id],
					)
					if (existingPhone) {
						setHasError(true)
						setErrorMessage(`Este número de telefone secundário já está registado para outro actor.`)
						return
					}
				} catch (error: any) {
					// Ignore "Result set is empty" error - means no duplicate
					if (!error?.message?.includes('Result set is empty') && !String(error).includes('Result set is empty')) {
						console.error('Error checking duplicate phone2:', error)
					}
				}
			}

			// Check for duplicate NUIT
			if (selectedFields.nuit && formData.nuit.trim()) {
				try {
					const existingNuit = await powersync.get<{ actor_id: string }>(
						`SELECT actor_id FROM ${TABLES.NUITS} WHERE nuit = ? AND actor_id != ? LIMIT 1`,
						[formData.nuit.trim(), id],
					)
					if (existingNuit) {
						setHasError(true)
						setErrorMessage(`NUIT ${formData.nuit.trim()} já está registado para outro actor.`)
						return
					}
				} catch (error: any) {
					// Ignore "Result set is empty" error - means no duplicate
					if (!error?.message?.includes('Result set is empty') && !String(error).includes('Result set is empty')) {
						console.error('Error checking duplicate NUIT:', error)
					}
				}
			}

			// Check for duplicate actor document (type + number)
			if (
				!isSurnameDisabled &&
				selectedFields.documents.document_type &&
				selectedFields.documents.document_number &&
				formData.documents.document_type.trim() &&
				formData.documents.document_number.trim()
			) {
				try {
					const existingDoc = await powersync.get<{ owner_id: string }>(
						`SELECT owner_id FROM ${TABLES.ACTOR_DOCUMENTS} WHERE type = ? AND number = ? AND owner_id != ? AND owner_type = 'FARMER' LIMIT 1`,
						[formData.documents.document_type.trim(), formData.documents.document_number.trim(), id],
					)
					if (existingDoc) {
						setHasError(true)
						setErrorMessage(
							`Este documento (${formData.documents.document_type.trim()} - ${formData.documents.document_number.trim()}) já está registado para outro actor.`,
						)
						return
					}
				} catch (error: any) {
					// Ignore "Result set is empty" error - means no duplicate
					if (!error?.message?.includes('Result set is empty') && !String(error).includes('Result set is empty')) {
						console.error('Error checking duplicate document:', error)
					}
				}
			}

			// Determine if district will change (needed for sync_id update)
			const districtWillChange =
				(selectedFields.address.province &&
					formData.address.province &&
					formData.address.province !== farmer.province_id) ||
				(selectedFields.address.district &&
					formData.address.district &&
					formData.address.district !== farmer.district_id)

			const newDistrictId =
				districtWillChange && formData.address.district ? formData.address.district : farmer.district_id || ''

			// Update actor_details table (names and sync_id if district changes)
			const farmerUpdates: string[] = []
			const farmerParams: string[] = []

			if (selectedFields.names.surname && formData.names.surname.trim() && !isSurnameDisabled) {
				farmerUpdates.push('surname = ?')
				farmerParams.push(formData.names.surname.trim())
			}

			if (selectedFields.names.other_names && formData.names.other_names.trim()) {
				farmerUpdates.push('other_names = ?')
				farmerParams.push(formData.names.other_names.trim())
			}

			// Update sync_id if district changes
			if (districtWillChange && newDistrictId) {
				farmerUpdates.push('sync_id = ?')
				farmerParams.push(newDistrictId)
			}

			if (farmerUpdates.length > 0) {
				farmerUpdates.push('updated_at = ?')
				farmerParams.push(new Date().toISOString(), id)
				await updateOne(
					`UPDATE ${TABLES.ACTOR_DETAILS} SET ${farmerUpdates.join(', ')} WHERE actor_id = ?`,
					farmerParams,
				)
			}

			// Update address_details table with cascading logic
			// Reuse provinceChanged, districtChanged, adminPostChanged, villageChanged from validation above
			if (provinceChanged || districtChanged || adminPostChanged || villageChanged) {
				const addressUpdates: string[] = []
				const addressParams: string[] = []

				// Cascading logic:
				// 1. If province changes → district, admin_post, and village must also be updated
				if (provinceChanged) {
					addressUpdates.push('province_id = ?')
					addressParams.push(formData.address.province)

					// District must be updated (use formData value if available, otherwise reset)
					if (formData.address.district) {
						addressUpdates.push('district_id = ?')
						addressParams.push(formData.address.district)
					} else {
						addressUpdates.push('district_id = ?')
						addressParams.push('')
					}

					// Admin_post must be updated
					if (formData.address.admin_post) {
						addressUpdates.push('admin_post_id = ?')
						addressParams.push(formData.address.admin_post)
					} else {
						addressUpdates.push('admin_post_id = ?')
						addressParams.push('')
					}

					// Village must be updated
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

					// Admin_post must be updated
					if (formData.address.admin_post) {
						addressUpdates.push('admin_post_id = ?')
						addressParams.push(formData.address.admin_post)
					} else {
						addressUpdates.push('admin_post_id = ?')
						addressParams.push('')
					}

					// Village must be updated
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

					// Village must be updated
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
				// Handle other cases (fields selected but values haven't changed - shouldn't normally happen)
				else {
					// Only update explicitly selected fields that have values
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
					addressParams.push(id, 'FARMER')
					await updateOne(
						`UPDATE ${TABLES.ADDRESS_DETAILS} SET ${addressUpdates.join(', ')} WHERE owner_id = ? AND owner_type = ?`,
						addressParams,
					)
				}
			}

			// Update contact_details table
			if (selectedFields.contacts.phone1 || selectedFields.contacts.phone2) {
				const contactUpdates: string[] = []
				const contactParams: string[] = []

				if (selectedFields.contacts.phone1 && formData.contacts.phone1.trim()) {
					contactUpdates.push('primary_phone = ?')
					contactParams.push(formData.contacts.phone1.trim())
				}

				if (selectedFields.contacts.phone2 && formData.contacts.phone2.trim()) {
					contactUpdates.push('secondary_phone = ?')
					contactParams.push(formData.contacts.phone2.trim())
				}

				// Update sync_id if district changes
				if (districtWillChange && newDistrictId) {
					contactUpdates.push('sync_id = ?')
					contactParams.push(newDistrictId)
				}

				if (contactUpdates.length > 0) {
					contactParams.push(id, 'FARMER')
					await updateOne(
						`UPDATE ${TABLES.CONTACT_DETAILS} SET ${contactUpdates.join(', ')} WHERE owner_id = ? AND owner_type = ?`,
						contactParams,
					)
				}
			}

			// Update actor_documents table (only if not a company)
			if (!isSurnameDisabled && (selectedFields.documents.document_type || selectedFields.documents.document_number)) {
				const documentUpdates: string[] = []
				const documentParams: string[] = []

				if (selectedFields.documents.document_type && formData.documents.document_type.trim()) {
					documentUpdates.push('type = ?')
					documentParams.push(formData.documents.document_type.trim())
				}

				if (selectedFields.documents.document_number && formData.documents.document_number.trim()) {
					documentUpdates.push('number = ?')
					documentParams.push(formData.documents.document_number.trim())
				}

				// Update sync_id if district changes
				if (districtWillChange && newDistrictId) {
					documentUpdates.push('sync_id = ?')
					documentParams.push(newDistrictId)
				}

				if (documentUpdates.length > 0) {
					documentParams.push(id, 'FARMER')
					await updateOne(
						`UPDATE ${TABLES.ACTOR_DOCUMENTS} SET ${documentUpdates.join(', ')} WHERE owner_id = ? AND owner_type = ?`,
						documentParams,
					)
				}
			}

			// Update nuits table for NUIT
			if (selectedFields.nuit && formData.nuit.trim()) {
				const nuitUpdates: string[] = []
				const nuitParams: string[] = []

				nuitUpdates.push('nuit = ?')
				nuitParams.push(formData.nuit.trim())

				// Update sync_id if district changes
				if (districtWillChange && newDistrictId) {
					nuitUpdates.push('sync_id = ?')
					nuitParams.push(newDistrictId)
				}

				nuitParams.push(id)
				await updateOne(`UPDATE ${TABLES.NUITS} SET ${nuitUpdates.join(', ')} WHERE actor_id = ?`, nuitParams)
			}

			setSuccess(true)
		} catch (error) {
			console.error('Error updating farmer:', error)
			setHasError(true)
			setErrorMessage('Erro ao actualizar os dados. Tente novamente.')
		}
	}

	const handleRequestPermission = () => {
		// TODO: Implement permission request logic (e.g., API call to request update permission)
		console.log('Requesting update permission for farmer:', id)
		showSuccess('Pedido de permissão para actualização enviado. Aguarde a aprovação.')
		setShowPermissionDialog(false)
	}

	if (resourceName !== ResourceName.FARMER) {
		return (
			<Redirect href={'/(aux)/custom-redirect'} />
		)
	}

	if (isLoadingFarmer) {
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

			{/* Current Farmer Info Card */}
			{farmer && (
				<ResourcePersonalCard
					photo={farmer.photo}
					surname={ToPortuguese.formattedSurname(farmer.surname, ResourceName.FARMER)}
					otherNames={farmer.other_names}
					nuit={farmer.nuit && farmer.nuit !== 'N/A' ? farmer.nuit : 'N/A'}
				/>
			)}

			{/* Locked Data Warning */}
			{isDataLocked && (
				<EditPermissionCard
					setShowPermissionDialog={setShowPermissionDialog}
					title="Dados Guardados"
					description="Os dados deste produtor foram actualizados há mais de 24 horas e não estão disponíveis para edição
					directa. Para actualizar os dados, é necessário solicitar permissão."
					buttonText="Solicitar Permissão"
				/>
			)}

			{!isDataLocked && farmer && (
				<View>
					{/* Names Section */}
					<View className="mb-6">
						<EditSectionLabel icon="person-outline" label="Nomes" />
						<View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4">
							{/* Surname */}
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.names.surname ? 'checked' : 'unchecked'}
									onPress={() => toggleField('names', 'surname')}
									color={colors.primary}
									disabled={isSurnameDisabled}
									uncheckedColor={isSurnameDisabled ? colors.gray600 : colors.primary}
								/>
								<View className="flex-1 ml-2">
									<EditFormField label="Apelido" isDisabled={isSurnameDisabled} value={ToPortuguese.formattedSurname(farmer?.surname || '', ResourceName.FARMER) || 'N/A'} />
									{selectedFields.names.surname && !isSurnameDisabled && (
										<CustomTextInput
											label=""
											value={formData.names.surname}
											onChangeText={(text) => updateFormData('names', 'surname', text)}
											placeholder="Digite o novo apelido"
											autoCapitalize="words"
										/>
									)}
									{!selectedFields.names.surname && farmer && (
										<EditFormField label="" value={ToPortuguese.formattedSurname(farmer?.surname || '', ResourceName.FARMER) || 'N/A'}  />
									)}
								</View>
							</View>

							{/* Other Names */}
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.names.other_names ? 'checked' : 'unchecked'}
									onPress={() => toggleField('names', 'other_names')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Outros Nomes" />
									{selectedFields.names.other_names && (
										<CustomTextInput
											label=""
											value={formData.names.other_names}
											onChangeText={(text) => updateFormData('names', 'other_names', text)}
											placeholder="Digite os novos nomes"
											autoCapitalize="words"
										/>
									)}
									{!selectedFields.names.other_names && farmer && (
										<EditFormField label="" value={farmer.other_names || 'N/A'}  />
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
									{!selectedFields.address.province && farmer && (
										<EditFormField label="" value={provinceName || 'N/A'}  />
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
									{!selectedFields.address.district && farmer && (
										<EditFormField label="" value={districtName || 'N/A'}  />
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
									{!selectedFields.address.admin_post && farmer && (
										<EditFormField label="" value={adminPostName || 'N/A'}  />
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
									{!selectedFields.address.village && farmer && (
										<EditFormField label="" value={villageName || 'N/A'}  />
									)}
									{selectedFields.address.village && !selectedFields.address.admin_post && (
										<FieldLabel label="Seleccione primeiro o posto administrativo" />
									)}
								</View>
							</View>
						</View>
					</View>

					{/* Contacts Section */}
					<View className="mb-6">
						<EditSectionLabel icon="call-outline" label="Contactos" />
						<View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4">
							{/* Phone 1 */}
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.contacts.phone1 ? 'checked' : 'unchecked'}
									onPress={() => toggleField('contacts', 'phone1')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Telefone Principal" />
									{selectedFields.contacts.phone1 && (
										<CustomTextInput
											label=""
											value={formData.contacts.phone1}
											onChangeText={(text) => updateFormData('contacts', 'phone1', text)}
											placeholder="Digite o novo número"
											keyboardType="phone-pad"
										/>
									)}
									{!selectedFields.contacts.phone1 && farmer && (
										<EditFormField label="" value={farmer.phone1 || 'N/A'}  />
									)}
								</View>
							</View>

							{/* Phone 2 */}
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.contacts.phone2 ? 'checked' : 'unchecked'}
									onPress={() => toggleField('contacts', 'phone2')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Telefone Secundário" />
									{selectedFields.contacts.phone2 && (
										<CustomTextInput
											label=""
											value={formData.contacts.phone2}
											onChangeText={(text) => updateFormData('contacts', 'phone2', text)}
											placeholder="Digite o novo número"
											keyboardType="phone-pad"
										/>
									)}
									{!selectedFields.contacts.phone2 && farmer && (
										<EditFormField label="" value={farmer.phone2 || 'N/A'}  />
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
									{!selectedFields.nuit && farmer && (
										<EditFormField label="" value={farmer.nuit && farmer.nuit !== 'N/A' ? farmer.nuit : 'N/A'}  />
									)}
								</View>
							</View>
						</View>
					</View>

					{/* Documents Section - Only show if not a company */}
					{!isSurnameDisabled && (
						<View className="mb-6">
							<EditSectionLabel icon="document-text-outline" label="Documentos" />
							<View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4">
								{/* Document Type */}
								<View className="flex-row items-start">
									<Checkbox
										status={selectedFields.documents.document_type ? 'checked' : 'unchecked'}
										onPress={() => toggleField('documents', 'document_type')}
										color={colors.primary}
									/>
									<View className="flex-1 ml-2">
										<FieldLabel label="Tipo de Documento" />
										{selectedFields.documents.document_type && (
											<>
												<CustomSelectItemTrigger
													resetItem={() => {
														updateFormData('documents', 'document_type', '')
													}}
													hasSelectedItem={!!formData.documents.document_type}
													setShowItems={() => setShowDocumentTypeModal(true)}
													selectedItem={formData.documents.document_type || 'Seleccione um tipo de documento'}
												/>
												<CustomSelectItem
													label="Tipo de Documento"
													searchPlaceholder="Pesquise por um tipo de documento"
													showModal={showDocumentTypeModal}
													emptyMessage="Nenhum tipo de documento encontrado"
													setShowModal={setShowDocumentTypeModal}
													itemsList={idDocTypes.map((type) => ({ label: type, value: type }))}
													setValue={(val) => {
														updateFormData('documents', 'document_type', val)
													}}
												/>
											</>
										)}
										{!selectedFields.documents.document_type && farmer && (
											<EditFormField label="" value={farmer.document_type || 'N/A'}  />
										)}
									</View>
								</View>

								{/* Document Number */}
								<View className="flex-row items-start">
									<Checkbox
										status={selectedFields.documents.document_number ? 'checked' : 'unchecked'}
										onPress={() => toggleField('documents', 'document_number')}
										color={colors.primary}
									/>
									<View className="flex-1 ml-2">
										<FieldLabel label="Número do Documento" />
										{selectedFields.documents.document_number && (
											<CustomTextInput
												label=""
												value={formData.documents.document_number}
												onChangeText={(text) => updateFormData('documents', 'document_number', text)}
												placeholder="Digite o novo número do documento"
											/>
										)}
										{!selectedFields.documents.document_number && farmer && (
											<EditFormField label="" value={farmer.document_number || 'N/A'}  />
										)}
									</View>
								</View>
							</View>
						</View>
					)}

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
				message="Deseja solicitar permissão para actualizar os dados deste produtor? O pedido será enviado para aprovação."
				yesText="Sim, Solicitar"
				noText="Cancelar"
				yesCallback={handleRequestPermission}
				noCallback={() => setShowPermissionDialog(false)}
			/>
		</Animated.ScrollView>
	)
}
