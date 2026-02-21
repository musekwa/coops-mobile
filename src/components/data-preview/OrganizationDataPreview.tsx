import { View, Text, Modal } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { OrganizationTypes, ResourceName } from 'src/types'
import { match } from 'ts-pattern'
import {
	AssociationFormDataType,
	CoopFormDataType,
	CoopUnionFormDataType,
	useAssociationStore,
	useCoopStore,
	useCoopUnionStore,
} from 'src/store/organizations'
import { errorMessages } from 'src/constants/errorMessages'
import PreviewCoop from '../organizations/PreviewCoop'
import PreviewAssociation from '../organizations/PreviewAssociation'
import PreviewCoopUnion from '../organizations/PreviewCoopUnion'
import ConfirmOrCancelButtons from '../buttons/ConfirmOrCancelButtons'
import { useUserDetails } from 'src/hooks/queries'
import { insertActor, insertLicense, insertNuel, insertNuit } from 'src/library/powersync/sql-statements'
import { Href, useRouter } from 'expo-router'
import { useAddressStore } from 'src/store/address'
import ErrorAlert from '../dialogs/ErrorAlert'
import { buildActor } from 'src/library/powersync/schemas/actors'
import { buildAddressDetail } from 'src/library/powersync/schemas/address_details'
import { buildNuel } from 'src/library/powersync/schemas/nuels'
import { buildNuit } from 'src/library/powersync/schemas/nuits'
import { buildLicense } from 'src/library/powersync/schemas/licenses'
import {
	insertActorCategory,
	insertActorDetails,
	insertAddressDetail,
	insertBirthDate,
} from 'src/library/powersync/sql-statements2'
import { buildActorDetails } from 'src/library/powersync/schemas/actor_details'
import { buildBirthDate } from 'src/library/powersync/schemas/birth_dates'
import { buildActorCategories } from 'src/library/powersync/schemas/actor_categories'

type OrganizationDataPreviewProps = {
	previewData: boolean
	setPreviewData: (preview: boolean) => void
	org: CoopFormDataType | AssociationFormDataType | CoopUnionFormDataType
	setErrorMessage: (message: string) => void
	setHasError: (error: boolean) => void
	setSuccess: (success: boolean) => void
	setRouteSegment: (route: string) => void
	organizationType: OrganizationTypes
	hasError: boolean
	errorMessage: string
}

export default function OrganizationDataPreview({
	previewData,
	setPreviewData,
	org,
	setErrorMessage,
	setHasError,
	hasError,
	errorMessage,
	setSuccess,
	setRouteSegment,
	organizationType,
}: OrganizationDataPreviewProps) {
	const { userDetails } = useUserDetails()
	const {
		partialAddress,
		getPartialAdminPostNameById,
		getPartialVillageNameById,
		reset: resetAddress,
	} = useAddressStore()
	const router = useRouter()

	const [partialAdminPostName, setPartialAdminPostName] = useState<string>('')
	const [partialVillageName, setPartialVillageName] = useState<string>('')
	const [isSaving, setIsSaving] = useState<boolean>(false)
	// Fetch address names when component mounts or fullAddress changes
	useEffect(() => {
		const fetchAddressNames = async () => {
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
		}
		fetchAddressNames()
	}, [partialAddress.adminPostId, partialAddress.villageId, getPartialAdminPostNameById, getPartialVillageNameById])

	const resetFormData = match(organizationType)
		.with(OrganizationTypes.COOPERATIVE, () => useCoopStore().resetFormData)
		.with(OrganizationTypes.ASSOCIATION, () => useAssociationStore().resetFormData)
		.with(OrganizationTypes.COOP_UNION, () => useCoopUnionStore().resetFormData)
		.exhaustive()

	const createOrganization = useCallback(async () => {
		if (
			!userDetails?.district_id ||
			!userDetails?.province_id ||
			!partialAddress.villageId ||
			!partialAddress.adminPostId
		) {
			console.log('User details not found')
			setHasError(true)
			setErrorMessage(errorMessages.failedToSave)
			return
		}

		const coop =
			organizationType === OrganizationTypes.COOPERATIVE
				? (org as CoopFormDataType)
				: organizationType === OrganizationTypes.ASSOCIATION
					? (org as AssociationFormDataType)
					: (org as CoopUnionFormDataType)

		let creationYear = 0
		if (organizationType === OrganizationTypes.COOPERATIVE || organizationType === OrganizationTypes.ASSOCIATION) {
			const group = coop as CoopFormDataType | AssociationFormDataType
			creationYear = Number(group.creationYear)
		} else if (organizationType === OrganizationTypes.COOP_UNION) {
			const coopUnion = coop as CoopUnionFormDataType
			creationYear = Number(coopUnion.affiliationYear || 0)
		}
		try {
			setIsSaving(true)

			// 1. build and insert actor main record
			const actor_row = buildActor({
				category: ResourceName.GROUP,
				sync_id: userDetails.district_id,
			})
			await insertActor(actor_row)

			// 2. build and insert actor details record
			const actor_detail_row = buildActorDetails({
				actor_id: actor_row.id,
				surname: 'GROUP',
				other_names: coop.name,
				photo: '',
				sync_id: userDetails.district_id,
			})
			await insertActorDetails(actor_detail_row)

			// 3. build and insert birth date record
			const birth_date_row = buildBirthDate({
				month: 1,
				day: 1,
				year: creationYear,
				owner_id: actor_row.id,
				owner_type: ResourceName.GROUP,
				sync_id: userDetails.district_id,
			})
			await insertBirthDate(birth_date_row)

			// 4. build and insert actor categories record
			const category_row = buildActorCategories({
				actor_id: actor_row.id,
				category: ResourceName.GROUP,
				subcategory: String(organizationType),
				sync_id: userDetails.district_id,
			})
			await insertActorCategory(category_row)
			
			// 5. build and insert address detail record
			const address_details_row = buildAddressDetail({
				owner_id: actor_row.id,
				owner_type: ResourceName.GROUP,
				village_id: partialAddress.villageId,
				admin_post_id: partialAddress.adminPostId,
				district_id: userDetails.district_id,
				province_id: userDetails.province_id,
				gps_lat: '0',
				gps_long: '0',
				sync_id: userDetails.district_id,
			})
			await insertAddressDetail(address_details_row)

			// 6. build and insert nuel record
			if (coop.nuel && coop.nuel.length === 9) {
				const nuel_row = buildNuel({
					nuel: coop.nuel,
					actor_id: actor_row.id,
					sync_id: userDetails.district_id,
				})
				await insertNuel(nuel_row)
			}

			// 7. build and insert nuit record
			if (coop.nuit && coop.nuit.length === 9) {
				const nuit_row = buildNuit({
					nuit: coop.nuit,
					actor_id: actor_row.id,
					sync_id: userDetails.district_id,
				})
				await insertNuit(nuit_row)
			}

			// 8. build and insert license record
			if (coop.license && coop.license !== 'N/A') {
				const license_row = buildLicense({
					number: `${coop.license}-BUSINESS_LICENSE`,
					owner_id: actor_row.id,
					owner_type: ResourceName.GROUP,
					photo: '',
					issue_date: new Date().toISOString(),
					expiration_date: new Date().toISOString(),
					issue_place_id: userDetails.district_id,
					issue_place_type: 'DISTRICT',
					sync_id: userDetails.district_id,
				})
				await insertLicense(license_row)
			}

			resetFormData()

			let routeSegment: string
			if (organizationType === OrganizationTypes.COOP_UNION) {
				routeSegment = 'coop-unions'
			} else if (organizationType === OrganizationTypes.ASSOCIATION) {
				routeSegment = 'associations'
			} else {
				routeSegment = 'cooperatives'
			}

			resetAddress()

			router.replace(`/(tabs)/actors/groups/${routeSegment}` as Href)
		} catch (error) {
			setHasError(true)
			setErrorMessage(errorMessages.failedToSave)
			console.error('Failed to save organization', error)
		} finally {
			setPreviewData(false)
			setIsSaving(false)
		}
	}, [userDetails, previewData, org, organizationType, resetFormData])

	return (
		<Modal visible={previewData} presentationStyle="overFullScreen">
			<View className="flex-1 w-full bg-white dark:bg-black p-3 justify-center ">
				<View className="h-8 flex flex-row justify-between space-x-2 ">
					<View className="flex-1 items-center justify-center">
						<Text className="text-[16px] font-bold text-black dark:text-white ">Confirmar Dados</Text>
					</View>
				</View>
				{organizationType === OrganizationTypes.COOPERATIVE && (
					<PreviewCoop
						org={org as CoopFormDataType}
						adminPostName={partialAdminPostName}
						villageName={partialVillageName}
					/>
				)}
				{organizationType === OrganizationTypes.ASSOCIATION && (
					<PreviewAssociation
						org={org as AssociationFormDataType}
						adminPostName={partialAdminPostName}
						villageName={partialVillageName}
					/>
				)}

				{organizationType === OrganizationTypes.COOP_UNION && (
					<PreviewCoopUnion
						org={org as CoopUnionFormDataType}
						adminPostName={partialAdminPostName}
						villageName={partialVillageName}
					/>
				)}

				<ConfirmOrCancelButtons
					onCancel={() => setPreviewData(false)}
					onConfirm={async () => await createOrganization()}
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
