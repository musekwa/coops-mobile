import { Text } from 'react-native'
import React, { useEffect } from 'react'
import { ActionType, PopMenuOption } from 'src/types'
import ActorListEmpty from 'src/components/not-found/ActorListEmpty'
import Animated, { SlideInDown } from 'react-native-reanimated'
import { Href, useNavigation, useRouter } from 'expo-router'
import CustomPopUpMenu from 'src/components/menus/CustomPopUpMenu'
import { FontAwesome } from '@expo/vector-icons'
import { useActionStore } from 'src/store/actions/actions'

export default function FarmerProfileScreen() {
	const navigation = useNavigation()
	const router = useRouter()
	const { currentResource } = useActionStore()

	const menuOptions: PopMenuOption[] = [
		{
			label: 'Actualizar Dados',
			icon: <FontAwesome name="edit" size={18} />,
			action: () =>
				router.navigate(`/(actions)/edit?resourceName=${currentResource.name}&id=${currentResource.id}` as Href),
		},
	]

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => <CustomPopUpMenu title="Menu" options={menuOptions} />,
		})
	}, [])

	return (
		<Animated.ScrollView
			entering={SlideInDown.duration(500)}
			className="flex-1 bg-white dark:bg-black"
			contentContainerStyle={{
				flexGrow: 1,
				justifyContent: 'center',
				alignItems: 'center',
				paddingHorizontal: 16,
			}}
		>
			<ActorListEmpty actionType={ActionType.UNKNOWN} />
			<Text className="text-center text-sm text-gray-600 dark:text-gray-400 italic">
				Este é o ecrã de perfil do Produtor. O seu UI será desenvolvido assim que for definido o que pode ser associado
				a um Produtor.
			</Text>
		</Animated.ScrollView>
	)
}
