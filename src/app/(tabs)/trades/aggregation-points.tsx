import React from 'react'
import { CashewWarehouseType } from 'src/types'
import WarehousePointsScreen from 'src/components/trades/WarehousePointsScreen'

export default function AggregationPointsScreen() {
	return <WarehousePointsScreen warehouseType={CashewWarehouseType.AGGREGATION} />
}
