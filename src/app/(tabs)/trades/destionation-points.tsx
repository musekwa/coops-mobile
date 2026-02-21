import React from 'react'
import { CashewWarehouseType } from 'src/types'
import WarehousePointsScreen from 'src/components/trades/WarehousePointsScreen'

export default function DestinationPointsScreen() {
	return <WarehousePointsScreen warehouseType={CashewWarehouseType.DESTINATION} />
}
