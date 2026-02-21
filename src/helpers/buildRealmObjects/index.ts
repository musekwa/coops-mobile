import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import { InformalTraderLicenseType, PathLabelType, Permission, StaffRole, TransactionFlowType } from 'src/types'
import { match } from 'ts-pattern'
import { capitalize } from '../capitalize'
import { MetricType, UserDataType } from 'src/store/user'
import { staff } from 'src/constants'
// import { WorkerInfoType } from 'src/store/worker'
import { ShipmentType } from 'src/store/tracking/shipment'
import { ActiveMember, Check, EmployerInfo, Marchandise, Path, TransporterInfo } from 'src/models/embeddable'
import { measurementUnits, ShipmentStatusTypes } from 'src/constants/tracking'
import { UserPerformance } from 'src/models/userPerformance'
import { InformalTrader } from 'src/models/informalTrader'
import { InformalTraderFormDataType } from 'src/store/informalTrader'
import { InformalMarchandiseType } from 'src/store/tracking/smuggled_load'
import { getPaths } from 'src/constants/graphs'
// export const buildInformalMarchandise = (data: InformalMarchandiseType, userData: UserDataType) => {
// 	const {
// 		quantity,
// 		priceAtDestination,
// 		transportationType,
// 		purpose,
// 		transitType,
// 		originDistrict,
// 		originProvince,
// 		destinationDistrict,
// 		destinationProvince,
// 		destinationCountry,
// 		label,
// 	} = data

// 	const unit = measurementUnits.KG

// 	const marchandise = {
// 		_id: uuidv4(),
// 		label,
// 		quantity: quantity ? Number(quantity) : 0,
// 		unit,
// 		purpose,
// 		transitType,
// 		originDistrict,
// 		originProvince,
// 		destinationDistrict: destinationDistrict ? destinationDistrict : '',
// 		destinationProvince: destinationProvince ? destinationProvince : '',
// 		destinationCountry: destinationCountry ? destinationCountry : '',
// 		priceAtDestination: priceAtDestination ? Number(priceAtDestination) : 0,
// 		transportationType,
// 		createdAt: new Date(),
// 		updatedAt: new Date(),
// 		registeredBy: userData.name,
// 		registeredIn: userData.district,
// 	} as Marchandise

// 	return marchandise
// }

export const buildInformalTrader = (data: InformalTraderFormDataType, userData: UserDataType) => {
	const { surname, otherNames, phone, province, district, adminPost, village, licenseType } = data
	const _id = uuidv4()

	const informalTrader = {
		_id,
		surname,
		otherNames,
		phone: phone ? phone : '',
		province,
		district,
		adminPost,
		village,
		permission: Permission.COUNTRYWIDE,
		createdAt: new Date(),
		updatedAt: new Date(),
		isLicensed:
			licenseType === InformalTraderLicenseType.CERTIFICATE ||
			licenseType === InformalTraderLicenseType.PRELIMINARY_COMMUNICATION
				? true
				: false,
		licenseType,
		registeredBy: userData.name,
	} as InformalTrader

	return informalTrader
}

export const buildUserPerformance = (metric: MetricType, startDate: Date, endDate: Date, userId: string) => {
	return {
		_id: uuidv4(),
		metrics: [metric],
		startDate,
		endDate,
		userId,
		permission: Permission.COUNTRYWIDE,
	} as UserPerformance
}

// export const buildShipment = (shipment: ShipmentType, userDetails: UserDataType) => {
// 	const transporters = shipment.transporters.map((trans) => {
// 		return {
// 			brand: trans.truckBrand,
// 			driver: trans.driverName,
// 			phone: trans.driverPhone,
// 			plate: trans.truckPlate,
// 			numberOfSacks: trans.numberOfSacks,
// 			quantity: trans.quantity,
// 			unit: measurementUnits.KG,
// 			sackType: [trans.sackType],
// 		} as unknown as TransporterInfo
// 	})

// 	// convert day, month and year to date
// 	const date = new Date(
// 		parseInt(shipment.transitLicense.year),
// 		parseInt(shipment.transitLicense.month) - 1,
// 		parseInt(shipment.transitLicense.day),
// 	)

// 	const checks = [
// 		{
// 			checkedAt: new Date(),
// 			checkedBy: userDetails.name,
// 			phone: userDetails.phone,
// 			place: userDetails.district,
// 			point: userDetails.district,
// 			stage: ShipmentStatusTypes.AT_DEPARTURE,
// 			notes: `${PathLabelType.GENERATED_BY_SYSTEM} - ${'N/A'}`,
// 		},
// 	] as Check[]

// 	const {shortestPath} = getPaths(userDetails.district, shipment.destinationDistrict)

// 	const path = {
// 		createdAt: new Date(),
// 		createdBy: 'system',
// 		label: PathLabelType.GENERATED_BY_SYSTEM,
// 		districts: shortestPath,
// 	} as Path

// 	return {
// 		_id: uuidv4(),
// 		transitLicense: {
// 			id: String(shipment.transitLicense.id),
// 			photo: shipment.transitLicense.photo,
// 			issuedAt: date,
// 			issuedIn: shipment.transitLicense.issuedIn,
// 			label: shipment.transitLicense.label,
// 			purpose: shipment.transitLicense.purpose,
// 		},
// 		owner: { _id: shipment.ownerId, name: shipment.ownerName, phone: shipment.ownerPhone } as EmployerInfo,
// 		sender: {
// 			_id: shipment.senderId,
// 			name: shipment.senderName,
// 			phone: shipment.senderPhone,
// 		} as EmployerInfo,
// 		receiver: {
// 			_id: shipment.receiverId,
// 			name: shipment.receiverName,
// 			phone: shipment.receiverPhone,
// 		} as EmployerInfo,
// 		transporters: [...transporters],
// 		origins: shipment.origins.map((o) => o.district),
// 		destination: shipment.destinationDistrict,
// 		startDistrict: userDetails.district,
// 		permission: Permission.COUNTRYWIDE,
// 		registeredBy: userDetails.name,
// 		checks: checks,
// 		paths: [path],
// 		createdAt: new Date(),
// 		updatedAt: new Date(),
// 	}
// }

// export const buildWorkerInfo = (workerInfo: WorkerInfoType) => {
// 	const { name, phone, position, photo, _id } = workerInfo

// 	// Convert the string role to StaffRole Type
// 	const newPosition = match(position)
// 		.with(staff.president, () => StaffRole.PRESIDENT)
// 		.with(staff.secretary, () => StaffRole.SECRETARY)
// 		.with(staff.treasurer, () => StaffRole.TREASURER)
// 		.with(staff.member, () => StaffRole.MEMBER)
// 		.with(staff.admin, () => StaffRole.ADMIN)
// 		.otherwise(() => StaffRole.MEMBER)

// 	return {
// 		_id,
// 		name: capitalize(`${name.trim()}`),
// 		photo,
// 		position: newPosition,
// 		phone: String(phone),
// 		createdAt: new Date(),
// 		updatedAt: new Date(),
// 	}
// }

// export const buildWorker = (
// 	worker: WorkerInfoType,
// 	employerInfo: {
// 		name: string
// 		phone?: string
// 		_id: string
// 	},
// ) => {
// 	const { name, phone, position, photo, _id, adminPost, village, district, province } = worker

// 	return {
// 		_id: uuidv4(),
// 		name: capitalize(`${name.trim()}`),
// 		photo,
// 		phone: String(phone),
// 		position,
// 		district,
// 		province,
// 		adminPost,
// 		village,
// 		employerInfo: employerInfo,
// 		createdAt: new Date(),
// 		updatedAt: new Date(),
// 	}
// }
