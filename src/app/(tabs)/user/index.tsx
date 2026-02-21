// React and React Native imports
import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

// Third-party libraries
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import Animated, { FadeIn } from 'react-native-reanimated'

// Components

// Constants and types
import { avatarPlaceholderUri } from 'src/constants/imageURI'
// Navigation imports
import { useUserDetails } from 'src/hooks/queries'
import RouteProtection from 'src/components/auth/route-protection'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'
import { colors } from 'src/constants'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import { getDistrictById, getProvinceById } from 'src/library/sqlite/selects'

// Helper function to get role display name
const getRoleDisplayName = (role: string) => {
	const roleMap: { [key: string]: string } = {
		ADMIN: 'Administrador',
		USER: 'Usuário',
		INSPECTOR: 'Fiscal',
		SUPERVISOR: 'Supervisor',
		FIELD_AGENT: 'Extensionista',
		COOP_ADMIN: 'Gestor de Cooperativa',
	}
	return roleMap[role] || role
}

export default function UserProfileScreen() {
	const { userDetails } = useUserDetails()
	const [fullName, setFullName] = useState('')
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')
	const [role, setRole] = useState('')
	const [district, setDistrict] = useState('')
	const [province, setProvince] = useState('')
	useEffect(() => {
		if (userDetails && userDetails.full_name && userDetails.email && userDetails.phone && userDetails.user_role) {
			setFullName(userDetails.full_name)
			setEmail(userDetails.email)
			setPhone(userDetails.phone)
			setRole(userDetails.user_role)
		}
		if (userDetails?.district_id) {
			getDistrictById(userDetails.district_id).then((district) => {
				if (district && district !== null) {
					setDistrict(district)
				} else {
					setDistrict('')
				}
			})
		}
		if (userDetails?.province_id) {
			getProvinceById(userDetails.province_id).then((province) => {
				if (province && province !== null) {
					setProvince(province)
				} else {
					setProvince('')
				}
			})
		}
	}, [userDetails])

	return (
		<RouteProtection>
			<CustomSafeAreaView>
				<Animated.ScrollView
					showsVerticalScrollIndicator={false}
					entering={FadeIn.duration(1000)}
					contentContainerStyle={{
						flexGrow: 1,
						justifyContent: 'center',
						paddingBottom: 80,
					}}
				>
					{/* Header Section */}
					<View className="flex-1">
						<View className="items-center">
							{/* Avatar */}
							<View className="relative mb-2">
								<Image
									source={{ uri: avatarPlaceholderUri }}
									style={{
										width: 100,
										height: 100,
										borderRadius: 50,
										borderWidth: 4,
										borderColor: 'rgba(255, 255, 255, 0.3)',
									}}
								/>
								<TouchableOpacity
									activeOpacity={0.7}
									className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg"
								>
									<Ionicons name="camera" size={20} color={colors.primary} />
								</TouchableOpacity>
							</View>

							{/* Name */}
							<Text className="text-black text-lg font-bold text-center mb-2">{fullName || 'Nome não definido'}</Text>

							{/* Role Badge */}
							<View className="bg-gray-200 dark:bg-gray-700 rounded-full px-4 py-2 border border-white/30">
								<Text className="text-gray-900 dark:text-white font-semibold text-[10px]">
									{getRoleDisplayName(role || 'USER')}
								</Text>
							</View>
						</View>

						{/* Content Section */}
						<View className="flex-1 pt-10 px-4">
							{/* <Text className="text-gray-600 dark:text-gray-400 text-[14px] font-semibold mb-4 px-2">
								Informações de Contacto
							</Text> */}

							<View className="space-y-3">
								{/* Email Card */}
								<Animated.View
									entering={FadeIn.delay(100)}
									className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
								>
									<View className="flex-row items-center space-x-3">
										<View className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center">
											<Ionicons name="mail-outline" size={20} color={colors.primary} />
										</View>
										<View className="flex-1">
											<Text className="text-gray-500 dark:text-gray-400 text-[10px] font-medium mb-1">Email</Text>
											<Text
												className={`text-gray-900 dark:text-white text-[13px] ${
													email ? 'font-medium' : 'italic text-gray-400'
												}`}
												numberOfLines={1}
											>
												{email || 'Email não definido'}
											</Text>
										</View>
									</View>
								</Animated.View>

								{/* Phone Card */}
								<Animated.View
									entering={FadeIn.delay(200)}
									className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
								>
									<View className="flex-row items-center space-x-3">
										<View className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center">
											<Ionicons name="call-outline" size={20} color={colors.primary} />
										</View>
										<View className="flex-1">
											<Text className="text-gray-500 dark:text-gray-400 text-[10px] font-medium mb-1">Telefone</Text>
											<Text
												className={`text-gray-900 dark:text-white text-[13px] ${
													phone ? 'font-medium' : 'italic text-gray-400'
												}`}
											>
												{phone || 'Telefone não definido'}
											</Text>
										</View>
									</View>
								</Animated.View>

								{/* Location Card */}
								<Animated.View
									entering={FadeIn.delay(300)}
									className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
								>
									<View className="flex-row items-center space-x-3">
										<View className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center">
											<Ionicons name="location-outline" size={20} color={colors.primary} />
										</View>
										<View className="flex-1">
											<Text className="text-gray-500 dark:text-gray-400 text-[10px] font-medium mb-1">Localização</Text>
											<Text
												className={`text-gray-900 dark:text-white text-[13px] ${
													district || province ? 'font-medium' : 'italic text-gray-400'
												}`}
												numberOfLines={2}
											>
												{district && province
													? `${district}, ${province}`
													: district
														? district
														: province
															? province
															: 'Localização não definida'}
											</Text>
										</View>
									</View>
								</Animated.View>
							</View>
						</View>
					</View>
				</Animated.ScrollView>
			</CustomSafeAreaView>
		</RouteProtection>
	)
}
