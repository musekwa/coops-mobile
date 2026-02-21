import {
	CashewWarehouseTransactionRecord,
	OrganizationTransactionRecord,
} from 'src/library/powersync/schemas/AppSchema'

export interface CashewWarehouseTransaction {
	transaction_type: string
	quantity: number
	unit_price: number
	start_date: string
	end_date: string
	store_id: string
	confirmed: boolean
	reference_store_id: string
	created_by: string
	created_at: string
	updated_at: string
}

export interface WarehouseWithAddressAndOwnerAndContact {
	id: string
	is_active: string
	owner_id: string
	address_id: string
	description: string
	warehouse_type: string
	contact_id: string
	gps_lat: string
	gps_long: string
	admin_post_name: string
	admin_post_id: string
	district_name: string
	province_name: string
	village_name: string
	village_id: string
	other_names: string
	surname: string
	photo: string
	primary_phone: string
	secondary_phone: string
}

// Warehouse owner as processed from the WarehouseWithAddressAndOwnerAndContact
export interface WarehouseOwner {
	name: string
	phone: string | number
	photo: string
}

// Warehouse as processed from the WarehouseWithAddressAndOwnerAndContact
export interface Warehouse {
	id: string
	village_name: string
	admin_post_name: string
	village_id: string
	admin_post_id: string
	is_active: string
	description: string
}

// Warehouse group as processed from the WarehouseWithAddressAndOwnerAndContact
export interface WarehouseGroup {
	owner: WarehouseOwner
	data: Warehouse[]
	// workers: Worker[]
	// Add other properties of the warehouse group if needed
}

export type ReceivedTransactionItem = CashewWarehouseTransactionRecord & {
	cw_id: string
	cw_address_id: string
	description: string
	cw_warehouse_type: string
	cw_owner_id: string
	province: string
	district: string
	admin_post: string
	village: string
}

export type TransferredTransactionItem = CashewWarehouseTransactionRecord & {
	cw_id: string
	cw_address_id: string
	description: string
	cw_warehouse_type: string
	cw_owner_id: string
	province: string
	district: string
	admin_post: string
	village: string
}

export type OrganizationTransferredTransactionItem = OrganizationTransactionRecord & {
	destination_org_id: string
	destination_org_group_name: string
	destination_org_organization_type: string
}

export type OrganizationReceivedTransactionItem = OrganizationTransactionRecord & {
	origin_org_id: string
	origin_org_group_name: string
	origin_org_organization_type: string
}

export type TransactionForReportType = {
	id: string
	transaction_type: string
	quantity: number
	unit_price: number
	start_date: string
	end_date: string
	store_id: string
	created_by: string
}

export type StoreTransactionDetailsType = {
	store_id: string
	store_name: string
	store_type: string
	store_address: string
	store_owner: string
	store_owner_phone: string
	store_owner_photo: string
}
