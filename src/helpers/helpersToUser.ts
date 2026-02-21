import { Metric } from 'src/models/embeddable'
import { MetricName, UserRoles } from 'src/types'
import { match } from 'ts-pattern'

export const metricsList =  [
	{
		name: MetricName.FARMERS_REGISTERED,
		value: 0,
		target: 0,
	},
	{
		name: MetricName.TRADERS_REGISTERED,
		value: 0,
		target: 0,
	},
	{
		name: MetricName.BUYING_POSTS_REGISTERED,
		value: 0,
		target: 0,
	},
	{
		name: MetricName.WAREHOUSES_REGISTERED,
		value: 0,
		target: 0,
	},
	{
		name: MetricName.ASSOCIATIONS_REGISTERED,
		value: 0,
		target: 0,
	},
	{
		name: MetricName.COOPERATIVES_REGISTERED,
		value: 0,
		target: 0,
	},
	{
		name: MetricName.COOP_UNIONS_REGISTERED,
		value: 0,
		target: 0,
	},
	{
		name: MetricName.MONITORING_TO_BUYING_POSTS,
		value: 0,
		target: 0,
	},
	{
		name: MetricName.MONITORING_TO_WAREHOUSES,
		value: 0,
		target: 0,
	},
	{
		name: MetricName.MONITORING_TO_ASSOCIATIONS,
		value: 0,
		target: 0,
	},
	{
		name: MetricName.MONITORING_TO_COOPERATIVES,
		value: 0,
		target: 0,
	},
	{
		name: MetricName.MONITORING_TO_COOP_UNIONS,
		value: 0,
		target: 0,
	},
	{
		name: MetricName.TRANSITING_CASHEWS_INSPECTED,
		value: 0,
		target: 0,
	},
] as Metric[]

// Helper function to find a specific metric by name in the metrics array
export const findMetricByName = (metrics: Metric[], metricName: MetricName) => {
	return metrics.find((metric) => metric.name === metricName)
}

// export const metricTranslations: Record<MetricName, string> = {
// 	FARMERS_REGISTERED: 'Produtores registados',
// 	TRADERS_REGISTERED: 'Comerciantes registados',
// 	ASSOCIATIONS_REGISTERED: 'Associações registadas',
// 	COOPERATIVES_REGISTERED: 'Cooperativas registadas',
// 	COOP_UNIONS_REGISTERED: 'Uniões registadas',
// 	WAREHOUSES_REGISTERED: 'Armazens registados',
// 	BUYING_POSTS_REGISTERED: 'Postos de compra registados',
// 	TRANSITING_CASHEWS_INSPECTED: 'Monitorias de trânsito',
// 	MONITORING_TO_BUYING_POSTS: 'Monitorias nos postos de compra',
// 	MONITORING_TO_WAREHOUSES: 'Monitorias nos armazéns',
// 	MONITORING_TO_ASSOCIATIONS: 'Monitorias nas associações',
// 	MONITORING_TO_COOPERATIVES: 'Monitorias nas cooperativas',
// 	MONITORING_TO_COOP_UNIONS: 'Monotorias nas uniões',
// }

// export const translateMetricName = (metricName: MetricName): string => {
// 	return metricTranslations[metricName] || metricName
// }

export const getUserRole = (userRole: UserRoles) => {
	return match(userRole)
		.with(UserRoles.COOP_ADMIN, () => 'Gestor de Cooperativa')
		.with(UserRoles.FIELD_AGENT, () => 'Extensionista')
		.with(UserRoles.INSPECTOR, () => 'Fiscal')
		.with(UserRoles.SUPERVISOR, () => 'Supervisor')
		.otherwise(() => 'Usuário')
}

export const getPerformanceIndicatorsPlaceholdersByRole = (role: UserRoles) => {
	return match(role)
		.with(UserRoles.FIELD_AGENT, () => metricsList)
		.with(UserRoles.INSPECTOR, () => metricsList)
		.with(UserRoles.SUPERVISOR, () => metricsList)
		.with(UserRoles.COOP_ADMIN, () => metricsList)
		.otherwise(() => metricsList)
}
