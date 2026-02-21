// React and React Native imports
import { useEffect, useState } from 'react'

// Third party libraries
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFonts } from 'expo-font'
import { Href, Stack, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import 'react-native-reanimated'
import { pt, registerTranslation } from 'react-native-paper-dates'
import * as Sentry from '@sentry/react-native'

// Components
import CustomSplashScreen from '../components/custom-splash-screen/CustomSplashScreen'
import Providers from '../Providers'
import { useUserDetails } from 'src/hooks/queries'
import { PowerSyncConnecting } from 'src/components/loaders'

// Register translations
registerTranslation('pt', pt)

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

// Sentry setup
Sentry.init({
	dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
	sendDefaultPii: true,
	enableLogs: true,
	profilesSampleRate: 1.0,
	tracesSampleRate: 1.0,
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1,
	integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	spotlight: __DEV__,
})

export default Sentry.wrap(RootLayout)

function RootLayout() {
	const [isReady, setIsReady] = useState(false)

	const [loaded, error] = useFonts({
		SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
		...FontAwesome.font,
	})

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error
	}, [error])

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync()
		}
	}, [loaded])

	useEffect(() => {
		async function prepare() {
			try {
				// Pre-load fonts, make any API calls you need to do here
				// await Font.loadAsync(Entypo.font);
				// Artificially delay for two seconds to simulate a slow loading
				// experience. Please remove this if you copy and paste the code!
				await new Promise((resolve) => setTimeout(resolve, 2000))
			} catch (e) {
				console.warn(e)
			} finally {
				// Tell the application to render
				setIsReady(true)
			}
		}

		prepare()
	}, [loaded])

	const onSplashFinish = () => {
		SplashScreen.hideAsync()
	}

	if (!isReady) {
		return <CustomSplashScreen onFinish={onSplashFinish} />
	}

	if (!loaded) {
		return null
	}

	return (
		<Providers>
			<RootLayoutNav />
		</Providers>
	)
}
function RootLayoutNav() {
	const { userDetails, isLoading } = useUserDetails()
	const router = useRouter()

	useEffect(() => {
		// If not loading and no user details, redirect to login
		if (!isLoading && !userDetails) {
			router.replace('/(auth)/login' as Href)
		}
	}, [userDetails, isLoading, router])

	// Show loading while checking authentication
	if (isLoading) {
		return <PowerSyncConnecting />
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen name="(aux)" options={{ presentation: 'modal', headerShown: false }} />
			<Stack.Screen name="(actions)" options={{ presentation: 'modal', headerShown: false }} />
		</Stack>
	)
}

// export default Sentry.wrap(RootLayout);
