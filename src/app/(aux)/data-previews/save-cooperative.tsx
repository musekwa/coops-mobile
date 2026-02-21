import CustomSafeAreaView from "src/components/layouts/safe-area-view";
import Animated, {FadeIn} from "react-native-reanimated";
import { View } from "react-native";

export default function SaveCooperative() {

    return (
        <CustomSafeAreaView edges={['bottom']}>
		<Animated.ScrollView
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{
				paddingBottom: 80,
				paddingTop: 10,
				paddingHorizontal: 16,
			}}
			entering={FadeIn.duration(300)}
		>
			<View className="flex-1 ">

            </View>
		</Animated.ScrollView>
	</CustomSafeAreaView>
    )
}