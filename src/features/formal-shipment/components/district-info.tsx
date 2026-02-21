import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, Linking, LayoutAnimation } from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'

import { colors } from 'src/constants'
import { checkpoints } from 'src/constants/checkpoints'
import { avatarPlaceholderUri } from 'src/constants/imageURI'

import { cn } from 'src/utils/tailwind'
import { getIntlDate } from 'src/helpers/dates'

import { CheckpointInfo } from 'src/features/formal-shipment/components/check-point-info'
import CustomConfirmDialg from 'src/components/dialogs/CustomConfirmDialg'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import CheckpointSelectionBox from 'src/components/modals/CheckpointSelectionBox'

type DistrictInfoProps = {
	// currentPath: string[]
	index: number
	handleSnapPress: (index: number) => void
	district: string
	// setCheck: (check: Check) => void
	setSelectedCheckpointName: (name: string) => void
	shipmentId: string
	// shipment: Shipment
}

export default function DistrictInfo({
	setSelectedCheckpointName,
	index,
	handleSnapPress,
	district,
	shipmentId,
	// setCheck,
	// shipment,
}: DistrictInfoProps) {
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [hasPermission, setHasPermission] = useState(false)
	const [showCheckpointOptions, setShowCheckpointOptions] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	// const currentPathLabel = shipment.paths?.[shipment.paths.length - 1]?.label as PathLabelType
	// const [currentCheck, setCurrentCheck] = useState<Check | null>(null)

	// get the shipment checks: wherever the shipment has been checked in the current path
	// this is to avoid showing the checks for the previous paths
	// const getAllShipmentChecks = useMemo(
	// 	() => shipment.checks.filter((check) => check.notes?.split(' - ')[0] === currentPathLabel),
	// 	[shipment.checks, reloading],
	// )

	// const place =
	// 	currentCheck?.stage === ShipmentStatusTypes.AT_DEPARTURE
	// 		? `Proveniência: ${currentCheck.place}`
	// 		: currentCheck?.stage === ShipmentStatusTypes.AT_ARRIVAL
	// 			? `Destino: ${currentCheck?.place}`
	// 			: `Trânsito: ${currentCheck?.place}` || 'N/A'

	// find if the shipment has been inspected in the district or in the district checkpoint
	// if it has been inspected, return the check object with the checkpoint name, district name, checked at date, checked by name, phone number and notes
	// if it has not been inspected, return null
	const hasBeenInspected = useCallback((district: string) => {
		// let checked: Check | null = null
		// if (checkpoints[district] && checkpoints[district].length > 0) {
		// 	checked = getAllShipmentChecks.find((check) => checkpoints[district].includes(check.point)) ?? null
		// }
		// if (district && !checked) {
		// 	checked = getAllShipmentChecks.find((check) => [district].includes(check.place)) ?? null
		// }
		// return checked
	}, [])

	// mark the district in the path of the shipment
	// if the district is the origin, mark it as AT_DEPARTURE, if it is the destination, mark it as AT_ARRIVAL and if it is in transit, mark it as IN_TRANSIT
	const getDistrictCheck = (district: string) => {
		// const pathLabel = shipment?.paths?.[shipment?.paths.length - 1]?.label
		// let check: Check = {
		// 	checkedAt: new Date(),
		// 	phone: '',
		// 	checkedBy: '',
		// 	place: district,
		// 	point: '',
		// 	stage: '',
		// 	notes: `${pathLabel} - ${'N/A'}`,
		// } as Check
		// const existingCheck = shipment.checks.find((check) => {
		// 	// check if the check is in the district and the path label is the same
		// 	return check.place === district && check.notes?.split(' - ')[0] === pathLabel
		// })
		// console.log('existingCheck', existingCheck)
		// if (existingCheck) {
		// 	check = existingCheck
		// check if there is a checkpoint in the district with notes
		const checkpoint = checkpoints[district] ?? [district]
		// const foundCheckpoint = shipment.checks.find((check) => checkpoint.includes(check.point))

		// } else if (district === shipment.startDistrict) {
		// 	check.stage = ShipmentStatusTypes.AT_DEPARTURE
		// } else if (district === shipment.destination) {
		// 	check.stage = ShipmentStatusTypes.AT_ARRIVAL
		// } else if (district !== shipment.startDistrict && district !== shipment.destination) {
		// 	check.stage = ShipmentStatusTypes.IN_TRANSIT
		// }
		// return check
	}

	const toggleAccordion = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
		setIsOpen(!isOpen)
	}

	// const handleCheckpointPress = useCallback(
	// (district: string, checkpointName: string) => {
	// check if the shipment has already arrived at the destination
	// if (getAllShipmentChecks.some((check) => check.stage === ShipmentStatusTypes.AT_ARRIVAL)) {
	// 	setErrorMessage('Esta mercadoria já chegou ao destino.')
	// 	setHasError(true)
	// 	return
	// }

	// check if the checkpoint exists in the district
	// const foundCheckpoint = districtCheckpoints.find(
	// 	(checkpoint) => checkpoint.point === checkpointName && checkpoint.district === district,
	// )

	// if the checkpoint does not exist in the district, alert the user about it
	// if (!foundCheckpoint && userData.district !== district) {
	// setErrorMessage(`Não tem autorização de fiscalizar mercadoria em ${checkpointName} (${district})`)
	// setHasError(true)
	// return
	// }

	// check if the user is already in the checkpoint
	// const userCurrentCheckpoint = districtCheckpoints.find((checkpoint) =>
	// 	checkpoint.inspectors.some((inspector) => inspector.name === userData.name),
	// )

	// if the user is in the district but may or not be in the checkpoint where the shipment is located
	// ask him to inspect the shipment if he is in the checkpoint
	// if he is not in the checkpoint, ask him to move to the checkpoint
	// if (userData.district === district) {
	// check if the shipment has already been inspected in the district
	// const checkedPoint = hasBeenInspected(district)

	// if the shipment has been inspected in the district, alert the user about it and do not allow him to inspect it again
	// if (checkedPoint) {
	// const newCheckpointName =
	// 	checkedPoint.point === checkpointName ? `neste posto de fiscalização` : `em ${checkedPoint.point}`
	// setErrorMessage(`Esta mercadoria foi fiscalizada ${newCheckpointName}`)
	// 	setHasError(true)
	// 	return
	// } else {
	// if the shipment has not been inspected in the district, ask the user to inspect it
	// if the user is not in the checkpoint, ask him to move to the checkpoint, before inspecting the shipment
	// if the user is in the checkpoint, ask him to inspect the shipment
	// if (userCurrentCheckpoint && userCurrentCheckpoint.point === checkpointName) {
	// 	setSelectedCheckpointName(checkpointName)
	// 	return
	// } else {
	// 	setErrorMessage(
	// 		`Você não está no posto de fiscalização de ${checkpointName}. Deseja se transferir para lá?`,
	// 	)
	// 	setHasPermission(true)
	// 	return
	// }
	// }
	// }
	// },
	// [],
	// )

	const handleCheck = (check: any) => {
		handleSnapPress(0)
		// setCheck(check)
	}

	useEffect(() => {
		const check = getDistrictCheck(district)
		// setCurrentCheck(check)
	}, [district])

	const checked = hasBeenInspected(district)

	return (
		<View className="relative flex flex-row justify-between">
			<View className="flex-1">
				<View className="flex flex-row justify-between relative">
					<TouchableOpacity
						onPress={() => {
							// if (currentCheck) {
							// 	handleCheck(currentCheck)
							// }
						}}
						activeOpacity={0.5}
						className="flex flex-row space-x-2 items-center"
					>
						<View
							className={`flex items-center justify-center w-10 h-10 rounded-full  ${!!false ? 'bg-[#008000]' : 'bg-red-500'}`}
						>
							<Ionicons name="location-outline" size={20} color={colors.white} />
						</View>
						<Text className="text-xs text-gray-600 dark:text-gray-400 font-mono">{district}</Text>
						{/* {currentCheck?.notes &&
							currentCheck?.notes?.split(' - ')[1] &&
							currentCheck?.notes?.split(' - ')[1].trim().length > 3 && (
								<Ionicons name="warning-outline" size={15} color={colors.warning} />
							)} */}
					</TouchableOpacity>
				</View>
				<View className="">
					{!isOpen ? (
						<>
							<View
								className={cn('absolute top-0 left-8 w-[80%] flex flex-row space-x-2', {
									'px-2': !!false,
								})}
							>
								{!!false && (
									<View className="flex items-center 	justify-center">
										<Image
											source={{ uri: avatarPlaceholderUri }}
											style={{
												width: 40,
												height: 40,
												borderRadius: 100,
											}}
											contentFit="cover"
										/>
									</View>
								)}
								<View className="">
									{!!false ? (
										<Text className="text-xs font-semibold text-black dark:text-white">{false}</Text>
									) : (
										<Text className="text-xs font-semibold text-black dark:text-white">Ainda não fiscalizado</Text>
									)}
									{!!false && (
										<Text className="text-[10px] text-gray-600 dark:text-gray-400">
											{false ? getIntlDate(new Date()) : ''}
										</Text>
									)}
								</View>
								{!!false && (
									<View className="flex items-center justify-center">
										<Feather
											onPress={() => Linking.openURL(`tel:${false}`)}
											name="phone-call"
											size={20}
											color={colors.primary}
										/>
									</View>
								)}
							</View>
							{index < 0 && (
								<View
									className={cn('ml-5 w-0.5 min-h-[120px] bg-gray-300 border-dashed border border-gray-400', {
										'bg-[#008000]': !!false,
									})}
								/>
							)}
						</>
					) : (
						<View className="mt-2 pl-12">
							{/* Replace this with your actual list of checkpoints for the district  or the actual district itself */}
							{(checkpoints[district] ?? [district]).map((checkpointName, index) => {
								const checked = hasBeenInspected(district)

								return (
									<CheckpointInfo
										checked={false ? null : null}
										key={index}
										handleCheckpointPress={() => {}}
										checkpointName={checkpointName}
										district={district}
									/>
								)
							})}
						</View>
					)}
				</View>
			</View>
			<View className="mt-3 mr-2 w-[50px] items-center">
				<TouchableOpacity onPress={toggleAccordion} className="w-full items-center">
					<Ionicons
						name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
						size={24}
						color={!!false ? colors.primary : colors.red}
					/>
				</TouchableOpacity>
			</View>
			<CustomConfirmDialg
				title="Fiscalização"
				visible={hasPermission}
				setVisible={() => {
					setHasPermission(false)
				}}
				yesCallback={() => {
					setErrorMessage('')
					setHasPermission(false)
					setTimeout(() => {
						setShowCheckpointOptions(true)
					}, 500)
				}}
				yesText="Sim"
				noText="Não"
				message={errorMessage}
				noCallback={() => {
					setErrorMessage('')
					setHasPermission(false)
				}}
			/>
			<ErrorAlert
				title="Erro"
				setMessage={setErrorMessage}
				visible={hasError}
				setVisible={setHasError}
				message={errorMessage}
			/>
			<CheckpointSelectionBox
				districtId={district}
				visible={showCheckpointOptions}
				setVisible={setShowCheckpointOptions}
			/>
		</View>
	)
}
