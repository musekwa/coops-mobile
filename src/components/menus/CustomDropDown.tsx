import { View, Text } from 'react-native'
import React from 'react'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { ActorCategory } from 'src/types'

import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu'

export type CustomDropDownProps = {
	staff: {
		role: string
		photo?: string
		name: string
		phone?: string
		gender: string
		actorId: string
		actorCategory: ActorCategory
	}
}
export const CustomDropDown = ({ staff }: CustomDropDownProps) => (
	<Menu>
		<MenuTrigger>
			<Ionicons name="ellipsis-vertical" size={24} />
		</MenuTrigger>
		<MenuOptions
			customStyles={{
				optionText: {
					fontSize: 20,
					color: 'black',
				},
				optionsContainer: {
					minHeight: 130,
                    padding: 10,
				},
				optionsWrapper: {
					backgroundColor: 'white',
				},
				optionTouchable: {
					// underlayColor: 'red',
					activeOpacity: 70,
				},
				optionWrapper: {
					// backgroundColor: 'white',
					// padding: 10,
					// margin: 10,
					// borderRadius: 10,
					// elevation: 5
				},
				// OptionTouchableComponent: View
			}}
		>
			<MenuOption onSelect={() => alert(`Delete`)} >
                <View className="flex flex-row space-x-2 items-center ">
                    <Text className="text-red-600 text-[16px] font-bold ">Remover</Text>
                <Entypo name="remove-user" size={24} color="red" />
                </View>
                </MenuOption>
                <View className="h-0.5 bg-gray-100 my-2" />
		</MenuOptions>
	</Menu>
)
