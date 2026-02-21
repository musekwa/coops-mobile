import { useEffect } from 'react'
import { useNavigation } from 'expo-router'

import BackButton from 'src/components/buttons/BackButton'
import AddTraderForm from 'src/components/forms/AddTrader'
import { useHeaderOptions } from 'src/hooks/useNavigationSearch'

export default function ActorRegistrationScreen() {
	const navigation = useNavigation()

	// update Header options
	useHeaderOptions()
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton />,
			headerTitle: `Registo de Comerciante`,
		})
	}, [])
	
	return <AddTraderForm />
}
