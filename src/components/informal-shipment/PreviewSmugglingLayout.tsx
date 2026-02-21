import { useWindowDimensions } from 'react-native'
import { useColorScheme } from 'nativewind'
import { View } from 'react-native'
import PreviewSmugglingFlow from './PreviewSmugglingFlow'
import SaveSmugglingInfo from './SaveSmugglingInfo'
import PreviewSmugglerDetails from './PreviewSmugglerDetails'

export default function PreviewSmugglingLayout({ index }: { index: number }) {
	const { width: screenWidth, height: screenHeight } = useWindowDimensions()
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	// Determine which screen to show based on index
	const isSmugglerDetails = index === 0
	const isSmugglingFlow = index === 1
	const isSaveInfo = index === 2

	return (
		<View
			style={{
				width: screenWidth,
				minHeight: screenHeight,
				backgroundColor: isDarkMode ? 'black' : 'white',
			}}
		>
			{/* Show only one screen at a time */}
			{isSmugglerDetails && <PreviewSmugglerDetails />}
			{isSmugglingFlow && <PreviewSmugglingFlow />}
			{isSaveInfo && <SaveSmugglingInfo />}
		</View>
	)
}
