import { getCompleteFormattedDate } from './dates'
import { ShipmentStatusTypes } from 'src/constants/tracking'
import { match } from 'ts-pattern'

export const translateShipmentStage = (stage: ShipmentStatusTypes) => {
	return match(stage)
		.with(ShipmentStatusTypes.DELIVERED, () => 'Chegou')
		.with(ShipmentStatusTypes.AT_ARRIVAL, () => 'Chegou')
		.with(ShipmentStatusTypes.IN_TRANSIT, () => 'Em trânsito')
		.with(ShipmentStatusTypes.AT_DEPARTURE, () => 'A partir')
		.with(ShipmentStatusTypes.PENDING, () => 'Pendente')
		.otherwise(() => 'Pendente')
}

