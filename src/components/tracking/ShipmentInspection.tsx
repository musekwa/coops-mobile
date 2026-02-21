import { View, Text, Modal, StyleSheet, ScrollView } from 'react-native'
import React, { useRef, useState } from 'react'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import LottieView from 'lottie-react-native'
import CustomTextInput from '../custom-text-input/CustomTextInput'
import { useActionStore } from 'src/store/actions/actions'
import { ShipmentStatusTypes } from 'src/constants/tracking'
import { Fontisto } from '@expo/vector-icons'
import FormItemDescription from '../forms/FormItemDescription'
import Label from '../forms/Label'
import ShipmentStepFormDescription from './ShipmentStepFormDescription'
import ConfirmOrCancelButtons from '../buttons/ConfirmOrCancelButtons'

const questionnaires = [
	{
		id: 1,
		yes: 'hasInspectedShipment',
		no: 'hasNotInspectedShipment',
		question: 'Confirma ter fiscalizado a mercadoria?',
		description: '',
	},
	{
		id: 2,
		yes: 'hasShipmentIrregularities',
		no: 'hasNotShipmentIrregularities',
		question: 'Encontrou irregularidades nesta mercadoria?',
		description: '',
	},
]

const QuestionnaireSchema = z
	.object({
		licenseId: z
			.string({
				message: 'Número da guia de trânsito é obrigatório',
			})
			.regex(/^\d{6}\/\d{4}$/, {
				message: 'Número da guia de trânsito inválido',
			}),
		hasInspectedShipment: z.enum(['YES', 'NO', 'DEFAULT']),
		hasNotInspectedShipment: z.enum(['YES', 'NO', 'DEFAULT']),
		hasShipmentIrregularities: z.enum(['YES', 'NO', 'DEFAULT']),
		hasNotShipmentIrregularities: z.enum(['YES', 'NO', 'DEFAULT']),
		notes: z
			.string()
			.min(0)
			.max(200, {
				message: 'O campo de notas deve ter no máximo 200 caracteres',
			})
			.optional(),
	})
	.refine(
		(data) => {
			if (
				(data.hasInspectedShipment === 'DEFAULT' && data.hasNotInspectedShipment === 'DEFAULT') ||
				(data.hasShipmentIrregularities === 'DEFAULT' && data.hasNotShipmentIrregularities === 'DEFAULT')
			) {
				return false
			}
			return true
		},
		{
			path: ['hasInspectedShipment'],
			message: 'Seleccione apenas uma opção entre "SIM" e "NÃO" para cada questão.',
		},
	)

type QuestionnaireData = z.infer<typeof QuestionnaireSchema>

type Props = {
	visible: boolean
	setVisible: (v: boolean) => void
	selectedCheckpointName: string
	setSelectedCheckpointName: (v: string) => void
	shipment: any
}

export default function ShipmentInspection({
	visible,
	setVisible,
	selectedCheckpointName,
	setSelectedCheckpointName,
	shipment,
}: Props) {
	const { setToast, setReloading } = useActionStore()
	const { colorScheme } = useColorScheme()
	const animation = useRef<LottieView>(null)
	const [isSaving, setIsSaving] = useState<boolean>(false)
	const pathLabel = shipment?.paths?.[shipment?.paths.length - 1]?.label

	const {
		control,
		handleSubmit,
		formState: { errors, isValid, isDirty, isSubmitting, isSubmitSuccessful, submitCount },
		reset,
		setValue, // set value of the form
		watch,
	} = useForm<QuestionnaireData>({
		defaultValues: {
			hasInspectedShipment: 'DEFAULT',
			hasNotInspectedShipment: 'DEFAULT',
			hasShipmentIrregularities: 'DEFAULT',
			hasNotShipmentIrregularities: 'DEFAULT',
			notes: '',
		},
		resolver: zodResolver(QuestionnaireSchema),
	})

	const notesValue = watch('notes')
	const licenseIdValue = watch('licenseId')
	const hasInspectedShipmentValue = watch('hasInspectedShipment')
	const hasNotInspectedShipmentValue = watch('hasNotInspectedShipment')
	const hasShipmentIrregularitiesValue = watch('hasShipmentIrregularities')
	const hasNotShipmentIrregularitiesValue = watch('hasNotShipmentIrregularities')

	const isLicenseIdInvalid =
		licenseIdValue &&
		licenseIdValue.length === shipment.transitLicense.id.length &&
		licenseIdValue !== shipment.transitLicense.id
	const isLicenseIdValid =
		licenseIdValue &&
		licenseIdValue.length === shipment.transitLicense.id.length &&
		licenseIdValue === shipment.transitLicense.id

	// update the checks array with the new check
	const updateChecks = () => {
		const newCheck = {
			checkedAt: new Date(),
			checkedBy: '',
			phone: '',
			place: '', // district of the user
			point: selectedCheckpointName, // the checkpoint where the user is located
			stage: '' === shipment?.destination ? ShipmentStatusTypes.AT_ARRIVAL : ShipmentStatusTypes.IN_TRANSIT,
			notes: `${pathLabel} - ${notesValue ?? 'N/A'}`,
		} as any

		try {
			setReloading(true)
		} catch (error) {
			setToast({
				title: 'Erro ao confirmar a fiscalização',
				description: 'Ocorreu um erro ao confirmar a fiscalização da mercadoria.',
				type: 'error',
				duration: 3000,
			})
			console.log(error)
			throw new Error('Erro ao confirmar a fiscalização')
		}
	}

	const onSubmit = (data: QuestionnaireData) => {
		setIsSaving(true)
		const result = QuestionnaireSchema.safeParse(data)
		if (result.success) {
			setVisible(false)
			setSelectedCheckpointName('')
			updateChecks()
			reset()
		} else {
			console.log('Data is invalid', result.error)
			return false
		}
		setIsSaving(false)
	}

	return (
		<Modal visible={visible} transparent={false} style={styles.fullScreen} onRequestClose={() => setVisible(false)}>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1, paddingVertical: 30, justifyContent: 'center' }}
				className="h-full p-4  bg-white dark:bg-black"
			>
				<View className="items-center relative">
					<LottieView
						autoPlay={true}
						ref={animation}
						style={{
							width: 180,
							height: 120,
						}}
						source={require('../../../assets/lottie/location.json')}
					/>
					<View className="flex-1 absolute ">
						<Text className="text-black text-center dark:text-white text-[15px] font-bold ">
							Fiscalização da Mercadoria
						</Text>
					</View>
					<View className="flex items-center justify-center py-2">
						<Label label={selectedCheckpointName} />

						<FormItemDescription description="No âmbito da fiscalização da mercadoria, por favor, confirme o número da guia e responda às seguintes questões." />
					</View>
				</View>

				<View>
					<Controller
						name="licenseId"
						control={control}
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<View>
								<CustomTextInput
									value={value}
									onChangeText={onChange}
									placeholder="Número da Guia"
									label="Número da Guia"
								/>
								{error ? <Text>{error.message}</Text> : <FormItemDescription description="Confirma o número da Guia" />}
							</View>
						)}
					/>
				</View>

				{isLicenseIdInvalid && (
						<View className="py-6">
							<ShipmentStepFormDescription
								bgColor={colors.dangerBackground}
								textColor={colors.dangerText}
								description={'O número da Guia de Trânsito não corresponde ao número da guia informado.'}
							/>
						</View>
					)}
					{isLicenseIdValid && (
						<View className="py-6">
							<ShipmentStepFormDescription
								bgColor={colors.successBackground}
								textColor={colors.successText}
								iconName="checkmark-circle-outline"
								description={'O número da Guia de Trânsito corresponde ao número da guia informado.'}
							/>
						</View>
					)}


				<View className="space-y-2 pt-3 flex-1 justify-around ">
					<View className="flex space-y-3">
						<View className="flex flex-row space-x-2 ">
							<View className="flex-1">
								<Text className="font-bold text-black dark:text-white ">Questão</Text>
							</View>
							<View className="w-[30%] flex-row justify-between space-x-2">
								<Text className="font-bold text-black dark:text-white text-[12px]">Sim</Text>
								<Text className="font-bold text-black dark:text-white text-[12px]">Não</Text>
							</View>
						</View>
						{questionnaires.map((questionnaire) => (
							<View key={questionnaire.id} className="flex flex-row space-x-2 items-center py-1">
								<View className="flex-1">
									<Text className="text-black dark:text-white text-[14px] font-mono">{questionnaire.question}</Text>
								</View>

								<View className="w-[30%] flex flex-row justify-between space-x-2">
									<Controller
										control={control}
										name={questionnaire.yes as keyof QuestionnaireData}
										render={({ field: { onChange, value } }) => (
											<Fontisto
												onPress={() => {
													onChange('YES')
													setValue(questionnaire.no as keyof QuestionnaireData, 'YES')
												}}
												name={value === 'YES' ? 'checkbox-active' : 'checkbox-passive'}
												color={value === 'YES' ? colors.primary : colorScheme === 'dark' ? colors.white : colors.black}
												size={20}
											/>
										)}
									/>

									<Controller
										control={control}
										name={questionnaire.no as keyof QuestionnaireData}
										render={({ field: { onChange, value } }) => (
											<Fontisto
												onPress={() => {
													onChange('NO')
													setValue(questionnaire.yes as keyof QuestionnaireData, 'NO')
												}}
												name={value === 'NO' ? 'checkbox-active' : 'checkbox-passive'}
												color={value === 'NO' ? colors.primary : colorScheme === 'dark' ? colors.white : colors.black}
												size={20}
											/>
										)}
									/>
								</View>
							</View>
						))}
						{errors.hasInspectedShipment && (
							<Text className="text-xs text-red-500">{errors.hasInspectedShipment?.message}</Text>
						)}
					</View>
					{hasShipmentIrregularitiesValue === 'YES' && (
						<View className="pt-4">
							<Controller
								control={control}
								name="notes"
								rules={{ required: false }}
								render={({ field: { onChange, value, onBlur } }) => (
									<CustomTextInput
										label="Notas sobre as irregularidades"
										multiline={true}
										numberOfLines={3}
										autoCapitalize="sentences"
										placeholder={'Descreva as irregularidades encontradas...'}
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
									/>
								)}
							/>

							<View className="flex flex-row items-center justify-between space-x-6">
								<FormItemDescription description="Até 200 caracteres no máximo." />
							</View>
						</View>
					)}

					<View className="space-y-2 pt-4 flex-1">
						<ConfirmOrCancelButtons
							confirmText="Confirmar"
							cancelText="Cancelar"
							onConfirmDisabled={!isValid || isLicenseIdInvalid || isSubmitting || isSaving}
							onCancelDisabled={false}
						onCancel={() => {
							setVisible(false)
							setSelectedCheckpointName('')
							reset()
						}}
							onConfirm={handleSubmit(onSubmit)}
							isLoading={isSaving}
						/>
					</View>
				</View>
			</ScrollView>
		</Modal>
	)
}
const styles = StyleSheet.create({
	fullScreen: {
		backgroundColor: colors.black,
	},
})
