import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { Href, router } from 'expo-router'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextInput from '../../components/custom-text-input/CustomTextInput'
import SubmitButton from '../../components/buttons/SubmitButton'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import { resetPassword, userSignOut } from 'src/library/supabase/user-auth'
// import { useAuthStore } from 'src/store/auth'
import { useToast } from 'src/components/ToastMessage'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import HeroCard from 'src/components/auth/hero-card'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import { colors } from 'src/constants'
import { Ionicons } from '@expo/vector-icons'

const PasswordResetSchema = z
	.object({
		// code: z.string().min(6, 'Código deve ter pelo menos 6 caracteres'),
		password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Senhas não coincidem',
		path: ['confirmPassword'],
	})

type PasswordResetSchemaType = z.infer<typeof PasswordResetSchema>

export default function PasswordReset() {
	const { showSuccess } = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const [hasAlert, setHasAlert] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	// const { currentEmail } = useAuthStore()
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty, isSubmitting },
	} = useForm<PasswordResetSchemaType>({
		resolver: zodResolver(PasswordResetSchema),
		defaultValues: {
			// code: '',
			password: '',
			confirmPassword: '',
		},
	})

	const onSubmit = async (data: PasswordResetSchemaType) => {
		setIsLoading(true)

		try {
			const { code, message, success } = await resetPassword(data.password)

			if (success) {
				showSuccess('Sua senha foi redefinida com sucesso. Você pode fazer login agora.')
				reset()
				await userSignOut()
				router.push('/(auth)/login' as Href)
			} else {
				setHasAlert(true)
				setErrorMessage(message)
			}
		} catch (error) {
			setHasAlert(true)
			setErrorMessage('Falha ao redefinir senha. Por favor, tente novamente.')
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
					padding: 16,
					paddingBottom: 40,
				}}
				className="bg-white dark:bg-black"
			>
				<HeroCard />
				<View className="py-4">
					<Text className="text-sm font-bold text-center text-black dark:text-white">Redefina sua senha</Text>
					<FormItemDescription
						description="Digite sua nova senha e confirme-a para redefinir sua senha."
						style={{ textAlign: 'center' }}
					/>
				</View>

				<View className="flex-1 justify-center space-y-3">
					<View className="relative">
						<Controller
							control={control}
							name="password"
							render={({ field }) => (
								<View className="relative">
									<CustomTextInput
										label=""
										placeholder="Digite sua nova senha"
										value={field.value}
										onChangeText={field.onChange}
										secureTextEntry={!isPasswordVisible}
										editable={!isLoading}
									/>
									<View className="absolute right-3 top-0 bottom-0 justify-center">
										{isPasswordVisible ? (
											<Ionicons
												onPress={() => setIsPasswordVisible(!isPasswordVisible)}
												color={colors.gray600}
												name="eye-outline"
												size={24}
											/>
										) : (
											<Ionicons
												onPress={() => setIsPasswordVisible(!isPasswordVisible)}
												color={colors.gray600}
												name="eye-off-outline"
												size={24}
											/>
										)}
									</View>
								</View>
							)}
						/>
						<FormItemDescription description="Senha" />
						{errors.password && <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>}
					</View>
					<View className="relative">
						<Controller
							control={control}
							name="confirmPassword"
							render={({ field }) => (
								<View className="relative">
									<CustomTextInput
										label=""
										placeholder="Confirme sua nova senha"
										value={field.value}
										onChangeText={field.onChange}
										secureTextEntry={!isConfirmPasswordVisible}
										editable={!isLoading}
									/>
									<View className="absolute right-3 top-0 bottom-0 justify-center">
										{isConfirmPasswordVisible ? (
											<Ionicons
												onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
												color={colors.gray600}
												name="eye-outline"
												size={24}
											/>
										) : (
											<Ionicons
												onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
												color={colors.gray600}
												name="eye-off-outline"
												size={24}
											/>
										)}
									</View>
								</View>
							)}
						/>
						<FormItemDescription description="Confirme sua nova senha" />
						{errors.confirmPassword && (
							<View className="flex-row items-center space-x-1 bg-red-100 p-1 rounded-md mt-1">
								<Text className="text-red-600 text-[12px] italic">{errors.confirmPassword.message}</Text>
							</View>
						)}
					</View>
					<View className="my-4">
						<SubmitButton
							title={isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
							onPress={handleSubmit(onSubmit)}
							disabled={isLoading || !isDirty || isSubmitting}
							isSubmitting={isSubmitting}
						/>
					</View>
					<View className="">
						<Text className="text-[#008000] font-bold text-center underline" onPress={() => router.back()}>
								Solicitar Novo Código
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
