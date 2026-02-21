import { ShipmentStatusTypes } from 'src/constants/tracking'

export interface ShipmentWithOwnerData {
	// Core shipment fields
	id: string
	shipment_number: string
	owner_id: string
	owner_type: 'TRADER' | 'GROUP' | 'FARMER'
	status: ShipmentStatusTypes
	created_at: string
	updated_at: string
	sync_id: string

	// Owner information (from CASE statements)
	owner_name: string
	owner_details: string

	// Additional fields that might be present
	[key: string]: any
}

export interface ShipmentLoadWithCarAndDriver {
	// Core shipment load fields
	id: string
	shipment_id: string
	car_id: string
	driver_id: string
	quantity: number
	created_at: string
	updated_at: string
	sync_id: string

	// Car information (from JOIN)
	car_type: string
	plate_number: string

	// Driver information (from JOIN with actor_details and contact_details)
	driver_name: string
	driver_phone: string

	// Additional fields that might be present
	[key: string]: any
}
