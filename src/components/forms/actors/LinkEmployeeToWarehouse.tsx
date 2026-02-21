import { View, Text } from 'react-native'
import CustomSelectItem from 'src/components/ui/custom-select-item'
import CustomSelectItemTrigger from 'src/components/ui/custom-select-item-trigger'
import Label from '../Label'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { queryMany } from 'src/library/powersync/sql-statements'
import { UseFormSetValue } from 'react-hook-form'
import { translateWarehouseTypeToPortuguese } from 'src/helpers/helpersToTrades'

interface WarehouseData {
	id: string
	warehouse_type: string
	description: string
	owner_id: string
	address_id: string
}

interface SelectedWarehouse {
	warehouseId: string
	addressId: string
	warehouseType: string
	label: string
}

interface Props {
	employerId: string
	setValue: UseFormSetValue<{
		name: string
		position?: string
		phone?: string
		isTrader?: 'YES' | 'NO'
		warehouseId?: string
		selectedWarehouse?: SelectedWarehouse
	}>
	selectedWarehouse?: SelectedWarehouse
}

export default function LinkEmployeeToWarehouse({ employerId, setValue, selectedWarehouse }: Props) {
	const [warehouseList, setWarehouseList] = useState<WarehouseData[]>([])
	const [showModal, setShowModal] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!employerId) return

		const fetchWarehouses = async () => {
			setIsLoading(true)
			setError(null)
			try {
				const linkedWarehouses = await queryMany<{ id: string }>(
					`SELECT facility_id as id
					FROM ${TABLES.WORKER_ASSIGNMENTS} wa
					WHERE wa.facility_type = 'WAREHOUSE' AND wa.is_active = 'true'`,
				)

				const warehouses = await queryMany<WarehouseData>(
					`SELECT 
						wd.id as id, 
						wd.type as warehouse_type, 
						wd.description, 
						wd.owner_id,
						ad.id as address_id
					FROM ${TABLES.WAREHOUSE_DETAILS} wd
					LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
					WHERE wd.owner_id = '${employerId}'`,
				)

				const linkedWarehouseIds = new Set(linkedWarehouses.map((w) => w.id))
				const filteredWarehouses = warehouses.filter((w) => !linkedWarehouseIds.has(w.id))
				setWarehouseList(filteredWarehouses)
			} catch (err) {
				setError('Failed to fetch warehouses. Please try again.')
				console.error('Error fetching warehouses:', err)
			} finally {
				setIsLoading(false)
			}
		}

		fetchWarehouses()
	}, [employerId])

	const handleReset = useCallback(() => {
		setValue('selectedWarehouse', undefined)
		setValue('warehouseId', undefined)
	}, [setValue])

	const handleSelect = useCallback(
		(value: string) => {
			const selectedWarehouse = warehouseList.find((w) => w.id === value)
			if (!selectedWarehouse) return

			const { address_id, warehouse_type, id } = selectedWarehouse
			if (!address_id || !warehouse_type) return

			setValue('warehouseId', id)
			setValue('selectedWarehouse', {
				warehouseId: id,
				addressId: address_id,
				warehouseType: warehouse_type,
				label: `${translateWarehouseTypeToPortuguese(warehouse_type)}`,
			})
		},
		[warehouseList, setValue],
	)

	const warehouseItems = useMemo(
		() =>
			warehouseList.map((w) => {
				const workplaceTypeLabel = translateWarehouseTypeToPortuguese(w.warehouse_type)
				return {
					label: workplaceTypeLabel,
					description: `${w.description}`,
					value: w.id,
				}
			}),
		[warehouseList],
	)

	return (
		<View>
			<Label label="Seleccione o posto ou armazém ou fábrica" />
			<CustomSelectItemTrigger
				resetItem={handleReset}
				hasSelectedItem={!!selectedWarehouse}
				setShowItems={setShowModal}
				selectedItem={selectedWarehouse?.label || 'Seleccione o posto ou armazém ou fábrica'}
			/>
			<CustomSelectItem
				searchPlaceholder="Pesquise o posto ou armazém"
				emptyMessage={isLoading ? 'Carregando...' : 'Não há postos ou armazéns sem trabalhador vinculado'}
				label="Seleccione o posto ou armazém ou fábrica"
				showModal={showModal}
				setShowModal={setShowModal}
				itemsList={warehouseItems}
				setValue={handleSelect}
			/>
			{error ? (
				<Text className="text-red-500 text-[12px] mt-1">{error}</Text>
			) : (
				<Text className="text-gray-500 dark:text-gray-400 text-[12px] italic mb-2">
					Seleccione o posto ou armazém ou fábrica
				</Text>
			)}
		</View>
	)
}
