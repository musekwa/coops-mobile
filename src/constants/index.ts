import { GroupManagerPosition } from 'src/types'

// Type for position option
export interface GroupManagerPositionOption {
	label: string
	value: GroupManagerPosition
}

// Group manager positions with proper typing
export const groupManagerPositions: readonly GroupManagerPositionOption[] = [
	{ label: 'Presidente', value: GroupManagerPosition.PRESIDENT },
	{ label: 'Vice-Presidente', value: GroupManagerPosition.VICE_PRESIDENT },
	{ label: 'Secretário', value: GroupManagerPosition.SECRETARY },
	{ label: 'Promotor', value: GroupManagerPosition.PROMOTER },
] as const

export const tradingPurposes = [
	'Consumo Local',
	'Exportação',
	'Processamento Artesanal',
	'Processamento Industrial',
	'Compra e Venda',
]

export const staff = {
	president: 'Presidente',
	secretary: 'Secretário',
	treasurer: 'Tesoureiro',
	admin: 'Gestor',
	member: 'Membro',
}

export const userRoles = ['FIELD_AGENT', 'INSPECTOR', 'COOP_ADMIN', 'SUPERVISOR']

export const dateLimits = {
	maximumDate: new Date('2012-01-01'),
	minimumDate: new Date('1920-01-01'),
}

export const colors = {
	primary: '#008000',
	black: '#000000',
	lightblack: '#333333',
	lightestgray: '#9F9F9F',
	slate300: '#cbd5e1',
	white: '#FFFFFF',
	grey: '#C0C0C0',
	gray50: '#f9fafb',
	gray100: '#f3f4f6',
	gray600: '#A7A7AA',
	gray800: '#4B5563',
	gray808080: '#808080',
	gray900: '#141111',
	red: '#FF0000',
	warning: '#FFA500',
	warningText: '#713f12',
	warningBackground: '#fef9c3',
	danger: '#BE7A7AFF',
	dangerText: '#991b1b',
	dangerBackground: '#fee2e2',
	successText: '#1b991b',
	successBackground: '#dcfce7',
	infoBackground: '#e0e7ff',
	infoText: '#2563eb',
}

export const publicInstitutions = ['Escola Primária', 'Escola Secundária', 'Estabelecimento Prisional', 'Outra'].map(
	(institution) => ({
		label: institution,
		value: institution,
	}),
)

export const privateInstitutions = [
	'Escola Primária',
	'Escola Secundária',
	'Confissão Religiosa',
	'Organização Não Governamental (ONG)',
	'Empresa',
	'Outra',
].map((institution) => ({
	label: institution,
	value: institution,
}))
