// React & React Native imports
import { useEffect, useState, useMemo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Third party imports
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Components
import FormWrapper from '../FormWrapper'
import NextAndPreviousButtons from 'src/components/buttons/NextAndPreviousButtons'
import CustomProgressDialg from 'src/components/dialogs/CustomProgressDialg'
import ShipmentStepFormDescription from 'src/components/tracking/ShipmentStepFormDescription'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import FormItemDescription from '../FormItemDescription'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'

// Store
import { useActionStore } from 'src/store/actions/actions'
import { useSmugglerDetailsStore } from 'src/store/tracking/smuggler'

// Hooks
import { useQueryMany } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'

// Constants & Types
import { colors } from 'src/constants'

const SearchSchema = z.object({
	searchQuery: z.string().min(2, { message: 'Digite pelo menos 2 caracteres' }),
})

const mozPhoneRegex = /^(84|86|87|85|82|83)\d{7}$/

type SearchFormData = z.infer<typeof SearchSchema>

type SearchResult = {
	id: string
	surname: string
	other_names: string
	phone: string
	categoria: 'produtor' | 'comerciante'
	type: 'FARMER' | 'TRADER'
	village_id: string | null
	admin_post_id: string | null
	district_id: string | null
	province_id: string | null
	village_name: string | null
	admin_post_name: string | null
	district_name: string | null
	province_name: string | null
}

export default function SearchSmuggler() {
	const { currentStep, setCurrentStep, totalSteps } = useActionStore()
	const { setSmugglerId, updateSmugglerDetails, getSmugglerDetails, setSmugglerDetails } = useSmugglerDetailsStore()
	const [loading, setLoading] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [hasSearched, setHasSearched] = useState(false)
	const [selectedSmugglerId, setSelectedSmugglerId] = useState<string | null>(null)
	const { smugglerDetails } = useSmugglerDetailsStore()

	const {
		control,
		watch,
		setValue,
		clearErrors,
		setError,
		formState: { errors },
	} = useForm<SearchFormData>({
		defaultValues: {
			searchQuery: '',
		},
		resolver: zodResolver(SearchSchema),
	})

	const searchValue = watch('searchQuery')

	// Detect if input is numeric (phone) or text (name)
	const isNumeric = useMemo(() => {
		if (!searchValue || searchValue.trim().length < 2) return null
		return /^\d+$/.test(searchValue.trim())
	}, [searchValue])

	// Build query based on input type - only when search has been triggered
	const query = useMemo(() => {
		if (!hasSearched || !searchQuery || searchQuery.trim().length < 2) return 'SELECT 1 WHERE 1=0'

		const searchTerm = searchQuery.trim().replace(/'/g, "''")
		const isNumericQuery = /^\d+$/.test(searchQuery.trim())

		const baseFarmerSelect = `
			SELECT DISTINCT
				ad.actor_id as id,
				ad.surname,
				ad.other_names,
				COALESCE(NULLIF(cd.primary_phone, 'N/A'), NULLIF(cd.secondary_phone, 'N/A'), 'N/A') as phone,
				'FARMER' as type,
				addr.village_id,
				addr.admin_post_id,
				addr.district_id,
				addr.province_id,
				v.name AS village_name,
				ap.name AS admin_post_name,
				d.name AS district_name,
				p.name AS province_name
			FROM ${TABLES.ACTOR_DETAILS} ad
			LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON ad.actor_id = cd.owner_id AND cd.owner_type = 'FARMER'
			LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON ad.actor_id = addr.owner_id AND addr.owner_type = 'FARMER'
			LEFT JOIN ${TABLES.VILLAGES} v ON addr.village_id = v.id
			LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON addr.admin_post_id = ap.id
			LEFT JOIN ${TABLES.DISTRICTS} d ON addr.district_id = d.id
			LEFT JOIN ${TABLES.PROVINCES} p ON addr.province_id = p.id
		`

		const baseTraderSelect = `
			SELECT DISTINCT
				t.actor_id as id,
				t.surname,
				t.other_names,
				COALESCE(NULLIF(c2.primary_phone, 'N/A'), NULLIF(c2.secondary_phone, 'N/A'), 'N/A') as phone,
				'TRADER' as type,
				a2.village_id,
				a2.admin_post_id,
				a2.district_id,
				a2.province_id,
				v2.name AS village_name,
				ap2.name AS admin_post_name,
				d2.name AS district_name,
				p2.name AS province_name
			FROM ${TABLES.ACTOR_DETAILS} t
			INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = t.actor_id AND ac.category = 'TRADER'
			LEFT JOIN ${TABLES.CONTACT_DETAILS} c2 ON c2.owner_id = t.actor_id AND c2.owner_type = 'TRADER'
			LEFT JOIN ${TABLES.ADDRESS_DETAILS} a2 ON a2.owner_id = t.actor_id AND a2.owner_type = 'TRADER'
			LEFT JOIN ${TABLES.VILLAGES} v2 ON a2.village_id = v2.id
			LEFT JOIN ${TABLES.ADMIN_POSTS} ap2 ON a2.admin_post_id = ap2.id
			LEFT JOIN ${TABLES.DISTRICTS} d2 ON a2.district_id = d2.id
			LEFT JOIN ${TABLES.PROVINCES} p2 ON a2.province_id = p2.id
		`

		if (isNumericQuery) {
			return `
				${baseFarmerSelect}
				WHERE (cd.primary_phone LIKE '%${searchTerm}%' OR cd.secondary_phone LIKE '%${searchTerm}%')
				UNION ALL
				${baseTraderSelect}
				WHERE (c2.primary_phone LIKE '%${searchTerm}%' OR c2.secondary_phone LIKE '%${searchTerm}%')
			`
		}

		return `
			${baseFarmerSelect}
			WHERE LOWER(ad.surname) LIKE LOWER('%${searchTerm}%')
			   OR LOWER(ad.other_names) LIKE LOWER('%${searchTerm}%')
			UNION ALL
			${baseTraderSelect}
			WHERE LOWER(t.surname) LIKE LOWER('%${searchTerm}%')
			   OR LOWER(t.other_names) LIKE LOWER('%${searchTerm}%')
		`
	}, [hasSearched, searchQuery])

	// Execute query only when search has been triggered
	const { data: searchResults, isLoading: isSearchLoading } = useQueryMany<{
		id: string
		surname: string
		other_names: string
		phone: string
		type: 'FARMER' | 'TRADER'
		village_id: string | null
		admin_post_id: string | null
		district_id: string | null
		province_id: string | null
		village_name: string | null
		admin_post_name: string | null
		district_name: string | null
		province_name: string | null
	}>(query)

	// Transform results to include categoria
	const results: SearchResult[] = useMemo(() => {
		if (!searchResults) return []
		return searchResults.map((result) => ({
			...result,
			categoria: result.type === 'FARMER' ? 'produtor' : 'comerciante',
		}))
	}, [searchResults])

	const showNoResultsMessage = hasSearched && !isSearchLoading && searchQuery && results.length === 0

	const handleNextStep = () => {
		if (currentStep < totalSteps - 1 && !selectedSmugglerId && !smugglerDetails.isAlreadyRegistered) {
			setCurrentStep(currentStep + 2)
		} else {
			setCurrentStep(currentStep + 1)
		}
	}

	const handlePreviousStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleSearch = () => {
		const trimmedValue = searchValue?.trim() ?? ''

		if (trimmedValue.length < 2) {
			setError('searchQuery', {
				type: 'minLength',
				message: 'Digite pelo menos 2 caracteres',
			})
			return
		}

		const numericQuery = /^\d+$/.test(trimmedValue)
		if (numericQuery && !mozPhoneRegex.test(trimmedValue)) {
			setError('searchQuery', {
				type: 'pattern',
				message: 'Número de telefone inválido. Use o formato 8X1234567.',
			})
			setHasSearched(false)
			return
		}

		setHasSearched(true)
		setSearchQuery(trimmedValue)
		setSelectedSmugglerId(null)
	}

	const handleClearSearch = () => {
		setValue('searchQuery', '')
		setSearchQuery('')
		setHasSearched(false)
		setSelectedSmugglerId(null)
		clearErrors('searchQuery')
	}

	const handleSelectSmuggler = (item: SearchResult) => {
		// Set smugglerId and smugglerCategory in the store
		const currentDetails = getSmugglerDetails()
		setSmugglerDetails({
			...currentDetails,
			smugglerId: item.id,
			smugglerCategory: item.type,
			smugglerSurname: item.surname,
			smugglerOtherNames: item.other_names,
			smugglerPhone: item.phone,
			smugglerProvinceId: item.province_id ?? '',
			smugglerProvince: item.province_name ?? '',
			smugglerDistrictId: item.district_id ?? '',
			smugglerDistrict: item.district_name ?? '',
			smugglerAdminPostId: item.admin_post_id ?? '',
			smugglerAdminPost: item.admin_post_name ?? '',
			smugglerVillageId: item.village_id ?? '',
			smugglerVillage: item.village_name ?? '',
			isAlreadyRegistered: true,
		})
		setSelectedSmugglerId(item.id)
		// Move to next step after selection
		handleNextStep()
	}

	const handleProceedToAddNew = () => {
		// Reset smuggler details and mark as not registered
		const currentDetails = getSmugglerDetails()
		setSmugglerDetails({
			...currentDetails,
			smugglerId: '',
			smugglerCategory: '',
			smugglerSurname: '',
			smugglerOtherNames: '',
			smugglerPhone: '',
			smugglerProvinceId: '',
			smugglerProvince: '',
			smugglerDistrictId: '',
			smugglerDistrict: '',
			smugglerAdminPostId: '',
			smugglerAdminPost: '',
			smugglerVillageId: '',
			smugglerVillage: '',
			isAlreadyRegistered: false,
		})
		setSelectedSmugglerId(null)
		// Move to next step to add new smuggler
		handleNextStep()
	}

	const renderResultItem = ({ item }: { item: SearchResult }) => (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={() => handleSelectSmuggler(item)}
			className={`flex-row items-center p-3 mb-2 rounded-lg border ${
				selectedSmugglerId === item.id
					? 'bg-primary/10 border-primary dark:bg-primary/20'
					: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
			}`}
		>
			<View className="flex-1">
				<View className="flex-row items-center mb-1">
					<Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">Apelido:</Text>
					<Text className="text-base font-bold text-black dark:text-white flex-1">{item.surname}</Text>
				</View>
				<View className="flex-row items-center mb-1">
					<Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">Nomes:</Text>
					<Text className="text-base text-black dark:text-white flex-1">{item.other_names}</Text>
				</View>
				<View className="flex-row items-center mb-1">
					<Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">Contacto:</Text>
					<Text className="text-base text-black dark:text-white flex-1">{item.phone}</Text>
				</View>
				<View className="flex-row items-center">
					<Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">Categoria:</Text>
					<Text className="text-base text-black dark:text-white flex-1 capitalize">{item.categoria}</Text>
				</View>
			</View>
		</TouchableOpacity>
	)

	const renderResultSection = () => {
		if (!hasSearched || !searchQuery) {
			return null
		}

		if (isSearchLoading) {
			return (
				<View className="py-8">
					<Text className="text-center text-gray-500">A procurar...</Text>
				</View>
			)
		}

		if (showNoResultsMessage) {
			return (
				<View className="pt-6">
					<ShipmentStepFormDescription
						description={`Não foi encontrado nenhum produtor ou comerciante com "${searchQuery}". Clique em "Próximo" para registar este proprietário.`}
						bgColor={colors.dangerBackground}
						textColor={colors.dangerText}
					/>
				</View>
			)
		}

		return (
			<>
				<Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
					{results.length} resultado(s) encontrado(s)
				</Text>
				<View className="space-y-2">
					{results.map((item) => (
						<View key={`${item.type}-${item.id}`}>{renderResultItem({ item })}</View>
					))}
				</View>
			</>
		)
	}

	return (
		<View className="flex-1">
			<FormWrapper>
				<ShipmentStepFormDescription description="Antes de adicionar o proprietário da mercadoria, certifique-se de que ele não está registado no sistema." />

				{/* Single Search Input */}
				<View className="pt-6">
					<Controller
						control={control}
						name="searchQuery"
						render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
							<View className="flex-row items-start space-x-2">
								<View className="flex-1 relative">
									<CustomTextInput
										label=""
										value={value}
										onChangeText={(text) => {
											onChange(text)
											clearErrors('searchQuery')
											setHasSearched(false)
										}}
										onBlur={onBlur}
										placeholder={
											isNumeric === null
												? 'Digite o nome ou número de telefone'
												: isNumeric
													? 'Número de telefone'
													: 'Nome'
										}
										keyboardType={isNumeric ? 'numeric' : 'default'}
									/>
									{value && (
										<Ionicons
											name="close"
											size={20}
											color={colors.gray600}
											style={{
												position: 'absolute',
												right: 8,
												top: '30%',
												transform: [{ translateY: -8 }],
											}}
											onPress={handleClearSearch}
										/>
									)}
									{error ? (
										<Text className="text-xs text-red-500">{error.message}</Text>
									) : (
										<FormItemDescription
											description={
												isNumeric === null
													? 'Digite o nome ou número de telefone para procurar'
													: isNumeric
														? 'Procura pelo número de telefone'
														: 'Procura pelo nome'
											}
										/>
									)}
								</View>
								<View className="pb-3">
									<Ionicons
										name="search-circle"
										size={55}
										color={colors.primary}
										style={{
											transform: [{ rotate: '90deg' }],
											opacity: value && value.trim().length >= 2 ? 1 : 0.5,
										}}
										onPress={handleSearch}
									/>
								</View>
							</View>
						)}
					/>
				</View>

				{/* Search Results */}
				{renderResultSection()}
			</FormWrapper>
			<NextAndPreviousButtons
				handlePreviousStep={handlePreviousStep}
				handleNextStep={hasSearched && results.length === 0 ? handleProceedToAddNew : handleNextStep}
				showPreviousButton={currentStep > 0}
				showNextButton={currentStep < totalSteps - 1}
				nextButtonDisabled={!hasSearched || (results.length > 0 && !selectedSmugglerId)}
				previousButtonDisabled={currentStep === 0}
			/>
			<CustomProgressDialg title="Procurando..." isLoading={isSearchLoading} setIsLoading={setLoading} />
		</View>
	)
}
