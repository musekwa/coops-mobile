import { View, Text } from 'react-native'
import React from 'react'
import { ConfirmDialog } from 'react-native-simple-dialogs'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'

type CustomConfirmDialgProps = {
	visible: boolean
	setVisible: (visible: boolean) => void
	yesCallback: () => void
	noCallback: () => void
	yesText: string
	noText: string
	message: string
	title: string
}

export default function CustomConfirmDialg({
	visible,
	setVisible,
	yesCallback,
	noCallback,
	yesText,
	message,
	noText,
	title,
}: CustomConfirmDialgProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	return (
		<ConfirmDialog
			contentInsetAdjustmentBehavior={true}
			title={title}
			message={message}
			visible={visible}
			titleStyle={{ fontSize: 15, fontWeight: 'bold', color: isDarkMode ? colors.white : colors.black }}
			dialogStyle={{ borderRadius: 10, backgroundColor: isDarkMode ? colors.gray800 : 'white',  alignSelf: 'center' }}
			buttonsStyle={{ backgroundColor: isDarkMode ? colors.gray800 : 'white', color: isDarkMode ? colors.white : colors.black, padding: 0, margin: 0, height: 50, borderRadius: 10, alignSelf: 'center' }}
			contentStyle={{ color: isDarkMode ? colors.white : colors.black }}
			messageStyle={{ color: isDarkMode ? colors.white : colors.black, fontSize: 15, fontWeight: 'normal' }}
			
			onRequestClose={() => setVisible(false)}
			onTouchOutside={() => setVisible(false)}
			positiveButton={{
				title: yesText,
				onPress: () => yesCallback && yesCallback(),
				style: { color: isDarkMode ? colors.white : colors.black },
			}}
			negativeButton={{
				title: noText,
				onPress: () => noCallback && noCallback(),
				style: { color: isDarkMode ? colors.white : colors.black },
			}}
		/>
	)
}
