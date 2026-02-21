import { RelativePathString, useNavigation } from 'expo-router'
import { useEffect, useState } from 'react'
import BackButton from 'src/components/buttons/BackButton'
import OrganizationDataPreview from 'src/components/data-preview/OrganizationDataPreview'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import SuccessAlert from 'src/components/dialogs/SuccessAlert'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'

import AddAssociationForm from 'src/components/organizations/AddAssociation'
import { useHeaderOptions } from 'src/hooks/useNavigationSearch'
import { useActionStore } from 'src/store/actions/actions'
import {
	AssociationFormDataType,
	useAssociationStore,
} from 'src/store/organizations'

import { ActionType, OrganizationTypes } from 'src/types'



export default function AssociationRegistrationScreen() {
	const navigation = useNavigation()
	const [activeOrg, setActiveOrg] = useState<OrganizationTypes>(OrganizationTypes.ASSOCIATION)
	const { getAddActionType, resetAddActionType } = useActionStore()


	const [success, setSuccess] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [hasError, setHasError] = useState(false)
	const [previewData, setPreviewData] = useState(false)
	const [routeSegment, setRouteSegment] = useState('')

	useHeaderOptions({}, 'Registo de Associação')
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton />,
		})

		if (getAddActionType() !== ActionType.UNKNOWN) {
			setActiveOrg(OrganizationTypes.ASSOCIATION)
			resetAddActionType()
		}
	}, [])


	const addOrganizationForm = () => (
				<AddAssociationForm
					setErrorMessage={setErrorMessage}
					setPreviewData={setPreviewData}
					setHasError={setHasError}
				/>
			)
		
	const org = useAssociationStore().getFormData() as AssociationFormDataType

	return (
		<CustomSafeAreaView edges={['bottom']}>

			{addOrganizationForm()}

			<OrganizationDataPreview
				hasError={hasError}
				errorMessage={errorMessage}
				previewData={previewData}
				setPreviewData={setPreviewData}
				org={org}
				setErrorMessage={setErrorMessage}
				setHasError={setHasError}
				setSuccess={setSuccess}
				setRouteSegment={setRouteSegment}
				organizationType={activeOrg}
			/>
			<ErrorAlert
				visible={hasError}
				setVisible={setHasError}
				title="Erro"
				message={errorMessage}
				setMessage={setErrorMessage}
			/>
			<SuccessAlert visible={success} setVisible={setSuccess} route={routeSegment as RelativePathString | undefined} />
		</CustomSafeAreaView>
	)
}
