import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { Href, router } from 'expo-router'

import CustomTextInput from '../../components/custom-text-input/CustomTextInput'
import SubmitButton from '../../components/buttons/SubmitButton'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import { forgotPassword } from 'src/library/supabase/user-auth'
import { useAuthStore } from 'src/store/auth'
import HeroCard from 'src/components/auth/hero-card'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'
import FormItemDescription from 'src/components/forms/FormItemDescription'

const ForgotPasswordSchema = z.object({
	email: z.string().email('Email inválido'), // validate email
})

type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPassword() {
	const [isLoading, setIsLoading] = useState(false)
	const [hasAlert, setHasAlert] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const { setCurrentEmail } = useAuthStore()

	const {
		control,
		handleSubmit,
		reset,
		getValues,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
	} = useForm<ForgotPasswordSchemaType>({
		resolver: zodResolver(ForgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	})
	const emailValue = getValues('email')

	const navigateToPendingPasswordReset = () => {
		router.push('/(auth)/pending-password-reset' as Href)
	}

	const onSubmit = async (data: ForgotPasswordSchemaType) => {
		setIsLoading(true)
		const email = data.email.toLowerCase()

		try {
			const { code, message, success } = await forgotPassword(email)
			if (success) {
				navigateToPendingPasswordReset()
				setCurrentEmail(email)
				reset()
			} else {
				setHasAlert(true)
				setErrorMessage(message)
			}
		} catch (error) {
			setHasAlert(true)
			setErrorMessage('Falha ao enviar link de redefinição. Por favor, tente novamente.')
		} finally {
			setIsLoading(false)
		}
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
					// padding: 15,
					paddingBottom: 40,
				}}
			>
				<View className="flex-1/3 justify-center space-y-3">
					<HeroCard />
					<Text className="text-sm font-bold text-center text-black dark:text-white">Esqueceu a senha?</Text>
					<FormItemDescription
						description="Digite seu endereço de email para redefinir a senha."
						style={{ textAlign: 'center' }}
					/>
				</View>
				<View className="flex-1 justify-center">
					<Controller
						control={control}
						name="email"
						render={({ field }) => (
							<CustomTextInput
								label=""
								placeholder="Digite seu endereço de email"
								value={field.value}
								onChangeText={field.onChange}
								keyboardType="email-address"
								autoCapitalize="none"
								editable={!isLoading}
							/>
						)}
					/>

					{errors.email ? (
						<Text className="text-red-500">{errors.email.message}</Text>
					) : (
						<FormItemDescription description="Endereço electrónico" />
					)}
					<View className="mt-4">
						<SubmitButton
							title={isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
							onPress={handleSubmit(onSubmit)}
							disabled={isLoading || !isDirty || isSubmitting}
							isSubmitting={isSubmitting}
						/>
					</View>
					<View className="mt-4">
						<Text className="text-sm text-center text-gray-600 dark:text-white">
							Já recebeu o código?{' '}
							<Text
								disabled={isLoading || !emailValue}
								className={`text-[#008000] font-bold underline ${isLoading ? 'opacity-50' : ''}`}
								onPress={() => router.push('/(auth)/pending-password-reset' as Href)}
							>
								Verificar email
							</Text>
						</Text>
					</View>
				</View>
				<ErrorAlert
					visible={hasAlert}
					setVisible={setHasAlert}
					message={errorMessage}
					setMessage={setErrorMessage}
					title="Erro"
				/>
			</KeyboardAwareScrollView>
		</CustomSafeAreaView>
	)
}
