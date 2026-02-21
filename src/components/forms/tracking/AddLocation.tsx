import { Text, View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import FormItemDescription from '../FormItemDescription'
import { CustomPicker } from 'src/components/custom-select-item/CustomPicker'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Label from '../Label'
import { useEffect } from 'react'

const LocationSchema = z.object({
	location: z.string().min(1, 'Indica a província ou distrito'),
})

type LocationFormData = z.infer<typeof LocationSchema>

interface AddLocationProps {
	items: { label: string; value: string }[]
	locationDescription: string
	label: string
	setValue: (location: 'destinationDistrict' | 'destinationProvince' | 'originDistrict' | 'originProvince' | 'destinationCountry', value: string) => void
    hint: 'destinationDistrict' | 'destinationProvince' | 'originDistrict' | 'originProvince' | 'destinationCountry'
}

export default function AddLocation({ items, locationDescription, label, setValue, hint }: AddLocationProps) {
	const {
		control,
		formState: { errors, isValid, isDirty },
		watch,
	} = useForm<LocationFormData>({
		defaultValues: {
			location: '',
		},
		resolver: zodResolver(LocationSchema),
	})

	const locationValue = watch('location')

	useEffect(() => {
		if (locationValue && hint === 'destinationDistrict') {
			setValue('destinationDistrict', locationValue)
		}
		if (locationValue && hint === 'destinationProvince') {
			setValue('destinationProvince', locationValue)
		}
		if (locationValue && hint === 'originDistrict') {
			setValue('originDistrict', locationValue)
		}
		if (locationValue && hint === 'originProvince') {
			setValue('originProvince', locationValue)
		}
		if (locationValue && hint === 'destinationCountry') {
			setValue('destinationCountry', locationValue)
		}
	}, [locationValue])

	return (
		<View className="flex-1">
			<Label label={label} />
			<Controller
				control={control}
				name="location"
				render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
					<View>
						<CustomPicker
							value={value}
							setValue={onChange}
							items={items}
							placeholder={{ label: locationDescription, value: null }}
						/>
						{error ? (
							<Text className="text-xs text-red-500">{error.message}</Text>
						) : (
							<FormItemDescription description={locationDescription} />
						)}
					</View>
				)}
			/>
		</View>
	)
}
