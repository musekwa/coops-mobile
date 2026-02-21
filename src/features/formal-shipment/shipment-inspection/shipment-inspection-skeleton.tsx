import React from 'react'
import { View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import CustomShimmerPlaceholder from 'src/components/placeholder/CustomShimmerPlaceholder'

export default function ShipmentInspectionSkeleton() {
	return (
		<View className="flex-1 bg-white dark:bg-black h-full">
			<Animated.ScrollView
				entering={FadeIn.duration(500)}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingTop: 30,
					paddingBottom: 80,
					marginBottom: 80,
					paddingHorizontal: 9,
					minHeight: '100%',
				}}
			>
				<View className="flex-1 bg-white dark:bg-black">
					{/* Main Card Skeleton */}
					<View className="relative p-2 w-[100%] border border-slate-200 shadow-sm rounded-md dark:border-slate-700">
						{/* Stage Status & Truck Icon Skeleton */}
						<View className="flex flex-row items-center justify-between mb-4">
							<CustomShimmerPlaceholder
								style={{
									width: 100,
									height: 24,
									borderRadius: 12,
								}}
							/>
							<View className="w-[60px] h-[60px] rounded-full overflow-hidden">
								<CustomShimmerPlaceholder
									style={{
										width: 60,
										height: 60,
										borderRadius: 30,
									}}
								/>
							</View>
						</View>

						{/* Car & Driver Info Skeleton */}
						<View className="flex flex-row justify-between my-2 space-x-4">
							<View className="flex-1 items-start space-y-2">
								<CustomShimmerPlaceholder
									style={{
										width: 140,
										height: 12,
										borderRadius: 4,
									}}
								/>
								<CustomShimmerPlaceholder
									style={{
										width: 120,
										height: 12,
										borderRadius: 4,
									}}
								/>
								<CustomShimmerPlaceholder
									style={{
										width: 100,
										height: 12,
										borderRadius: 4,
									}}
								/>
							</View>
							<View className="flex items-center justify-center space-y-2">
								<CustomShimmerPlaceholder
									style={{
										width: 80,
										height: 12,
										borderRadius: 4,
									}}
								/>
								<CustomShimmerPlaceholder
									style={{
										width: 60,
										height: 12,
										borderRadius: 4,
									}}
								/>
								<CustomShimmerPlaceholder
									style={{
										width: 70,
										height: 16,
										borderRadius: 4,
									}}
								/>
							</View>
						</View>

						{/* Status Line Skeleton */}
						<View className="flex flex-row items-center justify-between my-3 space-x-2">
							{[1, 2, 3, 4].map((_, index) => (
								<CustomShimmerPlaceholder
									key={index}
									style={{
										flex: 1,
										height: 3,
										borderRadius: 2,
									}}
								/>
							))}
						</View>

						{/* Estimated Time Skeleton */}
						<View className="mt-2 flex flex-row justify-between space-x-4">
							<View className="flex-1 items-start space-y-1">
								<CustomShimmerPlaceholder
									style={{
										width: 90,
										height: 10,
										borderRadius: 4,
									}}
								/>
								<CustomShimmerPlaceholder
									style={{
										width: 50,
										height: 14,
										borderRadius: 4,
									}}
								/>
							</View>
						</View>
					</View>

					{/* Status Line Section Skeleton */}
					<View className="mt-4 relative p-2 w-[100%] border border-slate-300 shadow-sm shadow-black bg-gray-50 dark:bg-gray-900 rounded-md">
						<View className="mt-4 space-y-3">
							{/* Checkpoint Items Skeleton */}
							{[1, 2, 3, 4].map((_, index) => (
								<View key={index} className="flex flex-row items-center space-x-3">
									{/* Checkpoint Icon */}
									<CustomShimmerPlaceholder
										style={{
											width: 40,
											height: 40,
											borderRadius: 20,
										}}
									/>
									{/* Checkpoint Info */}
									<View className="flex-1 space-y-2">
										<CustomShimmerPlaceholder
											style={{
												width: '80%',
												height: 14,
												borderRadius: 4,
											}}
										/>
										<CustomShimmerPlaceholder
											style={{
												width: '60%',
												height: 12,
												borderRadius: 4,
											}}
										/>
									</View>
									{/* Status Indicator */}
									<CustomShimmerPlaceholder
										style={{
											width: 24,
											height: 24,
											borderRadius: 12,
										}}
									/>
								</View>
							))}
						</View>
					</View>
				</View>
			</Animated.ScrollView>
		</View>
	)
}
