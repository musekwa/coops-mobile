import { View, Text } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { cn } from 'src/utils/tailwind'
import FormItemDescription from '../FormItemDescription'
import { TouchableOpacity } from 'react-native'
import Label from '../Label'
import { useColorScheme } from 'nativewind'
import { ActionType } from 'src/types'
import { useActionStore } from 'src/store/actions/actions'
import { pickImageFromGallery } from 'src/helpers/pickImageFromGallery'
import { colors } from 'src/constants'
import { useRouter } from 'expo-router'
import { useCameraPermission } from 'react-native-vision-camera'
import { useShipmentLicenseStore } from 'src/store/shipment/shipment_license'

interface AddLicensePhotoProps {
	setHasError: (hasError: boolean) => void
	setMessage: (message: string) => void
}

export default function AddLicensePhoto({
	setHasError,
	setMessage,
}: AddLicensePhotoProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const { resetBase64, resetCurrentResource, setAddActionType } = useActionStore()

	const { shipmentLicenseInfo, setShipmentLicenseInfo } = useShipmentLicenseStore()
	const { hasPermission } = useCameraPermission()
	const router = useRouter()

	const uploadPhoto = async (mode: 'gallery') => {
		resetBase64()
		setShipmentLicenseInfo('', 'photoUrl')
		try {
			const base64 = await pickImageFromGallery()
			if (!base64) return
			setShipmentLicenseInfo(base64, 'photoUrl')
			setShipmentLicenseInfo(mode, 'imageMode')
		} catch (error) {
			setHasError(true)
			setMessage('Erro ao carregar a foto, tente mais tarde.')
			throw error
		}
	}

	const takePhoto = async (mode: 'camera') => {
		setShipmentLicenseInfo('', 'photoUrl')
		setShipmentLicenseInfo(mode, 'imageMode')
		setAddActionType(ActionType.ADD_TRANSIT_LICENSE_IMAGE)
		// reset the current resourceName to focus on the ActionType only
		resetCurrentResource()
		if (!hasPermission) {
			router.push('/(aux)/native-features/device-permissions')
			return
		}
		resetBase64()
		router.push('/(aux)/native-features/camera')
	}

	return (
		<View>
			<Label label="Foto da Guia de Trânsito" />
			<View className="flex-row items-center justify-between">
				<View className="w-2/5">
					<TouchableOpacity
						activeOpacity={0.5}
						onPress={() => uploadPhoto('gallery')}
						className={cn(
							'relative flex-1 border  border-slate-300 bg-gray-50 dark:bg-black dark:border-white rounded-xl items-center justify-center h-[55px]',
						)}
					>
						<View
							className={cn('flex items-center justify-center', {
								'opacity-10': !!shipmentLicenseInfo.photoUrl && shipmentLicenseInfo.imageMode === 'gallery',
							})}
						>
							<Ionicons name="image-outline" size={24} color={isDarkMode ? colors.white : colors.black} />
							<Text className="text-[8px] text-black dark:text-white">Galeria</Text>
						</View>
						{!!shipmentLicenseInfo.photoUrl && shipmentLicenseInfo.imageMode === 'gallery' && (
							<View className="absolute inset-0 m-auto">
								<Ionicons name="checkmark-done-sharp" size={30} color={colors.primary} />
							</View>
						)}
					</TouchableOpacity>
					<FormItemDescription description="Da galeria" />
				</View>
				<View className="h-[55px] items-center justify-start">
					<Text className="text-gray-500 dark:text-gray-300 text-[14px]">ou</Text>
				</View>
				<View className="w-2/5">
					<TouchableOpacity
						activeOpacity={0.5}
						onPress={() => takePhoto('camera')}
						className={cn(
							'relative flex-1 border  border-slate-300 bg-gray-50 dark:bg-black dark:border-white rounded-xl items-center justify-center h-[55px]',
						)}
					>
						<View
							className={cn('flex items-center justify-center', {
								'opacity-10': !!shipmentLicenseInfo.photoUrl && shipmentLicenseInfo.imageMode === 'camera',
							})}
						>
							<Ionicons name="camera-outline" size={24} color={isDarkMode ? colors.white : colors.black} />
							<Text className="text-[8px] text-black dark:text-white">Câmara</Text>
						</View>
						{!!shipmentLicenseInfo.photoUrl && shipmentLicenseInfo.imageMode === 'camera' && (
							<View className="absolute inset-0 m-auto">
								<Ionicons name="checkmark-done-sharp" size={30} color={colors.primary} />
							</View>
						)}
					</TouchableOpacity>
					<FormItemDescription description="Da câmera" />
				</View>
			</View>
		</View>
	)
}
