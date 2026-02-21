export const hasTrailer = (carType: string) => {
	return carType === 'TRAILER-TRUCK'
}

export const hasBrandName = (carType: string) => {
	return carType === 'TRUCK' || carType === 'SEMI-TRAILER-TRUCK' || carType === 'TRAILER-TRUCK' || carType === 'PASSENGER-CAR' || carType === 'CARGO-VAN' || carType === 'AGRICULTURAL-TRACTOR' || carType === 'OTHER' || carType === 'PICK-UP' || carType === 'TRACTOR-TRAILER'
}

export const carTypes = [
	{
		label: 'Camião',
		value: 'TRUCK',
	},
	{
		label: 'Camião Semi-Reboque',
		value: 'SEMI-TRAILER-TRUCK',
	},
	{
		label: 'Camião Reboque',
		value: 'TRAILER-TRUCK',
	},
	{
		label: 'Canoa',
		value: 'CANOE',
	},
	{
		label: 'Carro de passageiros',
		value: 'PASSENGER-CAR',
	},
	{
		label: 'Carrinha de carga',
		value: 'CARGO-VAN',
	},
	{
		label: 'Camioneta',
		value: 'PICK-UP',
	},
	{
		label: 'Motocicleta (Moto)',
		value: 'MOTORCYCLE',
	},
	{
		label: 'Trator agrícola',
		value: 'AGRICULTURAL-TRACTOR',
	},
	{
		label: 'Trator Reboque',
		value: 'TRACTOR-TRAILER',
	},
	{
		label: 'Outro',
		value: 'OTHER',
	}
]
