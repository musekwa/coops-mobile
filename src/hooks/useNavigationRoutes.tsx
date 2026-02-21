import { useNavigation } from "expo-router"

export const useNavigationRoutes = () => {
    const navigation = useNavigation()
    const navigationState = navigation.getState()
    const routes = navigationState.routes
    const previousRoute = routes[routes.length - 1]
    const currentRoute = routes[routes.length - 1]
    // console.log('routes', JSON.stringify(previousRoute, null, 2))

    return {
        previousRoute,
        currentRoute
    }


}