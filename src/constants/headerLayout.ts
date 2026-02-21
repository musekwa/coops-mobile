import { NativeStackNavigationOptions } from '@react-navigation/native-stack'


export const StackScreenWithSearchBar: NativeStackNavigationOptions = {
	headerLargeTitle: true,
	// headerTitleAlign: 'center',
	headerStyle: {
		// backgroundColor: colors,	
	},
	headerLargeStyle: {
		// backgroundColor: colors.background,
	},
	headerLargeTitleStyle: {
		// color: colors.text,
	},
	// headerTintColor: colors.text,
	headerTransparent: false,
	headerBlurEffect: 'prominent',
	headerShadowVisible: false,
}
