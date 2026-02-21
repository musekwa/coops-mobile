import { View, Text } from 'react-native'
import React from 'react'
import { Menu, MenuOption, MenuOptions, MenuTrigger, renderers } from 'react-native-popup-menu'
import { FontAwesome} from '@expo/vector-icons'
import { colors } from 'src/constants'
import { Divider } from 'react-native-paper'
import { useColorScheme } from 'nativewind'
import { PopMenuOption } from 'src/types'
import { IconComponentType } from '../dynamic-icon/DynamicIcon'

type CustomPopUpMenuProps = {
	options: PopMenuOption[]
	icon?: IconComponentType
	title?: string
}

export default function CustomPopUpMenu({ options, icon, title = 'Menu' }: CustomPopUpMenuProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	return (
		<Menu
		// renderer={Popover}
		>
			<MenuTrigger
				style={{
					width: 40,
					height: 40,
					justifyContent: 'center',
					alignItems: 'center',
					borderRadius: 100,
					backgroundColor: isDarkMode ? colors.black : colors.gray50,
				}}
			>
				{icon ? icon : <FontAwesome name="ellipsis-v" size={20} color={isDarkMode ? colors.white : colors.black} />}
			</MenuTrigger>
			<MenuOptions
				customStyles={{
					optionsContainer: {
						width: 230,
						paddingLeft: 10,
					},
				}}
			>
				<View className=" ml-1">
					<Text className="text-black dark:text-white font-bold py-2">{title}</Text>
					<Divider />
				</View>
				{options.map((option, index) => {
					return (
						<View key={index} className="bg-white dark:bg-gray-700">
							<MenuOption key={index} onSelect={() => option.action()}>
								<View className="flex flex-row space-x-1 my-2 items-center">
									{option.icon}
									<Text className="text-black dark:text-white ">{option.label}</Text>
								</View>
							</MenuOption>
							<Divider />
						</View>
					)
				})}
			</MenuOptions>
		</Menu>
	)
}
