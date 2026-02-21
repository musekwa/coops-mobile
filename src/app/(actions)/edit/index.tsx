import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import SuccessAlert from 'src/components/dialogs/SuccessAlert'
import { FarmerEdit } from 'src/features/actions/edit/farmer'
import { TraderEdit } from 'src/features/actions/edit/trader'
import { GroupEdit } from 'src/features/actions/edit/group'
import { ResourceName } from 'src/types'

export default function EditScreen() {
	const { resourceName, id } = useLocalSearchParams()
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [success, setSuccess] = useState(false)

	const commonProps = {
		success,
		setSuccess,
		resourceName: String(resourceName),
		id: String(id),
		setHasError,
		hasError,
		setErrorMessage,
		errorMessage,
	}

	return (
		<>
			{/* Edit Farmer */}
			{String(resourceName) === ResourceName.FARMER && <FarmerEdit {...commonProps} />}
			{/* Edit Trader */}
			{String(resourceName) === ResourceName.TRADER && <TraderEdit {...commonProps} />}
			{/* Edit Group */}
			{String(resourceName) === ResourceName.GROUP && <GroupEdit {...commonProps} />}

			<SuccessAlert visible={success} setVisible={setSuccess} />
			<ErrorAlert
				visible={hasError}
				setVisible={setHasError}
				title=""
				message={errorMessage}
				setMessage={setErrorMessage}
			/>
		</>
	)
}
