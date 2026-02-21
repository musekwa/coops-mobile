
export type FarmerToValidateType = {
    _id: string
    surname: string
    otherNames: string
    contacts?: {
        phone1?: string
        phone2?: string
        email?: string
    }
    birth?: {
        date?: Date 
        province?: string
        district?: string
        village?: string
    }
}


