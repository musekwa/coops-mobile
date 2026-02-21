import React, { useEffect, useState } from 'react'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'
import OrganizationsList from 'src/components/organizations/OrganizationsList'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'
import AdminPostFilterModal from 'src/components/modals/AdminPostFilterModal'
import { useNavigationSearch } from 'src/hooks/useNavigationSearch'
import { useActorsHeader } from 'src/hooks/useActorsHeader'
import { useLocationName } from 'src/hooks/useLocationName'
import { useOrganizationList } from 'src/hooks/useOrganizationList'
import { useSearchOptions, useUserDetails } from 'src/hooks/queries'
import { OrganizationTypes } from 'src/types'
import { useActionStore } from 'src/store/actions/actions'

const CONFIG = {
	organizationType: OrganizationTypes.COOPERATIVE,
	searchPlaceholder: 'Procurar Cooperativas',
	subtitle: 'Cooperativas',
	registrationRoute: '/(tabs)/actors/registration/cooperative' as const,
}

export default function CooperativesScreen() {
	const { userDetails } = useUserDetails()
	const { resetCurrentResource } = useActionStore()
	const locationName = useLocationName()
	const { search } = useNavigationSearch({
		searchBarOptions: { placeholder: CONFIG.searchPlaceholder },
	})
	const [adminPostFilter, setAdminPostFilter] = useState<string>('')
	const { searchKeys, loadSearchKeys } = useSearchOptions(userDetails?.district_id || '')

	const { bottomSheetModalRef, handleModalPress } = useActorsHeader({
		locationName,
		subtitle: CONFIG.subtitle,
		onResetResource: resetCurrentResource,
		showOptionsButton: true,
	})

	const { items } = useOrganizationList(
		CONFIG.organizationType,
		search,
		adminPostFilter || undefined,
		userDetails?.district_id ?? undefined,
	)

	const handleFilterSelect = (value: string) => {
		handleModalPress()
		setAdminPostFilter(value === 'All' ? '' : value)
	}

	useEffect(() => {
		loadSearchKeys()
	}, [loadSearchKeys])

	return (
		<CustomSafeAreaView edges={['bottom']} style={{ paddingTop: 0 }}>
			<OrganizationsList items={items} organizationType={CONFIG.organizationType} />
			<AdminPostFilterModal
				bottomSheetModalRef={bottomSheetModalRef}
				handleDismissModalPress={handleModalPress}
				searchKeys={searchKeys}
				selectedValue={adminPostFilter || 'All'}
				onSelect={handleFilterSelect}
			/>
			<SingleFloatingButton route={CONFIG.registrationRoute} />
		</CustomSafeAreaView>
	)
}
