import { Ionicons } from '@expo/vector-icons'
import { View, Text } from 'react-native'
import { ScrollView } from 'react-native'
import { useEffect, useState } from 'react'

import { useSmugglingFlowStore } from 'src/store/tracking/smugglingFlow'
import PreviewFieldInfo from '../tracking/PreviewFieldInfo'
import Label from '../forms/Label'
import {
	getProvinceById,
	getDistrictById,
	getAdminPostById,
	getVillageById,
	getCountryById,
} from 'src/library/sqlite/selects'
import { TransportTypes } from 'src/constants/tracking'
import { match } from 'ts-pattern'
import { useSmuggledLoadDetailsStore } from 'src/store/tracking/smuggled_load'

const BorderType = {
	INBORDERS: 'INBORDERS',
	CROSSBORDERS: 'CROSSBORDERS',
} as const

const ShipmentDirection = {
	INBOUND: 'INBOUND',
	OUTBOUND: 'OUTBOUND',
} as const

export default function PreviewSmugglingFlow() {
	const { smugglingFlowInfo } = useSmugglingFlowStore()
	const {
		borderType,
		shipmentDirection,
		provinceId,
		districtId,
		adminPostId,
		villageId,
		destinationCountryId,
		borderName,
	} = smugglingFlowInfo

	const { smuggledLoadDetails } = useSmuggledLoadDetailsStore()

	const { quantity, transportType } = smuggledLoadDetails


	const selectedTransportType = match(transportType)
		.with(TransportTypes.BICYCLE, () => 'Bicicleta')
		.with(TransportTypes.MOTORBIKE, () => 'Moto')
		.with(TransportTypes.CAR, () => 'Carro')
		.with(TransportTypes.CANOE, () => 'Canoa')
		.with(TransportTypes.BOAT, () => 'Barco')
		.otherwise(() => 'Nenhum')

	// State for address names
	const [provinceName, setProvinceName] = useState<string>('')
	const [districtName, setDistrictName] = useState<string>('')
	const [adminPostName, setAdminPostName] = useState<string>('')
	const [villageName, setVillageName] = useState<string>('')
	const [countryName, setCountryName] = useState<string>('')

	// Fetch address names when component mounts or IDs change
	useEffect(() => {
		const fetchAddressNames = async () => {
			if (provinceId) {
				try {
					const name = await getProvinceById(provinceId)
					setProvinceName(name || 'N/A')
				} catch (error) {
					setProvinceName('N/A')
				}
			}
			if (districtId) {
				try {
					const name = await getDistrictById(districtId)
					setDistrictName(name || 'N/A')
				} catch (error) {
					setDistrictName('N/A')
				}
			}
			if (adminPostId) {
				try {
					const name = await getAdminPostById(adminPostId)
					setAdminPostName(name || 'N/A')
				} catch (error) {
					setAdminPostName('N/A')
				}
			}
			if (villageId) {
				try {
					const name = await getVillageById(villageId)
					setVillageName(name || 'N/A')
				} catch (error) {
					setVillageName('N/A')
				}
			}
			if (destinationCountryId) {
				try {
					const name = await getCountryById(destinationCountryId)
					setCountryName(name || 'N/A')
				} catch (error) {
					setCountryName('N/A')
				}
			}
		}
		fetchAddressNames()
	}, [provinceId, districtId, adminPostId, villageId, destinationCountryId])

	const borderTypeLabel = borderType === BorderType.INBORDERS ? 'De um distrito para outro distrito' : 'De um país para outro país'
	const shipmentDirectionLabel =
		shipmentDirection === ShipmentDirection.INBOUND
			? 'Para dentro do distrito'
			: shipmentDirection === ShipmentDirection.OUTBOUND
				? 'Para fora do distrito'
				: 'N/A'

	return (
		<View className="flex-1">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingTop: 30, paddingBottom: 60, paddingHorizontal: 15 }}
			>
				<Text className="font-bold text-[14px] mb-4 text-left">Informações sobre a carga</Text>

				<View className="my-4 flex space-y-2">

					<PreviewFieldInfo
						label="Quantidade (kg.):"
						value={`${String(quantity)} kg.`}
						Icon={Ionicons}
						iconName="person-outline"
					/>

					<PreviewFieldInfo
						label="Meio de transporte:"
						value={selectedTransportType}
						Icon={Ionicons}
						iconName="map-outline"
					/>
				</View>

				<View className="my-4 flex space-y-2">
					<PreviewFieldInfo label="Tipo de trânsito:" value={borderTypeLabel} Icon={Ionicons} iconName="map-outline" />

					{/* Show shipment direction for INBORDERS */}
					{borderType === BorderType.INBORDERS && (
						<PreviewFieldInfo
							label="Direção do trânsito:"
							value={shipmentDirectionLabel}
							Icon={Ionicons}
							iconName="arrow-forward-outline"
						/>
					)}

					{/* Show address fields for INBORDERS */}
					{borderType === BorderType.INBORDERS && (
						<>
							<View className="flex-row items-center py-3">
								<Label
									label={
										shipmentDirection === ShipmentDirection.INBOUND ? 'Endereço de origem:' : 'Endereço de destino:'
									}
								/>
							</View>

							<PreviewFieldInfo label="Província:" value={provinceName} Icon={Ionicons} iconName="map-outline" />
							<PreviewFieldInfo label="Distrito:" value={districtName} Icon={Ionicons} iconName="map-outline" />
							<PreviewFieldInfo
								label="Posto Administrativo:"
								value={adminPostName}
								Icon={Ionicons}
								iconName="map-outline"
							/>
							<PreviewFieldInfo label="Localidade:" value={villageName} Icon={Ionicons} iconName="map-outline" />
						</>
					)}

					{/* Show destination country and border name for CROSSBORDERS */}
					{borderType === BorderType.CROSSBORDERS && (
						<>
							<PreviewFieldInfo label="País de destino:" value={countryName} Icon={Ionicons} iconName="globe-outline" />
							<PreviewFieldInfo
								label="Nome da fronteira:"
								value={borderName || 'N/A'}
								Icon={Ionicons}
								iconName="flag-outline"
							/>
						</>
					)}
				</View>
			</ScrollView>
		</View>
	)
}
