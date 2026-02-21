import { TransitType } from 'src/constants/tracking'

export const checkpointTypes: { label: string; value: TransitType; description: string }[] = [
	{ label: 'Internacional', value: TransitType.INTERNATIONAL, description: 'Na fronteira internacional' },
	{ label: 'Interprovincial', value: TransitType.INTERPROVINCIAL, description: 'Na fronteira provincial' },
	{ label: 'Interdistrital', value: TransitType.INTERDISTRITAL, description: 'Na fronteira distrital' },
	{ label: 'Intradistrital', value: TransitType.INTRADISTRICTAL, description: 'Dentro do distrito' },
]

export type Checkpoint = {
	checkpoint_name: string
	description?: string
	address_id: string
	checkpoint_type: TransitType
	is_active: boolean
	northern_next_checkpoint_id?: string
	southern_next_checkpoint_id?: string
	western_next_checkpoint_id?: string
	eastern_next_checkpoint_id?: string
	sync_id: string
}

export const checkpoints: Checkpoint[] = [
	// Cabo Delgado
	{
		checkpoint_name: 'Lúrio',
		address_id: '1',
		checkpoint_type: TransitType.INTERNATIONAL,
		is_active: true,
		sync_id: '1',
		northern_next_checkpoint_id: '2',
		southern_next_checkpoint_id: '3',
		western_next_checkpoint_id: '4',
		eastern_next_checkpoint_id: '5',
	},
]

const checkpoints2 = {
	// Cabo Delgado
	Chiúre: ['Lúrio'],
	Nangade: ['Milola', 'Mandimba', 'Ntamba', 'Napwatakala'],
	Mueda: ['Namatil', 'Chicundi', 'Naida', 'Chude'],
	'Mocímboa da Praia': ['Auasse'],
	Palma: ['Quionga'],
	Ancuabe: ['Silva Mácua', 'Metoro'],
	Montepuez: ['Montepuez'],
	Quissanga: ['Bilibiza'],
	Macomia: ['Macomia'],
	Metuge: ['Metuge'],

	// Nampula
	Eráti: ['Lúrio'],
	Meconta: ['Namialo'],
	Moma: ['Ligonha', 'Chalaua', 'Moma (Sede)'],
	Murrupula: ['Ligonha'],
	Nampula: ['Nampula'],
	Nacala: ['Nacala'],
	Mogovolas: ['Mogovolas'],
	Monapo: ['Monapo'],
	Ribáuè: ['Ribáuè'],
	'Nacala-a-Velha': ['Nacala-a-Velha'],
	Angoche: ['Angoche'],
	Mecubúri: ['Mecubúri'],

	// Zambezia
	Mopeia: ['Chimuara'], // Mussaraua changed to Chimuara: 2025-02-18,
	Pebane: ['Mussila', 'Txalalane', 'Txucua', 'Murudo', 'Mutulumua', 'Magiga', 'Etaga'], //Ratata changed to Magiga
	Gilé: ['Ligonha', 'Waturia', 'Mahacha', 'Namitatari', 'Namicopo'],
	Mulevala: ['Mussaraua'],

	'Maganja da Costa': ['Maganja da Costa'],
	Derre: ['Derre'],
	Nicoadala: ['Nicoadala'],
	'Quelimane (Cidade)': ['Quelimane (Cidade)'],
	Chinde: ['Chinde'],
	Luabo: ['Luabo'],
	Molumbo: ['Molumbo'],
	Namacurra: ['Namacurra'],
	Morrumbala: ['Morrumbala'],
	Gurué: ['Gurué'],
	Ile: ['Ile'],
	'Alto Molócuè': ['Alto Molócuè'],
	Mocubela: ['Mocubela'],
	Mocuba: ['Mocuba'],
	Milange: ['Milange'],
	Namarroi: ['Namarroi'],
	Inhassunge: ['Inhassunge'],
	Lugela: ['Lugela'],

	// Manica
	Gondola: ['Inchope'],
	Machaze: ['Chipudje', 'Save'],
	Mossurize: ['Mossurize'],

	// Inhambane do norte para sul: save => maxixe => zandamela => GAZA

	Zavala: ['Zandamela'], // n1
	Panda: ['Mawayela'],
	Govuro: ['Save'], // n1
	Maxixe: ['Maxixe'], // n1
	Homoíne: ['Homoíne'],
	Inhassoro: ['Inhassoro'],
	Funhalouro: ['Funhalouro'],
	Mabote: ['Mabote'],
	Morrumbene: ['Morrumbene'],
	Jangamo: ['Jangamo'],
	'Inhambane (Cidade)': ['Inhambane (Cidade)'],
	Inharrime: ['Inharrime'],
	Vilankulo: ['Vilankulo'],
	Massinga: ['Massinga'],

	// Maputo
	Marracuene: ['Nhonganhane'],
	Maputo: ['Portos de Maputo', 'Armazéns dos Exportadores'],

	// Sofala
	Caia: ['Ponte Armando Emílio Guebuza'],
	Dondo: ['Balança'],
	Chibabava: ['Muxungue'],
	Búzi: ['Bandua', 'Chissinzuana'],
	'Beira (Cidade)': ['Beira (Cidade)'],
	Machanga: ['Machanga'],
	Chemba: ['Chemba'],
	Marromeu: ['Marromeu'],
	Maringué: ['Maringué'],
	Gorongosa: ['Gorongosa'],
	Muanza: ['Muanza'],
	Cheringoma: ['Cheringoma'],
	Nhamatanda: ['Nhamatanda'],

	// Gaza
	Bilene: ['Iconluane', 'Mazivila', 'Macia'],
	'Xai-Xai (Cidade)': ['Pontinha'],
	Mandlakazi: ['Macuacua', 'Mandlakazi (Sede)'],
	Chibuto: ['Chibuto (Sede)'],
	Limpopo: ['Chissano'],
	Mapai: ['Mapai'],

	Chókwè: ['Chókwè'],
	Chigubo: ['Chigubo'],
	Guijá: ['Guijá'],
	Massangena: ['Massangena'],
	Chongoene: ['Chongoene'],
	Massingir: ['Massingir'],
	Mabalane: ['Mabalane'],
	Chicualacuala: ['Chicualacuala'],
}
