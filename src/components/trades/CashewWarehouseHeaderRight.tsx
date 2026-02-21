import { useColorScheme } from 'nativewind'
import React, { useCallback, useEffect, useState } from 'react'
import { translateWarehouseTypeToPortuguese } from 'src/helpers/helpersToTrades'
import { CashewWarehouseType } from 'src/types'
import CustomPopUpMenu from '../menus/CustomPopUpMenu'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import CustomConfirmDialg from '../dialogs/CustomConfirmDialg'
import ErrorAlert from '../dialogs/ErrorAlert'
import * as Location from 'expo-location'
import { useAddressById, useUserDetails } from 'src/hooks/queries'
import CustomConfirmDialog from '../modals/CustomConfirmDialog'
import CapturingCoordinates from '../location/CapturingCoordinates'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { updateOne } from 'src/library/powersync/sql-statements'
import { getDistrictById } from 'src/library/sqlite/selects'

interface CashewWarehouseHeaderRightProps {
	warehouse: {
		id: string
		description: string
		warehouse_type: string
		is_active: string
		owner_id: string
		address_id: string
	} | null
	currentStock: number
}

export default function CashewWarehouseHeaderRight({ warehouse, currentStock }: CashewWarehouseHeaderRightProps) {
	const { userDetails } = useUserDetails()
	const isDarkMode = useColorScheme().colorScheme == 'dark'
	const [showConfirmDialog, setShowConfirmDialog] = useState(false)
	const [showErrorAlert, setShowErrorAlert] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [showCapturingCoordinatesDialog, setShowCapturingCoordinatesDialog] = useState(false)
	const [status, requestPermission] = Location.useForegroundPermissions()
	const { districtName, lat, long } = useAddressById(warehouse?.address_id || '')
	const [userDistrictName, setUserDistrictName] = useState('')
	const hasGeoCoordinates = !!lat && !!long
	const warehouseType =
		warehouse &&
		translateWarehouseTypeToPortuguese(warehouse.warehouse_type as CashewWarehouseType)
			.toLowerCase()
			.split(' ')[0]

	const message =
		warehouse?.is_active === 'true'
			? `Tem certeza de que pretende encerrar este ${warehouseType}?`
			: `Tem certeza de que pretende reabrir ${warehouseType}?`
	const title = warehouse?.is_active === 'true' ? `Encerramento de ${warehouseType}` : `Reabertura de ${warehouseType}`

	const rejectAction = (message: string) => {
		setShowConfirmDialog(false)
		setShowErrorAlert(true)
		setErrorMessage(message)
		setTimeout(() => {
			setShowErrorAlert(true)
		}, 0)
	}

	const handleClosingWarehouse = useCallback(async () => {
		if (warehouse) {
			if (districtName !== userDistrictName) {
				rejectAction(`Não tem autorização para alterar o estado deste ${warehouseType}`)
				return
			}

			if (currentStock > 100 && warehouse.is_active === 'true') {
				rejectAction(`Não pode encerrar o ${warehouseType} cujo estoque disponível é superior a 100 kg.`)
				return
			}

			// update the warehouse status
			await updateOne(`UPDATE ${TABLES.WAREHOUSE_DETAILS} SET is_active = ? , updated_at = ? WHERE id = ?`, [
				warehouse.is_active === 'true' ? 'false' : 'true',
				new Date().toISOString(),
				warehouse.id,
			])

			setShowConfirmDialog(false)
		}
	}, [warehouse, currentStock, userDetails, warehouseType])

	const captureLocation = async () => {
		if (districtName !== userDistrictName) {
			rejectAction(`Não tem autorização para alterar a localização deste ${warehouseType}`)
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

	useEffect(() => {
		if (userDetails) {
			const fetchDistrictName = async () => {
				const districtName = await getDistrictById(userDetails.district_id || '')
				setUserDistrictName(districtName || '')
			}
			fetchDistrictName()
		}
	}, [userDetails])

	return (
		<>
			<CustomPopUpMenu
				options={[
					{
						label: warehouse?.is_active === 'true' ? `Encerrar ${warehouseType}` : `Reabrir ${warehouseType}`,
						icon: <Ionicons name="lock-closed-outline" size={18} color={isDarkMode ? colors.white : colors.black} />,
						action: () => warehouse && setShowConfirmDialog(true),
					},
					{
						label: hasGeoCoordinates ? 'Actualizar localização' : 'Capturar localização',
						icon: <Ionicons name="location-outline" size={18} color={isDarkMode ? colors.white : colors.black} />,
						action: () => captureLocation(),
					},
				]}
			/>
			<CustomConfirmDialg
				visible={showConfirmDialog}
				setVisible={setShowConfirmDialog}
				yesCallback={handleClosingWarehouse}
				noCallback={() => setShowConfirmDialog(false)}
				yesText="Sim"
				noText="Não"
				message={message}
				title={title}
			/>

			<ErrorAlert
				visible={showErrorAlert}
				setVisible={setShowErrorAlert}
				setMessage={setErrorMessage}
				message={errorMessage}
				title=""
			/>

			<CustomConfirmDialog
				showConfirmDialog={showCapturingCoordinatesDialog}
				setShowConfirmDialog={setShowCapturingCoordinatesDialog}
				title={''}
				content={
					warehouse ? (
						<CapturingCoordinates
							errorMessage={errorMessage}
							showErrorAlert={showErrorAlert}
							setShowErrorAlert={setShowErrorAlert}
							setErrorMessage={setErrorMessage}
							address_id={warehouse.address_id}
							setShowCapturingCoordinatesDialog={setShowCapturingCoordinatesDialog}
						/>
					) : (
						'Não foi especificado o tipo de recurso  que se pretende localizar'
					)
				}
			/>
		</>
	)
}
