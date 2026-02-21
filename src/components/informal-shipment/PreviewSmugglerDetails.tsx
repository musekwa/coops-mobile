import { Ionicons } from '@expo/vector-icons'
import { View, Text } from 'react-native'
import { ScrollView } from 'react-native'
import { useMemo } from 'react'

import { useSmugglerDetailsStore } from 'src/store/tracking/smuggler'
import PreviewFieldInfo from '../tracking/PreviewFieldInfo'
import Label from '../forms/Label'
import { useQueryMany } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'

type SmugglerData = {
	id: string
	surname: string
	other_names: string
	phone: string
}

export default function PreviewSmugglerDetails() {
	const { smugglerDetails } = useSmugglerDetailsStore()
	const {
		smugglerId,
		smugglerCategory,
		smugglerOtherNames,
		smugglerSurname,
		smugglerPhone,
		smugglerVillage,
		smugglerAdminPost,
		smugglerDistrict,
		smugglerProvince,
		isAlreadyRegistered,
	} = smugglerDetails

	// Build query to fetch smuggler data from database if already registered
	const query = useMemo(() => {
		if (!isAlreadyRegistered || !smugglerId || !smugglerCategory) {
			return 'SELECT 1 WHERE 1=0'
		}

		if (smugglerCategory === 'FARMER') {
			return `
				SELECT 
					ad.actor_id as id,
					ad.surname,
					ad.other_names,
					COALESCE(NULLIF(cd.primary_phone, 'N/A'), NULLIF(cd.secondary_phone, 'N/A'), 'N/A') as phone
				FROM ${TABLES.ACTOR_DETAILS} ad
				LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON ad.actor_id = cd.owner_id AND cd.owner_type = 'FARMER'
				WHERE ad.actor_id = '${smugglerId}'
			`
		} else if (smugglerCategory === 'TRADER') {
			return `
				SELECT 
					t.actor_id as id,
					t.surname,
					t.other_names,
					COALESCE(NULLIF(c.primary_phone, 'N/A'), NULLIF(c.secondary_phone, 'N/A'), 'N/A') as phone
				FROM ${TABLES.ACTOR_DETAILS} t
				LEFT JOIN ${TABLES.CONTACT_DETAILS} c ON c.owner_id = t.actor_id AND c.owner_type = 'TRADER'
				WHERE t.actor_id = '${smugglerId}'
			`
		}
		return 'SELECT 1 WHERE 1=0'
	}, [isAlreadyRegistered, smugglerId, smugglerCategory])

	// Fetch data from database if already registered
	const { data: fetchedData, isLoading } = useQueryMany<SmugglerData>(query)
	const fetchedSmuggler = fetchedData && fetchedData.length > 0 ? fetchedData[0] : null

	// Use fetched data if available, otherwise use store data
	const displaySurname = fetchedSmuggler?.surname || smugglerSurname || ''
	const displayOtherNames = fetchedSmuggler?.other_names || smugglerOtherNames || ''
	const displayPhone = fetchedSmuggler?.phone || smugglerPhone || ''

	// Format category label
	const categoryLabel =
		smugglerCategory === 'FARMER' ? 'Produtor' : smugglerCategory === 'TRADER' ? 'Comerciante' : 'N/A'

	// Combine surname and other names for full name
	const fullName = `${displayOtherNames} ${displaySurname}`.trim() || 'N/A'

	// Format registration status
	const registrationStatus = isAlreadyRegistered ? 'Sim' : 'Não'

	return (
		<View className="flex-1">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingTop: 30, paddingBottom: 60, paddingHorizontal: 15 }}
			>
				<Text className="font-bold text-[14px] mb-4 text-left">Dados do proprietário</Text>

				<View className="my-4 flex space-y-2">
					{/* Registration Status */}
					<PreviewFieldInfo
						label="Já registado:"
						value={registrationStatus}
						Icon={Ionicons}
						iconName="checkmark-circle-outline"
					/>

					{/* Category */}
					<PreviewFieldInfo label="Categoria:" value={categoryLabel} Icon={Ionicons} iconName="person-outline" />

					{/* Full Name */}
					<PreviewFieldInfo label="Nome completo:" value={fullName} Icon={Ionicons} iconName="person-outline" />

					{/* Surname */}
					<PreviewFieldInfo
						label="Apelido:"
						value={displaySurname || 'N/A'}
						Icon={Ionicons}
						iconName="person-outline"
					/>

					{/* Other Names */}
					<PreviewFieldInfo
						label="Nomes:"
						value={displayOtherNames || 'N/A'}
						Icon={Ionicons}
						iconName="person-outline"
					/>

					{/* Phone */}
					<PreviewFieldInfo label="Contacto:" value={displayPhone || 'N/A'} Icon={Ionicons} iconName="call-outline" />

					{/* Address Section */}
					{(smugglerProvince || smugglerDistrict || smugglerAdminPost || smugglerVillage) && (
						<>
							<View className="flex-row items-center py-3">
								<Label label="Endereço:" />
							</View>

							{smugglerProvince && (
								<PreviewFieldInfo label="Província:" value={smugglerProvince} Icon={Ionicons} iconName="map-outline" />
							)}

							{smugglerDistrict && (
								<PreviewFieldInfo label="Distrito:" value={smugglerDistrict} Icon={Ionicons} iconName="map-outline" />
							)}

							{smugglerAdminPost && (
								<PreviewFieldInfo
									label="Posto Administrativo:"
									value={smugglerAdminPost}
									Icon={Ionicons}
									iconName="map-outline"
								/>
							)}

							{smugglerVillage && (
								<PreviewFieldInfo label="Localidade:" value={smugglerVillage} Icon={Ionicons} iconName="map-outline" />
							)}
						</>
					)}
				</View>
			</ScrollView>
		</View>
	)
}
