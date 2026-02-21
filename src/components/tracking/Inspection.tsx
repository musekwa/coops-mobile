import React, { useEffect, useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native'
import { Divider } from 'react-native-paper'
import { Feather, Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { useActionStore } from 'src/store/actions/actions'
import { useColorScheme } from 'nativewind'
import { cn } from 'src/utils/tailwind'
import { Image } from 'expo-image'
import { NotFoundUri } from 'src/constants/imageURI'
import { checkpoints } from 'src/constants/checkpoints'
import { ShipmentStatusTypes } from 'src/constants/tracking'
import { getTimeElapsedSinceRegistration } from 'src/helpers/dates'

export function InspectionReport({ shipment, check }: { shipment: any; check?: any }) {
	const getAdditionalDistrictCheckInfo = () => {
		// check if there is a checkpoint in the district with notes
		const checkpoint = checkpoints[check?.place!] ?? [check?.place!]
		const foundCheckpoint = shipment.checks.find((check: any) => checkpoint.includes(check.point))
		if (foundCheckpoint) {
			return foundCheckpoint
		}
		return null
	}

	if (check?.checkedBy === 'N/A' || !check?.checkedBy) {
		return (
			<View className="flex-1 items-center justify-center p-6">
				<Image source={{ uri: NotFoundUri }} style={{ width: 100, height: 100 }} />
				<Text className="text-[14px] italic text-gray-600 dark:text-gray-400">Nenhuma fiscalização realizada.</Text>
			</View>
		)
	}

	if (check?.stage === ShipmentStatusTypes.AT_DEPARTURE) {
		const additionalCheckInfo = getAdditionalDistrictCheckInfo()
		return (
			<View className="flex-1 px-6 py-3 space-y-3">
				<View className="flex-1 justify-center items-center">
					<Text className="font-bold text-black dark:text-white text-center">{check.place}</Text>
					<View className="justify-center items-center">
						<Ionicons name="checkmark-circle-outline" size={35} color={colors.primary} />
						<Text className="text-gray-600 dark:text-gray-400 text-[12px]">
							Há {getTimeElapsedSinceRegistration(check?.checkedAt)}
						</Text>
						<Text className="text-gray-600  text-center dark:text-gray-400">
							Registo da mercadoria por {check.checkedBy}
						</Text>
						<Text className="text-gray-600 dark:text-gray-400 text-[12px]">({check?.phone})</Text>
					</View>
				</View>
				{additionalCheckInfo && <Divider />}

				{additionalCheckInfo && (
					<View className="flex-1 justify-center">
						<Text className="font-bold text-black dark:text-white text-center">{additionalCheckInfo.point}</Text>
						<View className="justify-center items-center">
							<Ionicons name="checkmark-circle-outline" size={35} color={colors.primary} />
							<Text className="text-gray-600 dark:text-gray-400 text-[12px]">
								Há {getTimeElapsedSinceRegistration(additionalCheckInfo?.checkedAt)}
							</Text>
							<Text className="text-gray-600  text-center dark:text-gray-400">
								Fiscalização da mercadoria por {additionalCheckInfo.checkedBy}
							</Text>
							<Text className="text-gray-600 dark:text-gray-400 text-[12px]">({additionalCheckInfo?.phone})</Text>
						</View>

						{additionalCheckInfo?.notes && (
							<View className=" mt-10">
								<Text className="text-gray-600 dark:text-gray-400 text-[14px] text-left">
									{additionalCheckInfo?.notes}
								</Text>
							</View>
						)}
					</View>
				)}
			</View>
		)
	}

	if (check?.stage === ShipmentStatusTypes.AT_ARRIVAL) {
		return (
			<View className="flex-1 px-6 py-3 space-y-3">
				<View className="flex-1 justify-center items-center">
					<Text className="font-bold text-black dark:text-white text-center">{check.place}</Text>
					<View className="justify-center items-center">
						<Ionicons name="checkmark-circle-outline" size={35} color={colors.primary} />
						<Text className="text-gray-600 dark:text-gray-400 text-[12px]">
							Há {getTimeElapsedSinceRegistration(check?.checkedAt)}
						</Text>
						<Text className="text-gray-600  text-center dark:text-gray-400">
							Fiscalização da mercadoria por {check.checkedBy}
						</Text>
						<Text className="text-gray-600 dark:text-gray-400 text-[12px]">({check?.phone})</Text>
					</View>
				</View>
			</View>
		)
	}

	return (
		<View className="flex-1 px-6 py-3 space-y-3">
			<Text className="font-bold text-black dark:text-white text-center">{check.place}</Text>
			<View className="flex-1 justify-center items-center">
				<Text className="font-bold text-black dark:text-white text-center">{check.point}</Text>
				<View className="justify-center items-center">
					<Ionicons name="checkmark-circle-outline" size={35} color={colors.primary} />
					<Text className="text-gray-600 dark:text-gray-400 text-[12px]">
						Há {getTimeElapsedSinceRegistration(check?.checkedAt)}
					</Text>
					<Text className="text-gray-600  text-center dark:text-gray-400">
						Fiscalização da mercadoria por {check.checkedBy}
					</Text>
					<Text className="text-gray-600 dark:text-gray-400 text-[12px]">({check?.phone})</Text>
				</View>
			</View>
		</View>
	)
}

type InspectionProps = {
	shipment: any
	check?: any
	setCheck: (check: any) => void
	handleClosePress: () => void
	handleSnapPress: (index: number) => void
	confirmInspection: () => void
}

export default function Inspection({
	shipment,
	check,
	setCheck,
	handleClosePress,
	confirmInspection,
	handleSnapPress,
}: InspectionProps) {
	const [isAllowedToInspect, setIsAllowedToInspect] = useState(false)
	const [hasIrregularities, setHasIrregularities] = useState(false)
	const [notes, setNotes] = useState('')
	const { setReloading } = useActionStore()
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	useEffect(() => {
		if (hasIrregularities) {
			handleSnapPress(0)
		}
	}, [hasIrregularities])

	return (
		<View className="flex-1">
			{(!check?.checkedBy || check?.checkedBy === 'N/A') && check?.place === '' ? (
				<KeyboardAvoidingView
					keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				>
					<View className="mt-14 mb-6 px-4 flex space-y-4">
						<Text className="text-black dark:text-white font-bold ">
							{}, você está em {}
						</Text>
						<Text className="text-black dark:text-white font-bold ">
							{}, você está em {}
							Confirme a fiscalização desta carga
						</Text>
						<Divider />
						<TouchableOpacity
							className="pt-4 flex flex-row space-x-2 items-center w-[100%]"
							onPress={() => setIsAllowedToInspect(!isAllowedToInspect)}
						>
							{!isAllowedToInspect ? (
								<Ionicons name="square-outline" size={24} color={isDarkMode ? colors.white : colors.black} />
							) : (
								<Feather name="check-square" size={24} color={colors.primary} />
							)}
							<View className="w-[75%]">
								<Text className="text-[12px] text-gray-500 ">Estou autorizado a fiscalizar esta carga</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => {
								setHasIrregularities(!hasIrregularities)
							}}
							className="flex flex-row space-x-2 items-center w-[100%]"
						>
							{!hasIrregularities ? (
								<Ionicons name="square-outline" size={24} color={isDarkMode ? colors.white : colors.black} />
							) : (
								<Feather name="check-square" size={24} color={colors.primary} />
							)}
							<View className="w-[75%]">
								<Text className="text-[12px] text-gray-500 ">Esta carga tem irregularidades</Text>
							</View>
						</TouchableOpacity>
						<View>
							<View className=" relative flex flex-row items-center justify-between p-4 space-x-2">
								<View className="w-[80%]">
									<Text className="text-[14px] italic text-gray-600 dark:text-gray-400">
										Deixe uma nota sobre as irregularidades
									</Text>
								</View>
							</View>
							<View className="py-4">
								<TextInput
									multiline={true}
									numberOfLines={4}
									style={{
										color: isDarkMode ? 'white' : 'black',
									}}
									placeholderTextColor={isDarkMode ? 'lightgray' : 'gray'}
									placeholder={'Descreva as irregularidades encontradas...'}
									value={notes}
									// onBlur={onBlur}
									onChangeText={(text: string) => setNotes(text)}
									className="border border-slate-300 dark:border-slate-600 p-3 text-[14px] shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-gray-700 "
								/>
								<View className="flex flex-row items-center justify-between space-x-6">
									<Text>
										<Text className="text-[12px] text-gray-600 dark:text-gray-400">Até 200 caracteres no máximo.</Text>
									</Text>
									<TouchableOpacity
										className="mr-3"
										onPress={() => {
											handleClosePress()
										}}
									>
										<Feather name="send" size={30} color={notes.length === 0 ? 'gray' : colors.primary} />
									</TouchableOpacity>
								</View>
							</View>
						</View>
						<TouchableOpacity
							disabled={!isAllowedToInspect}
							onPress={() => {
								confirmInspection()
								setReloading(true)
							}}
							activeOpacity={0.5}
							className={cn('bg-[#008000] border rounded-md border-[#008000] h-[50px] items-center justify-center', {
								'opacity-50': !isAllowedToInspect,
							})}
						>
							<Text className="text-[14px] text-white font-normal">Confirmar Fiscalização</Text>
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			) : (
				<View className="flex flex-row items-center justify-between p-4 space-x-2">
					{(!check?.checkedBy || check?.checkedBy === 'N/A') && (
						<View className="flex-1 items-center justify-center px-8 h-[300]">
							<Ionicons name="information-circle-outline" size={40} color={colors.primary} />
							<Text className="text-[14px] italic text-gray-600 dark:text-gray-400 text-center">
								{}, você está em {}, não pode fiscalizar esta carga no distrito de {check?.place}.
							</Text>
						</View>
					)}
					{check?.checkedBy && check?.place === '' && (
						<View className="flex-1 items-center justify-center px-8 h-[300]">
							<Ionicons name="information-circle-outline" size={40} color={colors.primary} />
							<Text className="text-[14px] italic text-gray-600 dark:text-gray-400 text-center">
								{check?.checkedBy === ''
									? `, você já fiscalizou esta carga em ${check?.place}.`
									: `Esta carga já foi fiscalizada por ${check?.checkedBy} em ${check?.place}.`}
							</Text>
						</View>
					)}
				</View>
			)}
		</View>
	)
}
