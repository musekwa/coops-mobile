import { Ionicons } from '@expo/vector-icons'
import { ScrollView } from 'react-native'
import { View, Text } from 'react-native'
import { useShipmentOwnerDetailsStore } from 'src/store/shipment/shipment_owner_details'
import { useShipmentReceiverDetailsStore } from 'src/store/tracking/receiverDetails'
import PreviewFieldInfo from './PreviewFieldInfo'
export default function PreviewOwnerAndReceiverInfo() {
	const { shipmentOwnerDetails } = useShipmentOwnerDetailsStore()
	const { shipmentReceiverDetails } = useShipmentReceiverDetailsStore()
	const { ownerName, ownerPhone } = shipmentOwnerDetails
	const { receiverName, receiverPhone, destinationDistrict, destinationProvince } = shipmentReceiverDetails
	const owner = ownerName.toLowerCase().includes('company')
		? `${ownerName.replace('Company', '(Empresa)').trim()} `
		: ownerName
	const receiver = receiverName.toLowerCase().includes('company')
		? `${receiverName.replace('Company', '(Empresa)').trim()} `
		: receiverName

	return (
		<View className="flex-1 justify-center">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingVertical: 30, paddingHorizontal: 15 }}
			>
				{/* Owner info */}
				<View className="mb-4">
					<Text className="font-bold text-[14px] mb-4 text-left">Dados do proprietário</Text>
					<PreviewFieldInfo label="Nome do proprietário:" value={owner} Icon={Ionicons} iconName="person-outline" />
					<PreviewFieldInfo
						label="Telefone do proprietário:"
						value={ownerPhone || 'Não disponível'}
						Icon={Ionicons}
						iconName="call-outline"
					/>
				</View>

				{/* Receiver info */}
				<View className="mb-4">
					<Text className="font-bold text-[14px] mb-4 text-left">Dados do destinatário</Text>
					<PreviewFieldInfo label="Nome do destinatário:" value={receiver} Icon={Ionicons} iconName="person-outline" />
					<PreviewFieldInfo
						label="Telefone do destinatário:"
						value={receiverPhone || 'Não disponível'}
						Icon={Ionicons}
						iconName="call-outline"
					/>
					<PreviewFieldInfo
						label="Distrito de destino:"
						value={destinationDistrict}
						Icon={Ionicons}
						iconName="map-outline"
					/>
					<PreviewFieldInfo
						label="Província de destino:"
						value={destinationProvince}
						Icon={Ionicons}
						iconName="map-outline"
					/>
				</View>
			</ScrollView>
		</View>
	)
}
