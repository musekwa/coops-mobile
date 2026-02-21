import { View } from 'react-native'
import React from 'react'
import { cn } from 'src/utils/tailwind'
import { ShipmentStatusTypes } from 'src/constants/tracking'
type ShipmentHorizontalStatusLineProps = {
	status: ShipmentStatusTypes
}

// Adjusting the component to make the line between green dots also green
export default function ShipmentHorizontalStatusLine({ status }: ShipmentHorizontalStatusLineProps) {
	
	return (
		<View className="flex flex-row items-center justify-center">
			<View
				className={cn(`bg-black w-[12px] h-[12px] rounded-full dark:bg-white`, {
					'bg-yellow-600 dark:bg-yellow-600': status === ShipmentStatusTypes.AT_DEPARTURE,
					'bg-blue-600 dark:bg-blue-600': status === ShipmentStatusTypes.IN_TRANSIT,
					'bg-[#008000] dark:bg-[#008000]': status === ShipmentStatusTypes.AT_ARRIVAL,
				})}
			/>
			<View
				className={cn('flex-1 h-[2px] bg-black dark:bg-white', {
					'bg-yellow-600 dark:bg-yellow-600': status === ShipmentStatusTypes.AT_DEPARTURE,
					'bg-blue-600 dark:bg-blue-600': status === ShipmentStatusTypes.IN_TRANSIT,
					'bg-[#008000] dark:bg-[#008000]': status === ShipmentStatusTypes.AT_ARRIVAL,
				})}
			/>
			<View
				className={cn('bg-black w-[12px] h-[12px] rounded-full dark:bg-white', {
					'bg-blue-600 dark:bg-blue-600': status === ShipmentStatusTypes.IN_TRANSIT,
					'bg-[#008000] dark:bg-[#008000]': status === ShipmentStatusTypes.AT_ARRIVAL,
				})}
			/>
			<View
				className={cn('flex-1 h-[2px] bg-black dark:bg-white', {
					'bg-blue-600 dark:bg-blue-600': status === ShipmentStatusTypes.IN_TRANSIT,
					'bg-[#008000] dark:bg-[#008000]': status === ShipmentStatusTypes.AT_ARRIVAL,
				})}
			/>
			<View
				className={cn('bg-black w-[12px] h-[12px] rounded-full dark:bg-white', {
					'bg-[#008000] dark:bg-[#008000]': status === ShipmentStatusTypes.AT_ARRIVAL,
				})}
			/>
		</View>
	)
}
