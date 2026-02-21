import { UserDataType } from 'src/store/user'
import { getFormattedDateAndTime } from '../dates'
import { OrgsByAdminPostType, TradersByAdminPostType, TransactionFlowType, UserRoles } from 'src/types'
import { OrganizationTransaction } from 'src/models/organizationTransaction'
import { Transaction } from 'src/models/embeddable'
import { ActorOrganization } from 'src/models/actorOrganization'
import { appIconUri } from 'src/constants/imageURI'

export const cashewTradersByAdminPostsHTML = (tradersByAdminPost: TradersByAdminPostType, userData: UserDataType) => {
    const userRole = userData.roles.includes(UserRoles.SUPERVISOR)
    ? 'Supervisor'
    : userData.roles.includes(UserRoles.FIELD_AGENT)
        ? 'Extensionista'
        : userData.roles.includes(UserRoles.INSPECTOR)
            ? 'Fiscal'
            : userData.roles.includes(UserRoles.COOP_ADMIN)
                ? 'Gestor da Cooperativa'
                : 'Usuário'

    const { primaries, secondaries, finals } = tradersByAdminPost

    // Create table for primaries
    const primariesTable = Object.entries(primaries).map(([adminPost, traders]) => {
        const tradersData = traders.map(trader => {
            // Calculate total bought quantity for this trader
            const totalBought = trader.warehouses.reduce((sum, warehouse) => {
                const boughtTransactions = warehouse.transactions.filter(
                    (t: Transaction) => t.flow === TransactionFlowType.BOUGHT
                )
                const warehouseTotal = boughtTransactions.reduce(
                    (acc, t: Transaction) => acc + (t.quantity || 0),
                    0
                )
                return sum + warehouseTotal
            }, 0)

            return `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px; text-align: left;">${adminPost}</td>
                    <td style="padding: 8px; text-align: left;">${trader.name}</td>
                    <td style="padding: 8px; text-align: right;">${totalBought.toLocaleString('pt-PT')} kg</td>
                </tr>
            `
        }).join('')

        return tradersData
    }).join('')

    // Create table for secondaries
    const secondariesTable = Object.entries(secondaries).map(([adminPost, traders]) => {
        const tradersData = traders.map(trader => {
            const totalBought = trader.warehouses.reduce((sum, warehouse) => {
                const boughtTransactions = warehouse.transactions.filter(
                    (t: Transaction) => t.flow === TransactionFlowType.BOUGHT
                )
                const warehouseTotal = boughtTransactions.reduce(
                    (acc, t: Transaction) => acc + (t.quantity || 0),
                    0
                )
                return sum + warehouseTotal
            }, 0)

            return `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px; text-align: left;">${adminPost}</td>
                    <td style="padding: 8px; text-align: left;">${trader.name}</td>
                    <td style="padding: 8px; text-align: right;">${totalBought.toLocaleString('pt-PT')} kg</td>
                </tr>
            `
        }).join('')

        return tradersData
    }).join('')

    // Create table for finals
    const finalsTable = Object.entries(finals).map(([adminPost, traders]) => {
        const tradersData = traders.map(trader => {
            const totalBought = trader.warehouses.reduce((sum, warehouse) => {
                const boughtTransactions = warehouse.transactions.filter(
                    (t: Transaction) => t.flow === TransactionFlowType.BOUGHT
                )
                const warehouseTotal = boughtTransactions.reduce(
                    (acc, t: Transaction) => acc + (t.quantity || 0),
                    0
                )
                return sum + warehouseTotal
            }, 0)

            return `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px; text-align: left;">${adminPost}</td>
                    <td style="padding: 8px; text-align: left;">${trader.name}</td>
                    <td style="padding: 8px; text-align: right;">${totalBought.toLocaleString('pt-PT')} kg</td>
                </tr>
            `
        }).join('')

        return tradersData
    }).join('')

    return `<html>
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
			<style>
				@media print {
					body {
						margin: 20px;
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
					}
					
					@page {
						size: A4;
						margin: 20mm;
					}
					
					table {
						page-break-inside: avoid;
					}
					
					tr {
						page-break-inside: avoid;
						page-break-after: auto;
					}
				}
			</style>
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
		<div style="font-size: 12px; font-family: Helvetica Neue; font-weight: bold; text-align: center; padding: 10px 10px;">
			Relatório de Supervisão Distrital
			<br />
			<br />
			<p style="font-size: 10px; font-family: Helvetica Neue; font-weight: normal; text-align: center;">
				Castanha comprada por comerciantes em cada Posto Administrativo
			</p>
		</div>
        <div style="font-size: 12px; font-family: Helvetica Neue; font-weight: normal; text-align: left; padding-bottom: 10px;">
            <p><strong>Província:</strong>  ${userData.province}</p>
            <p><strong>Distrito:</strong>   ${userData.district}</p>   
		</div>

		<div style="margin-bottom: 20px;">
            <div style="font-size: 12px; font-family: Helvetica Neue; font-weight: bold; margin-top: 20px;">
                Comerciantes Primários
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: Helvetica Neue;">
                <thead>
                    <tr style="border-bottom: 2px solid #ddd; background-color: #f8f9fa;">
                        <th style="padding: 8px; text-align: left;">Posto Administrativo</th>
                        <th style="padding: 8px; text-align: left;">Comerciantes</th>
                        <th style="padding: 8px; text-align: right;">Quantidade Comprada</th>
                    </tr>
                </thead>
                <tbody>
                    ${primariesTable}
                </tbody>
            </table>
        </div>

        <div style="margin-bottom: 20px;">
            <div style="font-size: 12px; font-family: Helvetica Neue; font-weight: bold; margin-top: 20px;">
                Comerciantes Secundários
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: Helvetica Neue;">
                <thead>
                    <tr style="border-bottom: 2px solid #ddd; background-color: #f8f9fa;">
                        <th style="padding: 8px; text-align: left;">Posto Administrativo</th>
                        <th style="padding: 8px; text-align: left;">Comerciantes</th>
                        <th style="padding: 8px; text-align: right;">Quantidade Comprada</th>
                    </tr>
                </thead>
                <tbody>
                    ${secondariesTable}
                </tbody>
            </table>
        </div>

        <div style="margin-bottom: 20px;">
            <div style="font-size: 12px; font-family: Helvetica Neue; font-weight: bold; margin-top: 20px;">
                Comerciantes Finais
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: Helvetica Neue;">
                <thead>
                    <tr style="border-bottom: 2px solid #ddd; background-color: #f8f9fa;">
                        <th style="padding: 8px; text-align: left;">Posto Administrativo</th>
                        <th style="padding: 8px; text-align: left;">Comerciantes</th>
                        <th style="padding: 8px; text-align: right;">Quantidade Comprada</th>
                    </tr>
                </thead>
                <tbody>
                    ${finalsTable}
                </tbody>
            </table>
        </div>

		<div style="position: fixed; bottom: 20px; left: 20px; right: 20px;">
			<h3 style="font-size: 8px; font-family: Helvetica Neue; font-weight: normal; text-align: right;">
				Gerado por: <strong>${userData.name}</strong> (${userRole}) aos ${getFormattedDateAndTime(new Date())}
			</h3>
		</div>
		</body>
		</html>`

}
