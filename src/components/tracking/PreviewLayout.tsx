import { useWindowDimensions, View } from 'react-native'
import PreviewLicenseInfo from './PreviewLicenseInfo'
import PreviewShipmentLoadInfo from './PreviewShipmentLoadInfo'
import SaveShipmentInfo from './SaveShipmentInfo'
import { useColorScheme } from 'nativewind'

export default function PreviewLayout({ index }: { index: number }) {
	const { width: screenWidth, height: screenHeight } = useWindowDimensions()
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	const hasLicenseInfo = index === 0
	// const isOwnerAndReceiverInfo = index === 1
	const isShipmentLoadInfo = index === 1
	const isSaveShipmentInfo = index === 2

	return (
		<View
			style={{
				width: screenWidth,
				minHeight: screenHeight,
				backgroundColor: isDarkMode ? 'black' : 'white',
			}}
		>
			{/* license info */}
			{hasLicenseInfo && <PreviewLicenseInfo />}

			{/* shipment load info */}
			{isShipmentLoadInfo && <PreviewShipmentLoadInfo />}

			{/* save info */}
			{isSaveShipmentInfo && <SaveShipmentInfo />}
		</View>
	)
}
