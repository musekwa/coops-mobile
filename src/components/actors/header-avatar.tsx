import { TouchableOpacity } from "react-native"
import { DrawerActions } from "@react-navigation/native"
import { Image } from "expo-image"
import { avatarPlaceholderUri } from "src/constants/imageURI"
import { colors } from "src/constants"
import { useNavigation } from "expo-router"

interface HeaderAvatarProps {

	photoUri: string | null | undefined
}
export default function HeaderAvatar({ photoUri }: HeaderAvatarProps) {
	const navigation = useNavigation()
	return (
		<TouchableOpacity
			onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
			activeOpacity={0.7}
			style={{ marginLeft: 8 }}
			accessibilityLabel="Abrir menu"
			accessibilityRole="button"
		>
			<Image
				source={{ uri: photoUri || avatarPlaceholderUri }}
				style={{ width: 45, height: 45, borderRadius: 22.5, borderWidth: 2, borderColor: colors.primary }}
				contentFit="cover"
			/>
		</TouchableOpacity>
	)
}