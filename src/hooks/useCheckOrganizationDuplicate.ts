import { useMemo } from 'react'
import { useQueryMany } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { OrganizationTypes } from 'src/types'

interface OrganizationDuplicateCheck {
	id: string
	group_name: string
	organization_type: string
	nuit: string | null // NUIT from nuits table
	nuel: string | null // NUEL from nuels table
}

interface UseCheckOrganizationDuplicateProps {
	name: string
	nuit?: string
	nuel?: string
	organizationType?: OrganizationTypes // Current organization type being added
}

export const useCheckOrganizationDuplicate = ({
	name,
	nuit,
	nuel,
	organizationType,
}: UseCheckOrganizationDuplicateProps) => {
	// Build query to fetch organizations with potential duplicate indicators
	// NOTE: Organizations are checked across all types (ASSOCIATION, COOPERATIVE, COOP_UNION)
	// Only checks for NUIT and NUEL duplicates in normalized tables (nuits, nuels)
	const query = useMemo(() => {
		const conditions: string[] = []

		// Check by NUIT if provided - check in nuits table
		if (nuit && nuit.trim().length === 9 && nuit.trim() !== 'N/A' && nuit.trim() !== '0' && nuit.trim() !== '') {
			const trimmedNuit = nuit.trim()
			// Check nuits table (actor_id = actors.id, where actors.category = 'GROUP')
			conditions.push(`n.nuit = '${trimmedNuit}'`)
		}

		// Check by NUEL if provided - check in nuels table
		if (nuel && nuel.trim().length > 0 && nuel.trim() !== 'N/A' && nuel.trim() !== '0' && nuel.trim() !== '') {
			const trimmedNuel = nuel.trim()
			// Check nuels table (actor_id = actors.id, where actors.category = 'GROUP')
			conditions.push(`nel.nuel = '${trimmedNuel}'`)
		}

		if (conditions.length === 0) return 'SELECT 1 WHERE 1=0'

		return `
			SELECT DISTINCT
				a.id,
				ad.other_names as group_name,
				ac.subcategory as organization_type,
				n.nuit,
				nel.nuel
			FROM ${TABLES.ACTORS} a
			INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
			LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
			LEFT JOIN ${TABLES.NUITS} n ON n.actor_id = a.id
			LEFT JOIN ${TABLES.NUELS} nel ON nel.actor_id = a.id
			WHERE a.category = 'GROUP' AND (${conditions.join(' OR ')})
		`
	}, [nuit, nuel])

	const { data: duplicateOrganizations, isLoading, error, isError } = useQueryMany<OrganizationDuplicateCheck>(query)

	// Check for specific duplicates
	const checkDuplicates = useMemo(() => {
		if (!duplicateOrganizations || duplicateOrganizations.length === 0) {
			return {
				hasDuplicate: false,
				duplicateType: null,
				message: '',
				duplicateOrganizations: [],
			}
		}

		// PRIORITY CHECK: Check by NUIT first if provided
		if (nuit && nuit.trim().length === 9 && nuit.trim() !== 'N/A' && nuit.trim() !== '0' && nuit.trim() !== '') {
			const trimmedNuit = nuit.trim()
			const nuitDuplicate = duplicateOrganizations.find((org) => {
				// Check nuits table
				if (
					org.nuit &&
					org.nuit.trim() !== '0' &&
					org.nuit.trim() !== '' &&
					org.nuit.trim() !== 'N/A' &&
					org.nuit.trim().length === 9 &&
					org.nuit.trim() === trimmedNuit
				) {
					return true
				}
				return false
			})
			if (nuitDuplicate) {
				const orgTypeLabel =
					nuitDuplicate.organization_type === OrganizationTypes.ASSOCIATION
						? 'associação'
						: nuitDuplicate.organization_type === OrganizationTypes.COOPERATIVE
							? 'cooperativa'
							: 'união de cooperativas'
				const orgName = nuitDuplicate.group_name || 'organização'
				return {
					hasDuplicate: true,
					duplicateType: 'nuit',
					message: `Já existe uma ${orgTypeLabel} registada com este NUIT: ${orgName}`,
					duplicateOrganizations: [nuitDuplicate],
				}
			}
		}

		// Check by NUEL if provided
		if (nuel && nuel.trim().length > 0 && nuel.trim() !== 'N/A' && nuel.trim() !== '0' && nuel.trim() !== '') {
			const trimmedNuel = nuel.trim()
			const nuelDuplicate = duplicateOrganizations.find((org) => {
				// Check nuels table
				if (
					org.nuel &&
					org.nuel.trim() !== '0' &&
					org.nuel.trim() !== '' &&
					org.nuel.trim() !== 'N/A' &&
					org.nuel.trim() === trimmedNuel
				) {
					return true
				}
				return false
			})
			if (nuelDuplicate) {
				const orgTypeLabel =
					nuelDuplicate.organization_type === OrganizationTypes.ASSOCIATION
						? 'associação'
						: nuelDuplicate.organization_type === OrganizationTypes.COOPERATIVE
							? 'cooperativa'
							: 'união de cooperativas'
				const orgName = nuelDuplicate.group_name || 'organização'
				return {
					hasDuplicate: true,
					duplicateType: 'nuel',
					message: `Já existe uma ${orgTypeLabel} registada com este NUEL: ${orgName}`,
					duplicateOrganizations: [nuelDuplicate],
				}
			}
		}

		// Name duplicates are allowed - no check needed

		return {
			hasDuplicate: false,
			duplicateType: null,
			message: '',
			duplicateOrganizations: [],
		}
	}, [duplicateOrganizations, nuit, nuel])

	return {
		...checkDuplicates,
		isLoading,
		error,
		isError,
		duplicateOrganizations: duplicateOrganizations || [],
	}
}
