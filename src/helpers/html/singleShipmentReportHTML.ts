import { appIconUri, avatarPlaceholderUri } from 'src/constants/imageURI'
import { marchandisesTypes, measurementUnits } from 'src/constants/tracking'
import { translateShipmentStage } from '../shipmentStatus'
import { ShipmentWithOwnerData } from 'src/features/formal-shipment/shipment-inspection/types'
import { ShipmentLoadRecordType } from 'src/library/powersync/schemas/shipment_loads'

const generateTableHTML = (shipment: ShipmentWithOwnerData) => {
	let tableHTML = `<table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
            <th style="font-size: 8px;">Marca</th>
            <th style="font-size: 8px;">Matrícula</th>
            <th style="font-size: 8px;">Motorista</th>
            <th style="font-size: 8px;">Telefone</th>
            <th style="font-size: 8px;">Tem trailer?</th>
            <th style="font-size: 8px;">Locais de Fiscalização</th>
            <th style="font-size: 8px;">Data Chegada</th>
        </tr>
      </thead>
      <tbody>`
	const phone = shipment.owner_phone ? shipment.owner_phone : 'N/A'
	const hasTrailer = shipment.transporters.length > 1 ? 'Sim' : 'Não'
    const status = translateShipmentStage(shipment.status) || 'Pendente';

	tableHTML += `<tr>
        <td style="font-size: 8px; text-align: center;">${shipment.transporters[0].brand}</td>
        <td style="font-size: 8px; text-align: center;">${shipment.transporters[0].plate}</td>
        <td style="font-size: 8px; text-align: center;">${shipment.transporters[0].driver}</td>
        <td style="font-size: 8px; text-align: center;">${phone}</td>
        <td style="font-size: 8px; text-align: center;">${hasTrailer}</td>
        <td style="font-size: 8px; text-align: center;">${status}</td>
      </tr>`

	tableHTML += `</tbody></table>`

	return tableHTML
}

export const singleShipmentReportHTML = (owner: ShipmentWithOwnerData, shipment: ShipmentWithOwnerData) => {
	const photo = owner?.photo ? owner?.photo : avatarPlaceholderUri
  
	const addressProvince = owner?.province ? owner?.province : 'N/A'
	const addressDistrict = owner?.district ? owner?.district : 'N/A'
	const addressAdminPost = owner?.adminPost ? owner?.adminPost : 'N/A'
	const phoneNumber = shipment.owner_phone ? shipment.owner_phone : 'N/A'
    const ownerName = shipment.owner.name.toLowerCase().includes('company') ? `${shipment.owner.name.slice(0, -8)} (empresa)` : `${shipment.owner.name}`

	const quantity = new Intl.NumberFormat('pt-BR').format(shipment.shipmentLoads.reduce((acc: number, load: ShipmentLoadRecordType) => acc + (load.quantity || 0), 0))

	const label =
		shipment.product_type === marchandisesTypes.CASHEW_KERNEL ? 'Amêndoa de caju' : 'Castanha de caju'
	const issueDate = new Date(shipment.created_at).toLocaleDateString('pt-BR')
	const purpose = shipment.purpose

	return `
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    </head>
    <body style="margin-left: 20px; margin-right: 20px; margin-top: 40px;">
    <div style="text-align: center;">
        <img
            src=${appIconUri}
            style="width: 90px; height: 90px; border-radius: 100%; padding-bottom: 10px;" 
        />
        <h1 style="font-size: 16px; font-family: Helvetica Neue; font-weight: bold; margin-top: -2px;">
            Instituto de Amêndoas de Moçambique, IP<br />(IAM, IP)
        </h1>
    </div>
    <div style="text-align: center;">

    </div>

    <div style="text-align: center;">
        <h2 style="font-size: 20px font-family: Helvetica Neue; font-weight: normal;">Comprovativo de Registo da Mercadoria</h2>
    </div>
    <div style="display: flex; flex-direction: row; gap: 20px;">
        <div style="border-color: #000; border-width: 1px">
            <img 
                src=${photo}
                style="width: 150px; height: 150px;" 
            />
        </div>
        <div style="min-width: 150px;">
            <h3 style="font-size: 18px; font-family: Helvetica Neue; font-weight: bold;">Proprietário:</h3>
            <h3 style="font-size: 18px; font-family: Helvetica Neue; font-weight: bold;">Endereço:</h3>
            <h3 style="font-size: 18px; font-family: Helvetica Neue; font-weight: bold;">Telefone:</h3>
        </div>
        <div>
            <h3 style="font-size: 18px; font-family: Helvetica Neue; font-weight: normal;">${ownerName}</h3>
            <h3 style="font-size: 18px; font-family: Helvetica Neue; font-weight: normal;">${addressProvince}, ${addressDistrict}, ${addressAdminPost}</h3>
            <h3 style="font-size: 18px; font-family: Helvetica Neue; font-weight: normal;">${phoneNumber}</h3>
        </div>
    </div>
    <div style="margin-top: 20px; text-align: justify; line-height: 22px">
        O Comerciante acima identificado, proprietário de uma quantidade de <strong>${quantity} ${measurementUnits.KG}</strong> de <strong>${label.toLowerCase()}</strong> a ser transportada de <strong>${shipment.transitLicense.issuedIn}</strong> para <strong>${shipment.destination}</strong> para os fins de <strong>${purpose.toLowerCase()}</strong>, apresentou a guia de trânsito número <strong>${shipment.transitLicense.id}</strong>, emitida pelo Instituto de Amêndoas de Moçambique, IP aos <strong>${issueDate}</strong> para efeitos de registo e controlo de trânsito da mercadoria.
    </div>
    <div style="margin-top: 20px;">
        <h3 style="font-size: 18px; font-family: Helvetica Neue; font-weight: bold;">Transportadora(s):</h3>
        <div style="display: flex; flex-direction: row; gap: 20px;">
           ${generateTableHTML(shipment)}
        </div>
    </div>
    
    <div style="position: absolute; bottom: 20; left: 20;">
        <h3 style="font-size: 8px; font-family: Helvetica Neue; font-weight: normal;text-align: right; ">Registo por: <strong>${shipment.registeredBy}</strong></h3>
    </div>
    </body>
    </html>		
    `
}
