import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { GeneratedReportHint, OverviewItemProps, ShipmentStatus } from 'src/types'
import { TouchableOpacity } from 'react-native'
import { colors } from 'src/constants'
import { Ionicons } from '@expo/vector-icons'
import { Shipment } from 'src/models/shipment'

type ShipmentOverViewProps = {
	reportHint: string
    handleSnapPress: (index: number) => void
    shipmentsByStatus: {
        [key in ShipmentStatus]: Shipment[]
    } | null
    setReportHint: (hint: string) => void

}

export default function ShipmentOverView({ reportHint, handleSnapPress, shipmentsByStatus, setReportHint }: ShipmentOverViewProps) {
    const [overviewItems, setOverviewItems] = useState<OverviewItemProps[]>([])

    const handleReportPress = () => {
        handleSnapPress(2)
        setReportHint(GeneratedReportHint.SHIPMENTS)
    }


    useEffect(() => {
        
            if (shipmentsByStatus) {
                setOverviewItems([
                    { title: 'Recebida', value: shipmentsByStatus?.ARRIVING.length ?? 0 },
                    { title: 'Transferida', value: shipmentsByStatus?.DEPARTING.length ?? 0 },
                    { title: 'Transitada', value: shipmentsByStatus?.TRANSITING.length ?? 0 },
                ])
            } else {
                setOverviewItems([
                    { title: 'Recebida', value: 0 },
                    { title: 'Transferida', value: 0 },
                    { title: 'Transitada', value: 0 },
                ])
            }
    }, [shipmentsByStatus])


  return (
    <View className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 pt-1 my-2">
    <View className="flex-row justify-between items-center">
        <View className="flex-row flex-1 items-center">
            <Text className="text-gray-900 dark:text-gray-100 text-[14px] font-bold">Castanha em trânsito</Text>
        </View>
        <TouchableOpacity
            className="mb-2 flex-row items-center p-2 rounded-full bg-gray-50 dark:bg-gray-800"
            onPress={handleReportPress}
        >
            <Ionicons name="list" size={24} color={colors.primary} />
        </TouchableOpacity>

    </View>
    <View className="flex-row justify-between items-center">
        <View className="flex-row w-full flex space-x-2 py-2 justify-between">
            {overviewItems.map((item, index) => (
                <View
                    key={index}
                    className={`flex-1 p-1 rounded-lg ${
                        index === 0
                            ? 'bg-amber-50 dark:bg-gray-900'
                            : index === 1
                                ? 'bg-purple-50 dark:bg-gray-900'
                                : 'bg-lime-50 dark:bg-gray-900'
                    }`}
                >
                    <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1 text-center text-[10px]">
                        {item.title}
                    </Text>
                    <Text className="font-bold text-center text-[16px] text-gray-900 dark:text-gray-100">{item.value}</Text>
                </View>
            ))}
        </View>
    </View>
</View>
  )
}