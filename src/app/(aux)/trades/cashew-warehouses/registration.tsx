import React from 'react'
import AddCashewWarehouseForm from 'src/components/forms/AddCashewWarehouse'
import { CashewWarehouseType } from 'src/types'
import { useLocalSearchParams } from 'expo-router'

export default function CashewWarehouseRegistrationScreen() {
	const { warehouseType } = useLocalSearchParams()

	return <AddCashewWarehouseForm warehouseType={warehouseType as CashewWarehouseType} />
}