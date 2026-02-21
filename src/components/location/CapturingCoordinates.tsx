import { View, Text, ScrollView, ImageBackground } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator } from 'react-native-paper'
import * as Location from 'expo-location'

import ConfirmOrCancelButtons from '../buttons/ConfirmOrCancelButtons'
import SuccessAlert from '../dialogs/SuccessAlert'
import { colors } from 'src/constants'
import { mozMapPatternUri } from 'src/constants/imageURI'
import { AddressDetailRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { updateOne } from 'src/library/powersync/sql-statements'
interface CapturingCoordinatesProps {
	setShowCapturingCoordinatesDialog: (show: boolean) => void
	setShowErrorAlert: (show: boolean) => void
	setErrorMessage: (message: string) => void
	showErrorAlert: boolean
	errorMessage: string
	address_id: string
}

const LocationDisplay = ({ location }: { location: Location.LocationObject }) => (
	<View className="flex flex-row items-center gap-2 bg-white rounded-lg p-2 opacity-100">
		<Ionicons name="location-outline" size={24} color={colors.primary} />
		<Text className="text-black dark:text-black text-[14px] font-medium">
			Lat: {location.coords.latitude}
			{'\n'}
			Lng: {location.coords.longitude}
		</Text>
	</View>
)

const WaitingDisplay = () => (
	<View className="flex flex-row items-center gap-3 p-4">
		<Ionicons name="navigate-outline" size={24} color={colors.gray600} />
		<View>
			<Text className="text-gray-700 dark:text-gray-300 font-medium mb-1">
				Pronto para capturar sua localização
			</Text>
			<Text className="text-gray-500 dark:text-gray-400 text-sm">
				Clique em "Capturar" para obter suas coordenadas GPS
			</Text>
		</View>
	</View>
)

const ErrorDisplay = ({ message }: { message: string }) => (
	<View className="flex flex-row items-center gap-2">
		<Ionicons name="warning-outline" size={24} color={colors.red} />
		<Text className="text-red-500">{message}</Text>
	</View>
)

export default function CapturingCoordinates({
	setShowCapturingCoordinatesDialog,
	setShowErrorAlert,
	setErrorMessage,
	showErrorAlert,
	errorMessage,
	address_id,
}: CapturingCoordinatesProps) {
	const [status, requestPermission] = Location.useForegroundPermissions()
	const [location, setLocation] = useState<Location.LocationObject | null>(null)
	const [isCapturing, setIsCapturing] = useState(false)
	const [hasSavedCoordinates, setHasSavedCoordinates] = useState(false)

	const handleError = (message: string) => {
		setShowErrorAlert(true)
		setErrorMessage(message)
	}

	const saveCoordinates = async () => {
		if (!location) return

		try {
			await updateOne<AddressDetailRecord>(`UPDATE ${TABLES.ADDRESS_DETAILS} SET gps_lat = ?, gps_long = ? WHERE id = ?`, [String(location.coords.latitude), String(location.coords.longitude), address_id])
			setHasSavedCoordinates(true)
		} catch (error) {
			handleError('Erro ao gravar coordenadas')
		}
	}

	const captureLocation = async () => {
		setIsCapturing(true)
		try {
			if (!status?.granted) {
				const permission = await requestPermission()
				if (!permission.granted) {
					handleError('Permissão de localização negada')
					return
				}
			}

			const currentLocation = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.High,
			})
			setLocation(currentLocation)
		} catch (err) {
			handleError('Erro ao capturar localização')
		}
		setIsCapturing(false)
	}

	const handleConfirm = () => {
		location ? saveCoordinates() : captureLocation()
	}

	useEffect(() => {
		if (hasSavedCoordinates) {
			const timer = setTimeout(() => {
				setShowCapturingCoordinatesDialog(false)
				setHasSavedCoordinates(false)
			}, 1000)
			return () => clearTimeout(timer)
		}
	}, [hasSavedCoordinates])

	const renderContent = () => {
		if (showErrorAlert) return <ErrorDisplay message={errorMessage} />
		if (location) return <LocationDisplay location={location} />
		if (isCapturing) return <ActivityIndicator size="large" color={colors.primary} />
		return <WaitingDisplay />
	}

	return (
		<View className="h-[350px] bg-white rounded-lg dark:bg-gray-800 overflow-hidden">
			<ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white dark:bg-gray-800">
				<View className="flex flex-col justify-center items-center">
					<Text className="text-[14px] font-bold text-center py-2 text-gray-700 dark:text-gray-300">
						{!location ? 'Capturar coordenadas' : 'Coordenadas capturadas'}
					</Text>
				</View>
				{!hasSavedCoordinates ? (
					<ImageBackground 
						source={{ uri: mozMapPatternUri }} 
						className="h-full w-full opacity-50 rounded-lg"
					>
						<View className="flex-1 flex flex-row justify-center items-center">
							{renderContent()}
						</View>
					</ImageBackground>
				) : (
					<View className="flex-1 flex flex-row justify-center items-center">
						<SuccessAlert
							visible={hasSavedCoordinates}
							setVisible={setHasSavedCoordinates}
						/>
					</View>
				)}
			</ScrollView>
			<ConfirmOrCancelButtons
				onCancel={() => setShowCapturingCoordinatesDialog(false)}
				onConfirm={handleConfirm}
				cancelText="Cancelar"
				confirmText={location ? 'Gravar' : 'Capturar'}
			/>
		</View>
	)
}
