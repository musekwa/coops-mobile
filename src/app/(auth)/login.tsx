import { View } from 'react-native'
import LogInForm from 'src/components/auth/login-form'
import { useState, useEffect } from 'react'
import { userSignIn } from 'src/library/supabase/user-auth'
import { Href, Redirect, useRouter } from 'expo-router'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import { useUserSession } from 'src/hooks/queries'
import { AUTH_CODES } from 'src/data/auth_codes'
import { useAuthStore } from 'src/store/auth'
import Spinner from 'src/components/loaders/Spinner'
import HeroCard from 'src/components/auth/hero-card'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'

export default function Login() {
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const router = useRouter()
	const [isPopulating, setIsPopulating] = useState(false)
	const { setCurrentEmail } = useAuthStore()
	const { session, isLoading, isError } = useUserSession()

	useEffect(() => {
		const populateData = async () => {
			setIsPopulating(true)
			// await populateCountries()
			// await populateProvinces()
			// await populateDistricts()
			// await populateAdminPosts()
			// await populateVillages()
			// setIsPopulating(false)
			// const provinces = await selectProvinces()
			// console.log('Provinces', provinces)
			setIsPopulating(false)
		}
		populateData()
	}, [])

	const performLogin = async ({ email, password }: { email: string; password: string }) => {
		setCurrentEmail(email)
		try {
			const { success, message, session, code } = await userSignIn(email, password)

			if (code === AUTH_CODES.EMAIL_NOT_CONFIRMED) {
				router.push('/(auth)/pending-email-verification')
				return
			}

			if (code === AUTH_CODES.INVALID_CREDENTIALS) {
				setHasError(true)
				setErrorMessage(message)
				return
			}

			if (code === AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED) {
				router.push('/(auth)/pending-user-authorization' as Href)
				return
			}

			if (code === AUTH_CODES.USER_DETAILS_STATUS.BLOCKED) {
				setHasError(true)
				setErrorMessage(message)
				return
			}

			if (code === AUTH_CODES.USER_DETAILS_STATUS.BANNED) {
				setHasError(true)
				setErrorMessage(message)
				return
			}
			if (code === AUTH_CODES.USER_DETAILS_STATUS.EMAIL_PENDING_VERIFICATION) {
				router.push('/(auth)/pending-email-verification' as Href)
				return
			}
			if (code === AUTH_CODES.USER_DETAILS_STATUS.AUTHORIZED || code === AUTH_CODES.SUCCESS) {
				router.push('/(tabs)' as Href)
				return
			}
			return
		} catch (error) {
			let message = 'Email ou senha inválidos'
			setHasError(true)
			setErrorMessage(message)
			return
		}
	}

	if (isLoading) {
		return <Spinner />
	}

	if (session && !isLoading) {
		return <Redirect href="/(tabs)" />
	}

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
				<View className="flex-1 justify-center space-y-3">
					<HeroCard title="MyCoop" description="Faça login para continuar" />
				</View>
				<View className="flex-1 justify-center">
					<LogInForm performLogin={performLogin} />
				</View>
			</KeyboardAwareScrollView>
			<ErrorAlert
				visible={hasError}
				setVisible={setHasError}
				message={errorMessage}
				setMessage={setErrorMessage}
				title="Erro ao fazer login"
			/>
		</CustomSafeAreaView>
	)
}
