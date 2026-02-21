import React from 'react'
import { Slot, useRouter } from 'expo-router'
import useBackHandler from '../../hooks/useBackHandler'

export default function AuxLayout() {
	const router = useRouter()
	
	useBackHandler(
		{
			title: 'Sair',
			message: 'Tem a certeza de que pretende sair?',
			okText: 'Sim',
			cancelText: 'Cancelar',
			navigationAction: ()=>router.navigate('/(tabs)/actors/farmers')
		}
	)
	return <Slot />
}
