import * as ImagePicker from 'expo-image-picker'
import { Alert } from 'react-native'

export const pickImageFromGallery = async () => {
	try {
		await ImagePicker.requestMediaLibraryPermissionsAsync()
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: false,
			quality: 1,
			base64: true,
		})
		if (!result.canceled) {
			return `data:image/jpeg;base64,${result.assets[0].base64}`
		}
	} catch (error) {
		Alert.alert('Erro', 'Erro ao carregar a foto, tente mais tarde.')
		console.log('ImagePicker:', error)
		throw error
	}
}
