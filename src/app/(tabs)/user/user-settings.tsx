import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import Toast from 'src/components/ToastMessage/Toast'
import { useActionStore } from 'src/store/actions/actions'
import { Href, useRouter } from 'expo-router'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

export default function UserSettingsScreen() {
	const router = useRouter()
	const { toastPayload, resetToast } = useActionStore()
	const toastRef = useRef<any>({})
	useEffect(() => {
		if (toastPayload.title && toastPayload.description && toastPayload.type) {
			toastRef.current.show(toastPayload)
			resetToast()
		}
	}, [toastPayload.title, toastPayload.description, toastPayload.type])

	return (
			<Animated.ScrollView
				entering={FadeIn.duration(200)}
				exiting={FadeOut.duration(200)}
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: 20,
				}}
				className="bg-gray-50 dark:bg-gray-900"
			>
				<View className="p-4 pt-6">
					{/* Section Header */}
					<Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
						Configurações
					</Text>

					{/* Checkpoint Selection Card */}
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={() => {
							router.push('/(aux)/checkpoints' as Href)
						}}
						className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-3"
						style={{
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.08,
							shadowRadius: 4,
							elevation: 2,
						}}
					>
						<View className="p-4 flex-row items-center">
							<View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-green-50 dark:bg-green-900/20">
								<MaterialCommunityIcons name="select-place" size={22} color={colors.primary} />
							</View>
							<View className="flex-1">
								<Text className="font-bold text-base text-black dark:text-white mb-0.5">Postos de fiscalização</Text>
								<Text className="text-xs text-gray-600 dark:text-gray-400">
									Seleccione o seu novo posto de fiscalização
								</Text>
							</View>
							<Ionicons name="chevron-forward" size={20} color={colors.gray600} />
						</View>
					</TouchableOpacity>

					{/* Help Card */}
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={() => {}}
						className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
						style={{
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.08,
							shadowRadius: 4,
							elevation: 2,
						}}
					>
						<View className="p-4 flex-row items-center">
							<View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-blue-50 dark:bg-blue-900/20">
								<Ionicons name="help-circle-outline" size={22} color="#3b82f6" />
							</View>
							<View className="flex-1">
								<Text className="font-bold text-base text-black dark:text-white mb-0.5">Ajuda</Text>
								<Text className="text-xs text-gray-600 dark:text-gray-400">
									Obtenha suporte técnico sobre o uso do aplicativo
								</Text>
							</View>
							<Ionicons name="chevron-forward" size={20} color={colors.gray600} />
						</View>
					</TouchableOpacity>
				</View>

				<Toast ref={toastRef} />
			</Animated.ScrollView>
	)
}
