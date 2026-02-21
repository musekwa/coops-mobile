import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import Animated, { FadeIn } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import BottomSheet, { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'

import { useHeaderOptions } from 'src/hooks/useNavigationSearch'
import { colors } from 'src/constants'
import CustomConfirmDialg from 'src/components/dialogs/CustomConfirmDialg'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import ShipmentVerticalStatusLine from 'src/components/tracking/ShipmentVerticalStatusLine'
import { useQueryManyAndWatchChanges, useQueryOneAndWatchChanges } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { ShipmentInfoCard } from './components/shipment-info-card'
import ShipmentInspectionSkeleton from './shipment-inspection-skeleton'
import { ShipmentWithOwnerData, ShipmentLoadWithCarAndDriver } from './types'

export default function ShipmentInspectionScreen() {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const { shipmentId } = useLocalSearchParams()
	const navigation = useNavigation()
	const router = useRouter()
	const [notes, setNotes] = useState('')
	const [hasError, setHasError] = useState(false)
	const [message, setMessage] = useState('')
	const [askingForPermission, setAskingForPermission] = useState(false)
	const [selectedCheckpointName, setSelectedCheckpointName] = useState('')
	const [showInspection, setShowInspection] = useState(false)

	const bottomSheetModalRef = useRef<BottomSheetModal>(null)

	const { data: shipment } = useQueryOneAndWatchChanges<ShipmentWithOwnerData>(
		shipmentId
			? `
			SELECT 
				cs.*,
				CASE 
					WHEN cs.owner_type = 'TRADER' THEN (
						SELECT 
							CASE 
								WHEN surname = 'COMPANY' THEN 'COMPANY (Empresa)'
								ELSE surname || ' ' || other_names
							END
						FROM ${TABLES.ACTOR_DETAILS} WHERE actor_id = cs.owner_id
					)
					WHEN cs.owner_type = 'GROUP' THEN (
						SELECT other_names 
						FROM ${TABLES.ACTOR_DETAILS} ad 
						INNER JOIN ${TABLES.ACTORS} a ON ad.actor_id = a.id 
						WHERE a.id = cs.owner_id AND a.category = 'GROUP'
					)
					WHEN cs.owner_type = 'FARMER' THEN (
						SELECT 
							CASE 
								WHEN surname = 'COMPANY' THEN 'COMPANY (Empresa)'
								ELSE surname || ' ' || other_names
							END
						FROM ${TABLES.ACTOR_DETAILS} WHERE actor_id = cs.owner_id
					)
					ELSE 'Unknown Owner'
				END as owner_name,
				CASE 
					WHEN cs.owner_type = 'TRADER' THEN (SELECT 'TRADER' FROM ${TABLES.ACTOR_DETAILS} WHERE actor_id = cs.owner_id)
					WHEN cs.owner_type = 'GROUP' THEN (
						SELECT 
							CASE 
								WHEN ac.subcategory = 'ASSOCIATION' THEN 'Associação'
								WHEN ac.subcategory = 'COOPERATIVE' THEN 'Cooperativa'
								WHEN ac.subcategory = 'COOP_UNION' THEN 'União de Cooperativas'
								ELSE ac.subcategory
							END
						FROM ${TABLES.ACTOR_CATEGORIES} ac 
						INNER JOIN ${TABLES.ACTORS} a ON ac.actor_id = a.id 
						WHERE a.id = cs.owner_id AND a.category = 'GROUP' AND ac.category = 'GROUP'
						LIMIT 1
					)
					WHEN cs.owner_type = 'FARMER' THEN (SELECT 'FARMER' FROM ${TABLES.ACTOR_DETAILS} WHERE actor_id = cs.owner_id)
					ELSE 'UNKNOWN'
				END as owner_details
			FROM ${TABLES.CASHEW_SHIPMENTS} cs 
			WHERE cs.id = ?
		`
			: 'SELECT 1 WHERE 1 = 0',
		shipmentId ? [shipmentId as string] : [],
	)

	const { data: shipmentLoads } = useQueryManyAndWatchChanges<ShipmentLoadWithCarAndDriver>(
		shipmentId
			? `
			SELECT 
				sl.*,
				sc.car_type,
				sc.plate_number,
				TRIM(ad.other_names || ' ' || ad.surname) as driver_name,
				cd.primary_phone as driver_phone
			FROM ${TABLES.SHIPMENT_LOADS} sl
			LEFT JOIN ${TABLES.SHIPMENT_CARS} sc ON sl.car_id = sc.id
			LEFT JOIN ${TABLES.ACTORS} a ON sl.driver_id = a.id AND a.category = 'DRIVER'
			LEFT JOIN ${TABLES.ACTOR_DETAILS} ad ON a.id = ad.actor_id
			LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON a.id = cd.owner_id AND cd.owner_type = 'DRIVER'
			WHERE sl.shipment_id = '${shipmentId}'
		`
			: 'SELECT 1 WHERE 1 = 0',
	)

	// Handle BottomSheet Snap Press
	const handleSnapPress = useCallback((index: number) => {
		bottomSheetModalRef.current?.snapToIndex(index)
	}, [])

	// Handle BottomSheet Close Press
	const handleClosePress = useCallback(() => {
		bottomSheetModalRef.current?.close()
	}, [])
	const snapPoints = useMemo(() => ['75%', '100%'], [])

	// BottomSheet Modal: Render Backdrop
	const renderBackdrop = useCallback(
		(props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
		[],
	)

	// Use useEffect to handle showing the inspection dialog
	useEffect(() => {
		if (selectedCheckpointName) {
			setShowInspection(true)
		} else {
			setShowInspection(false)
		}
	}, [selectedCheckpointName])

	// Show loading state if shipmentId is not available
	if (!shipmentId || !shipment) {
		return <ShipmentInspectionSkeleton />
	}

	return (
		<View className="flex-1 bg-white dark:bg-black h-full">
			<Animated.ScrollView
				entering={FadeIn.duration(500)}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingTop: 30,
					paddingBottom: 80,
					marginBottom: 80,
					paddingHorizontal: 9,
					minHeight: '100%',
					justifyContent: 'center',
				}}
			>
				<View className="flex-1 bg-white dark:bg-black">
					<ShipmentInfoCard shipment={shipment} shipmentLoads={shipmentLoads || []} />
					<View className="mt-4 relative p-2 w-[100%] border border-slate-300 shadow-sm shadow-black bg-gray-50 dark:bg-gray-900 rounded-md">
						<View className="mt-4">
							{shipment && (
								<ShipmentVerticalStatusLine
									handleSnapPress={handleSnapPress}
									shipmentId={shipmentId as string}
									setSelectedCheckpointName={setSelectedCheckpointName}
								/>
							)}
						</View>
					</View>
				</View>
			</Animated.ScrollView>
			<CustomConfirmDialg
				title="Fiscalização"
				visible={askingForPermission}
				setVisible={setAskingForPermission}
				yesCallback={() => {
					setAskingForPermission(false)
				}}
				yesText="Sim"
				noText="Não"
				message={message}
				noCallback={() => {
					setAskingForPermission(false)
				}}
			/>
			<ErrorAlert visible={hasError} setVisible={setHasError} setMessage={setMessage} message={message} title="" />

			<BottomSheet
				ref={bottomSheetModalRef}
				index={-1}
				snapPoints={snapPoints}
				keyboardBehavior="interactive"
				android_keyboardInputMode="adjustResize"
				backdropComponent={renderBackdrop}
				enablePanDownToClose={true}
				enableOverDrag={true}
				backgroundStyle={{
					backgroundColor: isDarkMode ? colors.gray800 : colors.white,
				}}
				handleIndicatorStyle={{
					backgroundColor: isDarkMode ? colors.white : colors.gray600,
				}}
			>
				<BottomSheetView>
					<View className="flex flex-row justify-between px-6">
						<View />
						<TouchableOpacity
							onPress={() => {
								handleClosePress()
								setNotes('')
							}}
						>
							<Ionicons name="close" size={24} color={isDarkMode ? colors.white : colors.gray600} />
						</TouchableOpacity>
					</View>
					<View className="flex-1 min-h-[400px]">{/* Inspection report content will go here */}</View>
				</BottomSheetView>
			</BottomSheet>
		</View>
	)
}
