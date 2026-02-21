import React, { useEffect, useMemo } from 'react'
import BackButton from 'src/components/buttons/BackButton'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'
import OrganizationsList from 'src/components/organizations/OrganizationsList'
import { useQueryMany } from 'src/hooks/queries'

import { useHeaderOptions, useNavigationSearch } from 'src/hooks/useNavigationSearch'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { OrganizationTypes } from 'src/types'
import { useActionStore } from 'src/store/actions/actions'

export default function AssociationsScreen() {
	const { resetCurrentResource } = useActionStore()

	const { search } = useNavigationSearch({ searchBarOptions: { placeholder: 'Procurar Associações' } })
	const organizationType = OrganizationTypes.ASSOCIATION


	// Perform a JOIN with address_details table to get the admin_post for each association
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
	const associationsFiltered = useMemo(() => {
		if (!search) return groupsWithAddressAndDocument.reverse()
		return groupsWithAddressAndDocument
			.filter((association) => association.group_name.toLowerCase().includes(search.toLowerCase()))
			.reverse()
	}, [groupsWithAddressAndDocument, search])

	// update header options
	useHeaderOptions(
		{
			headerLeft: () => <BackButton route="/(tabs)/actors/groups" />,
		},
		'Associações',
	)
	useEffect(() => {
		// reset the current resource
		resetCurrentResource()
	}, [])

	return (
		<>
			<OrganizationsList items={associationsFiltered} organizationType={organizationType} />
			<SingleFloatingButton route="/(tabs)/actors/registration/org-registration" />
		</>
	)
}
