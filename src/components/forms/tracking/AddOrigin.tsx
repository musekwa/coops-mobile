import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CustomPicker } from 'src/components/custom-select-item/CustomPicker'
import { destinationProvinces } from 'src/constants/provinces'
import { destinationDistricts } from 'src/constants/districts'
import FormItemDescription from '../FormItemDescription'
const OriginSchema = z.object({
	district: z
		.string({
			message: 'Distrito de origem é obrigatório',
		})
		.min(3, {
			message: 'Distrito de origem',
		}),
	province: z
		.string({
			message: 'Província de origem é obrigatório',
		})
		.min(3, {
			message: 'Província de origem',
		}),
})

type OriginFormData = z.infer<typeof OriginSchema>

type AddOriginProps = {
	districtDescription: string
	provinceDescription: string
	setValue: (location: 'originDistrict' | 'originProvince', value: string) => void
}

export default function AddOrigin({ provinceDescription, districtDescription, setValue }: AddOriginProps) {
	const { control, getValues, watch } = useForm<OriginFormData>({
		defaultValues: {},
		resolver: zodResolver(OriginSchema),
	})

	const provinceValue = watch('province')
	const districtValue = watch('district')

	useEffect(() => {
		if (provinceValue) {
			setValue('originProvince', provinceValue)
		} else {
			setValue('originProvince', '')
		}
		if (districtValue) {
			setValue('originDistrict', districtValue)
		} else {
			setValue('originDistrict', '')
		}
	}, [provinceValue, districtValue])

	return (
		<View className="flex-1 flex-col space-y-4">
			<View className="flex-1">
				<Controller
					control={control}
					name="province"
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<CustomPicker
								value={value || provinceValue}
								setValue={onChange}
								items={destinationProvinces?.map((province) => ({ label: province, value: province }))}
								placeholder={{ label: provinceDescription, value: null }}
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : (
								<FormItemDescription description={provinceDescription} />
							)}
						</>
					)}
				/>
			</View>
			<View className="flex-1">
				<Controller
					control={control}
					name="district"
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<>
							<CustomPicker
								value={value || districtValue}
								setValue={onChange}
								items={destinationDistricts[getValues().province]?.map((district) => ({
									label: district,
									value: district,
								}))}
								placeholder={{ label: districtDescription, value: null }}
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : (
								<FormItemDescription description={districtDescription} />
							)}
						</>
					)}
				/>
			</View>
		</View>
	)
}
