import { column, Table } from "@powersync/react-native";
import { v4 as uuidv4 } from 'uuid'

export type BirthPlaceType = {
    id: string
    place_id: string
    owner_id: string
    owner_type: string // FARMER, TRADER
    place_type: string // VILLAGE, ADMIN_POST, DISTRICT, PROVINCE, COUNTRY
    description: string
    sync_id: string
}

export default new Table(
    {
        id: column.text,
        place_id: column.text,
        owner_id: column.text,
        owner_type: column.text,
        place_type: column.text,
        description: column.text,
        sync_id: column.text
    },
    {
        indexes: {
            BirthPlace: ['place_id', 'place_type']
        }
    }
)

export const buildBirthPlace = (birthPlace: BirthPlaceType) => {
    const { ...rest } = birthPlace
    const uuid = uuidv4()
    return {
        ...rest,
        id: uuid
    }
}