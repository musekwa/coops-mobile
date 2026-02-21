import { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Ionicons } from '@expo/vector-icons'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { useQueryMany } from 'src/hooks/queries'
import { GroupMemberRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { Switch } from 'react-native-paper'
import MultiSelectModal from 'src/components/modals/MultiSelectModal'
import { useAggregatedInfoStore } from 'src/store/trades'
import { ToPortuguese } from 'src/helpers/translate'


const AggratedSchema = z.object({
	hasAggregated: z.boolean(),
	activeParticipantParticipations: z.array(
		z.object({
			participant_id: z.string(),
			participant_type: z.string(),
			quantity: z.number(),
			participant_name: z.string(),
		}),
	),
})

type TransactionData = z.infer<typeof AggratedSchema>

export default function AddAggregatedInfo({
	group_id,
	customErrors,
	setCustomErrors,
}: {
	group_id: string
	customErrors: Record<string, string>
	setCustomErrors: (customErrors: Record<string, string>) => void
}) {
	const [showMemberSelect, setShowMemberSelect] = useState(false)
	const {
		control,
		handleSubmit,
		formState: { errors, isValid, isDirty, isSubmitting, isSubmitSuccessful, submitCount },
		reset,
		resetField,
		getValues,
		setValue,
		watch,
		setError,
		clearErrors,
	} = useForm<TransactionData>({
		defaultValues: {
			hasAggregated: false,
			activeParticipantParticipations: [],
		},
		resolver: zodResolver(AggratedSchema),
	})

	const { setHasAggregated, setAggregatedInfo, resetAggregatedInfo, getAggregatedInfo, assertAggregatedInfo } =
		useAggregatedInfoStore()

	const {
		data: membersRaw,
		isLoading: isMembersLoading,
		error: membersError,
		isError: isMembersError,
	} = useQueryMany<
		GroupMemberRecord & {
			surname: string
			other_names: string
			group_name: string
		}
	>(
		`SELECT 
           gm.group_id as group_id,
           gm.member_id as member_id,
		   gm.member_type as member_type,
           ad.other_names as group_name,
           fd.surname as surname,
           fd.other_names as other_names
        FROM ${TABLES.GROUP_MEMBERS} gm
        JOIN ${TABLES.ACTORS} a ON gm.group_id = a.id AND a.category = 'GROUP'
        JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
        JOIN ${TABLES.ACTOR_DETAILS} fd ON gm.member_id = fd.actor_id
        WHERE gm.group_id = '${group_id}'`,
	)
	const members = useMemo(
		() =>
			membersRaw?.map((m) => ({
				...m,
				participant_type: 'FARMER',
			})) || [],
		[membersRaw],
	)

	const {
		data: groupMembersRaw,
		isLoading: isGroupMembersLoading,
		error: groupMembersError,
		isError: isGroupMembersError,
	} = useQueryMany<GroupMemberRecord & { surname: string; other_names: string; group_name: string }>(
		`SELECT 
			gm.group_id as group_id,
			gm.member_id as member_id,
			gm.member_type as member_type,
			ad.other_names as group_name,
			fd.other_names as other_names,
			ac.subcategory as surname
		FROM ${TABLES.GROUP_MEMBERS} gm
		JOIN ${TABLES.ACTORS} a ON gm.group_id = a.id AND a.category = 'GROUP'
		JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		JOIN ${TABLES.ACTORS} f ON gm.member_id = f.id AND f.category = 'GROUP'
		JOIN ${TABLES.ACTOR_DETAILS} fd ON fd.actor_id = f.id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = f.id AND ac.category = 'GROUP'
		WHERE gm.group_id = '${group_id}'`,
	)
	const groupMembers = useMemo(
		() =>
			groupMembersRaw?.map((m) => ({
				...m,
				surname: ToPortuguese.groupType(m.surname),
				participant_type: 'GROUP',
			})) || [],
		[groupMembersRaw],
	)

	const flattenedMembers = useMemo(() => {
		const allMembers = [...members, ...groupMembers]
		const mapped = allMembers
			.flat()
			.filter((m) => m.member_id != null)
			.map((m) => {
				return { label: `${m.other_names} ${m.surname}  `, value: m.member_id as string }
			})
		// Remove duplicates by value (member_id) to prevent duplicate keys
		const uniqueMembers = Array.from(
			new Map(mapped.map((item) => [item.value, item])).values()
		)
		return uniqueMembers
	}, [members, groupMembers])

	const hasAggregatedValue = watch('hasAggregated')
	const activeParticipantParticipations = watch('activeParticipantParticipations')

	const handleSelectedMembers = (selectedMemberIds: string[]) => {
		if (selectedMemberIds.length > 0) {
			const newMembers = selectedMemberIds.map((id) => {
				const mergedMembers = [...members, ...groupMembers]
				const member = mergedMembers.find((m) => m.member_id === id)
				return {
					participant_id: id,
					participant_name: member?.other_names + ' ' + member?.surname,
					quantity: 0,
					participant_type: member?.member_type || '',
				}
			})
			setValue('activeParticipantParticipations', [...activeParticipantParticipations, ...newMembers])
			setAggregatedInfo({
				hasAggregated: hasAggregatedValue,
				activeParticipantParticipations: [...activeParticipantParticipations, ...newMembers],
			})
			setCustomErrors({
				aggregated: '',
			})
		}
	}

	const handleRemoveMember = (participantId: string) => {
		const updatedParticipations = activeParticipantParticipations.filter((m) => m.participant_id !== participantId)
		setValue('activeParticipantParticipations', updatedParticipations)
		setAggregatedInfo({
			hasAggregated: hasAggregatedValue,
			activeParticipantParticipations: updatedParticipations,
		})
		setCustomErrors({
			aggregated: '',
		})
	}

	useEffect(() => {
		validateAggregatedInfo()
	}, [activeParticipantParticipations, hasAggregatedValue])

	const validateAggregatedInfo = () => {
		const hasAggregated = getValues('hasAggregated')
		const activeParticipantParticipations = getValues('activeParticipantParticipations')
		setHasAggregated(hasAggregated)
		if (hasAggregated) {
			if (activeParticipantParticipations.length > 0) {
				setAggregatedInfo({
					hasAggregated: hasAggregated,
					activeParticipantParticipations: activeParticipantParticipations,
				})
			}
		} else {
			setHasAggregated(false)
			resetAggregatedInfo()
		}
	}

	return (
		<ScrollView className="border border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 my-3">
			<View className="flex-row items-center justify-between mb-4">
				<View className="flex-1">
					<Text className="text-sm text-gray-600 dark:text-gray-400">Houve agregação de castanha pelos membros?</Text>
				</View>
				<Controller
					control={control}
					name="hasAggregated"
					render={({ field: { onChange, value } }) => (
						<Switch
							value={value}
							onValueChange={(newValue: boolean) => {
								onChange(newValue)
								if (!newValue) {
									setValue(`activeParticipantParticipations`, [])
									resetAggregatedInfo()
									clearErrors('activeParticipantParticipations')
								}
							}}
							thumbColor={value ? '#008000' : '#f4f3f4'}
							trackColor={{ false: '#767577', true: '#008000' }}
						/>
					)}
				/>
			</View>

			{hasAggregatedValue && (
				<View className="flex-1">
					<TouchableOpacity
						onPress={() => setShowMemberSelect(true)}
						className="relative mt-4 p-3 justify-center pl-4 border border-gray-300 rounded-lg bg-gray-50 dark:bg-black"
					>
						<Text className="text-gray-600 dark:text-gray-400">
							{activeParticipantParticipations.length > 0
								? 'Actualize os participantes'
								: 'Seleccione os participantes'}
						</Text>
						<View
							className="absolute top-5 right-2"
							style={{
								backgroundColor: 'transparent',
								borderTopWidth: 8,
								borderTopColor: 'gray',
								borderRightWidth: 8,
								borderRightColor: 'transparent',
								borderLeftWidth: 8,
								borderLeftColor: 'transparent',
								width: 0,
								height: 0,
							}}
						/>
					</TouchableOpacity>

					{activeParticipantParticipations.map((activeParticipant) => (
						<View key={activeParticipant.participant_id} className="mt-4 border-t border-gray-200 pt-4">
							<View className="flex-row justify-between items-center mb-2">
								<Text className="text-gray-600 dark:text-gray-400 text-[12px] font-semibold">
									{activeParticipant.participant_name}
								</Text>
								<TouchableOpacity onPress={() => handleRemoveMember(activeParticipant.participant_id)}>
									<Ionicons name="close-circle-outline" size={24} color="red" />
								</TouchableOpacity>
							</View>
							<View className="flex flex-row justify-between space-x-2 items-center mt-2">
								<View className="w-[80px]">
									<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Quantidade</Text>
								</View>
								<View className="flex-1">
									<Controller
										control={control}
										name={`activeParticipantParticipations.${activeParticipantParticipations.findIndex((m) => m.participant_id === activeParticipant.participant_id)}.quantity`}
										rules={{ required: 'Quantidade é obrigatória' }}
										render={({ field: { value, onChange }, fieldState: { error } }) => (
											<View className="flex-1">
												<View className="relative">
													<CustomTextInput
														label=""
														keyboardType="numeric"
														value={value ? value.toString() : ''}
														onChangeText={(text) => {
															const quantity = parseFloat(text) || 0
															onChange(quantity)
															setAggregatedInfo({
																hasAggregated: hasAggregatedValue,
																activeParticipantParticipations: activeParticipantParticipations.map((m) =>
																	m.participant_id === activeParticipant.participant_id ? { ...m, quantity } : m,
																),
															})
															clearErrors('activeParticipantParticipations')
															setCustomErrors({
																aggregated: '',
															})
														}}
														placeholder="Qtd. em kg"
													/>
													<View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
														<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Kg.</Text>
													</View>
												</View>
												<Text className="text-gray-400 italic text-[12px]">Qt. agregada</Text>
											</View>
										)}
									/>
								</View>
							</View>
						</View>
					))}
					<View className="relative">
						<MultiSelectModal
							visible={showMemberSelect}
							onClose={() => setShowMemberSelect(false)}
							options={
								flattenedMembers && flattenedMembers.length > 0
									? flattenedMembers.filter(
											(m) => !activeParticipantParticipations.some((p) => p.participant_id === m.value),
										)
									: []
							}
							selectedValues={[]}
							onConfirm={handleSelectedMembers}
							title="Seleccione os membros que participaram da agregação"
						/>
					</View>
				</View>
			)}
			{/* Combined error message for when hasActiveMemberParticipation is true but fields are empty */}
			{hasAggregatedValue && customErrors.aggregated && (
				<Text className="text-xs text-red-500 mt-2">{customErrors.aggregated}</Text>
			)}
		</ScrollView>
	)
}
