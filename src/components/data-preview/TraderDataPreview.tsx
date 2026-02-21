import { View, Text, Modal, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { capitalize } from 'src/helpers/capitalize'
import { TraderFormDataType, useTraderStore } from 'src/store/trader'
import { MultiCategory, ResourceName, TraderType, TradingPurpose } from 'src/types'
import { match } from 'ts-pattern'

import { errorMessages } from 'src/constants/errorMessages'
import ConfirmOrCancelButtons from '../buttons/ConfirmOrCancelButtons'
import FormFieldPreview from './FormFieldPreview'
import { Divider } from 'react-native-paper'
import Label from '../forms/Label'
import { useQueryMany, useUserDetails } from 'src/hooks/queries'
import { ActorDetailRecord } from 'src/library/powersync/schemas/AppSchema'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { insertActor, insertLicense, insertNuel, insertNuit } from 'src/library/powersync/sql-statements'
import { Href, useRouter } from 'expo-router'
import { useAddressStore } from 'src/store/address'
import ErrorAlert from '../dialogs/ErrorAlert'
import { buildNuit } from 'src/library/powersync/schemas/nuits'
import { buildNuel } from 'src/library/powersync/schemas/nuels'
import { buildActor } from 'src/library/powersync/schemas/actors'
import { buildLicense } from 'src/library/powersync/schemas/licenses'
import { buildActorDetails } from 'src/library/powersync/schemas/actor_details'
import { buildContactDetail } from 'src/library/powersync/schemas/contact_details'
import { buildAddressDetail } from 'src/library/powersync/schemas/address_details'
import {
	insertActorCategory,
	insertActorDetails,
	insertAddressDetail,
	insertBirthDate,
	insertContactDetail,
} from 'src/library/powersync/sql-statements2'
import { buildBirthDate } from 'src/library/powersync/schemas/birth_dates'
import { buildActorCategories } from 'src/library/powersync/schemas/actor_categories'

type TraderDataPreviewProps = {
	previewData: boolean
	setPreviewData: (b: boolean) => void
	trader: TraderFormDataType
	setSuccess: (b: boolean) => void
	setRouteSegment: (route: Href) => void
	setHasError: (b: boolean) => void
	setErrorMessage: (m: string) => void
	// setDuplicates: (d: Trader[]) => void
	// duplicates: any[]
	proceed: boolean
	reset: () => void
	hasError: boolean
	errorMessage: string
}

export default function TraderDataPreview({
	previewData,
	setPreviewData,
	trader,
	setSuccess,
	setRouteSegment,
	setHasError,
	setErrorMessage,
	hasError,
	errorMessage,
	// setDuplicates,
	proceed,
	reset,
}: TraderDataPreviewProps) {
	const { userDetails } = useUserDetails()
	const { resetFormData } = useTraderStore()
	const {
		fullAddress,
		getFullProvinceNameById,
		getFullDistrictNameById,
		getFullAdminPostNameById,
		getFullVillageNameById,
		reset: resetAddress,
	} = useAddressStore()

	const [fullProvinceName, setFullProvinceName] = useState<string>('')
	const [fullDistrictName, setFullDistrictName] = useState<string>('')
	const [fullAdminPostName, setFullAdminPostName] = useState<string>('')
	const [fullVillageName, setFullVillageName] = useState<string>('')
	const [isSaving, setIsSaving] = useState<boolean>(false)

	const router = useRouter()
	// get All saved traders so to check for duplicates before saving
	const {
		data: savedTraders,
		isLoading: isSavedTradersLoading,
		error: savedTradersError,
		isError: isSavedTradersError,
	} = useQueryMany<{
		actor_id: string
		multicategory: string
		surname: string
		other_names: string
	}>(
		`SELECT 
			ad.actor_id,
			GROUP_CONCAT(ac.subcategory, ';') as multicategory,
			ad.surname,
			ad.other_names
		FROM ${TABLES.ACTOR_DETAILS} ad
		INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'TRADER'
		GROUP BY ad.actor_id, ad.surname, ad.other_names`,
	)

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
		}
		fetchAddressNames()
	}, [
		fullAddress.provinceId,
		fullAddress.districtId,
		fullAddress.adminPostId,
		fullAddress.villageId,
		getFullProvinceNameById,
		getFullDistrictNameById,
		getFullAdminPostNameById,
		getFullVillageNameById,
	])

	//   Add new trader
	const createNewTrader = useCallback(async () => {
		if (
			!userDetails ||
			!userDetails.district_id ||
			!fullAddress.provinceId ||
			!fullAddress.districtId ||
			!fullAddress.adminPostId ||
			!fullAddress.villageId
		) {
			setErrorMessage(errorMessages.failedToSave)
			setHasError(true)
			return
		}

		const traderCategories: string[] = []

		match(trader.traderType)
			.with(TraderType.PRIMARY, () => traderCategories.push(MultiCategory.TRADER_PRIMARY))
			.with(TraderType.SECONDARY, () => traderCategories.push(MultiCategory.TRADER_SECONDARY))
			.with(TraderType.FINAL, () => {
				trader.purposes &&
					trader.purposes.forEach((purpose) => {
						match(purpose)
							.with(TradingPurpose.EXPORT, () => traderCategories.push(MultiCategory.TRADER_EXPORT))
							.with(TradingPurpose.LOCAL, () => traderCategories.push(MultiCategory.TRADER_LOCAL))
							.with(TradingPurpose.LARGE_SCALE_PROCESSING, () =>
								traderCategories.push(MultiCategory.TRADER_LARGE_SCALE_PROCESSING),
							)
							.with(TradingPurpose.SMALL_SCALE_PROCESSING, () =>
								traderCategories.push(MultiCategory.TRADER_SMALL_SCALE_PROCESSING),
							)
							.otherwise(() => traderCategories.push(MultiCategory.TRADER_UNCATEGORIZED))
					})
			})
			.otherwise(() => traderCategories.push(MultiCategory.TRADER_UNCATEGORIZED))
		const isCompany = trader.surname.toLowerCase().includes('company') && trader.surname !== 'N/A'
		try {
			setIsSaving(true)

			// 1. build and insert actor main record
			const actor_row = buildActor({
				category: ResourceName.TRADER,
				sync_id: fullAddress.provinceId!,
			})
			await insertActor(actor_row)

			// 2. build and insert actor details record
			const actor_details_row = buildActorDetails({
				actor_id: actor_row.id,
				surname: trader.surname,
				other_names: trader.otherNames,
				photo: '',
				sync_id: fullAddress.provinceId!,
			})
			await insertActorDetails(actor_details_row)

			// 3. build and insert nuit record
			if (trader.nuit && trader.nuit.length === 9) {
				const nuit_rows = buildNuit({
					nuit: trader.nuit,
					actor_id: actor_row.id,
					sync_id: fullAddress.provinceId!,
				})
				await insertNuit(nuit_rows)
			}

			// 4. build and insert nuel record
			if (isCompany && trader.nuel && trader.nuel.length === 9) {
				const nuel_rows = buildNuel({
					nuel: trader.nuel || 'N/A',
					actor_id: actor_row.id,
					sync_id: fullAddress.provinceId!,
				})
				await insertNuel(nuel_rows)
			}

			// 5. build and insert license
			if (trader.license && trader.license !== 'N/A') {
				const licenseType = isCompany ? 'BUSINESS_LICENSE' : (trader.licenseType || 'BUSINESS_LICENSE');
				const license_row = buildLicense({
					number: `${trader.license}-${licenseType.toUpperCase()}`,
					owner_id: actor_row.id,
					owner_type: ResourceName.TRADER,
					photo: '',
					issue_date: new Date().toISOString(),
					expiration_date: new Date().toISOString(),
					issue_place_id: fullAddress.provinceId!,
					issue_place_type: 'PROVINCE',
					sync_id: fullAddress.provinceId!,
				})
				await insertLicense(license_row)
			}

			// 6. build and insert contact detail record
			if (
				(trader.primaryPhone && trader.primaryPhone !== 'N/A') ||
				(trader.secondaryPhone && trader.secondaryPhone !== 'N/A')
			) {
				const contact_row = buildContactDetail({
					owner_id: actor_row.id,
					owner_type: ResourceName.TRADER,
					primary_phone: trader.primaryPhone || 'N/A',
					secondary_phone: trader.secondaryPhone || 'N/A',
					email: 'N/A',
					sync_id: fullAddress.provinceId!,
				})
				await insertContactDetail(contact_row)
			}

			// 7. build and insert address detail record
			if (fullAddress.provinceId && fullAddress.districtId && fullAddress.adminPostId && fullAddress.villageId) {
				const address_row = buildAddressDetail({
					owner_id: actor_row.id,
					owner_type: ResourceName.TRADER,
					province_id: fullAddress.provinceId,
					district_id: fullAddress.districtId,
					admin_post_id: fullAddress.adminPostId,
					village_id: fullAddress.villageId,
					gps_lat: '0',
					gps_long: '0',
					sync_id: fullAddress.provinceId!,
				})
				await insertAddressDetail(address_row)
			}

			// 8. build and insert birth date record
			// at least 12 years old
			if (!isCompany && trader.birthDate && new Date(trader.birthDate).getFullYear() + 12 < new Date().getFullYear()) {
				const birth_row = buildBirthDate({
					owner_id: actor_row.id,
					owner_type: ResourceName.TRADER,
					day: new Date(trader.birthDate).getDate(),
					month: new Date(trader.birthDate).getMonth() + 1,
					year: new Date(trader.birthDate).getFullYear(),
					sync_id: fullAddress.provinceId!,
				})
				await insertBirthDate(birth_row)
			}

			// 9. build and insert actor categories records
			if (traderCategories.length > 0) {
				for (const category of traderCategories) {
					const category_row = buildActorCategories({
						actor_id: actor_row.id,
						category: ResourceName.TRADER,
						subcategory: category,
						sync_id: fullAddress.provinceId!,
					})
					await insertActorCategory(category_row)
				}
			}

			reset()
			resetAddress()
			setSuccess(true)
			resetFormData()
			router.replace('/(tabs)/actors/traders' as Href)
		} catch (error) {
			setHasError(true)
			setErrorMessage(errorMessages.failedToSave)
			console.error('Registo de Comerciante falhou!', error)
		} finally {
			setPreviewData(false)
			setIsSaving(false)
		}
	}, [trader, proceed, previewData, savedTraders, userDetails])

	const traderType = match(trader.traderType)
		.with(TraderType.FINAL, () => 'Final')
		.with(TraderType.PRIMARY, () => 'Primário')
		.with(TraderType.SECONDARY, () => 'Intermédio')
		.otherwise(() => 'Desconhecido')

	const licenseType = match(trader.licenseType)
		.with('BUSINESS_LICENSE', () => 'Alvará')
		.with('LOCAL_LICENSE', () => 'Mera Comunicação Prévia')
		.otherwise(() => 'Outro')

	const purposes =
		trader.purposes && trader.purposes?.length > 0
			? trader.purposes.map((purpose, index) => {
					const newPurpose = match(purpose)
						.with(TradingPurpose.EXPORT, () => 'Exportação')
						.with(TradingPurpose.LOCAL, () => 'Consumo Local')
						.with(TradingPurpose.SMALL_SCALE_PROCESSING, () => 'Processamento Artesanal')
						.with(TradingPurpose.LARGE_SCALE_PROCESSING, () => 'Processamento Industrial')
						.with(TradingPurpose.RESELLING, () => 'Revenda')
						.with(TradingPurpose.PROCESSING, () => 'Processamento')
						.otherwise(() => 'Comércio')
					return `${index + 1}. ${newPurpose}`
				})
			: ['Comércio']

	return (
		<Modal visible={previewData} presentationStyle="overFullScreen">
			<View className="flex-1 w-full bg-white dark:bg-black p-3 justify-center ">
				<View className="h-8 flex flex-row justify-between space-x-2 ">
					<View className="flex-1 items-center justify-center">
						<Text className="text-[16px] font-bold text-black dark:text-white ">Confirmar Dados</Text>
					</View>
				</View>

				{/* If Trader is not a Company, but a Individual */}
				{!trader.surname.toLowerCase().includes('company') && (
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							paddingBottom: 60,
						}}
						className="space-y-3"
					>
						<FormFieldPreview title="Apelido:" value={capitalize(trader.surname)} />
						<FormFieldPreview title="Outros Nomes:" value={capitalize(trader.otherNames)} />

						{trader?.birthDate && (
							<FormFieldPreview
								title="Nascimento (Data):"
								value={trader?.birthDate && new Date(trader?.birthDate).toLocaleDateString('pt-BR')}
							/>
						)}

						<FormFieldPreview title="Categoria:" value={`Comerciante ${traderType}`} />
						<FormFieldPreview title="Finalidade:" value={`${purposes.join('; ')}`} />

						<Divider />

						<View className="flex flex-col py-3">
							<FormFieldPreview
								title="Telefone (principal):"
								value={trader.primaryPhone ? trader.primaryPhone : 'Nenhum'}
							/>
							<FormFieldPreview
								title="Telefone (alternativo):"
								value={trader.secondaryPhone ? trader.secondaryPhone : 'Nenhum'}
							/>
						</View>

						<Divider />

						<View className="flex flex-col py-3">
							<FormFieldPreview title="Endereço (Província):" value={fullProvinceName} />
							<FormFieldPreview title="Endereço (Distrito):" value={fullDistrictName} />
							<FormFieldPreview title="Endereço (posto administrativo):" value={fullAdminPostName} />
							<FormFieldPreview title="Endereço (Localidade):" value={fullVillageName} />
						</View>

						<Divider />

						<View className="flex flex-col py-3">
							<FormFieldPreview
								title={`Licença (${licenseType}):`}
								value={trader.license ? trader.license : 'Nenhum'}
							/>
							<FormFieldPreview title="Documentação (NUIT):" value={trader.nuit ? trader.nuit : 'Nenhum'} />
						</View>
					</ScrollView>
				)}

				{/* If Trader is a Company */}
				{trader.surname.toLowerCase().includes('company') && (
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							paddingBottom: 60,
						}}
						className="space-y-3"
					>
						<FormFieldPreview title="Nome da Empresa:" value={capitalize(trader.otherNames)} />
						<FormFieldPreview title="Categoria:" value={`Comerciante ${traderType}`} />
						<FormFieldPreview title="Finalidade:" value={`${purposes.join('; ')}`} />

						<Divider />

						<View className="flex flex-col py-3">
							<FormFieldPreview
								title="Telefone (principal):"
								value={trader.primaryPhone ? trader.primaryPhone : 'Nenhum'}
							/>
							<FormFieldPreview
								title="Telefone (alternativo):"
								value={trader.secondaryPhone ? trader.secondaryPhone : 'Nenhum'}
							/>
						</View>

						<Divider />

						<View className="flex flex-col py-3">
							<FormFieldPreview
								title={`Licença (${licenseType}):`}
								value={trader.license ? trader.license : 'Nenhum'}
							/>
							<FormFieldPreview title="Documentação (NUIT):" value={trader.nuit ? trader.nuit : 'Nenhum'} />
							<FormFieldPreview title="Documentação (NUEL):" value={trader.nuel ? trader.nuel : 'Nenhum'} />
						</View>

						<Divider />

						<View className="flex flex-col py-3">
							<Label label="Endereço:" />
							<FormFieldPreview title="Província:" value={fullProvinceName} />
							<FormFieldPreview title="Distrito:" value={fullDistrictName} />

							<FormFieldPreview title="Posto Administrativo:" value={fullAdminPostName} />

							<FormFieldPreview title="Localidade:" value={fullVillageName} />
						</View>
					</ScrollView>
				)}

				<ConfirmOrCancelButtons
					onCancel={() => setPreviewData(false)}
					onConfirm={async () => await createNewTrader()}
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
			</View>
		</Modal>
	)
}
