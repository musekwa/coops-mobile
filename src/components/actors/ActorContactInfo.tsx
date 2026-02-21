import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import CapturingCoordinates from '../location/CapturingCoordinates'
import * as Location from 'expo-location'
import CustomConfirmDialog from '../modals/CustomConfirmDialog'
import ErrorAlert from '../dialogs/ErrorAlert'
import { Linking } from 'react-native'
import { useAddressById, useUserDetails, useContactById } from 'src/hooks/queries'
import { getDistrictById } from 'src/library/sqlite/selects'

interface ActorContactInfoProps {
	contact_id: string
	address_id: string
}

export default function ActorContactInfo({ contact_id, address_id }: ActorContactInfoProps) {
	const { primaryPhone, secondaryPhone } = useContactById(contact_id)
	const { districtName, lat, long } = useAddressById(address_id)
	const [userDistrictName, setUserDistrictName] = useState<string | null>(null)
	const [showCapturingCoordinatesDialog, setShowCapturingCoordinatesDialog] = useState(false)
	const [showErrorAlert, setShowErrorAlert] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [status, requestPermission] = Location.useForegroundPermissions()
	const [hasPermissionError, setHasPermissionError] = useState(false)
	const { userDetails } = useUserDetails()

	useEffect(() => {
		if (userDetails?.district_id) {
			getDistrictById(userDetails.district_id).then((district) => {
				setUserDistrictName(district)
			})
		}
	}, [userDetails?.district_id])

	const captureLocation = async () => {
		if (userDistrictName !== districtName) {
			setHasPermissionError(true)
			setErrorMessage('Não é possível capturar a localização de um recurso que não está no mesmo distrito')
			return
		}
		try {
			if (!status?.granted) {
				const permission = await requestPermission()
				if (!permission.granted) {
					setShowErrorAlert(true)
					setErrorMessage('Permissão de localização negada')
					return
				}
			}
			setShowCapturingCoordinatesDialog(true)
		} catch (err) {
			setShowErrorAlert(true)
			setErrorMessage('Erro ao solicitar permissão de localização')
		}
	}

	const hasGPSCoordinates = Number(lat) && Number(long)
	const hasPermissionToCaptureLocation = userDistrictName === districtName

	return (
		<>
			<View className="flex flex-col space-y-2 py-3">
				<View className="flex flex-row space-x-1 items-center">
					<TouchableOpacity
						className="flex flex-row space-x-1 items-center"
						onPress={() => Linking.openURL(`tel:${primaryPhone ?? secondaryPhone ?? 'N/A'}`)}
					>
						<Feather name="phone" size={15} color={colors.primary} />
						<Text className="text-[12px] text-black dark:text-white">{primaryPhone ?? secondaryPhone ?? 'N/A'}</Text>
					</TouchableOpacity>
				</View>

				{hasPermissionToCaptureLocation && (
					<TouchableOpacity
						onPress={captureLocation}
						className={`rounded-lg flex flex-row items-center space-x-2 ${
							hasGPSCoordinates ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/20'
						}`}
					>
						<Ionicons
							name={hasGPSCoordinates ? 'location' : 'location-outline'}
							size={20}
							color={hasGPSCoordinates ? colors.primary : colors.gray600}
						/>

						<View className="">
							<Text className="text-[12px] font-normal text-black dark:text-white">{districtName}</Text>

							{hasGPSCoordinates ? (
								<Text className="text-xs text-gray-600 dark:text-gray-300">
									{Number(lat).toFixed(6)}, {Number(long).toFixed(6)}
								</Text>
							) : (
								<Text className="text-xs text-gray-500 dark:text-gray-400 italic">Capture a localização</Text>
							)}
						</View>
						{!hasGPSCoordinates && <Ionicons name="add-circle-outline" size={20} color={colors.primary} />}
					</TouchableOpacity>
				)}
			</View>

			<CustomConfirmDialog
				showConfirmDialog={showCapturingCoordinatesDialog}
				setShowConfirmDialog={setShowCapturingCoordinatesDialog}
				title={''}
				content={
					address_id ? (
						<CapturingCoordinates
							errorMessage={errorMessage}
							showErrorAlert={showErrorAlert}
							setShowErrorAlert={setShowErrorAlert}
							setErrorMessage={setErrorMessage}
							address_id={address_id || ''}
							setShowCapturingCoordinatesDialog={setShowCapturingCoordinatesDialog}
						/>
					) : (
						'Não foi especificado o tipo de recurso  que se pretende localizar'
					)
				}
			/>
			<ErrorAlert
				visible={hasPermissionError}
				setVisible={setHasPermissionError}
				message={errorMessage}
				setMessage={setErrorMessage}
				title=""
			/>
		</>
	)
}
