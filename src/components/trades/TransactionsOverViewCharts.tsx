import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Bar, useChartPressState, CartesianChart, PolarChart, Pie } from 'victory-native'
import { Circle, LinearGradient, vec, useFont, Text as SKText } from '@shopify/react-native-skia'
import { useDerivedValue, type SharedValue } from 'react-native-reanimated'
import { StockDetailsType } from 'src/types'
import { match } from 'ts-pattern'
import { useColorScheme } from 'nativewind'

function Tooltip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	return <Circle cx={x} cy={y} r={8} color={isDarkMode ? 'white' : 'black'} />
}

export default function TransactionsOverViewCharts({ stockDetails }: { stockDetails: StockDetailsType }) {
	const [domainHeight, setDomainHeight] = useState(25000)
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	
	// Transform stockDetails object into array of {label, value} objects
	const transformedData = Object.entries(stockDetails).map(([key, value]) =>{ 

		const transformedLabel = match(key)
			.with('bought', () => 'Com')
			.with('sold', () => 'Ven')
			.with('aggregated', () => 'Agr')
			.with('transferredIn', () => 'Rec')
			.with('transferredOut', () => 'Tra')
			.with('lost', () => 'Des')
			.with('exported', () => 'Exp')
			.with('processed', () => 'Pro')
			.otherwise(() => key)

		return {
			label: transformedLabel,
			value: value
		}
	})

	useEffect(() => {
		const maxValue = Math.max(...transformedData.map(item => item.value))
		setDomainHeight(maxValue)
	}, [transformedData])

	const { state, isActive } = useChartPressState({
		x: '',
		y: { value: 0 },
	})

	const font = useFont(require('../../../assets/fonts/Roboto-Regular.ttf'), 7)

	const value = useDerivedValue(()=>{
		return state.y.value.value.value + " kg"
	}, [state])

	const textYPosition = useDerivedValue(() => {
		return state.y.value.position.value - 15
	}, [state])

	const textXPosition = useDerivedValue(() => {
		if (!font){
			return 0
		}
		return state.x.position.value - font.measureText(value.value).width / 2
	}, [state, font])

	return (
		<CartesianChart
			domainPadding={{ left: 20, right: 20 }}
			data={transformedData}
			padding={{ top: 10, bottom: 10, left: 10, right: 10 }}
			domain={{ y: [0, domainHeight], }}
			axisOptions={{
				tickCount: 10,
				labelColor: isDarkMode ? 'white' : 'black',
				font: font,
				labelOffset: { x: 5, y: 5 },
				formatYLabel: (value) => `${Intl.NumberFormat('pt-BR').format(value)} kg`,
				formatXLabel: (value) => value ?? ''
			}}
			xKey="label"
			yKeys={['value']}
			chartPressState={state}
		>
			{({ points, chartBounds }) => (
				<>
					{points.value.map((point, index) => (
						<Bar
							key={index}
							barCount={points.value.length}
							points={[point]}
							chartBounds={chartBounds}
							animate={{ type: "timing", duration: 1000 }}
							roundedCorners={{
								topLeft: 5,
								topRight: 5,
							}}
							barWidth={20}
							innerPadding={0.5}
						>
							<LinearGradient start={vec(0, 0)} end={vec(0, 400)} colors={['#5E5757FF', '#008000']} />
						</Bar>
					))}
					{isActive && <Tooltip x={state.x.position} y={state.y.value.position}  />}
					{
						isActive ? <>
							<SKText 
								font={font}
								color={isDarkMode ? 'white' : 'black'}
								x={textXPosition}
								y={textYPosition}
								text={value}
							/>
						</> : null
					}
				</>
			)}
		</CartesianChart>
	)
}
