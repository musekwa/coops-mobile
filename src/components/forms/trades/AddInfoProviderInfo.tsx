import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { View, Text } from 'react-native'
import CustomSelectItem from 'src/components/ui/custom-select-item'
import { useInfoProviderStore } from 'src/store/trades'
import { z } from 'zod'
import Label from '../Label'
import CustomSelectItemTrigger from 'src/components/ui/custom-select-item-trigger'
import { queryMany } from 'src/library/powersync/sql-statements'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { capitalize } from 'src/helpers/capitalize'
import { positionLabelInPortuguese } from 'src/helpers/convertToPortuguese'

// Types
type StoreType = 'WAREHOUSE' | 'GROUP'

interface InfoProvider {
	id: string
	full_name: string
	position: string
	store_id: string
	store_type: StoreType
}

const InfoProviderSchema = z.object({
	info_provider_id: z.string(),
	info_provider_name: z.string(),
})

type InfoProviderData = z.infer<typeof InfoProviderSchema>

interface AddInfoProviderInfoProps {
	customErrors: Record<string, string>
	setCustomErrors: (customErrors: Record<string, string>) => void
	setShowInfoProviderModal: (showInfoProviderModal: boolean) => void
	showInfoProviderModal: boolean
	ownerId: string
	storeId: string
	storeType: StoreType
}

export default function AddInfoProviderInfo({
	customErrors,
	setCustomErrors,
	setShowInfoProviderModal,
	showInfoProviderModal,
	ownerId,
	storeId,
	storeType,
}: AddInfoProviderInfoProps) {
	const { hasSelectedInfoProvider, infoProvider, setHasSelectedInfoProvider, setInfoProvider } = useInfoProviderStore()
	const [infoProviders, setInfoProviders] = useState<InfoProvider[]>([])

	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<InfoProviderData>({
		defaultValues: {
			info_provider_id: '',
			info_provider_name: '',
		},
		resolver: zodResolver(InfoProviderSchema),
	})

	// Fetch info providers based on store type
	useEffect(() => {
		const fetchInfoProviders = async () => {
			try {
				let providers: InfoProvider[] = []

				if (storeType === 'WAREHOUSE') {
					const employees = await queryMany<{
						id: string
						full_name: string
						position: string
						facility_id: string
						facility_type: string
					}>(`
						SELECT DISTINCT
							wa.worker_id as id,
							COALESCE(ad.other_names || ' ' || ad.surname, ad.other_names, ad.surname, 'N/A') as full_name,
							wa.position,
							wa.facility_id,
							wa.facility_type
						FROM ${TABLES.WORKER_ASSIGNMENTS} wa
						LEFT JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = wa.worker_id
						WHERE wa.facility_id = '${storeId}' AND wa.is_active = 'true'
					`)

					providers = employees.map((e) => ({
						id: e.id,
						full_name: e.full_name,
						position: e.position,
						store_id: e.facility_id,
						store_type: 'WAREHOUSE',
					}))
				} else {
					const groupManagers = await queryMany<{
						id: string
						surname: string
						other_names: string
						position: string
						group_id: string
					}>(`
						SELECT DISTINCT
							gma.group_manager_id as id,
							ad.surname,
							ad.other_names,
							gma.position,
							gma.group_id
						FROM ${TABLES.GROUP_MANAGER_ASSIGNMENTS} gma
						INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = gma.group_manager_id
						WHERE gma.group_id = '${storeId}'
							AND gma.is_active = 'true'
					`)

					providers = groupManagers.map((g) => ({
						id: g.id,
						full_name: `${g.other_names} ${g.surname}`.trim(),
						position: positionLabelInPortuguese(g.position),
						store_id: g.group_id,
						store_type: 'GROUP',
					}))
				}

				setInfoProviders(providers)
			} catch (error) {
				console.error('Error fetching info providers:', error)
				setInfoProviders([])
			}
		}

		fetchInfoProviders()
	}, [storeId, storeType, ownerId])

	const handleInfoProviderSelect = (providerValue: string) => {
		const selectedProvider = infoProviders.find((p) => p.id === providerValue)
		if (selectedProvider) {
			const providerName = selectedProvider.full_name || 'Nome do fornecedor de informações'

			setValue('info_provider_id', selectedProvider.id)
			setValue('info_provider_name', providerName)
			setInfoProvider({
				info_provider_id: selectedProvider.id,
				info_provider_name: providerName,
			})
			setCustomErrors({ ...customErrors, infoProvider: '' })
			setHasSelectedInfoProvider(true)
			setShowInfoProviderModal(false)
		}
	}

	const handleResetInfoProvider = () => {
		setValue('info_provider_id', '')
		setValue('info_provider_name', '')
		setInfoProvider({
			info_provider_id: '',
			info_provider_name: '',
		})
		setHasSelectedInfoProvider(false)
		setCustomErrors({ ...customErrors, infoProvider: '' })
	}

	// Auto-select provider if available
	useEffect(() => {
		if (infoProviders.length === 0) {
			handleResetInfoProvider()
			return
		}

		let matchingProvider: InfoProvider | undefined

		if (storeType === 'GROUP') {
			// For GROUP type, find the provider with position 'promotor'
			matchingProvider = infoProviders.find(
				(p) => p.store_id === storeId && p.store_type === 'GROUP' && p.position.toLowerCase().includes('promotor'),
			)
		} else {
			// For WAREHOUSE type, find any matching provider
			matchingProvider = infoProviders.find((p) => p.store_id === storeId && p.store_type === 'WAREHOUSE')
		}

		if (matchingProvider) {
			handleInfoProviderSelect(matchingProvider.id)
		}
	}, [infoProviders, storeId, storeType])

	return (
		<View className="mb-3">
			<Label label="" />
			<CustomSelectItemTrigger
				selectedItem={infoProvider?.info_provider_name || 'Seleccione'}
				setShowItems={setShowInfoProviderModal}
				resetItem={handleResetInfoProvider}
				hasSelectedItem={hasSelectedInfoProvider}
			/>
			<CustomSelectItem
				label="Seleccione o fornecedor de informações"
				searchPlaceholder="Pesquise por nome"
				emptyMessage="Nenhum fornecedor de informações encontrado"
				showModal={showInfoProviderModal}
				setShowModal={setShowInfoProviderModal}
				itemsList={infoProviders.map((p) => ({
					label: p.full_name || 'Nome do fornecedor de informações',
					value: p.id,
					description: capitalize(p.position || 'Trabalhador'),
				}))}
				setValue={handleInfoProviderSelect}
			/>
			{customErrors?.infoProvider ? (
				<Text className="text-[12px] text-red-500 mt-1">{customErrors.infoProvider}</Text>
			) : (
				<Text className="text-[12px] italic text-gray-500 mt-1">Fornecedor de informações</Text>
			)}
		</View>
	)
}
