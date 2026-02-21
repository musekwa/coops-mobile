import { getFormattedDateAndTime } from '../dates'
import { TransactionFlowType, UserRoles } from 'src/types'
import { appIconUri } from 'src/constants/imageURI'

const CATEGORY_CONFIG = [
	{ key: 'buyingPoints', label: 'Postos de Compra' },
	{ key: 'aggregationPoints', label: 'Armazéns de Trânsito' },
	{ key: 'destinationPoints', label: 'Armazéns de Destino' },
] as const

type WarehouseTransactionLike = {
	flow?: string
	quantity?: number | string
	price?: number | string
	unit_price?: number | string
}

type WarehouseLike = {
	description?: string
	transactions?: WarehouseTransactionLike[]
}

type WarehouseGroupByAdminPostType = {
	buyingPoints?: Record<string, WarehouseLike[]>
	aggregationPoints?: Record<string, WarehouseLike[]>
	destinationPoints?: Record<string, WarehouseLike[]>
}

type AdminPostMetrics = {
	name: string
	quantity: number
	warehouseCount: number
	weightedPrice: number
}

type CategorySummary = {
	label: string
	metrics: AdminPostMetrics[]
	totalQuantity: number
	totalValue: number
	weightedPrice: number
	totalWarehouses: number
}

type RegionSummary = {
	regionName: string
	categories: CategorySummary[]
	totalQuantity: number
}

type ReportUserInfo = {
	name: string
	province: string
	district: string
	roles: UserRoles[]
}

const roleLabels: Partial<Record<UserRoles, string>> = {
	[UserRoles.SUPERVISOR]: 'Supervisor',
	[UserRoles.FIELD_AGENT]: 'Extensionista',
	[UserRoles.INSPECTOR]: 'Fiscal',
	[UserRoles.COOP_ADMIN]: 'Promotor da Cooperativa',
}

const formatKilograms = (value: number) =>
	`${new Intl.NumberFormat('pt-PT', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(value)} kg`

const formatPrice = (value: number) => (value > 0 ? `${value.toFixed(2)} MZN/kg` : 'N/A')

const resolveUserRole = (roles: UserRoles[]) => {
	for (const role of roles) {
		const label = roleLabels[role]
		if (label) {
			return label
		}
	}
	return 'Usuário'
}

const sumBoughtTransactions = (transactions?: WarehouseTransactionLike[]) => {
	let quantity = 0
	let value = 0

	if (!transactions?.length) {
		return { quantity, value }
	}

	transactions.forEach((transaction) => {
		if (!transaction || transaction.flow !== TransactionFlowType.BOUGHT) {
			return
		}

		const transactionQuantity = Number(transaction.quantity ?? 0)
		if (!Number.isFinite(transactionQuantity) || transactionQuantity <= 0) {
			return
		}

		const transactionPrice = Number(transaction.price ?? transaction.unit_price ?? 0)
		quantity += transactionQuantity
		if (Number.isFinite(transactionPrice) && transactionPrice > 0) {
			value += transactionQuantity * transactionPrice
		}
	})

	return { quantity, value }
}

const aggregateCategory = (
	label: string,
	categoryMap: Record<string, WarehouseLike[]> | undefined,
): CategorySummary => {
	const metrics: AdminPostMetrics[] = []
	let totalQuantity = 0
	let totalValue = 0
	let totalWarehouses = 0

	Object.entries(categoryMap ?? {}).forEach(([adminPost, warehouses]) => {
		let adminQuantity = 0
		let adminValue = 0

		warehouses?.forEach((warehouse) => {
			const { quantity, value } = sumBoughtTransactions(warehouse?.transactions)
			adminQuantity += quantity
			adminValue += value
		})

		if (adminQuantity > 0) {
			metrics.push({
				name: adminPost,
				quantity: adminQuantity,
				warehouseCount: warehouses?.length ?? 0,
				weightedPrice: adminValue > 0 ? adminValue / adminQuantity : 0,
			})
		}

		totalQuantity += adminQuantity
		totalValue += adminValue
		totalWarehouses += warehouses?.length ?? 0
	})

	metrics.sort((a, b) => b.quantity - a.quantity)

	return {
		label,
		metrics,
		totalQuantity,
		totalValue,
		weightedPrice: totalQuantity > 0 ? totalValue / totalQuantity : 0,
		totalWarehouses,
	}
}

const composeCategories = (group: any | undefined): CategorySummary[] =>
	CATEGORY_CONFIG.map(({ key, label }) => aggregateCategory(label, (group as any)?.[key] ?? {}))

const renderReportHeader = (title: string, subtitle: string, userData: ReportUserInfo) => `
	<div style="text-align: center;">
		<img src=${appIconUri} style="width: 60px; height: 60px; border-radius: 100%; padding-bottom: 10px;" />
		<h3 style="font-size: 12px; font-family: Helvetica Neue; font-weight: bold; margin-top: -2px;">
			Instituto de Amêndoas de Moçambique, IP<br />(IAM, IP)
		</h3>
	</div>
	<div style="font-size: 12px; font-family: Helvetica Neue; font-weight: bold; text-align: center; padding: 10px 10px;">
		${title}
		<br /><br />
		<p style="font-size: 10px; font-family: Helvetica Neue; font-weight: normal; text-align: center;">
			${subtitle}
		</p>
	</div>
	<div style="font-size: 12px; font-family: Helvetica Neue; font-weight: normal; text-align: left; padding-bottom: 10px;">
		<p><strong>Província:</strong> ${userData.province}</p>
		<p><strong>Distrito:</strong> ${userData.district}</p>
	</div>
`

const renderReportFooter = (userData: ReportUserInfo) => `
	<div style="position: fixed; bottom: 20px; left: 20px; right: 20px;">
		<h3 style="font-size: 8px; font-family: Helvetica Neue; font-weight: normal; text-align: right;">
			Gerado por: <strong>${userData.name}</strong> (${resolveUserRole(userData.roles)}) aos ${getFormattedDateAndTime(new Date())}
		</h3>
	</div>
`

const renderEmptyState = (message: string) => `
	<div style="margin: 24px 0; padding: 16px; border-radius: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
		<p style="margin: 0; font-size: 12px; color: #475569; text-align: center;">${message}</p>
	</div>
`

const renderCategorySummary = (categories: CategorySummary[], highlightTitle?: string) => {
	const hasData = categories.some((category) => category.metrics.length > 0)
	if (!hasData) {
		return ''
	}

	const totalQuantity = categories.reduce((sum, category) => sum + category.totalQuantity, 0)

	const summaryCards = categories
		.map(
			(category) => `
				<div style="flex: 1; min-width: 200px; margin: 8px; padding: 16px; border-radius: 12px; background-color: #f1f5f9; border: 1px solid #e2e8f0;">
					<p style="margin: 0; font-size: 12px; font-weight: 600; color: #1e293b;">${category.label}</p>
					<h4 style="margin: 8px 0 4px; font-size: 18px; font-weight: 700; color: #0f172a;">${formatKilograms(
						category.totalQuantity,
					)}</h4>
					<p style="margin: 0; font-size: 11px; color: #334155;">Preço médio: <strong>${formatPrice(category.weightedPrice)}</strong></p>
					<p style="margin: 6px 0 0; font-size: 11px; color: #475569;">Armazéns ativos: ${category.totalWarehouses}</p>
				</div>
			`,
		)
		.join('')

	const topPerformers = categories
		.flatMap((category) =>
			category.metrics.map((metric) => ({
				name: metric.name,
				quantity: metric.quantity,
				weightedPrice: metric.weightedPrice,
				category: category.label,
			})),
		)
		.filter((metric) => metric.quantity > 0)
		.sort((a, b) => b.quantity - a.quantity)
		.slice(0, 5)

	const highlightSection = topPerformers.length
		? `
			<div style="margin-top: 16px;">
				<h4 style="margin: 0 0 8px; font-size: 12px; color: #1e293b;">${highlightTitle ?? 'Postos com maior volume'}:</h4>
				<table style="width: 100%; border-collapse: collapse; font-size: 11px;">
					<thead>
						<tr style="background-color: #f8fafc;">
							<th style="padding: 6px; text-align: left;">Posto Administrativo</th>
							<th style="padding: 6px; text-align: left;">Categoria</th>
							<th style="padding: 6px; text-align: right;">Quantidade</th>
							<th style="padding: 6px; text-align: right;">Preço Médio</th>
						</tr>
					</thead>
					<tbody>
						${topPerformers
							.map(
								(metric) => `
									<tr style="border-bottom: 1px solid #e2e8f0;">
										<td style="padding: 6px;">${metric.name}</td>
										<td style="padding: 6px;">${metric.category}</td>
										<td style="padding: 6px; text-align: right;">${formatKilograms(metric.quantity)}</td>
										<td style="padding: 6px; text-align: right;">${formatPrice(metric.weightedPrice)}</td>
									</tr>
								`,
							)
							.join('')}
					</tbody>
				</table>
			</div>
		`
		: ''

	return `
		<section style="margin: 24px 0;">
			<div style="display: flex; flex-wrap: wrap; margin: -8px;">${summaryCards}</div>
			<div style="margin-top: 12px; padding: 12px; border-radius: 10px; background-color: #e2e8f0; color: #0f172a;">
				<strong>Total reportado:</strong> ${formatKilograms(totalQuantity)}
			</div>
			${highlightSection}
		</section>
	`
}

const renderCategoryTable = (category: CategorySummary) => {
	if (!category.metrics.length) {
		return `
			<section style="margin: 24px 0;">
				<h3 style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">${category.label}</h3>
				${renderEmptyState('Nenhuma compra registada nesta categoria')}
			</section>
		`
	}

	const rows = category.metrics
		.map(
			(metric, index) => `
				<tr style="border-bottom: 1px solid #e2e8f0;">
					<td style="padding: 8px; text-align: center; color: #475569;">${index + 1}</td>
					<td style="padding: 8px; font-weight: 500; color: #0f172a;">${metric.name}</td>
					<td style="padding: 8px; text-align: right; color: #1e40af; font-weight: 600;">${formatKilograms(metric.quantity)}</td>
					<td style="padding: 8px; text-align: right; color: #0f172a;">${formatPrice(metric.weightedPrice)}</td>
					<td style="padding: 8px; text-align: center; color: #334155;">${metric.warehouseCount}</td>
				</tr>
			`,
		)
		.join('')

	return `
		<section style="margin: 24px 0;">
			<h3 style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">${category.label}</h3>
			<table style="width: 100%; border-collapse: collapse; font-size: 12px;">
				<thead>
					<tr style="background-color: #f1f5f9; color: #1e293b;">
						<th style="padding: 8px; text-align: center; width: 48px;">#</th>
						<th style="padding: 8px; text-align: left;">Posto Administrativo</th>
						<th style="padding: 8px; text-align: right;">Quantidade</th>
						<th style="padding: 8px; text-align: right;">Preço Médio</th>
						<th style="padding: 8px; text-align: center;">Armazéns</th>
					</tr>
				</thead>
				<tbody>${rows}</tbody>
			</table>
		</section>
	`
}

const generateRegionalSummaries = (regions: Record<string, any>): RegionSummary[] =>
	Object.entries(regions)
		.map(([regionName, group]) => {
			const categories = composeCategories(group)
			const totalQuantity = categories.reduce((sum, category) => sum + category.totalQuantity, 0)
			return {
				regionName,
				categories,
				totalQuantity,
			}
		})
		.filter((summary) => summary.categories.some((category) => category.metrics.length > 0))
		.sort((a, b) => b.totalQuantity - a.totalQuantity)

const renderRegionSection = (regionLabel: string, summary: RegionSummary) => {
	const categorySummary = renderCategorySummary(summary.categories, `Principais postos em ${summary.regionName}`)
	const categoryTables = summary.categories.map(renderCategoryTable).join('')

	return `
		<section style="margin: 32px 0; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
			<h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
				${regionLabel}: ${summary.regionName}
			</h2>
			${categorySummary}
			${categoryTables}
		</section>
	`
}

export const cashewBoughtByAdminPostsHTML = (
	warehousesByAdminPost: WarehouseGroupByAdminPostType,
	userData: ReportUserInfo,
) => {
	const categories = composeCategories(warehousesByAdminPost)
	const hasData = categories.some((category) => category.metrics.length > 0)

	return `
	<html>
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
			<style>
				@media print {
					body { margin: 20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
					@page { size: A4; margin: 20mm; }
					table { page-break-inside: avoid; }
					tr { page-break-inside: avoid; page-break-after: auto; }
				}
			</style>
		</head>
		<body style="margin-left: 20px; margin-right: 20px; margin-top: 40px; font-family: Helvetica Neue, Arial, sans-serif; color: #0f172a;">
			${renderReportHeader(
				'Relatório de Compras por Posto Administrativo',
				'Castanha comprada nos postos de compra e armazéns em cada Posto Administrativo',
				userData,
			)}
			${
				hasData
					? `${renderCategorySummary(categories)}${categories.map(renderCategoryTable).join('')}`
					: renderEmptyState('Não foram encontradas compras registadas para os postos administrativos deste distrito.')
			}
			${renderReportFooter(userData)}
		</body>
	</html>`
}

export const cashewBoughtByDistrictHTML = (
	warehousesByDistrict: Record<string, WarehouseGroupByAdminPostType>,
	userData: ReportUserInfo,
) => {
	const regionSummaries = generateRegionalSummaries(warehousesByDistrict)

	return `
	<html>
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
			<style>
				@media print {
					body { margin: 20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
					@page { size: A4; margin: 20mm; }
					table { page-break-inside: avoid; }
					tr { page-break-inside: avoid; page-break-after: auto; }
				}
			</style>
		</head>
		<body style="margin-left: 20px; margin-right: 20px; margin-top: 40px; font-family: Helvetica Neue, Arial, sans-serif; color: #0f172a;">
			${renderReportHeader(
				'Relatório de Compras por Distrito',
				'Comparativo do volume de castanha adquirida pelos postos de compra e armazéns por distrito',
				userData,
			)}
			${
				regionSummaries.length
					? regionSummaries.map((summary) => renderRegionSection('Distrito', summary)).join('')
					: renderEmptyState('Não foram encontrados distritos com compras registadas.')
			}
			${renderReportFooter(userData)}
		</body>
	</html>`
}

export const cashewBoughtByProvinceHTML = (
	warehousesByProvince: Record<string, WarehouseGroupByAdminPostType>,
	userData: ReportUserInfo,
) => {
	const regionSummaries = generateRegionalSummaries(warehousesByProvince)

	return `
	<html>
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
			<style>
				@media print {
					body { margin: 20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
					@page { size: A4; margin: 20mm; }
					table { page-break-inside: avoid; }
					tr { page-break-inside: avoid; page-break-after: auto; }
				}
			</style>
		</head>
		<body style="margin-left: 20px; margin-right: 20px; margin-top: 40px; font-family: Helvetica Neue, Arial, sans-serif; color: #0f172a;">
			${renderReportHeader(
				'Relatório de Compras por Província',
				'Distribuição do volume de castanha adquirida por província, com detalhe por posto administrativo',
				userData,
			)}
			${
				regionSummaries.length
					? regionSummaries.map((summary) => renderRegionSection('Província', summary)).join('')
					: renderEmptyState('Não foram encontradas províncias com compras registadas.')
			}
			${renderReportFooter(userData)}
		</body>
	</html>`
}
