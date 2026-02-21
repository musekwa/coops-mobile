import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import { buildShipmentCheck, ShipmentCheckRecordType } from 'src/library/powersync/schemas/shipment_checks'
import { insertShipmentCheck } from 'src/library/sqlite/inserts'

interface ShipmentInspectionModalProps {
	bottomSheetModalRef: React.RefObject<BottomSheetModal>
	shipmentId: string
	checkpointId: string
	checkpointType: 'DEPARTURE' | 'AT_ARRIVAL' | 'IN_TRANSIT'
	shipmentDirectionId: string
	checkedById: string
	onSuccess?: () => void
}

export default function ShipmentInspectionModal({
	bottomSheetModalRef,
	shipmentId,
	checkpointId,
	checkpointType,
	shipmentDirectionId,
	checkedById,
	onSuccess,
}: ShipmentInspectionModalProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [hasIrregularity, setHasIrregularity] = useState<boolean | null>(null)
	const [notes, setNotes] = useState('')
	const [isSaving, setIsSaving] = useState(false)

	const snapPoints = useMemo(() => ['90%', '100%'], [])

	const renderBackdrop = useCallback(
		(props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
		[],
	)

	const handleSave = async () => {
		if (isSaving || hasIrregularity === null) return

		setIsSaving(true)
		try {
			const syncId = `${shipmentId}_${checkpointId}_${Date.now()}`
			const checkedAt = new Date().toISOString()

			// Build notes: include irregularity status and optional notes
			let finalNotes = ''
			if (hasIrregularity) {
				finalNotes = `Irregularidade detectada${notes.trim() ? ': ' + notes.trim() : ''}`
			} else {
				finalNotes = 'Nenhuma irregularidade detectada'
			}

			const shipmentCheck: ShipmentCheckRecordType = {
				shipment_id: shipmentId,
				checkpoint_id: checkpointId,
				checkpoint_type: checkpointType,
				shipment_direction_id: shipmentDirectionId,
				checked_by_id: checkedById,
				checked_at: checkedAt,
				notes: finalNotes,
				sync_id: syncId,
			}

			const checkRecord = buildShipmentCheck(shipmentCheck)
			await insertShipmentCheck(checkRecord)

			// Reset form
			setHasIrregularity(null)
			setNotes('')
			setIsSaving(false)
			bottomSheetModalRef.current?.dismiss()
			onSuccess?.()
		} catch (error) {
			console.error('Error saving inspection:', error)
			setIsSaving(false)
		}
	}

	const handleDismiss = () => {
		setHasIrregularity(null)
		setNotes('')
		setIsSaving(false)
		bottomSheetModalRef.current?.dismiss()
	}

	const getCheckpointTypeLabel = () => {
		switch (checkpointType) {
			case 'DEPARTURE':
				return 'Proveniência'
			case 'AT_ARRIVAL':
				return 'Destino'
			case 'IN_TRANSIT':
				return 'Trânsito'
			default:
				return 'Posto'
		}
	}

	return (
		<BottomSheetModal
			ref={bottomSheetModalRef}
			index={1}
			snapPoints={snapPoints}
			backdropComponent={renderBackdrop}
			onDismiss={handleDismiss}
			enablePanDownToClose={true}
			backgroundStyle={{
				backgroundColor: isDarkMode ? colors.gray800 : colors.white,
			}}
			handleIndicatorStyle={{
				backgroundColor: isDarkMode ? colors.white : colors.gray600,
			}}
		>
			<View style={{ flex: 1, flexDirection: 'column' }}>
				{/* Scrollable Content */}
				<BottomSheetScrollView
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingBottom: 16,
					}}
					style={{ flex: 1 }}
					showsVerticalScrollIndicator={true}
				>
					{/* Header */}
					<View className="flex-row items-center justify-between mb-6">
						<View className="flex-1">
							<View className="flex-row items-center">
								<View className="w-9 h-9 rounded-full bg-[#008000]/10 dark:bg-[#008000]/20 items-center justify-center mr-3">
									<Ionicons name="document-text-outline" size={20} color="#008000" />
								</View>
								<View className="flex-1">
									<Text className="text-lg font-bold text-gray-900 dark:text-white">Realizar Fiscalização</Text>
									<Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{getCheckpointTypeLabel()}</Text>
								</View>
							</View>
						</View>
						<TouchableOpacity
							onPress={handleDismiss}
							className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
							activeOpacity={0.7}
						>
							<Ionicons name="close" size={18} color={isDarkMode ? colors.white : colors.gray600} />
						</TouchableOpacity>
					</View>

					{/* Question Card */}
					<View className="mb-5 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
						<View className="flex-row items-start mb-3">
							<View className="w-6 h-6 rounded-full bg-[#008000]/10 dark:bg-[#008000]/20 items-center justify-center mr-2.5 mt-0.5">
								<Ionicons name="help-circle" size={16} color="#008000" />
							</View>
							<Text className="flex-1 text-base font-medium text-gray-900 dark:text-white leading-5">
								Detectou alguma irregularidade nessa carga?
							</Text>
						</View>

						{/* Yes/No Radio Buttons */}
						<View className="flex-row gap-2.5">
							<TouchableOpacity
								onPress={() => setHasIrregularity(true)}
								className={`flex-1 flex-row items-center justify-center px-3 py-2.5 rounded-lg border ${
									hasIrregularity === true
										? 'bg-red-50 dark:bg-red-900/30 border-red-500'
										: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
								}`}
								activeOpacity={0.7}
								disabled={isSaving}
							>
								<View
									className={`w-4 h-4 rounded-full border mr-2 items-center justify-center ${
										hasIrregularity === true
											? 'border-red-500 bg-red-500'
											: 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700'
									}`}
								>
									{hasIrregularity === true && <Ionicons name="checkmark" size={10} color="white" />}
								</View>
								<Text
									className={`text-sm font-medium ${
										hasIrregularity === true ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'
									}`}
								>
									Sim
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => {
									setHasIrregularity(false)
									setNotes('') // Clear notes when "No" is selected
								}}
								className={`flex-1 flex-row items-center justify-center px-3 py-2.5 rounded-lg border ${
									hasIrregularity === false
										? 'bg-[#008000]/10 dark:bg-[#008000]/20 border-[#008000]'
										: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
								}`}
								activeOpacity={0.7}
								disabled={isSaving}
							>
								<View
									className={`w-4 h-4 rounded-full border mr-2 items-center justify-center ${
										hasIrregularity === false
											? 'border-[#008000] bg-[#008000]'
											: 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700'
									}`}
								>
									{hasIrregularity === false && <Ionicons name="checkmark" size={10} color="white" />}
								</View>
								<Text
									className={`text-sm font-medium ${
										hasIrregularity === false
											? 'text-[#008000] dark:text-green-400'
											: 'text-gray-700 dark:text-gray-300'
									}`}
								>
									Não
								</Text>
							</TouchableOpacity>
						</View>
					</View>

					{/* Notes Input - Only shown if irregularity is detected */}
					{hasIrregularity === true && (
						<View className="mb-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800/50">
							<View className="flex-row items-center mb-3">
								<View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-2">
									<Ionicons name="alert-circle" size={14} color="white" />
								</View>
								<Text className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">
									Descreva a irregularidade detectada <Text className="text-red-500 font-bold">*</Text>
								</Text>
							</View>
							<TextInput
								className="bg-white dark:bg-gray-800 rounded-lg p-3 text-gray-900 dark:text-white min-h-[120] border border-gray-200 dark:border-gray-700"
								placeholder="Ex: Documentação incompleta, peso diferente do declarado..."
								placeholderTextColor={colors.gray600}
								value={notes}
								onChangeText={setNotes}
								multiline
								numberOfLines={5}
								textAlignVertical="top"
								editable={!isSaving}
								style={{
									fontSize: 14,
									lineHeight: 20,
								}}
							/>
						</View>
					)}
				</BottomSheetScrollView>

				{/* Fixed Save Button at Bottom */}
				<View
					style={{
						paddingHorizontal: 16,
						paddingTop: 12,
						paddingBottom: 24,
						borderTopWidth: 1,
						borderTopColor: isDarkMode ? '#374151' : '#e5e7eb',
						backgroundColor: isDarkMode ? colors.gray800 : colors.white,
					}}
				>
					<TouchableOpacity
						onPress={handleSave}
						disabled={isSaving || hasIrregularity === null || (hasIrregularity === true && !notes.trim())}
						className={`flex-row items-center justify-center px-5 py-3.5 rounded-lg ${
							isSaving || hasIrregularity === null || (hasIrregularity === true && !notes.trim())
								? 'bg-gray-400'
								: 'bg-[#008000]'
						}`}
						activeOpacity={0.8}
						style={{
							shadowColor: '#008000',
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.2,
							shadowRadius: 4,
							elevation: 3,
						}}
					>
						{isSaving ? (
							<ActivityIndicator size="small" color="white" />
						) : (
							<>
								<Ionicons name="checkmark-circle" size={20} color="white" />
								<Text className="ml-2 text-white font-semibold text-base">Registar Fiscalização</Text>
							</>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</BottomSheetModal>
	)
}
