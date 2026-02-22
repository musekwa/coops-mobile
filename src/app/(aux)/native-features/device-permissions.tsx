import React, { useActionState, useEffect, useState } from 'react'
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Linking } from 'react-native'
import { useColorScheme } from 'nativewind'
import { Href, RelativePathString, useNavigation, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCameraPermission } from 'react-native-vision-camera'
import * as ExpoMediaLibrary from 'expo-media-library'

import { colors } from 'src/constants'
import CustomConfirmDialg from 'src/components/dialogs/CustomConfirmDialg'
import HeroCard from 'src/components/auth/hero-card'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'
import BackButton from 'src/components/buttons/BackButton'
import { useActionStore } from 'src/store/actions/actions'
import { ActionType, ResourceName } from 'src/types'
import { useHeaderOptions } from 'src/hooks/useNavigationSearch'

type PermissionSwitchProps = {
	icon: keyof typeof Ionicons.glyphMap
	title: string
	description: string
	value: boolean
	onValueChange: (newValue: boolean) => void
}

function PermissionSwitch({ icon, title, description, value, onValueChange }: PermissionSwitchProps) {
	const { colorScheme } = useColorScheme()
	const isDark = colorScheme === 'dark'

	const handleToggle = (newValue: boolean) => {
		if (newValue) {
			onValueChange(true)
		} else {
			Linking.openSettings()
		}
	}

	return (
		<View
			style={[
				styles.permissionCard,
				{ backgroundColor: isDark ? '#1e293b' : '#f8fafc' },
			]}
		>
			<View style={styles.permissionIcon}>
				<Ionicons
					name={icon}
					size={24}
					color={value ? colors.primary : (isDark ? '#94a3b8' : '#475569')}
				/>
			</View>
			<View style={styles.permissionContent}>
				<Text style={[styles.permissionTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
					{title}
				</Text>
				<Text style={[styles.permissionDescription, { color: isDark ? '#94a3b8' : '#475569' }]}>
					{description}
				</Text>
			</View>
			<Switch
				trackColor={{ false: '#cbd5e1', true: colors.primary }}
				thumbColor="#fff"
				value={value}
				onValueChange={handleToggle}
			/>
		</View>
	)
}

export default function PermissionsScreen() {
	const { currentResource, addActionType } = useActionStore()
	const router = useRouter()
	const navigation = useNavigation()
	const { colorScheme } = useColorScheme()
	const isDark = colorScheme === 'dark'

	const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } =
		useCameraPermission()
	const [mediaLibraryPermission, requestMediaLibraryPermission] = ExpoMediaLibrary.usePermissions()

	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	const handleCameraToggle = async (request: boolean) => {
		if (request) await requestCameraPermission()
	}

	const handleMediaLibraryToggle = async (request: boolean) => {
		if (request) await requestMediaLibraryPermission()
	}

	const handleBackNavigationUrl = () => {
		if (currentResource.id.length > 10 && currentResource.name === ResourceName.SHIPMENT) {
			return '/(aux)/trades/transit/registration'
		} else if (currentResource.id.length > 10 && currentResource.name === ResourceName.FARMER) {
			return '/(aux)/actors/farmer'
		} else if (currentResource.id.length > 10 && currentResource.name === ResourceName.GROUP) {
			return '/(aux)/actors/organization'
		} else if (currentResource.id.length > 10 && currentResource.name === ResourceName.TRADER) {
			return '/(aux)/actors/trader'
		}
		return '/(tabs)'
	}

	const allGranted =
		hasCameraPermission && (mediaLibraryPermission?.granted ?? false)

	useHeaderOptions({}, 'Permissões');
	useEffect(() => {
		
		const backNavigationUrl = handleBackNavigationUrl()
		navigation.setOptions({
			headerLeft: () => <BackButton route={backNavigationUrl as RelativePathString} />,
		})
	}, [ addActionType, currentResource.id, currentResource.name ])

	const handleContinue = () => {
		if (allGranted) {
			router.navigate('/(aux)/native-features/camera' as Href)
			return
		}

		setErrorMessage('Pretende continuar sem permissões?')
		setHasError(true)
	}

	const handleContinueWithoutPermissions = () => {
		setHasError(false)
		setErrorMessage('')
		const backNavigationUrl = handleBackNavigationUrl()
		router.navigate(backNavigationUrl as Href)
	}

	const handleDismissDialog = () => {
		setHasError(false)
		setErrorMessage('')
	}

	return (
		<CustomSafeAreaView edges={['bottom']}>
			<View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#fff' }]}>
				<ScrollView
					style={styles.scroll}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View>
						<View style={styles.heroSection}>
							<HeroCard
								title="MyCoop"
								description="A MyCoop solicita permissões para funcionar correctamente."
							/>
						</View>



						<View style={styles.permissionsList}>
							<PermissionSwitch
								icon="camera-outline"
								title="Câmara"
								description="Permitir que a MyCoop tire fotos"
								value={hasCameraPermission}
								onValueChange={handleCameraToggle}
							/>

							<PermissionSwitch
								icon="image-outline"
								title="Galeria"
								description="Permitir que a MyCoop aceda à galeria de fotos"
								value={mediaLibraryPermission?.granted ?? false}
								onValueChange={handleMediaLibraryToggle}
							/>
						</View>
					</View>
					<View className="flex-1 justify-end pb-10">

				<View>
					<TouchableOpacity
						style={[styles.continueButton, allGranted && styles.continueButtonActive]}
						onPress={handleContinue}
						activeOpacity={0.8}
						>
						<Text
							style={[
								styles.continueButtonText,
								{ color: allGranted ? '#fff' : colors.gray800 },
							]}
							>
							Continuar
						</Text>
						<Ionicons
							name="arrow-forward"
							size={20}
							color={allGranted ? '#fff' : colors.gray800}
							/>
					</TouchableOpacity>
				</View>
							</View>
				</ScrollView>

			</View>

			<CustomConfirmDialg
				title="Permissões"
				visible={hasError}
				setVisible={() => setHasError(false)}
				message={errorMessage}
				yesText="Sim, continuar"
				noText="Não"
				yesCallback={handleContinueWithoutPermissions}
				noCallback={handleDismissDialog}
			/>
		</CustomSafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 24,
	},
	heroSection: {
		marginBottom: 40,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: '600',
		// textTransform: 'uppercase',
		letterSpacing: 1,
		marginBottom: 16,
	},
	permissionsList: {
		gap: 12,
	},
	permissionCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderRadius: 12,
	},
	permissionIcon: {
		width: 44,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 16,
	},
	permissionContent: {
		flex: 1,
	},
	permissionTitle: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 2,
	},
	permissionDescription: {
		fontSize: 13,
	},
	footer: {
		paddingHorizontal: 20,
		paddingBottom: 34,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: 'rgba(100, 116, 139, 0.2)',
	},
	continueButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		paddingVertical: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.gray600,
	},
	continueButtonActive: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	continueButtonText: {
		fontSize: 14,
		fontWeight: '500',
	},
})
