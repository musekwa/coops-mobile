import { useColorScheme } from 'nativewind'
import { useFarmerStore } from 'src/store/farmer'
import { Href, useNavigation, useRouter } from 'expo-router'
import Animated, { FadeIn } from 'react-native-reanimated'
import { View } from 'react-native'
import FormFieldPreview from 'src/components/data-preview/FormFieldPreview'
import { capitalize } from 'src/helpers/capitalize'
import { Divider } from 'react-native-paper'
import { match } from 'ts-pattern'
import { useAddressStore } from 'src/store/address'
import { useCallback, useEffect, useState } from 'react'
import ConfirmOrCancelButtons from 'src/components/buttons/ConfirmOrCancelButtons'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import SuccessAlert from 'src/components/dialogs/SuccessAlert'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useToast } from 'src/components/ToastMessage'
import { powersync } from 'src/library/powersync/system'
import { useUserDetails } from 'src/hooks/queries'
import { MultiCategory, ResourceName } from 'src/types'
import { insertActor, insertNuit } from 'src/library/powersync/sql-statements'
import { buildActor } from 'src/library/powersync/schemas/actors'
import { buildContactDetail } from 'src/library/powersync/schemas/contact_details'
import { buildAddressDetail } from 'src/library/powersync/schemas/address_details'
import { buildNuit } from 'src/library/powersync/schemas/nuits'
import {
	insertActorCategory,
	insertActorDetails,
	insertActorDocument,
	insertAddressDetail,
	insertBirthDate,
	insertContactDetail,
	insertGenders,
} from 'src/library/powersync/sql-statements2'
import { buildActorDocument } from 'src/library/powersync/schemas/actor_documents'
import { buildBirthDate } from 'src/library/powersync/schemas/birth_dates'
import { buildActorDetails } from 'src/library/powersync/schemas/actor_details'
import { buildGenders } from 'src/library/powersync/schemas/genders'
import { buildActorCategories } from 'src/library/powersync/schemas/actor_categories'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'
export default function SaveFarmer() {
	const { userDetails } = useUserDetails()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const router = useRouter()
	const {
		fullAddress,
		partialAddress,
		countryId,
		getFullProvinceNameById,
		getFullDistrictNameById,
		getFullAdminPostNameById,
		getFullVillageNameById,
		getPartialAdminPostNameById,
		getPartialVillageNameById,
		getCountryNameById,
		reset: resetAddress,
		nationality,
	} = useAddressStore()

	const [isPowersyncConnected, setIsPowersyncConnected] = useState<boolean>(false)
	const [hasError, setHasError] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string>('')
	const [success, setSuccess] = useState<boolean>(false)
	const { formData: farmer, resetFormData } = useFarmerStore()
	const navigation = useNavigation()
	const farmerCategory = match(farmer.isSmallScale)
		.with('YES', () => 'Familiar')
		.with('NO', () => 'Comercial')
		.otherwise(() => 'Não Especificado')
	const farmerSurname = farmer.surname.toLowerCase().includes('company')
		? `${farmer.surname.split(' - ')[0]}`
		: farmer.surname

	const [fullProvinceName, setFullProvinceName] = useState<string>('')
	const [fullDistrictName, setFullDistrictName] = useState<string>('')
	const [fullAdminPostName, setFullAdminPostName] = useState<string>('')
	const [fullVillageName, setFullVillageName] = useState<string>('')

	const [partialAdminPostName, setPartialAdminPostName] = useState<string>('')
	const [partialVillageName, setPartialVillageName] = useState<string>('')
	const [countryName, setCountryName] = useState<string>('')
	const [isSaving, setIsSaving] = useState<boolean>(false)

	const { showInfo } = useToast()

	useEffect(() => {
		const connected = powersync.connected
		setIsPowersyncConnected(connected)
	}, [])

	// Fetch address names when component mounts or fullAddress changes
	useEffect(() => {
		const fetchAddressNames = async () => {
			if (fullAddress.provinceId) {
				try {
					const name = await getFullProvinceNameById(fullAddress.provinceId)
					setFullProvinceName(name || 'N/A')
				} catch (error) {
					setFullProvinceName('N/A')
				}
			}
			if (fullAddress.districtId) {
				try {
					const name = await getFullDistrictNameById(fullAddress.districtId)
					setFullDistrictName(name || 'N/A')
				} catch (error) {
					setFullDistrictName('N/A')
				}
			}
			if (fullAddress.adminPostId) {
				try {
					const name = await getFullAdminPostNameById(fullAddress.adminPostId)
					setFullAdminPostName(name || 'N/A')
				} catch (error) {
					setFullAdminPostName('N/A')
				}
			}
			if (fullAddress.villageId) {
				try {
					const name = await getFullVillageNameById(fullAddress.villageId)
					setFullVillageName(name || 'N/A')
				} catch (error) {
					setFullVillageName('N/A')
				}
			}

			if (partialAddress.adminPostId) {
				try {
					const name = await getPartialAdminPostNameById(partialAddress.adminPostId)
					setPartialAdminPostName(name || 'N/A')
				} catch (error) {
					setPartialAdminPostName('N/A')
				}
			}
			if (partialAddress.villageId) {
				try {
					const name = await getPartialVillageNameById(partialAddress.villageId)
					setPartialVillageName(name || 'N/A')
				} catch (error) {
					setPartialVillageName('N/A')
				}
			}
			if (countryId && nationality === 'FOREIGN') {
				try {
					const name = await getCountryNameById(countryId)
					if (name) {
						setCountryName(name)
					}
				} catch (error) {
					setCountryName('N/A')
				}
			} else {
				setCountryName('N/A')
			}
		}
		fetchAddressNames()
	}, [
		fullAddress.provinceId,
		fullAddress.districtId,
		fullAddress.adminPostId,
		fullAddress.villageId,
		partialAddress.adminPostId,
		partialAddress.villageId,
		getFullProvinceNameById,
		getFullDistrictNameById,
		getFullAdminPostNameById,
		getFullVillageNameById,
		getPartialAdminPostNameById,
		getPartialVillageNameById,
		countryId,
		getCountryNameById,
	])

	//   Add new farmer
	const createFarmer = useCallback(async () => {
		// Early return if userDetails is not available
		if (!userDetails || !userDetails.district_id || !userDetails.province_id) {
			setErrorMessage('Por favor, verifique os dados do usuário')
			setHasError(true)
			return
		}

		// Check for duplicate NUIT before proceeding
		if (farmer.nuit && farmer.nuit.trim().length === 9 && farmer.nuit.trim() !== 'N/A') {
			try {
				const existingNuit = await powersync.get<{ actor_id: string }>(
					`SELECT actor_id FROM ${TABLES.NUITS} WHERE nuit = ? LIMIT 1`,
					[farmer.nuit.trim()],
				)
				if (existingNuit) {
					setErrorMessage(
						`NUIT ${farmer.nuit.trim()} já está registado para outro produtor. Não é possível criar este produtor.`,
					)
					setHasError(true)
					return
				}
			} catch (error: any) {
				// Handle "Result set is empty" error - this means no duplicate exists, which is fine
				if (error?.message?.includes('Result set is empty') || String(error).includes('Result set is empty')) {
					// No duplicate found, continue with creation
					// This is expected when checking for duplicates
				} else {
					console.error('Error checking duplicate NUIT:', error)
					// For other errors, continue with creation (safer to proceed)
				}
			}
		}

		const isCompany = farmer.surname.toLowerCase().includes('company')

		// Validate required address fields based on farmer type
		const hasRequiredAddressFields = isCompany
			? partialAddress.villageId && partialAddress.adminPostId
			: nationality === 'NATIONAL'
				? fullAddress.provinceId &&
					fullAddress.districtId &&
					fullAddress.adminPostId &&
					partialAddress.villageId &&
					partialAddress.adminPostId
				: nationality === 'FOREIGN'
					? countryId && partialAddress.villageId && partialAddress.adminPostId
					: false

		if (!hasRequiredAddressFields) {
			setErrorMessage('Por favor, verifique os dados do endereço')
			setHasError(true)
			return
		}
		try {
			setIsSaving(true)

			const user_district_id = userDetails.district_id
			const categories = [] as MultiCategory[]
			if (farmer.isSmallScale === 'YES') {
				categories.push(MultiCategory.FARMER_SMALL_SCALE)
			} else if (farmer.isSmallScale === 'NO') {
				categories.push(MultiCategory.FARMER_LARGE_SCALE)
			}

			if (farmer.isServiceProvider === 'YES') {
				categories.push(MultiCategory.FARMER_SPRAYING_SERVICE_PROVIDER)
			}
			// 1. create new actor record
			const actor_row = buildActor({
				category: ResourceName.FARMER,
				sync_id: user_district_id!,
			})
			await insertActor(actor_row)
			// 2. create new farmer detail record
			const actor_details_row = buildActorDetails({
				actor_id: actor_row.id,
				surname: farmer.surname,
				other_names: farmer.otherNames,
				photo: '',
				sync_id: user_district_id!,
			})
			await insertActorDetails(actor_details_row)

			if (!isCompany && farmer.gender) {
				const gender_row = buildGenders({
					actor_id: actor_row.id,
					name: farmer.gender,
					code: farmer.gender === 'Masculino' ? 'M' : 'F',
					sync_id: user_district_id!,
				})
				await insertGenders(gender_row)
			}

			if (categories.length > 0) {
				for (const category of categories) {
					const actor_category_row = buildActorCategories({
						actor_id: actor_row.id,
						category: ResourceName.FARMER,
						subcategory: category,
						sync_id: user_district_id!,
					})
					await insertActorCategory(actor_category_row)
				}
			}

			// 4. create new contacts record
			const contact_detail_row = buildContactDetail({
				owner_id: actor_row.id,
				owner_type: ResourceName.FARMER,
				primary_phone: farmer.primaryPhone || 'N/A',
				secondary_phone: farmer.secondaryPhone || 'N/A',
				email: 'N/A',
				sync_id: user_district_id!,
			})

			// 5. create new address record
			const address_detail_row = buildAddressDetail({
				owner_id: actor_row.id,
				owner_type: ResourceName.FARMER,
				village_id: partialAddress.villageId || '',
				admin_post_id: partialAddress.adminPostId || '',
				district_id: userDetails.district_id,
				province_id: userDetails.province_id,
				gps_lat: '0',
				gps_long: '0',
				sync_id: user_district_id!,
			})

			// 6. create new document record

			Promise.all([insertContactDetail(contact_detail_row), insertAddressDetail(address_detail_row)])

			if (farmer.nuit && farmer.nuit !== 'N/A') {
				const nuit_row = buildNuit({
					nuit: farmer.nuit,
					actor_id: actor_row.id,
					sync_id: user_district_id!,
				})
				await insertNuit(nuit_row)
			}

			if (
				farmer.docNumber &&
				farmer.docNumber !== 'N/A' &&
				farmer.docType &&
				farmer.docType !== 'N/A' &&
				farmer.docType !== 'Não tem'
			) {
				const actor_document_row = buildActorDocument({
					type: farmer.docType,
					number: farmer.docNumber,
					date: new Date().toISOString(),
					place: 'N/A',
					owner_id: actor_row.id,
					owner_type: ResourceName.FARMER,
					sync_id: user_district_id!,
				})
				await insertActorDocument(actor_document_row)
			}

			// at least 12 years old
			if (!isCompany && farmer.birthDate && new Date(farmer.birthDate).getFullYear() + 12 < new Date().getFullYear()) {
				const birth_date_row = buildBirthDate({
					owner_id: actor_row.id,
					owner_type: ResourceName.FARMER,
					day: new Date(farmer.birthDate).getDate(),
					month: new Date(farmer.birthDate).getMonth() + 1,
					year: new Date(farmer.birthDate).getFullYear(),
					sync_id: user_district_id!,
				})
				await insertBirthDate(birth_date_row)
			}
			resetFormData()
			resetAddress()
			router.replace('/(tabs)/actors/farmers' as Href)
			setSuccess(true)
			resetFormData()
		} catch (error: any) {
			console.error('Error creating farmer', error)
			setHasError(true)
			// Check if error is related to duplicate NUIT
			if (error?.message?.includes('NUIT') || error?.message?.includes('duplicate') || error?.code === '23505') {
				setErrorMessage(`Erro: NUIT duplicado. ${error.message || 'Este NUIT já está registado para outro produtor.'}`)
			} else {
				setErrorMessage('Erro ao criar produtor. Tente novamente.')
			}
		} finally {
			setIsSaving(false)
		}
	}, [farmer, userDetails, partialAddress, fullAddress, nationality])

	return (
		<CustomSafeAreaView>
		<Animated.ScrollView
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{
				paddingBottom: 60,
			}}
			entering={FadeIn.duration(300)}
		>
			<View className="flex-1 ">
				{!farmer.surname.toLowerCase().includes('company') && (
					<View>
						<View className="space-y-3 py-3">
							<FormFieldPreview title="Apelido:" value={capitalize(farmerSurname)} />
							<FormFieldPreview title="Outros Nomes:" value={capitalize(farmer.otherNames)} />
							<FormFieldPreview title="Sexo:" value={farmer.gender === 'Masculino' ? 'Homem' : 'Mulher'} />
							<FormFieldPreview title="Agregado Familiar:" value={`${farmer.familySize} membros`} />
							<FormFieldPreview title="Categoria:" value={`Produtor ${farmerCategory}`} />
						</View>

						<Divider />

						<View className="flex flex-col py-3">
							<FormFieldPreview title="Endereço (posto administrativo):" value={partialAdminPostName} />
							<FormFieldPreview title="Endereço (Localidade):" value={partialVillageName} />
						</View>

						<Divider />

						<View className="space-y-3 py-3">
							<FormFieldPreview
								title="Nascimento (Data):"
								value={farmer?.birthDate && new Date(farmer?.birthDate).toLocaleDateString('pt-BR')}
							/>
							{nationality === 'NATIONAL' && (
								<View>
									<FormFieldPreview title="Nascimento (Província/País):" value={fullProvinceName} />
									<FormFieldPreview
										title={fullAddress.provinceId ? 'Nascimento (País):' : 'Nascimento (Distrito):'}
										value={fullDistrictName}
									/>
									<FormFieldPreview title="Nascimento (Posto Administrativo):" value={fullAdminPostName} />
									<FormFieldPreview title="Nascimento (Localidade):" value={fullVillageName} />
								</View>
							)}
							{nationality === 'FOREIGN' && <FormFieldPreview title="Nascimento (País):" value={countryName} />}
						</View>

						<Divider />

						<View className="flex flex-col py-3">
							<FormFieldPreview
								title="Telefone (principal):"
								value={farmer.primaryPhone ? farmer.primaryPhone : 'Nenhum'}
							/>
							<FormFieldPreview
								title="Telefone (alternativo):"
								value={farmer.secondaryPhone ? farmer.secondaryPhone : 'Nenhum'}
							/>
						</View>

						<Divider />

						<View className="flex flex-col py-3">
							<FormFieldPreview
								title={'Documentação (Identificação):'}
								value={farmer.docType ? farmer.docType : 'Nenhum'}
							/>
							<FormFieldPreview title="Documentação (Número):" value={farmer.docNumber ? farmer.docNumber : 'Nenhum'} />
							<FormFieldPreview title="NUIT (opcional):" value={farmer.nuit ? farmer.nuit : 'Nenhum'} />
						</View>
					</View>
				)}
				{farmer.surname.toLowerCase().includes('company') && (
					<View>
						<View className="space-y-3 py-3">
							<FormFieldPreview title="Tipo de Entidade:" value={capitalize(farmerSurname)} />
							<FormFieldPreview title="Nome:" value={capitalize(farmer.otherNames)} />
							<FormFieldPreview title="Categoria:" value={`Produtor ${farmerCategory}`} />
						</View>

						<Divider />

						<View className="flex flex-col py-3">
							<FormFieldPreview
								title="Telefone (principal):"
								value={farmer.primaryPhone ? farmer.primaryPhone : 'Nenhum'}
							/>
							<FormFieldPreview
								title="Telefone (alternativo):"
								value={farmer.secondaryPhone ? farmer.secondaryPhone : 'Nenhum'}
							/>
						</View>

						<Divider />

						<View className="flex flex-col py-3">
							<FormFieldPreview title="Endereço (posto administrativo):" value={partialAdminPostName || 'Nenhum'} />
							<FormFieldPreview title="Endereço (Localidade):" value={partialVillageName || 'Nenhum'} />
						</View>
						<Divider />
						<View className="flex flex-col py-3">
							<FormFieldPreview title="NUIT:" value={farmer.nuit ? farmer.nuit : 'Nenhum'} />
						</View>
					</View>
				)}

				<ConfirmOrCancelButtons
					onCancel={() => router.back()}
					onConfirm={async () => await createFarmer()}
					isLoading={isSaving}
					onConfirmDisabled={isSaving}
					onCancelDisabled={isSaving}
				/>
				<ErrorAlert
					visible={hasError}
					title="Erro ao gravar dados"
					message={errorMessage}
					setMessage={setErrorMessage}
					setVisible={setHasError}
				/>
				<SuccessAlert visible={success} setVisible={setSuccess} route={'/(tabs)/actors/farmers' as Href} />
				</View>
			</Animated.ScrollView>
		</CustomSafeAreaView>
	)
}
