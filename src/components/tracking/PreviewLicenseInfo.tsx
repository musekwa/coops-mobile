import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import CustomImageViewer from '../data-preview/CustomImageViewer'
import { useActionStore } from 'src/store/actions/actions'
import { ActionType } from 'src/types'
import Label from '../forms/Label'
import PreviewFieldInfo from './PreviewFieldInfo'
import { useShipmentLicenseStore } from 'src/store/shipment/shipment_license'
import { useAddressStore } from 'src/store/address'
import { getDistrictById } from 'src/library/sqlite/selects'
import { useUserDetails } from 'src/hooks/queries'
import { useShipmentOwnerDetailsStore } from 'src/store/shipment/shipment_owner_details'
import { useShipmentCheckpointStore } from 'src/store/shipment/shipment_checkpoint'

export default function PreviewLicenseInfo() {
	const { shipmentLicenseInfo } = useShipmentLicenseStore()
	const { shipmentCheckpointInfo } = useShipmentCheckpointStore()
	const [destinationDistrict, setDestinationDistrict] = useState('')
	const [originDistrict, setOriginDistrict] = useState('')
	const { shipmentNumber, photoUrl, day, month, year } = shipmentLicenseInfo
	const { fullAddress } = useAddressStore()
	const { userDetails } = useUserDetails()

	const [showLicenseImage, setShowLicenseImage] = useState(false)
	const { setAddActionType } = useActionStore()

	useEffect(() => {
		if (fullAddress && fullAddress.districtId) {
			getDistrictById(fullAddress.districtId).then((district) => {
				if (district) {
					setDestinationDistrict(district)
				}
			})
		}
		if (userDetails && userDetails.district_id) {
			getDistrictById(userDetails.district_id).then((district) => {
				if (district) {
					setOriginDistrict(district)
				}
			})
		}
	}, [fullAddress, userDetails])

	return (
		<View className="flex-1">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingTop: 30, paddingBottom: 60, paddingHorizontal: 15 }}
			>
				<Text className="font-bold text-[14px] mb-4 text-left">Guia de Trânsito Nº {shipmentNumber}</Text>

				<Label label="Foto da Guia" />
				{photoUrl && (
					<TouchableOpacity
						className="border border-gray-300 rounded-lg shadow-sm overflow-hidden transition-all duration-300 mb-4"
						activeOpacity={0.3}
						onPress={() => {
							setAddActionType(ActionType.PREVIEW_IMAGE)
							setShowLicenseImage(true)
						}}
					>
						<Image source={{ uri: photoUrl }} className="w-full h-40 rounded-lg opacity-30" resizeMode="cover" />
					</TouchableOpacity>
				)}
				<View className="my-4 flex space-y-2">
					<PreviewFieldInfo
						label="Data de emissão:"
						value={`${day}/${month}/${year}`}
						Icon={Ionicons}
						iconName="calendar-outline"
					/>

					<PreviewFieldInfo
						label="Distrito de emissão:"
						value={originDistrict}
						Icon={Ionicons}
						iconName="map-outline"
					/>
					<PreviewFieldInfo
						label="Distrito de destino:"
						value={destinationDistrict}
						Icon={Ionicons}
						iconName="map-outline"
					/>
				</View>
			</ScrollView>
			<CustomImageViewer images={[{ uri: photoUrl }]} visible={showLicenseImage} setVisible={setShowLicenseImage} />
		</View>
	)
}
