import { View, Text } from 'react-native'
import React from 'react'
import { Shipment } from 'src/models/shipment'
import ReportSectionHeader from '../trades/ReportSectionHeader'
import { colors } from 'src/constants'
import { Ionicons } from '@expo/vector-icons'

interface DistrictShipmentsReportPreviewProps {
	shipmentsByStatus: {
        ARRIVING: Shipment[],
        TRANSITING: Shipment[],
        DEPARTING: Shipment[],
    }
}

export default function DistrictShipmentsReportPreview({ shipmentsByStatus }: DistrictShipmentsReportPreviewProps) {


    const renderShipmentRow = (shipment: Shipment, index: number) => {
		const totalQuantity = shipment.transporters.reduce((sum, transporter) => sum + (transporter.quantity || 0), 0)
		const sortedChecks = [...shipment.checks].sort(
			(a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime(),
		)
		const arrivalCheck = sortedChecks.find((check) => check.place === shipment.destination)

		return (
			<View
				key={shipment._id}
				className="ml-4 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
			>
				{/* Header Section: Owner, Status & Quantity */}
				<View className="flex-row items-center justify-between mb-2">
					<View className="flex-1">
						<Text className="text-[14px] font-semibold text-gray-800 dark:text-gray-200">
							{index + 1}. {shipment.owner.name}
						</Text>
					</View>
					<View className="flex-col items-center gap-2">
						{arrivalCheck && (
							<View className="px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
								<Text className="text-[10px] font-medium text-green-700 dark:text-green-300">Chegou ao destino</Text>
							</View>
						)}
						<Text className="text-[14px] font-bold text-gray-700 dark:text-gray-300 min-w-[100px] text-right">
							{Intl.NumberFormat('pt-BR', {
								style: 'unit',
								unit: 'kilogram',
								unitDisplay: 'short',
							}).format(totalQuantity)}
						</Text>
					</View>
				</View>

				{/* Route & Dates Section */}
				<View className="bg-white dark:bg-gray-800 rounded-md p-2 mb-2">
					<View className="flex-row items-center mb-1">
						<Ionicons name="location" size={14} color={colors.primary} />
						<Text className="text-[12px] font-medium text-gray-700 dark:text-gray-300 ml-1">
							{shipment.transitLicense.issuedIn} → {shipment.destination}
						</Text>
					</View>
					<View className="flex-row items-center">
						<Ionicons name="calendar" size={14} color={colors.primary} />
						<Text className="text-[11px] text-gray-600 dark:text-gray-400 ml-1">
							Partida: {new Date(shipment.transitLicense.issuedAt).toLocaleDateString('pt-BR')}
							{arrivalCheck && (
								<Text className="text-green-600 dark:text-green-400">
									{' '}
									• Chegada: {new Date(arrivalCheck.checkedAt).toLocaleDateString('pt-BR')}
								</Text>
							)}
						</Text>
					</View>
				</View>

				{/* Transporters Section */}
				{shipment.transporters.length > 0 && (
					<View className="bg-white dark:bg-gray-800 rounded-md p-2 mb-2">
						<View className="flex-row items-center mb-1">
							<Ionicons name="car" size={14} color={colors.primary} />
							<Text className="text-[12px] font-medium text-gray-700 dark:text-gray-300 ml-1">
								Transportador: {shipment.transporters[0].driver}
							</Text>
						</View>
						{shipment.transporters.map((transporter, idx) => (
							<View key={idx} className="flex-row justify-between items-center ml-4 mt-1">
								<Text className="text-[11px] text-gray-600 dark:text-gray-400">
									• Matrícula: {transporter.plate}
								</Text>
								<Text className="text-[11px] text-gray-600 dark:text-gray-400">
									{Intl.NumberFormat('pt-BR', {
										style: 'unit',
										unit: 'kilogram',
										unitDisplay: 'short',
									}).format(transporter.quantity || 0)}
								</Text>
							</View>
						))}
					</View>
				)}

				{/* Checkpoints Section */}
				{sortedChecks.length > 0 && (
					<View className="bg-white dark:bg-gray-800 rounded-md p-2">
						<View className="flex-row items-center mb-1">
							<Ionicons name="map" size={14} color={colors.primary} />
							<Text className="text-[12px] font-medium text-gray-700 dark:text-gray-300 ml-1">Postos de fiscalização</Text>
						</View>
						{sortedChecks.map((check, idx) => (
							<View
								key={idx}
								className={`flex-row justify-between items-center ml-4 mt-1 ${
									check.place === shipment.destination ? 'bg-green-50 dark:bg-green-900/20 p-1 rounded' : ''
								}`}
							>
								<Text
									className={`text-[11px] ${
										check.place === shipment.destination
											? 'text-green-600 dark:text-green-400 font-medium'
											: 'text-gray-600 dark:text-gray-400'
									}`}
								>
									• {check.point} ({check.place})
								</Text>
								<View className="flex-row items-center">
									<Text
										className={`text-[11px] ${
											check.place === shipment.destination
												? 'text-green-600 dark:text-green-400'
												: 'text-gray-600 dark:text-gray-400'
										}`}
									>
										{new Date(check.checkedAt).toLocaleDateString('pt-BR')}
										{check.stage === 'AT_ARRIVING' && ' (Chegada)'}
										{check.stage === 'AT_DEPARTING' && ' (Partida)'}
										{check.stage === 'IN_TRANSIT' && ' (Em trânsito)'}
									</Text>
									{check.place === shipment.destination && (
										<Ionicons name="checkmark-circle" size={14} color={colors.primary} className="ml-1" />
									)}
								</View>
							</View>
						))}
					</View>
				)}
			</View>
		)
	}




	const renderShipmentSection = (title: string, shipments: Shipment[]) => {
		const sortedShipments = [...shipments].sort((a, b) => {
			const aChecks = [...a.checks].sort((x, y) => new Date(x.checkedAt).getTime() - new Date(y.checkedAt).getTime())
			const bChecks = [...b.checks].sort((x, y) => new Date(x.checkedAt).getTime() - new Date(y.checkedAt).getTime())
			
			const aArrival = aChecks.find(check => check.place === a.destination)
			const bArrival = bChecks.find(check => check.place === b.destination)
			
			// If neither has arrived, maintain original order
			if (!aArrival && !bArrival) return 0
			// Non-arrived shipments come first
			if (!aArrival) return -1
			if (!bArrival) return 1
			// If both have arrived, sort by arrival date
			return new Date(aArrival.checkedAt).getTime() - new Date(bArrival.checkedAt).getTime()
		})

		return (
			<View className="space-y-2 mt-4">
				<ReportSectionHeader title={title} />
				{sortedShipments.length > 0 ? (
					sortedShipments.map((shipment, index) => renderShipmentRow(shipment, index))
				) : (
					<View className="ml-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
						<Text className="text-[12px] text-gray-500 dark:text-gray-400 text-center">
							Nenhum registo de {title} encontrado
						</Text>
					</View>
				)}
			</View>
		)
	}


	return (
		<View className="space-y-2">
			{renderShipmentSection('Castanha recebida', shipmentsByStatus.ARRIVING)}
			{renderShipmentSection('Castanha em trânsito', shipmentsByStatus.TRANSITING)}
			{renderShipmentSection('Castanha transferida', shipmentsByStatus.DEPARTING)}
		</View>
	)
}
