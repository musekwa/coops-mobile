import { findAllPaths } from 'src/helpers/dfs'

export interface Graph {
	[key: string]: string[]
}

export const getGraph = (start: string, end: string) => {
	if (isNorthernZonePath(start, end)) {
		return northernZoneGraph
	} else if (isCentralZonePath(start, end)) {
		return centralZoneGraph
	} else if (isSouthernZonePath(start, end)) {
		return southernZoneGraph
	} else if (isNorthernAndCentralZonePath(start, end)) {
		return { ...northernZoneGraph, ...centralZoneGraph }
	} else if (isCentralAndSouthernZonePath(start, end)) {
		return { ...centralZoneGraph, ...southernZoneGraph }
	} else {
		return { ...northernZoneGraph, ...centralZoneGraph, ...southernZoneGraph }
	}
}

export const getPaths = (start: string, end: string) => {
	const graph = getGraph(start, end)
	const allPaths = findAllPaths(graph, start, end)
	return { shortestPath: allPaths[0], allPaths }
}

export const isNorthernAndCentralZonePath = (start: string, end: string) => {
	const graph = {
		...northernZoneGraph,
		...centralZoneGraph,
	}
	if (Object.keys(graph).includes(start) && Object.keys(graph).includes(end)) {
		return true
	}
	return false
}

export const isCentralAndSouthernZonePath = (start: string, end: string) => {
	const graph = {
		...centralZoneGraph,
		...southernZoneGraph,
	}
	if (Object.keys(graph).includes(start) && Object.keys(graph).includes(end)) {
		return true
	}
	return false
}

export const isNorthernAndCentralAndSouthernZonePath = (start: string, end: string) => {
	const graph = {
		...northernZoneGraph,
		...centralZoneGraph,
		...southernZoneGraph,
	}
	if (Object.keys(graph).includes(start) && Object.keys(graph).includes(end)) {
		return true
	}
	return false
}

export const isNorthernZonePath = (start: string, end: string) => {
	if (Object.keys(northernZoneGraph).includes(start) && Object.keys(northernZoneGraph).includes(end)) {
		return true
	}
	return false
}

export const isCentralZonePath = (start: string, end: string) => {
	if (Object.keys(centralZoneGraph).includes(start) && Object.keys(centralZoneGraph).includes(end)) {
		return true
	}
	return false
}

export const isSouthernZonePath = (start: string, end: string) => {
	if (Object.keys(southernZoneGraph).includes(start) && Object.keys(southernZoneGraph).includes(end)) {
		return true
	}
	return false
}
// graph of all districts in Northern Zone and the fiscalization posts connected to them, including Zambézia and excluding Niassa
export const northernZoneGraph: Graph = {
	// Nampula
	// districts in Nampula with fiscalization posts
	Eráti: ['Chiúre', 'Nacarôa', 'Memba'],
	Meconta: ['Nampula', 'Monapo', 'Nacarôa', 'Muecate'],
	Moma: ['Pebane', 'Mogovolas', 'Larde'],
	Mogovolas: ['Moma', 'Nampula', 'Angoche', 'Larde'],
	Murrupula: ['Nampula', 'Gilé'],
	Nampula: ['Meconta', 'Murrupula', 'Mogovolas', 'Rapale'],
	Nacala: ['Monapo', 'Nacala-a-Velha'],
	Monapo: ['Meconta', 'Nacala', 'Mogincual', 'Mossuril', 'Ilha de Moçambique'],
	Ribáuè: ['Malema', 'Mecubúri', 'Lalaua'],
	'Nacala-a-Velha': ['Nacala', 'Memba'],
	Angoche: ['Mogovolas', 'Liúpo', 'Mogincual'],
	Mecubúri: ['Rapale', 'Ribáuè'],

	// districts in Nampula with no fiscalization posts
	Lalaua: ['Ribáuè'],
	Memba: ['Eráti', 'Nacalha-a-Velha'],

	Mossuril: ['Monapo'],
	Liúpo: ['Monapo', 'Angoche'],
	Mogincual: ['Monapo', 'Angoche'],
	Rapale: ['Nampula', 'Mecubúri'],
	Malema: ['Ribáuè', 'Gurué'],
	Larde: ['Mogovolas', 'Moma'],
	'Ilha de Moçambique': ['Monapo'],
	Nacarôa: ['Eráti', 'Meconta', 'Muecate'],
	Muecate: ['Meconta', 'Nacarôa'],

	// Cabo Delgado
	// districts in Cabo Delgado with fiscalization posts
	Palma: ['Mocímboa da Praia'], // Quionga
	Nangade: ['Mocímboa da Praia', 'Mueda'], // Milola; Napwatakala; (Ntamba); Mandimba
	Mueda: ['Mocímboa da Praia', 'Nangade', 'Muidumbe'], // Namatil; Naida; Chicunde; Chude
	Chiúre: ['Eráti', 'Ancuabe'], // Lurio
	'Mocímboa da Praia': ['Mueda', 'Palma', 'Nangade', 'Macomia'], // Auasse
	Quissanga: ['Ancuabe', 'Macomia', 'Ibo', 'Metuge'],
	Ancuabe: ['Chiúre', 'Quissanga', 'Montepuez', 'Metuge', 'Meluco'],
	Montepuez: ['Ancuabe', 'Namuno', 'Balama'],
	Macomia: ['Mocímboa da Praia', 'Quissanga', 'Muidumbe'],
	Metuge: ['Ancuabe', 'Quissanga', 'Pemba (Cidade)', 'Mecúfi'],

	// districts in Cabo Delgado with no fiscalization posts
	Balama: ['Montepuez'],
	Ibo: ['Quissanga'],
	Mecúfi: ['Metuge'],
	Meluco: ['Ancuabe'],
	Muidumbe: ['Mueda', 'Macomia'],
	Namuno: ['Montepuez'],
	'Pemba (Cidade)': ['Metuge'],

	// Zambézia
	// districts in Zambézia with fiscalization posts
	Gilé: ['Mulevala', 'Pebane', 'Murrupula', 'Alto Molócuè'],
	Pebane: ['Gilé', 'Mocubela', 'Moma'],
	Mulevala: ['Mocuba', 'Mocubela', 'Gilé', 'Ile'],
	Mocuba: ['Mulevala', 'Maganja da Costa', 'Milange', 'Namacurra', 'Derre', 'Lugela', 'Mocubela', 'Ile'],
	Mocubela: ['Mocuba', 'Pebane', 'Maganja da Costa', 'Mulevala'],
	Milange: ['Mocuba', 'Molumbo', 'Derre'],
	'Maganja da Costa': ['Mocubela', 'Mocuba', 'Namacurra'],
	Derre: ['Mocuba', 'Milange', 'Morrumbala', 'Mopeia', 'Nicoadala'],
	Lugela: ['Mocuba'],
	Namarroi: ['Milange', 'Gurué', 'Ile'],
	Ile: ['Namarroi', 'Gurué', 'Alto Molócuè', 'Mulevala', 'Mocuba'],
	Gurué: ['Milange', 'Alto Molócuè', 'Ile', 'Molumbo', 'Malema'],
	Mopeia: ['Morrumbala', 'Nicoadala', 'Caia'],
	'Alto Molócuè': ['Gurué', 'Gilé', 'Ile'],
	Morrumbala: ['Mopeia', 'Derre'],
	Nicoadala: ['Quelimane (Cidade)', 'Mopeia', 'Derre', 'Namacurra'],
	'Quelimane (Cidade)': ['Nicoadala', 'Inhassunge'],
	Namacurra: ['Nicoadala', 'Maganja da Costa', 'Mocuba'],
	Inhassunge: ['Quelimane (Cidade)', 'Chinde'],
	Chinde: ['Inhassunge', 'Luabo'],
	Luabo: ['Chinde', 'Mopeia'],
	Molumbo: ['Gurué', 'Milange'],
}

// graph of all districts in Central Zone and the fiscalization posts connected to them (excluding Zambézia and including Niassa)
export const centralZoneGraph: Graph = {
	// Niassa
	Chimbunila: [],
	Cuamba: [],
	Lago: [],
	Lichinga: [],
	Majune: [],
	Mandimba: [],
	Marrupa: [],
	Maúa: [],
	Mavago: [],
	Mecanhelas: [],
	Mecula: [],
	Metarica: [],
	Muembe: [],
	"N'gauma": [],
	Nipepe: [],
	Sanga: [],

	// Tete
	Angónia: [],
	'Cahora-Bassa': [],
	Changara: [],
	Chifunde: [],
	Chiuta: [],
	Dôa: [],
	Macanga: [],
	Magoé: [],
	Marara: [],
	Marávia: [],
	Moatize: [],
	Mutarara: [],
	'Tete (Cidade)': [],
	Tsangano: [],
	Zumbo: [],

	// Sofala
	Chibabava: ['Machanga', 'Machaze', 'Búzi'], // Manica (Susundenga)
	Machanga: ['Chibabava', 'Govuro'], // Inhambane
	Maringué: ['Caia', 'Memba', 'Gorongosa'],
	Chemba: ['Maringué', 'Caia', 'Mutarara'], // Zambézia
	Marromeu: ['Cheringoma', 'Caia'],
	Caia: ['Gorongosa', 'Maringué', 'Chemba', 'Marromeu', 'Mopeia'], // Zambézia
	Gorongosa: ['Cheringoma', 'Caia', 'Gondola', 'Maringué'], //Manica
	Cheringoma: ['Gorongosa', 'Muanza', 'Marromeu'],
	'Beira (Cidade)': ['Dondo'],
	Muanza: ['Dondo', 'Cheringoma'],
	Búzi: ['Nhamatanda', 'Chibabava'],
	Dondo: ['Nhamatanda', 'Beira (Cidade)', 'Muanza'],
	Nhamatanda: ['Dondo', 'Búzi'], //'Chibabava', 'Caia', 'Gondola'],

	// Manica
	Bárue: [],
	'Chimoio (Cidade)': [],
	Gondola: ['Gorongosa', 'Chibabava', 'Dondo', 'Mossurize'],
	Guro: [],
	Macate: [],
	Machaze: ['Mossurize', 'Chibabava'],
	Macossa: [],
	Manica: [],
	Mossurize: [],
	Sussundenga: [],
	Tambara: [],
	Vanduzi: [],
}

// graph of all districts in Southern Zone and the fiscalization posts connected to them
export const southernZoneGraph: Graph = {
	// Inhambane
	Funhalouro: ['Morrumbene', 'Mabote'], 
	Mabote: ['Inhassoro', 'Funhalouro', 'Mapai'], // confirm if mapai is linked to mabote...
	Morrumbene: ['Funhalouro', 'Maxixe', 'Massinga', 'Homoíne'], 
	Inhassoro: ['Mabote', 'Vilankulo', 'Govuro'], 
	Govuro: ['Machanga', 'Inhassoro'], 
	Homoíne: ['Maxixe', 'Panda', 'Morrumbene'], 
	Maxixe: ['Jangamo', 'Homoíne', 'Morrumbene', 'Inhambane (Cidade)'],
	Jangamo: ['Maxixe', 'Inhambane (Cidade)', 'Inharrime'],
	'Inhambane (Cidade)': ['Jangamo', 'Maxixe'],
	Inharrime: ['Jangamo', 'Zavala', 'Panda'], 
	Panda: ['Mandlakazi', 'Homoíne', 'Inharrime'], 
	Vilankulo: ['Massinga', 'Inhassoro'], 
	Massinga: ['Morrumbene', 'Vilankulo'], 
	Zavala: ['Inharrime', 'Mandlakazi'], 


	// Gaza
	Bilene: ['Chókwè', 'Limpopo', 'Magude'], //
	Chibuto: ['Limpopo', 'Guijá'],
	Chicualacuala: ['Mapai'],
	Chigubo: ['Guijá'],
	Chókwè: ['Bilene', 'Guijá', 'Mabalane', 'Massingir'],
	Limpopo: ['Bilene', 'Xai-Xai (Cidade)', 'Chibuto'],
	Mabalane: ['Mapai', 'Chókwè', 'Guijá'],
	Guijá: ['Chibuto', 'Chókwè', 'Chigubo', 'Mabalane'],
	Mapai: ['Chicualacuala', 'Massangena', 'Mabalane'],
	Massangena: ['Mapai'], // a district of manica has a limit with Massangena
	'Xai-Xai (Cidade)': ['Limpopo', 'Chongoene'], 
	Chongoene: ['Xai-Xai (Cidade)', 'Chibuto', 'Mandlakazi'], 
	Mandlakazi: ['Chibuto', 'Chongoene', 'Panda', 'Zavala'],
	Massingir: ['Chókwè'],


	

	



	// Maputo
	// Boane: [],
	Magude: ["Bilene"],
	// Manhiça: [],
	Marracuene: ['Bilene', 'Maputo'], // Nhonganhane; Portos de Maputo; Armazéns dos Exportadores
	// Matola: [],
	// Moamba: [],
	// Namaacha: [],
	// Matutuíne: [],
	Maputo: ['Marracuene'], // Portos de Maputo; Portos de Matola

	// KaMaxaquene: [],
	// KaMavota: [],
	// KaMubukwana: [],
	// KaMpfumo: [],
	// KaTembe: [],
	// KaNyaka: [],
	// Nlhamankulu: [],
}
