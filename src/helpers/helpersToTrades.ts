import { ShipmentStatusTypes } from 'src/constants/tracking'
import { CashewWarehouse } from 'src/models/cashewWarehouse'
import { Transaction } from 'src/models/embeddable'
import { OrganizationTransaction } from 'src/models/organizationTransaction'
import { Shipment } from 'src/models/shipment'
import {
	CashewFactoryType,
	CashewWarehouseType,
	OrganizationTypes,
	ShipmentStatus,
	TransactionDetailsType,
	TransactionFlowType,
} from 'src/types'
import { match } from 'ts-pattern'

// Filter shipments that are arriving, departing or transiting in a district
export const filterArrivingAndDepartingAndTransitingShipments = (shipments: Shipment[], district: string) =>
	shipments.filter(
		(shipment) =>
			shipment.destination === district ||
			shipment?.transitLicense?.issuedIn === district ||
			shipment.checks.some((check) => check.place === district && check.stage !== ShipmentStatusTypes.AT_DEPARTURE) ||
			(shipment.paths &&
				shipment.paths[shipment.paths.length - 1]?.districts
					.slice(1, shipment.paths[shipment.paths.length - 1]?.districts.length - 1)
					.includes(district)),
	)

export const filterShipmentsByStatus = (shipments: Shipment[], district: string, status: ShipmentStatus) =>
	shipments.filter((shipment) => {
		if (status === ShipmentStatus.ARRIVING) return shipment.destination === district
		if (status === ShipmentStatus.DEPARTING) return shipment?.transitLicense?.issuedIn === district
		if (status === ShipmentStatus.TRANSITING)
			return (
				shipment.checks.some((check) => check.place === district && check.stage !== ShipmentStatusTypes.AT_DEPARTURE) ||
				(shipment.paths &&
					shipment.paths[shipment.paths.length - 1]?.districts
						.slice(1, shipment.paths[shipment.paths.length - 1]?.districts.length - 1)
						.includes(district))
			)
		return false
	})

export const groupShipmentsByStatus = (shipments: Shipment[], district: string): Record<ShipmentStatus, Shipment[]> => {
	return {
		[ShipmentStatus.ARRIVING]: filterShipmentsByStatus(shipments, district, ShipmentStatus.ARRIVING),
		[ShipmentStatus.DEPARTING]: filterShipmentsByStatus(shipments, district, ShipmentStatus.DEPARTING),
		[ShipmentStatus.TRANSITING]: filterShipmentsByStatus(shipments, district, ShipmentStatus.TRANSITING),
	}
}

// Group warehouses by admin post
export const groupWarehousesByAdminPost = (warehouses: CashewWarehouse[]) => {
	const groupedWarehouses = warehouses.reduce(
		(acc, warehouse) => {
			const adminPost = warehouse.adminPost
			if (!acc[adminPost]) {
				acc[adminPost] = []
			}
			acc[adminPost].push(warehouse)
			return acc
		},
		{} as Record<string, CashewWarehouse[]>,
	)
	return groupedWarehouses
}

// Calculate the weighted price of a transaction
export const calculateWeightedPrice = (transactions: Transaction[]) => {
	const totalQuantity = transactions.reduce((acc, transaction) => acc + transaction.quantity, 0)
	const totalPrice = transactions.reduce(
		(acc, transaction) => acc + transaction.quantity * (transaction?.price || 0),
		0,
	)
	if (totalQuantity === 0) return 0
	return totalPrice / totalQuantity
}

export const calculateTotalByTransactionFlow = (transactions: Transaction[], flow: TransactionFlowType) => {
	if (!transactions) return 0
	return transactions
		.filter((transaction) => transaction.flow === flow)
		.reduce((acc, transaction) => acc + transaction.quantity, 0)
}

export const translateFactoryType = (factoryType: CashewFactoryType) => {
	const foundFactory = match(factoryType)
		.with(CashewFactoryType.INFORMAL, () => 'Informal')
		.with(CashewFactoryType.LARGE_SCALE, () => 'Industrial')
		.with(CashewFactoryType.SMALL_SCALE, () => 'Artesanal')
		.otherwise(() => 'Informal')
	return foundFactory
}

export const translateWarehouseTypeToPortuguese = (warehouseType: string) => {
	const castWarehouseType = warehouseType as CashewWarehouseType | CashewFactoryType | OrganizationTypes
	if (!castWarehouseType) return 'Armazém'
	switch (castWarehouseType) {
		case CashewWarehouseType.BUYING:
			return 'Posto de compra'
		case CashewWarehouseType.AGGREGATION:
			return 'Armazém de trânsito'
		case CashewWarehouseType.DESTINATION:
			return 'Armazém de destino'
		case CashewFactoryType.LARGE_SCALE:
			return 'Fábrica de grande porte'
		case CashewFactoryType.SMALL_SCALE:
			return 'Fábrica de pequeno porte'
		case CashewFactoryType.INFORMAL:
			return 'Fábrica informal'
		case OrganizationTypes.ASSOCIATION:
			return 'Associação'
		case OrganizationTypes.COOPERATIVE:
			return 'Cooperativa'
		case OrganizationTypes.COOP_UNION:
			return 'União de cooperativas'
		default:
			return 'Armazém'
	}
}

export const getFlattenedWarehouseTransactions = (warehouses: CashewWarehouse[]): Transaction[] => {
	const flattenedTransactions: Transaction[] = []
	warehouses.forEach((warehouse) => {
		if (warehouse.transactions.length > 0) {
			flattenedTransactions.push(...warehouse.transactions)
		}
	})
	return flattenedTransactions
}

export const getFlattenedOrganizationTransactions = (
	organizationTransactions: OrganizationTransaction[],
	orgId?: string,
): Transaction[] => {
	const flattenedTransactions: Transaction[] = []
	if (orgId) {
		organizationTransactions.forEach((orgTransaction) => {
			if (orgTransaction.organizationId === orgId && orgTransaction.transactions.length > 0) {
				flattenedTransactions.push(...orgTransaction.transactions)
			}
		})
	} else {
		organizationTransactions.forEach((orgTransaction) => {
			if (orgTransaction.transactions.length > 0) {
				flattenedTransactions.push(...orgTransaction.transactions)
			}
		})
	}
	return flattenedTransactions
}

export const getStockDetails = (transactions: { quantity: number; transaction_type: TransactionFlowType }[]) => {
	const details = transactions.reduce(
		(acc, transaction) => {
			switch (transaction.transaction_type) {
				case TransactionFlowType.BOUGHT:
					acc.bought += transaction.quantity || 0
					break
				case TransactionFlowType.SOLD:
					acc.sold += transaction.quantity || 0
					break
				case TransactionFlowType.TRANSFERRED_OUT:
					acc.transferredOut += transaction.quantity || 0
					break
				case TransactionFlowType.TRANSFERRED_IN:
					acc.transferredIn += transaction.quantity || 0
					break
				case TransactionFlowType.EXPORTED:
					acc.exported += transaction.quantity || 0
					break
				case TransactionFlowType.PROCESSED:
					acc.processed += transaction.quantity || 0
					break
				case TransactionFlowType.LOST:
					acc.lost += transaction.quantity || 0
					break
				case TransactionFlowType.AGGREGATED:
					acc.aggregated += transaction.quantity || 0
					break
			}
			return acc
		},
		{
			bought: 0,
			sold: 0,
			transferredOut: 0,
			transferredIn: 0,
			exported: 0,
			processed: 0,
			lost: 0,
			aggregated: 0,
		},
	)
	return details
}

export const getCurrentStock = (transactions: { quantity: number; transaction_type: TransactionFlowType }[]) => {
	const currentStock = transactions.reduce((total, transaction) => {
		switch (transaction.transaction_type) {
			case TransactionFlowType.BOUGHT:
			case TransactionFlowType.TRANSFERRED_IN:
			case TransactionFlowType.AGGREGATED:
				return total + (transaction.quantity || 0)
			case TransactionFlowType.SOLD:
			case TransactionFlowType.TRANSFERRED_OUT:
			case TransactionFlowType.EXPORTED:
			case TransactionFlowType.PROCESSED:
			case TransactionFlowType.LOST:
				return total - (transaction.quantity || 0)
			default:
				return total
		}
	}, 0)
	return currentStock
}

export const translateTransactionFlowToPortuguese = (flow: TransactionFlowType) =>
	match(flow)
		.with(TransactionFlowType.SOLD, () => 'Vendido')
		.with(TransactionFlowType.TRANSFERRED_IN, () => 'Recebido')
		.with(TransactionFlowType.TRANSFERRED_OUT, () => 'Transferido')
		.with(TransactionFlowType.BOUGHT, () => 'Comprado')
		.with(TransactionFlowType.PROCESSED, () => 'Processado')
		.with(TransactionFlowType.EXPORTED, () => 'Exportado')
		.with(TransactionFlowType.AGGREGATED, () => 'Agregado')
		.with(TransactionFlowType.LOST, () => 'Perdido')
		.otherwise(() => 'Transacção desconhecida')

export const isAFactory = (warehouseType: string) => {
	const castWarehouseType = warehouseType as CashewFactoryType | CashewWarehouseType | OrganizationTypes
	if (!castWarehouseType) return false
	const factoryTypes = [CashewFactoryType.LARGE_SCALE, CashewFactoryType.SMALL_SCALE, CashewFactoryType.INFORMAL]
	return factoryTypes.includes(castWarehouseType as CashewFactoryType)
}

