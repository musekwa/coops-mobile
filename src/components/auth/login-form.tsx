import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import CustomTextInput from '../custom-text-input/CustomTextInput'
import { Ionicons } from '@expo/vector-icons'
import SubmitButton from '../buttons/SubmitButton'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { colors } from 'src/constants'
import { useRouter } from 'expo-router'
import FormItemDescription from '../forms/FormItemDescription'
const UserCredentialsSchema = z.object({
	email: z
		.string({
			description: 'Email de acesso',
		})
		.email({
			message: 'Email inválido',
		}),
	password: z
		.string({
			description: 'Senha de acesso',
		})
		.min(6, {
			message: 'No mínimo 6 caracteres',
		}),
})

type UserCredentialsFormData = z.infer<typeof UserCredentialsSchema>

type LoginFormProps = {
	performLogin: ({ email, password }: { email: string; password: string }) => Promise<void>
}

export default function LogInForm({ performLogin }: LoginFormProps) {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const router = useRouter()

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<UserCredentialsFormData>({
		resolver: zodResolver(UserCredentialsSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const onSubmit = async (data: UserCredentialsFormData) => {
		try {
			const { password, email } = data
			await performLogin({ email, password })
		} catch (error) {
			console.log('Error', error)
		}
	}

	const navigateToSignUp = () => {
		router.push('/(auth)/sign-up')
	}

	const navigateToForgotPassword = () => {
		router.push('/(auth)/forgot-password')
	}

	return (
		<View className="space-y-4">
			<View className="relative ">
				{/* Email */}
				<Controller
					control={control}
					name="email"
					rules={{ required: 'Digite o seu endereço email.' }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<CustomTextInput
								label=""
								editable={!isSubmitting}
								placeholder="Endereço electrónico"
								keyboardType="email-address"
								autoCapitalize="none"
								autoCompleteType="email"
								textContentType="emailAddress"
								onChangeText={onChange}
								value={value}
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : (
								<FormItemDescription description="Endereço electrónico" />
							)}
						</>
					)}
				/>
			</View>
			{/* Password */}
			<View className="relative">
				<Controller
					control={control}
					name="password"
					rules={{ required: 'Digite a senha' }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<View className="relative">
								<CustomTextInput
									label=""
									editable={!isSubmitting}
									placeholder="Senha"
									textContentType="password"
									secureTextEntry={!isPasswordVisible}
									value={value}
									onChangeText={onChange}
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
							{error ? (
								<Text className="text-xs text-red-500 mt-1">{error.message}</Text>
							) : (
								<FormItemDescription description="Senha" />
							)}
						</>
					)}
				/>
			</View>
			<Pressable onPress={navigateToForgotPassword} className=" ">
				<Text className="text-[14px] font-bold text-[#008000] text-center underline">Esqueceu a senha?</Text>
			</Pressable>
			<View className="">
				<SubmitButton
					isSubmitting={isSubmitting}
					disabled={isSubmitting}
					title={!isSubmitting ? 'Entrar' : 'Processando...'}
					onPress={handleSubmit(onSubmit)}
				/>
			</View>
			<Pressable onPress={navigateToSignUp} className="flex flex-row space-x-2 justify-center">
				<Text className="text-[14px] text-gray-600 text-center dark:text-white">Não tem conta?</Text>
				<Text className="text-[14px] font-bold text-[#008000] text-center dark:text-slate-600 underline">
					Crie uma conta
				</Text>
			</Pressable>
		</View>
	)
}
