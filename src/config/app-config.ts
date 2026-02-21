export const AppConfig = {
	appUrl: process.env.EXPO_PUBLIC_APP_URL,
	powersyncUrl: process.env.EXPO_PUBLIC_POWERSYNC_URL,
	powersyncDbFilename: process.env.EXPO_PUBLIC_POWERSYNC_DB_FILENAME,
	connectcajuBackendUrl: process.env.EXPO_PUBLIC_CONNECTCAJU_BACKEND_URL,
	supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
	supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
	imageAvatar: process.env.EXPO_PUBLIC_IMAGE_AVATAR,
    sentryAuthToken: process.env.SENTRY_AUTH_TOKEN,
	sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
	sentrySlug: process.env.SENTRY_SLUG,
	sentryProjectName: process.env.SENTRY_PROJECT_NAME,
}
