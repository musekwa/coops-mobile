import { View } from 'react-native'
import React from 'react'
import { AssociationFormDataType } from 'src/store/organizations'
import { ScrollView } from 'react-native'
import { CoopAffiliationStatus} from 'src/types'
import { capitalize } from 'src/helpers/capitalize'
import FormFieldPreview from '../data-preview/FormFieldPreview'
import { Divider } from 'react-native-paper'

type PreviewAssociationProps = {
	org: AssociationFormDataType
	adminPostName: string
	villageName: string
}

export default function PreviewAssociation({ org, adminPostName, villageName }: PreviewAssociationProps) {

	const legalStatus =
		org.affiliationStatus === CoopAffiliationStatus.AFFILIATED
			? 'Legalizada'
			: org.affiliationStatus === CoopAffiliationStatus.NOT_AFFILIATED
				? 'Não Legalizada'
				: org.affiliationStatus === CoopAffiliationStatus.AFFILIATION_ON_PROCESS
					? 'Em Processo de Legalização'
					: 'Não Especificada'

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{
				paddingBottom: 60,
			}}
			className="space-y-3"
		>
			<FormFieldPreview title="Associação:" value={capitalize(org.name)} />
			<Divider />
			<FormFieldPreview title="Ano de Criação:" value={String(org.creationYear)} />
			<FormFieldPreview title="Situação Legal:" value={legalStatus} />
			<FormFieldPreview
				title="Ano de Legalização:"
				value={org.affiliationYear ? org.affiliationYear : 'Ainda Não Legalizada'}
			/>

			<Divider />
			<FormFieldPreview title="Endereço (Posto Administrativo):" value={adminPostName} />

			<FormFieldPreview title="Endereço (Localidade):" value={villageName} />

			<Divider />

			<View className="flex flex-col py-3">
				<FormFieldPreview title={'Documentação (Alvará):'} value={org.license ? org.license : 'Nenhum'} />
				<FormFieldPreview title="Documentação (NUEL):" value={org.nuel ? org.nuel : 'Nenhum'} />
				<FormFieldPreview title="Documentação (NUIT):" value={org.nuit ? org.nuit : 'Nenhum'} />
			</View>
		</ScrollView>
	)
}
