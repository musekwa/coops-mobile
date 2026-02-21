import { DistrictRecord, ProvinceRecord, TABLES } from "src/library/powersync/schemas/AppSchema"
import { buildDistrict } from "src/library/powersync/schemas/districts"
import { insertDistrict, queryMany, queryOne, updateOne } from "src/library/powersync/sql-statements"


export const populateDistricts = async () => {
    const districts = await queryMany<DistrictRecord>(`SELECT * FROM ${TABLES.DISTRICTS}`, [])

    await Promise.all(
        districts_data.map(async (d) => {
            if (!districts.find((district) => district.code === d.code)) {
				const province = await queryOne<ProvinceRecord>(`SELECT * FROM ${TABLES.PROVINCES} WHERE code = ?`, [d.province_code])
				if (!province) {
					console.log(`Province ${d.province_code} not found`)
					return
				}
                const district = buildDistrict({ ...d, sync_id: 'GLOBAL', province_id: province.id })
                await insertDistrict({ ...district })
            }
        }),
    )
}


interface District {
	name: string
	province_code: string
	code: string
}

export const districts_data: District[] = [
	// Niassa Province
	{ name: 'Chimbunila', province_code: '33', code: '33-01' },
	{ name: 'Cuamba', province_code: '33', code: '33-02' },
	{ name: 'Lago', province_code: '33', code: '33-03' },
	{ name: 'Lichinga', province_code: '33', code: '33-04' },
	{ name: 'Majune', province_code: '33', code: '33-05' },
	{ name: 'Mandimba', province_code: '33', code: '33-06' },
	{ name: 'Marrupa', province_code: '33', code: '33-07' },
	{ name: 'Maúa', province_code: '33', code: '33-08' },
	{ name: 'Mavago', province_code: '33', code: '33-09' },
	{ name: 'Mecanhelas', province_code: '33', code: '33-10' },
	{ name: 'Mecula', province_code: '33', code: '33-11' },
	{ name: 'Metarica', province_code: '33', code: '33-12' },
	{ name: 'Muembe', province_code: '33', code: '33-13' },
	{ name: "N'gauma", province_code: '33', code: '33-14' },
	{ name: 'Nipepe', province_code: '33', code: '33-15' },
	{ name: 'Sanga', province_code: '33', code: '33-16' },

	// Nampula Province
	{ name: 'Angoche', province_code: '31', code: '31-01' },
	{ name: 'Eráti', province_code: '31', code: '31-02' },
	{ name: 'Ilha de Moçambique', province_code: '31', code: '31-03' },
	{ name: 'Lalaua', province_code: '31', code: '31-04' },
	{ name: 'Larde', province_code: '31', code: '31-05' },
	{ name: 'Liúpo', province_code: '31', code: '31-06' },
	{ name: 'Malema', province_code: '31', code: '31-07' },
	{ name: 'Meconta', province_code: '31', code: '31-08' },
	{ name: 'Mecubúri', province_code: '31', code: '31-09' },
	{ name: 'Memba', province_code: '31', code: '31-10' },
	{ name: 'Mogincual', province_code: '31', code: '31-11' },
	{ name: 'Mogovolas', province_code: '31', code: '31-12' },
	{ name: 'Moma', province_code: '31', code: '31-13' },
	{ name: 'Monapo', province_code: '31', code: '31-14' },
	{ name: 'Mossuril', province_code: '31', code: '31-15' },
	{ name: 'Muecate', province_code: '31', code: '31-16' },
	{ name: 'Murrupula', province_code: '31', code: '31-17' },
	{ name: 'Nacala', province_code: '31', code: '31-18' },
	{ name: 'Nacala-a-Velha', province_code: '31', code: '31-19' },
	{ name: 'Nacarôa', province_code: '31', code: '31-20' },
	{ name: 'Nampula', province_code: '31', code: '31-21' },
	{ name: 'Rapale', province_code: '31', code: '31-22' },
	{ name: 'Ribáuè', province_code: '31', code: '31-23' },

	// Cabo Delgado Province
	{ name: 'Ancuabe', province_code: '32', code: '32-01' },
	{ name: 'Balama', province_code: '32', code: '32-02' },
	{ name: 'Chiúre', province_code: '32', code: '32-03' },
	{ name: 'Ibo', province_code: '32', code: '32-04' },
	{ name: 'Macomia', province_code: '32', code: '32-05' },
	{ name: 'Mecúfi', province_code: '32', code: '32-06' },
	{ name: 'Meluco', province_code: '32', code: '32-07' },
	{ name: 'Metuge', province_code: '32', code: '32-08' },
	{ name: 'Mocímboa da Praia', province_code: '32', code: '32-09' },
	{ name: 'Montepuez', province_code: '32', code: '32-10' },
	{ name: 'Mueda', province_code: '32', code: '32-11' },
	{ name: 'Muidumbe', province_code: '32', code: '32-12' },
	{ name: 'Namuno', province_code: '32', code: '32-13' },
	{ name: 'Nangade', province_code: '32', code: '32-14' },
	{ name: 'Palma', province_code: '32', code: '32-15' },
	{ name: 'Pemba (Cidade)', province_code: '32', code: '32-16' },
	{ name: 'Quissanga', province_code: '32', code: '32-17' },

	// Zambézia Province
	{ name: 'Alto Molócuè', province_code: '24', code: '24-01' },
	{ name: 'Chinde', province_code: '24', code: '24-02' },
	{ name: 'Derre', province_code: '24', code: '24-03' },
	{ name: 'Gilé', province_code: '24', code: '24-04' },
	{ name: 'Gurué', province_code: '24', code: '24-05' },
	{ name: 'Ile', province_code: '24', code: '24-06' },
	{ name: 'Inhassunge', province_code: '24', code: '24-07' },
	{ name: 'Luabo', province_code: '24', code: '24-08' },
	{ name: 'Lugela', province_code: '24', code: '24-09' },
	{ name: 'Maganja da Costa', province_code: '24', code: '24-10' },
	{ name: 'Milange', province_code: '24', code: '24-11' },
	{ name: 'Mocuba', province_code: '24', code: '24-12' },
	{ name: 'Mocubela', province_code: '24', code: '24-13' },
	{ name: 'Molumbo', province_code: '24', code: '24-14' },
	{ name: 'Mopeia', province_code: '24', code: '24-15' },
	{ name: 'Morrumbala', province_code: '24', code: '24-16' },
	{ name: 'Mulevala', province_code: '24', code: '24-17' },
	{ name: 'Namacurra', province_code: '24', code: '24-18' },
	{ name: 'Namarroi', province_code: '24', code: '24-19' },
	{ name: 'Nicoadala', province_code: '24', code: '24-20' },
	{ name: 'Pebane', province_code: '24', code: '24-21' },
	{ name: 'Quelimane (Cidade)', province_code: '24', code: '24-22' },

	// Tete Province
	{ name: 'Angónia', province_code: '23', code: '23-01' },
	{ name: 'Cahora-Bassa', province_code: '23', code: '23-02' },
	{ name: 'Changara', province_code: '23', code: '23-03' },
	{ name: 'Chifunde', province_code: '23', code: '23-04' },
	{ name: 'Chiuta', province_code: '23', code: '23-05' },
	{ name: 'Dôa', province_code: '23', code: '23-06' },
	{ name: 'Macanga', province_code: '23', code: '23-07' },
	{ name: 'Magoé', province_code: '23', code: '23-08' },
	{ name: 'Marara', province_code: '23', code: '23-09' },
	{ name: 'Marávia', province_code: '23', code: '23-10' },
	{ name: 'Moatize', province_code: '23', code: '23-11' },
	{ name: 'Mutarara', province_code: '23', code: '23-12' },
	{ name: 'Tete (Cidade)', province_code: '23', code: '23-13' },
	{ name: 'Tsangano', province_code: '23', code: '23-14' },
	{ name: 'Zumbo', province_code: '23', code: '23-15' },

	// Gaza Province
	{ name: 'Bilene', province_code: '12', code: '12-01' },
	{ name: 'Chibuto', province_code: '12', code: '12-02' },
	{ name: 'Chicualacuala', province_code: '12', code: '12-03' },
	{ name: 'Chigubo', province_code: '12', code: '12-04' },
	{ name: 'Chókwè', province_code: '12', code: '12-05' },
	{ name: 'Chongoene', province_code: '12', code: '12-06' },
	{ name: 'Guijá', province_code: '12', code: '12-07' },
	{ name: 'Limpopo', province_code: '12', code: '12-08' },
	{ name: 'Mabalane', province_code: '12', code: '12-09' },
	{ name: 'Mandlakazi', province_code: '12', code: '12-10' },
	{ name: 'Mapai', province_code: '12', code: '12-11' },
	{ name: 'Massangena', province_code: '12', code: '12-12' },
	{ name: 'Massingir', province_code: '12', code: '12-13' },
	{ name: 'Xai-Xai (Cidade)', province_code: '12', code: '12-14' },

	// Maputo Province
	{ name: 'Boane', province_code: '11', code: '11-01' },
	{ name: 'Magude', province_code: '11', code: '11-02' },
	{ name: 'Manhiça', province_code: '11', code: '11-03' },
	{ name: 'Marracuene', province_code: '11', code: '11-04' },
	{ name: 'Matola', province_code: '11', code: '11-05' },
	{ name: 'Matutuíne', province_code: '11', code: '11-06' },
	{ name: 'Moamba', province_code: '11', code: '11-07' },
	{ name: 'Namaacha', province_code: '11', code: '11-08' },

	// Maputo (Cidade) Province
	{ name: 'KaMpfumu', province_code: '10', code: '10-01' },
	{ name: 'Nlhamankulu', province_code: '10', code: '10-02' },
	{ name: 'KaMaxakeni', province_code: '10', code: '10-03' },
	{ name: 'KaMavota', province_code: '10', code: '10-04' },
	{ name: 'KaMubukwana', province_code: '10', code: '10-05' },
	{ name: 'KaTembe', province_code: '10', code: '10-06' },
	{ name: 'KaNyaka', province_code: '10', code: '10-07' },

	// Manica Province
	{ name: 'Bárue', province_code: '22', code: '22-01' },
	{ name: 'Chimoio (Cidade)', province_code: '22', code: '22-02' },
	{ name: 'Gondola', province_code: '22', code: '22-03' },
	{ name: 'Guro', province_code: '22', code: '22-04' },
	{ name: 'Macate', province_code: '22', code: '22-05' },
	{ name: 'Machaze', province_code: '22', code: '22-06' },
	{ name: 'Macossa', province_code: '22', code: '22-07' },
	{ name: 'Manica', province_code: '22', code: '22-08' },
	{ name: 'Mossurize', province_code: '22', code: '22-09' },
	{ name: 'Sussundenga', province_code: '22', code: '22-10' },
	{ name: 'Tambara', province_code: '22', code: '22-11' },
	{ name: 'Vanduzi', province_code: '22', code: '22-12' },

	// Inhambane Province
	{ name: 'Funhalouro', province_code: '13', code: '13-01' },
	{ name: 'Govuro', province_code: '13', code: '13-02' },
	{ name: 'Homoíne', province_code: '13', code: '13-03' },
	{ name: 'Inhambane (Cidade)', province_code: '13', code: '13-04' },
	{ name: 'Inharrime', province_code: '13', code: '13-05' },
	{ name: 'Inhassoro', province_code: '13', code: '13-06' },
	{ name: 'Jangamo', province_code: '13', code: '13-07' },
	{ name: 'Mabote', province_code: '13', code: '13-08' },
	{ name: 'Massinga', province_code: '13', code: '13-09' },
	{ name: 'Maxixe', province_code: '13', code: '13-10' },
	{ name: 'Morrumbene', province_code: '13', code: '13-11' },
	{ name: 'Panda', province_code: '13', code: '13-12' },
	{ name: 'Vilanculos', province_code: '13', code: '13-13' },
	{ name: 'Zavala', province_code: '13', code: '13-14' },

	// Sofala Province
	{ name: 'Beira (Cidade)', province_code: '21', code: '21-01' },
	{ name: 'Búzi', province_code: '21', code: '21-02' },
	{ name: 'Caia', province_code: '21', code: '21-03' },
	{ name: 'Chemba', province_code: '21', code: '21-04' },
	{ name: 'Cheringoma', province_code: '21', code: '21-05' },
	{ name: 'Chibabava', province_code: '21', code: '21-06' },
	{ name: 'Dondo', province_code: '21', code: '21-07' },
	{ name: 'Gorongosa', province_code: '21', code: '21-08' },
	{ name: 'Machanga', province_code: '21', code: '21-09' },
	{ name: 'Maríngue', province_code: '21', code: '21-10' },
	{ name: 'Marromeu', province_code: '21', code: '21-11' },
	{ name: 'Muanza', province_code: '21', code: '21-12' },
	{ name: 'Nhamatanda', province_code: '21', code: '21-13' },

	// N/A
	{ name: 'N/A', province_code: '00', code: '00-00' },
]
