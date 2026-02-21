import ShipmentList from 'src/components/tracking/ShipmentList'
import { useMemo } from 'react'
import { customShipmentFilter } from 'src/helpers/customShipmentFilter'

export default function FormalShipmentIndex({ filteringOptions }: { filteringOptions: string[] }) {
	const { arquiving, reloading, startDate, endDate } = { arquiving: false, reloading: false, startDate: new Date(), endDate: new Date() }
	const userData = {}

	// get the list of shipments whose destination is the same as the user's district
	// and/or the place of the license delivery is the same as the user's district
	const shipments: any[] = []
	

		const userPreferences = {}

	const filteredShipments = useMemo(() => {
		if (filteringOptions.length > 0) {
			return customShipmentFilter(shipments, filteringOptions, '').reverse()
		}

		if (arquiving) {

		}
		return []
	}, [shipments, userPreferences, arquiving, reloading])

	return <ShipmentList shipments={filteredShipments} />
}
