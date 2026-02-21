export const AUTH_CODES = {
	EMAIL_EXISTS: 'email_exists',
	EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
	EMAIL_NOT_FOUND: 'email_not_found',
	INVALID_CREDENTIALS: 'invalid_credentials',
	OVER_EMAIL_SEND_RATE_LIMIT: 'over_email_send_rate_limit',
	EMAIL_VERIFICATION_RESEND_ERROR: 'email_verification_resend_error',
	EMAIL_VERIFICATION_ERROR: 'email_verification_error',
	OTP_EXPIRED: 'otp_expired',
	UNKNOWN_ERROR: 'unknown_error',
	PASSWORD_RESET_ERROR: 'password_reset_error',
	PASSWORD_RESET_CODE_COMPARISON_ERROR: 'password_reset_code_comparison_error',
	SUCCESS: 'success',
	USER_DETAILS_STATUS: {
		UNAUTHORIZED: 'unauthorized',
		AUTHORIZED: 'authorized',
		BLOCKED: 'blocked',
		BANNED: 'banned',
		EMAIL_PENDING_VERIFICATION: 'email_pending_verification',
	},
}

export const AUTH_EVENTS = {
	SIGNED_OUT: 'SIGNED_OUT',
	SIGNED_IN: 'SIGNED_IN',
	TOKEN_REFRESHED: 'TOKEN_REFRESHED',
	PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
	USER_UPDATED: 'USER_UPDATED',
	INITIAL_SESSION: 'INITIAL_SESSION',
}
