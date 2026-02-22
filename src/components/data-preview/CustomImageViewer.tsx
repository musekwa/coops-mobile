import { View, Text, TouchableOpacity, View as RNView, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import ImageViewer from 'react-native-image-zoom-viewer'
import Modal from 'react-native-modal'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import Spinner from '../loaders/Spinner'
import { colors } from 'src/constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useActionStore } from 'src/store/actions/actions'
import { Href, useRouter } from 'expo-router'
import { ActionType, ResourceName } from 'src/types'
import ErrorAlert from '../dialogs/ErrorAlert'
import { ActorDetailRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { updateOne } from 'src/library/powersync/sql-statements'
import { useShipmentLicenseStore } from 'src/store/shipment/shipment_license'

function ImageWithLoader({ source, style }: { source: { uri?: string }; style: any }) {
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
	const insets = useSafeAreaInsets()
	const { resetBase64, base64, currentResource, addActionType } = useActionStore()
	const { setShipmentLicenseInfo } = useShipmentLicenseStore()
	const router = useRouter()
	const [hasError, setHasError] = useState(false)
	const [message, setMessage] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)

	const handleClose = () => {
		if (!isSaving) setVisible(false)
	}

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
		setIsSaving(true)
		try {
			if (currentResource.id.length > 10 && currentResource.name === ResourceName.SHIPMENT) {
				setShipmentLicenseInfo(images[currentIndex]?.uri ?? images[0].uri, 'photoUrl')
				router.navigate('/(aux)/trades/transit/registration')
			} else if (currentResource.id.length > 10 && currentResource.name === ResourceName.FARMER) {
				if (images.length > 0) {
					await updateOne<ActorDetailRecord>(
						`UPDATE ${TABLES.ACTOR_DETAILS} SET photo = ?, updated_at = ? WHERE actor_id = ?`,
						[images[currentIndex]?.uri ?? images[0].uri, new Date().toISOString(), currentResource.id],
					)
					resetBase64()
				}
				setTimeout(() => {
					router.navigate(`/(aux)/actors/farmer` as Href)
				}, 2000)
			} else if (currentResource.id.length > 10 && currentResource.name === ResourceName.GROUP) {
				router.navigate(`/(aux)/actors/organization` as Href)
			} else if (currentResource.id.length > 10 && currentResource.name === ResourceName.TRADER) {
				router.navigate(`/(aux)/actors/trader` as Href)
			}
			else {
				router.back()
			}
			setVisible(false)
		} catch (error) {
			setHasError(true)
			setMessage('Erro ao adicionar a foto')
		} finally {
			setIsSaving(false)
		}
	}

	const isPreviewOnly = addActionType === ActionType.PREVIEW_IMAGE
	const showMultipleImages = images.length > 1

	return (
		<Modal
			isVisible={visible}
			style={styles.fullScreen}
			animationIn="fadeIn"
			animationOut="fadeOut"
			onBackButtonPress={handleClose}
			onBackdropPress={isPreviewOnly ? handleClose : undefined}
		>
			<ImageViewer
				imageUrls={images.map((image) => ({ url: image.uri }))}
				index={0}
				enableImageZoom={true}
				enablePreload={true}
				useNativeDriver={true}
				renderImage={(props) => <ImageWithLoader source={props.source} style={props.style} />}
				enableSwipeDown={true}
				saveToLocalByLongPress={false}
				loadingRender={() => <Spinner />}
				onSwipeDown={handleClose}
				onChange={(index) => setCurrentIndex(index ?? 0)}
			/>

			{/* Top bar: image counter + close button */}
			<View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
				{showMultipleImages ? (
					<Text style={styles.counter}>
						{currentIndex + 1} / {images.length}
					</Text>
				) : (
					<View />
				)}
				<View style={styles.topBarSpacer} />
				<TouchableOpacity
					onPress={handleClose}
					style={styles.closeButton}
					activeOpacity={0.7}
					hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
					accessibilityLabel="Fechar"
					accessibilityRole="button"
				>
					<Ionicons name="close" size={28} color="#fff" />
				</TouchableOpacity>
			</View>

			{/* Bottom action buttons */}
			<View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
				{!isPreviewOnly ? (
					<View style={styles.buttonRow}>
						<TouchableOpacity
							onPress={handleCancel}
							disabled={isSaving}
							style={styles.cancelButton}
							activeOpacity={0.7}
							hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
							accessibilityLabel="Cancelar"
							accessibilityRole="button"
						>
							<Text style={styles.cancelButtonText}>Cancelar</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={handleConfirm}
							disabled={isSaving}
							style={[styles.confirmButton, isSaving && styles.confirmButtonDisabled]}
							activeOpacity={0.7}
							hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
							accessibilityLabel={isSaving ? 'A gravar' : 'Gravar'}
							accessibilityRole="button"
						>
							{isSaving ? (
								<ActivityIndicator size="small" color="#fff" />
							) : (
								<Text style={styles.confirmButtonText}>Gravar</Text>
							)}
						</TouchableOpacity>
					</View>
				) : (
					<TouchableOpacity
						onPress={handleConfirm}
						style={styles.confirmButton}
						activeOpacity={0.7}
						hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
						accessibilityLabel="OK"
						accessibilityRole="button"
					>
						<Text style={styles.confirmButtonText}>OK</Text>
					</TouchableOpacity>
				)}
			</View>

			<ErrorAlert message={message} setMessage={setMessage} setVisible={setHasError} visible={hasError} title="" />
		</Modal>
	)
}

const styles = StyleSheet.create({
	fullScreen: {
		flex: 1,
		backgroundColor: colors.black,
		margin: 0,
	},
	topBar: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		zIndex: 10,
	},
	topBarSpacer: {
		flex: 1,
	},
	counter: {
		fontSize: 14,
		color: 'rgba(255,255,255,0.9)',
		fontWeight: '500',
	},
	closeButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: 'rgba(0,0,0,0.4)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	bottomBar: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		alignItems: 'center',
		paddingHorizontal: 16,
		zIndex: 10,
	},
	buttonRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
		width: '100%',
		maxWidth: 320,
	},
	cancelButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		minWidth: 100,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 24,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.5)',
		backgroundColor: 'rgba(255,255,255,0.1)',
	},
	cancelButtonText: {
		fontSize: 15,
		color: '#fff',
		fontWeight: '600',
	},
	confirmButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		minWidth: 100,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 24,
		backgroundColor: colors.primary,
	},
	confirmButtonDisabled: {
		opacity: 0.7,
	},
	confirmButtonText: {
		fontSize: 15,
		color: '#fff',
		fontWeight: '600',
	},
})
