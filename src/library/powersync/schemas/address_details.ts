import { column, Table } from '@powersync/react-native'
import { v4 as uuidv4 } from 'uuid'
export interface AddressDetailRecordType {
	owner_id: string
	owner_type: string // FARMER, TRADER, GROUP, WAREHOUSE, EMPLOYEE, GROUP_MANAGER, CASHEW_SHIPMENT
	village_id: string
	admin_post_id: string
	district_id: string
	province_id: string
	gps_lat: string
	gps_long: string
	sync_id: string
}

export default new Table(
	{
		id: column.text,
		owner_id: column.text,
		owner_type: column.text,
		village_id: column.text,
		admin_post_id: column.text,
		district_id: column.text,
		province_id: column.text,
		gps_lat: column.text,
		gps_long: column.text,
		sync_id: column.text,
	},
	{
		indexes: {
			AddressDetail: ['owner_id'],
		},
	},
)

export const buildAddressDetail = (addressDetail: AddressDetailRecordType) => {
	const { owner_id, owner_type, village_id, admin_post_id, district_id, province_id, gps_lat, gps_long, sync_id } =
		addressDetail
	return {
		id: uuidv4(),
		owner_id: owner_id,
		owner_type: owner_type,
		village_id: village_id,
		admin_post_id: admin_post_id,
		district_id: district_id,
		province_id: province_id,
		gps_lat: gps_lat,
		gps_long: gps_long,
		sync_id: sync_id,
	}
}
