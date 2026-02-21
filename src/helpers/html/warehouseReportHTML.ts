import { TransactionForReportType } from "src/features/trades/data/types"
import { getFormattedDate } from "../dates"
import { TransactionFlowType, UserRoles, WarehouseDetailsType } from "src/types"
import { appIconUri } from "src/constants/imageURI"
import { translateTransactionFlowToPortuguese } from "../helpersToTrades"


export const warehouseReportHTML = (transactions: TransactionForReportType[], 
	storeDetails: {
		id: string
		description: string
		owner_id: string
		address_id: string
		warehouse_type: string
	} | null,
	startDate: Date, endDate: Date, userData: {
	name: string
	role: string
	district: string
}) => {
    // const warehouseType = warehouseDetails.warehouseName === CashewWarehouseType.AGGREGATION ? 'Armazém de agregação' : warehouseDetails.warehouseName === CashewWarehouseType.BUYING ? 'Posto de compra' : 'Armazém de Destino'
	const formattedStartDate = getFormattedDate(startDate)
	const formattedEndDate = getFormattedDate(endDate)
	const userRole = userData.role.includes(UserRoles.SUPERVISOR)
		? 'Supervisor'
		: userData.role.includes(UserRoles.FIELD_AGENT)
			? 'Extensionista'
			: userData.role.includes(UserRoles.INSPECTOR)
				? 'Fiscal'
				: userData.role.includes(UserRoles.COOP_ADMIN)
					? 'Promotor da Cooperativa'
					: 'Usuário'

		const address = ''

    const ownerInfo = `
        <div style="display: flex; flex-direction: row; align-items: center; gap: 20px; margin-top: 20px;">
            <div>
                <p style="font-size: 12px; font-family: Helvetica Neue; margin: 0;">
                    <strong>Proprietário:</strong> ${"N/A"}
                </p>
                <p style="font-size: 12px; font-family: Helvetica Neue; margin: 0;">
                    <strong>Endereço:</strong> ${address}
                </p>
            </div>
        </div>
    `

	const transactionTable = `
		<table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; font-family: Helvetica Neue;">
			<thead>
				<tr style="background-color: #f2f2f2;">
					<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Início</th>
					<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Fim</th>
					<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Transacção</th>
					<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantidade (kg)</th>
					<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Preço (MZN)</th>
					<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Técnico</th>
				</tr>
			</thead>
			<tbody>
				${transactions.map(transaction => `
					<tr>
						<td style="border: 1px solid #ddd; padding: 8px;">${getFormattedDate(new Date(transaction.start_date))}</td>
						<td style="border: 1px solid #ddd; padding: 8px;">${getFormattedDate(new Date(transaction.end_date))}</td>
						<td style="border: 1px solid #ddd; padding: 8px;">${translateTransactionFlowToPortuguese(transaction.transaction_type as TransactionFlowType)}</td>
						<td style="border: 1px solid #ddd; padding: 8px;">${Intl.NumberFormat('pt-BR').format(transaction.quantity)}</td>
						<td style="border: 1px solid #ddd; padding: 8px;">${transaction.transaction_type === TransactionFlowType.BOUGHT || transaction.transaction_type === TransactionFlowType.SOLD ? transaction.unit_price : '-'}</td>
						<td style="border: 1px solid #ddd; padding: 8px;">${transaction.created_by}</td>
					</tr>
				`).join('')}
			</tbody>
		</table>
	`

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
			Relatório das Transacções de ${"N/A"}
			<br />
			<strong>Período de ${formattedStartDate} a ${formattedEndDate}</strong>
		</div>

		<div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-family: Helvetica Neue;">
			<div>
				${ownerInfo}
			</div>
		</div>

		${transactionTable}

		<div style="position: absolute; bottom: 20; left: 20;">
			<h3 style="font-size: 8px; font-family: Helvetica Neue; font-weight: normal;text-align: right; ">Gerado por: <strong>${userData.name}</strong> (${userRole} em ${userData.district})</h3>
		</div>
		</body>
		</html>`
}


