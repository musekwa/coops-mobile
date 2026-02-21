import React, { createContext, useContext, ReactNode } from 'react'
import CustomToast, { ToastType } from './CustomToast'
import { useCustomToast } from './useCustomToast'

interface ToastContextType {
	showToast: (message: string, type?: ToastType, duration?: number) => void
	showSuccess: (message: string, duration?: number) => void
	showError: (message: string, duration?: number) => void
	showInfo: (message: string, duration?: number) => void
	showWarning: (message: string, duration?: number) => void
	hideToast: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = (): ToastContextType => {
	const context = useContext(ToastContext)
	if (!context) {
		throw new Error('useToast must be used within a ToastProvider')
	}
	return context
}

interface ToastProviderProps {
	children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
	const toast = useCustomToast()

	return (
		<ToastContext.Provider value={toast}>
			{children}
			<CustomToast
				visible={toast.toastState.visible}
				message={toast.toastState.message}
				type={toast.toastState.type}
				duration={toast.toastState.duration}
				onHide={toast.hideToast}
			/>
		</ToastContext.Provider>
	)
}
