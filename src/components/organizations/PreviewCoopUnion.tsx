import { View } from 'react-native'
import React from 'react'
import { CoopUnionFormDataType } from 'src/store/organizations'
import { ScrollView } from 'react-native'
import { capitalize } from 'src/helpers/capitalize'
import FormFieldPreview from '../data-preview/FormFieldPreview'
import { Divider } from 'react-native-paper'

type PreviewCoopUnionProps = {
	org: CoopUnionFormDataType
	adminPostName: string
	villageName: string
}

export default function PreviewCoopUnion({ org, adminPostName, villageName }: PreviewCoopUnionProps) {


	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{
				paddingBottom: 60,
			}}
			className="space-y-3"
		>
			<FormFieldPreview title="União das Cooperativas:" value={capitalize(org.name)} />
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
