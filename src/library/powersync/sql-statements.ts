import { powersync } from './system'
import {
	ActorRecord,
	AddressRecord,
	AdminPostRecord,
	BirthRecord,
	// CashewWarehouseRecord,
	CashewWarehouseTransactionRecord,
	ContactRecord,
	CountryRecord,
	DistrictRecord,
	DocumentRecord,
	// EmployeeRecord,
	// GroupManagerRecord,
	GroupMemberRecord,
	LicenseRecord,
	NuelRecord,
	NuitRecord,
	OrganizationTransactionParticipantRecord,
	OrganizationTransactionRecord,
	ProvinceRecord,
	TABLES,
	VillageRecord,
} from 'src/library/powersync/schemas/AppSchema'

export const addMembersToOrganization = async (data: GroupMemberRecord[]) => {
	data.forEach(async (member) => {
		const { id, group_id, member_id, member_type, sync_id } = member
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.GROUP_MEMBERS} (id, group_id, member_id, member_type, sync_id) VALUES (?, ?, ?, ?, ?)`,
			[id, group_id, member_id, member_type, sync_id],
		)
		console.log('Members added to organization', result)
	})
}

export const deleteOne = async <T>(query: string, params: string[]) => {
	await powersync
		.execute(query, params)
		.then((result) => {
			console.log(`Result of deleteOne ${query}:`, result)
		})
		.catch((error) => {
			console.error(`Error deleting one ${query}:`, error)
		})
}

export const updateOne = async <T>(query: string, params: string[]) => {
	await powersync
		.execute(query, params)
		.then((result) => {
			console.log(`Result of updateOne ${query}:`, result)
			// return result as T
		})
		.catch((error) => {
			console.error(`Error updating one ${query}:`, error)
			// return null
		})
}

export const selectOne = async <T>(query: string, params: string[], callback: (result: T | null) => void) => {
	await powersync
		.get(query, params)
		.then((result) => {
			callback(result as T)
		})
		.catch((error) => {
			console.error(`Error selecting one ${query}:`, error)
		})
}

export const selectAll = async <T>(query: string, params: string[], callback: (result: T[] | null) => void) => {
	await powersync
		.getAll(query, params)
		.then((result) => {
			callback(result as T[])
		})
		.catch((error) => {
			console.error(`Error selecting all ${query}:`, error)
		})
}

export const insertDocument = async (data: DocumentRecord) => {
	const {
		id,
		document_type,
		document_number,
		document_date,
		document_place,
		nuit,
		nuel,
		license_type,
		license_number,
		license_date,
		license_place,
		sync_id,
	} = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.DOCUMENTS} (
            id,
            document_type,
            document_number,
            document_date,
            document_place,
            nuit,
            nuel,
            license_type,
            license_number,     
            license_date,
            license_place,
            sync_id
        ) VALUES (
            ?,
            ?,
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
		[
			id,
			document_type,
			document_number,
			document_date,
			document_place,
			nuit,
			nuel,
			license_type,
			license_number,
			license_date,
			license_place,
			sync_id,
		],
	)
	console.log('Document inserted', result)
	return result
}

export const insertLicense = async (data: LicenseRecord) => {
	const { id, photo, owner_type, owner_id, number, issue_date, expiration_date, issue_place_type, sync_id, issue_place_id } = data
	try {
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.LICENSES} (
            id,
            photo,
            owner_type,
            owner_id,
            number,
            issue_date,
            expiration_date,
            issue_place_id,
            issue_place_type,
            sync_id
        ) VALUES (
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
		[
			id,
			photo,
			owner_type,
			owner_id,
			number,
			issue_date,
			expiration_date,
			issue_place_id,
			issue_place_type,
			sync_id,
		],
	)
	console.log('License inserted', result)
	return result
	} catch (error) {
		console.error('Error inserting license', error)
		return null
	}
}

export const insertContact = async (data: ContactRecord) => {
	const { id, primary_phone, secondary_phone, email, sync_id } = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.CONTACTS} (
            id,
            primary_phone,
            secondary_phone,
            email,
            sync_id
        ) VALUES (
            ?,
            ?,
            ?,
            ?,
            ?
        )`,
		[id, primary_phone, secondary_phone, email, sync_id],
	)
	console.log('Contact inserted', result)
	return result
}

export const insertAddress = async (data: AddressRecord) => {
	const { id, village_id, admin_post_id, province_id, district_id, gps_lat, gps_long, sync_id } = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.ADDRESSES} (
            id,
            village_id,
            admin_post_id,
            district_id,
            province_id,
            gps_lat,
            gps_long,
            sync_id
        ) VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )`,
		[id, village_id, admin_post_id, district_id, province_id, gps_lat, gps_long, sync_id],
	)
	console.log('Address inserted', result)
	return result
}

export const insertBirth = async (data: BirthRecord) => {
	const { id, birth_date, description, birth_place, sync_id } = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.BIRTHS} (
            id,
            birth_date,
            description,
            birth_place,
            sync_id
        ) VALUES (
            ?,
            ?,
            ?,
            ?,
            ?
        )`,
		[id, birth_date, description, birth_place, sync_id],
	)
	console.log('Birth inserted', result)
	return result
}


export const insertActor = async (data: ActorRecord) => {
	const { id, category, sync_id } = data
	const result = await powersync.execute(`INSERT INTO ${TABLES.ACTORS} (id, category, sync_id) VALUES (?, ?, ?)`, [
		id,
		category,
		sync_id,
	])
	console.log('Actor inserted', result)
	return result
}


export const queryOne = async <T>(query: string, params: string[]) => {
	let resData: T | null = null
	await powersync
		.get(query, params)
		.then((result) => {
			resData = result as T
		})
		.catch((error) => {
			console.log(`Error querying one ${query}:`, error)
		})
	return resData as T | null
}

export const queryMany = async <T>(query: string, params: any[] = []): Promise<T[]> => {
	let result: T[] | null = null
	await powersync
		.getAll(query, params)
		.then((queryResult) => {
			result = queryResult as T[]
		})
		.catch((error) => {
			console.error(`Error querying many ${query}:`, error)
		})
	return result || []
}

export const insertCashewWarehouseTransaction = async (data: CashewWarehouseTransactionRecord) => {
	const {
		id,
		created_at,
		updated_at,
		transaction_type,
		quantity,
		unit_price,
		start_date,
		end_date,
		store_id,
		confirmed,
		info_provider_id,
		reference_store_id,
		created_by,
		sync_id,
		destination,
	} = data
	const result = await powersync.execute(
		`INSERT 
			INTO ${TABLES.CASHEW_WAREHOUSE_TRANSACTIONS} 
		(
			id, 
			created_at, 
			updated_at, 
			transaction_type, 
			quantity,
			unit_price, 
			start_date, 
			end_date, 
			store_id, 
			confirmed, 
			info_provider_id,
			reference_store_id, 
			created_by, 
			sync_id, 
			destination
		) 
		VALUES 
		(
			?, 
			?, 
			?, 
			?, 
			?, 
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
		[
			id,
			created_at,
			updated_at,
			transaction_type,
			quantity,
			unit_price,
			start_date,
			end_date,
			store_id,
			confirmed,
			info_provider_id,
			reference_store_id,
			created_by,
			sync_id,
			destination,
		],
	)
	console.log('Cashew warehouse transaction inserted', result)
	return result
}

export const insertOrganizationTransaction = async (data: OrganizationTransactionRecord) => {
	const {
		id,
		created_at,
		updated_at,
		transaction_type,
		quantity,
		unit_price,
		start_date,
		end_date,
		store_id,
		confirmed,
		info_provider_id,
		reference_store_id,
		created_by,
		updated_by,
		sync_id,
	} = data
	const result = await powersync.execute(
		`INSERT 
			INTO ${TABLES.ORGANIZATION_TRANSACTIONS} (
				id, 
				created_at, 
				updated_at, 
				transaction_type, 
				quantity, 
				unit_price, 
				start_date, 
				end_date, 
				store_id, 
				confirmed, 
				info_provider_id,
				reference_store_id, 
				created_by, 
				updated_by, 
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
				?, 
				?, 
				?, 
				?, 
				?,
				?
			)`,
		[
			id,
			created_at,
			updated_at,
			transaction_type,
			quantity,
			unit_price,
			start_date,
			end_date,
			store_id,
			confirmed,
			info_provider_id,
			reference_store_id,
			created_by,
			updated_by,
			sync_id,
		],
	)
	console.log('Organization transaction inserted', result)
	return result
}

export const insertOrganizationTransactionParticipant = async (data: OrganizationTransactionParticipantRecord) => {
	const { id, transaction_id, quantity, participant_id, participant_type, sync_id } = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.ORGANIZATION_TRANSACTION_PARTICIPANTS} (id, transaction_id, quantity, participant_id, participant_type, sync_id) VALUES (?, ?, ?, ?, ?, ?)`,
		[id, transaction_id, quantity, participant_id, participant_type, sync_id],
	)
	console.log('Organization transaction participant inserted', result)
	return result
}


export const insertCountry = async (data: CountryRecord) => {
	const { id, name, initials, code, sync_id } = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.COUNTRIES} (
			id, 
			name, 
			initials, 
			code, 
			sync_id
		) 
		VALUES (
			?, 
			?, 
			?, 
			?, 
			?
		)`,
		[id, name, initials, code, sync_id],
	)
	console.log('Country inserted', result)
	return result
}

export const insertProvince = async (data: ProvinceRecord) => {
	const { id, name, initials, code, sync_id, country_id } = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.PROVINCES} (
			id, 
			name, 
			initials, 
			code, 
			sync_id, 
			country_id
		) 
		VALUES (
			?, 
			?, 
			?, 
			?, 
			?, 
			?
		)`,
		[id, name, initials, code, sync_id, country_id],
	)
	console.log('Province inserted', result)
	return result
}

export const insertDistrict = async (data: DistrictRecord) => {
	const { id, name, code, sync_id, province_id } = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.DISTRICTS} (
			id, 
			name, 
			code, 
			sync_id, 
			province_id
		) VALUES (
			?, 
			?, 
			?, 
			?, 
			?
		)`,
		[id, name, code, sync_id, province_id],
	)
	console.log('District inserted', result)
	return result
}

export const insertAdminPost = async (data: AdminPostRecord) => {
	const { id, name, code, sync_id, district_id } = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.ADMIN_POSTS} (
			id, 
			name, 
			code, 
			sync_id, 
			district_id
		) 
			VALUES 
		(
			?,
			?,
			?,
			?,
			?
		)`,
		[id, name, code, sync_id, district_id],
	)
	console.log('Admin post inserted', result)
	return result
}

export const insertVillage = async (data: VillageRecord) => {
	const { id, name, code, sync_id, admin_post_id } = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.VILLAGES} (id, name, code, sync_id, admin_post_id) VALUES (?, ?, ?, ?, ?)`,
		[id, name, code, sync_id, admin_post_id],
	)
	console.log('Village inserted', result)
	return result
}

export const selectDistrictsByProvinceId = async (provinceId: string, callback: (result: DistrictRecord[]) => void) => {
	await powersync
		.getAll(`SELECT * FROM ${TABLES.DISTRICTS} WHERE province_id = ? OR name = ?`, [provinceId, 'N/A'])
		.then((result) => {
			callback(result as DistrictRecord[])
		})
		.catch((error) => {
			console.error(`Error selecting districts by province id ${provinceId}:`, error)
		})
}

export const selectAdminPostsByDistrictId = async (
	districtId: string,
	callback: (result: AdminPostRecord[]) => void,
) => {
	await powersync
		.getAll(`SELECT * FROM ${TABLES.ADMIN_POSTS} WHERE district_id = ? OR name = ?`, [districtId, 'N/A'])
		.then((result) => {
			callback(result as AdminPostRecord[])
		})
		.catch((error) => {
			console.error(`Error selecting admin posts by district id ${districtId}:`, error)
		})
}

export const selectVillagesByAdminPostId = async (adminPostId: string, callback: (result: VillageRecord[]) => void) => {
	await powersync
		.getAll(`SELECT * FROM ${TABLES.VILLAGES} WHERE admin_post_id = ? OR name = ?`, [adminPostId, 'N/A'])
		.then((result) => {
			callback(result as VillageRecord[])
		})
		.catch((error) => {
			console.error(`Error selecting villages by admin post id ${adminPostId}:`, error)
		})
}

export const selectProvinces = async (callback: (result: ProvinceRecord[]) => void) => {
	await powersync
		.getAll(`SELECT * FROM ${TABLES.PROVINCES}`)
		.then((result) => {
			callback(result as ProvinceRecord[])
		})
		.catch((error) => {
			console.error(`Error selecting provinces:`, error)
		})
}

export const selectCountries = async (callback: (result: CountryRecord[]) => void) => {
	await powersync
		.getAll(`SELECT * FROM ${TABLES.COUNTRIES} ORDER BY name ASC`)
		.then((result) => {
			callback(result as CountryRecord[])
		})
		.catch((error) => {
			console.error(`Error selecting countries:`, error)
		})
}

export const selectAdminPostById = async (id: string, callback: (result: AdminPostRecord) => void) => {
	await powersync
		.get(`SELECT * FROM ${TABLES.ADMIN_POSTS} WHERE id = ?`, [id])
		.then((result) => {
			callback(result as AdminPostRecord)
		})
		.catch((error) => {
			console.error(`Error selecting admin post by id ${id}:`, error)
		})
}

export const insertNuit = async (data: NuitRecord) => {
	const { id, nuit, actor_id, sync_id } = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.NUITS} (id, nuit, actor_id, sync_id) VALUES (?, ?, ?, ?)`,
		[id, nuit, actor_id, sync_id],
	)
	console.log('Nuit inserted', result)
	return result
}

export const insertNuel = async (data: NuelRecord) => {
	const { id, nuel, actor_id, sync_id } = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.NUELS} (id, nuel, actor_id, sync_id) VALUES (?, ?, ?, ?)`,
		[id, nuel, actor_id, sync_id],
	)
	console.log('Nuel inserted', result)
	return result
}
