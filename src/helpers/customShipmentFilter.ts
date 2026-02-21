import { ShipmentStatusTypes } from 'src/constants/tracking'

export const customShipmentFilter = (shipments: any[], options: string[], userDistrict: string) => {
	if (options.length === 0) {
		return shipments
	}

	return shipments.filter((shipment) => {
		const currentPathLabel = shipment.paths?.[shipment.paths.length - 1]?.label
		const checks = shipment.checks || [] // Ensure checks is always an array

		if (options.length === 1) {
			// filter by shipment destination
			if (options.includes('Entradas')) {
				if (shipment.destination === userDistrict) {
					return true
				}
			}

			// filter by the transitLicense issuedIn
			if (options.includes('Saídas')) {
				if (shipment.startDistrict === userDistrict) {
					return true
				}
			}

			// filter by the arrival status
			if (options.includes('Chegada confirmada')) {
				if (
					checks.some(
						(check: any) =>
							check.stage === ShipmentStatusTypes.AT_ARRIVAL && check.notes?.split(' - ')[0] === currentPathLabel,
					)
				) {
					return true
				}
			}
			if (options.includes('Chegada não confirmada')) {
				if (
					!checks.some(
						(check: any) =>
							check.stage === ShipmentStatusTypes.AT_ARRIVAL && check.notes?.split(' - ')[0] === currentPathLabel,
					)
				) {
					return true
				}
			}
		} else {
			// filter by shipment of which the arrival date is confirmed
			if (options.includes('Entradas') && options.includes('Chegada confirmada')) {
				// check if in th checks array, there is one element with prop stage set to 'AT_ARRIVAL'
				if (
					shipment.destination === userDistrict &&
					checks.some(
						(check: any) =>
							check.stage === ShipmentStatusTypes.AT_ARRIVAL && check.notes?.split(' - ')[0] === currentPathLabel,
					)
				) {
					return true
				}
			} else if (options.includes('Entrads') && options.includes('Chegada não confirmada')) {
				// check if in the checks array, there is no element with prop stage set to 'AT_ARRIVAL'
				if (
					shipment.destination === userDistrict &&
					!checks.some(
						(check: any) =>
							check.stage === ShipmentStatusTypes.AT_ARRIVAL && check.notes?.split(' - ')[0] === currentPathLabel,
					)
				) {
					return true
				}
			} else if (options.includes('Saídas') && options.includes('Chegada confirmada')) {
				// check if in the checks arrays, there is any element with prop stage set to 'AT_ARRIVAL'
				if (
					shipment.startDistrict === userDistrict &&
					checks.some(
						(check: any) =>
							check.stage === ShipmentStatusTypes.AT_ARRIVAL && check.notes?.split(' - ')[0] === currentPathLabel,
					)
				) {
					return true
				}
			} else if (options.includes('Saídas') && options.includes('Chegada não confirmada')) {
				// check if in the checks array, there is no element with prop stage set to 'AT_ARRIVAL'
				if (
					shipment.startDistrict === userDistrict &&
					!checks.some(
						(check: any) =>
							check.stage === ShipmentStatusTypes.AT_ARRIVAL && check.notes?.split(' - ')[0] === currentPathLabel,
					)
				) {
					return true
				}
			}
		}
		return false
	})
}
