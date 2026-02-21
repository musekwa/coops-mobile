import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useQueryOneAndWatchChanges, useQueryMany, useQueryManyAndWatchChanges } from 'src/hooks/queries'
import { ShipmentCheckpointRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import CapturingCoordinates from 'src/components/location/CapturingCoordinates'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import { TransitType } from 'src/constants/tracking'
import Spinner from 'src/components/loaders/Spinner'
import CustomConfirmDialog from 'src/components/modals/CustomConfirmDialog'
import * as Location from 'expo-location'
import { useUserDetails } from 'src/hooks/queries'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'
import { getUserRole } from 'src/helpers/helpersToUser'
import { UserRoles } from 'src/types'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'

type CheckpointWithLocation = ShipmentCheckpointRecord & {
	province_name: string
	district_name: string
	district_id: string
	northern_next_checkpoint_id?: string
	southern_next_checkpoint_id?: string
	eastern_next_checkpoint_id?: string
	western_next_checkpoint_id?: string
	address_id?: string
	admin_post_name: string
	village_name: string
	gps_lat: string
	gps_long: string
	is_active: string
}

export default function CheckpointScreen() {
	const { checkpoint_id } = useLocalSearchParams()
	const navigation = useNavigation()
	const router = useRouter()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const { userDetails } = useUserDetails()

	const [showLocationDialog, setShowLocationDialog] = useState(false)
	const [showErrorAlert, setShowErrorAlert] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [status, requestPermission] = Location.useForegroundPermissions()
	const [hasPermissionError, setHasPermissionError] = useState(false)
	const [linkedCheckpoints, setLinkedCheckpoints] = useState<{
		north?: CheckpointWithLocation
		south?: CheckpointWithLocation
		east?: CheckpointWithLocation
		west?: CheckpointWithLocation
	}>({})

	const { data: checkpoint } = useQueryOneAndWatchChanges<CheckpointWithLocation>(
		`SELECT 
            sc.*,
            sc.northern_next_checkpoint_id,
            sc.southern_next_checkpoint_id,
            sc.eastern_next_checkpoint_id,
            sc.western_next_checkpoint_id,
            p.name as province_name,
            d.name as district_name,
            d.id as district_id,
            ap.name as admin_post_name,
            v.name as village_name,
            a.id as address_id,
            a.gps_lat,
            a.gps_long
        FROM ${TABLES.CHECKPOINTS} sc
        LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
        LEFT JOIN ${TABLES.PROVINCES} p ON a.province_id = p.id
        LEFT JOIN ${TABLES.DISTRICTS} d ON a.district_id = d.id
        LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON a.admin_post_id = ap.id
        LEFT JOIN ${TABLES.VILLAGES} v ON a.village_id = v.id
        WHERE sc.id = ?`,
		[checkpoint_id as string],
	)

	const { data: inspectors } = useQueryManyAndWatchChanges<{
		id: string
		full_name: string
		phone: string
		user_role: string
	}>(
		`SELECT 
		sci.id,
		ud.full_name,
		ud.phone,
		ud.user_role
		FROM ${TABLES.SHIPMENT_CHECKPOINT_INSPECTORS} sci
		JOIN ${TABLES.USER_DETAILS} ud ON sci.inspector_id = ud.id
		WHERE sci.checkpoint_id = '${checkpoint_id}'
		`,
	)

	// Fetch linked checkpoints
	const { data: linkedCheckpointsData } = useQueryMany<CheckpointWithLocation>(
		`
		SELECT 
			sc.*,
			p.name as province_name,
			d.name as district_name,
			ap.name as admin_post_name,
			v.name as village_name
		FROM ${TABLES.CHECKPOINTS} sc
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT'
		LEFT JOIN ${TABLES.PROVINCES} p ON a.province_id = p.id
		LEFT JOIN ${TABLES.DISTRICTS} d ON a.district_id = d.id
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON a.admin_post_id = ap.id
		LEFT JOIN ${TABLES.VILLAGES} v ON a.village_id = v.id
		WHERE sc.id IN (
			SELECT northern_next_checkpoint_id FROM ${TABLES.CHECKPOINTS} WHERE id = '${checkpoint_id}' AND northern_next_checkpoint_id IS NOT NULL
			UNION
			SELECT southern_next_checkpoint_id FROM ${TABLES.CHECKPOINTS} WHERE id = '${checkpoint_id}' AND southern_next_checkpoint_id IS NOT NULL
			UNION
			SELECT eastern_next_checkpoint_id FROM ${TABLES.CHECKPOINTS} WHERE id = '${checkpoint_id}' AND eastern_next_checkpoint_id IS NOT NULL
			UNION
			SELECT western_next_checkpoint_id FROM ${TABLES.CHECKPOINTS} WHERE id = '${checkpoint_id}' AND western_next_checkpoint_id IS NOT NULL
		)
	`,
	)

	// Organize linked checkpoints by direction
	useEffect(() => {
		if (linkedCheckpointsData && checkpoint) {
			const organized: {
				north?: CheckpointWithLocation
				south?: CheckpointWithLocation
				east?: CheckpointWithLocation
				west?: CheckpointWithLocation
			} = {}

			linkedCheckpointsData.forEach((linkedCp) => {
				if (checkpoint.northern_next_checkpoint_id === linkedCp.id) {
					organized.north = linkedCp
				} else if (checkpoint.southern_next_checkpoint_id === linkedCp.id) {
					organized.south = linkedCp
				} else if (checkpoint.eastern_next_checkpoint_id === linkedCp.id) {
					organized.east = linkedCp
				} else if (checkpoint.western_next_checkpoint_id === linkedCp.id) {
					organized.west = linkedCp
				}
			})

			setLinkedCheckpoints(organized)
		}
	}, [
		linkedCheckpointsData,
		checkpoint?.northern_next_checkpoint_id,
		checkpoint?.southern_next_checkpoint_id,
		checkpoint?.eastern_next_checkpoint_id,
		checkpoint?.western_next_checkpoint_id,
	])

	const captureLocation = async () => {
		if (userDetails?.district_id !== checkpoint?.district_id) {
			setHasPermissionError(true)
			setErrorMessage('Não é possível capturar a localização de um posto que não está no mesmo distrito')
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
			setShowLocationDialog(true)
		} catch (err) {
			setShowErrorAlert(true)
			setErrorMessage('Erro ao solicitar permissão de localização')
		}
	}

	const hasGPSCoordinates =
		checkpoint?.gps_lat !== '0' &&
		checkpoint?.gps_long !== '0' &&
		checkpoint?.gps_lat !== null &&
		checkpoint?.gps_long !== null
	const hasPermissionToCaptureLocation = userDetails?.district_id === checkpoint?.district_id

	useEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View className="flex flex-col items-center">
					<Text className="text-black dark:text-white text-[14px] font-bold text-center">
						{checkpoint?.name || 'Detalhes do Posto'}
					</Text>
				</View>
			),
			headerRight: () => (
				<TouchableOpacity
					onPress={() => router.push(`/(aux)/checkpoints/${checkpoint_id}/edit` as any)}
					className="mr-4"
				>
					<Ionicons name="create-outline" size={24} color={isDarkMode ? colors.white : colors.black} />
				</TouchableOpacity>
			),
		})
	}, [checkpoint, checkpoint_id])

	const renderCompactLocationCard = () => (
		<View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
			{/* GPS Section */}
			<View className="flex-row items-center justify-between mb-4">
				<View className="flex-row items-center">
					<MaterialCommunityIcons name="crosshairs-gps" size={20} color={colors.primary} />
					<Text className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">Coordenadas GPS</Text>
				</View>
				{hasPermissionToCaptureLocation && (
					<TouchableOpacity
						onPress={captureLocation}
						activeOpacity={0.7}
						className={`flex-row items-center px-3 py-2 rounded-lg ${
							hasGPSCoordinates
								? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
								: 'bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700'
						}`}
					>
						<Ionicons
							name={hasGPSCoordinates ? 'refresh-outline' : 'location-outline'}
							size={16}
							color={hasGPSCoordinates ? '#3b82f6' : colors.primary}
						/>
						<Text
							className={`ml-1.5 text-xs font-semibold ${
								hasGPSCoordinates ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'
							}`}
						>
							{hasGPSCoordinates ? 'Actualizar' : 'Capturar'}
						</Text>
					</TouchableOpacity>
				)}
			</View>

			{hasGPSCoordinates ? (
				<View className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-4">
					<Text className="text-sm font-mono text-black dark:text-white">
						{Number(checkpoint?.gps_lat).toFixed(6)}, {Number(checkpoint?.gps_long).toFixed(6)}
					</Text>
				</View>
			) : (
				<View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-3 mb-4">
					<Text className="text-yellow-700 dark:text-yellow-300 text-sm">
						{hasPermissionToCaptureLocation ? 'Coordenadas não definidas' : 'Sem permissão para capturar'}
					</Text>
				</View>
			)}

			{/* Address Section */}
			<View className="space-y-2">
				<View className="flex-row items-center">
					<MaterialCommunityIcons name="map" size={16} color={colors.gray600} />
					<Text className="ml-2 text-sm text-gray-600 dark:text-gray-400 w-20">Província:</Text>
					<Text className="flex-1 text-sm font-medium text-black dark:text-white">
						{checkpoint?.province_name || 'Não especificado'}
					</Text>
				</View>

				<View className="flex-row items-center">
					<MaterialCommunityIcons name="map-marker" size={16} color={colors.gray600} />
					<Text className="ml-2 text-sm text-gray-600 dark:text-gray-400 w-20">Distrito:</Text>
					<Text className="flex-1 text-sm font-medium text-black dark:text-white">
						{checkpoint?.district_name || 'Não especificado'}
					</Text>
				</View>

				<View className="flex-row items-center">
					<MaterialCommunityIcons name="office-building" size={16} color={colors.gray600} />
					<Text className="ml-2 text-sm text-gray-600 dark:text-gray-400 w-20">Posto:</Text>
					<Text className="flex-1 text-sm font-medium text-black dark:text-white">
						{checkpoint?.admin_post_name || 'Não especificado'}
					</Text>
				</View>

				<View className="flex-row items-center">
					<MaterialCommunityIcons name="home-city" size={16} color={colors.gray600} />
					<Text className="ml-2 text-sm text-gray-600 dark:text-gray-400 w-20">Localidade:</Text>
					<Text className="flex-1 text-sm font-medium text-black dark:text-white">
						{checkpoint?.village_name || 'Não especificado'}
					</Text>
				</View>
			</View>
		</View>
	)

	const renderInspectorItem = ({
		item,
	}: {
		item: { id: string; full_name: string; phone: string; user_role: string }
	}) => (
		<View
			className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2 border border-gray-200 dark:border-gray-700"
			style={{
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.05,
				shadowRadius: 2,
				elevation: 1,
			}}
		>
			<View className="flex-row items-center">
				{/* Avatar/Icon */}
				<View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-gray-100 dark:bg-gray-700">
					<MaterialCommunityIcons name="account" size={20} color={colors.gray600} />
				</View>

				{/* User Info */}
				<View className="flex-1">
					<Text className="text-sm font-bold text-black dark:text-white mb-1">{item.full_name}</Text>
					<View className="flex-row items-center justify-between">
						<View>
							<View className="flex-row items-center mb-0.5">
								<Ionicons name="shield-outline" size={12} color={colors.gray600} />
								<Text className="ml-1 text-xs text-gray-600 dark:text-gray-400">
									{getUserRole(item.user_role as UserRoles)}
								</Text>
							</View>
							<View className="flex-row items-center">
								<Ionicons name="call-outline" size={12} color={colors.gray600} />
								<Text className="ml-1 text-xs text-gray-600 dark:text-gray-400">{item.phone}</Text>
							</View>
						</View>
						<View className="bg-[#008000]/10 dark:bg-[#008000]/20 px-2.5 py-1 rounded-full items-center justify-center">
							<View className="flex-row items-center">
								<Ionicons name="checkmark-circle" size={12} color="#008000" />
								<Text className="ml-1 text-xs font-bold text-[#008000] dark:text-green-400">10%</Text>
							</View>
						</View>
					</View>
				</View>
			</View>
		</View>
	)

	if (!checkpoint) {
		return <Spinner />
	}

	const checkpoint_type =
		checkpoint?.checkpoint_type === TransitType.INTERDISTRITAL
			? 'Interdistrital'
			: checkpoint?.checkpoint_type === TransitType.INTRADISTRICTAL
				? 'Intradistrital'
				: checkpoint?.checkpoint_type === TransitType.INTERPROVINCIAL
					? 'Interprovincial'
					: checkpoint?.checkpoint_type === TransitType.INTERNATIONAL
						? 'Internacional'
						: 'Não especificado'

	return (
		<>
			<ScrollView
				className="flex-1 bg-white dark:bg-gray-900"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 60 }}
			>
				{/* Header Card */}
				<View className="flex flex-row justify-between bg-gradient-to-r from-green-500 to-green-600 p-3 mb-1">
					<View className="flex-row items-center">
						<MaterialCommunityIcons name="police-badge" size={24} color={colors.primary} />
						<Text className="ml-3 text-2xl font-bold text-[#008000]">{checkpoint.name}</Text>
					</View>
				</View>

				{/* Location Information */}
				<View className="">
					<Text className="font-semibold text-black dark:text-white p-3">Posto {checkpoint_type}</Text>
					{renderCompactLocationCard()}
				</View>

				<View className="px-3">
					{/* Inspectors Section */}
					<View className="mb-6">
						<View className="flex-row items-center justify-between mb-3">
							<View className="flex-row items-center">
								<MaterialCommunityIcons name="account-group" size={24} color={colors.primary} />
								<Text className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
									Fiscais ({inspectors?.length})
								</Text>
							</View>
							{userDetails?.user_role == UserRoles.SUPERVISOR && hasPermissionToCaptureLocation && (
								<TouchableOpacity
									onPress={() => router.push(`/(aux)/checkpoints/${checkpoint_id}/inspectors` as any)}
									activeOpacity={0.7}
									className="flex-row items-center bg-[#008000] dark:bg-green-700 px-3 py-2 rounded-lg border border-green-600 dark:border-green-600"
								>
									<Ionicons name="people-outline" size={16} color="#ffffff" />
									<Text className="ml-1.5 text-white text-xs font-semibold">Gerir Fiscais</Text>
								</TouchableOpacity>
							)}
						</View>

						{inspectors?.length > 0 ? (
							<FlatList
								data={inspectors}
								renderItem={renderInspectorItem}
								keyExtractor={(item: { id: string; full_name: string; phone: string; user_role: string }) => item.id}
								scrollEnabled={false}
							/>
						) : (
							<EmptyPlaceholder message="Nenhum fiscal alocado para este posto" />
						)}
					</View>
				</View>

				{/* Location Capture Dialog */}
				<CustomConfirmDialog
					showConfirmDialog={showLocationDialog}
					setShowConfirmDialog={setShowLocationDialog}
					title={''}
					content={
						checkpoint?.address_id ? (
							<CapturingCoordinates
								errorMessage={errorMessage}
								showErrorAlert={showErrorAlert}
								setShowErrorAlert={setShowErrorAlert}
								setErrorMessage={setErrorMessage}
								address_id={checkpoint.address_id || ''}
								setShowCapturingCoordinatesDialog={setShowLocationDialog}
							/>
						) : (
							'Não foi possível identificar o endereço do posto'
						)
					}
				/>

				{/* Error Alert */}
				<ErrorAlert
					title="Erro"
					message={errorMessage}
					setMessage={setErrorMessage}
					visible={showErrorAlert}
					setVisible={setShowErrorAlert}
				/>

				{/* Permission Error Alert */}
				<ErrorAlert
					visible={hasPermissionError}
					setVisible={setHasPermissionError}
					message={errorMessage}
					setMessage={setErrorMessage}
					title=""
				/>
			</ScrollView>
			<SingleFloatingButton icon="arrow-right" route="/(aux)/checkpoints" />
		</>
	)
}
