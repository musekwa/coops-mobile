import { View, Text } from 'react-native'
import React, { useState } from 'react'
import ImageViewer from 'react-native-image-zoom-viewer'
import Modal from 'react-native-modal'
import { Image } from 'expo-image'
import Spinner from '../loaders/Spinner'
import { TouchableOpacity, View as RNView } from 'react-native'
import { StyleSheet } from 'react-native'
import { colors } from 'src/constants'
import { useActionStore } from 'src/store/actions/actions'
import { Href, useRouter } from 'expo-router'
import { ActionType, ResourceName } from 'src/types'
import ErrorAlert from '../dialogs/ErrorAlert'
import { ActorDetailRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { updateOne } from 'src/library/powersync/sql-statements'
import { useShipmentLicenseStore } from 'src/store/shipment/shipment_license'

const renderImage = ({ source, style }: { source: any; style: any }) => {
	const [isLoading, setIsLoading] = useState(true)

	return (
		<RNView style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
			{isLoading && (
				<RNView style={{ position: 'absolute', zIndex: 1 }}>
					<Spinner />
				</RNView>
			)}
			<Image
				source={{ uri: source?.uri }}
				style={style}
				contentFit="contain"
				onLoadStart={() => setIsLoading(true)}
				onLoadEnd={() => setIsLoading(false)}
			/>
		</RNView>
	)
}

export default function CustomImageViewer({
	images,
	visible,
	setVisible,
}: {
	images: { uri: string }[]
	visible: boolean
	setVisible: (v: boolean) => void
}) {
	const { resetBase64, base64, currentResource, addActionType } = useActionStore()
	const { setShipmentLicenseInfo } = useShipmentLicenseStore()
	const router = useRouter()
	const [hasError, setHasError] = useState(false)
	const [message, setMessage] = useState('')

	const handleCancel = () => {
		if (addActionType === ActionType.PREVIEW_IMAGE) {
			setVisible(false)
			return
		}
		if (base64) {
			resetBase64()
			router.back()
			setVisible(false)
		}
	}

	const handleConfirm = async () => {
		if (addActionType === ActionType.PREVIEW_IMAGE) {
			setVisible(false)
			return
		}
		// If the action type is to add a transit license image, navigate back to the shipment registration page after adding the image
		if (addActionType === ActionType.ADD_TRANSIT_LICENSE_IMAGE && currentResource.name === ResourceName.UNKNOWN) {
			setShipmentLicenseInfo(images[0].uri, 'photoUrl')
			router.navigate('/(aux)/trades/transit/registration')
		} else if (currentResource.id.length > 10 && currentResource.name !== ResourceName.UNKNOWN) {
			resetBase64()
			try {
				if (images.length > 0) {
					// All actor types (FARMER, TRADER, GROUP) now use ACTOR_DETAILS
					await updateOne<ActorDetailRecord>(
						`UPDATE ${TABLES.ACTOR_DETAILS} SET photo = ?, updated_at = ? WHERE actor_id = ?`,
						[images[0].uri, new Date().toISOString(), currentResource.id],
					)
					console.log('Photo saved')
				}

				setTimeout(() => {
					router.navigate(`/(aux)/actors/${currentResource.name.toLowerCase()}` as Href)
				}, 3000)
			} catch (error) {
				setHasError(true)
				setMessage('Erro ao adicionar a foto')
			}
		}
		setVisible(false)
	}

	return (
		<Modal visible={visible} transparent={true} style={styles.fullScreen} onRequestClose={() => setVisible(false)}>
			<ImageViewer
				imageUrls={images.map((image) => ({ url: image.uri }))}
				index={0}
				enableImageZoom={true}
				enablePreload={true}
				useNativeDriver={true}
				renderImage={renderImage}
				enableSwipeDown={true}
				saveToLocalByLongPress={false}
				loadingRender={() => <Spinner />}
				onSwipeDown={() => setVisible(false)}
			/>
			{addActionType !== ActionType.PREVIEW_IMAGE ? (
				<View className="absolute bottom-4 left-1 right-1 items-center my-2 flex flex-row justify-around">
					<TouchableOpacity
						className="rounded-full w-[100px] px-3 items-center p-2 border border-white"
						onPress={handleCancel}
					>
						<Text className="text-[15px] text-white font-semibold">Cancelar</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={handleConfirm}
						className="rounded-full px-3 p-2 bg-[#008000] items-center  w-[100px]"
					>
						<Text className="text-[15px] text-white font-semibold">Gravar</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View className="absolute bottom-4 left-1 right-1 items-center my-2 flex flex-row justify-around">
					<TouchableOpacity
						onPress={handleConfirm}
						className="rounded-full px-3 p-2 bg-[#008000] items-center  w-[100px]"
					>
						<Text className="text-[15px] text-white font-semibold">OK</Text>
					</TouchableOpacity>
				</View>
			)}
			<ErrorAlert message={message} setMessage={setMessage} setVisible={setHasError} visible={hasError} title="" />
		</Modal>
	)
}

const styles = StyleSheet.create({
	fullScreen: {
		backgroundColor: colors.black,
	},
})
