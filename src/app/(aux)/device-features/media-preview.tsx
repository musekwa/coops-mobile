import { View } from 'react-native'
import React from 'react'
import { useActionStore } from 'src/store/actions/actions'
import CustomImageViewer from 'src/components/data-preview/CustomImageViewer'

export default function MediaPreview() {
	const { base64 } = useActionStore()

	return (
		<View className="flex-1 items-center justify-center bg-black">
			<CustomImageViewer images={[{ uri: base64 }]} visible={!!base64} setVisible={() => {}} />
		</View>
	)
}
