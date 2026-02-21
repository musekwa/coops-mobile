import React, { useEffect, useMemo } from 'react'
import BackButton from 'src/components/buttons/BackButton'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'
import OrganizationsList from 'src/components/organizations/OrganizationsList'
import { useQueryMany } from 'src/hooks/queries'

import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { useHeaderOptions, useNavigationSearch } from 'src/hooks/useNavigationSearch'
import { OrganizationTypes } from 'src/types'
import { useActionStore } from 'src/store/actions/actions'

export default function CooperativesScreen() {
	const { resetCurrentResource } = useActionStore()

	const { search } = useNavigationSearch({ searchBarOptions: { placeholder: 'Procurar Cooperativas' } })
	const organizationType = OrganizationTypes.COOPERATIVE

	// Perform a JOIN with address_details table to get the admin_post for each cooperative
	const {
		data: groupsWithAddressAndDocument,
		isLoading: isGroupsWithAddressAndDocumentLoading,
		error: groupsWithAddressAndDocumentError,
		isError: isGroupsWithAddressAndDocumentError,
	} = useQueryMany<{
		id: string
		group_name: string
		organization_type: string
		admin_post: string
	}>(
		`SELECT 
			a.id, 
			ad.other_names as group_name, 
			ac.subcategory as organization_type, 
			ap.name as admin_post 
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON addr.admin_post_id = ap.id
		WHERE a.category = 'GROUP' AND ac.subcategory = '${organizationType}'`,
	)

	// Search for coops that match the search query and in case of no search query, return all coops
	const coopsFiltered = useMemo(() => {
		if (!search) return groupsWithAddressAndDocument.reverse()
		return groupsWithAddressAndDocument
			.filter((coop) => coop.group_name.toLowerCase().includes(search.toLowerCase()))
			.reverse()
	}, [groupsWithAddressAndDocument, search])

	// update header options
	useHeaderOptions(
		{
			headerLeft: () => <BackButton route="/(tabs)/actors/groups" />,
		},
		'Cooperativas',
	)

	useEffect(() => {
		// reset the current resource
		resetCurrentResource()
	}, [])

	return (
		<>
			<OrganizationsList items={coopsFiltered} organizationType={organizationType} />
			<SingleFloatingButton route="/(tabs)/actors/registration/org-registration" />
		</>
	)
}
