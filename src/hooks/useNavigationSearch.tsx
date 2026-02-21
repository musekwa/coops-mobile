import { useNavigation } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { useLayoutEffect, useState } from 'react'
import { SearchBarProps } from 'react-native-screens'
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { colors } from 'src/constants'


const defautlSearchOptions: SearchBarProps = {
	hideWhenScrolling: true,
	// barTintColor: colors.textMuted,
	// textColor: colors.background,
	// headerIconColor: colors.text,
}

// Adapting the useNavigationSearch hook to accept a searchBarOptions prop that will be merged with the default options
export const useNavigationSearch = ({
	searchBarOptions,
}: {
	searchBarOptions?: SearchBarProps
}) => {
	const [search, setSearch] = useState('')
	const navigation = useNavigation()
	const {colorScheme} = useColorScheme()
	
	useLayoutEffect(() => {
		navigation.setOptions({
			headerSearchBarOptions: {
				...defautlSearchOptions,
                ...searchBarOptions,
				barTintColor: colorScheme === 'dark' ? colors.gray600 : colors.gray50,
                headerIconColor: colorScheme === 'dark' ? colors.gray50 : colors.primary,
                onChangeText: (event: any) => setSearch(event.nativeEvent.text),
				onCancelButtonPress: () => setSearch(''),
			},
		})
	}, [navigation,  searchBarOptions, colorScheme ])

    return {search, setSearch};
}

export const useHeaderOptions = (options?: NativeStackNavigationOptions, title="",) => {
	const navigation = useNavigation()
	const {colorScheme} = useColorScheme()

	useLayoutEffect(() => {
		navigation.setOptions({
			...options,
			headerShown: true,
			headerTitle: title,
			headerTitleAlign: 'center',
			headerLargeTitle: true,
			headerShadowVisible: false,
			headerTitleStyle: { fontSize: 14, fontWeight: 'bold', color: colorScheme === 'dark' ? colors.white : colors.black },
			headerStyle: {
				backgroundColor: colorScheme === 'dark' ? colors.lightblack : colors.white,
				elevation: 0,
				shadowOpacity: 0,
				borderBottomWidth: 0,
			},
		})
	}, [navigation, title])
}