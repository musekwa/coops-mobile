import { Href, useRouter } from 'expo-router'
import React, { useState, useRef } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import HeroCard from 'src/components/auth/hero-card'
import SubmitButton from 'src/components/buttons/SubmitButton'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'
import { AUTH_CODES } from 'src/data/auth_codes'
import { comparePasswordResetCode, forgotPassword } from 'src/library/supabase/user-auth'
import { useAuthStore } from 'src/store/auth'

export default function PendingPasswordReset() {
	const [code, setCode] = useState(['', '', '', '', '', ''])
	const inputRefs = useRef<any[]>([])
	const [errorMessage, setErrorMessage] = useState('')
	const [showError, setShowError] = useState(false)
	const { currentEmail } = useAuthStore()
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()
	const handleCodeChange = (text: string, index: number) => {
		const newCode = [...code]
		newCode[index] = text
		setCode(newCode)

		// Auto-focus to next input if text is entered
		if (text && index < 5) {
			inputRefs.current[index + 1]?.focus()
		}
	}

	const handleSubmit = async () => {
		try {
			setErrorMessage('')
			setShowError(false)
			setIsLoading(true)
			const fullCode = code.join('')
			if (fullCode.length === 6) {
				const { code, message, success } = await comparePasswordResetCode(currentEmail, fullCode)
				if (code === AUTH_CODES.SUCCESS) {
					router.push('/(auth)/reset-password' as Href)
					setCode(['', '', '', '', '', ''])
				} else {
					setErrorMessage(message)
					setShowError(true)
				}
			}
		} catch (error) {
			console.error('Error verifying password reset code', error)
			setErrorMessage('Erro ao verificar código de redefinição de senha')
			setShowError(true)
		} finally {
			setIsLoading(false)
		}
	}

	const resendCode = async () => {
		const emailToCheck = currentEmail.toLowerCase()

		try {
			const { success: resendSuccess, message: resendMessage, code: resendCode } = await forgotPassword(emailToCheck)
			setErrorMessage(resendMessage)
			setShowError(true)
		} catch (error) {
			console.error('Error resending password reset code', error)
		}
	}

	const isCodeComplete = code.every((digit) => digit !== '')

	return (
		<CustomSafeAreaView>
			<KeyboardAwareScrollView
				automaticallyAdjustContentInsets={true}
				restoreScrollOnKeyboardHide={true}
				keyboardDismissMode="interactive"
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				contentContainerStyle={{
					flexGrow: 1,
					// padding: 15,
					paddingBottom: 40,
				}}
				className="bg-white dark:bg-black"
			>
				<HeroCard />
				<View className="py-4">
					<Text className="text-sm font-bold text-center text-black dark:text-white">Verifique seu email</Text>
					{currentEmail ? (
						<FormItemDescription
							description={`Um código de redefinição de senha de 6 dígitos foi enviado (${currentEmail})`}
							style={{ textAlign: 'center' }}
						/>
					) : (
						<FormItemDescription
							description="Por favor, ainda não foi indicado o endereço de email associado à sua conta."
							style={{ textAlign: 'center' }}
						/>
					)}
				</View>
				<View className="flex-1 justify-center">
					<View style={styles.codeContainer}>
						{code.map((digit, index) => (
							<TextInput
								key={index}
								ref={(ref: any) => {
									inputRefs.current[index] = ref
								}}
								style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
								value={digit}
								onChangeText={(text: string) => handleCodeChange(text, index)}
								keyboardType="numeric"
								maxLength={1}
								selectTextOnFocus
								autoFocus={index === 0}
							/>
						))}
					</View>
					<View className="w-full pb-3">
						<SubmitButton
							onPress={handleSubmit}
							title={isLoading ? 'Verificando...' : 'Verificar Email'}
							isSubmitting={isLoading}
							disabled={isLoading || !isCodeComplete || !currentEmail}
						/>
					</View>

					<View style={styles.resendContainer}>
						<Text className="text-sm text-center text-gray-600 dark:text-white">
							Não recebeu o código?{' '}
							<Text
								disabled={isLoading || !currentEmail}
								className={`text-[#008000] font-bold ${isLoading || !currentEmail ? 'opacity-50' : ''}`}
								onPress={resendCode}
							>
								Reenviar código
							</Text>
						</Text>
					</View>

					<ErrorAlert
						message={errorMessage}
						title="Erro"
						visible={showError}
						setVisible={setShowError}
						setMessage={setErrorMessage}
					/>
				</View>
			</KeyboardAwareScrollView>
		</CustomSafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#1a1a1a',
		marginBottom: 12,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		marginBottom: 40,
		lineHeight: 22,
		paddingHorizontal: 20,
	},
	codeContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		alignItems: 'center',
		marginBottom: 20,
		paddingHorizontal: 0,
	},
	codeInput: {
		width: 45,
		height: 45,
		borderWidth: 2,
		borderColor: '#e1e5e9',
		borderRadius: 12,
		fontSize: 16,
		fontWeight: '500',
		textAlign: 'center',
		backgroundColor: '#ffffff',
		color: '#1a1a1a',
	},
	codeInputFilled: {
		borderColor: '#008000',
		backgroundColor: '#f0f8ff',
	},
	submitButton: {
		width: '100%',
		height: 56,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 24,
	},
	submitButtonActive: {
		backgroundColor: '#008000',
	},
	submitButtonInactive: {
		backgroundColor: '#e1e5e9',
	},
	submitButtonTextLoading: {
		color: '#000000',
	},
	submitButtonText: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '600',
	},
	resendContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	resendText: {
		fontSize: 16,
		color: '#666',
	},
	resendLink: {
		fontSize: 16,
		color: '#008000',
		fontWeight: '600',
	},
})
