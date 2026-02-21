import { useNavigation } from 'expo-router'
import { useEffect} from 'react'

import BackButton from 'src/components/buttons/BackButton'
import AddFarmerForm from 'src/components/forms/AddFarmer'
import { useHeaderOptions } from 'src/hooks/useNavigationSearch'

export default function ActorRegistrationScreen() {
	const navigation = useNavigation()
	
	// update Header options
	useHeaderOptions()
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton />,
			headerTitle: `Registo de Produtor`,
		})
	}, [])

	return <AddFarmerForm />
}
