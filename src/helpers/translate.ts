import { ResourceName } from 'src/types'
import { TransportTypes } from 'src/constants/tracking'

export class ToPortuguese {

	static formattedSurname(surname: string, resourceName: string) {
		const surnameLower = surname.toLowerCase()
		const isGroup = surnameLower.includes('group') && resourceName === ResourceName.GROUP
		const isCompanyTrader = surnameLower.includes('company') && resourceName === ResourceName.TRADER
		const isCompanyFarmer = surnameLower.includes('company') && resourceName === ResourceName.FARMER
	
		if (isGroup) {
			return `(Grupo)`
		} else if (isCompanyTrader) {
			return `(Empresa)`
		} else if (isCompanyFarmer) {
			return `(${surname.split(' - ')[0]})`
		} else {
			return surname
		}
	}



	static carType(type: string) {
		// Handle undefined/null/empty type
		if (!type || typeof type !== 'string') {
			return type || ''
		}

		// Remove the last dash and everything after it (e.g., "SEMI-TRAILER-TRUCK-EXTRA" -> "SEMI-TRAILER-TRUCK")
		const lastDashIndex = type.lastIndexOf('-')
		const carType = lastDashIndex !== -1 ? type.substring(0, lastDashIndex) : type

    // Get the brand name after the last dash
    const brandName = lastDashIndex !== -1 ? type.substring(lastDashIndex + 1) : ''
		return `${carTypeToPortuguese(carType)}-${brandName}`
	}

	static transportType(type: string) {
		return transportTypeToPortuguese(type)
	}
	static sellerType(type: string) {
		return sellerTypeToPortuguese(type)
	}

	static resourceName(resourceName: string) {
		return resourceNameToPortuguese(resourceName)
	}

	static groupType(type: string) {
		return type.toLowerCase() === 'association'
			? '(Associação)'
			: type.toLowerCase() === 'cooperative'
				? '(Cooperativa)'
				: '(União das Cooperativas)'
	}
}

export const resourceNameToPortuguese = (resourceName: string) => {
	switch (resourceName) {
		case ResourceName.FARMER:
			return 'Produtor'
		case ResourceName.TRADER:
			return 'Comerciante'
		case ResourceName.GROUP:
			return 'Grupo'
		default:
			return 'Outro'
	}
}

export const sellerTypeToPortuguese = (sellerType: string): string => {
	switch (sellerType.toUpperCase()) {
		case 'FARMER':
			return 'Produtor'
		case 'ASSOCIATION':
			return 'Associação'
		case 'INFORMAL_TRADER':
			return 'Comerciante informal'
		case 'FORMAL_TRADER':
			return 'Comerciante formal'
		case 'COOPERATIVE':
			return 'Cooperativa'
		case 'COOP_UNION':
			return 'União de cooperativas'
		default:
			return 'Outro'
	}
}

export const transportTypeToPortuguese = (type: string) => {
	if (type === TransportTypes.BICYCLE) {
		return { label: 'Bicicleta', value: type }
	}
	if (type === TransportTypes.MOTORBIKE) {
		return { label: 'Moto', value: type }
	}
	if (type === TransportTypes.CAR) {
		return { label: 'Carro', value: type }
	}
	if (type === TransportTypes.CANOE) {
		return { label: 'Canoa', value: type }
	}
	if (type === TransportTypes.BOAT) {
		return { label: 'Barco', value: type }
	}
	return { label: type, value: type }
}

export const carTypeToPortuguese = (type: string) => {
	switch (type) {
		case 'TRUCK':
			return 'Camião'
		case 'SEMI-TRAILER-TRUCK':
			return 'Camião Semi-Reboque'
		case 'TRAILER-TRUCK':
			return 'Camião Reboque'
		case 'CANOE':
			return 'Canoa'
		case 'PASSENGER-CAR':
			return 'Carro de passageiros'
		case 'CARGO-VAN':
			return 'Carrinha de carga'
		case 'PICK-UP':
			return 'Camioneta'
		case 'MOTORCYCLE':
			return 'Motocicleta (Moto)'
		case 'AGRICULTURAL-TRACTOR':
			return 'Trator agrícola'
		case 'TRACTOR-TRAILER':
			return 'Trator Reboque (Trailer)'
		default:
			return type
	}
}
