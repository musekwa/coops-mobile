import { Stack } from "expo-router";
import BackButton from "src/components/buttons/BackButton";
import { useStyles } from "src/hooks/useStyles";

export default function DataPreviewsLayout() {
    const { headerStyle, headerTitleStyle } = useStyles()

    return (
        <Stack>
            <Stack.Screen name="save-farmer" 
            options={{ 
                    headerShown: true, 
                    headerTitle: 'Confirmar Dados',
                    headerStyle: headerStyle,
                    headerTitleAlign: 'center',
                    headerTitleStyle: headerTitleStyle,
                    headerShadowVisible: false,
                    headerLeft: () => <BackButton />,
                }} />

            <Stack.Screen name="save-organization" 
            options={{ 
                    headerShown: true, 
                    headerTitle: 'Confirmar Dados',
                    headerStyle: headerStyle,
                    headerTitleAlign: 'center',
                    headerTitleStyle: headerTitleStyle,
                    headerShadowVisible: false,
                    headerLeft: () => <BackButton />,
                }} />

        </Stack>
    )
}