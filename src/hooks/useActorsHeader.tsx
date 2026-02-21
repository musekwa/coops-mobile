import { useCallback, useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { useNavigation } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import BackButton from 'src/components/buttons/BackButton'
import { colors } from 'src/constants'

type UseActorsHeaderOptions = {
	locationName: string
	subtitle: string
	onResetResource?: () => void
	showOptionsButton?: boolean
}

export function useActorsHeader({
	locationName,
	subtitle,
	onResetResource,
	showOptionsButton = true,
}: UseActorsHeaderOptions) {
	const navigation = useNavigation()
	const [isSearchOptionsVisible, setIsSearchOptionsVisible] = useState(false)
	const bottomSheetModalRef = useRef<BottomSheetModal>(null)

	const handleModalPress = useCallback(() => {
		if (!isSearchOptionsVisible) {
			bottomSheetModalRef.current?.present()
			setIsSearchOptionsVisible(true)
		} else {
			bottomSheetModalRef.current?.dismiss()
			setIsSearchOptionsVisible(false)
		}
	}, [isSearchOptionsVisible])

	useEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View className="items-center">
					<Text className="text-black dark:text-white text-[14px] font-bold">{locationName}</Text>
					<Text className="text-gray-600 dark:text-gray-400 font-mono text-[12px]">{subtitle}</Text>
				</View>
			),
			headerLeft: () => <BackButton route="/(tabs)/actors" />,
			...(showOptionsButton && {
				headerRight: () => (
					<View className="mx-2">
						<Ionicons
							onPress={handleModalPress}
							name={isSearchOptionsVisible ? 'options' : 'options-outline'}
							size={24}
							color={isSearchOptionsVisible ? colors.primary : colors.gray600}
						/>
					</View>
				),
			}),
		})
		onResetResource?.()
	}, [isSearchOptionsVisible, locationName, subtitle, navigation, handleModalPress, showOptionsButton, onResetResource])

	return { isSearchOptionsVisible, bottomSheetModalRef, handleModalPress }
}
