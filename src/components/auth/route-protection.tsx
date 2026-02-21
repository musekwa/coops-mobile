import { Redirect } from 'expo-router'
import { AUTH_CODES } from 'src/data/auth_codes'
import { useUserSession } from 'src/hooks/queries'
import TabTransition from '../loaders/TabTransition'

export default function RouteProtection({ children }: { children: React.ReactNode }) {
	const { session, isLoading, isError } = useUserSession()

	if (isLoading) {
		return <TabTransition />
	}

	if (!isLoading && !session) {
		return <Redirect href="/(auth)/login" />
	}

	if (
		!isLoading &&
		session &&
		session.user.user_metadata.status === AUTH_CODES.USER_DETAILS_STATUS.EMAIL_PENDING_VERIFICATION
	) {
		return <Redirect href="/(auth)/pending-email-verification" />
	}

	if (!isLoading && session && session.user.user_metadata.status === AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED) {
		return <Redirect href="/(auth)/pending-user-authorization" />
	}

	return <>{children}</>
}
