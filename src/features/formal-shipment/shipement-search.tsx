// React and React Native
import { View } from 'react-native'
import { useState } from 'react'

// Third Party Libraries
import Animated, { SlideInLeft, SlideOutRight } from 'react-native-reanimated'
import { z } from 'zod'

// Components
import SearchByLicenseId from './components/search-by-license-id'
import CustomProgressDialg from 'src/components/dialogs/CustomProgressDialg'

// Constants and Utils
import ShipmentStepFormDescription from 'src/components/tracking/ShipmentStepFormDescription'

const LicenseIdSchema = z.object({
	licenseId: z.string().regex(/^[0-9]{6}\/[0-9]{4}$/, { message: 'Número de Guia de Trânsito inválido' }),
})

type LicenseIdFormData = z.infer<typeof LicenseIdSchema>

export default function ShipmentSearch() {
	const [isLoading, setIsLoading] = useState(false)

	return (
		<View className="flex-1">
			<Animated.ScrollView
				entering={SlideInLeft.duration(500)}
				exiting={SlideOutRight.duration(500)}
				contentContainerStyle={{
					flexGrow: 1,
					paddingVertical: 30,
					justifyContent: 'center',
				}}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<View className="">
					<ShipmentStepFormDescription description="Indica o número da Guia de Trânsito para buscar a informação sobre a mercadoria." />
				</View>
				<View className="flex-1 justify-center">
					<SearchByLicenseId isLoading={isLoading} setIsLoading={setIsLoading} />
				</View>
			</Animated.ScrollView>
			<CustomProgressDialg isLoading={isLoading} setIsLoading={setIsLoading} />
		</View>
	)
}
