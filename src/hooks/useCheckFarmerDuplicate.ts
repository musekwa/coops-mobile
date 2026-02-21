import { useMemo } from 'react'
import { useQueryMany, useUserDetails } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'

interface FarmerDuplicateCheck {
	id: string
	surname: string
	other_names: string
	birth_day?: number
	birth_month?: number
	birth_year?: number
	birth_place_description?: string
	nuit?: string
	document_type?: string
	document_number?: string
	primary_phone?: string
	secondary_phone?: string
}

interface UseCheckFarmerDuplicateProps {
	nuit?: string
	docType?: string
	docNumber?: string
	primaryPhone?: string
	secondaryPhone?: string
	surname?: string
	otherNames?: string
	birthDate?: Date
	birthPlace?: string // Format: "province(...);district(...);..." or "country(...)"
}

export const useCheckFarmerDuplicate = ({
	nuit,
	docType,
	docNumber,
	primaryPhone,
	secondaryPhone,
	surname,
	otherNames,
	birthDate,
	birthPlace,
}: UseCheckFarmerDuplicateProps) => {
	const { userDetails } = useUserDetails()

	// Build query to fetch farmers with potential duplicate indicators
	const query = useMemo(() => {
		if (!userDetails?.district_id) return 'SELECT 1 WHERE 1=0'

		// Extract birth date components
		const birthDay = birthDate ? birthDate.getDate() : null
		const birthMonth = birthDate ? birthDate.getMonth() + 1 : null // JavaScript months are 0-indexed
		const birthYear = birthDate ? birthDate.getFullYear() : null

		// Separate conditions: NUIT, documents, and phone numbers should be checked globally
		// Name and birth date checks are district-specific
		const globalConditions: string[] = []
		const districtConditions: string[] = []

		// Global checks (no district filter):
		// NUIT check - CHECK 2
		if (nuit && nuit.trim().length === 9 && nuit.trim() !== 'N/A') {
			globalConditions.push(`n.nuit = '${nuit.trim()}'`)
		}

		// Document check - CHECK 3
		if (docType && docNumber && !docType.includes('Não tem') && docNumber !== 'N/A') {
			globalConditions.push(
				`(adoc.type = '${docType.replace(/'/g, "''")}' AND adoc.number = '${docNumber.replace(/'/g, "''")}')`,
			)
		}

		// Phone number checks - CHECK 5
		if (primaryPhone && primaryPhone.trim() !== 'N/A' && primaryPhone.trim() !== '') {
			globalConditions.push(
				`(cd.primary_phone = '${primaryPhone.trim()}' OR cd.secondary_phone = '${primaryPhone.trim()}')`,
			)
		}
		if (secondaryPhone && secondaryPhone.trim() !== 'N/A' && secondaryPhone.trim() !== '') {
			globalConditions.push(
				`(cd.primary_phone = '${secondaryPhone.trim()}' OR cd.secondary_phone = '${secondaryPhone.trim()}')`,
			)
		}

		// District-specific checks (filtered by district):
		// Name + birth date + birth place - CHECK 1
		if (surname && otherNames && birthDate && birthPlace && birthDay && birthMonth && birthYear) {
			districtConditions.push(
				`(LOWER(ad.surname) = LOWER('${surname.replace(/'/g, "''")}') AND LOWER(ad.other_names) = LOWER('${otherNames.replace(/'/g, "''")}') AND bd.day = ${birthDay} AND bd.month = ${birthMonth} AND bd.year = ${birthYear} AND bp.description = '${birthPlace.replace(/'/g, "''")}')`,
			)
		}

		// Birth date + birth place + (surname OR other_names) - CHECK 4
		if (birthDate && birthPlace && birthDay && birthMonth && birthYear && (surname || otherNames)) {
			const nameConditions: string[] = []
			if (surname) {
				nameConditions.push(`LOWER(ad.surname) = LOWER('${surname.replace(/'/g, "''")}')`)
			}
			if (otherNames) {
				nameConditions.push(`LOWER(ad.other_names) = LOWER('${otherNames.replace(/'/g, "''")}')`)
			}
			if (nameConditions.length > 0) {
				districtConditions.push(
					`(bd.day = ${birthDay} AND bd.month = ${birthMonth} AND bd.year = ${birthYear} AND bp.description = '${birthPlace.replace(/'/g, "''")}' AND (${nameConditions.join(' OR ')}))`,
				)
			}
		}

		// Build WHERE clauses
		const whereClauses: string[] = []
		if (globalConditions.length > 0) {
			whereClauses.push(`(${globalConditions.join(' OR ')})`)
		}
		if (districtConditions.length > 0) {
			whereClauses.push(`(addr.district_id = '${userDetails.district_id}' AND (${districtConditions.join(' OR ')}))`)
		}

		if (whereClauses.length === 0) return 'SELECT 1 WHERE 1=0'

		return `
			SELECT DISTINCT
				ad.actor_id as id,
				ad.surname,
				ad.other_names,
				bd.day as birth_day,
				bd.month as birth_month,
				bd.year as birth_year,
				bp.description as birth_place_description,
				n.nuit,
				adoc.type as document_type,
				adoc.number as document_number,
				cd.primary_phone,
				cd.secondary_phone
			FROM ${TABLES.ACTOR_DETAILS} ad
			LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'FARMER'
			LEFT JOIN ${TABLES.BIRTH_DATES} bd ON bd.owner_id = ad.actor_id AND bd.owner_type = 'FARMER'
			LEFT JOIN ${TABLES.BIRTH_PLACES} bp ON bp.owner_id = ad.actor_id AND bp.owner_type = 'FARMER'
			LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'FARMER'
			LEFT JOIN ${TABLES.ACTOR_DOCUMENTS} adoc ON adoc.owner_id = ad.actor_id AND adoc.owner_type = 'FARMER'
			LEFT JOIN ${TABLES.NUITS} n ON n.actor_id = ad.actor_id
			WHERE ${whereClauses.join(' OR ')}
		`
	}, [
		userDetails?.district_id,
		nuit,
		docType,
		docNumber,
		primaryPhone,
		secondaryPhone,
		surname,
		otherNames,
		birthDate,
		birthPlace,
	])

	const { data: duplicateFarmers, isLoading, error, isError } = useQueryMany<FarmerDuplicateCheck>(query)

	// Check for specific duplicates
	const checkDuplicates = useMemo(() => {
		if (!duplicateFarmers || duplicateFarmers.length === 0) {
			return {
				hasDuplicate: false,
				duplicateType: null,
				message: '',
				duplicateFarmer: null,
			}
		}

		// Extract birth date components for comparison
		const birthDay = birthDate ? birthDate.getDate() : null
		const birthMonth = birthDate ? birthDate.getMonth() + 1 : null // JavaScript months are 0-indexed
		const birthYear = birthDate ? birthDate.getFullYear() : null

		// CHECK 1: surname & other_names & birth date & birth place match
		if (surname && otherNames && birthDate && birthPlace && birthDay && birthMonth && birthYear) {
			const duplicate = duplicateFarmers.find((f) => {
				const nameMatch =
					f.surname.toLowerCase() === surname.toLowerCase() && f.other_names.toLowerCase() === otherNames.toLowerCase()
				const birthDateMatch = f.birth_day === birthDay && f.birth_month === birthMonth && f.birth_year === birthYear
				const birthPlaceMatch = f.birth_place_description === birthPlace
				return nameMatch && birthDateMatch && birthPlaceMatch
			})

			if (duplicate) {
				return {
					hasDuplicate: true,
					duplicateType: 'name_birth',
					message: `Já existe um produtor registado com este nome completo, data de nascimento e local de nascimento (${duplicate.surname} ${duplicate.other_names}).`,
					duplicateFarmer: duplicate,
				}
			}
		}

		// CHECK 2: nuit matches
		if (nuit && nuit.trim().length === 9 && nuit.trim() !== 'N/A') {
			const duplicate = duplicateFarmers.find((f) => f.nuit === nuit.trim())
			if (duplicate) {
				const duplicateName =
					duplicate.surname && duplicate.other_names
						? `${duplicate.surname} ${duplicate.other_names}`
						: duplicate.surname || duplicate.other_names || 'actor'
				return {
					hasDuplicate: true,
					duplicateType: 'nuit',
					message: `Já existe um actor registado com este NUIT${duplicate.surname || duplicate.other_names ? ` (${duplicateName})` : ''}.`,
					duplicateFarmer: duplicate,
				}
			}
		}

		// CHECK 3: document_number & document_type match
		if (docType && docNumber && !docType.includes('Não tem') && docNumber !== 'N/A') {
			const duplicate = duplicateFarmers.find((f) => f.document_type === docType && f.document_number === docNumber)
			if (duplicate) {
				const duplicateName =
					duplicate.surname && duplicate.other_names
						? `${duplicate.surname} ${duplicate.other_names}`
						: duplicate.surname || duplicate.other_names || 'actor'
				return {
					hasDuplicate: true,
					duplicateType: 'document',
					message: `Já existe um actor registado com este documento${duplicate.surname || duplicate.other_names ? ` (${duplicateName})` : ''}.`,
					duplicateFarmer: duplicate,
				}
			}
		}

		// CHECK 4: birth date & birth place & (either surname or other_names) match
		if (birthDate && birthPlace && birthDay && birthMonth && birthYear && (surname || otherNames)) {
			const duplicate = duplicateFarmers.find((f) => {
				const birthDateMatch = f.birth_day === birthDay && f.birth_month === birthMonth && f.birth_year === birthYear
				const birthPlaceMatch = f.birth_place_description === birthPlace
				const nameMatch =
					(surname && f.surname.toLowerCase() === surname.toLowerCase()) ||
					(otherNames && f.other_names.toLowerCase() === otherNames.toLowerCase())
				return birthDateMatch && birthPlaceMatch && nameMatch
			})

			if (duplicate) {
				return {
					hasDuplicate: true,
					duplicateType: 'birth_name',
					message: `Já existe um produtor registado com esta data de nascimento, local de nascimento e nome (${duplicate.surname} ${duplicate.other_names}).`,
					duplicateFarmer: duplicate,
				}
			}
		}

		// CHECK 5: phone number match (be it primary or secondary)
		if (primaryPhone && primaryPhone.trim() !== 'N/A' && primaryPhone.trim() !== '') {
			const duplicate = duplicateFarmers.find(
				(f) =>
					(f.primary_phone === primaryPhone.trim() && f.primary_phone && f.primary_phone !== 'N/A') ||
					(f.secondary_phone === primaryPhone.trim() && f.secondary_phone && f.secondary_phone !== 'N/A'),
			)
			if (duplicate) {
				const duplicateName =
					duplicate.surname && duplicate.other_names
						? `${duplicate.surname} ${duplicate.other_names}`
						: duplicate.surname || duplicate.other_names || 'actor'
				return {
					hasDuplicate: true,
					duplicateType: 'phone',
					message: `Este número de telefone já está registado${duplicate.surname || duplicate.other_names ? ` para: ${duplicateName}` : ' para outro actor'}`,
					duplicateFarmer: duplicate,
				}
			}
		}

		if (secondaryPhone && secondaryPhone.trim() !== 'N/A' && secondaryPhone.trim() !== '') {
			const duplicate = duplicateFarmers.find(
				(f) =>
					(f.primary_phone === secondaryPhone.trim() && f.primary_phone && f.primary_phone !== 'N/A') ||
					(f.secondary_phone === secondaryPhone.trim() && f.secondary_phone && f.secondary_phone !== 'N/A'),
			)
			if (duplicate) {
				const duplicateName =
					duplicate.surname && duplicate.other_names
						? `${duplicate.surname} ${duplicate.other_names}`
						: duplicate.surname || duplicate.other_names || 'actor'
				return {
					hasDuplicate: true,
					duplicateType: 'phone',
					message: `Este número de telefone alternativo já está registado${duplicate.surname || duplicate.other_names ? ` para: ${duplicateName}` : ' para outro actor'}`,
					duplicateFarmer: duplicate,
				}
			}
		}

		return {
			hasDuplicate: false,
			duplicateType: null,
			message: '',
			duplicateFarmer: null,
		}
	}, [
		duplicateFarmers,
		nuit,
		docType,
		docNumber,
		primaryPhone,
		secondaryPhone,
		surname,
		otherNames,
		birthDate,
		birthPlace,
	])

	return {
		...checkDuplicates,
		isLoading,
		error,
		isError,
		duplicateFarmers: duplicateFarmers || [],
	}
}
