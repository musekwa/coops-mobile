import React from 'react'
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { useColorScheme } from 'nativewind'
import Svg, { Line } from 'react-native-svg'

export type CheckpointWithLocation = {
	id: string
	name: string | null
	province_name: string | null
	district_name: string | null
}

interface CheckpointLinksCompassProps {
	checkpoint: CheckpointWithLocation
	linkedCheckpoints: {
		north?: CheckpointWithLocation
		south?: CheckpointWithLocation
		east?: CheckpointWithLocation
		west?: CheckpointWithLocation
	}
	onEditDirection?: (direction: 'north' | 'south' | 'east' | 'west') => void
	onEditCenter?: () => void
}

const directionConfig = {
	north: { icon: 'arrow-up', label: 'Norte', color: '#3B82F6' },
	south: { icon: 'arrow-down', label: 'Sul', color: '#EF4444' },
	east: { icon: 'arrow-forward', label: 'Este', color: '#10B981' },
	west: { icon: 'arrow-back', label: 'Oeste', color: '#F59E0B' },
}

export default function CheckpointLinksCompass({
	checkpoint,
	linkedCheckpoints,
	onEditDirection,
	onEditCenter,
}: CheckpointLinksCompassProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const { width: screenWidth } = useWindowDimensions()

	// Responsive sizing
	const containerSize = Math.min(screenWidth, 320)
	const centerSize = containerSize * 0.35
	const dirSize = containerSize * 0.28
	const offset = (containerSize - dirSize) / 2
	const margin = containerSize * 0.04

	// Calculate arrow positions
	const centerX = containerSize / 2
	const centerY = containerSize / 2
	const getArrowEndPoint = (direction: 'north' | 'south' | 'east' | 'west') => {
		if (direction === 'north') {
			return { x: centerX, y: margin + dirSize }
		} else if (direction === 'south') {
			return { x: centerX, y: containerSize - margin - dirSize }
		} else if (direction === 'west') {
			return { x: margin + dirSize, y: centerY }
		} else if (direction === 'east') {
			return { x: containerSize - margin - dirSize, y: centerY }
		}
		return { x: centerX, y: centerY }
	}

	// Helper to render a direction
	const renderDirection = (direction: 'north' | 'south' | 'east' | 'west') => {
		const config = directionConfig[direction]
		const linked = linkedCheckpoints[direction]
		// Calculate position
		let style: any = { position: 'absolute' }
		if (direction === 'north') {
			style.top = margin
			style.left = offset
		} else if (direction === 'south') {
			style.bottom = margin
			style.left = offset
		} else if (direction === 'west') {
			style.left = margin
			style.top = offset
		} else if (direction === 'east') {
			style.right = margin
			style.top = offset
		}
		return (
			<TouchableOpacity
				key={direction}
				onPress={() => onEditDirection && onEditDirection(direction)}
				activeOpacity={0.7}
				className={`items-center justify-center rounded-xl shadow-md bg-white dark:bg-gray-800 border-2 ${
					linked ? 'border-green-400' : 'border-gray-200 dark:border-gray-700 opacity-60'
				}`}
				style={{ width: dirSize, height: dirSize, ...style, zIndex: 1 }}
			>
				{/* Direction icon at inner edge */}
				<View
					className="absolute items-center justify-center"
					style={{
						top: direction === 'north' ? 5 : direction === 'south' ? dirSize - 25 : dirSize / 2 - 10,
						left: direction === 'west' ? 5 : direction === 'east' ? dirSize - 25 : dirSize / 2 - 10,
						width: 20,
						height: 20,
						backgroundColor: config.color + '20',
						borderRadius: 10,
					}}
				>
					<Ionicons name={config.icon as any} size={16} color={config.color} />
				</View>
				<Text className="font-semibold text-xs mt-1 text-black dark:text-white text-center">{config.label}</Text>
				{linked ? (
					<Text className="text-green-600 dark:text-green-400 text-xs text-center mt-1 px-1" numberOfLines={2}>
						{linked.name}
					</Text>
				) : (
					<Text className="text-gray-400 text-xs mt-1 text-center">Sem ligação</Text>
				)}
			</TouchableOpacity>
		)
	}

	// Center checkpoint
	return (
		<View
			className="items-center justify-center"
			style={{ height: containerSize, width: containerSize, alignSelf: 'center', position: 'relative' }}
		>
			{/* SVG for arrows */}
			<Svg width={containerSize} height={containerSize} style={{ position: 'absolute', zIndex: 0 }}>
				{Object.entries(linkedCheckpoints).map(([direction, linked]) => {
					if (!linked) return null
					const endPoint = getArrowEndPoint(direction as 'north' | 'south' | 'east' | 'west')
					const config = directionConfig[direction as keyof typeof directionConfig]
					return (
						<Line
							key={direction}
							x1={centerX}
							y1={centerY}
							x2={endPoint.x}
							y2={endPoint.y}
							stroke={config.color}
							strokeWidth={2}
							strokeDasharray="5,5"
						/>
					)
				})}
			</Svg>

			{/* Directions */}
			{renderDirection('north')}
			{renderDirection('south')}
			{renderDirection('east')}
			{renderDirection('west')}
			{/* Center */}
			<TouchableOpacity
				onPress={onEditCenter}
				activeOpacity={0.8}
				className="items-center justify-center shadow-lg border-4 border-white dark:border-gray-900 z-10"
				style={{
					position: 'absolute',
					top: (containerSize - centerSize) / 2,
					left: (containerSize - centerSize) / 2,
					width: centerSize,
					height: centerSize,
					borderRadius: centerSize / 2.5,
					backgroundColor: isDarkMode ? '#2563eb' : '#3b82f6',
					elevation: 6,
				}}
			>
				<Ionicons name="location" size={24} color={colors.white} />
				<Text className="text-white font-bold text-center mt-1 px-2" numberOfLines={2} style={{ fontSize: 12 }}>
					{checkpoint.name}
				</Text>
				<Text className="text-blue-100 text-xs text-center mt-1 px-2" numberOfLines={1} style={{ fontSize: 10 }}>
					{checkpoint.district_name}, {checkpoint.province_name}
				</Text>
			</TouchableOpacity>
		</View>
	)
}
