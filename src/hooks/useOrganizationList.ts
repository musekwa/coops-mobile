import { useMemo } from 'react'
import { useQueryMany } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { OrganizationTypes } from 'src/types'

export type OrganizationItem = {
	id: string
	group_name: string
	organization_type: string
	admin_post: string
	admin_post_id: string
}

function buildGroupsQuery(organizationType: OrganizationTypes, districtId?: string) {
	const districtFilter = districtId
		? ` AND addr.district_id = '${districtId}'`
		: ' AND 1=0'
	return `
		SELECT 
			a.id, 
			ad.other_names as group_name, 
			ac.subcategory as organization_type, 
			ap.name as admin_post,
			addr.admin_post_id as admin_post_id
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON addr.admin_post_id = ap.id
		WHERE a.category = 'GROUP' AND ac.subcategory = '${organizationType}'${districtFilter}
	`
}

export function useOrganizationList(
	organizationType: OrganizationTypes,
	searchQuery: string,
	adminPostFilter?: string,
	districtId?: string,
) {
	const query = useMemo(
		() => buildGroupsQuery(organizationType, districtId),
		[organizationType, districtId],
	)
	const {
		data: groupsWithAddressAndDocument,
		isLoading: isGroupsLoading,
		error: groupsError,
		isError: isGroupsError,
	} = useQueryMany<OrganizationItem>(query)

	const filteredItems = useMemo(() => {
		if (!Array.isArray(groupsWithAddressAndDocument)) return []
		let result = groupsWithAddressAndDocument

		// Filter by admin post (from bottom sheet)
		if (adminPostFilter && adminPostFilter !== 'All') {
			result = result.filter(
				(org) => org.admin_post_id?.toLowerCase().includes(adminPostFilter.toLowerCase()),
			)
		}

		// Filter by search (group name)
		if (searchQuery) {
			result = result.filter((org) =>
				org.group_name.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		}

		return result.reverse()
	}, [groupsWithAddressAndDocument, searchQuery, adminPostFilter])

	return {
		items: filteredItems,
		isLoading: isGroupsLoading,
		error: groupsError,
		isError: isGroupsError,
	}
}
