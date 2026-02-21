import { useState, useCallback } from 'react'
import { ToastType } from './CustomToast'

interface ToastState {
	visible: boolean
	message: string
	type: ToastType
	duration?: number
}

export const useCustomToast = () => {
	const [toastState, setToastState] = useState<ToastState>({
		visible: false,
		message: '',
		type: 'info',
		duration: 3000,
	})

	const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
		setToastState({
			visible: true,
			message,
			type,
			duration,
		})
	}, [])

	const hideToast = useCallback(() => {
		setToastState((prev) => ({
			...prev,
			visible: false,
		}))
	}, [])

	const showSuccess = useCallback(
		(message: string, duration?: number) => {
			showToast(message, 'success', duration)
		},
		[showToast],
	)

	const showError = useCallback(
		(message: string, duration?: number) => {
			showToast(message, 'error', duration)
		},
		[showToast],
	)

	const showInfo = useCallback(
		(message: string, duration?: number) => {
			showToast(message, 'info', duration)
		},
		[showToast],
	)

	const showWarning = useCallback(
		(message: string, duration?: number) => {
			showToast(message, 'warning', duration)
		},
		[showToast],
	)

	return {
		toastState,
		showToast,
		hideToast,
		showSuccess,
		showError,
		showInfo,
		showWarning,
	}
}
