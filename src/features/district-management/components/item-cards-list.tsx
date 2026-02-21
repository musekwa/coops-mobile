import { useEffect, useState } from 'react'
import { View } from 'react-native'
import ItemCard from './item-card'
import { Ionicons } from '@expo/vector-icons'
import { Href, router } from 'expo-router'
import { useQueryMany } from 'src/hooks/queries'
import { TABLES } from 'src/library/powersync/schemas/AppSchema'
import { AUTH_CODES } from 'src/data/auth_codes'

export default function ItemCardsList({ distrcitId }: { distrcitId: string }) {
	const [numberOfUnauthorizedUsers, setNumberOfUnauthorizedUsers] = useState(0)
	const { data: districtUsers } = useQueryMany<{ id: string; status: string }>(
		`SELECT user_id as id, status FROM ${TABLES.USER_DETAILS} WHERE district_id = '${distrcitId}'`,
	)

	const cardItems = [
		{
			title: 'Gestão de Usuários',
			number: districtUsers?.length || 0,
			description: 'Gestão de usuários',
			icon: 'people-outline',
			onPress: () => {
				router.navigate('/user/district-management/district-users')
			},
			neededActions: numberOfUnauthorizedUsers, // Show red dot when there are unauthorized users
		},
		{
			title: 'Registos de Actores',
			number: 0,
			description: 'Não há duplicados encontrados',
			icon: 'copy-outline',
			onPress: () => {
				router.navigate('/user/district-management/district-records' as Href)
			},
			neededActions: 0, // No action needed for now
		},
		{
			title: 'Actualizações de Registos',
			number: 0,
			description: 'Não há pedidos de actualização de registos',
			icon: 'document-text-outline',
			onPress: () => {
				router.navigate('/user/district-management/district-updates' as Href)
			},
			neededActions: 0, // No action needed for now
		},
		{
			title: 'Relatórios da Comercialização',
			number: 0,
			description: 'Relatórios gerados',
			icon: 'bar-chart-outline',
			onPress: () => {
				router.navigate('/user/district-management/district-reports' as Href)
			},
			neededActions: 0, // No action needed for now
		}
	]

	useEffect(() => {
		setNumberOfUnauthorizedUsers(
			districtUsers?.filter((user) => user.status === AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED).length || 0,
		)
	}, [districtUsers, setNumberOfUnauthorizedUsers])

	return (
		<View className="flex-1 px-4">
			<View className="flex-row flex-wrap justify-between">
				{cardItems.map((item) => (
					<ItemCard
						key={item.title}
						title={item.title}
						number={item.number || 0}
						description={item.description}
						icon={item.icon as keyof typeof Ionicons.glyphMap}
						onPress={item.onPress}
						neededActions={item.neededActions}
					/>
				))}
			</View>
		</View>
	)
}
