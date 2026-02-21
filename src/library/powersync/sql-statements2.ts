import { powersync } from './system'
import {
	ActorDocumentRecord,
	AddressDetailRecord,
	BirthDateRecord,
	ContactDetailRecord,
	NuitRecord,
	FacilityRecord,
	WarehouseDetailRecord,
	TABLES,
	ActorCategoryRecord,
	ActorDetailRecord,
	GenderRecord,
	WorkerAssignmentRecord,
	GroupManagerAssignmentRecord,
} from 'src/library/powersync/schemas/AppSchema'
import { buildWarehouseDetail } from 'src/library/powersync/schemas/warehouse_details'

export const insertBirthDate = async (data: BirthDateRecord) => {
	const { id, owner_id, owner_type, day, month, year, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.BIRTH_DATES} (id, owner_id, owner_type, day, month, year, sync_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[id, owner_id, owner_type, day, month, year, sync_id],
		)
		console.log('Birth date inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting birth date', error)
		return null
	}
}

export const insertActorDocument = async (data: ActorDocumentRecord) => {
	const { id, type, number, date, place, owner_id, owner_type, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.ACTOR_DOCUMENTS} (id, type, number, date, place, owner_id, owner_type, sync_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[id, type, number, date, place, owner_id, owner_type, sync_id],
		)
		console.log('Actor document inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting actor document', error)
		return null
	}
}

export const insertNuit = async (data: NuitRecord) => {
	const { id, nuit, actor_id, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.NUITS} (
				id, nuit, actor_id, sync_id) VALUES (?, ?, ?, ?)`,
			[id, nuit, actor_id, sync_id],
		)
		console.log('Nuit inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting nuit', error)
		return null
	}
}

export const insertAddressDetail = async (data: AddressDetailRecord) => {
	const { id, owner_id, owner_type, village_id, admin_post_id, district_id, province_id, gps_lat, gps_long, sync_id } =
		data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.ADDRESS_DETAILS} (
				id, 
				owner_id, 
				owner_type, 
				village_id, 
				admin_post_id, 
				district_id, 
				province_id, 
				gps_lat, 
				gps_long, 
				sync_id
			) 
				VALUES (
				?, 
				?, 
				?, 
				?, 
				?, 
				?, 
				?, 
				?, 
				?, 
				?
			)`,
			[id, owner_id, owner_type, village_id, admin_post_id, district_id, province_id, gps_lat, gps_long, sync_id],
		)
		console.log('Address detail inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting address detail', error)
		return null
	}
}

export const insertContactDetail = async (data: ContactDetailRecord) => {
	const { id, owner_id, owner_type, primary_phone, secondary_phone, email, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.CONTACT_DETAILS} (
				id,
				owner_id,
				owner_type,
				primary_phone,
				secondary_phone,
				email,
				sync_id
			) VALUES (
				?,
				?,
				?,
				?,
				?,
				?,
				?
			)`,
			[id, owner_id, owner_type, primary_phone, secondary_phone, email, sync_id],
		)
		console.log('Contact detail inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting contact detail', error)
		return null
	}
}


export const insertFacility = async (data: FacilityRecord) => {
	const { id, name, type, owner_id, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.FACILITIES} (id, name, type, owner_id, sync_id) VALUES (?, ?, ?, ?, ?)`,
			[id, name || '', type, owner_id, sync_id],
		)
		console.log('Facility inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting facility', error)
		return null
	}
}

export const insertWarehouseDetail = async (data: WarehouseDetailRecord | ReturnType<typeof buildWarehouseDetail>) => {
	const { id, name, description, owner_id, type, sync_id, is_active, created_at, updated_at } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.WAREHOUSE_DETAILS} (
				id,
				name,
				description,
				owner_id,
				type,
				sync_id,
				is_active,
				created_at,
				updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				id,
				name,
				description,
				owner_id,
				type,
				sync_id,
				typeof is_active === 'boolean' ? String(is_active) : is_active,
				created_at,
				updated_at,
			],
		)
		console.log('Warehouse detail inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting warehouse detail', error)
		return null
	}
}

export const insertActorCategory = async (data: ActorCategoryRecord) => {
	const { id, actor_id, category, subcategory, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.ACTOR_CATEGORIES} (id, actor_id, category, subcategory, sync_id) VALUES (?, ?, ?, ?, ?)`,
			[id, actor_id, category, subcategory, sync_id],
		)
		console.log('Actor category inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting actor category', error)
		return null
	}
}

export const insertActorDetails = async (data: ActorDetailRecord) => {
	const { id, actor_id, surname, other_names, uaid, photo, sync_id, created_at, updated_at } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.ACTOR_DETAILS} (id, actor_id, surname, other_names, uaid, photo, sync_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[id, actor_id, surname, other_names, uaid, photo, sync_id, created_at, updated_at],
		)
		console.log('Actor details inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting actor details', error)
		return null
	}
}

export const insertGenders = async (data: GenderRecord) => {
	const { actor_id, name, code, sync_id, id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.GENDERS} (id, actor_id, name, code, sync_id) VALUES (?, ?, ?, ?, ?)`,
			[id, actor_id, name, code, sync_id],
		)
		console.log('Gender inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting gender', error)
		return null
	}
}

export const insertWorkerAssignment = async (data: WorkerAssignmentRecord) => {
	const { id, worker_id, facility_id, facility_type, position, is_active, sync_id, created_at, updated_at } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.WORKER_ASSIGNMENTS} (id, worker_id, facility_id, facility_type, position, is_active, sync_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[id, worker_id, facility_id, facility_type, position, is_active, sync_id, created_at, updated_at],
		)
		console.log('Worker assignment inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting worker assignment', error)
		return null
	}
}


export const insertGroupManagerAssignment = async (data: GroupManagerAssignmentRecord) => {
	const { id, group_manager_id, group_id, position, is_active, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.GROUP_MANAGER_ASSIGNMENTS} (id, group_manager_id, group_id, position, is_active, sync_id) VALUES (?, ?, ?, ?, ?, ?)`,
			[id, group_manager_id, group_id, position, is_active, sync_id],
		)
		console.log('Group manager assignment inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting group manager assignment', error)
		return null
	}
}