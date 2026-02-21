import { getFormattedDateAndTime } from 'src/helpers/dates'
import { appIconUri } from 'src/constants/imageURI'
import { UserRoles } from 'src/types'

export type ReportUserInfo = {
	name: string
	province: string
	district: string
	roles: UserRoles[]
}

export type TransferSummary = {
	regionName: string
	transferIn: number
	transferOut: number
}

export type ProcessingExportSummary = {
	provinceName: string
	processed: number
	exported: number
}

const resolveRoleLabel = (roles: UserRoles[]) => {
	if (!roles?.length) return 'Usuário'
	return (
		roles
			.filter(Boolean)
			.map((role) =>
				role
					.replace(/_/g, ' ')
					.toLowerCase()
					.replace(/(^|\s)\S/g, (match) => match.toUpperCase()),
			)
			.join(', ') || 'Usuário'
	)
}

const formatKilograms = (value: number) =>
	`${new Intl.NumberFormat('pt-PT', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(value)} kg`

const renderHeader = (title: string, subtitle: string, userInfo: ReportUserInfo) => `
	<div style="text-align: center;">
		<img src="${appIconUri}" style="width: 60px; height: 60px; border-radius: 100%; padding-bottom: 10px;" />
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
	<div style="font-size: 11px; font-family: Helvetica Neue; font-weight: normal; text-align: left; padding-bottom: 10px; line-height: 1.4;">
		<p><strong>Província:</strong> ${userInfo.province}</p>
		<p><strong>Distrito:</strong> ${userInfo.district}</p>
		<p><strong>Gerado por:</strong> ${userInfo.name} (${resolveRoleLabel(userInfo.roles)})</p>
		<p><strong>Data:</strong> ${getFormattedDateAndTime(new Date())}</p>
	</div>
`

const renderEmptyState = (message: string) => `
	<div style="margin: 24px 0; padding: 16px; border-radius: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
		<p style="margin: 0; font-size: 12px; color: #475569; text-align: center;">${message}</p>
	</div>
`

export const cashewTransfersFlowHTML = (
	params: {
		district?: TransferSummary | null
		provinceBreakdown: TransferSummary[]
	},
	userInfo: ReportUserInfo,
) => {
	const hasDistrictData = !!params.district && (params.district.transferIn > 0 || params.district.transferOut > 0)
	const hasProvinceRows = params.provinceBreakdown.some((row) => row.transferIn > 0 || row.transferOut > 0)

	const districtSection = hasDistrictData
		? `
			<section style="margin: 24px 0;">
				<h3 style="font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">Fluxo no Distrito</h3>
				<div style="display: flex; gap: 12px; flex-wrap: wrap;">
					<div style="flex: 1; min-width: 220px; padding: 16px; border-radius: 12px; background-color: #ecfdf5; border: 1px solid #d1fae5;">
						<p style="margin: 0; font-size: 12px; font-weight: 600; color: #047857;">Entradas (Transferido para o distrito)</p>
						<h4 style="margin: 8px 0 0; font-size: 18px; font-weight: 700; color: #065f46;">${formatKilograms(
							params.district?.transferIn ?? 0,
						)}</h4>
					</div>
					<div style="flex: 1; min-width: 220px; padding: 16px; border-radius: 12px; background-color: #fef2f2; border: 1px solid #fee2e2;">
						<p style="margin: 0; font-size: 12px; font-weight: 600; color: #b91c1c;">Saídas (Transferido para fora)</p>
						<h4 style="margin: 8px 0 0; font-size: 18px; font-weight: 700; color: #991b1b;">${formatKilograms(
							params.district?.transferOut ?? 0,
						)}</h4>
					</div>
				</div>
			</section>
		`
		: ''

	const provinceTable = hasProvinceRows
		? `
			<section style="margin: 32px 0;">
				<h3 style="font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">Resumo por Distrito da Província</h3>
				<table style="width: 100%; border-collapse: collapse; font-size: 12px;">
					<thead style="background-color: #f1f5f9; color: #1e293b;">
						<tr>
							<th style="padding: 8px; text-align: left;">Distrito</th>
							<th style="padding: 8px; text-align: right;">Transferido para o distrito</th>
							<th style="padding: 8px; text-align: right;">Transferido para fora</th>
							<th style="padding: 8px; text-align: right;">Saldo líquido</th>
						</tr>
					</thead>
					<tbody>
						${params.provinceBreakdown
							.map((row) => {
								const net = (row.transferIn ?? 0) - (row.transferOut ?? 0)
								return `
									<tr style="border-bottom: 1px solid #e2e8f0;">
										<td style="padding: 8px; color: #0f172a;">${row.regionName}</td>
										<td style="padding: 8px; text-align: right; color: #0369a1; font-weight: 600;">${formatKilograms(
											row.transferIn ?? 0,
										)}</td>
										<td style="padding: 8px; text-align: right; color: #b91c1c; font-weight: 600;">${formatKilograms(
											row.transferOut ?? 0,
										)}</td>
										<td style="padding: 8px; text-align: right; color: ${net >= 0 ? '#047857' : '#b91c1c'}; font-weight: 600;">${formatKilograms(
											net,
										)}</td>
									</tr>
								`
							})
							.join('')}
					</tbody>
				</table>
			</section>
		`
		: ''

	const hasContent = districtSection || provinceTable

	return `
	<html>
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
			<style>
				@media print {
					body { margin: 20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
					@page { size: A4; margin: 20mm; }
					section { page-break-inside: avoid; }
				}
			</style>
		</head>
		<body style="margin: 32px 20px 40px; font-family: Helvetica Neue, Arial, sans-serif; color: #0f172a;">
			${renderHeader(
				'Fluxo de Transferências de Caju',
				'Comparação entre o volume transferido para o distrito e distribuído para fora da província.',
				userInfo,
			)}
			${hasContent ? `${districtSection}${provinceTable}` : renderEmptyState('Não foram encontradas transferências de caju para o distrito e província selecionados.')}
		</body>
	</html>
	`
}

export const cashewProcessingVsExportHTML = (rows: ProcessingExportSummary[], userInfo: ReportUserInfo) => {
	const hasRows = rows.some((row) => row.processed > 0 || row.exported > 0)
	const totalProcessed = rows.reduce((sum, row) => sum + (row.processed ?? 0), 0)
	const totalExported = rows.reduce((sum, row) => sum + (row.exported ?? 0), 0)

	const cards = `
		<div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px;">
			<div style="flex: 1; min-width: 220px; padding: 16px; border-radius: 12px; background-color: #eef2ff; border: 1px solid #e0e7ff;">
				<p style="margin: 0; font-size: 12px; font-weight: 600; color: #4338ca;">Processamento a nível nacional</p>
				<h4 style="margin: 8px 0 0; font-size: 18px; font-weight: 700; color: #312e81;">${formatKilograms(totalProcessed)}</h4>
			</div>
			<div style="flex: 1; min-width: 220px; padding: 16px; border-radius: 12px; background-color: #fef3c7; border: 1px solid #fde68a;">
				<p style="margin: 0; font-size: 12px; font-weight: 600; color: #b45309;">Exportação a nível nacional</p>
				<h4 style="margin: 8px 0 0; font-size: 18px; font-weight: 700; color: #92400e;">${formatKilograms(totalExported)}</h4>
			</div>
		</div>
	`

	const table = hasRows
		? `
			<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 24px;">
				<thead style="background-color: #f1f5f9; color: #1e293b;">
					<tr>
						<th style="padding: 8px; text-align: left;">Província</th>
						<th style="padding: 8px; text-align: right;">Processado</th>
						<th style="padding: 8px; text-align: right;">Exportado</th>
						<th style="padding: 8px; text-align: right;">Diferença</th>
					</tr>
				</thead>
				<tbody>
					${rows
						.map((row) => {
							const diff = (row.processed ?? 0) - (row.exported ?? 0)
							return `
								<tr style="border-bottom: 1px solid #e2e8f0;">
									<td style="padding: 8px; color: #0f172a;">${row.provinceName}</td>
									<td style="padding: 8px; text-align: right; color: #4338ca; font-weight: 600;">${formatKilograms(
										row.processed ?? 0,
									)}</td>
									<td style="padding: 8px; text-align: right; color: #b45309; font-weight: 600;">${formatKilograms(
										row.exported ?? 0,
									)}</td>
									<td style="padding: 8px; text-align: right; color: ${diff >= 0 ? '#047857' : '#b91c1c'}; font-weight: 600;">${formatKilograms(
										diff,
									)}</td>
								</tr>
							`
						})
						.join('')}
				</tbody>
			</table>
		`
		: ''

	return `
	<html>
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
			<style>
				@media print {
					body { margin: 20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
					@page { size: A4; margin: 20mm; }
					table { page-break-inside: avoid; }
				}
			</style>
		</head>
		<body style="margin: 32px 20px 40px; font-family: Helvetica Neue, Arial, sans-serif; color: #0f172a;">
			${renderHeader(
				'Processamento vs Exportação de Caju',
				'Comparação do volume destinado ao processamento e à exportação em todas as províncias.',
				userInfo,
			)}
			${hasRows ? `${cards}${table}` : renderEmptyState('Não foram encontrados registos de processamento ou exportação de caju.')}
		</body>
	</html>
	`
}
