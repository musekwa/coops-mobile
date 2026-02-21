import { View, Text, Modal, ScrollView } from 'react-native'
import React, { useCallback, useState, useEffect } from 'react'
import { FarmerFormDataType, useFarmerStore } from 'src/store/farmer'
import { capitalize } from 'src/helpers/capitalize'
import { match } from 'ts-pattern'
import { Divider } from 'react-native-paper'
import FormFieldPreview from './FormFieldPreview'
import ConfirmOrCancelButtons from '../buttons/ConfirmOrCancelButtons'
import { MultiCategory } from 'src/types'
import { useQueryMany, useUserDetails } from 'src/hooks/queries'
import { ActorDetailRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useRouter } from 'expo-router'
import { useAddressStore } from 'src/store/address'
import ErrorAlert from '../dialogs/ErrorAlert'
import { useToast } from '../ToastMessage'

type FarmerDataPreviewProps = {
	previewData: boolean
	setPreviewData: (b: boolean) => void
	farmer: FarmerFormDataType
	errorMessage: string
	hasError: boolean
	// success: boolean
	setErrorMessage: (message: string) => void
	setHasError: (b: boolean) => void
	// setSuccess: (b: boolean) => void
	setRouteSegment: (route: string) => void
	// setDuplicates: (farmers: Farmer[]) => void
	proceed: boolean
	reset: () => void
	nationality?: 'NATIONAL' | 'FOREIGN' | undefined
}

export default function FarmerDataPreview({
	previewData,
	setPreviewData,
	farmer,
	setErrorMessage,
	setHasError,
	hasError,
	errorMessage,
	// success,
	// setSuccess,
	setRouteSegment,
	// setDuplicates,
	proceed,
	reset,
	nationality,
}: FarmerDataPreviewProps) {
	const { userDetails } = useUserDetails()
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
	} = useAddressStore()


	const { showInfo } = useToast()

	// State for async address names
	const [fullProvinceName, setFullProvinceName] = useState<string>('')
	const [fullDistrictName, setFullDistrictName] = useState<string>('')
	const [fullAdminPostName, setFullAdminPostName] = useState<string>('')
	const [fullVillageName, setFullVillageName] = useState<string>('')

	const [partialAdminPostName, setPartialAdminPostName] = useState<string>('')
	const [partialVillageName, setPartialVillageName] = useState<string>('')
	const [countryName, setCountryName] = useState<string>('')
	const [isSaving, setIsSaving] = useState<boolean>(false)
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
			if (countryId) {
				try {
					const name = await getCountryNameById(countryId)
					setCountryName(name || 'N/A')
				} catch (error) {
					setCountryName('N/A')
				}
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
	const addNewFarmer = useCallback(async () => {
		if (!userDetails || !userDetails.district_id || !userDetails.province_id) {
			setErrorMessage('Por favor, verifique os dados do usuário')
			setHasError(true)
			return
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
		
		showInfo('Gravando produtor...')

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


		setErrorMessage(
			`Foi gravado com sucesso o endereço...
				address: 4ae146ce-ee5a-412c-b7b9-1048918e0e13
			`)
		setHasError(true)
		return
	}, [farmer, proceed, previewData, userDetails, showInfo, setErrorMessage, setHasError, isSaving])

	const farmerCategory = match(farmer.isSmallScale)
		.with('YES', () => 'Familiar')
		.with('NO', () => 'Comercial')
		.otherwise(() => 'Não Especificado')
	const farmerSurname = farmer.surname.toLowerCase().includes('company')
		? `${farmer.surname.split(' - ')[0]}`
		: farmer.surname

	return (
		<Modal visible={previewData} presentationStyle="overFullScreen" animatedType="slide">
			<View className="flex-1 w-full bg-white dark:bg-black p-3 justify-center ">
				<View className="h-8 flex flex-row justify-between space-x-2 ">
					<View className="flex-1 items-center justify-center">
						<Text className="text-[16px] font-bold text-black dark:text-white ">Confirmar Dados</Text>
					</View>
				</View>
				{!farmer.surname.toLowerCase().includes('company') && (
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							paddingBottom: 60,
						}}
						className="space-y-3"
					>
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
								<>
									<FormFieldPreview title="Nascimento (Província/País):" value={fullProvinceName} />
									<FormFieldPreview
										title={fullAddress.provinceId ? 'Nascimento (País):' : 'Nascimento (Distrito):'}
										value={fullDistrictName}
									/>
									<FormFieldPreview title="Nascimento (Posto Administrativo):" value={fullAdminPostName} />
									<FormFieldPreview title="Nascimento (Localidade):" value={fullVillageName} />
								</>
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
					</ScrollView>
				)}
				{farmer.surname.toLowerCase().includes('company') && (
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							paddingBottom: 60,
						}}
						className="space-y-3"
					>
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
							<FormFieldPreview title="Endereço (posto administrativo):" value={partialAdminPostName} />
							<FormFieldPreview title="Endereço (Localidade):" value={partialVillageName} />
						</View>
						<Divider />
						<View className="flex flex-col py-3">
							<FormFieldPreview title="NUIT:" value={farmer.nuit ? farmer.nuit : 'Nenhum'} />
						</View>
					</ScrollView>
				)}

				<ConfirmOrCancelButtons
					onCancel={() => setPreviewData(false)}
					onConfirm={addNewFarmer}
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
				{/* <SuccessAlert visible={success} setVisible={setSuccess} /> */}
			</View>
		</Modal>
	)
}
