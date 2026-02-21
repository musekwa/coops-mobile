import { CashewWarehouseType } from 'src/types'
import { ReceivedTransactionItem, TransferredTransactionItem } from 'src/features/trades/data/types'

/**
 * Get the Portuguese label for a warehouse type
 */
export const getWarehouseTypeLabel = (type: string): string => {
	switch (type) {
		case CashewWarehouseType.BUYING:
			return 'Posto de Compras'
		case CashewWarehouseType.AGGREGATION:
			return 'Armazém de Trânsito'
		case CashewWarehouseType.DESTINATION:
			return 'Armazém de Destino'
		case CashewWarehouseType.COOPERATIVE:
			return 'Cooperativa'
		case CashewWarehouseType.ASSOCIATION:
			return 'Associação'
		case CashewWarehouseType.COOP_UNION:
			return 'União de Cooperativas'
		default:
			return 'Armazém'
	}
}

/**
 * Get description string from transaction item
 */
export const getDescriptionString = (
	item: ReceivedTransactionItem | TransferredTransactionItem,
): string => {
	return `${item.description} de ${item.village} (${item.admin_post})`
}

/**
 * Get location string from transaction item (prioritizes village > admin_post > district-province)
 */
export const getLocationString = (
	item: ReceivedTransactionItem | TransferredTransactionItem,
): string => {
	if (item.village && item.village !== 'N/A') {
		return item.village
	}
	if (item.admin_post && item.admin_post !== 'N/A') {
		return item.admin_post
	}
	return `${item.district} - ${item.province}`
}

