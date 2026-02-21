import { Href, useRouter } from 'expo-router'
import React, { useState, useRef } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import SubmitButton from 'src/components/buttons/SubmitButton'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import { AUTH_CODES } from 'src/data/auth_codes'
import { resendEmailVerification, verifyEmail } from 'src/library/supabase/user-auth'
import { useAuthStore } from 'src/store/auth'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import HeroCard from 'src/components/auth/hero-card'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'
import FormItemDescription from 'src/components/forms/FormItemDescription'

export default function PendingEmailVerification() {
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
			const token = code.join('')
			if (token.length === 6) {
				const { success, message, code } = await verifyEmail(currentEmail, token)
				if (code === AUTH_CODES.SUCCESS) {
					router.push('/(auth)/pending-user-authorization' as Href)
					// router.push('/(tabs)' as Href<'/(tabs)'>)
				} else {
					setErrorMessage(message)
					setShowError(true)
				}
			}
		} catch (error) {
			console.error('Error verifying email', error)
			setErrorMessage('Erro ao verificar email')
			setShowError(true)
		} finally {
			setIsLoading(false)
		}
	}

	const resendCode = async () => {
		const emailToCheck = currentEmail.toLowerCase()
		try {
			const {
				success: resendSuccess,
				message: resendMessage,
				code: resendCode,
			} = await resendEmailVerification(emailToCheck)
			setErrorMessage(resendMessage)
			setShowError(true)
		} catch (error) {
			console.error('Error resending email verification', error)
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
					padding: 16,
					paddingBottom: 40,
				}}
			>
				<View className="flex-1/3 justify-center items-center space-y-3">
					<HeroCard />

					<Text className="text-sm font-bold text-center text-black dark:text-white">Verifique seu email</Text>
					<FormItemDescription
						description={`Um código de verificação de 6 dígitos foi enviado para ${currentEmail}`}
						style={{ textAlign: 'center' }}
					/>
				</View>
				<View className="flex-1 justify-center items-center space-y-3">
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
					<View className="w-full">
						<SubmitButton
							onPress={handleSubmit}
							disabled={isLoading || !isCodeComplete || !currentEmail}
							title={isLoading ? `Verificando...` : `Verificar Email`}
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
		backgroundColor: '#f8f9fa',
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
		marginVertical: 20,
		paddingHorizontal: 0,
	},
	codeInput: {
		width: 40,
		height: 50,
		borderWidth: 1,
		borderColor: '#e1e5e9',
		borderRadius: 12,
		fontSize: 18,
		fontWeight: '600',
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
