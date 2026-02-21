import { BorderRecord, CountryRecord, ProvinceRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { queryMany } from 'src/library/powersync/sql-statements'
import { insertBorder } from 'src/library/sqlite/inserts'
import { v4 as uuidv4 } from 'uuid'

export const country_codes = {
	Malawi: 'MWI',
	Tanzânia: 'TZA',
	Zâmbia: 'ZMB',
	Zimbabwe: 'ZWE',
	'Essuatíni': 'SWZ',
	'África do Sul': 'ZAF',
}

export const province_codes = {
	Niassa: '33',
	'Cabo Delgado': '32',
	Manica: '22',
	Tete: '23',
	Maputo: '11',
	Zambézia: '24',
	Nampula: '31',
	Gaza: '12',
	Inhambane: '13',
	Sofala: '21',
	'Maputo Cidade': '10',
}

export type BordersType = {
	country_initials: string
	province_code: string
	name: string
	border_type: 'OFFICIAL' | 'INFORMAL'
	description: string
}

export const populateBorders = async (provinces: ProvinceRecord[], countries: CountryRecord[]) => {
	// console.log("countries", countries)
	const borders = await queryMany<BorderRecord>(`SELECT * FROM ${TABLES.BORDERS}`, [])
	// console.log("borderDefinitions", borderDefinitions.length)
	await Promise.all(
		borderDefinitions.map(async (b) => {
			// Check if country already exists

			// Only insert if country doesn't exist
			if (!borders.find((border) => border.name === b.name)) {
				const province = provinces.find((province) => province.code === b.province_code)
				const country = countries.find((country) => country.initials === b.country_initials)
				if (!province || !country) {
					console.log('Province', province)
					console.log('Country', country)
					console.log(`Province or country not found`)
					return
				}
				await insertBorder({
					id: uuidv4(),
					name: b.name,
					border_type: b.border_type,
					province_id: province.id,
					country_id: country.id,
					description: b.description,
					sync_id: 'GLOBAL',
				})
			}
		}),
	)
}

export const borderDefinitions: BordersType[] = [
	// Tanzania
	{
		country_initials: country_codes['Tanzânia'],
		province_code: province_codes['Cabo Delgado'],
		name: 'Negomano',
		border_type: 'OFFICIAL',
		description: 'Principal posto - Um dos principais postos da fronteira norte',
	},
	{
		country_initials: country_codes['Tanzânia'],
		province_code: province_codes['Cabo Delgado'],
		name: 'Namoto',
		border_type: 'OFFICIAL',
		description: 'Posto com maior fluxo - Regista mais de 1.500 travessias',
	},
	{
		country_initials: country_codes['Tanzânia'],
		province_code: province_codes['Cabo Delgado'],
		name: 'Kilambo-Palma',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço',
	},
	{
		country_initials: country_codes['Tanzânia'],
		province_code: province_codes['Cabo Delgado'],
		name: 'Ponte da Unidade-Rovuma',
		border_type: 'OFFICIAL',
		description: 'Ponte/Posto fronteiriço - Sobre o Rio Rovuma',
	},
	{
		country_initials: country_codes['Tanzânia'],
		province_code: province_codes['Cabo Delgado'],
		name: 'Namatil',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço',
	},
	{
		country_initials: country_codes['Tanzânia'],
		province_code: province_codes['Cabo Delgado'],
		name: 'Ngapa',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço',
	},
	{
		country_initials: country_codes['Tanzânia'],
			province_code: province_codes['Cabo Delgado'],
		name: 'Nangade-Sede',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço',
	},
	{
		country_initials: country_codes['Tanzânia'],
		province_code: province_codes['Cabo Delgado'],
		name: 'Travessias em zonas remotas de Cabo Delgado',
		border_type: 'INFORMAL',
		description: 'Rotas tradicionais - Usadas por comunidades transfronteiriças',
	},
	{
		country_initials: country_codes['Tanzânia'],
		province_code: province_codes['Cabo Delgado'],
		name: 'Caminhos rurais entre aldeias',
		border_type: 'INFORMAL',
		description: 'Passagens informais - Comércio informal e movimentação local',
	},

	// Malawi
	{
		country_initials: country_codes['Malawi'],
		province_code: province_codes['Niassa'],
		name: 'Mandimba',
		border_type: 'OFFICIAL',
		description: 'Posto de Paragem Única (OSBP) - Um dos 4 postos de paragem única planeados',
	},
	{
		country_initials: country_codes['Malawi'],
		province_code: province_codes['Niassa'],
		name: 'Entre Lagos-Cobué',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço - Acesso ao Lago Niassa',
	},
	{
		country_initials: country_codes['Malawi'],
		province_code: province_codes['Niassa'],
		name: 'II Congresso',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço',
	},
	{
		country_initials: country_codes['Malawi'],
		province_code: province_codes['Tete'],
		name: 'Zobué',
		border_type: 'OFFICIAL',
		description: 'Posto de Paragem Única (OSBP) - Posto fronteiriço modernizado',
	},
	{
		country_initials: country_codes['Malawi'],
		province_code: province_codes['Tete'],
		name: 'Calómuè',
		border_type: 'OFFICIAL',
		description: 'Posto de Paragem Única (OSBP) - Posto fronteiriço modernizado',
	},
	{
		country_initials: country_codes['Malawi'],
		province_code: province_codes['Tete'],
		name: 'Vila Nova da Fronteira-Dedza',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço',
	},
	{
		country_initials: country_codes['Malawi'],
		province_code: province_codes['Zambézia'],
		name: 'Milange',
		border_type: 'OFFICIAL',
		description: 'Posto de Paragem Única (OSBP)-Posto fronteiriço modernizado',
	},
	{
		country_initials: country_codes['Malawi'],
		province_code: province_codes['Zambézia'],
		name: 'Melosa',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço',
	},
	{
		country_initials: country_codes['Malawi'],
		province_code: province_codes['Niassa'],
		name: 'Travessias fluviais tradicionais',
		border_type: 'INFORMAL',
		description: 'Rotas fluviais - Usadas por pescadores e comerciantes locais',
	},
	{
		country_initials: country_codes['Malawi'],
		province_code: province_codes['Niassa'],
		name: 'Caminhos rurais entre aldeias fronteiriças',
		border_type: 'INFORMAL',
		description: 'Passagens informais - Movimento de populações locais',
	},
	{
		country_initials: country_codes['Malawi'],
		province_code: province_codes['Tete'],
		name: 'Rotas de comércio informal',
		border_type: 'INFORMAL',
		description: 'Caminhos tradicionais - Especialmente em zonas agrícolas',
	},

	// Zambia
	{
		country_initials: country_codes['Zâmbia'],
		province_code: province_codes['Tete'],
		name: 'Cassacatiza',
		border_type: 'OFFICIAL',
		description: 'Principal posto-Paragem Única (OSBP)',
	},
	{
		country_initials: country_codes['Zâmbia'],
		province_code: province_codes['Tete'],
		name: 'Zumbo',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço - Zona de confluência Zambeze-Luangwa',
	},
	{
		country_initials: country_codes['Zâmbia'],
		province_code: province_codes['Tete'],
		name: 'Travessias fluviais no Rio Zambeze',
		border_type: 'INFORMAL',
		description: 'Passagens de barco - Usadas por comunidades pesqueiras',
	},
	{
		country_initials: country_codes['Zâmbia'],
		province_code: province_codes['Tete'],
		name: 'Rotas informais em áreas remotas de Tete',
		border_type: 'INFORMAL',
		description: 'Caminhos rurais - Acesso limitado e áreas isoladas',
	},

	// Zimbabwe
	{
		country_initials: country_codes['Zimbabwe'],
		province_code: province_codes['Manica'],
		name: 'Machipanda',
		border_type: 'OFFICIAL',
		description: 'Principal posto - Corredor da Beira - Em processo de modernização com parceria público-privada',
	},
	{
		country_initials: country_codes['Zimbabwe'],
		province_code: province_codes['Manica'],
		name: 'Espungabera',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço - Zona de comunidades Ndau transfronteiriças',
	},
	{
		country_initials: country_codes['Zimbabwe'],
		province_code: province_codes['Tete'],
		name: 'Nyamapanda-Cuchamano',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço',
	},
	{
		country_initials: country_codes['Zimbabwe'],
		province_code: province_codes['Manica'],
		name: 'Travessias tradicionais no distrito de Mossurize',
		border_type: 'INFORMAL',
		description:
			'Rotas comunitárias - Distrito isolado com acessibilidades incipientes, organização tradicional preponderante',
	},
	{
		country_initials: country_codes['Zimbabwe'],
		province_code: province_codes['Manica'],
		name: 'Caminhos históricos entre comunidades Ndau',
		border_type: 'INFORMAL',
		description:
			'Passagens tradicionais - Locais: Chiurairue, Dacata, Espungabera - Usadas por populações locais com laços familiares',
	},
	{
		country_initials: country_codes['Zimbabwe'],
		province_code: province_codes['Manica'],
		name: 'Rotas de comércio informal',
		border_type: 'INFORMAL',
		description: 'Caminhos entre aldeias - Comércio de produtos agrícolas e bens',
	},

	// Eswatini
	{
		country_initials: country_codes['Essuatíni'],
		province_code: province_codes['Maputo'],
		name: 'Namaacha-Lomahasha',
		border_type: 'OFFICIAL',
		description: 'Principal posto-Uma das fronteiras mais movimentadas',
	},
	{
		country_initials: country_codes['Essuatíni'],
		province_code: province_codes['Maputo'],
		name: 'Goba',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço',
	},
	{
		country_initials: country_codes['Essuatíni'],
		province_code: province_codes['Maputo'],
		name: 'Mhlumeni',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço 24h-Único posto aberto 24 horas entre Moçambique e Essuatíni',
	},
	{
		country_initials: country_codes['Essuatíni'],
		province_code: province_codes['Maputo'],
		name: 'Passagens informais em zonas agrícolas',
		border_type: 'INFORMAL',
		description: 'Rotas rurais-Usadas por agricultores e trabalhadores',
	},
	{
		country_initials: country_codes['Essuatíni'],
		province_code: province_codes['Maputo'],
		name: 'Caminhos tradicionais entre comunidades locais',
		border_type: 'INFORMAL',
		description: 'Passagens comunitárias-Movimento diário de populações fronteiriças',
	},

	// South Africa
	{
		country_initials: country_codes['África do Sul'],
		province_code: province_codes['Maputo'],
		name: 'Ressano Garcia-Lebombo',
		border_type: 'OFFICIAL',
		description: 'Principal fronteira terrestre-Principal fronteira terrestre entre Moçambique e África do Sul',
	},
	{
		country_initials: country_codes['África do Sul'],
		province_code: province_codes['Maputo'],
		name: 'Namaacha',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço-Também liga com Suazilândia (fronteira tripartida)',
	},
	{
		country_initials: country_codes['África do Sul'],
		province_code: province_codes['Maputo'],
		name: 'Ponta de Ouro-Kosi Bay',
		border_type: 'OFFICIAL',
		description: 'Posto fronteiriço-Zona costeira turística',
	},
	{
		country_initials: country_codes['África do Sul'],
		province_code: province_codes['Maputo'],
		name: 'Múltiplas aberturas informais no arame farpado',
		border_type: 'INFORMAL',
		description:
			'Entradas ilegais - Facilitadas por passadores interligados com operações de transporte, comunicações e transações financeiras',
	},
	{
		country_initials: country_codes['África do Sul'],
		province_code: province_codes['Maputo'],
		name: 'Travessias ilegais perto de Ressano Garcia',
		border_type: 'INFORMAL',
		description: 'Passagens curtas - Usadas por trabalhadores informais e migrantes',
	},
	{
		country_initials: country_codes['África do Sul'],
		province_code: province_codes['Maputo'],
		name: 'Zonas rurais entre postos oficiais',
		border_type: 'INFORMAL',
		description: 'Rotas informais - Ao longo da extensa fronteira',
	},
]
