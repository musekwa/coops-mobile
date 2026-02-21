import { useStatus } from '@powersync/react'
import * as React from 'react'
import { View, Text } from 'react-native'

export const SyncProgressBar: React.FC<{ priority?: number }> = ({ priority }) => {
	const status = useStatus()
	const progressUntilNextSync = status.downloadProgress
	const progress = priority == null ? progressUntilNextSync : progressUntilNextSync?.untilPriority(priority)

	if (progress == null) {
		return null
	}

	return (
		<View>
			(
			<Text>
				Downloaded {progress.downloadedOperations} out of {progress.totalOperations}.
			</Text>
			)
		</View>
	)
}
