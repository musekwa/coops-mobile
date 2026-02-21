import { Schema } from '@powersync/react-native'
import documents from './documents'
import user_details from './user_details'
import group_members from './group_members'
import cashew_warehouse_transactions from './cashew_warehouse_transactions'
import organization_transactions from './organization_transactions'
import organization_transaction_participants from './organization_transaction_participants'
import countries from './countries'
import provinces from './provinces'
import districts from './districts'
import admin_posts from './admin_posts'
import villages from './villages'
import nuits from './nuits'
import nuels from './nuels'
import licenses from './licenses'
import cashew_shipments from './cashew_shipments'
import shipment_loads from './shipment_loads'
import shipment_cars from './shipment_cars'
import shipment_drivers from './shipment_drivers'
import shipment_directions from './shipment_directions'
import shipment_checks from './shipment_checks'
import shipment_checkpoint_inspectors from './shipment_checkpoint_inspectors'
import shipment_checkpoint_sequence from './shipment_checkpoint_sequence'
import cashew_inborders_smuggling from './cashew_inborders_smuggling'
import cashew_crossborders_smuggling from './cashew_crossborders_smuggling'
import borders from './borders'
import actors from './actors'
import actor_documents from './actor_documents'
import birth_places from './birth_places'
import birth_dates from './birth_dates'
import contact_details from './contact_details'
import address_details from './address_details'
import facilities from './facilities'
import warehouse_details from './warehouse_details'
import actor_details from './actor_details'
import actor_categories from './actor_categories'
import genders from './genders'
import dependents from './dependents'
import worker_assignments from './worker_assignments'
import group_manager_assignments from './group_manager_assignments'
import checkpoints from './checkpoints'

export const AppSchema = new Schema({
	documents,
	user_details,
	group_members,
	cashew_warehouse_transactions,
	organization_transactions,
	organization_transaction_participants,
	countries,
	provinces,
	districts,
	admin_posts,
	villages,
	nuits,
	nuels,
	licenses,
	cashew_shipments,
	shipment_loads,
	shipment_cars,
	shipment_drivers,
	shipment_directions,
	shipment_checks,
	shipment_checkpoint_inspectors,
	shipment_checkpoint_sequence,
	cashew_inborders_smuggling,
	cashew_crossborders_smuggling,
	borders,
	actors,
	actor_documents,
	birth_places,
	birth_dates,
	contact_details,
	address_details,
	facilities,
	warehouse_details,
	actor_details,
	actor_categories,
	genders,
	dependents,
	worker_assignments,
	group_manager_assignments,
	checkpoints,
})

export const TABLES = {
	DOCUMENTS: 'documents',
	USER_DETAILS: 'user_details',
	GROUP_MEMBERS: 'group_members',
	CASHEW_WAREHOUSE_TRANSACTIONS: 'cashew_warehouse_transactions',
	ORGANIZATION_TRANSACTIONS: 'organization_transactions',
	ORGANIZATION_TRANSACTION_PARTICIPANTS: 'organization_transaction_participants',
	COUNTRIES: 'countries',
	PROVINCES: 'provinces',
	DISTRICTS: 'districts',
	ADMIN_POSTS: 'admin_posts',
	VILLAGES: 'villages',
	NUITS: 'nuits',
	NUELS: 'nuels',
	LICENSES: 'licenses',
	CASHEW_SHIPMENTS: 'cashew_shipments',
	SHIPMENT_LOADS: 'shipment_loads',
	SHIPMENT_CARS: 'shipment_cars',
	SHIPMENT_DRIVERS: 'shipment_drivers',
	SHIPMENT_DIRECTIONS: 'shipment_directions',
	SHIPMENT_CHECKS: 'shipment_checks',
	SHIPMENT_CHECKPOINTS: 'shipment_checkpoints', // Still used for linking fields (next checkpoint IDs)
	SHIPMENT_CHECKPOINT_INSPECTORS: 'shipment_checkpoint_inspectors',
	SHIPMENT_CHECKPOINT_SEQUENCE: 'shipment_checkpoint_sequence',
	CASHEW_INBORDERS_SMUGGLING: 'cashew_inborders_smuggling',
	CASHEW_CROSSBORDERS_SMUGGLING: 'cashew_crossborders_smuggling',
	BORDERS: 'borders',
	ACTORS: 'actors',
	ACTOR_DOCUMENTS: 'actor_documents',
	BIRTH_PLACES: 'birth_places',
	BIRTH_DATES: 'birth_dates',
	CONTACT_DETAILS: 'contact_details',
	ADDRESS_DETAILS: 'address_details',
	FACILITIES: 'facilities',
	WAREHOUSE_DETAILS: 'warehouse_details',
	ACTOR_DETAILS: 'actor_details',
	ACTOR_CATEGORIES: 'actor_categories',
	GENDERS: 'genders',
	DEPENDENTS: 'dependents',
	WORKER_ASSIGNMENTS: 'worker_assignments',
	GROUP_MANAGER_ASSIGNMENTS: 'group_manager_assignments',
	CHECKPOINTS: 'checkpoints',
}

export type Database = (typeof AppSchema)['types']
// export type TraderRecord = Database['traders']
export type DocumentRecord = Database['documents']
export type UserDetailsRecord = Database['user_details']
export type GroupMemberRecord = Database['group_members']
// export type CashewWarehouseRecord = Database['cashew_warehouses']
export type CashewWarehouseTransactionRecord = Database['cashew_warehouse_transactions']
export type OrganizationTransactionRecord = Database['organization_transactions']
export type OrganizationTransactionParticipantRecord = Database['organization_transaction_participants']
export type CountryRecord = Database['countries']
export type ProvinceRecord = Database['provinces']
export type DistrictRecord = Database['districts']
export type AdminPostRecord = Database['admin_posts']
export type VillageRecord = Database['villages']
export type NuitRecord = Database['nuits']
export type NuelRecord = Database['nuels']
export type LicenseRecord = Database['licenses']
export type CashewShipmentRecord = Database['cashew_shipments']
export type ShipmentLoadRecord = Database['shipment_loads']
export type ShipmentCarRecord = Database['shipment_cars']
export type ShipmentDriverRecord = Database['shipment_drivers']
export type ShipmentDirectionRecord = Database['shipment_directions']
export type ShipmentCheckRecord = Database['shipment_checks']
export type ShipmentCheckpointRecord = Database['checkpoints'] // Changed from shipment_checkpoints to checkpoints
export type ShipmentCheckpointInspectorRecord = Database['shipment_checkpoint_inspectors']
export type ShipmentCheckpointSequenceRecord = Database['shipment_checkpoint_sequence']
export type CashewInbordersSmugglingRecord = Database['cashew_inborders_smuggling']
export type CashewCrossbordersSmugglingRecord = Database['cashew_crossborders_smuggling']
export type BorderRecord = Database['borders']
export type ActorRecord = Database['actors']
export type ActorDocumentRecord = Database['actor_documents']
export type BirthPlaceRecord = Database['birth_places']
export type BirthDateRecord = Database['birth_dates']
export type ContactDetailRecord = Database['contact_details']
export type AddressDetailRecord = Database['address_details']
export type FacilityRecord = Database['facilities']
export type WarehouseDetailRecord = Database['warehouse_details']
export type WorkerAssignmentRecord = Database['worker_assignments']
export type ActorDetailRecord = Database['actor_details']
export type ActorCategoryRecord = Database['actor_categories']
export type GenderRecord = Database['genders']
export type DependentRecord = Database['dependents']
export type GroupManagerAssignmentRecord = Database['group_manager_assignments']
export type CheckpointRecord = Database['checkpoints']
