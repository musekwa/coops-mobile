import React, { useRef } from 'react'
import { View, Text } from 'react-native'
import LottieView from 'lottie-react-native'
import { ShipmentStatusTypes } from 'src/constants/tracking'
import { ShipmentStageStatus } from 'src/features/formal-shipment/components/shipment-stage-status'
import ShipmentHorizontalStatusLine from 'src/components/tracking/ShipmentHorizontalStatusLine'
import { ShipmentWithOwnerData, ShipmentLoadWithCarAndDriver } from '../types'
import { ToPortuguese } from 'src/helpers/translate'

interface ShipmentInfoCardProps {
	shipment: ShipmentWithOwnerData
	shipmentLoads: ShipmentLoadWithCarAndDriver[]
}

export function ShipmentInfoCard({ shipment, shipmentLoads }: ShipmentInfoCardProps) {
	const animation = useRef<LottieView>(null)
	const totalWeight = shipmentLoads?.reduce((acc, load) => acc + load.quantity, 0) || 0

	return (
		<View className="relative p-2 w-[100%] border border-slate-200 shadow-sm rounded-md dark:border-slate-700">
			<View className="flex flex-row">
				<ShipmentStageStatus stage={shipment?.status as ShipmentStatusTypes} />
				<View className="absolute right-0 -top-5">
					<LottieView
						autoPlay={true}
						ref={animation}
						style={{
							width: 60,
							height: 60,
						}}
						source={require('../../../../../assets/lottie/lottie-truck.json')}
					/>
				</View>
			</View>
			<View className="flex flex-row justify-between my-2 space-x-4">
				<View className="flex-1 items-start">
					<Text className="text-gray-600 dark:text-gray-400 text-[10px]">
						{ToPortuguese.carType(shipmentLoads?.[0]?.car_type)} ({shipmentLoads?.[0]?.plate_number})
					</Text>
					<Text className="text-gray-600 dark:text-gray-400 text-[10px]">
						Motorista: {shipmentLoads?.[0]?.driver_name}
					</Text>
					<Text className="text-gray-600 dark:text-gray-400 text-[10px]">Tel: {shipmentLoads?.[0]?.driver_phone}</Text>
				</View>
				<View className="flex items-center justify-center">
					{shipment?.status === ShipmentStatusTypes.AT_ARRIVAL && (
						<Text className="text-gray-600 dark:text-gray-400 text-[10px] underline">
							Guia: {shipment?.shipment_number}
						</Text>
					)}
					{/* <Text className="text-gray-600 dark:text-gray-400 text-[10px] underline">{'fdjfjdj'}</Text> */}
					<Text className="text-black text-[12px] font-semibold dark:text-white">
						{new Intl.NumberFormat('pt-BR').format(totalWeight)} Kg
					</Text>
				</View>
			</View>
			<ShipmentHorizontalStatusLine status={shipment?.status as ShipmentStatusTypes} />
			<View className="mt-2 flex flex-row justify-between space-x-4">
				<View className="flex-1 items-start">
					<Text className="text-gray-600 dark:text-gray-400 text-[10px]">Tempo estimado</Text>
					<Text className="text-black text-[12px] font-semibold dark:text-white">N/A</Text>
				</View>
			</View>
		</View>
	)
}
