import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import Spinner from 'src/components/loaders/Spinner'
import { useActionStore } from 'src/store/actions/actions'
import { ResourceName } from 'src/types'

export default function CustomRedirectScreen() {
	const { getCurrentResource } = useActionStore()
	const currentResourceId = getCurrentResource().id
	const currentResourceName = getCurrentResource().name
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		setTimeout(() => {
			setIsLoading(false)
		}, 1000)
	}, [currentResourceId, currentResourceName, isLoading])

	if (isLoading) {
		return <Spinner />
	}

	if (currentResourceName === ResourceName.GROUP) {
		return <Redirect href={'/(aux)/actors/organization'} />
	}

	if (currentResourceName === ResourceName.FARMER) {
		return <Redirect href={'/(aux)/actors/farmer'} />
	}

	if (currentResourceName === ResourceName.TRADER) {
		return <Redirect href={'/(aux)/actors/trader/dashboard'} />
	}
	if (currentResourceName === ResourceName.SHIPMENT) {
		return <Redirect href={'/(aux)/trades/transit/shipment-inspection'} />
	}

	return <Redirect href={'/(tabs)/actors'} />
}
