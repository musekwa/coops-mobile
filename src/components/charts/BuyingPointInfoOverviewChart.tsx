import { View, Text } from 'react-native'
import React from 'react'
import { Bar, CartesianChart, Line } from 'victory-native'

const DATA = [
	{ day: new Date('2024-01-01'), quantity: 1600 },
	{ day: new Date('2024-01-02'), quantity: 700 },
	{ day: new Date('2024-01-03'), quantity: 1800 },
	{ day: new Date('2024-01-04'), quantity: 2000 },
	{ day: new Date('2024-01-05'), quantity: 450 },
	{ day: new Date('2024-01-06'), quantity: 2050 },
	{ day: new Date('2024-01-07'), quantity: 1600 },
]

export default function BuyingPointInfoOverviewChart() {
	return (
		<View className="h-[120px] w-[100%] flex bg-white dark:bg-black">
			<CartesianChart data={DATA} xKey="day" yKeys={['quantity']}>
				{({ points }) => <Line points={points.quantity} color="red" strokeWidth={4} />}
			</CartesianChart>
		</View>
	)
}
