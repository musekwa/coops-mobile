import { useMemo } from 'react'
import { useQueryMany } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'

interface DriverDuplicateCheck {
	id: string
	surname: string
	other_names: string
	primary_phone: string
}

interface UseCheckDriverDuplicateProps {
	driverName?: string
	driverPhone?: string
}

export const useCheckDriverDuplicate = ({ driverName, driverPhone }: UseCheckDriverDuplicateProps) => {
	// Build query to fetch drivers (actors with DRIVER category) with potential duplicate indicators
	const query = useMemo(() => {
		const conditions: string[] = []

		// Check by phone number if provided (primary check)
		if (driverPhone && driverPhone.trim() !== '' && driverPhone.trim().length >= 9) {
			conditions.push(`cd.primary_phone = '${driverPhone.trim().replace(/'/g, "''")}'`)
		}

		// Check by name if provided (secondary check - in case someone uses same name)
		if (driverName && driverName.trim() !== '' && driverName.trim().length >= 2) {
			const nameParts = driverName.trim().split(/\s+/)
			const surname = nameParts.length > 0 ? nameParts[nameParts.length - 1] : driverName.trim()
			const other_names = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : ''
			if (surname) {
				conditions.push(`LOWER(ad.surname) = LOWER('${surname.replace(/'/g, "''")}')`)
			}
			if (other_names) {
				conditions.push(`LOWER(ad.other_names) = LOWER('${other_names.replace(/'/g, "''")}')`)
			}
		}

		if (conditions.length === 0) return 'SELECT 1 WHERE 1=0'

		return `
			SELECT 
				a.id,
				ad.surname,
				ad.other_names,
				cd.primary_phone
			FROM ${TABLES.ACTORS} a
			INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON a.id = ad.actor_id
			INNER JOIN ${TABLES.CONTACT_DETAILS} cd ON a.id = cd.owner_id AND cd.owner_type = 'DRIVER'
			WHERE a.category = 'DRIVER' AND (${conditions.join(' OR ')})
		`
	}, [driverName, driverPhone])

	const { data: duplicateDrivers, isLoading, error, isError } = useQueryMany<DriverDuplicateCheck>(query)

	// Check for specific duplicates
	const checkDuplicates = useMemo(() => {
		if (!duplicateDrivers || duplicateDrivers.length === 0) {
			return {
				hasDuplicate: false,
				duplicateType: null,
				message: '',
				duplicateDriver: null,
			}
		}

		// PRIMARY CHECK: Phone number (most reliable identifier)
		if (driverPhone && driverPhone.trim() !== '' && driverPhone.trim().length >= 9) {
			const phoneDuplicate = duplicateDrivers.find((d) => d.primary_phone === driverPhone.trim())
			if (phoneDuplicate) {
				const fullName = `${phoneDuplicate.other_names} ${phoneDuplicate.surname}`.trim()
				return {
					hasDuplicate: true,
					duplicateType: 'phone',
					message: `Este motorista já está registado: ${fullName} (${phoneDuplicate.primary_phone})`,
					duplicateDriver: phoneDuplicate,
				}
			}
		}

		// SECONDARY CHECK: Name (less reliable, but useful for warning)
		if (driverName && driverName.trim() !== '' && driverName.trim().length >= 2) {
			const nameParts = driverName.trim().split(/\s+/)
			const surname = nameParts.length > 0 ? nameParts[nameParts.length - 1] : driverName.trim()
			const other_names = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : ''
			const nameDuplicate = duplicateDrivers.find(
				(d) =>
					d.surname.toLowerCase() === surname.toLowerCase() &&
					(other_names === '' || d.other_names.toLowerCase() === other_names.toLowerCase()),
			)
			if (nameDuplicate) {
				const fullName = `${nameDuplicate.other_names} ${nameDuplicate.surname}`.trim()
				return {
					hasDuplicate: true,
					duplicateType: 'name',
					message: `Já existe um motorista registado com este nome: ${fullName} (${nameDuplicate.primary_phone})`,
					duplicateDriver: nameDuplicate,
				}
			}
		}

		return {
			hasDuplicate: false,
			duplicateType: null,
			message: '',
			duplicateDriver: null,
		}
	}, [duplicateDrivers, driverName, driverPhone])

	return {
		...checkDuplicates,
		isLoading,
		error,
		isError,
		duplicateDrivers: duplicateDrivers || [],
	}
}
