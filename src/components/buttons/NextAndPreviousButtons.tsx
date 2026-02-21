import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity, View, Text } from 'react-native'
import { useKeyboardVisibility } from 'src/hooks/useKeyboadVisibility'

interface NextAndPreviousButtonsProps {
	// currentStep: number
	handlePreviousStep: () => void
	handleNextStep: () => void
	previousButtonDisabled: boolean
	nextButtonDisabled: boolean
	showPreviousButton?: boolean
	showNextButton?: boolean
	nextButtonText?: string
	previousButtonText?: string
}

export default function NextAndPreviousButtons({
	// currentStep,
	handlePreviousStep,
	handleNextStep,
	previousButtonDisabled,
	nextButtonDisabled,
	showPreviousButton = true,
	showNextButton = true,
	nextButtonText = 'Avançar',
	previousButtonText = 'Voltar',
}: NextAndPreviousButtonsProps) {	
	const isKeyboardVisible = useKeyboardVisibility()
	if (isKeyboardVisible) return null
	return (
		<View className="flex flex-row justify-between pb-6 w-full">
			{showPreviousButton && (
				<TouchableOpacity
					activeOpacity={0.5}
					onPress={handlePreviousStep}
					disabled={previousButtonDisabled}
					className={`${previousButtonDisabled ? 'bg-gray-300' : 'bg-[#008000]'} py-2 rounded-md w-[100px] h-[40px] flex flex-row items-center justify-center space-x-1 absolute bottom-4 left-0`}
				>
					<Ionicons name="arrow-back" size={18} color="white" />
					<Text className="text-white text-center text-[14px]">{previousButtonText}</Text>
				</TouchableOpacity>
			)}
		

			{showNextButton && (
				<TouchableOpacity
					activeOpacity={0.5}
					onPress={handleNextStep}
					disabled={nextButtonDisabled}
					className={`${nextButtonDisabled ? 'bg-gray-300' : 'bg-[#008000]'} py-2 rounded-md w-[100px] h-[40px] flex flex-row items-center justify-center space-x-1 absolute bottom-4 right-0`}
				>
					<Text className="text-white text-center text-[14px]">{nextButtonText}</Text>
					<Ionicons name="arrow-forward" size={18} color="white" />
				</TouchableOpacity>
			)}
		</View>
	)
}
