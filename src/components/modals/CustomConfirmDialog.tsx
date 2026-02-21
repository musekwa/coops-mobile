import { Dialog } from 'react-native-simple-dialogs'
import { View, Text } from 'react-native'
import React from 'react'

type CustomConfirmDialogProps = {
	showConfirmDialog: boolean
	setShowConfirmDialog: (show: boolean) => void
	title: string
	content?: string | React.ReactNode
}

export default function CustomConfirmDialog({
	showConfirmDialog,
	setShowConfirmDialog,
	title,
	content,
}: CustomConfirmDialogProps) {
	return (
		<Dialog
			statusBarTranslucent={true}
			animationType={'fade'}
			visible={showConfirmDialog}
			title={title}
			onTouchOutside={() => setShowConfirmDialog(false)}
			onRequestClose={() => setShowConfirmDialog(false)}
			contentInsetAdjustmentBehavior={'automatic'}
			dialogStyle={{ borderRadius: 10 }}
		>
			{typeof content === 'string' ? (
				<View>
					<Text>{content}</Text>
				</View>
			) : (
				content
			)}
		</Dialog>
	)
}
