import { Ionicons } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useColorScheme } from 'nativewind'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Text } from 'react-native'
import { ScrollView } from 'react-native'
import { Modal, View, TouchableOpacity } from 'react-native'
import RadioButton from 'src/components/buttons/RadioButton'
import SubmitButton from 'src/components/buttons/SubmitButton'
import { CustomPicker } from 'src/components/custom-select-item/CustomPicker'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import Label from 'src/components/forms/Label'
import ShipmentStepFormDescription from 'src/components/tracking/ShipmentStepFormDescription'
import { colors } from 'src/constants'
import districts from 'src/constants/districts'
import provinces from 'src/constants/provinces'
import { ShipmentStatusTypes } from 'src/constants/tracking'
// import { Shipment } from 'src/models/shipment'
import { PathLabelType } from 'src/types'
import { z } from 'zod'

const DestinationSchema = z.object({
	province: z.string({ message: 'Seleccione a província' }).min(1, { message: 'Seleccione a província' }),
	district: z.string({ message: 'Seleccione o distrito' }).min(1, { message: 'Seleccione o distrito' }),
	label: z.enum([PathLabelType.CHANGED_AS_PER_SHIPMENT_REJECTION, PathLabelType.CHANGED_UNEXPECTEDLY_BY_DRIVER], {
		message: 'Seleccione o motivo da mudança de rota',
	}),
})

type DestinationFormData = z.infer<typeof DestinationSchema>

interface PathEditProps {
	visible: boolean
	setVisible: (visible: boolean) => void
	shipment: any
	setSelectedDistrict: (district: string) => void
	setSelectedProvince: (province: string) => void
	setConfirmDialogVisible: (visible: boolean) => void
	setHasError: (hasError: boolean) => void
	setErrorMessage: (errorMessage: string) => void
	setSelectedPathLabel: (pathLabel: PathLabelType) => void
}

export default function PathEdit({
	visible,
	setVisible,
	shipment,
	setSelectedDistrict,
	setSelectedProvince,
	setConfirmDialogVisible,
	setHasError,
	setErrorMessage,
	setSelectedPathLabel,
}: PathEditProps) {
	const isDark = useColorScheme().colorScheme === 'dark'
	const [description, setDescription] = useState('')
	const currentPath = shipment?.paths?.[shipment.paths.length - 1]
	const firstCheck = shipment.checks[0]
	const lastCheck = shipment.checks.length > 0 ? shipment.checks[shipment.checks.length - 1] : null
	const firstCheckDistrict = firstCheck?.place
	const lastCheckDistrict = lastCheck?.place
	const isAtDeparture = lastCheck?.stage === ShipmentStatusTypes.AT_DEPARTURE
	const isAtDestination = lastCheck?.stage === ShipmentStatusTypes.AT_ARRIVAL


	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
		reset,
	} = useForm<DestinationFormData>({
		defaultValues: {
			province: '',
			district: '',
			label: undefined,
		},
		resolver: zodResolver(DestinationSchema),
	})

	const provinceValue = watch('province')
	const districtValue = watch('district')
	const labelValue = watch('label')

	useEffect(() => {
		// Se a mercadoria está no ponto de partida
		if (isAtDeparture) {
			setDescription(
				`Partiu de ${firstCheckDistrict}. A caminho de ${currentPath?.districts[currentPath.districts.length - 1]}. Novo destino?`,
			)
		} else if (isAtDestination) {
			setDescription(`Partiu de ${firstCheckDistrict}. Chegou ao destino (${lastCheckDistrict}). Novo destino?`)
		} else {
			setDescription(
				`Partiu de ${lastCheckDistrict}. A caminho de ${currentPath?.districts[currentPath.districts.length - 1]}. Novo destino?`,
			)
		}
	}, [isAtDeparture, isAtDestination, lastCheckDistrict, currentPath])

	const modifiedProvinces = provinces
		.filter((province) => !province.includes('Estrangeiro'))
		.map((province) => ({
			label: province,
			value: province,
		}))

	const onSubmit = (data: DestinationFormData) => {
		if (
			data.district !== '' &&
			data.province !== '' &&
			data.district !== currentPath?.districts[currentPath.districts.length - 1]
		) {
			setConfirmDialogVisible(true)
			setSelectedDistrict(data.district)
			setSelectedProvince(data.province)
			setSelectedPathLabel(data.label)
			reset()
		} else {
			setHasError(true)
			setErrorMessage('O novo distrito de destino deve ser diferente do distrito de destino actual.')
			return
		}
	}

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={() => {
				setVisible(false)
			}}
		>
			<View className="flex-1 bg-white dark:bg-black px-3">
				<View className="p-3 relative">
					<TouchableOpacity
						onPress={() => {
							setVisible(false)
						}}
						className="absolute top-3 right-3 z-10"
					>
						<Ionicons name="close-outline" size={24} color={isDark ? colors.white : colors.gray600} />
					</TouchableOpacity>
					<Text className="text-[14px] font-bold text-center">Mudança de Rota</Text>
				</View>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
						justifyContent: 'center',
						paddingVertical: 30,
					}}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<View className="">
						<ShipmentStepFormDescription description={description} />
					</View>
					<View className="flex-1 py-6 space-y-6">
						<View className="">
							<FormItemDescription description={'Indicar novo destino'} />
						</View>
						<View>
							<Label label={'Província'} />
							<Controller
								control={control}
								name="province"
								render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
									<View>
										<CustomPicker
											value={value}
											setValue={onChange}
											items={modifiedProvinces}
											placeholder={{ label: 'Seleccione a província', value: null }}
										/>
										{error ? (
											<Text className="text-xs text-red-500">{error.message}</Text>
										) : (
											<FormItemDescription description={'Seleccione a província'} />
										)}
									</View>
								)}
							/>
						</View>
						<View>
							<Label label={'Distrito'} />
							<Controller
								control={control}
								name="district"
								render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
									<View>
										<CustomPicker
											value={value}
											setValue={onChange}
											items={
												provinceValue
													? districts[provinceValue].map((district) => ({ label: district, value: district }))
													: []
											}
											placeholder={{ label: 'Seleccione o distrito', value: null }}
										/>
										{error ? (
											<Text className="text-xs text-red-500">{error.message}</Text>
										) : (
											<FormItemDescription description={'Seleccione o distrito'} />
										)}
									</View>
								)}
							/>
						</View>

						<View>
							<Label label={'Motivo da mudança de rota'} />
							<Controller
								control={control}
								name="label"
								render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
									<View>
										<RadioButton
											label="Mercadoria rejeitada pelo destinatário"
											value={PathLabelType.CHANGED_AS_PER_SHIPMENT_REJECTION}
											checked={labelValue === PathLabelType.CHANGED_AS_PER_SHIPMENT_REJECTION}
											onChange={() => onChange(PathLabelType.CHANGED_AS_PER_SHIPMENT_REJECTION)}
										/>
										<RadioButton
											label="Mudança de rota por outro motivo"
											value={PathLabelType.CHANGED_UNEXPECTEDLY_BY_DRIVER}
											checked={labelValue === PathLabelType.CHANGED_UNEXPECTEDLY_BY_DRIVER}
											onChange={() => onChange(PathLabelType.CHANGED_UNEXPECTEDLY_BY_DRIVER)}
										/>
										{error ? (
											<Text className="text-xs text-red-500">{error.message}</Text>
										) : (
											<FormItemDescription description={'Seleccione o motivo da mudança de rota'} />
										)}
									</View>
								)}
							/>
						</View>

						<View className="">
							<SubmitButton title="Gravar" onPress={handleSubmit(onSubmit)} />
						</View>
					</View>
				</ScrollView>
			</View>
		</Modal>
	)
}
