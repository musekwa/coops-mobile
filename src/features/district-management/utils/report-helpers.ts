import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { powersync } from 'src/library/powersync/system'
import { TransactionFlowType } from 'src/types'

export type WarehouseTransactionLike = {
	flow?: string
	quantity?: number
	price?: number
	unit_price?: number
}

export type WarehouseLike = {
	description: string
	transactions: WarehouseTransactionLike[]
}

export type WarehouseGroupByAdminPostType = {
	buyingPoints?: Record<string, WarehouseLike[]>
	aggregationPoints?: Record<string, WarehouseLike[]>
	destinationPoints?: Record<string, WarehouseLike[]>
}

export type RawWarehouseRecord = {
	id: string
	description: string
	warehouse_type: string
	admin_post_name: string
	district_name: string
	province_name: string
	transactions: WarehouseTransactionLike[]
}

type WarehouseRow = {
	id: string
	description: string | null
	warehouse_type: string | null
	admin_post_name: string | null
	district_name: string | null
	province_name: string | null
}

type TransactionRow = {
	store_id: string
	transaction_type: string
	quantity: number | null
	unit_price: number | null
}

type TransferSummaryRow = {
	region_id: string | null
	region_name: string | null
	province_name?: string | null
	transfer_in: number | null
	transfer_out: number | null
}

type ProcessingExportRow = {
	province_id: string | null
	province_name: string | null
	processed_qty: number | null
	exported_qty: number | null
}

const ensureCategoryBucket = (
	group: WarehouseGroupByAdminPostType,
	categoryKey: 'buyingPoints' | 'aggregationPoints' | 'destinationPoints',
): Record<string, WarehouseLike[]> => {
	if (!group[categoryKey]) {
		group[categoryKey] = {}
	}
	return group[categoryKey] as Record<string, WarehouseLike[]>
}

const addWarehouseToGroup = (group: WarehouseGroupByAdminPostType, warehouse: RawWarehouseRecord) => {
	const adminPostName = warehouse.admin_post_name || 'Posto desconhecido'
	const entry: WarehouseLike = {
		description: warehouse.description,
		transactions: warehouse.transactions,
	}

	switch (warehouse.warehouse_type) {
		case 'BUYING': {
			const bucket = ensureCategoryBucket(group, 'buyingPoints')
			if (!bucket[adminPostName]) bucket[adminPostName] = []
			bucket[adminPostName].push(entry)
			break
		}
		case 'AGGREGATION': {
			const bucket = ensureCategoryBucket(group, 'aggregationPoints')
			if (!bucket[adminPostName]) bucket[adminPostName] = []
			bucket[adminPostName].push(entry)
			break
		}
		case 'DESTINATION': {
			const bucket = ensureCategoryBucket(group, 'destinationPoints')
			if (!bucket[adminPostName]) bucket[adminPostName] = []
			bucket[adminPostName].push(entry)
			break
		}
		default:
			break
	}
}

export const buildWarehouseGroupForDistrict = (warehouses: RawWarehouseRecord[]): WarehouseGroupByAdminPostType => {
	const group: WarehouseGroupByAdminPostType = { buyingPoints: {}, aggregationPoints: {}, destinationPoints: {} }
	warehouses.forEach((warehouse) => addWarehouseToGroup(group, warehouse))
	return group
}

export const buildDistrictGrouping = (warehouses: RawWarehouseRecord[]) =>
	warehouses.reduce(
		(acc, warehouse) => {
			const districtName = warehouse.district_name || 'Distrito desconhecido'
			if (!acc[districtName]) {
				acc[districtName] = { buyingPoints: {}, aggregationPoints: {}, destinationPoints: {} }
			}
			addWarehouseToGroup(acc[districtName], warehouse)
			return acc
		},
		{} as Record<string, WarehouseGroupByAdminPostType>,
	)

export const buildProvinceGrouping = (warehouses: RawWarehouseRecord[]) =>
	warehouses.reduce(
		(acc, warehouse) => {
			const provinceName = warehouse.province_name || 'Província desconhecida'
			if (!acc[provinceName]) {
				acc[provinceName] = { buyingPoints: {}, aggregationPoints: {}, destinationPoints: {} }
			}
			addWarehouseToGroup(acc[provinceName], warehouse)
			return acc
		},
		{} as Record<string, WarehouseGroupByAdminPostType>,
	)

export const fetchWarehousePurchases = async (filter: {
	districtId?: string
	provinceId?: string
}): Promise<RawWarehouseRecord[]> => {
	const locationConditions: string[] = [
		"cw.warehouse_type IN ('BUYING','AGGREGATION','DESTINATION')",
		"cw.is_active = 'true'",
	]
	const params: string[] = []

	if (filter.districtId) {
		locationConditions.push('a.district_id = ?')
		params.push(filter.districtId)
	}

	if (filter.provinceId) {
		locationConditions.push('a.province_id = ?')
		params.push(filter.provinceId)
	}

	const whereClause = `WHERE ${locationConditions.join(' AND ')}`

	const warehouseQuery = `
		SELECT
			wd.id,
			wd.description,
			wd.type AS warehouse_type,
			ap.name AS admin_post_name,
			d.name AS district_name,
			p.name AS province_name
		FROM ${TABLES.WAREHOUSE_DETAILS} wd
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON ap.id = ad.admin_post_id
		LEFT JOIN ${TABLES.DISTRICTS} d ON d.id = ad.district_id
		LEFT JOIN ${TABLES.PROVINCES} p ON p.id = ad.province_id
		${whereClause}
	`

	const warehouseRows = await powersync.getAll<WarehouseRow>(warehouseQuery, params)

	if (!warehouseRows || warehouseRows.length === 0) {
		return []
	}

	const storePlaceholders = warehouseRows.map(() => '?').join(',')
	const transactionQuery = `
		SELECT store_id, transaction_type, quantity, unit_price
		FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS}
		WHERE store_id IN (${storePlaceholders})
	`

	const transactionRows = await powersync.getAll<TransactionRow>(
		transactionQuery,
		warehouseRows.map((row: WarehouseRow) => row.id),
	)

	const transactionsMap = new Map<string, WarehouseTransactionLike[]>()

	transactionRows.forEach((transaction: TransactionRow) => {
		if (!transactionsMap.has(transaction.store_id)) {
			transactionsMap.set(transaction.store_id, [])
		}
		if (transaction.transaction_type === TransactionFlowType.BOUGHT) {
			transactionsMap.get(transaction.store_id)!.push({
				flow: transaction.transaction_type,
				quantity: Number(transaction.quantity ?? 0),
				price: Number(transaction.unit_price ?? 0),
				unit_price: Number(transaction.unit_price ?? 0),
			})
		}
	})

	return warehouseRows.map((row: WarehouseRow) => ({
		id: row.id,
		description: row.description ?? 'Sem descrição',
		warehouse_type: (row.warehouse_type ?? '').toUpperCase(),
		admin_post_name: row.admin_post_name ?? 'Posto desconhecido',
		district_name: row.district_name ?? 'Distrito desconhecido',
		province_name: row.province_name ?? 'Província desconhecida',
		transactions: transactionsMap.get(row.id) ?? [],
	}))
}

export const fetchDistrictTransferSummary = async (districtId: string) => {
	const query = `
		SELECT
			d.id AS region_id,
			d.name AS region_name,
			p.name AS province_name,
			SUM(CASE WHEN cwt.transaction_type = '${TransactionFlowType.TRANSFERRED_IN}' THEN COALESCE(cwt.quantity, 0) ELSE 0 END) AS transfer_in,
			SUM(CASE WHEN cwt.transaction_type = '${TransactionFlowType.TRANSFERRED_OUT}' THEN COALESCE(cwt.quantity, 0) ELSE 0 END) AS transfer_out
		FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} cwt
		JOIN ${TABLES.WAREHOUSE_DETAILS} wd ON cwt.store_id = wd.id
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
		LEFT JOIN ${TABLES.DISTRICTS} d ON ad.district_id = d.id
		LEFT JOIN ${TABLES.PROVINCES} p ON ad.province_id = p.id
		WHERE d.id = ?
		GROUP BY d.id, d.name, p.name
	`

	const rows = await powersync.getAll<TransferSummaryRow>(query, [districtId])
	return rows?.[0] ?? null
}

export const fetchProvinceTransferSummary = async (provinceId: string) => {
	const query = `
		SELECT
			d.id AS region_id,
			d.name AS region_name,
			MAX(p.name) AS province_name,
			SUM(CASE WHEN cwt.transaction_type = '${TransactionFlowType.TRANSFERRED_IN}' THEN COALESCE(cwt.quantity, 0) ELSE 0 END) AS transfer_in,
			SUM(CASE WHEN cwt.transaction_type = '${TransactionFlowType.TRANSFERRED_OUT}' THEN COALESCE(cwt.quantity, 0) ELSE 0 END) AS transfer_out
		FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} cwt
		JOIN ${TABLES.WAREHOUSE_DETAILS} wd ON cwt.store_id = wd.id
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
		LEFT JOIN ${TABLES.DISTRICTS} d ON ad.district_id = d.id
		LEFT JOIN ${TABLES.PROVINCES} p ON ad.province_id = p.id
		WHERE ad.province_id = ?
		GROUP BY d.id, d.name
		ORDER BY region_name
	`

	return powersync.getAll<TransferSummaryRow>(query, [provinceId])
}

export const fetchProcessingVsExportSummary = async () => {
	const query = `
		SELECT
			p.id AS province_id,
			p.name AS province_name,
			SUM(CASE WHEN cwt.transaction_type = '${TransactionFlowType.PROCESSED}' THEN COALESCE(cwt.quantity, 0) ELSE 0 END) AS processed_qty,
			SUM(CASE WHEN cwt.transaction_type = '${TransactionFlowType.EXPORTED}' THEN COALESCE(cwt.quantity, 0) ELSE 0 END) AS exported_qty
		FROM ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} cwt
		JOIN ${TABLES.WAREHOUSE_DETAILS} wd ON cwt.store_id = wd.id
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} ad ON ad.owner_id = wd.id AND ad.owner_type = 'WAREHOUSE'
		LEFT JOIN ${TABLES.PROVINCES} p ON ad.province_id = p.id
		GROUP BY p.id, p.name
		ORDER BY p.name
	`

	return powersync.getAll<ProcessingExportRow>(query, [])
}
