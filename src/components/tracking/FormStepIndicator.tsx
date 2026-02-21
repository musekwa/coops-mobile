import { View } from 'react-native'

interface FormStepIndicatorProps {
	barWidth: number
	totalSteps: number
	currentStep: number
}

export default function FormStepIndicator({ barWidth, totalSteps, currentStep }: FormStepIndicatorProps) {
	if (!(currentStep < totalSteps - 1)) {
		return null
	}

	return (
		<View className="flex flex-col px-3">
			<View className="flex flex-col items-center">
				<View className="flex flex-row justify-between">
					{/* Step Indicator */}
					<View className="flex flex-row">
						{[...Array(totalSteps)].map((_, index) => (
							<View
								key={index}
								style={{
									width: barWidth,
									marginHorizontal: 1,
								}}
								className={`h-2 ${index <= currentStep ? 'bg-[#008000]' : 'bg-gray-400'}`}
							/>
						))}
					</View>
				</View>
			</View>
		</View>
	)
}
