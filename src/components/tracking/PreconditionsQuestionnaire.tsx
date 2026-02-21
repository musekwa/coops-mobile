import React, { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons, Octicons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { zodResolver } from '@hookform/resolvers/zod'
import { Href, useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { Dialog } from 'react-native-simple-dialogs'
import { z } from 'zod'

import { colors } from 'src/constants'
import { usePreconditionsStore } from 'src/store/tracking/pre-conditions'
import { useShipmentOwnerDetailsStore } from 'src/store/shipment/shipment_owner_details'
import { useShipmentReceiverDetailsStore } from 'src/store/tracking/receiverDetails'
import { useTransporterInfoStore } from 'src/store/tracking/transporterInfo'

import SubmitButton from '../buttons/SubmitButton'
import RadioButton from '../buttons/RadioButton'
import Label from '../forms/Label'
import { useShipmentLicenseStore } from 'src/store/shipment/shipment_license'

const generalQuestionnaires = [
	{
		id: 0,
		option: 'hasTransitLicense',
		question: 'O proprietário desta mercadoria tem uma Guia de Trânsito?',
	},
]

const farmerQuestionnaires = [
	{
		id: 1,
		option: 'isCommercialFarmer',
		question: 'O proprietário desta mercadoria é um Produtor Comercial?',
	},
]

const traderQuestionnaires = [
	{
		id: 1,
		option: 'isFinalTrader',
		question: 'O proprietário desta mercadoria é um Comerciante Final (Exportador ou Processador)?',
	},
	{
		id: 2,
		option: 'isTraderACompany',
		question: 'O proprietário desta mercadoria é uma Empresa?',
	},
]

const QuestionnaireSchema = z
	.object({
		hasTransitLicense: z.boolean({
			message: 'Indica se tem a guia de trânsito',
		}),
		isFinalTrader: z.boolean({
			message: 'Indica se é comerciante final',
		}),
		isTraderACompany: z.boolean({
			message: 'Indica se o comerciante é uma empresa',
		}),
		isCommercialFarmer: z.boolean({
			message: 'Indica se o produtor é um produtor comercial',
		}),
	})
	.refine(
		(data) => {
			if (!data.hasTransitLicense && (data.isFinalTrader || data.isTraderACompany)) {
				return false
			}
			return true
		},
		{
			message: 'O proprietário desta mercadoria deveria ter uma Guia de Trânsito.',
		},
	)

type QuestionnaireData = z.infer<typeof QuestionnaireSchema>

type Props = {
	visible: boolean
	setVisible: (v: boolean) => void
}

export default function PrecondictionsQuestionnaire({ visible, setVisible }: Props) {
	const { setOwnerType, setSubKeys, validatePreconditions, preconditions } = usePreconditionsStore()
	const { colorScheme } = useColorScheme()
	const router = useRouter()
	const { resetLicenseInfo } = useShipmentLicenseStore()
	const { resetShipmentOwnerDetails } = useShipmentOwnerDetailsStore()
	const { resetShipmentReceiverDetails } = useShipmentReceiverDetailsStore()
	const { resetTransporterInfo, resetTrailerInfo } = useTransporterInfoStore()
	const [errorMessage, setErrorMessage] = useState('')

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors, isValid, isDirty, isSubmitting, isSubmitSuccessful, submitCount },
		reset,
		resetField,
		watch,
		setValue, // set value of the form
	} = useForm<QuestionnaireData>({
		defaultValues: {
			hasTransitLicense: false,
			isFinalTrader: false,
			isTraderACompany: false,
			isCommercialFarmer: false,
		},
		resolver: zodResolver(QuestionnaireSchema),
	})

	const onSubmit = () => {
		const validation = validatePreconditions()
		if (!validation.isValid) {
			setErrorMessage(validation.message)
			return
		}
		setVisible(false)

		router.navigate('(aux)/trades/transit/registration' as Href)

		reset()
		resetLicenseInfo()
		resetShipmentOwnerDetails()
		resetShipmentReceiverDetails()
		resetTransporterInfo()
		resetTrailerInfo()
	}

	return (
		<Dialog
			animationType={'slide'}
			statusBarTranslucent={true}
			titleStyle={{ color: 'red', fontSize: 20 }}
			visible={visible}
			dialogStyle={{
				backgroundColor: colorScheme === 'dark' ? colors.gray800 : colors.white,
				maxHeight: '90%',
				width: '100%',
				borderRadius: 8,
			}}
			contentInsetAdjustmentBehavior={'automatic'}
			onRequestClose={() => {
				setVisible(false)
				reset()
			}}
			onTouchOutside={() => {
				setVisible(false)
				reset()
			}}
		>
			<View className="flex flex-row items-center justify-end space-x-2 pb-1 px-1">
				<TouchableOpacity onPress={() => setVisible(false)}>
					<Ionicons name="close" size={24} color={colorScheme === 'dark' ? colors.white : colors.gray800} />
				</TouchableOpacity>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1, paddingTop: 5, paddingBottom: 10 }}
				className="h-full"
			>
				<View className="flex flex-row items-center justify-between space-x-2 pb-3">
					<Octicons name="checklist" size={24} color={colorScheme === 'dark' ? colors.white : colors.black} />
					<View className="flex-1 items-center justify-center ">
						<Text className="text-black text-center dark:text-white text-[15px] font-bold ">Questionário</Text>
					</View>
				</View>

				{generalQuestionnaires.map((questionnaire) => {
					return (
						<View key={questionnaire.id} className="py-3">
							<Controller
								control={control}
								name={questionnaire.option as keyof QuestionnaireData}
								render={({ field: { onChange, value } }) => (
									<TouchableOpacity
										activeOpacity={0.5}
										className={`flex flex-row items-center justify-between space-x-2 w-[100%]`}
										onPress={() => {
											if (value) {
												onChange(false)
												setSubKeys(false, questionnaire.option as keyof QuestionnaireData)
											} else {
												onChange(true)
												setSubKeys(true, questionnaire.option as keyof QuestionnaireData)
											}
											setErrorMessage('')
										}}
									>
										<View className="w-[85%]">
											<Text className="text-black dark:text-white text-[12px] font-mono">{questionnaire.question}</Text>
										</View>
										<View className="w-[15%] flex-row justify-between space-x-2">
											<Ionicons
												name={
													preconditions.subKeys.find((subKey) => subKey.key === questionnaire.option)?.value
														? 'checkbox-outline'
														: 'square-outline'
												}
												color={
													preconditions.subKeys.find((subKey) => subKey.key === questionnaire.option)?.value
														? colors.primary
														: colorScheme === 'dark'
															? colors.white
															: colors.black
												}
												size={24}
											/>
										</View>
									</TouchableOpacity>
								)}
							/>
						</View>
					)
				})}

				<View className="space-y-2">
					<View className="py-2">
						<Label label="O proprietário desta mercadoria é um ..." />
						<RadioButton
							checked={preconditions.ownerType === 'TRADER'}
							label="Comerciante"
							value={'TRADER'}
							onChange={() => {
								setOwnerType('TRADER')
								setErrorMessage('')
							}}
							textClassNames="text-[12px] text-black dark:text-white"
						/>
						<RadioButton
							checked={preconditions.ownerType === 'FARMER'}
							label="Produtor"
							value={'FARMER'}
							onChange={() => {
								setOwnerType('FARMER')
								setErrorMessage('')
							}}
							textClassNames="text-[12px] text-black dark:text-white"
						/>
						<RadioButton
							checked={preconditions.ownerType === 'GROUP'}
							label="Grupo de Produtores"
							value={'GROUP'}
							onChange={() => {
								setOwnerType('GROUP')
								setErrorMessage('')
							}}
							textClassNames="text-[12px] text-black dark:text-white"
						/>
						<RadioButton
							checked={preconditions.ownerType === 'INFORMAL_TRADER'}
							label="Comerciante Informal"
							value={'INFORMAL_TRADER'}
							onChange={() => {
								setOwnerType('INFORMAL_TRADER')
								setErrorMessage('')
							}}
							textClassNames="text-[12px] text-black dark:text-white"
						/>
					</View>

					{preconditions.ownerType === 'FARMER' &&
						farmerQuestionnaires.map((questionnaire) => {
							return (
								<View key={questionnaire.id} className="py-2">
									<Controller
										control={control}
										name={questionnaire.option as keyof QuestionnaireData}
										render={({ field: { onChange, value } }) => (
											<TouchableOpacity
												activeOpacity={0.5}
												className={`flex flex-row items-center justify-between space-x-2 w-[100%]`}
												onPress={() => {
													if (value) {
														onChange(false)
														setSubKeys(false, questionnaire.option as keyof QuestionnaireData)
													} else {
														onChange(true)
														setSubKeys(true, questionnaire.option as keyof QuestionnaireData)
													}
													setErrorMessage('')
												}}
											>
												<View className="w-[85%]">
													<Text className="text-black dark:text-white text-[12px] font-mono">
														{questionnaire.question}
													</Text>
												</View>
												<View className="w-[15%] flex-row justify-between space-x-2">
													<Ionicons
														name={
															preconditions.subKeys.find((subKey) => subKey.key === questionnaire.option)?.value
																? 'checkbox-outline'
																: 'square-outline'
														}
														color={
															preconditions.subKeys.find((subKey) => subKey.key === questionnaire.option)?.value
																? colors.primary
																: colorScheme === 'dark'
																	? colors.white
																	: colors.black
														}
														size={24}
													/>
												</View>
											</TouchableOpacity>
										)}
									/>
								</View>
							)
						})}
					{preconditions.ownerType === 'TRADER' &&
						traderQuestionnaires.map((questionnaire) => {
							return (
								<View key={questionnaire.id} className="py-2">
									<Controller
										control={control}
										name={questionnaire.option as keyof QuestionnaireData}
										render={({ field: { onChange, value } }) => (
											<TouchableOpacity
												activeOpacity={0.5}
												className={`flex flex-row items-center justify-between space-x-2 w-[100%]`}
												onPress={() => {
													if (value) {
														onChange(false)
														setSubKeys(false, questionnaire.option as keyof QuestionnaireData)
													} else {
														onChange(true)
														setSubKeys(true, questionnaire.option as keyof QuestionnaireData)
													}
													setErrorMessage('')
												}}
											>
												<View className="w-[85%]">
													<Text className="text-black dark:text-white text-[12px] font-mono">
														{questionnaire.question}
													</Text>
												</View>
												<View className="w-[15%] flex-row justify-between space-x-2">
													<Ionicons
														name={
															preconditions.subKeys.find((subKey) => subKey.key === questionnaire.option)?.value
																? 'checkbox-outline'
																: 'square-outline'
														}
														color={
															preconditions.subKeys.find((subKey) => subKey.key === questionnaire.option)?.value
																? colors.primary
																: colorScheme === 'dark'
																	? colors.white
																	: colors.black
														}
														size={24}
													/>
												</View>
											</TouchableOpacity>
										)}
									/>
								</View>
							)
						})}

					{errorMessage && (
						<View className="flex flex-row items-center justify-between space-x-2 bg-red-100 p-2 rounded-md my-2">
							<Text className="text-xs text-red-600">{errorMessage}</Text>
						</View>
					)}
				</View>
				<View className="justify-end flex-1 py-3">
					<SubmitButton disabled={isSubmitting} isSubmitting={isSubmitting} title="Confirmar" onPress={onSubmit} />
				</View>
			</ScrollView>
		</Dialog>
	)
}
