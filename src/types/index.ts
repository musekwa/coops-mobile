import { IconComponentType } from '../components/dynamic-icon/DynamicIcon'

export enum GroupManagerPosition {
	PRESIDENT = 'PRESIDENT',
	VICE_PRESIDENT = 'VICE_PRESIDENT',
	SECRETARY = 'SECRETARY',
	PROMOTER = 'PROMOTER',
}


// Types
export interface ReducedTransactionType {
	date: string
	quantityBought: number
	boughtPrice: number
	quantityTransferredIn: number
	quantitySold: number
	resoldPrice: number
	quantityTransferredOut: number
	quantityProcessed: number
	quantityExported: number
	quantityAggregated: number
	quantityLost: number
	employee_name: string
}

export enum AddressLevel {
	FROM_COUNTRIES = 'FROM_COUNTRIES',
	FROM_PROVINCES = 'FROM_PROVINCES',
	FROM_DISTRICTS = 'FROM_DISTRICTS',
	FROM_ADMIN_POSTS = 'FROM_ADMIN_POSTS',
	FROM_VILLAGES = 'FROM_VILLAGES',
}

export enum LocationType {
	PROVINCE = 'PROVINCE',
	DISTRICT = 'DISTRICT',
	ADMIN_POST = 'ADMIN_POST',
	VILLAGE = 'VILLAGE',
	COUNTRY = 'COUNTRY',
}


export enum PathLabelType {
	GENERATED_BY_SYSTEM = 'GENERATED_BY_SYSTEM',
	REQUESTED_BY_DRIVER = 'REQUESTED_BY_DRIVER',
	CHANGED_UNEXPECTEDLY_BY_DRIVER = 'CHANGED_UNEXPECTEDLY_BY_DRIVER',
	CHANGED_AS_PER_SHIPMENT_REJECTION = 'CHANGED_AS_PER_SHIPMENT_REJECTION',
}

export enum InformalTraderLicenseType {
	CERTIFICATE = 'CERTIFICATE',
	PRELIMINARY_COMMUNICATION = 'PRELIMINARY_COMMUNICATION',
	NONE = 'NONE',
}

export enum CashewFactoryType {
	LARGE_SCALE = 'LARGE_SCALE',
	SMALL_SCALE = 'SMALL_SCALE',
	INFORMAL = 'INFORMAL',
}

export enum ShipmentStatus {
	ARRIVING = 'ARRIVING',
	DEPARTING = 'DEPARTING',
	TRANSITING = 'TRANSITING',
	// ARRIVED = 'ARRIVED',
}





export enum GeneratedReportHint {
	WAREHOUSES = 'WAREHOUSES',
	TRADERS = 'TRADERS',
	ORGANIZATIONS = 'ORGANIZATIONS',
	SHIPMENTS = 'SHIPMENTS',
}


export enum MetricName {
	FARMERS_REGISTERED = 'FARMERS_REGISTERED',
	TRADERS_REGISTERED = 'TRADERS_REGISTERED',
	ASSOCIATIONS_REGISTERED = 'ASSOCIATIONS_REGISTERED',
	COOPERATIVES_REGISTERED = 'COOPERATIVES_REGISTERED',
	COOP_UNIONS_REGISTERED = 'COOP_UNIONS_REGISTERED',
	WAREHOUSES_REGISTERED = 'WAREHOUSES_REGISTERED',
	BUYING_POSTS_REGISTERED = 'BUYING_POSTS_REGISTERED',
	TRANSITING_CASHEWS_INSPECTED = 'TRANSITING_CASHEWS_INSPECTED',	
	MONITORING_TO_BUYING_POSTS = 'MONITORING_TO_BUYING_POSTS',
	MONITORING_TO_WAREHOUSES = 'MONITORING_TO_WAREHOUSES',
	MONITORING_TO_ASSOCIATIONS = 'MONITORING_TO_ASSOCIATIONS',
	MONITORING_TO_COOPERATIVES = 'MONITORING_TO_COOPERATIVES',
	MONITORING_TO_COOP_UNIONS = 'MONITORING_TO_COOP_UNIONS',
	LARGE_SCALE_FACTORIES_REGISTERED = 'LARGE_SCALE_FACTORIES_REGISTERED',
	SMALL_SCALE_FACTORIES_REGISTERED = 'SMALL_SCALE_FACTORIES_REGISTERED',
	INFORMAL_FACTORIES_REGISTERED = 'INFORMAL_FACTORIES_REGISTERED',
}

export interface OverviewItemProps {
	title: string
	value: number
}

export type PieChartData = {
	color: string
	label: string
	value: number
	legendFontColor?: string
}

export type WarehouseDetailsType = {
	warehouseName: string
	address: string
	ownerName: string
	ownerPhone?: string
	ownerPhoto?: string
}

export type StockDetailsType = {
	bought: number
	sold: number
	transferredOut: number
	transferredIn: number
	exported: number
	processed: number
	lost: number
	aggregated: number
}

export type TransactionDetailsType = {
	_id: string
	flow: TransactionFlowType
	unit: string
	price?: number
	storeReferenceId?: string
	startDate: Date
	endDate: Date
	quantity: number
	createdBy: string
	createdAt: Date
}


export type Seller = {
	id: string
	label: string
}

export enum TransactionFlowType {
	TRANSFERRED_IN = 'TRANSFERRED_IN',
	TRANSFERRED_OUT = 'TRANSFERRED_OUT',
	BOUGHT = 'BOUGHT',
	SOLD = 'SOLD',
	EXPORTED = 'EXPORTED',
	PROCESSED = 'PROCESSED',
	LOST = 'LOST',
	AGGREGATED = 'AGGREGATED',
	// SENT_TO_FINAL_DESTINATION = 'SENT_TO_FINAL_DESTINATION',
}

export enum CashewWarehouseType {
	BUYING = 'BUYING',
	AGGREGATION = 'AGGREGATION',
	DESTINATION = 'DESTINATION',
	COOPERATIVE = 'COOPERATIVE',
	COOP_UNION = 'COOP_UNION',
	ASSOCIATION = 'ASSOCIATION',
}

export type CheckType = {
	stage: string // stage of the shipment: AT_DEPARTURE, AT_ARRIVAL, IN_TRANSIT
	checkedBy: string // user name
	checkedAt: string //stringified date
	phone: string // phone number of the user
	place: string // place where the check was made (district)
	point: string // point where the check was made (checkpoint)
	notes?: string // additional notes
}

export enum ResourceName {
	GROUP = 'GROUP',
	FARMER = 'FARMER',
	TRADER = 'TRADER',
	SHIPMENT = 'SHIPMENT',
	UNKNOWN = 'UNKNOWN',
}

export type PopMenuOption = {
	label: string
	icon?: IconComponentType
	action: () => void
}

// Read and Write Permissions
export enum Permission {
	DISTRICTWIDE = 'DISTRICTWIDE',
	DPROVINCEWIDE = 'DPROVINCEWIDE',
	COUNTRYWIDE = 'COUNTRYWIDE',
	PER_USER = 'PER_USER',
}

export type UserData = {
	_id: string
	name: string
	phone: string
	email: string
	password?: string
	roles: UserRoles[]
	province: string
	district: string
	photo?: string
}

export type UserRegister = {
	name: string
	phone: string
	email: string
	password: string
	roles: string[]
	province_id: string
	district_id: string
}

export enum UserRoles {
	FIELD_AGENT = 'FIELD_AGENT',
	INSPECTOR = 'INSPECTOR',
	COOP_ADMIN = 'COOP_ADMIN',
	SUPERVISOR = 'SUPERVISOR',
}

export enum EmployerType {
	COOPERATIVE = 'COOPERATIVE',
	FARMER = 'FARMER',
	TRADER = 'TRADER',
	COOP_UNION = 'COOP_UNION',
}

export enum StaffRole {
	ADMIN = 'ADMIN',
	PRESIDENT = 'PRESIDENT',
	VICE_PRESIDENT = 'VICE_PRESIDENT',
	SECRETARY = 'SECRETARY',
	TREASURER = 'TREASURER',
	ADVISOR = 'ADVISOR',
	MEMBER = 'MEMBER',
}

export enum ActionType {
	ADD_COOPERATIVE = 'add-cooperative',
	ADD_ASSOCIATION = 'add-association',
	ADD_COOP_UNION = 'add-coop-union',
	ADD_FARMER = 'add-farmer',
	ADD_TRADER = 'add-trader',
	ADD_STAFF = 'add-staff',
	ADD_COOPERATIVE_MEMBER = 'add-cooperativeMember',
	ADD_COOP_UNION_MEMBER = 'add-coop-union-member',
	ADD_ASSOCIATION_MEMBER = 'add-association-member',
	ADD_GROUP_MEMBER = 'add-group-member',
	UNKNOWN = 'unknown',
	NO_INFO = 'no-info',

	ADD_SHIPMENT = 'add-shipment',

	ADD_TRANSIT_LICENSE_IMAGE = 'add-transit-license-image',
	ADD_FARMER_PHOTO = 'add-farmer-photo',
	ADD_TRADER_PHOTO = 'add-trader-photo',
	ADD_ASSOCIATION_PHOTO = 'add-association-photo',
	ADD_COOPERATIVE_PHOTO = 'add-cooperative-photo',
	ADD_COOP_UNION_PHOTO = 'add-coop-union-photo',
	PREVIEW_IMAGE = 'preview-image',

	ADD_CASHEW_WAREHOUSE = 'add-cashew-warehouse',
	ADD_CASHEW_FACTORY = 'add-cashew-factory',
	ADD_TRANSACTION = 'add-transaction',
}

export type CoopMemberListItem = {
	_id: string
	otherNames: string
	surname: string
	photo?: string
	birth: {
		province?: string
		district?: string
		post?: string
		date?: Date
	}
	gender: string
	contacts?: {
		phone1?: number
		phone2?: number
	}
}

export type CoopListItem = {
	_id: string
	name: string
	numberOfMembers: { total: number; women: number }
	photo?: string
}

export type TraderListItem = {
	_id: string
	otherNames: string
	surname: string
	photo?: string
	contacts?: {
		phone1?: number
		phone2?: number
	}
}

export type FarmerListItem = {
	_id: string
	otherNames: string
	surname: string
	photo?: string
	contacts?: {
		phone1?: number
		phone2?: number
	}
}

export enum MultiCategory {
	// Farmer's categories
	FARMER_SMALL_SCALE = 'FARMER_SMALL_SCALE',
	FARMER_LARGE_SCALE = 'FARMER_LARGE_SCALE',
	FARMER_UNCATEGORIZED = 'FARMER_UNCATEGORIZED',
	FARMER_SPRAYING_SERVICE_PROVIDER = 'FARMER_SPRAYING_SERVICE_PROVIDER',

	// Trader's categories
	// If PRIMARY, then NOT SECONDARY, and NOT FINAL
	// If SECONDARY, then NOT FINAL, and NOT PRIMARY
	TRADER_PRIMARY = 'TRADER_PRIMARY',
	TRADER_SECONDARY = 'TRADER_SECONDARY',
	TRADER_INFORMAL = 'TRADER_INFORMAL',

	// Final Trader's categories
	// If FINAL, then NOT SECONDARY, and NOT PRIMARY
	// FINAL can combine EXPORT, LOCAL and PROCESSING
	TRADER_EXPORT = 'TRADER_EXPORT',
	TRADER_LOCAL = 'TRADER_LOCAL',
	TRADER_LARGE_SCALE_PROCESSING = 'TRADER_LARGE_SCALE_PROCESSING',
	TRADER_SMALL_SCALE_PROCESSING = 'TRADER_SMALL_SCALE_PROCESSING',
	TRADER_FINAL = 'TRADER_FINAL',

	TRADER_UNCATEGORIZED = 'TRADER_UNCATEGORIZED',

	WORKER = 'WORKER',
}

export type CategoryCardType = {
	actorCategory: ActorCategory
	description: string
	title: string
	bannerImage: string
	total?: number
	icon?: string
}

export enum ActorCategory {
	FARMER = 'FARMER',
	SERVICE_PROVIDER = 'SERVICE_PROVIDER',
	TRADER = 'TRADER',
	EXPORTER = 'EXPORTER',
	PROCESSOR = 'PROCESSOR',
	COOPERATIVE = 'COOPERATIVE',
	ASSOCIATION = 'ASSOCIATION',
	COOP_UNION = 'COOP_UNION',
	STAFF = 'STAFF',
	COOPERATIVE_MEMBER = 'COOPERATIVE_MEMBER',
	COOP_UNION_MEMBER = 'COOP_UNION_MEMBER',
	GROUP_MEMBER = 'GROUP_MEMBER',
	GROUP = 'GROUP',
}

export enum OrganizationTypes {
	COOPERATIVE = 'COOPERATIVE',
	ASSOCIATION = 'ASSOCIATION',
	COOP_UNION = 'COOP_UNION',
}

export enum TraderType {
	PRIMARY = 'PRIMARY',
	SECONDARY = 'SECONDARY',
	FINAL = 'FINAL',
	INFORMAL = 'INFORMAL',
}

export enum TradingPurpose {
	EXPORT = 'EXPORT',
	LOCAL = 'LOCAL',
	SMALL_SCALE_PROCESSING = 'SMALL_SCALE_PROCESSING',
	LARGE_SCALE_PROCESSING = 'LARGE_SCALE_PROCESSING',
	RESELLING = 'RESELLING',
	PROCESSING = 'PROCESSING',
	INFORMAL_EXPORT = 'INFORMAL_EXPORT',
	INFORMAL_PROCESSING = 'INFORMAL_PROCESSING',
}

export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
	OTHER = 'OTHER',
}

export enum CoopPurpose {
	JOINT_PRODUCTION = 'JOINT_PRODUCTION',
	JOINT_PROCESSING = 'JOINT_PROCESSING',
	JOINT_SELLING = 'JOINT_SELLING',
	JOINT_EXPORT = 'JOINT_EXPORT',
}

export enum InstitutionPurpose {
	PRODUCTION = 'PRODUCTION',
	PROCESSING = 'PROCESSING',
	EXPORT = 'EXPORT',
	BUYING_AND_SELLING = 'BUYING_AND_SELLING',
}

export enum CoopAffiliationStatus {
	AFFILIATED = 'AFFILIATED',
	NOT_AFFILIATED = 'NOT_AFFILIATED',
	AFFILIATION_ON_PROCESS = 'AFFILIATION_ON_PROCESS',
}

export enum InstitutionOwnershipType {
	PRIVATE = 'PRIVATE',
	PUBLIC = 'PUBLIC',
}
