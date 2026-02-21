import { View, Text } from "react-native"
import * as Animatable from "react-native-animatable"
import { ampcmLogoUri } from 'src/constants/imageURI'
import { Image } from 'expo-image'

type HeroCardProps = {
    title: string
    description: string
}

export default function HeroCard({ title, description }: HeroCardProps) {
    return (
        <View className="bg-white dark:bg-black flex items-center justify-center">
            <Image
                source={{ uri: ampcmLogoUri }}
                contentFit="contain"
                style={{
                    width: 120,
                    height: 40,
                }}
            />
                {/* <Animatable.Text
                    animation="pulse"
                    easing="ease-out"
                    iterationCount="infinite"
                    style={{ textAlign: 'center' }}
                    className="text-[16px] font-bold text-[#008000]"
                >
                    {title}
                </Animatable.Text> */}
                <Text className="text-xs italic text-center text-gray-500 dark:text-gray-400">
                    {description}
                </Text>
        </View>
    )
}