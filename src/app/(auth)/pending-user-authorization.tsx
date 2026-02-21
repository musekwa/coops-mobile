import React, { useState, useCallback, useMemo, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native'
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useUserDetails } from 'src/hooks/queries'
import { AUTH_CODES } from 'src/data/auth_codes'
import { Href, Redirect } from 'expo-router'

import Spinner from 'src/components/loaders/Spinner'
import { useAuthStore } from 'src/store/auth/auth'
import { getUserDetails, updateUserMetdata } from 'src/library/supabase/user-auth'
import { useToast } from 'src/components/ToastMessage'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import SubmitButton from 'src/components/buttons/SubmitButton'
import CancelButton from 'src/components/buttons/CancelButton'
import HeroCard from 'src/components/auth/hero-card'
import FormItemDescription from 'src/components/forms/FormItemDescription'

export default function PendingUserAuthorization() {
	const [showContactSheet, setShowContactSheet] = useState(false)
	const [shouldRedirect, setShouldRedirect] = useState<Href | null>(null)
	const bottomSheetRef = useRef<BottomSheet>(null)
	const { userDetails, isLoading } = useUserDetails()
	const [statusMessage, setStatusMessage] = useState<string | null>(null)
	const [showStatusSheet, setShowStatusSheet] = useState(false)
	const [statusTitle, setStatusTitle] = useState<string>('')
	const { signOut, isSigningOut } = useAuthStore()
	const { showError, showSuccess } = useToast()
	const [showErrorAlert, setShowErrorAlert] = useState(false)
	const [errorAlertMessage, setErrorAlertMessage] = useState('')
	const [errorAlertTitle, setErrorAlertTitle] = useState('')
	const [isCheckingStatus, setIsCheckingStatus] = useState(false)
	// Bottom sheet snap points
	const snapPoints = useMemo(() => ['50%'], [])

	const handleContactSupport = useCallback(() => {
		setShowContactSheet(true)
		setShowStatusSheet(false) // Hide status sheet when showing contact support
		bottomSheetRef.current?.expand()
	}, [])

	const handleCloseSheet = useCallback(() => {
		bottomSheetRef.current?.close()
		setShowContactSheet(false)
		setShowStatusSheet(false)
	}, [])

	const handleShowStatusSheet = useCallback((title: string, message: string) => {
		setStatusTitle(title)
		setStatusMessage(message)
		setShowStatusSheet(true)
		bottomSheetRef.current?.expand()
	}, [])

	const handleCheckStatus = async () => {
		setIsCheckingStatus(true)
		if (!userDetails?.id) {
			showError('Não foi possível obter informações do usuário.')
			return
		}
		const { data, success, message } = await getUserDetails(userDetails?.id)
		if (!success || !data) {
			showError('Não foi possível obter informações do usuário.')
			return
		}

		const status = data?.status

		if (!success || !data || !status) {
			showError('Não foi possível obter informações do usuário.')
			return
		}
		await updateUserMetdata({ status })

		switch (status) {
			case AUTH_CODES.USER_DETAILS_STATUS.AUTHORIZED:
				// User is authorized, redirect to main app
				handleCloseSheet()
				showSuccess('A sua conta foi autorizada com sucesso.')
				setTimeout(() => {
					setShouldRedirect('/(tabs)')
				}, 1000)
				break

			case AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED:
				// Still unauthorized, show message
				handleShowStatusSheet(
					'Aguardando Autorização',
					'Sua conta ainda não foi autorizada. Nossa equipe está a analisar a sua solicitação. Você receberá uma notificação assim que for aprovada.',
				)
				break

			case AUTH_CODES.USER_DETAILS_STATUS.BLOCKED:
				// Account blocked
				handleShowStatusSheet(
					'Conta Bloqueada',
					'Sua conta foi bloqueada. Entre em contacto com a equipe de suporte para mais informações.',
				)
				break
			case AUTH_CODES.USER_DETAILS_STATUS.BANNED:
				// Account banned
				handleShowStatusSheet(
					'Conta Banida',
					'Sua conta foi banida. Entre em contacto com a equipe de suporte para mais informações.',
				)
				break

			case AUTH_CODES.USER_DETAILS_STATUS.EMAIL_PENDING_VERIFICATION:
				// Email not verified, redirect to verification page
				setShouldRedirect('/(auth)/pending-email-verification')
				break

			default:
				// Unknown status
				// setShouldRedirect('/(auth)/login')
				handleShowStatusSheet(
					'Status Desconhecido',
					'Status da conta não reconhecido. Entre em contacto com a equipe de suporte para mais informações.',
				)
				break
		}
		setIsCheckingStatus(false)
	}

	const handleWhatsApp = async () => {
		const phoneNumber = '+258840445375'
		const message = `
					Prezados senhores,
					
					Criei uma conta no aplicativo MyCoop, mas ainda não foi autorizada.

					Detalhes da conta:
					Nome: ${userDetails?.full_name}
					Email: ${userDetails?.email}
					Telefone: ${userDetails?.phone}
					
					Preciso de ajuda com a autorização da minha conta MyCoop. Se possível, me avise quando a conta for autorizada.

					Obrigado!`
		const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`

		try {
			const supported = await Linking.canOpenURL(whatsappUrl)
			if (supported) {
				await Linking.openURL(whatsappUrl)
			} else {
				setShowErrorAlert(true)
				setErrorAlertMessage('WhatsApp não está instalado no seu dispositivo.')
				setErrorAlertTitle('Erro')
			}
		} catch (error) {
			setShowErrorAlert(true)
			setErrorAlertMessage('Não foi possível abrir o WhatsApp.')
			setErrorAlertTitle('Erro')
		}
		handleCloseSheet()
	}

	const handleCall = async () => {
		const phoneNumber = '+258840445375'
		try {
			await Linking.openURL(`tel:${phoneNumber}`)
		} catch (error) {
			setShowErrorAlert(true)
			setErrorAlertMessage('Não foi possível fazer a chamada.')
			setErrorAlertTitle('Erro')
		}
		handleCloseSheet()
	}

	const handleEmail = async () => {
		const email = 'mycoop@ampcm.org'
		const subject = 'Pedido de Autorização - Conta MyCoop'
		const body = `
					Prezados senhores,

					Criei uma conta no aplicativo MyCoop, mas ainda não foi autorizada.

					Detalhes da conta:
					Nome: ${userDetails?.full_name}
					Email: ${userDetails?.email}
					Telefone: ${userDetails?.phone}
					
					Preciso de ajuda com a autorização da minha conta MyCoop. Se possível, me avise quando a conta for autorizada.

					Obrigado!`

		try {
			await Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
		} catch (error) {
			setShowErrorAlert(true)
			setErrorAlertMessage('Não foi possível abrir o aplicativo de email.')
			setErrorAlertTitle('Erro')
		}
		handleCloseSheet()
	}

	const renderBackdrop = useCallback(
		(props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
		[],
	)

	// Handle redirects
	if (shouldRedirect) {
		return <Redirect href={shouldRedirect} />
	}

	// Show loading while checking user details
	if (isLoading) {
		return <Spinner />
	}

	const handleSignOut = async () => {
		await signOut()
		// The auth store will handle the sign-out process
		// and the root layout will redirect to login
	}

	return (
		<View style={styles.container}>
			<View style={{ flex: 1 }}>
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
					{/* Header Section */}
					<View className="flex-1/3 justify-center items-center space-y-3">
						<HeroCard title="MyCoop" description="Aguarde Autorização. A autorização da sua conta está a ser processada. Você receberá um email assim que for aprovada." />
					</View>

					<View className="flex-1 justify-center space-y-3">
						<View style={styles.actionSection} className="space-y-3">
							<View className="w-full">
								<SubmitButton
									onPress={handleCheckStatus}
									title={isCheckingStatus ? 'Verificando...' : 'Verificar Status'}
									isSubmitting={isCheckingStatus}
									disabled={isCheckingStatus}
								/>
							</View>
							<View className="w-full">
								<CancelButton
									onCancel={handleContactSupport}
									disabled={isCheckingStatus}
									cancelText="Contactar Suporte"
								/>
							</View>
							<TouchableOpacity
								style={[
									styles.cancelButton,
									{
										backgroundColor: !isSigningOut ? '#fecaca' : '#E9E1E1FF',
										borderColor: !isSigningOut ? '#fecaca' : '#E9E1E1FF',
									},
								]}
								onPress={handleSignOut}
								disabled={isSigningOut}
								activeOpacity={0.5}
							>
								<Text style={styles.cancelButtonText} className={`${isSigningOut ? 'text-red-800' : 'text-red-800'}`}>
									{isSigningOut ? 'A sair...' : 'Sair'}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</View>

			{/* Bottom Sheet */}
			<BottomSheet
				ref={bottomSheetRef}
				index={-1}
				snapPoints={snapPoints}
				enablePanDownToClose={true}
				backdropComponent={renderBackdrop}
				onClose={() => {
					setShowContactSheet(false)
					setShowStatusSheet(false)
				}}
			>
				<BottomSheetView>
					<View className="px-3 pb-6 pt-3">
						{showContactSheet && (
							<>
								<Text style={styles.bottomSheetTitle}>Como deseja contactar o suporte?</Text>

								<TouchableOpacity style={styles.contactOption} onPress={handleWhatsApp}>
									<Ionicons name="logo-whatsapp" size={24} color="black" />
									<Text style={styles.contactText}>WhatsApp</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.contactOption} onPress={handleCall}>
									<Ionicons name="call-outline" size={24} color="black" />
									<Text style={styles.contactText}>Ligar</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.contactOption} onPress={handleEmail}>
									<Ionicons name="mail-outline" size={24} color="black" />
									<Text style={styles.contactText}>Email</Text>
								</TouchableOpacity>
							</>
						)}

						{showStatusSheet && (
							<>
								<Text style={styles.bottomSheetTitle}>{statusTitle}</Text>
								<Text style={styles.statusMessage}>{statusMessage}</Text>
								<TouchableOpacity style={styles.contactOption} onPress={handleContactSupport}>
									<Ionicons name="help-circle-outline" size={24} color="black" />
									<Text style={styles.contactText}>Contactar Suporte</Text>
								</TouchableOpacity>
							</>
						)}
					</View>
				</BottomSheetView>
			</BottomSheet>
			<ErrorAlert
				visible={showErrorAlert}
				setVisible={setShowErrorAlert}
				message={errorAlertMessage}
				setMessage={setErrorAlertMessage}
				title={errorAlertTitle}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	scrollContainer: {
		flexGrow: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 80,
	},
	headerSection: {
		alignItems: 'center',
		marginBottom: 20,
		paddingTop: 10,
	},
	statusIcon: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#fff3cd',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10,
		borderWidth: 2,
		borderColor: '#ffc107',
	},
	statusIconText: {
		fontSize: 40,
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#1a1a1a',
		marginBottom: 12,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		lineHeight: 22,
		paddingHorizontal: 10,
	},
	statusCard: {
		backgroundColor: '#ffffff',
		borderRadius: 16,
		padding: 20,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	statusTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: '#1a1a1a',
		marginBottom: 3,
	},
	statusRow: {
		marginBottom: 3,
	},
	statusItem: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 6,
		marginRight: 6,
	},
	statusCompleted: {
		backgroundColor: '#28a745',
	},
	statusPending: {
		backgroundColor: '#ffc107',
	},
	statusWaiting: {
		backgroundColor: '#e9ecef',
	},
	statusText: {
		fontSize: 12,
		color: '#495057',
	},
	infoSection: {
		marginBottom: 30,
	},
	infoCard: {
		backgroundColor: '#ffffff',
		borderRadius: 12,
		padding: 8,
		marginBottom: 8,
		borderLeftWidth: 4,
		borderLeftColor: '#008000',
	},
	infoCardTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: '#1a1a1a',
		marginBottom: 8,
	},
	infoCardText: {
		fontSize: 12,
		color: '#666',
		lineHeight: 14,
	},
	actionSection: {
		marginBottom: 30,
	},
	primaryButton: {
		backgroundColor: '#008000',
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 24,
		alignItems: 'center',
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	primaryButtonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '600',
	},
	secondaryButton: {
		backgroundColor: 'transparent',
		borderWidth: 2,
		borderColor: '#008000',
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 24,
		alignItems: 'center',
	},
	secondaryButtonText: {
		color: '#008000',
		fontSize: 16,
		fontWeight: '600',
	},
	footer: {
		alignItems: 'center',
		paddingVertical: 0,
	},
	footerText: {
		fontSize: 12,
		color: '#999',
		textAlign: 'center',
		lineHeight: 14,
		fontStyle: 'italic',
	},
	bottomSheetContent: {
		flex: 1,
		padding: 24,
	},
	bottomSheetTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#1a1a1a',
		textAlign: 'center',
		marginBottom: 24,
	},
	statusMessage: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 24,
		paddingHorizontal: 10,
	},
	contactOption: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 16,
		paddingHorizontal: 20,
		borderRadius: 12,
		backgroundColor: '#f8f9fa',
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#e9ecef',
		gap: 5,
	},
	contactIcon: {
		fontSize: 24,
		marginRight: 16,
	},
	contactText: {
		fontSize: 16,
		// fontWeight: '500',
		color: '#1a1a1a',
	},
	cancelButton: {
		marginTop: 16,
		borderWidth: 1,
		borderColor: '#008000',
		paddingVertical: 16,
		paddingHorizontal: 24,
		borderRadius: 12,
		// backgroundColor: '#6c757d',
		alignItems: 'center',
	},
	cancelButtonText: {
		fontSize: 16,
		fontWeight: '600',
	},
})
