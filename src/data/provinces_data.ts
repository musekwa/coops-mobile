import { CountryRecord, ProvinceRecord, TABLES } from "src/library/powersync/schemas/AppSchema"
import { buildProvince } from "src/library/powersync/schemas/provinces"
import { insertProvince, queryMany, queryOne } from "src/library/powersync/sql-statements"

export const populateProvinces = async () => {
    // Check if province already exists
    const country = await queryOne<CountryRecord>(`SELECT * FROM ${TABLES.COUNTRIES} WHERE name = ? AND code = ?`, ['Moçambique', '508'])
    const provinces = await queryMany<ProvinceRecord>(`SELECT * FROM ${TABLES.PROVINCES}`)
    await Promise.all(
        provinces_data.map(async (p) => {
            if (!country || provinces.find((province) => province.code === p.code)) {
                return
            }
            const province = buildProvince({
                code: p.code,
                name: p.name,
                initials: p.initials,
                sync_id: 'GLOBAL',
                country_id: country?.id,
            })
            await insertProvince({ ...province })
        }),
    )
}


export const provinces_data = [
	{ name: 'Maputo', initials: 'MPT', code: '11', neighbors: ['Gaza', 'Maputo (Cidade)'] },
	{ name: 'Maputo Cidade', initials: 'MPC', code: '10', neighbors: ['Maputo'] },
	{ name: 'Gaza', initials: 'GZA', code: '12', neighbors: ['Maputo', 'Inhambane', 'Manica'] },
	{ name: 'Inhambane', initials: 'INH', code: '13', neighbors: ['Gaza', 'Manica', 'Sofala'] },
	{ name: 'Sofala', initials: 'SOF', code: '21', neighbors: ['Inhambane', 'Manica', 'Zambézia'] },
	{ name: 'Manica', initials: 'MNC', code: '22', neighbors: ['Gaza', 'Inhambane', 'Sofala', 'Tete'] },
	{ name: 'Tete', initials: 'TET', code: '23', neighbors: ['Manica', 'Niassa', 'Zambézia'] },
	{ name: 'Zambézia', initials: 'ZMB', code: '24', neighbors: ['Tete', 'Niassa', 'Nampula', 'Sofala'] },
	{ name: 'Nampula', initials: 'NMP', code: '31', neighbors: ['Zambézia', 'Niassa', 'Cabo Delgado'] },
	{ name: 'Cabo Delgado', initials: 'CDG', code: '32', neighbors: ['Nampula', 'Niassa'] },
	{ name: 'Niassa', initials: 'NIA', code: '33', neighbors: ['Cabo Delgado', 'Nampula', 'Tete', 'Zambézia'] },

    // N/A
    { name: 'N/A', initials: 'N/A', code: '00' },
]
