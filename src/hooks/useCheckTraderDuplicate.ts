import { useMemo } from 'react'
import { useQueryMany } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'

interface TraderDuplicateCheck {
	id: string
	identifier: string // NUIT from nuits table (or 'N/A' if not available)
	surname: string
	other_names: string
	primary_phone: string
	secondary_phone: string
	nuit: string // NUIT from nuits table
}

interface UseCheckTraderDuplicateProps {
	nuit?: string
	primaryPhone?: string
	secondaryPhone?: string
}

export const useCheckTraderDuplicate = ({ nuit, primaryPhone, secondaryPhone }: UseCheckTraderDuplicateProps) => {
	// Build query to fetch traders with potential duplicate indicators
	// NOTE: Traders are NOT restricted to user district (unlike farmers)
	const query = useMemo(() => {
		const conditions: string[] = []

		// Check by NUIT - NUIT is stored in nuits table
		if (nuit && nuit.trim().length === 9 && nuit.trim() !== 'N/A') {
			// Check nuits table for the NUIT (nuits.actor_id -> actor_details.actor_id)
			// Filter out '0' and empty values as those are defaults, not actual NUITs
			conditions.push(`(n.nuit = '${nuit.trim()}' AND n.nuit != '0' AND n.nuit != '' AND n.nuit != 'N/A')`)
		}

		// Check by phone numbers if provided (skip 'N/A')
		// Note: Phone numbers are checked to show which trader currently owns the number
		if (primaryPhone && primaryPhone.trim() !== 'N/A' && primaryPhone.trim() !== '') {
			conditions.push(`cd.primary_phone = '${primaryPhone.trim()}'`)
			conditions.push(`cd.secondary_phone = '${primaryPhone.trim()}'`)
		}
		if (secondaryPhone && secondaryPhone.trim() !== 'N/A' && secondaryPhone.trim() !== '') {
			conditions.push(`cd.primary_phone = '${secondaryPhone.trim()}'`)
			conditions.push(`cd.secondary_phone = '${secondaryPhone.trim()}'`)
		}

		if (conditions.length === 0) return 'SELECT 1 WHERE 1=0'

		return `
			SELECT DISTINCT
				ad.actor_id as id,
				COALESCE(n.nuit, 'N/A') as identifier,
				ad.surname,
				ad.other_names,
				cd.primary_phone,
				cd.secondary_phone,
				n.nuit
			FROM ${TABLES.ACTOR_DETAILS} ad
			INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'TRADER'
			LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'TRADER'
			LEFT JOIN ${TABLES.NUITS} n ON n.actor_id = ad.actor_id
			WHERE (${conditions.join(' OR ')})
		`
	}, [nuit, primaryPhone, secondaryPhone])

	const { data: duplicateTraders, isLoading, error, isError } = useQueryMany<TraderDuplicateCheck>(query)

	// Check for specific duplicates
	const checkDuplicates = useMemo(() => {
		if (!duplicateTraders || duplicateTraders.length === 0) {
			// Even if no duplicates found, we should still check if NUIT is provided and valid
			// But if there are no results, there are no duplicates
			return {
				hasDuplicate: false,
				duplicateType: null,
				message: '',
				duplicateTrader: null,
			}
		}

		// PRIORITY CHECK: Check by NUIT first if provided
		// NUIT is stored in nuits table
		// NUIT duplicates should always be checked when a valid NUIT is provided
		if (nuit && nuit.trim().length === 9 && nuit.trim() !== 'N/A') {
			const nuitDuplicate = duplicateTraders.find((t) => {
				// Check nuits table (source of truth)
				// NUIT can be stored as '0' or empty string if not provided, so check for valid 9-digit NUIT
				if (
					t.nuit &&
					t.nuit.trim() !== '0' &&
					t.nuit.trim() !== '' &&
					t.nuit.trim() !== 'N/A' &&
					t.nuit.trim().length === 9
				) {
					return t.nuit.trim() === nuit.trim()
				}
				return false
			})
			if (nuitDuplicate) {
				return {
					hasDuplicate: true,
					duplicateType: 'nuit',
					message: `Já existe um comerciante registado com este NUIT (${nuitDuplicate.surname} ${nuitDuplicate.other_names}).`,
					duplicateTrader: nuitDuplicate,
				}
			}
		}

		// Check by phone numbers - show which trader currently owns the number
		if (primaryPhone && primaryPhone.trim() !== 'N/A' && primaryPhone.trim() !== '') {
			const phoneDuplicate = duplicateTraders.find(
				(t) =>
					(t.primary_phone === primaryPhone.trim() && t.primary_phone !== 'N/A') ||
					(t.secondary_phone === primaryPhone.trim() && t.secondary_phone !== 'N/A'),
			)
			if (phoneDuplicate) {
				return {
					hasDuplicate: true,
					duplicateType: 'phone',
					message: `Este número de telefone já está registado para: ${phoneDuplicate.surname} ${phoneDuplicate.other_names}`,
					duplicateTrader: phoneDuplicate,
				}
			}
		}

		if (secondaryPhone && secondaryPhone.trim() !== 'N/A' && secondaryPhone.trim() !== '') {
			const phoneDuplicate = duplicateTraders.find(
				(t) =>
					(t.primary_phone === secondaryPhone.trim() && t.primary_phone !== 'N/A') ||
					(t.secondary_phone === secondaryPhone.trim() && t.secondary_phone !== 'N/A'),
			)
			if (phoneDuplicate) {
				return {
					hasDuplicate: true,
					duplicateType: 'phone',
					message: `Este número de telefone alternativo já está registado para: ${phoneDuplicate.surname} ${phoneDuplicate.other_names}`,
					duplicateTrader: phoneDuplicate,
				}
			}
		}

		return {
			hasDuplicate: false,
			duplicateType: null,
			message: '',
			duplicateTrader: null,
		}
	}, [duplicateTraders, nuit, primaryPhone, secondaryPhone])

	return {
		...checkDuplicates,
		isLoading,
		error,
		isError,
		duplicateTraders: duplicateTraders || [],
	}
}
