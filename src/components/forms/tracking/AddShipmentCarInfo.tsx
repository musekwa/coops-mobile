import { View, Text } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import NextAndPreviousButtons from 'src/components/buttons/NextAndPreviousButtons'
import Label from '../Label'
import FormItemDescription from '../FormItemDescription'
import { useActionStore } from 'src/store/actions/actions'
import FormWrapper from '../FormWrapper'
import { isPlateNumberValid } from 'src/helpers/isValidPlateNumber'

import CustomSelectItemTrigger from 'src/components/ui/custom-select-item-trigger'
import CustomSelectItem from 'src/components/ui/custom-select-item'
import { carBrands } from 'src/data/car_brands'
import { CustomPicker } from 'src/components/custom-select-item/CustomPicker'
import { useShipmentCarStore } from 'src/store/shipment/shipment_car'
import { useTrailerPlateNumberStore } from 'src/store/shipment/trailer_plate_numbers'
import { carTypes, hasBrandName, hasTrailer } from 'src/data/car_types'

const ShipmentCarInfoSchema = z
	.object({
		carType: z.string().trim().min(2, 'Indica o tipo de veículo.'),
		brandName: z.string().trim().min(2, 'Indica a marca do camião.'),
		numberOfTrailers: z.string().optional(),
		// The truck plate number is a combination of 3 parts
		// 1. The first part is the truck plate 3 to 4 characters long
		// 2. The second part is the truck plate 4 digits long
		// 3. The third part is the truck plate 2 characters long
		// Example: ANJ 0000 MP
		// The first part is ANJ
		// The second part is 0000
		// The third part is MP
		firstPartPlate: z
			.string()
			.trim()
			.regex(/^[A-Z]{3}$/, {
				message: 'Indica a matrícula do camião.',
			}),
		secondPartPlate: z
			.string()
			.trim()
			.regex(/^(\d{3}|\d{2}-\d{2})$/, {
				message: 'Indica a matrícula do camião válida.',
			}),
		thirdPartPlate: z
			.string()
			.trim()
			.regex(/^[A-Z]{0,2}$/, {
				message: 'Indica a matrícula do camião.',
			}),
	})
	.refine(
		(data) => {
			// Validate first part (must be exactly 3 capital letters)
			if (!/^[A-Z]{3}$/.test(data.firstPartPlate)) {
				return false
			}

			// Check if it's the second type format (with dash)
			if (data.secondPartPlate.includes('-')) {
				// Second type: AAA 00-00 (third part should be empty)
				if (data.thirdPartPlate !== '') {
					return false
				}
				// Validate second part format: 00-00 (two digits, dash, two digits)
				return /^\d{2}-\d{2}$/.test(data.secondPartPlate)
			} else {
				// First type: AAA 000 AA
				// Validate second part: exactly 3 digits
				if (!/^\d{3}$/.test(data.secondPartPlate)) {
					return false
				}
				// Validate third part: exactly 2 capital letters
				return /^[A-Z]{2}$/.test(data.thirdPartPlate)
			}
		},
		{
			path: ['secondPartPlate'],
			message: 'Indica uma matrícula do camião válida.',
		},
	)

type ShipmentCarInfoFormData = z.infer<typeof ShipmentCarInfoSchema>

export default function AddShipmentCarInfo() {
	const [showTruckBrandModal, setShowTruckBrandModal] = useState(false)
	const [showCarTypeModal, setShowCarTypeModal] = useState(false)
	const { currentStep, setCurrentStep, totalSteps } = useActionStore()

	const { setShipmentCarInfo, shipmentCarInfo } = useShipmentCarStore()
	const { trailerPlateNumbers, setTrailerPlateNumber, initializeTrailerPlateNumbers } = useTrailerPlateNumberStore()
	const {
		control,
		formState: { errors },
		setValue,
	} = useForm<ShipmentCarInfoFormData>({
		defaultValues: {
			brandName: shipmentCarInfo.brandName || '',
			carType: shipmentCarInfo.carType || '',
			firstPartPlate: shipmentCarInfo.firstPartPlate || '',
			secondPartPlate: shipmentCarInfo.secondPartPlate || '',
			thirdPartPlate: shipmentCarInfo.thirdPartPlate || '',
			numberOfTrailers: shipmentCarInfo.numberOfTrailers || '',
		},
		resolver: zodResolver(ShipmentCarInfoSchema),
	})

	// Keep form values in sync with store
	useEffect(() => {
		setValue('brandName', shipmentCarInfo.brandName || '')
		setValue('carType', shipmentCarInfo.carType || '')
		setValue('firstPartPlate', shipmentCarInfo.firstPartPlate || '')
		setValue('secondPartPlate', shipmentCarInfo.secondPartPlate || '')
		setValue('thirdPartPlate', shipmentCarInfo.thirdPartPlate || '')
		setValue('numberOfTrailers', shipmentCarInfo.numberOfTrailers || '')
		setValue('carType', shipmentCarInfo.carType || '')
	}, [shipmentCarInfo, setValue])

	// Initialize trailer plate numbers when number of trailers changes
	useEffect(() => {
		if (shipmentCarInfo.carType === 'TRAILER-TRUCK' && shipmentCarInfo.numberOfTrailers) {
			const numTrailers = parseInt(shipmentCarInfo.numberOfTrailers)
			if (numTrailers > 0) {
				initializeTrailerPlateNumbers(numTrailers)
			}
		}
	}, [shipmentCarInfo.carType, shipmentCarInfo.numberOfTrailers, initializeTrailerPlateNumbers])

	const handlePreviousStep = () => {
		setCurrentStep(currentStep - 1)
	}

	const handleNextStep = () => {
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1)
		}
	}

	const isFormDataValid = () => {
		// Use store values instead of form values since we're updating store directly
		const { brandName, carType, numberOfTrailers, firstPartPlate, secondPartPlate, thirdPartPlate } = shipmentCarInfo

		// Always validate car type and plate number
		if (!carType || carType === '') {
			return true // Disable button
		}

		if (!isPlateNumberValid(firstPartPlate, secondPartPlate, thirdPartPlate)) {
			return true // Disable button
		}

		// Scenario 1: Has trailer and brand (TRAILER-TRUCK, SEMI-TRAILER-TRUCK)
		if (hasTrailer(carType)) {
			// Validate brand name
			if (!brandName || brandName === '') {
				return true // Disable button
			}

			// Validate number of trailers
			if (!numberOfTrailers || numberOfTrailers === '') {
				return true // Disable button
			}

			// Validate each trailer plate number
			const numTrailers = parseInt(numberOfTrailers)
			if (numTrailers > 0) {
				for (let i = 0; i < numTrailers; i++) {
					const trailerPlate = trailerPlateNumbers[i] || ''
					if (!trailerPlate || trailerPlate.trim() === '') {
						return true // Disable button - missing trailer plate
					}

					const parts = trailerPlate.split(' ')
					if (parts.length < 2) {
						return true // Disable button - invalid trailer plate format
					}

					const [firstPart, secondPart, thirdPart = ''] = parts
					if (!isPlateNumberValid(firstPart, secondPart, thirdPart)) {
						return true // Disable button - invalid trailer plate
					}
				}
			}
		}

		// Scenario 2: Has no trailer but has brand (TRUCK, PASSENGER-CAR, CARGO-VAN, AGRICULTURAL-TRACTOR, OTHER, PICK-UP)
		if (!hasTrailer(carType) && hasBrandName(carType)) {
			// Validate brand name
			if (!brandName || brandName === '') {
				return true // Disable button
			}
		}

		// Scenario 3: Has no trailer and no brand (MOTORCYCLE, CANOE)
		// Only car type and plate number validation needed (already done above)

		return false // Enable button
	}

	return (
		<View className="flex-1 bg-white dark:bg-black">
			<FormWrapper>
				<FormItemDescription description="Informações do Camião" />

				<View>
					<Label label="Tipo de Veículo" />
					<CustomSelectItemTrigger
						resetItem={() => {
							setShipmentCarInfo('', 'carType')
						}}
						hasSelectedItem={shipmentCarInfo.carType !== ''}
						setShowItems={() => {
							setShowCarTypeModal(true)
						}}
						selectedItem={shipmentCarInfo.carTypeLabel || 'Seleccione o tipo de veículo'}
					/>
					<CustomSelectItem
						label="Tipo de Veículo"
						emptyMessage="Não temos esse tipo de veículo no sistema"
						showModal={showCarTypeModal}
						setShowModal={setShowCarTypeModal}
						setValue={(value) => {
							setShipmentCarInfo(value, 'carType')
							const carTypeLabel = carTypes.find((carType) => carType.value === value)?.label
							setShipmentCarInfo(carTypeLabel || '', 'carTypeLabel')
						}}
						itemsList={carTypes.map((carType) => ({
							label: carType.label,
							value: carType.value,
						}))}
					/>
					<FormItemDescription description={`Seleccione o tipo de veículo`} />
				</View>

				{hasBrandName(shipmentCarInfo.carType) && (
					<View>
						<Label label={`Marca do ${shipmentCarInfo.carTypeLabel}`} />
						<CustomSelectItemTrigger
							resetItem={() => {
								setShipmentCarInfo('', 'brandName')
							}}
							hasSelectedItem={shipmentCarInfo.brandName !== ''}
							setShowItems={() => {
								setShowTruckBrandModal(true)
							}}
							selectedItem={shipmentCarInfo.brandName || 'Seleccione a marca do camião'}
						/>
						<CustomSelectItem
							label={`Marca de ${shipmentCarInfo.carTypeLabel}`}
							emptyMessage="Não temos essa marca no sistema"
							showModal={showTruckBrandModal}
							setShowModal={setShowTruckBrandModal}
							setValue={(value) => {
								setShipmentCarInfo(value, 'brandName')
							}}
							itemsList={carBrands.map((brand) => ({
								label: brand.label,
								value: brand.value,
							}))}
						/>
						<FormItemDescription description={`Seleccione a marca do camião`} />
					</View>
				)}

				{/* Car plate number */}
				<View>
					<View className="">
						<Label label="Matrícula do Camião" />
						<View className="flex flex-row space-x-2">
							<View className="flex-1">
								<Controller
									control={control}
									name="firstPartPlate"
									defaultValue=""
									rules={{ required: true }}
									render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
										<View className="">
											<CustomTextInput
												label=""
												value={value}
												// add the first part of the truck plate.
												onChangeText={(text) => {
													onChange(text)
													setShipmentCarInfo(text, 'firstPartPlate')
												}}
												onBlur={onBlur}
												autoCapitalize="characters"
												placeholder="ex: ANJ"
											/>
											<FormItemDescription description="Ex: ANJ" />
										</View>
									)}
								/>
							</View>
							<View className="flex-1">
								<Controller
									control={control}
									name="secondPartPlate"
									defaultValue=""
									rules={{ required: true }}
									render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
										<View>
											<CustomTextInput
												label=""
												value={value}
												keyboardType="numeric"
												// add the second part of the truck plate and a space after it.
												onChangeText={(text) => {
													onChange(text)
													setShipmentCarInfo(text, 'secondPartPlate')
													// If second part contains dash, clear third part
													if (text.includes('-')) {
														setValue('thirdPartPlate', '')
														setShipmentCarInfo('', 'thirdPartPlate')
													}
												}}
												onBlur={onBlur}
												// autoCapitalize="words"
												placeholder="ex: 515 ou 23-45"
											/>
											<FormItemDescription description="Ex: 515 ou 23-45" />
										</View>
									)}
								/>
							</View>

							<View className="flex-1">
								<Controller
									control={control}
									name="thirdPartPlate"
									defaultValue=""
									rules={{ required: true }}
									render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
										<View>
											<CustomTextInput
												label=""
												value={value}
												// add the third part of the truck plate.
												onChangeText={(text) => {
													onChange(text)
													setShipmentCarInfo(text, 'thirdPartPlate')
												}}
												onBlur={onBlur}
												autoCapitalize="characters"
												placeholder="ex: MP"
												editable={!shipmentCarInfo.secondPartPlate?.includes('-')}
											/>
											<FormItemDescription description="Ex: MP" />
										</View>
									)}
								/>
							</View>
						</View>
					</View>
					{errors.firstPartPlate || errors.secondPartPlate || errors.thirdPartPlate ? (
						<View className="-top-2">
							<Text className="text-xs text-red-500 -mt-4">Indica a matrícula do camião válida.</Text>
						</View>
					) : null}
				</View>

				{/* Whether the truck has trailers or not */}
				{/* <View className="flex flex-col ">
					<Label label={`O camião tem trailers?`} />
					<RadioButton
						label="Sim"
						value="YES"
						checked={shipmentCarInfo.hasTrailer === 'YES'}
						onChange={(value) => {
							setValue('hasTrailer', value)
							setShipmentCarInfo('YES', 'hasTrailer')
							setShipmentCarInfo('', 'numberOfTrailers')
						}}
					/>
					<RadioButton
						label="Não"
						value="NO"
						checked={shipmentCarInfo.hasTrailer === 'NO'}
						onChange={(value) => {
							setValue('hasTrailer', value)
							setValue('numberOfTrailers', '')
							setShipmentCarInfo('NO', 'hasTrailer')
							setShipmentCarInfo('', 'numberOfTrailers')
						}}
					/>
				</View> */}
				{hasTrailer(shipmentCarInfo.carType) && (
					<View>
						<Label label="Número de trailers" />
						<CustomPicker
							items={[
								{ label: '1', value: '1' },
								{ label: '2', value: '2' },
								{ label: '3', value: '3' },
								{ label: '4', value: '4' },
							]}
							setValue={(value) => {
								setValue('numberOfTrailers', value)
								setShipmentCarInfo(value, 'numberOfTrailers')
							}}
							value={shipmentCarInfo.numberOfTrailers || ''}
							placeholder={{ label: 'Seleccione o número de trailers', value: null }}
						/>
						<FormItemDescription description="Quantos trailers tem o camião?" />
					</View>
				)}
				{hasTrailer(shipmentCarInfo.carType) &&
					shipmentCarInfo.numberOfTrailers &&
					Array.from({ length: Number(shipmentCarInfo.numberOfTrailers) }, (_, index) => (
						<View key={index} className="mb-4">
							<Label label={`Matrícula do Trailer ${index + 1}`} />
							<View className="flex flex-row space-x-2">
								<View className="flex-1">
									<CustomTextInput
										label=""
										value={(() => {
											const plate = trailerPlateNumbers[index] || ''
											const parts = plate.split(' ')
											return parts[0] || ''
										})()}
										onChangeText={(text) => {
											// Update the trailer plate number in store
											const currentPlate = trailerPlateNumbers[index] || ''
											const parts = currentPlate.split(' ')
											parts[0] = text.toUpperCase()
											const newPlate = parts.join(' ')
											setTrailerPlateNumber(index, newPlate)
										}}
										autoCapitalize="characters"
										placeholder="ex: ANJ"
									/>
									<FormItemDescription description="Ex: ANJ" />
								</View>
								<View className="flex-1">
									<CustomTextInput
										label=""
										value={(() => {
											const plate = trailerPlateNumbers[index] || ''
											const parts = plate.split(' ')
											return parts[1] || ''
										})()}
										keyboardType="numeric"
										onChangeText={(text) => {
											const currentPlate = trailerPlateNumbers[index] || ''
											const parts = currentPlate.split(' ')
											parts[1] = text
											const newPlate = parts.join(' ')
											setTrailerPlateNumber(index, newPlate)

											// If second part contains dash, clear third part
											if (text.includes('-')) {
												parts[2] = ''
												const newPlateWithoutThird = parts.join(' ')
												setTrailerPlateNumber(index, newPlateWithoutThird)
											}
										}}
										placeholder="ex: 515 ou 23-45"
									/>
									<FormItemDescription description="Ex: 515 ou 23-45" />
								</View>
								<View className="flex-1">
									<CustomTextInput
										label=""
										value={(() => {
											const plate = trailerPlateNumbers[index] || ''
											const parts = plate.split(' ')
											return parts[2] || ''
										})()}
										onChangeText={(text) => {
											const currentPlate = trailerPlateNumbers[index] || ''
											const parts = currentPlate.split(' ')
											parts[2] = text.toUpperCase()
											const newPlate = parts.join(' ')
											setTrailerPlateNumber(index, newPlate)
										}}
										autoCapitalize="characters"
										placeholder="ex: MP"
										editable={
											!(() => {
												const plate = trailerPlateNumbers[index] || ''
												const parts = plate.split(' ')
												return parts[1]?.includes('-') || false
											})()
										}
									/>
									<FormItemDescription description="Ex: MP" />
								</View>
							</View>
						</View>
					))}
			</FormWrapper>

			<NextAndPreviousButtons
				// currentStep={currentStep}
				handlePreviousStep={handlePreviousStep}
				handleNextStep={handleNextStep}
				nextButtonDisabled={isFormDataValid()}
				previousButtonDisabled={currentStep === 0}
			/>
		</View>
	)
}
