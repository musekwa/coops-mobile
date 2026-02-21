import { View, Text, ScrollView } from 'react-native'
import PreviewFieldInfo from './PreviewFieldInfo'
import { Ionicons } from '@expo/vector-icons'
import { useShipmentDriverStore } from 'src/store/shipment/shipment_driver'
import { useShipmentCarStore } from 'src/store/shipment/shipment_car'
import { useShipmentLoadStore } from 'src/store/shipment/shipment_load'

export default function PreviewShipmentLoadInfo() {
	const { shipmentDriverInfo } = useShipmentDriverStore()
	const { shipmentCarInfo } = useShipmentCarStore()
	const { shipmentLoadInfo } = useShipmentLoadStore()

	const { driverName, driverPhone, driverId } = shipmentDriverInfo

	const { firstPartPlate, secondPartPlate, thirdPartPlate, brandName, carType } = shipmentCarInfo

	const { truckLoad, trailerLoads } = shipmentLoadInfo

	const getProductType = (productType: string) => {
		if (productType === 'CASHEW_NUT') {
			return 'Castanha de caju'
		}
		if (productType === 'CASHEW_KERNEL') {
			return 'Amêndoa de caju'
		}
		return 'Outro'
	}

	// const sackTypeText = label === 'CASHEW_NUT' ? 'Sacos' : 'Caixas'

	// console.log('transporterInfo', JSON.stringify(transporterInfo, null, 2))

	const truckPlate = `${firstPartPlate} ${secondPartPlate} ${thirdPartPlate}`

	return (
		<View className="flex-1 justify-center">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingVertical: 30, paddingHorizontal: 15 }}
			>
				{/* Driver info */}
				<View className="mb-4 border-b border-gray-200 pb-4 rounded-md">
					<Text className="font-bold text-[14px] mb-4 text-left">Dados do motorista</Text>
					<PreviewFieldInfo label="Nome do motorista:" value={driverName} Icon={Ionicons} iconName="person-outline" />
					<PreviewFieldInfo
						label="Telefone do motorista:"
						value={driverPhone || 'Não disponível'}
						Icon={Ionicons}
						iconName="call-outline"
					/>
				</View>
				{/* Truck info */}
				<View className="mb-4 border-b border-gray-200 pb-4 rounded-md">
					<Text className="font-bold text-[14px] mb-4 text-left text-gray-500">{brandName} - {truckPlate}</Text>
					<PreviewFieldInfo
						label="Tipo de Mercadoria:"
						value={getProductType(truckLoad.productType)}
						Icon={Ionicons}
						iconName="car-outline"
					/>
					<PreviewFieldInfo
						label="Número de sacos:"
						value={truckLoad.numberOfBags?.toString() || 'N/A'}
						Icon={Ionicons}
						iconName="car-outline"
					/>
					<PreviewFieldInfo
						label="Peso de cada saco:"
						value={`${truckLoad.bagWeight?.toString()} Kg` || 'N/A'}
						Icon={Ionicons}
						iconName="car-outline"
					/>
					<PreviewFieldInfo
						label="Quantidade (Ton.):"
						value={
							truckLoad.numberOfBags
								? truckLoad.bagWeight
									? `${((truckLoad.numberOfBags * truckLoad.bagWeight) / 1000).toFixed(2)} Ton.`	
									: 'N/A'
								: 'N/A'
						}
						Icon={Ionicons}
						iconName="car-outline"
					/>

					<PreviewFieldInfo
						label="É atrelado?:"
						value={carType === 'TRAILER-TRUCK' ? 'Sim' : 'Não'}
						Icon={Ionicons}
						iconName="car-outline"
					/>
				</View>

				{trailerLoads.length > 0 && (
					<View className="">
						{trailerLoads.map((trailer, index) => (
							<View key={index} className="mb-4 border-b border-gray-200 pb-4 rounded-md">
								<Text className="font-bold text-[14px] mb-4 text-left text-gray-500">
									Trailer {index + 1} - {trailer.plateNumber}
								</Text>
								<PreviewFieldInfo
									label={`Tipo de Mercadoria:`}
									value={getProductType(trailer.productType)}
									Icon={Ionicons}
									iconName="bag-handle-outline"
								/>
								<PreviewFieldInfo
									label={`Número de sacos:`}
									value={trailer.numberOfBags?.toString() || 'N/A'}
									Icon={Ionicons}
									iconName="bag-handle-outline"
								/>
								<PreviewFieldInfo
									label={`Peso de cada saco:`}
									value={`${trailer.bagWeight?.toString()} Kg` || 'N/A'}
									Icon={Ionicons}
									iconName="bag-handle-outline"
								/>
								<PreviewFieldInfo
									label={`Quantidade (Ton.):`}
									value={
										trailer.numberOfBags
											? trailer.bagWeight
												? `${((trailer.numberOfBags * trailer.bagWeight) / 1000).toFixed(2)} Ton.`
												: 'N/A'
											: 'N/A'
									}
									Icon={Ionicons}
									iconName="bag-handle-outline"
								/>
							</View>
						))}
					</View>
				)}
			</ScrollView>
		</View>
	)
}
