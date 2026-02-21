import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { Ionicons } from '@expo/vector-icons'
import { Switch } from 'react-native'
import { TouchableOpacity } from 'react-native'
import countries from 'src/constants/countries'
import { useExportationInfoStore, ExportationInfoState } from 'src/store/trades'
import CustomSelectItem from 'src/components/ui/custom-select-item'
import Label from '../Label'
import CustomSelectItemTrigger from 'src/components/ui/custom-select-item-trigger'
const TransactionSchema = z
	.object({
		hasSentToExportation: z.boolean(),
		exportations: z
			.array(
				z.object({
					country: z.string(),
					quantity: z.number().min(0, 'A quantidade deve ser maior ou igual a 0 Kg.').optional(),
				}),
			)
			.optional(),
	})
	.refine(
		(data) => {
			if (data.hasSentToExportation && (!data.exportations || data.exportations.length === 0)) {
				return false
			}
			return true
		},
		{
			message: 'Indica a quantidade exportada e o país de destino.',
			path: ['hasSentToExportation'],
		},
	)

type TransactionData = z.infer<typeof TransactionSchema>

type ExportedInfoProps = {
	customErrors: Record<string, string>
	setCustomErrors: (customErrors: Record<string, string>) => void
}

export default function AddExportedInfo({ customErrors, setCustomErrors }: ExportedInfoProps) {
	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
		getValues,
		watch,
		clearErrors,
	} = useForm<TransactionData>({
		defaultValues: {
			hasSentToExportation: false,
			exportations: [],
		},
		resolver: zodResolver(TransactionSchema),
	})

	const [activeCountries, setActiveCountries] = useState<string[]>([])
	const [showCountries, setShowCountries] = useState(false)
	const hasSentToExportationValue = watch('hasSentToExportation')
	const exportations = watch('exportations') || []
	const { setExportationInfo, resetExportationInfo, setHasSentToExportation } = useExportationInfoStore()

	useEffect(() => {
		validateExportations()
	}, [hasSentToExportationValue, exportations])

	const validateExportations = () => {
		const hasSentToExportation = getValues('hasSentToExportation')
		const exportations = getValues('exportations')
		setHasSentToExportation(hasSentToExportation)
		if (hasSentToExportation) {
			if (exportations && exportations.length > 0 && exportations.every((exportation) => exportation.country)) {
				const exportationInfo: ExportationInfoState = {
					hasSentToExportation: true,
					exportations: exportations.map((exportation) => ({
						country: exportation.country,
						quantity: exportation.quantity || 0,
					})),
				}
				setExportationInfo(exportationInfo)
				setCustomErrors({ ...customErrors, exported: '', outgoing: '' })
			}
		}
	}

	return (
		<ScrollView className="border border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 my-3">
			<View className="flex-row items-center justify-between mb-4">
				<View className="flex-1">
					<Text className="text-sm text-gray-600 dark:text-gray-400">Enviou castanha para exportação?</Text>
				</View>

				<Controller
					control={control}
					name="hasSentToExportation"
					render={({ field: { onChange, value } }) => (
						<Switch
							value={value}
							onValueChange={(newValue: boolean) => {
								onChange(newValue)
								if (!newValue) {
									setValue('exportations', [])
									setActiveCountries([])
									setCustomErrors({ ...customErrors, exported: '', outgoing: '' })
									resetExportationInfo()
								}
							}}
							thumbColor={value ? '#008000' : '#f4f3f4'}
							trackColor={{ false: '#767577', true: '#008000' }}
						/>
					)}
				/>
			</View>

			{hasSentToExportationValue && (
				<>
					{activeCountries.map((countryValue, index) => {
						const country = countries.find((c) => c.value === countryValue)
						if (!country) return null
						return (
							<View key={country.value} className="mt-4 border-t border-gray-200 pt-4">
								<View className="flex-row justify-between items-center mb-2">
									<Text className="text-gray-600 dark:text-gray-400 text-[12px] font-semibold">{country.label}</Text>
									<TouchableOpacity
										onPress={() => {
											setActiveCountries((prev) => prev.filter((id) => id !== country.value))
											setValue(
												'exportations',
												exportations.filter((_, i) => i !== index),
											)
											// remove the exportation from the exportation info
											setExportationInfo({
												hasSentToExportation: true,
												exportations:
													exportations && exportations.length > 0
														? exportations
																.filter((_, i) => i !== index)
																.map((e) => ({ ...e, quantity: e.quantity as number }))
														: [],
											})
										}}
									>
										<Ionicons name="close-circle-outline" size={24} color="red" />
									</TouchableOpacity>
								</View>
								<View className="flex flex-row justify-between space-x-2 items-center mt-2">
									<View className="w-[80px]">
										<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Quantidade exportada</Text>
									</View>
									<View className="flex-1">
										<Controller
											control={control}
											name={`exportations.${index}.quantity`}
											render={({ field: { value, onChange }, fieldState: { error } }) => (
												<>
													<View className="relative">
														<CustomTextInput
															label=""
															keyboardType="numeric"
															value={value === undefined ? '' : value.toString()}
															onChangeText={(text) => {
																const newQuantity = text === '' ? undefined : parseFloat(text)
																const newExportations = [...exportations]
																newExportations[index] = {
																	country: country.label,
																	quantity: newQuantity,
																}
																setValue('exportations', newExportations, { shouldValidate: true })
															}}
															placeholder="Qtd. em kg"
														/>
														<View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
															<Text className="text-gray-600 dark:text-gray-400 text-[12px]">Kg</Text>
														</View>
													</View>
													<Text className="text-[12px] italic text-gray-500">Qtd. exportada</Text>
												</>
											)}
										/>
									</View>
								</View>
							</View>
						)
					})}

					{activeCountries.length < countries.length && (
						<View className="mt-4">
							<Label label="País de destino" />

							<CustomSelectItemTrigger
								selectedItem={'Seleccione o país de destino'}
								setShowItems={setShowCountries}
								hasSelectedItem={false}
								resetItem={() => {}}
							/>
							<CustomSelectItem
								label="Seleccione o país de destino"
								searchPlaceholder="Procurar um país"
								showModal={showCountries}
								setShowModal={setShowCountries}
								itemsList={countries
									.filter((c) => !activeCountries.includes(c.value) && c.value !== 'Moçambique')
									.map((c) => ({ label: c.label, value: c.value, icon: '' }))}
								setValue={(countryValue) => {
									if (countryValue && !activeCountries.includes(countryValue) && countryValue !== 'Moçambique') {
										const country = countries.find((c) => c.value === countryValue)
										if (country) {
											setActiveCountries((prev) => [...prev, countryValue])
											setValue('exportations', [...exportations, { country: country.label, quantity: undefined }])
										}
									}
								}}
							/>
							<Text className="text-gray-500 dark:text-gray-400 text-[12px] italic mb-2">País de destino</Text>
						</View>
					)}
				</>
			)}

			{customErrors.exported && <Text className="text-xs text-red-500 mt-2">{customErrors.exported}</Text>}
		</ScrollView>
	)
}
