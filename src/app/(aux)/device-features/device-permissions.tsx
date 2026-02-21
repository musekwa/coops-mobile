import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Camera, useCameraPermission } from 'react-native-vision-camera'
import * as ExpoMediaLibrary from 'expo-media-library'
import { StyleSheet } from 'react-native'
import { Stack, useNavigation, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Switch } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { colors } from 'src/constants'
import { useActionStore } from 'src/store/actions/actions'
import CustomConfirmDialg from 'src/components/dialogs/CustomConfirmDialg'
import FormItemDescription from 'src/components/forms/FormItemDescription'

type PermissionSwitchProps = {
	icon: keyof typeof Ionicons.glyphMap
	title: string
	description: string
	value: boolean
	onChange: () => void
}
const PermissionSwitch = ({ icon, title, description, value, onChange }: PermissionSwitchProps) => (
	<View className="bg-gray-50 dark:bg-slate-900 flex flex-row items-center space-x-1 rounded-md py-2">
		<View className="w-[50px]">
			<Ionicons name={icon} size={24} color="gray" />
		</View>
		<View className="flex-1">
			<Text className="text-black dark:text-white font-semibold">{title}</Text>
			<Text className="text-black dark:text-white text-xs">{description}</Text>
		</View>
		<View className="w-[50px]">
			<Switch trackColor={{ true: colors.primary }} value={value} onChange={onChange} />
		</View>
	</View>
)

export default function PermissionsScreen() {
	const { nextRoute } = useActionStore()
	const router = useRouter()
	const navigation = useNavigation()
	const { requestPermission } = useCameraPermission()
	const [cameraPermissionStatus, setCameraPermissionStatus] = React.useState<any>('not-determined')
	const [microphonePermissionStatus, setMicrophonePermissionStatus] = React.useState<any>('not-determined')
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	const [mediaLibraryPermission, requestMediaLibraryPermission] = ExpoMediaLibrary.usePermissions()

	const requirestMicrophonePermission = async () => {
		const permission = await Camera.requestMicrophonePermission()
		setMicrophonePermissionStatus(permission)
	}

	const requirestCameraPermission = async () => {
		const permission = await Camera.requestCameraPermission()
		setCameraPermissionStatus(permission)
	}

	const handleContinue = () => {
		if (
			cameraPermissionStatus !== 'granted' ||
			// microphonePermissionStatus !== 'granted' &&
			!mediaLibraryPermission?.granted
		) {
			setHasError(true)
			setErrorMessage('Pretende continuar sem permissões?')
			return
		}
		console.log('Continue')
		router.push('/(aux)/device-features/camera')
	}

	return (
		<>
			<Stack.Screen
				options={{
					headerTitle: 'Permissoes',
					headerShown: true,
					headerLeft: () => (
						<TouchableOpacity onPress={() => navigation.goBack()}>
							<Ionicons name="arrow-back" size={24} color={colors.primary} />
						</TouchableOpacity>
					),
				}}
			/>
			{/* Camera permission */}
			<View className="flex-1 px-3 bg-white dark:bg-black">
				<View className="flex-1 justify-center space-y-4">
					<View>
						<FormItemDescription description="Connect Caju solicita permissões para funcionar correctamente." />

						<View className="flex flex-row space-x-2 items-center py-2">
							<Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
							<Text className="text-xs text-black dark:text-white">Obrigatório</Text>
						</View>
					</View>
					<View style={styles.spacer} />
					<PermissionSwitch
						icon="camera-outline"
						title="Camera"
						description="Permite tirar fotos e gravar videos"
						value={cameraPermissionStatus === 'granted'}
						onChange={async () => await requirestCameraPermission()}
					/>
					<View style={styles.spacer} />
					{/* Microphone permission */}
					{/* <View style={StyleSheet.compose(styles.row, styles.permissionContainer)}>
					<Ionicons name="mic-circle-outline" size={26} color="gray" />
					<View style={styles.permissionText}>
						<Text style={styles.permissionText}>Microfone</Text>
						<Text style={styles.footnote}>Usado para gravacao de vídeos</Text>
					</View>
					<Switch
						trackColor={{ true: 'orange' }}
						value={microphonePermissionStatus === 'granted'}
						onChange={async ()=> await requirestMicrophonePermission()}
					/>
				</View> */}

					{/* Library permission */}
					<PermissionSwitch
						icon="image-outline"
						title="Galeria"
						description="Dá acesso à galeria de fotos, músicas e áudio."
						value={mediaLibraryPermission?.granted ?? false}
						onChange={async () => await requestMediaLibraryPermission()}
					/>

					<View style={styles.spacer} />
					<View style={styles.spacer} />
					<View style={styles.spacer} />

					<TouchableOpacity onPress={handleContinue} style={StyleSheet.compose(styles.row, styles.continueButton)}>
						<Ionicons name="arrow-forward-outline" size={26} color={colors.primary} />
					</TouchableOpacity>
				</View>
			</View>
			<CustomConfirmDialg
				title="Permissões"
				visible={hasError}
				setVisible={() => {
					setHasError(false)
					setErrorMessage('')
				}}
				yesCallback={() => {
					setHasError(false)
					setErrorMessage('')
					router.back()
				}}
				yesText="Sim"
				noText="Não"
				message={errorMessage}
				noCallback={() => {
					setHasError(false)
					setErrorMessage('')
				}}
			/>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// backgroundColor: '#fff',
		// alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},
	subtitle: {
		textAlign: 'center',
		fontSize: 16,
		fontWeight: 'bold',
	},
	footnote: {
		fontSize: 12,
		// fontWeight: 'bold',
		letterSpacing: 2,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	spacer: {
		marginVertical: 8,
	},
	permissionContainer: {
		backgroundColor: '#ffffff20',
		borderRadius: 10,
		padding: 10,
		justifyContent: 'space-between',
	},
	permissionText: {
		marginLeft: 12,
		flexShrink: 1,
		fontWeight: 'bold',
	},
	continueButton: {
		padding: 10,
		borderWidth: 2,
		borderColor: colors.primary,
		borderRadius: 50,
		alignSelf: 'center',
	},
})
