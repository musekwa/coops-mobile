import React, { useEffect } from 'react'
import { AddressLevel, LocationType } from 'src/types'
import SelectLocationName from './select-location-name'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { Text, View, ScrollView } from 'react-native'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import Label from 'src/components/forms/Label'
import { useAddressStore } from 'src/store/address'

type Props = {
	control: Control<any>
	errors: FieldErrors<any>
	customErrors: any
	clearFieldError: (name: string) => void
	districtId?: string
	adminPostId?: string
	addressLevel: AddressLevel
	description: string
}
export default function SelectAddress({
	control,
	errors,
	customErrors,
	clearFieldError,
	districtId,
	adminPostId,
	addressLevel,
	description,
}: Props) {
	if (addressLevel === AddressLevel.FROM_PROVINCES) {
		return (
			<FromProvinces
				control={control}
				errors={errors}
				customErrors={customErrors}
				clearFieldError={clearFieldError}
				description={description}
				addressLevel={addressLevel}
			/>
		)
	}

	if (addressLevel === AddressLevel.FROM_ADMIN_POSTS) {
		return (
			<FromAdminPosts
				control={control}
				errors={errors}
				customErrors={customErrors}
				clearFieldError={clearFieldError}
				districtId={districtId}
				adminPostId={adminPostId}
				addressLevel={addressLevel}
				description={description}
			/>
		)
	}

	if (addressLevel === AddressLevel.FROM_COUNTRIES) {
		return (
			<FromCountries
				control={control}
				errors={errors}
				customErrors={customErrors}
				clearFieldError={clearFieldError}
				description={description}
				addressLevel={addressLevel}
			/>
		)
	}
}

export function FromAdminPosts({ control, customErrors, districtId, description }: Props) {
	const { partialAddress, setPartialAdminPostId, setPartialVillageId, resetPartialVillageId } = useAddressStore()

	return (
		<View className="w-full space-y-4">
			<FormItemDescription description={description} />

			<View className="">
				<Label label="Posto Administrativo" />
				<Controller
					name="adminPostId"
					control={control}
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View>
							<SelectLocationName
								currentValue={partialAddress.adminPostId || ''}
								onChange={(val) => {
									onChange(val)
									setPartialAdminPostId(val)
									resetPartialVillageId()
									// clearFieldError('adminPostId')
								}}
								placeholder="Posto Administrativo"
								valueName="adminPostId"
								locationType={LocationType.ADMIN_POST}
								referenceId={districtId && districtId.trim() !== '' ? districtId : undefined}
							/>

							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.adminPostId ? (
								<Text className="text-xs text-red-500">{customErrors.adminPostId}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Posto administrativo</Text>
							)}
						</View>
					)}
				/>
			</View>

			<View className="">
				<Label label="Localidade" />
				<Controller
					control={control}
					name="villageId"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View>
							<SelectLocationName
								currentValue={partialAddress.villageId || ''}
								onChange={(val) => {
									onChange(val)
									setPartialVillageId(val)
									// clearFieldError('villageId')
								}}
								placeholder="Localidade"
								valueName="villageId"
								locationType={LocationType.VILLAGE}
								referenceId={
									partialAddress.adminPostId && partialAddress.adminPostId.trim() !== ''
										? partialAddress.adminPostId
										: undefined
								}
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.villageId ? (
								<Text className="text-xs text-red-500">{customErrors.villageId}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Localidade</Text>
							)}
						</View>
					)}
				/>
			</View>
		</View>
	)
}

export function FromProvinces({ control, errors, customErrors, clearFieldError, description }: Props) {
	const {
		fullAddress,
		setFullProvinceId,
		setFullDistrictId,
		setFullAdminPostId,
		setFullVillageId,
		resetFullDistrictId,
		resetFullAdminPostId,
		resetFullVillageId,
	} = useAddressStore()

	useEffect(() => {
		if (fullAddress.provinceId) {
			resetFullDistrictId()
			resetFullAdminPostId()
			resetFullVillageId()
		}
	}, [fullAddress.provinceId])

	useEffect(() => {
		if (fullAddress.districtId) {
			resetFullAdminPostId()
			resetFullVillageId()
		}
	}, [fullAddress.districtId])

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ paddingBottom: 20 }}
			className="w-full space-y-4"
		>
			<FormItemDescription description={description} />
			<View className="">
				<Label label="Província" />
				<Controller
					name="provinceId"
					control={control}
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View>
							<SelectLocationName
								currentValue={fullAddress.provinceId || ''}
								onChange={(val) => {
									onChange(val)
									setFullProvinceId(val)
								}}
								placeholder="Província"
								valueName="provinceId"
								locationType={LocationType.PROVINCE}
								// referenceId={countryId || ''}
							/>

							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.provinceId ? (
								<Text className="text-xs text-red-500">{customErrors.provinceId}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Província</Text>
							)}
						</View>
					)}
				/>
			</View>

			<View className="">
				<Label label="Distrito" />
				<Controller
					name="districtId"
					control={control}
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View>
							<SelectLocationName
								currentValue={fullAddress.districtId || ''}
								onChange={(val) => {
									onChange(val)
									setFullDistrictId(val)
								}}
								placeholder="Distrito"
								valueName="districtId"
								locationType={LocationType.DISTRICT}
								referenceId={
									fullAddress.provinceId && fullAddress.provinceId.trim() !== '' ? fullAddress.provinceId : undefined
								}
							/>

							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.districtId ? (
								<Text className="text-xs text-red-500">{customErrors.districtId}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Distrito</Text>
							)}
						</View>
					)}
				/>
			</View>

			<View className="">
				<Label label="Posto Administrativo" />
				<Controller
					name="adminPostId"
					control={control}
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View>
							<SelectLocationName
								currentValue={fullAddress.adminPostId || ''}
								onChange={(val) => {
									onChange(val)
									setFullAdminPostId(val)
								}}
								placeholder="Posto Administrativo"
								valueName="adminPostId"
								locationType={LocationType.ADMIN_POST}
								referenceId={
									fullAddress.districtId && fullAddress.districtId.trim() !== '' ? fullAddress.districtId : undefined
								}
							/>

							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.adminPostId ? (
								<Text className="text-xs text-red-500">{customErrors.adminPostId}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Posto administrativo</Text>
							)}
						</View>
					)}
				/>
			</View>

			<View className="">
				<Label label="Localidade" />
				<Controller
					control={control}
					name="villageId"
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View>
							<SelectLocationName
								currentValue={fullAddress.villageId || ''}
								onChange={(val) => {
									onChange(val)
									setFullVillageId(val)
								}}
								placeholder="Localidade"
								valueName="villageId"
								locationType={LocationType.VILLAGE}
								referenceId={
									fullAddress.adminPostId && fullAddress.adminPostId.trim() !== '' ? fullAddress.adminPostId : undefined
								}
							/>
							{error ? (
								<Text className="text-xs text-red-500">{error.message}</Text>
							) : customErrors?.villageId ? (
								<Text className="text-xs text-red-500">{customErrors.villageId}</Text>
							) : (
								<Text className={`text-xs text-gray-500`}>Localidade</Text>
							)}
						</View>
					)}
				/>
			</View>
		</ScrollView>
	)
}

export function FromCountries({ control, description }: Props) {
	const { setCountryId, countryId } = useAddressStore()
	return (
		<View className="w-full space-y-4">
			<FormItemDescription description={description} />
			<View className="">
				<Label label="País" />
				<Controller
					name="countryId"
					control={control}
					rules={{ required: true }}
					render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
						<View>
							<SelectLocationName
								currentValue={countryId || ''}
								onChange={(val) => {
									onChange(val)
									setCountryId(val)
								}}
								placeholder="País"
								valueName="countryId"
								locationType={LocationType.COUNTRY}
								// referenceId={countryId || ''}
							/>
						</View>
					)}
				/>
			</View>
		</View>
	)
}
