import { View, Text } from 'react-native'
import { useState, useEffect, useMemo } from 'react'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useQueryOneAndWatchChanges } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { ResourceName, LocationType, MultiCategory } from 'src/types'
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
import CustomConfirmDialg from 'src/components/dialogs/CustomConfirmDialg'
import ResourcePersonalCard from './components/resource-personal-card'
import { Spinner } from 'src/components/loaders'
import { EditPermissionCard } from './components/edit-permission-card'
import EditSectionLabel from './components/edit-section-label'
import EditFormField from './components/edit-form-field'
import FieldLabel from './components/field-label'
import { Redirect } from 'expo-router'
import { ToPortuguese } from 'src/helpers/translate'
import { traderCategories } from 'src/data/trader_categories'

type FieldGroup = 'names' | 'address' | 'contacts' | 'nuit' | 'multicategory'

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
	multicategory: boolean
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
	multicategory: string[]
}

type TraderData = {
	id: string
	surname: string
	other_names: string
	photo?: string
	nuit: string
	multicategory: string
	address_id?: string
	contact_id?: string
	updated_at?: string
	province_id?: string
	district_id?: string
	admin_post_id?: string
	village_id?: string
	phone1?: string
	phone2?: string
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

export const TraderEdit = ({
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
		multicategory: false,
	})

	const [formData, setFormData] = useState<FormData>({
		names: { surname: '', other_names: '' },
		address: { province: '', district: '', admin_post: '', village: '' },
		contacts: { phone1: '', phone2: '' },
		nuit: '',
		multicategory: [],
	})

	// State for location names
	const [provinceName, setProvinceName] = useState<string>('')
	const [districtName, setDistrictName] = useState<string>('')
	const [adminPostName, setAdminPostName] = useState<string>('')
	const [villageName, setVillageName] = useState<string>('')
	const [showPermissionDialog, setShowPermissionDialog] = useState(false)

	// Query trader data with all related information from normalized tables
	const traderQuery = `
		SELECT 
			ad.actor_id as id,
			ad.surname,
			ad.other_names,
			ad.photo,
			ad.updated_at,
			COALESCE(n.nuit, 'N/A') as nuit,
			COALESCE(g.name, 'N/A') as gender,
			GROUP_CONCAT(ac.subcategory, ';') as multicategory,
			addr.id as address_id,
			addr.province_id,
			addr.district_id,
			addr.admin_post_id,
			addr.village_id,
			cd.id as contact_id,
			cd.primary_phone as phone1,
			cd.secondary_phone as phone2
		FROM ${TABLES.ACTOR_DETAILS} ad
		LEFT JOIN ${TABLES.NUITS} n ON n.actor_id = ad.actor_id
		LEFT JOIN ${TABLES.GENDERS} g ON g.actor_id = ad.actor_id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'TRADER'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'TRADER'
		LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'TRADER'
		WHERE ad.actor_id = ?
		GROUP BY ad.actor_id, ad.surname, ad.other_names, ad.photo, ad.updated_at, n.nuit, g.name, addr.id, addr.province_id, addr.district_id, addr.admin_post_id, addr.village_id, cd.id, cd.primary_phone, cd.secondary_phone
	`

	const { data: trader, isLoading: isLoadingTrader } = useQueryOneAndWatchChanges<TraderData>(traderQuery, [String(id)])

	// Check if trader data is locked (updated more than 24 hours ago)
	const isDataLocked = useMemo(() => {
		if (!trader?.updated_at) return false
		const updatedAt = new Date(trader.updated_at)
		const now = new Date()
		const hoursSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)
		return hoursSinceUpdate > 24
	}, [trader?.updated_at])

	// Surname editing is not allowed for traders
	const isSurnameDisabled = useMemo(() => {
		return true
	}, [])

	// Update form data when trader data loads
	useEffect(() => {
		if (trader) {
			setFormData({
				names: {
					surname: trader.surname || '',
					other_names: trader.other_names || '',
				},
				address: {
					province: trader.province_id || '',
					district: trader.district_id || '',
					admin_post: trader.admin_post_id || '',
					village: trader.village_id || '',
				},
				contacts: {
					phone1: trader.phone1 || '',
					phone2: trader.phone2 || '',
				},
				nuit: trader.nuit || '',
				multicategory:
					trader.multicategory && trader.multicategory !== 'N/A'
						? trader.multicategory.split(';').filter((cat) => cat.trim() !== '')
						: [],
			})
		}
	}, [trader])

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

	// Fetch location names when trader data loads
	useEffect(() => {
		const fetchLocationNames = async () => {
			if (trader) {
				if (trader.province_id) {
					const name = await getFullProvinceNameById(trader.province_id)
					setProvinceName(name || 'N/A')
				} else {
					setProvinceName('N/A')
				}

				if (trader.district_id) {
					const name = await getFullDistrictNameById(trader.district_id)
					setDistrictName(name || 'N/A')
				} else {
					setDistrictName('N/A')
				}

				if (trader.admin_post_id) {
					const name = await getFullAdminPostNameById(trader.admin_post_id)
					setAdminPostName(name || 'N/A')
				} else {
					setAdminPostName('N/A')
				}

				if (trader.village_id) {
					const name = await getFullVillageNameById(trader.village_id)
					setVillageName(name || 'N/A')
				} else {
					setVillageName('N/A')
				}
			}
		}
		fetchLocationNames()
	}, [trader, getFullProvinceNameById, getFullDistrictNameById, getFullAdminPostNameById, getFullVillageNameById])

	const toggleField = (group: FieldGroup, field?: string) => {
		// Prevent toggling surname if it contains 'company'
		if (group === 'names' && field === 'surname' && isSurnameDisabled) {
			return
		}

		setSelectedFields((prev) => {
			if (group === 'nuit' || group === 'multicategory') {
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
			const groupData = prev[group] as Record<string, string>
			return {
				...prev,
				[group]: {
					...groupData,
					[field]: value,
				},
			}
		})
	}

	// Handle multicategory toggle with validation rules
	const toggleMulticategory = (categoryValue: string) => {
		setFormData((prev) => {
			const currentCategories = [...prev.multicategory]
			const isSelected = currentCategories.includes(categoryValue)

			let newCategories: string[]

			if (isSelected) {
				// Remove category
				newCategories = currentCategories.filter((cat) => cat !== categoryValue)
			} else {
				// Add category with validation rules
				newCategories = [...currentCategories]

				// Rule 1: TRADER_LARGE_SCALE_PROCESSING and TRADER_SMALL_SCALE_PROCESSING cannot be combined
				if (categoryValue === MultiCategory.TRADER_LARGE_SCALE_PROCESSING) {
					newCategories = newCategories.filter((cat) => cat !== MultiCategory.TRADER_SMALL_SCALE_PROCESSING)
				}
				if (categoryValue === MultiCategory.TRADER_SMALL_SCALE_PROCESSING) {
					newCategories = newCategories.filter((cat) => cat !== MultiCategory.TRADER_LARGE_SCALE_PROCESSING)
				}

				// Rule 2: If TRADER_PRIMARY is selected, remove TRADER_SECONDARY, TRADER_EXPORT, TRADER_SMALL_SCALE_PROCESSING, TRADER_LARGE_SCALE_PROCESSING, TRADER_INFORMAL
				if (categoryValue === MultiCategory.TRADER_PRIMARY) {
					newCategories = newCategories.filter(
						(cat) =>
							cat !== MultiCategory.TRADER_SECONDARY &&
							cat !== MultiCategory.TRADER_EXPORT &&
							cat !== MultiCategory.TRADER_SMALL_SCALE_PROCESSING &&
							cat !== MultiCategory.TRADER_LARGE_SCALE_PROCESSING &&
							cat !== MultiCategory.TRADER_INFORMAL,
					)
				}
				// If trying to add incompatible categories while TRADER_PRIMARY exists
				if (
					currentCategories.includes(MultiCategory.TRADER_PRIMARY) &&
					(categoryValue === MultiCategory.TRADER_SECONDARY ||
						categoryValue === MultiCategory.TRADER_EXPORT ||
						categoryValue === MultiCategory.TRADER_SMALL_SCALE_PROCESSING ||
						categoryValue === MultiCategory.TRADER_LARGE_SCALE_PROCESSING ||
						categoryValue === MultiCategory.TRADER_INFORMAL)
				) {
					// Don't add - TRADER_PRIMARY is already selected
					return prev
				}

				// Rule 3: If TRADER_SECONDARY is selected, remove all other categories
				if (categoryValue === MultiCategory.TRADER_SECONDARY) {
					newCategories = [MultiCategory.TRADER_SECONDARY]
				}
				// If trying to add any category while TRADER_SECONDARY exists
				if (
					currentCategories.includes(MultiCategory.TRADER_SECONDARY) &&
					categoryValue !== MultiCategory.TRADER_SECONDARY
				) {
					// Don't add - TRADER_SECONDARY is already selected
					return prev
				}

				// Rule 4: If TRADER_INFORMAL is selected, remove all other categories
				if (categoryValue === MultiCategory.TRADER_INFORMAL) {
					newCategories = [MultiCategory.TRADER_INFORMAL]
				}
				// If trying to add any category while TRADER_INFORMAL exists
				if (
					currentCategories.includes(MultiCategory.TRADER_INFORMAL) &&
					categoryValue !== MultiCategory.TRADER_INFORMAL
				) {
					// Don't add - TRADER_INFORMAL is already selected
					return prev
				}

				newCategories.push(categoryValue)
			}

			return {
				...prev,
				multicategory: newCategories,
			}
		})
	}

	const handleSubmit = async () => {
		// Check if at least one field is selected
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
			(selectedFields.multicategory && formData.multicategory.length > 0)

		if (!hasSelection) {
			setHasError(true)
			setErrorMessage('Seleccione pelo menos um campo para actualizar')
			return
		}

		if (!trader) {
			setHasError(true)
			setErrorMessage('Dados do comerciante não encontrados')
			return
		}

		// Validate cascading address requirements
		const provinceChanged =
			selectedFields.address.province && formData.address.province && formData.address.province !== trader.province_id
		const districtChanged =
			selectedFields.address.district && formData.address.district && formData.address.district !== trader.district_id
		const adminPostChanged =
			selectedFields.address.admin_post &&
			formData.address.admin_post &&
			formData.address.admin_post !== trader.admin_post_id
		const villageChanged =
			selectedFields.address.village && formData.address.village && formData.address.village !== trader.village_id

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
			// Check for duplicate phone numbers
			if (selectedFields.contacts.phone1 && formData.contacts.phone1.trim()) {
				try {
					const existingPhone = await powersync.get<{ owner_id: string }>(
						`SELECT owner_id FROM ${TABLES.CONTACT_DETAILS} WHERE (primary_phone = ? OR secondary_phone = ?) AND owner_id != ? AND owner_type = 'TRADER' LIMIT 1`,
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
						`SELECT owner_id FROM ${TABLES.CONTACT_DETAILS} WHERE (primary_phone = ? OR secondary_phone = ?) AND owner_id != ? AND owner_type = 'TRADER' LIMIT 1`,
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

			// Determine if district will change (needed for sync_id update)
			const districtWillChange =
				(selectedFields.address.province &&
					formData.address.province &&
					formData.address.province !== trader.province_id) ||
				(selectedFields.address.district &&
					formData.address.district &&
					formData.address.district !== trader.district_id)

			const newDistrictId =
				districtWillChange && formData.address.district ? formData.address.district : trader.district_id || ''

			// Update actor_details table (names and updated_at)
			const actorUpdates: string[] = []
			const actorParams: string[] = []

			if (selectedFields.names.surname && formData.names.surname.trim() && !isSurnameDisabled) {
				actorUpdates.push('surname = ?')
				actorParams.push(formData.names.surname.trim())
			}

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
					addressParams.push(id, 'TRADER')
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
					contactParams.push(id, 'TRADER')
					await updateOne(
						`UPDATE ${TABLES.CONTACT_DETAILS} SET ${contactUpdates.join(', ')} WHERE owner_id = ? AND owner_type = ?`,
						contactParams,
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

				if (nuitUpdates.length > 0) {
					nuitParams.push(id)
					await updateOne(`UPDATE ${TABLES.NUITS} SET ${nuitUpdates.join(', ')} WHERE actor_id = ?`, nuitParams)
				}
			}

			// Update actor_categories table for multicategory
			// Note: multicategory is stored as subcategory in actor_categories table
			// We need to delete ALL existing records and insert the new ones
			if (selectedFields.multicategory) {
				// Always delete ALL existing actor_categories for this trader first
				// This ensures we remove all previous records before inserting new ones
				await powersync.execute(`DELETE FROM ${TABLES.ACTOR_CATEGORIES} WHERE actor_id = ? AND category = 'TRADER'`, [
					id,
				])

				// Only insert new categories if there are any selected
				if (formData.multicategory.length > 0) {
					const syncId = districtWillChange && newDistrictId ? newDistrictId : trader.district_id || ''
					for (const category of formData.multicategory) {
						const actorCategoryRow = buildActorCategories({
							actor_id: id,
							category: 'TRADER',
							subcategory: category,
							sync_id: syncId,
						})
						await insertActorCategory(actorCategoryRow)
					}
				}
			}

			setSuccess(true)
		} catch (error) {
			console.error('Error updating trader:', error)
			setHasError(true)
			setErrorMessage('Erro ao actualizar os dados. Tente novamente.')
		}
	}

	const handleRequestPermission = () => {
		// TODO: Implement permission request logic
		console.log('Requesting update permission for trader:', id)
		showSuccess('Pedido de permissão para actualização enviado. Aguarde a aprovação.')
		setShowPermissionDialog(false)
	}

	if (resourceName !== ResourceName.TRADER) {
		return <Redirect href={'/(aux)/custom-redirect'} />
	}

	if (isLoadingTrader) {
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

			{/* Current Trader Info Card */}
			{trader && (
				<ResourcePersonalCard
					photo={trader.photo}
					surname={ToPortuguese.formattedSurname(trader.surname, ResourceName.TRADER)}
					otherNames={trader.other_names}
					nuit={trader.nuit && trader.nuit !== 'N/A' ? trader.nuit : 'N/A'}
				/>
			)}

			{/* Locked Data Warning */}
			{isDataLocked && (
				<EditPermissionCard
					setShowPermissionDialog={setShowPermissionDialog}
					title="Dados Guardados"
					description="Os dados deste actor foram actualizados há mais de 24 horas e não estão disponíveis para edição
					directa. Para actualizar os dados, é necessário solicitar permissão."
					buttonText="Solicitar Permissão"
				/>
			)}

			{!isDataLocked && trader && (
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
									<EditFormField
										label="Apelido"
										isDisabled={isSurnameDisabled}
										value={ToPortuguese.formattedSurname(trader?.surname || '', ResourceName.TRADER) || 'N/A'}
									/>
									{selectedFields.names.surname && !isSurnameDisabled && (
										<CustomTextInput
											label=""
											value={formData.names.surname}
											onChangeText={(text) => updateFormData('names', 'surname', text)}
											placeholder="Digite o novo apelido"
											autoCapitalize="words"
										/>
									)}
									{!selectedFields.names.surname && trader && (
										<EditFormField
											label=""
											value={ToPortuguese.formattedSurname(trader?.surname || '', ResourceName.TRADER) || 'N/A'}
										/>
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
									{!selectedFields.names.other_names && trader && (
										<EditFormField label="" value={trader.other_names || 'N/A'} />
									)}
								</View>
							</View>
						</View>
					</View>

					{/* Multicategory Section */}
					<View className="mb-6">
						<EditSectionLabel icon="grid-outline" label="Categoria" />
						<View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
							<View className="flex-row items-start">
								<Checkbox
									status={selectedFields.multicategory ? 'checked' : 'unchecked'}
									onPress={() => toggleField('multicategory')}
									color={colors.primary}
								/>
								<View className="flex-1 ml-2">
									<FieldLabel label="Categoria do Comerciante" />
									{selectedFields.multicategory && (
										<View className="mt-2 space-y-2">
											{traderCategories.map((option) => {
												const isSelected = formData.multicategory.includes(option.value)
												const isDisabled =
													// Rule 1: Disable if opposite processing type is selected
													(option.value === MultiCategory.TRADER_LARGE_SCALE_PROCESSING &&
														formData.multicategory.includes(MultiCategory.TRADER_SMALL_SCALE_PROCESSING)) ||
													(option.value === MultiCategory.TRADER_SMALL_SCALE_PROCESSING &&
														formData.multicategory.includes(MultiCategory.TRADER_LARGE_SCALE_PROCESSING)) ||
													// Rule 2: Disable if TRADER_PRIMARY is selected and trying to select incompatible categories
													(formData.multicategory.includes(MultiCategory.TRADER_PRIMARY) &&
														(option.value === MultiCategory.TRADER_SECONDARY ||
															option.value === MultiCategory.TRADER_EXPORT ||
															option.value === MultiCategory.TRADER_SMALL_SCALE_PROCESSING ||
															option.value === MultiCategory.TRADER_LARGE_SCALE_PROCESSING ||
															option.value === MultiCategory.TRADER_INFORMAL)) ||
													// Rule 3: Disable if TRADER_SECONDARY is selected
													(formData.multicategory.includes(MultiCategory.TRADER_SECONDARY) &&
														option.value !== MultiCategory.TRADER_SECONDARY) ||
													// Rule 4: Disable if TRADER_INFORMAL is selected
													(formData.multicategory.includes(MultiCategory.TRADER_INFORMAL) &&
														option.value !== MultiCategory.TRADER_INFORMAL)

												return (
													<View key={option.value} className="flex-row items-center mb-2">
														<Checkbox
															status={isSelected ? 'checked' : 'unchecked'}
															onPress={() => !isDisabled && toggleMulticategory(option.value)}
															color={colors.primary}
															disabled={isDisabled}
															uncheckedColor={isDisabled ? colors.gray600 : colors.primary}
														/>
														<Text
															className={`ml-2 text-sm ${
																isDisabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
															}`}
														>
															{option.label}
														</Text>
													</View>
												)
											})}
										</View>
									)}
									{!selectedFields.multicategory && trader && (
										<EditFormField
											label=""
											value={
												trader.multicategory && trader.multicategory !== 'N/A'
													? trader.multicategory
															.split(';')
															.map((cat) => {
																const option = traderCategories.find((opt) => opt.value === cat.trim())
																return option ? option.label : cat.trim()
															})
															.join(', ')
													: 'N/A'
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
									{!selectedFields.address.province && trader && (
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
									{!selectedFields.address.district && trader && (
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
									{!selectedFields.address.admin_post && trader && (
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
									{!selectedFields.address.village && trader && <EditFormField label="" value={villageName || 'N/A'} />}
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
									{!selectedFields.contacts.phone1 && trader && (
										<EditFormField label="" value={trader.phone1 || 'N/A'} />
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
									{!selectedFields.contacts.phone2 && trader && (
										<EditFormField label="" value={trader.phone2 || 'N/A'} />
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
									{!selectedFields.nuit && trader && (
										<EditFormField label="" value={trader.nuit && trader.nuit !== 'N/A' ? trader.nuit : 'N/A'} />
									)}
								</View>
							</View>
						</View>
					</View>

					{/* Submit Button */}
					<View className="pt-6">
						<SubmitButton onPress={handleSubmit} title="Actualizar" disabled={isDataLocked} />
					</View>
					<View />
				</View>
			)}

			{/* Permission Request Dialog */}
			<CustomConfirmDialg
				visible={showPermissionDialog}
				setVisible={setShowPermissionDialog}
				title="Solicitar Permissão para Actualização"
				message="Deseja solicitar permissão para actualizar os dados deste comerciante? O pedido será enviado para aprovação."
				yesText="Sim, Solicitar"
				noText="Cancelar"
				yesCallback={handleRequestPermission}
				noCallback={() => setShowPermissionDialog(false)}
			/>
		</Animated.ScrollView>
	)
}
