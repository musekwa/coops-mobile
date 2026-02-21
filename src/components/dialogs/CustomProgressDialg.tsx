import React, { useEffect } from 'react'
import { ProgressDialog } from 'react-native-simple-dialogs'

type CustomProgressDialgProps = {
    isLoading: boolean
	title?: string
	message?: string
    setIsLoading: (isLoading: boolean) => void
	loading?: boolean
}

export default function CustomProgressDialg({
    isLoading,
	title = 'Carregando...',
	message = 'Por favor, aguarde...',
    setIsLoading,
	loading = false
}: CustomProgressDialgProps)  {
	useEffect(()=>{
		setTimeout(()=>{
			setIsLoading(false)
		}, 3000)

	}, [isLoading ])
	return (
		<ProgressDialog
			contentInsetAdjustmentBehavior={'automatic'}
			onRequestClose={() => {}}
			visible={isLoading || loading}
			message={message}
			activityIndicatorColor={'#008000'}
			title={title}
			titleStyle={{ fontSize: 16, fontWeight: 'bold' }}
			messageStyle={{ fontSize: 14, fontWeight: 'normal' }}
		/>
	)
}
