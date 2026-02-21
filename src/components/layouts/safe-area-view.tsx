import { View } from 'react-native'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import { useColorScheme } from 'nativewind'

type CustomSafeAreaViewProps = {
	children: React.ReactNode
	edges?: Edge[]
	mode?: 'padding' | 'margin'
	style?: React.ComponentProps<typeof View>['style']
}

// SafeAreaView with background color based on dark mode and custom edges and mode
export default function CustomSafeAreaView({ children, edges, mode, style }: CustomSafeAreaViewProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const backgroundColor = isDarkMode ? 'black' : 'white'
	// Filter out 'top' from edges to prevent top padding
	const filteredEdges = edges?.filter((edge) => edge !== 'top') || edges

	return (
		<SafeAreaView
			edges={filteredEdges}
			mode={mode}
			style={[{ flex: 1, paddingTop: -10 }, style]}
			className={`flex-1 bg-${backgroundColor}`}
		>
			<View style={{ paddingTop: 0, paddingBottom: 0, flex: 1, width: '100%',minHeight: '100%' }}>{children}</View>
		</SafeAreaView>
	)
}
