import { appIconUri } from '../../constants/imageURI'
import { getFormattedDate } from 'src/helpers/dates'
import { UserRoles } from 'src/types'

export type ShipmentReportRow = {
	referenceDate: string
	shipmentNumber: string
	totalQuantityKg: number
	ownerName: string
	ownerTypeLabel: string
	ownerPhone: string
	originLabel: string
	destinationLabel: string
	statusLabel: string
	inspectionsSummary: string
	arrivalDate?: string
}

export type ReportUserData = {
	name: string
	district: string
	roles: UserRoles[]
}

const formatQuantity = (quantity: number) => new Intl.NumberFormat('pt-BR').format(Math.max(quantity || 0, 0))

const generateTableHTML = (data: ShipmentReportRow[]) => {
	let tableHTML = `<table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
            <th style="font-size: 8px;">Data</th>
            <th style="font-size: 8px;">Nº Guia</th>
            <th style="font-size: 8px;">Qtd. (Kg)</th>
            <th style="font-size: 8px;">Proprietário</th>
            <th style="font-size: 8px;">Contacto</th>
            <th style="font-size: 8px;">Origem</th>
            <th style="font-size: 8px;">Destino</th>
            <th style="font-size: 8px;">Estado</th>
            <th style="font-size: 8px;">Fiscalização</th>
            <th style="font-size: 8px;">Chegada</th>
        </tr>
      </thead>
      <tbody>`

	data.forEach((row) => {
		tableHTML += `<tr>
        <td style="font-size: 8px;">${row.referenceDate}</td>
        <td style="font-size: 8px;">${row.shipmentNumber}</td>
        <td style="font-size: 8px;">${formatQuantity(row.totalQuantityKg)}</td>
        <td style="font-size: 8px;">${row.ownerName} (${row.ownerTypeLabel})</td>
        <td style="font-size: 8px;">${row.ownerPhone}</td>
        <td style="font-size: 8px;">${row.originLabel}</td>
        <td style="font-size: 8px;">${row.destinationLabel}</td>
        <td style="font-size: 8px;">${row.statusLabel}</td>
        <td style="font-size: 8px;">${row.inspectionsSummary}</td>
        <td style="font-size: 8px;">${row.arrivalDate ?? 'N/A'}</td>
      </tr>`
	})

	tableHTML += `</tbody></table>`

	return tableHTML
}

export const biweeklyReportHTML = (
	data: ShipmentReportRow[],
	startDate: Date,
	endDate: Date,
	userData: ReportUserData,
) => {
	const formattedStartDate = getFormattedDate(startDate)
	const formattedEndDate = getFormattedDate(endDate)
	const userRole = userData.roles.includes(UserRoles.SUPERVISOR)
		? 'Supervisor'
		: userData.roles.includes(UserRoles.FIELD_AGENT)
			? 'Extensionista'
			: userData.roles.includes(UserRoles.INSPECTOR)
				? 'Fiscal'
				: userData.roles.includes(UserRoles.COOP_ADMIN)
					? 'Promotor da Cooperativa'
					: 'Usuário'

	return `<html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        </head>
        <body style="margin-left: 20px; margin-right: 20px; margin-top: 40px;">
        <div style="text-align: center;">
            <img
                src=${appIconUri}
                style="width: 60px; height: 60px; border-radius: 100%; padding-bottom: 10px;" 
            />
            <h3 style="font-size: 12px; font-family: Helvetica Neue; font-weight: bold; margin-top: -2px;">
                Instituto de Amêndoas de Moçambique, IP<br />(IAM, IP)
            </h3>
        </div>    
        <div style="font-size: 12px font-family: Helvetica Neue; font-weight: normal; text-align: center; padding-bottom: 10px;">
            Relatório Quinzenal de Comercialização
            <br />
            <strong>Período de ${formattedStartDate} a ${formattedEndDate}</strong>
        </div>
        ${generateTableHTML(data)}


        <div style="position: absolute; bottom: 20; left: 20;">
            <h3 style="font-size: 8px; font-family: Helvetica Neue; font-weight: normal;text-align: right; ">Gerado por: <strong>${userData.name}</strong> (${userRole} em ${userData.district})</h3>
        </div>
        </body>
        </html>`
}
