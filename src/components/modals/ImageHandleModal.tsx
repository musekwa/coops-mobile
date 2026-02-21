import { View, Text } from 'react-native'
import React from 'react'
import { Dialog } from 'react-native-simple-dialogs'
import {  Feather, MaterialIcons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import * as ImagePicker from 'expo-image-picker'
import { Alert } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { useColorScheme } from 'nativewind'
import { useRouter } from 'expo-router'
import { useCameraPermission } from 'react-native-vision-camera'

type ImageHandleModalProps = {
	showImageHandleModal: boolean
	setShowImageHandleModal: (show: boolean) => void
	title?: string
	savePhoto: (image: string) => void
	deletePhoto: () => void
}
export default function ImageHandleModal({
	showImageHandleModal,
	setShowImageHandleModal,
	title,
	savePhoto,
	deletePhoto,
}: ImageHandleModalProps) {
	const { colorScheme } = useColorScheme()
	const { hasPermission } = useCameraPermission()
	const router = useRouter()

	const uploadPhoto = async (mode: string) => {
		try {
			if (mode === 'gallery') {
				await ImagePicker.requestMediaLibraryPermissionsAsync()
				const result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images,
					allowsEditing: true,
					aspect: [4, 3],
					quality: 1,
					base64: true,
				})
				if (!result.canceled) {
					// get the base64 string and save it
					await savePhoto(`data:image/jpeg;base64,${result.assets[0].base64}`)
					setShowImageHandleModal(false)
				}
			}
		} catch (error) {
			Alert.alert('Erro', 'Erro ao carregar a foto, tente mais tarde.')
			setShowImageHandleModal(false)
			console.log('ImagePicker:', error)
			throw error
		}
	}

	const navigateToCamera = () => {
		if (!hasPermission) {
			router.push('/(aux)/device-features/device-permissions')
			return
		}
		router.push('/(aux)/device-features/camera')
		setShowImageHandleModal(false)
	}

	return (
		<Dialog
			statusBarTranslucent={true}
			animationType={'fade'}
			visible={showImageHandleModal}
			onTouchOutside={() => setShowImageHandleModal(false)}
			onRequestClose={() => setShowImageHandleModal(false)}
			contentInsetAdjustmentBehavior={'automatic'}
			dialogStyle={{ borderRadius: 10, backgroundColor: colorScheme === 'dark' ? colors.gray800 : 'white' }}
		>
			<View className="flex space-y-6 justify-center bg-white dark:bg-gray-600">
				<Text className="text-black text-center dark:text-white font-bold text-[14px]">{title}</Text>
				<View className="flex flex-row justify-around">
					<View className="items-center justify-center">
						<TouchableOpacity
							onPress={navigateToCamera}
							className="p-3 rounded-full bg-slate-300 flex items-center justify-center dark:bg-gray-400"
						>
							<Feather name="camera" size={24} color={colors.primary} />
						</TouchableOpacity>

						<Text className="text-[10px] italic text-gray-600 dark:text-white">Câmera</Text>
					</View>
					<View className="items-center justify-center">
						<TouchableOpacity
							onPress={() => uploadPhoto('gallery')}
							activeOpacity={0.7}
							className="p-3 rounded-full bg-slate-300 flex items-center justify-center  dark:bg-gray-400"
						>
							<MaterialIcons name="photo-library" size={24} color={colors.primary} />
						</TouchableOpacity>
						<Text className="text-[10px] italic text-gray-600 dark:text-white">Galeria</Text>
					</View>

					{/* <View className="items-center justify-center">
						<TouchableOpacity 
						onPress={deletePhoto}
						activeOpacity={0.7}
						className="p-3 rounded-full bg-slate-300 flex items-center justify-center  dark:bg-black">
							<AntDesign name="delete" size={24} color={colors.primary} />
						</TouchableOpacity>
						<Text className="text-xs text-gray-600 dark:text-white">Apagar</Text>
					</View> */}
				</View>
			</View>
		</Dialog>
	)
}
