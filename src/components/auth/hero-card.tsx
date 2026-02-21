import { View } from "react-native"
import * as Animatable from "react-native-animatable"
import { appIconUri } from 'src/constants/imageURI'
import { Image } from 'expo-image'

export default function HeroCard() {
    return (
        <View className="bg-white dark:bg-black flex items-center justify-center">
            <Animatable.Text
                animation="pulse"
                easing="ease-out"
                iterationCount="infinite"
                style={{ textAlign: 'center' }}
                className="text-[22px] font-bold text-[#008000]"
            >
                Connect Caju
            </Animatable.Text>
            <Image
                source={{ uri: appIconUri }}
                style={{
                    width: 45,
                    height: 45,
                }}
            />
        </View>
    )
}