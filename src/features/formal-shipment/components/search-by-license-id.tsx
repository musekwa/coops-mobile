// React and React Native
import { View } from 'react-native'

// Third Party Libraries
import { Ionicons } from '@expo/vector-icons'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Components
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'

// Constants and Utils
import { colors } from 'src/constants'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import { useCallback, useState } from 'react'
import { useRouter } from 'expo-router'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import ShipmentStepFormDescription from 'src/components/tracking/ShipmentStepFormDescription'
const LicenseIdSchema = z.object({
	licenseId: z.string().regex(/^[0-9]{6}\/[0-9]{4}$/, { message: 'Número de Guia de Trânsito inválido' }),
})

type LicenseIdFormData = z.infer<typeof LicenseIdSchema>

type SearchByLicenseIdProps = {
	isLoading: boolean
	setIsLoading: (isLoading: boolean) => void
}

export default function SearchByLicenseId({ isLoading, setIsLoading }: SearchByLicenseIdProps) {
	const router = useRouter()
	const [errorMessage, setErrorMessage] = useState('')
	const [isVisible, setIsVisible] = useState(false)


	const {
		control,
		setError,
		setValue,
		clearErrors,
		handleSubmit,
		watch,
		formState: { errors, isValid, isDirty, isSubmitting, isSubmitSuccessful, submitCount },
	} = useForm<LicenseIdFormData>({
		defaultValues: {
			licenseId: '',
		},
		resolver: zodResolver(LicenseIdSchema),
	})

	const licenseIdValue = watch('licenseId')

	const isLicenseIdValid = (licenseId: string) => {
		return licenseId.match(/^[0-9]{6}\/[0-9]{4}$/)
	}

	const findShipmentByLicenseId = useCallback(() => {
		if (!licenseIdValue) {
			setError('licenseId', { message: 'Número de Guia de Trânsito inválido' })
			return
		}

		const shipment: any[] = []

		if (shipment.length === 0) {
			setError('licenseId', { message: 'Não foi encontrado uma mercadoria com este número de Guia de Trânsito' })
			return
		}

		return shipment[0]
	}, [licenseIdValue, setError])

	const onSubmit = (data: LicenseIdFormData) => {
		const result = LicenseIdSchema.safeParse(data)
		if (result.success) {
			setIsLoading(true)
			const shipment = findShipmentByLicenseId()
			if (!shipment) return
			router.push(`/trades/transit/shipment-inspection?shipmentId=${shipment._id}`)
            setValue('licenseId', '')
		} else {
			setError('licenseId', { message: 'Número de Guia de Trânsito inválido' })
		}
		// setValue('licenseId', '')
	}

	return (
		<View>
			<View className="flex flex-row space-x-2">
				<View className="flex-1">
					<Controller
						control={control}
						name="licenseId"
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<View className="flex-1">
								<View className="relativeflex-1 flex-row items-center justify-between space-x-3">
									<View className="flex-1 relative">
										<CustomTextInput
											label=""
											value={value}
											onChangeText={(text) => {
												onChange(text)
												clearErrors('licenseId')
											}}
											onBlur={onBlur}
											placeholder="Número da Guia de Trânsito"
											keyboardType="default"
										/>
										{value && (
											<Ionicons
												name="close"
												size={20}
												color={colors.gray600}
												style={{ position: 'absolute', right: 8, top: '30%', transform: [{ translateY: -8 }] }}
												onPress={() => {
													onChange('')
													clearErrors('licenseId')
												}}
											/>
										)}
										<FormItemDescription description="Procura pelo número da Guia de Trânsito" />
									</View>
								</View>
							</View>
						)}
					/>
				</View>
				<View className="">
					<Ionicons
						disabled={!isLicenseIdValid(licenseIdValue)}
						onPress={handleSubmit(onSubmit)}
						name="search-circle"
						size={55}
						color={colors.primary}
						style={{ transform: [{ rotate: '90deg' }], opacity: isLicenseIdValid(licenseIdValue) ? 1 : 0.5 }}
					/>
				</View>
			</View>

			<View className="mt-4">
				{(!!errors.licenseId && licenseIdValue) && (
					<ShipmentStepFormDescription
						bgColor={colors.dangerBackground}
						textColor={colors.dangerText}
						description="Não foi encontrado uma mercadoria com este número de Guia de Trânsito"
					/>
				)}
			</View>

			<ErrorAlert
				title="Erro"
				setVisible={setIsVisible}
				visible={isVisible}
				message={errorMessage}
				setMessage={setErrorMessage}
			/>
		</View>
	)
}
