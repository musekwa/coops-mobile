import { View, Text } from 'react-native'
import { ShipmentStatusTypes } from 'src/constants/tracking'
import { translateShipmentStage } from 'src/helpers/shipmentStatus'
import { cn } from 'src/utils/tailwind'

export const ShipmentStageStatus = ({ stage }: { stage: ShipmentStatusTypes }) => {
	return (
        <View
        className={cn('flex items-center justify-center bg-yellow-100 px-2 py-1 rounded-full', {
            'bg-green-100': stage === ShipmentStatusTypes.DELIVERED,
            'bg-green-200': stage === ShipmentStatusTypes.AT_ARRIVAL,
            'bg-yellow-100': stage === ShipmentStatusTypes.PENDING,
            'bg-blue-100': stage === ShipmentStatusTypes.IN_TRANSIT,
            'bg-yellow-300': stage === ShipmentStatusTypes.AT_DEPARTURE,
        })}
    >
        <Text
            className={cn('text-yellow-600 font-bold text-[12px]', {
                'text-green-600': stage === ShipmentStatusTypes.DELIVERED,
                'text-blue-600': stage === ShipmentStatusTypes.IN_TRANSIT,
                'text-yellow-700': stage === ShipmentStatusTypes.PENDING,
                'text-yellow-600': stage === ShipmentStatusTypes.AT_DEPARTURE,
            })}
        >
            {translateShipmentStage(stage)}
        </Text>
    </View>
	)
}
