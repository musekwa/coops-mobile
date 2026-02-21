import { useMemo } from 'react'
import { useQueryMany, useUserDetails } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { MultiCategory } from 'src/types'
import { PreconditionsType } from 'src/store/tracking/pre-conditions'

export const useOwnerByPreconditions = (preconditions: PreconditionsType) => {
	const { userDetails } = useUserDetails()

	// Build query based on preconditions
	const query = useMemo(() => {
		if (!userDetails?.district_id) return ''

		const districtId = userDetails.district_id

		// FARMER queries
		if (preconditions.ownerType === 'FARMER') {
			const isCommercialFarmer = preconditions.subKeys.find((subKey) => subKey.key === 'isCommercialFarmer')?.value

			if (isCommercialFarmer) {
				// Fetch farmers with FARMER_LARGE_SCALE multicategory
				return `
					SELECT ad.actor_id as id, ad.surname, ad.other_names, GROUP_CONCAT(ac.subcategory, ';') as multicategory, 
						   addr.admin_post_id, cd.primary_phone, cd.secondary_phone
					FROM ${TABLES.ACTOR_DETAILS} ad
					INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'FARMER'
					LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'FARMER'
					LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'FARMER'
					WHERE addr.district_id = '${districtId}'
					AND ac.subcategory LIKE '%${MultiCategory.FARMER_LARGE_SCALE}%'
					GROUP BY ad.actor_id, ad.surname, ad.other_names, addr.admin_post_id, cd.primary_phone, cd.secondary_phone
				`
			} else {
				// Fetch farmers except those with FARMER_LARGE_SCALE
				return `
					SELECT ad.actor_id as id, ad.surname, ad.other_names, GROUP_CONCAT(ac.subcategory, ';') as multicategory, 
						   addr.admin_post_id, cd.primary_phone, cd.secondary_phone
					FROM ${TABLES.ACTOR_DETAILS} ad
					LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'FARMER'
					LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'FARMER'
					LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'FARMER'
					WHERE addr.district_id = '${districtId}'
					AND (ac.subcategory NOT LIKE '%${MultiCategory.FARMER_LARGE_SCALE}%' OR ac.subcategory IS NULL)
					GROUP BY ad.actor_id, ad.surname, ad.other_names, addr.admin_post_id, cd.primary_phone, cd.secondary_phone
				`
			}
		}

		// TRADER queries
		if (preconditions.ownerType === 'TRADER') {
			const isTraderACompany = preconditions.subKeys.find((subKey) => subKey.key === 'isTraderACompany')?.value

			const isFinalTrader = preconditions.subKeys.find((subKey) => subKey.key === 'isFinalTrader')?.value

			if (isTraderACompany) {
				// Fetch traders with surname that includes COMPANY
				return `
					SELECT 
						ad.actor_id as id,
						ad.surname,
						ad.other_names,
						GROUP_CONCAT(ac.subcategory, ';') as multicategory,
						addr.admin_post_id,
						cd.primary_phone,
						cd.secondary_phone
					FROM ${TABLES.ACTOR_DETAILS} ad
					INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'TRADER'
					LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'TRADER'
					LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'TRADER'
					WHERE LOWER(ad.surname) LIKE '%company%'
					GROUP BY ad.actor_id, ad.surname, ad.other_names, addr.admin_post_id, cd.primary_phone, cd.secondary_phone
				`
			} else if (isFinalTrader) {
				// Fetch traders with multicategory set to processing or export
				return `
					SELECT 
						ad.actor_id as id,
						ad.surname,
						ad.other_names,
						GROUP_CONCAT(ac.subcategory, ';') as multicategory,
						addr.admin_post_id,
						cd.primary_phone,
						cd.secondary_phone
					FROM ${TABLES.ACTOR_DETAILS} ad
					INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'TRADER'
					LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'TRADER'
					LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'TRADER'
					WHERE (
						ac.subcategory LIKE '%${MultiCategory.TRADER_LARGE_SCALE_PROCESSING}%' OR
						ac.subcategory LIKE '%${MultiCategory.TRADER_SMALL_SCALE_PROCESSING}%' OR
						ac.subcategory LIKE '%${MultiCategory.TRADER_EXPORT}%'
					)
					GROUP BY ad.actor_id, ad.surname, ad.other_names, addr.admin_post_id, cd.primary_phone, cd.secondary_phone
				`
			} else {
				// Fetch traders with multicategory different from processing and export
				return `
					SELECT 
						ad.actor_id as id,
						ad.surname,
						ad.other_names,
						GROUP_CONCAT(ac.subcategory, ';') as multicategory,
						addr.admin_post_id,
						cd.primary_phone,
						cd.secondary_phone
					FROM ${TABLES.ACTOR_DETAILS} ad
					INNER JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = ad.actor_id AND ac.category = 'TRADER'
					LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'TRADER'
					LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'TRADER'
					WHERE ad.actor_id NOT IN (
						SELECT DISTINCT actor_id 
						FROM ${TABLES.ACTOR_CATEGORIES}
						WHERE category = 'TRADER' AND (
							subcategory LIKE '%${MultiCategory.TRADER_LARGE_SCALE_PROCESSING}%' OR
							subcategory LIKE '%${MultiCategory.TRADER_SMALL_SCALE_PROCESSING}%' OR
							subcategory LIKE '%${MultiCategory.TRADER_EXPORT}%'
						)
					)
					GROUP BY ad.actor_id, ad.surname, ad.other_names, addr.admin_post_id, cd.primary_phone, cd.secondary_phone
				`
			}
		}

		// GROUP queries
		if (preconditions.ownerType === 'GROUP') {
			// Fetch all groups for this district
			return `
				SELECT 
					a.id, 
					ad.other_names as surname, 
					'' as other_names, 
					ac.subcategory as multicategory, 
					addr.admin_post_id, 
					'' as primary_phone, 
					'' as secondary_phone
				FROM ${TABLES.ACTORS} a
				INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
				LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
				LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
				WHERE a.category = 'GROUP' AND addr.district_id = '${districtId}'
			`
		}

		return ''
	}, [preconditions, userDetails?.district_id])

	// Only execute query if it's not empty
	const shouldExecuteQuery = query !== ''

	const {
		data: owners,
		isLoading,
		error,
		isError,
	} = useQueryMany<{
		id: string
		surname: string
		other_names: string
		multicategory: string
		admin_post_id: string
		primary_phone: string
		secondary_phone: string
	}>(shouldExecuteQuery ? query : 'SELECT 1 WHERE 1=0') // Use a safe fallback query

	return {
		owners: shouldExecuteQuery ? owners : [],
		isLoading: shouldExecuteQuery ? isLoading : !userDetails?.district_id,
		error: shouldExecuteQuery ? error : null,
		isError: shouldExecuteQuery ? isError : false,
	}
}
