import React from 'react'
import { CashewWarehouseType } from 'src/types'
import WarehousePointsScreen from 'src/components/trades/WarehousePointsScreen'

export default function BuyingPointsScreen() {
	return <WarehousePointsScreen warehouseType={CashewWarehouseType.BUYING} />
}
