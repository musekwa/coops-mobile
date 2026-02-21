import { useState, useRef, useMemo } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import Animated from 'react-native-reanimated'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import NextAndPreviousButtons from 'src/components/buttons/NextAndPreviousButtons'

import { PreconditionsType, usePreconditionsStore } from 'src/store/tracking/pre-conditions'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { useShipmentOwnerDetailsStore } from 'src/store/shipment/shipment_owner_details'
import FormItemDescription from '../FormItemDescription'
import CustomSearchInput from 'src/components/custom-search-input/CustomSearchInput'
import ShipmentOwnerRenderItem from 'src/components/tracking/ShipmentOwnerRenderItem'
import { useActionStore } from 'src/store/actions/actions'
import { useOwnerByPreconditions } from 'src/hooks/useOwnerByPreconditions'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'
import CustomShimmerPlaceholder, {
	CustomShimmerPlaceholderItem,
} from 'src/components/placeholder/CustomShimmerPlaceholder'

export default function AddOwner() {
	const { currentStep, setCurrentStep, totalSteps } = useActionStore()
	const [hasError, setHasError] = useState(false)
	const [message, setMessage] = useState('')
	const [search, setSearch] = useState('')
	const [isSearching, setIsSearching] = useState(false)

	const { preconditions } = usePreconditionsStore()
	const { owners, isLoading, error, isError } = useOwnerByPreconditions(preconditions as PreconditionsType)

	const { shipmentOwnerDetails, setShipmentOwnerDetails } = useShipmentOwnerDetailsStore()
	const { ownerId } = shipmentOwnerDetails
	const flatListRef = useRef<any>(null)

	// Skeleton data for loading state
	const skeletonData = Array.from({ length: 8 }, (_, index) => index)

	// Filter owners based on search query
	const filteredOwners = useMemo(() => {
		if (!owners || owners.length === 0) return []
		if (!search || search.trim() === '') return owners

		const searchLower = search.toLowerCase().trim()

		return owners.filter((owner) => {
			// Search by full name (other_names + surname, or just surname for groups)
			const fullName = `${owner.other_names || ''} ${owner.surname || ''}`.toLowerCase().trim()
			const nameMatch = fullName.includes(searchLower) || (owner.surname || '').toLowerCase().includes(searchLower)

			// Search by primary phone
			const primaryPhoneMatch = owner.primary_phone?.toLowerCase().includes(searchLower) || false

			// Search by secondary phone
			const secondaryPhoneMatch = owner.secondary_phone?.toLowerCase().includes(searchLower) || false

			return nameMatch || primaryPhoneMatch || secondaryPhoneMatch
		})
	}, [owners, search])

	const handleNextStep = () => {
		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handlePreviousStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handlePressListItem = (item: {
		id: string
		surname: string
		other_names: string
		multicategory: string
		contact_id: string
		admin_post_id: string
		primary_phone: string
		secondary_phone: string
	}) => {
		setShipmentOwnerDetails(item.id, 'ownerId')
		setShipmentOwnerDetails(preconditions.ownerType as 'TRADER' | 'FARMER' | 'GROUP' | 'OTHER', 'ownerType')
		const fullName = item.other_names + ' ' + (item.surname.toLowerCase().includes('company') ? '(Empresa)' : '')
		setShipmentOwnerDetails(fullName, 'ownerName')
		const phone = item.primary_phone ? item.primary_phone : item.secondary_phone ? item.secondary_phone : ''
		setShipmentOwnerDetails(phone, 'ownerPhone')
	}

	return (
		<View className="flex-1">
			<View className="relative flex flex-row items-center justify-between w-full bg-white dark:bg-slate-900 px-3">
				{!isSearching ? (
					<View className="flex flex-row items-center justify-between w-full h-[60px]">
						<View>
							<FormItemDescription description="Proprietário da mercadoria" />
						</View>

						<TouchableOpacity
							onPress={() => {
								setIsSearching(true)
								setSearch('')
							}}
							className="flex flex-col items-center space-y-1"
						>
							<Ionicons name="search" size={24} color={colors.primary} />
						</TouchableOpacity>
					</View>
				) : (
					<View className="flex-1">
						<CustomSearchInput
							setIsSearching={setIsSearching}
							setSearch={setSearch}
							placeholder="Procurar proprietário"
							onChangeText={setSearch}
							value={search}
						/>
					</View>
				)}
			</View>

			<View style={{ flex: 1 }}>
				{isLoading ? (
					<FlatList
						style={{ flex: 1 }}
						scrollEnabled={true}
						showsVerticalScrollIndicator={false}
						data={skeletonData}
						keyExtractor={(item: number) => item.toString()}
						renderItem={() => (
							<View className="flex-row items-center space-x-1 p-2 border-b border-gray-200 dark:border-gray-700">
								<CustomShimmerPlaceholder
									style={{
										width: 50,
										height: 50,
										borderRadius: 25,
									}}
								/>
								<View className="flex-1">
									<CustomShimmerPlaceholderItem
										props={{
											style: {
												width: '80%',
												height: 16,
												borderRadius: 8,
											},
										}}
									/>
									<CustomShimmerPlaceholderItem
										props={{
											style: {
												width: '60%',
												height: 14,
												borderRadius: 6,
											},
										}}
									/>
									<CustomShimmerPlaceholderItem
										props={{
											style: {
												width: '40%',
												height: 12,
												borderRadius: 6,
											},
										}}
									/>
								</View>
							</View>
						)}
						contentContainerStyle={{
							paddingHorizontal: 10,
							paddingVertical: 10,
						}}
					/>
				) : (
					<Animated.FlatList
						ref={flatListRef}
						// style={{ flex: 1 }}
						scrollEnabled={true}
						showsVerticalScrollIndicator={false}
						initialNumToRender={20}
						ListEmptyComponent={() => (
							<View className="h-[400px] items-center justify-center">
								<EmptyPlaceholder
									message={
										search && search.trim() !== ''
											? 'Nenhum proprietário encontrado com o termo de pesquisa'
											: 'Nenhum proprietário reunindo as condições seleccionadas foi encontrado'
									}
								/>
							</View>
						)}
						data={filteredOwners}
						keyExtractor={(item: any) => item.id.toString()}
						renderItem={({ item }: { item: any }) => (
							<ShipmentOwnerRenderItem item={item} handlePressListItem={handlePressListItem} ownerId={ownerId} />
						)}
						contentContainerStyle={{
							paddingHorizontal: 15,
							paddingBottom: 120,
						}}
					/>
				)}
			</View>

			<NextAndPreviousButtons
				// currentStep={currentStep}
				handlePreviousStep={handlePreviousStep}
				handleNextStep={handleNextStep}
				previousButtonDisabled={currentStep === 0}
				nextButtonDisabled={ownerId === ''}
				nextButtonText="Continuar"
				previousButtonText="Voltar"
			/>

			<ErrorAlert title="" visible={hasError} message={message} setVisible={setHasError} setMessage={setMessage} />
		</View>
	)
}
