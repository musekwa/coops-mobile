import { UserDetailsRecord } from '../powersync/schemas/AppSchema'
import { supabase } from './supabase'

export interface ProvinceOption {
	label: string
	value: string
}

export interface DistrictOption {
	label: string
	value: string
	province_id: string
}

/**
 * Fetches all provinces from the provinces table and returns them in the format
 * {label: Name Of Province, value: ID of Province}
 * Filters out provinces with name 'N/A'
 */
export const selectProvinces = async (): Promise<{
	success: boolean
	message: string
	data: ProvinceOption[]
}> => {
	try {
		const { data, error } = await supabase.from('provinces').select('id, name').neq('name', 'N/A').order('name')

		if (error) {
			console.error('Error fetching provinces:', error)
			return {
				success: false,
				message: 'Erro ao buscar províncias',
				data: [],
			}
		}

		const provinces: ProvinceOption[] = data.map((province) => ({
			label: province.name,
			value: province.id,
		}))

		return {
			success: true,
			message: 'Províncias buscadas com sucesso',
			data: provinces,
		}
	} catch (error) {
		console.error('Error in selecting provinces:', error)
		return {
			success: false,
			message: 'Erro inesperado ao buscar províncias',
			data: [],
		}
	}
}

/**
 * Fetches all districts from the districts table and returns them in the format
 * {label: Name of District, value: ID of District, province_id: ID of Province}
 */
export const selectDistricts = async (): Promise<{
	success: boolean
	message: string
	data: DistrictOption[]
}> => {
	try {
		const { data, error } = await supabase.from('districts').select('id, name, province_id').order('name')

		if (error) {
			console.error('Error fetching districts:', error)
			return {
				success: false,
				message: 'Erro ao buscar distritos',
				data: [],
			}
		}

		const districts: DistrictOption[] = data.map((district) => ({
			label: district.name,
			value: district.id,
			province_id: district.province_id,
		}))

		return {
			success: true,
			message: 'Distritos buscados com sucesso',
			data: districts,
		}
	} catch (error) {
		console.error('Error in selecting districts:', error)
		return {
			success: false,
			message: 'Erro inesperado ao buscar distritos',
			data: [],
		}
	}
}

/**
 * Fetches districts by province ID from the districts table and returns them in the format
 * {label: Name of District, value: ID of District, province_id: ID of Province}
 */
export const selectDistrictsByProvinceId = async (
	provinceId: string,
): Promise<{
	success: boolean
	message: string
	data: DistrictOption[]
}> => {
	try {
		const { data, error } = await supabase
			.from('districts')
			.select('id, name, province_id')
			.eq('province_id', provinceId)
			.order('name')

		if (error) {
			console.error('Error fetching districts by province:', error)
			return {
				success: false,
				message: 'Erro ao buscar distritos por província',
				data: [],
			}
		}

		const districts: DistrictOption[] = data.map((district) => ({
			label: district.name,
			value: district.id,
			province_id: district.province_id,
		}))

		return {
			success: true,
			message: 'Distritos por província buscados com sucesso',
			data: districts,
		}
	} catch (error) {
		console.error('Error in selecting districts by province id:', error)
		return {
			success: false,
			message: 'Erro inesperado ao buscar distritos por província',
			data: [],
		}
	}
}

export const selectUsersByDistrictId = async (districtId: string): Promise<{
	success: boolean
	message: string
	data: UserDetailsRecord[]
}> => {
	try {
		const { data, error } = await supabase.from('user_details').select('*').eq('district_id', districtId).order('full_name', { ascending: true })
		if (error) {
			console.error('Error in selecting users by district id:', error)
			return {
				success: false,
				message: 'Erro inesperado ao buscar usuários por distrito',
				data: [],
			}
		}
		return {
			success: true,
			message: 'Usuários por distrito buscados com sucesso',
			data: data as UserDetailsRecord[] | [],
		}
	} catch (error) {
		console.error('Error in selecting users by district id:', error)
		return {
			success: false,
			message: 'Erro inesperado ao buscar usuários por distrito',
			data: [],
		}
	}
}
