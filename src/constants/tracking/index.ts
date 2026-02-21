
export enum TransportTypes {
	BICYCLE = 'BICYCLE',
	MOTORBIKE = 'MOTORBIKE',
	CAR = 'CAR',
	CANOE = 'CANOE',
	BOAT = 'BOAT',
	
}


export enum TransitType {
	INTERDISTRITAL = 'INTERDISTRITAL',
	INTERPROVINCIAL = 'INTERPROVINCIAL',
	INTERNATIONAL = 'INTERNATIONAL',
	INTRADISTRICTAL = 'INTRADISTRICTAL',
}

export enum ShipmentStatusTypes {
	PENDING = 'PENDING',
	AT_DEPARTURE = 'AT_DEPARTURE',
	AT_ARRIVAL = 'AT_ARRIVAL',
	IN_TRANSIT = 'IN_TRANSIT',
	DELIVERED = 'DELIVERED',
}

export enum marchandisesTypes {
	CASHEW_NUT = 'CASHEW_NUT',
	CASHEW_KERNEL = 'CASHEW_KERNEL',
}

export enum sackTypes {
	BOX = 'BOX',
	SACK = 'SACK',
}


export enum shipmentParticipants {
	WORKER = 'WORKER',
	TRANSPORTER = 'TRANSPORTER',
	OWNER = 'OWNER',
	OTHER = 'OTHER',
}

export enum sackWeights {
	EIGHTY = '80 Kg',
	FIFTY = '50 Kg',
}

export enum measurementUnits {
	KG = 'Kg',
	TON = 'Ton',
}

export enum hintList {
	licenseInfo = 'licenseInfo',
	owner = 'owner',
	sender = 'sender',
	receiver = 'receiver',
	transporter = 'transporter',
	other = 'other',
	origin = 'origin',
	destination = 'destination',
}
