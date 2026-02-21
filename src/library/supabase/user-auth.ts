import { isAuthApiError } from '@supabase/supabase-js'
import { TABLES, UserDetailsRecord } from 'src/library/powersync/schemas/AppSchema'
import { supabase } from 'src/library/supabase/supabase'
import { AUTH_CODES } from 'src/data/auth_codes'
import { sessionManager } from './session-manager'

export const getUserSession = async () => {
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession()
	return {
		session,
		error,
	}
}

/**
 * Enhanced login function that stores credentials for offline recovery
 */
export const loginWithOfflineSupport = async (email: string, password: string) => {
	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) {
			return {
				success: false,
				message: error.message,
				data: null,
			}
		}

		if (data.session) {
			// Store credentials for offline recovery
			await sessionManager.storeCredentials(email, password)
			console.log('Login successful, credentials stored for offline recovery')

			return {
				success: true,
				message: 'Login successful',
				data: data.session,
			}
		}

		return {
			success: false,
			message: 'Login failed - no session created',
			data: null,
		}
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Unknown error',
			data: null,
		}
	}
}

/**
 * Enhanced logout function that clears stored credentials
 */
export const logoutWithCleanup = async () => {
	try {
		// Clear stored credentials
		await sessionManager.clearStoredCredentials()

		// Sign out from Supabase
		const { error } = await supabase.auth.signOut()

		if (error) {
			console.warn('Logout error:', error)
		}

		return {
			success: true,
			message: 'Logout successful',
		}
	} catch (error) {
		console.error('Logout error:', error)
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export const updateUserMetdata = async (updates: Record<string, string>) => {
	const { error } = await supabase.auth.updateUser({
		data: {
			...updates,
		},
	})
	if (error) {
		return {
			success: false,
			message: 'Erro ao actualizar dados do usuário',
			code: AUTH_CODES.UNKNOWN_ERROR,
		}
	}
	return {
		success: true,
		message: 'Dados do usuário actualizado com sucesso',
		code: AUTH_CODES.SUCCESS,
	}
}

export const updateUserDetails = async (updates: Record<string, string>, email: string) => {
	const { data, error: userDetailsError } = await (supabase.from(TABLES.USER_DETAILS) as any)
		.update(updates)
		.eq('email', email)
		.select()
		.single()

	if (userDetailsError) {
		return {
			success: false,
			message: 'Erro ao actualizar dados do usuário',
			code: AUTH_CODES.UNKNOWN_ERROR,
			data: null,
		}
	}
	return {
		success: true,
		message: 'Dados do usuário actualizados com sucesso',
		code: AUTH_CODES.SUCCESS,
		data: data as UserDetailsRecord,
	}
}

export const getUserDetails = async (user_id: string) => {
	const { data, error } = await supabase.from(TABLES.USER_DETAILS).select('*').eq('user_id', user_id)
	if (error) {
		return {
			success: false,
			message: 'Erro ao actualizar dados do usuário',
			data: null,
			code: AUTH_CODES.UNKNOWN_ERROR,
		}
	}
	return {
		success: true,
		message: 'Dados do usuário actualizados com sucesso',
		code: AUTH_CODES.SUCCESS,
		data: data[0] as unknown as UserDetailsRecord,
	}
}

// New function to directly fetch user details from Supabase
export const fetchUserDetailsFromSupabase = async (): Promise<UserDetailsRecord | null> => {
	try {
		const { session, error } = await getUserSession()

		if (error || !session?.user.id) {
			console.error('No session or error getting session:', error)
			return null
		}

		const user_id = session.user.id

		// Set the session for the request
		supabase.auth.setSession({
			access_token: session.access_token,
			refresh_token: session.refresh_token,
		})

		// Direct query to Supabase
		const { data, error: queryError } = await supabase
			.from(TABLES.USER_DETAILS)
			.select(
				`
				id,
				email,
				phone,
				full_name,
				user_role,
				district_id,
				province_id
			`,
			)
			.eq('user_id', user_id)
			.single()

		if (queryError) {
			console.error('Error fetching user details from Supabase:', queryError)
			return null
		}

		if (data) {
			console.log('✅ Successfully fetched user details from Supabase:', data)
			return data as UserDetailsRecord
		}

		console.log('No user details found in Supabase')
		return null
	} catch (error) {
		console.error('Exception in fetchUserDetailsFromSupabase:', error)
		return null
	}
}

export const userSignOut = async () => {
	try {
		// Sign out from Supabase
		const { error } = await supabase.auth.signOut()
		if (error) {
			console.error('❌ Error signing out from Supabase:', error)
			throw error
		}

		return { success: true }
	} catch (error) {
		console.error('❌ Error during sign out:', error)
		return { success: false, error }
	}
}

export const userSignUp = async (
	email: string,
	password: string,
	options: { full_name: string; phone: string; user_role: string; district_id: string; province_id: string },
) => {
	const emailToCheck = email.toLowerCase()

	const existingUser = await getUserDetailsByEmail(emailToCheck)
	if (existingUser && existingUser.status === AUTH_CODES.USER_DETAILS_STATUS.EMAIL_PENDING_VERIFICATION) {
		const {
			success: resendSuccess,
			message: resendMessage,
			code: resendCode,
		} = await resendEmailVerification(emailToCheck)
		if (!resendSuccess) {
			return {
				success: false,
				message: resendMessage,
				session: null,
				code: resendCode,
			}
		}
		return {
			success: false,
			message: 'Email não verificado! Por favor, verifique seu email. Enviamos um novo email de verificação para você.',
			session: null,
			code: AUTH_CODES.EMAIL_NOT_CONFIRMED,
		}
	}

	if (existingUser && existingUser.status === AUTH_CODES.USER_DETAILS_STATUS.AUTHORIZED) {
		return {
			success: false,
			message: 'Email já autorizado! Por favor, faça login com o email e senha que você usou para criar a conta!',
			session: null,
			code: AUTH_CODES.EMAIL_EXISTS,
		}
	}

	if (existingUser && existingUser.status === AUTH_CODES.USER_DETAILS_STATUS.BLOCKED) {
		return {
			success: false,
			message: 'Conta bloqueada! Por favor, contacte a equipe de suporte.',
			session: null,
			code: AUTH_CODES.USER_DETAILS_STATUS.BLOCKED,
		}
	}

	if (existingUser && existingUser.status === AUTH_CODES.USER_DETAILS_STATUS.BANNED) {
		return {
			success: false,
			message: 'Conta banida! Por favor, contacte a equipe de suporte.',
			session: null,
			code: AUTH_CODES.USER_DETAILS_STATUS.BANNED,
		}
	}

	if (existingUser && existingUser.status === AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED) {
		return {
			success: false,
			message: 'Email ainda não autorizado! Por favor, contacte a equipe de suporte.',
			session: null,
			code: AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED,
		}
	}

	const status = AUTH_CODES.USER_DETAILS_STATUS.EMAIL_PENDING_VERIFICATION

	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				full_name: options.full_name,
				phone: options.phone,
				status: status,
				user_role: options.user_role,
				district_id: options.district_id,
				province_id: options.province_id,
			},
		},
	})

	if (error && isAuthApiError(error)) {
		if (error.code === AUTH_CODES.EMAIL_EXISTS) {
			return {
				success: false,
				message:
					'O email já está em uso. Tente outro email ou faça login com o email e senha que você usou para criar a conta!',
				session: null,
				code: error.code,
			}
		}
		if (error.code === AUTH_CODES.EMAIL_NOT_CONFIRMED) {
			return {
				success: false,
				message:
					'Email não verificado! Por favor, verifique seu email. Enviamos um novo email de verificação para você.',
				session: null,
				code: error.code,
			}
		}
		if (error.code === AUTH_CODES.OVER_EMAIL_SEND_RATE_LIMIT) {
			return {
				success: false,
				message:
					'Atingiu o limite de emails de verificação! Verifique sua caixa de entrada ou spam. Se não recebeu o email, volte a tentar mais tarde.',
				session: null,
				code: error.code,
			}
		}
		return {
			success: false,
			message: 'Não foi possível criar a conta de usuário. Tente mais tarde!',
			session: null,
			code: error.code,
		}
	}

	if (error && !isAuthApiError(error)) {
		return {
			success: false,
			message: 'Não foi possível criar a conta de usuário. Tente mais tarde!',
			session: null,
			code: error.code,
		}
	}

	if (data && data.user) {
		const userId = data.user.id
		const userDetails = {
			user_id: userId,
			email,
			phone: options.phone,
			full_name: options.full_name,
			user_role: options.user_role,
			district_id: options.district_id,
			province_id: options.province_id,
			status: status,
		} as UserDetailsRecord
		await insertUserDetails(userDetails)
		return {
			success: true,
			message: 'Conta criada com sucesso!',
			session: null,
			code: AUTH_CODES.SUCCESS,
		}
	}
	return {
		success: false,
		message: 'Não foi possível criar a conta de usuário. Tente mais tarde!',
		session: null,
		code: AUTH_CODES.UNKNOWN_ERROR,
	}
}

export const userSignIn = async (email: string, password: string) => {
	const emailToCheck = email.toLowerCase()
	const {
		data: { session, user },
		error,
	} = await supabase.auth.signInWithPassword({
		email: emailToCheck,
		password,
	})
	if (error) {
		if (error.code === AUTH_CODES.EMAIL_NOT_CONFIRMED) {
			const {
				success: resendSuccess,
				message: resendMessage,
				code: resendCode,
			} = await resendEmailVerification(emailToCheck)
			if (!resendSuccess) {
				return {
					success: false,
					message: resendMessage,
					session: null,
					code: resendCode,
				}
			}
			return {
				success: false,
				message:
					'Email não verificado! Por favor, verifique seu email. Enviamos um novo email de verificação para você.',
				session: null,
				code: error.code,
			}
		}

		if (error.code === AUTH_CODES.INVALID_CREDENTIALS) {
			return {
				success: false,
				message: 'Email ou senha inválidos! Por favor, confirme as credenciais fornecidas e tente novamente.',
				session: null,
				code: error.code,
			}
		}
		return {
			success: false,
			message: 'Erro ao fazer login. Por favor, tente novamente mais tarde!',
			session: null,
			code: error.code,
		}
	}

	const existingUser = await getUserDetailsByEmail(emailToCheck)
	if (existingUser && existingUser.status) {
		await updateUserMetdata({ status: existingUser.status })
	}
	if (existingUser && existingUser.status === AUTH_CODES.USER_DETAILS_STATUS.EMAIL_PENDING_VERIFICATION) {
		const {
			success: resendSuccess,
			message: resendMessage,
			code: resendCode,
		} = await resendEmailVerification(emailToCheck)
		if (!resendSuccess) {
			return {
				success: false,
				message: resendMessage,
				session: null,
				code: resendCode,
			}
		}
		return {
			success: false,
			message: 'Email não verificado! Por favor, verifique seu email. Enviamos um novo email de verificação para você.',
			session: null,
			code: AUTH_CODES.EMAIL_NOT_CONFIRMED,
		}
	}

	if (existingUser && existingUser.status === AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED) {
		return {
			success: false,
			message: 'Email ainda não autorizado! Por favor, contacte a equipe de suporte.',
			session: null,
			code: AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED,
		}
	}

	return {
		success: true,
		message: 'Login realizado com sucesso!',
		session,
		code: AUTH_CODES.SUCCESS,
	}
}

// Insert user details into the database
export const insertUserDetails = async (userDetails: UserDetailsRecord) => {
	const { user_id, email, phone, full_name, user_role, district_id, province_id, status } = userDetails
	if (!user_id || !email || !phone || !full_name || !user_role || !district_id || !province_id || !status) {
		return {
			success: false,
			message: 'Dados incompletos',
			resData: null,
		}
	}
	const { error } = await (supabase.from(TABLES.USER_DETAILS) as any).insert({
		user_id,
		email,
		phone,
		full_name,
		user_role,
		district_id,
		province_id,
		status,
	})
	if (error) {
		console.error('Error inserting user details', error)
		return {
			success: false,
			message: 'Erro ao inserir dados do usuário',
			resData: null,
		}
	}
	return {
		success: true,
		message: 'Dados do usuário inseridos com sucesso',
		resData: null,
	}
}

export const getUserDetailsByEmail = async (email: string): Promise<UserDetailsRecord | null> => {
	try {
		const { data, error } = await supabase.from(TABLES.USER_DETAILS).select('*').eq('email', email)

		if (error) {
			console.error('Error fetching user details', error)
			return null
		}

		// Check if any data was returned
		if (!data || data.length === 0) {
			console.log('No user found with email:', email)
			return null
		}

		// Return the first (and should be only) user found
		return data[0] as UserDetailsRecord
	} catch (error) {
		console.error('Error fetching user details', error)
		return null
	}
}

export const resendEmailVerification = async (email: string) => {
	const emailToCheck = email.toLowerCase()
	try {
		const { error } = await supabase.auth.resend({
			email: emailToCheck,
			type: 'signup',
		})
		if (error) {
			console.error('Error resending email verification', error)
			return {
				success: false,
				message: 'Erro ao reenviar email de verificação. Por favor, tente novamente mais tarde!',
				code: AUTH_CODES.EMAIL_VERIFICATION_RESEND_ERROR,
			}
		}
		return {
			success: true,
			message: 'Email de verificação reenviado com sucesso!',
			code: AUTH_CODES.SUCCESS,
		}
	} catch (error) {
		console.error('Error resending email verification', error)
		return {
			success: false,
			message: 'Erro ao reenviar email de verificação',
			code: AUTH_CODES.EMAIL_VERIFICATION_RESEND_ERROR,
		}
	}
}

export const verifyEmail = async (email: string, token: string) => {
	try {
		const emailToCheck = email.toLowerCase()
		const { error } = await supabase.auth.verifyOtp({
			email: emailToCheck,
			token: token,
			type: 'email',
		})

		if (error) {
			console.error('Error verifying email', error)
			if (error.code === AUTH_CODES.OTP_EXPIRED) {
				return {
					success: false,
					message: 'Código de verificação expirado ou inválido!',
					code: AUTH_CODES.OTP_EXPIRED,
				}
			}
			return {
				success: false,
				message: 'Erro ao verificar email',
				code: AUTH_CODES.EMAIL_VERIFICATION_ERROR,
			}
		}

		const { success, message, code } = await updateUserDetails(
			{ status: AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED },
			emailToCheck,
		)

		if (!success) {
			return {
				success: false,
				message: message,
				code: code,
			}
		}

		const {
			success: updateSuccess,
			message: updateMessage,
			code: updateCode,
		} = await updateUserMetdata({ status: AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED })
		if (!updateSuccess) {
			return {
				success: false,
				message: updateMessage,
				code: updateCode,
			}
		}

		return {
			success: true,
			message: 'Email verificado com sucesso!',
			code: AUTH_CODES.SUCCESS,
		}
	} catch (error) {
		console.error('Error verifying email', error)
		return {
			success: false,
			message: 'Erro ao verificar email',
			code: AUTH_CODES.EMAIL_VERIFICATION_ERROR,
		}
	}
}

export const forgotPassword = async (email: string) => {
	try {
		const emailToCheck = email.toLowerCase()
		const { error } = await supabase.auth.resetPasswordForEmail(emailToCheck, {
			redirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/(aux)/reset-password`,
		})
		if (error) {
			console.error('Error resetting password', error)
			return {
				success: false,
				message: 'Erro ao enviar código de redefinição de senha',
				code: AUTH_CODES.PASSWORD_RESET_ERROR,
			}
		}

		// make sure the user is logged out until they reset their password
		await logoutWithCleanup()

		return {
			success: true,
			message: 'Código de redefinição de senha enviado com sucesso!',
			code: AUTH_CODES.SUCCESS,
		}
	} catch (error) {
		console.error('Error resetting password', error)
		return {
			success: false,
			message: 'Erro ao enviar código de redefinição de senha',
			code: AUTH_CODES.PASSWORD_RESET_ERROR,
		}
	}
}

export const comparePasswordResetCode = async (email: string, code: string) => {
	const emailToCheck = email.toLowerCase()
	const { error } = await supabase.auth.verifyOtp({
		email: emailToCheck,
		token: code,
		type: 'recovery',
	})
	if (error) {
		console.error('Error comparing password reset code', error)
		return {
			success: false,
			message: 'O código de redefinição de senha não é válido!',
			code: AUTH_CODES.PASSWORD_RESET_CODE_COMPARISON_ERROR,
		}
	}
	return {
		success: true,
		message: 'Código de redefinição de senha válido!',
		code: AUTH_CODES.SUCCESS,
	}
}

export const resetPassword = async (password: string) => {
	try {
		const { error } = await supabase.auth.updateUser({
			password,
		})
		if (error) {
			console.error('Error resetting password', error)
			return {
				success: false,
				message: 'Erro ao redefinir senha',
				code: AUTH_CODES.PASSWORD_RESET_ERROR,
			}
		}

		// make sure the user is logged out until they login again
		await logoutWithCleanup()
		return {
			success: true,
			message: 'Senha redefinida com sucesso!',
			code: AUTH_CODES.SUCCESS,
		}
	} catch (error) {
		console.error('Error resetting password', error)
		return {
			success: false,
			message: 'Erro ao redefinir senha',
			code: AUTH_CODES.PASSWORD_RESET_ERROR,
		}
	}
}
