import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Components
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { CustomPicker } from 'src/components/custom-select-item/CustomPicker'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import Label from '../Label'
import FormItemDescription from '../FormItemDescription'
import NextAndPreviousButtons from 'src/components/buttons/NextAndPreviousButtons'
import FormWrapper from '../FormWrapper'

// Hooks & Utils
import { useActionStore } from 'src/store/actions/actions'

import { getLast10DaysInfo } from 'src/helpers/dates'
import AddLicensePhoto from './AddLicensePhoto'
import { useQueryMany, useUserDetails } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useShipmentLicenseStore } from 'src/store/shipment/shipment_license'
import SelectAddress from 'src/custom-ui/select-address'
import { AddressLevel } from 'src/types'
import { useAddressStore } from 'src/store/address'

const ShipmentLicenseSchema = z.object({
	shipmentNumber: z
		.string({
			message: 'Número da guia de trânsito é obrigatório',
		})
		.regex(/^\d{6}$/, {
			message: 'Número da guia de trânsito inválido',
		}),
	day: z
		.string({
			message: 'Dia de emissão da guia de trânsito é obrigatório',
		})
		.min(1, {
			message: 'Dia de emissão da guia de trânsito',
		}),
	month: z
		.string({
			message: 'Mês de emissão da guia de trânsito é obrigatório',
		})
		.min(1, {
			message: 'Mês de emissão da guia de trânsito',
		}),
	year: z
		.string({
			message: 'Ano de emissão da guia de trânsito é obrigatório',
		})
		.min(1, {
			message: 'Ano de emissão da guia de trânsito',
		}),
})

type ShipmentLicenseFormData = z.infer<typeof ShipmentLicenseSchema>

export default function AddLicenseInfo() {
	const { userDetails } = useUserDetails()
	const { currentStep, setCurrentStep, totalSteps } = useActionStore()
	const { setShipmentLicenseInfo, shipmentLicenseInfo } = useShipmentLicenseStore()
	const {
		partialAddress: { adminPostId, villageId },
	} = useAddressStore()

	const [hasError, setHasError] = useState(false)
	const [message, setMessage] = useState('')

	const {
		control,
		formState: { errors, isValid },
		watch,
		setValue,
	} = useForm<ShipmentLicenseFormData>({
		defaultValues: {},
		resolver: zodResolver(ShipmentLicenseSchema),
	})

	const shipmentNumberValue = watch('shipmentNumber')

	const { data: shipmentNumbers } = useQueryMany(
		`
		SELECT shipment_number FROM ${TABLES.CASHEW_SHIPMENTS} 
		WHERE shipment_number = '${shipmentNumberValue}'
		`,
	)

	const [isUsedLicenseId, setIsUsedLicenseId] = useState(false)

	useEffect(() => {
		if (shipmentNumbers.length > 0) {
			setIsUsedLicenseId(true)
		} else {
			setIsUsedLicenseId(false)
		}
	}, [shipmentNumbers, shipmentNumberValue])

	const validateShipmentNumber = () => {
		const { shipmentNumber } = watch()
		const shipmentNumberRegex = /^\d{6}$/
		return shipmentNumberRegex.test(shipmentNumber)
	}

	const validateIssuedDate = () => {
		const { day, month, year } = shipmentLicenseInfo
		const issuedDate = new Date(`${year}-${month}-${day}`)
		const today = new Date()

		// Check if the issued date is in the future (greater than today)
		if (issuedDate > today) {
			return true // Invalid - date is in the future
		}

		// Check if the issued date is more than 10 days before today
		const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)
		if (issuedDate < tenDaysAgo) {
			return true // Invalid - date is too old (more than 10 days ago)
		}

		return false // Valid - date is within the last 10 days
	}

	const handleNextStep = () => {
		if (!validateShipmentNumber()) {
			setHasError(true)
			setMessage('Número da guia de trânsito inválido')
			return
		}
		if (isUsedLicenseId) {
			setHasError(true)
			setMessage('Número da guia de trânsito já foi utilizado')
			return
		}
		if (validateIssuedDate()) {
			setHasError(true)
			setMessage('A data de emissão deve estar dentro dos últimos 10 dias e não pode ser posterior à data actual')
			return
		}
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1)
			const year = new Date().getFullYear()

			setShipmentLicenseInfo(`${shipmentNumberValue}-${year}`, 'shipmentNumber')
		}
	}

	const handlePreviousStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1)
		}
	}

	const { days, months, years } = getLast10DaysInfo()

	return (
		<View className="flex-1">
			<FormWrapper>
				{/* License number */}
				<FormItemDescription description="Dados da Guia de Trânsito" />
				<View>
					<AddLicensePhoto setHasError={setHasError} setMessage={setMessage} />
					{errors.shipmentNumber && <Text className="text-xs text-red-500">{errors.shipmentNumber.message}</Text>}
				</View>
				<View>
					<Label label="Número da Guia de Trânsito" />
					<View className="flex-1">
						<Controller
							control={control}
							render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
								<>
									<CustomTextInput
										value={value}
										onChangeText={(value) => {
											onChange(value)
											// setShipmentLicenseInfo(value, 'shipmentNumber')
										}}
										onBlur={onBlur}
										label=""
										keyboardType="default"
										placeholder={`ex: 000000`}
									/>
								</>
							)}
							name="shipmentNumber"
							rules={{ required: '6 dígitos da guia de trânsito' }}
						/>
						{errors.shipmentNumber ? (
							<Text className="text-xs text-red-500">{errors.shipmentNumber.message}</Text>
						) : (
							<FormItemDescription description="Indica os 6 dígitos da guia de trânsito" />
						)}
					</View>
				</View>

				{/* Transit licenseand photo */}
				<View className="">
					{/* Date of delivery of the transit license */}
					<Label label="Data de emissão da guia" />
					<View className="flex flex-row justify-around space-x-4">
						<View className="flex-1">
							<Controller
								control={control}
								render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
									<CustomPicker
										value={value}
										setValue={(value) => {
											onChange(value)
											setShipmentLicenseInfo(value, 'day')
										}}
										placeholder={{ label: 'Dia', value: null }}
										items={days.map((i) => ({ label: String(i), value: String(i) }))}
									/>
								)}
								name="day"
								rules={{ required: 'Dia de emissão da guia de trânsito é obrigatório' }}
							/>
						</View>
						<View className="flex-1">
							<Controller
								control={control}
								render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
									<CustomPicker
										value={value}
										setValue={(value) => {
											onChange(value)
											setShipmentLicenseInfo(value, 'month')
										}}
										placeholder={{ label: 'Mês', value: null }}
										items={months.map((i) => ({ label: String(i), value: String(i) }))}
									/>
								)}
								name="month"
								rules={{ required: 'Mês de emissão da guia de trânsito é obrigatório' }}
							/>
						</View>
						<View className="flex-1">
							<Controller
								control={control}
								render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
									<CustomPicker
										value={value}
										setValue={(value) => {
											onChange(value)
											setShipmentLicenseInfo(value, 'year')
										}}
										placeholder={{ label: 'Ano', value: null }}
										items={years.map((year) => ({
											label: String(year),
											value: String(year),
										}))}
									/>
								)}
								name="year"
								rules={{ required: 'Ano de emissão da guia de trânsito é obrigatório' }}
							/>
						</View>
					</View>
					<FormItemDescription description="Indica a data de emissão da guia de trânsito" />
				</View>

				{userDetails?.district_id && (
					<View className="py-4">
						<SelectAddress
							control={control}
							errors={errors}
							customErrors={errors}
							clearFieldError={() => {}}
							districtId={userDetails?.district_id}
							addressLevel={AddressLevel.FROM_ADMIN_POSTS}
							description="Local de Emissão da Guia de Trânsito"
						/>
					</View>
				)}
			</FormWrapper>

			<NextAndPreviousButtons
				// currentStep={currentStep}
				handlePreviousStep={handlePreviousStep}
				handleNextStep={handleNextStep}
				nextButtonDisabled={isUsedLicenseId || !adminPostId || !villageId || !shipmentLicenseInfo.photoUrl || !validateShipmentNumber()}
				previousButtonDisabled={currentStep === 0}
				showPreviousButton={false}
			/>

			<ErrorAlert title="" visible={hasError} message={message} setVisible={setHasError} setMessage={setMessage} />
		</View>
	)
}
