import { UserDataType } from 'src/store/user'
import { getFormattedDateAndTime } from '../dates'
import { ShipmentStatus, UserRoles } from 'src/types'
import { appIconUri } from 'src/constants/imageURI'
import { Shipment } from 'src/models/shipment'
import { ShipmentStatusTypes } from 'src/constants/tracking'

export const cashewShipmentsByStatusHTML = (
	shipmentsByStatus: {
		[key in ShipmentStatus]: Shipment[]
	},
	userData: UserDataType,
) => {
	const { ARRIVING, DEPARTING, TRANSITING } = shipmentsByStatus

	const userRole = userData.roles.find(role => 
		({
			[UserRoles.SUPERVISOR]: 'Supervisor',
			[UserRoles.FIELD_AGENT]: 'Extensionista',
			[UserRoles.INSPECTOR]: 'Fiscal',
			[UserRoles.COOP_ADMIN]: 'Gestor da Cooperativa'
		})[role]
	) ?? 'Usuário'

	const renderShipmentRows = (shipments: Shipment[]) => shipments.map(shipment => {
		const check = shipment.checks.find(c => c.stage === ShipmentStatusTypes.AT_ARRIVAL);
		const arrivalDate = check?.checkedAt 
			? new Date(check.checkedAt).toLocaleDateString('pt-PT')
			: 'Não confirmada';
		const issuedDate = new Date(shipment.transitLicense.issuedAt).toLocaleDateString('pt-PT');
		
		return `
			<tr style="border-bottom: 1px solid #ddd;">
				<td style="padding: 8px; text-align: left;">${shipment.owner.name}</td>
				<td style="padding: 8px; text-align: left;">${shipment.transitLicense.issuedIn}</td>
				<td style="padding: 8px; text-align: left;">${shipment.destination}</td>
				<td style="padding: 8px; text-align: left;">${shipment.checks.map(c => c.point).join(', ')}</td>
				<td style="padding: 8px; text-align: right;">${shipment.transporters[0]?.quantity?.toLocaleString('pt-PT')} kg</td>
				<td style="padding: 8px; text-align: left;">${issuedDate}</td>
				<td style="padding: 8px; text-align: left;">${arrivalDate}</td>
			</tr>
		`;
	}).join('');

	const renderTable = (title: string, shipments: Shipment[]) => `
		<div style="margin-bottom: 20px;">
			<p style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">${title}</p>
			<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
				<thead>
					<tr style="background-color: #f2f2f2;">
						<th style="padding: 8px; text-align: left;">Proprietário</th>
						<th style="padding: 8px; text-align: left;">Partida</th>
						<th style="padding: 8px; text-align: left;">Destino</th>
						<th style="padding: 8px; text-align: left;">Pontos de Fiscalização</th>
						<th style="padding: 8px; text-align: right;">Quantidade</th>
						<th style="padding: 8px; text-align: left;">Data de Partida</th>
						<th style="padding: 8px; text-align: left;">Data de Chegada</th>
					</tr>
				</thead>
				<tbody>
					${renderShipmentRows(shipments)}
				</tbody>
			</table>
		</div>
	`;

	return `<html>
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
		<body style="margin-left: 20px; margin-right: 20px; margin-top: 40px;">
			<div style="text-align: center;">
				<img src=${appIconUri} style="width: 60px; height: 60px; border-radius: 100%; padding-bottom: 10px;" />
				<h3 style="font-size: 12px; font-family: Helvetica Neue; font-weight: bold; margin-top: -2px;">
					Instituto de Amêndoas de Moçambique, IP<br />(IAM, IP)
				</h3>
			</div>    
			<div style="font-size: 12px; font-family: Helvetica Neue; font-weight: bold; text-align: center; padding: 10px 10px;">
				Relatório de Supervisão Distrital
				<br /><br />
				<p style="font-size: 10px; font-family: Helvetica Neue; font-weight: normal; text-align: center;">
					Castanha recebida, transferida e transitada no distrito de ${userData.district}
				</p>
			</div>
			<div style="font-size: 12px; font-family: Helvetica Neue; font-weight: normal; text-align: left; padding-bottom: 10px;">
				<p><strong>Província:</strong> ${userData.province}</p>
				<p><strong>Distrito:</strong> ${userData.district}</p>   
			</div>

			${renderTable('Castanha recebida', ARRIVING)}
			${renderTable('Castanha transitada', TRANSITING)}
			${renderTable('Castanha transferida', DEPARTING)}

			<div style="position: fixed; bottom: 20px; left: 20px; right: 20px;">
				<h3 style="font-size: 8px; font-family: Helvetica Neue; font-weight: normal; text-align: right;">
					Gerado por: <strong>${userData.name}</strong> (${userRole}) aos ${getFormattedDateAndTime(new Date())}
				</h3>
			</div>
		</body>
	</html>`;
}
