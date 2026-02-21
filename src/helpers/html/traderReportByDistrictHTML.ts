import { UserDataType } from "src/store/user"
import { getFormattedDate } from "../dates"
import { UserRoles } from "src/types"
import { appIconUri, avatarPlaceholderUri } from "src/constants/imageURI"
import { Trader } from "src/models/trader"

export const traderReportByDistrictHTML = (startDate: Date, endDate: Date, userData: UserDataType, owner: Trader) => {
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
    const ownerName = `${owner.otherNames} ${owner.surname.toLowerCase().includes('company') ? '(Empresa)' : owner.surname}`
    const photo = owner?.photo ? owner?.photo : avatarPlaceholderUri
	const addressProvince = owner?.province ? owner?.province : 'N/A'
	const addressDistrict = owner?.district ? owner?.district : 'N/A'
	const addressAdminPost = owner?.adminPost ? owner?.adminPost : 'N/A'
	const phoneNumber = owner.contacts?.phone1 ? owner.contacts.phone1 : owner.contacts?.phone2 ? owner.contacts.phone2 : 'N/A'

    const address = [
        owner.village !== 'N/A' ? owner.village : null,
        addressAdminPost !== 'N/A' ? addressAdminPost : null,
        addressDistrict !== 'N/A' ? addressDistrict : null,
        addressProvince !== 'N/A' ? addressProvince : null
    ].filter(Boolean).join(', ');

    const ownerInfo = `
        <div style="display: flex; flex-direction: row; align-items: center; gap: 20px; margin-top: 20px;">
            <div style="border-color: #000; border-width: 1px">
                <img 
                    src=${photo}
                    style="width: 100px; height: 100px;" 
                />
            </div>
            <div>
                <p style="font-size: 12px; font-family: Helvetica Neue; margin: 0;">
                    <strong>Proprietário:</strong> ${ownerName}
                </p>
                <p style="font-size: 12px; font-family: Helvetica Neue; margin: 0;">
                    <strong>Endereço:</strong> ${address}
                </p>
                <p style="font-size: 12px; font-family: Helvetica Neue; margin: 0;">
                    <strong>Telefone:</strong> ${phoneNumber}
                </p>
            </div>
        </div>
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
		

		<div style="position: absolute; bottom: 20; left: 20;">
			<h3 style="font-size: 8px; font-family: Helvetica Neue; font-weight: normal;text-align: right; ">Gerado por: <strong>${userData.name}</strong> (${userRole} em ${userData.district})</h3>
		</div>
		</body>
		</html>`
}


