import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import { useQueryOneAndWatchChanges, useQueryMany } from 'src/hooks/queries'
import Spinner from 'src/components/loaders/Spinner'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import { buildShipmentCheckpointInspector } from 'src/library/powersync/schemas/shipment_checkpoint_inspectors'
import { insertShipmentCheckpointInspector } from 'src/library/sqlite/inserts'
import { deleteRecord } from 'src/library/sqlite/deletes'
import { getUserRole } from 'src/helpers/helpersToUser'
import { UserRoles } from 'src/types'

// Types
interface UserRecord {
	id: string
	full_name: string
	user_role: string
	phone: string
	district_id: string
}

interface InspectorAssignment {
	id: string
	checkpoint_id: string
	inspector_id: string
	sync_id: string
}

export default function InspectorsAssignmentScreen() {
	const { checkpoint_id } = useLocalSearchParams()
	const navigation = useNavigation()
	const router = useRouter()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [selectedInspectorIds, setSelectedInspectorIds] = useState<string[]>([])
	const [errorMessage, setErrorMessage] = useState('')
	const [showErrorAlert, setShowErrorAlert] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	// Fetch checkpoint to get district_id
	const { data: checkpoint } = useQueryOneAndWatchChanges<{ id: string; district_id: string; name: string }>(
		`SELECT sc.id, a.district_id, sc.name FROM ${TABLES.CHECKPOINTS} sc LEFT JOIN ${TABLES.ADDRESS_DETAILS} a ON a.owner_id = sc.id AND a.owner_type = 'CHECKPOINT' WHERE sc.id = ?`,
		[checkpoint_id as string],
	)

	// Fetch eligible users (same district)
	const { data: eligibleUsers, isLoading: isLoadingUsers } = useQueryMany<UserRecord>(
		`SELECT id, full_name, user_role, phone, district_id FROM ${TABLES.USER_DETAILS} WHERE district_id = '${checkpoint?.district_id}'`,
	)

	// Fetch current assignments
	const { data: currentAssignments } = useQueryMany<InspectorAssignment>(
		`SELECT * FROM ${TABLES.SHIPMENT_CHECKPOINT_INSPECTORS} WHERE checkpoint_id = '${checkpoint_id}'`,
	)

	// Initialize selected inspectors from assignments
	useEffect(() => {
		if (currentAssignments) {
			setSelectedInspectorIds(currentAssignments.map((a) => a.inspector_id))
		}
	}, [currentAssignments])

	// Save handler
	const handleSave = async () => {
		if (!checkpoint) return
		setIsSaving(true)
		try {
			// Calculate additions and removals
			const prevIds = new Set(currentAssignments?.map((a) => a.inspector_id) || [])
			const nextIds = new Set(selectedInspectorIds)
			const toAdd = Array.from(nextIds).filter((id) => !prevIds.has(id))
			const toRemove = Array.from(prevIds).filter((id) => !nextIds.has(id))

			// Add new assignments
			for (const inspector_id of toAdd) {
				const newShipmentCheckpointInspector = buildShipmentCheckpointInspector({
					checkpoint_id: checkpoint_id as string,
					inspector_id,
					sync_id: checkpoint.district_id,
				})
				console.log('newShipmentCheckpointInspector', newShipmentCheckpointInspector)
				await insertShipmentCheckpointInspector(newShipmentCheckpointInspector)
			}
			// Remove unassigned
			for (const inspector_id of toRemove) {
				await deleteRecord(TABLES.SHIPMENT_CHECKPOINT_INSPECTORS, {
					checkpoint_id,
					inspector_id,
				})
			}
			// refetchAssignments?.()
			router.back()
		} catch (err) {
			setErrorMessage('Erro ao salvar fiscais. Tente novamente.')
			setShowErrorAlert(true)
		} finally {
			setIsSaving(false)
		}
	}

	// Multi-select logic
	const toggleInspector = (id: string) => {
		if (selectedInspectorIds.includes(id)) {
			setSelectedInspectorIds(selectedInspectorIds.filter((i) => i !== id))
		} else {
			if (selectedInspectorIds.length >= 4) {
				Alert.alert('Limite atingido', 'Só é possível alocar até 4 fiscais a este posto.')
				return
			}
			setSelectedInspectorIds([...selectedInspectorIds, id])
		}
	}

	useEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View className="flex flex-col items-center">
					<Text className="text-black dark:text-white text-[14px] font-bold text-center">Alocar Fiscais</Text>
				</View>
			),
			headerRight: () => null,
		})
	}, [selectedInspectorIds, isSaving])

	if (!checkpoint) {
		return <Spinner />
	}

	return (
		<View className="flex-1 bg-white dark:bg-gray-900">
			<ScrollView
				className="flex-1 p-4"
				contentContainerStyle={{ paddingBottom: 80 }}
				showsVerticalScrollIndicator={false}
			>
				<Text className="text-lg font-bold text-black dark:text-white mb-4">Posto: {checkpoint.name}</Text>
				<FormItemDescription description="Selecione até 4 fiscais do mesmo distrito:" />
				{isLoadingUsers ? (
					<Spinner />
				) : eligibleUsers && eligibleUsers.length > 0 ? (
					eligibleUsers.map((user) => {
						const selected = selectedInspectorIds.includes(user.id)
						return (
							<TouchableOpacity
								key={user.id}
								onPress={() => toggleInspector(user.id)}
								activeOpacity={0.7}
								className={`flex-row items-center p-2.5 mb-2 rounded-lg border-2 shadow-sm ${
									selected
										? 'bg-green-50 dark:bg-green-900/30 shadow-green-200 dark:shadow-green-900/50'
										: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-gray-200 dark:shadow-gray-900'
								}`}
								disabled={isSaving}
								style={
									selected
										? {
												borderColor: '#008000',
												shadowColor: '#008000',
												shadowOffset: { width: 0, height: 2 },
												shadowOpacity: 0.1,
												shadowRadius: 4,
												elevation: 3,
											}
										: {
												shadowColor: '#000',
												shadowOffset: { width: 0, height: 1 },
												shadowOpacity: 0.05,
												shadowRadius: 2,
												elevation: 1,
											}
								}
							>
								{/* Avatar/Icon */}
								<View
									className={`w-10 h-10 rounded-full items-center justify-center mr-2.5 ${
										selected ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-700'
									}`}
								>
									<MaterialCommunityIcons name="account" size={20} color={selected ? colors.primary : colors.gray600} />
								</View>

								{/* User Info */}
								<View className="flex-1">
									<Text className="text-sm font-bold text-black dark:text-white mb-0.5">{user.full_name}</Text>
									<View className="flex-row items-center mb-0.5">
										<Ionicons name="shield-outline" size={12} color={colors.gray600} />
										<Text className="ml-1 text-xs text-gray-600 dark:text-gray-400">
											{getUserRole(user.user_role as UserRoles)}
										</Text>
									</View>
									<View className="flex-row items-center">
										<Ionicons name="call-outline" size={12} color={colors.gray600} />
										<Text className="ml-1 text-xs text-gray-600 dark:text-gray-400">{user.phone}</Text>
									</View>
								</View>

								{/* Checkbox */}
								<View
									className={`w-5 h-5 rounded-md items-center justify-center border-2 ml-2 ${
										selected ? '' : 'border-gray-300 dark:border-gray-600 bg-transparent'
									}`}
									style={selected ? { backgroundColor: '#008000', borderColor: '#008000' } : {}}
								>
									{selected && <Ionicons name="checkmark" size={14} color="#ffffff" />}
								</View>
							</TouchableOpacity>
						)
					})
				) : (
					<EmptyPlaceholder message="Nenhum fiscal disponível" />
				)}
			</ScrollView>

			{/* Fixed Save Button at Bottom */}
			<View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
				<TouchableOpacity
					onPress={handleSave}
					activeOpacity={0.7}
					disabled={isSaving || selectedInspectorIds.length === 0}
					className={`flex-row items-center justify-center px-4 py-3 rounded-lg ${
						isSaving || selectedInspectorIds.length === 0
							? 'bg-gray-300 dark:bg-gray-700'
							: 'bg-[#008000] dark:bg-green-700'
					}`}
				>
					{isSaving ? (
						<ActivityIndicator size="small" color="#ffffff" />
					) : (
						<Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
					)}
					<Text className="ml-2 text-white text-base font-semibold">{isSaving ? 'Gravando...' : 'Gravar'}</Text>
				</TouchableOpacity>
			</View>

			<ErrorAlert
				title="Erro"
				message={errorMessage}
				setMessage={setErrorMessage}
				visible={showErrorAlert}
				setVisible={setShowErrorAlert}
			/>
		</View>
	)
}
