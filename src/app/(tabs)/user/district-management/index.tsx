import { View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import ItemCardsList from 'src/features/district-management/components/item-cards-list'
import { useUserDetails } from 'src/hooks/queries'

export default function DistrictManagement() {
	const { userDetails } = useUserDetails()
	if (!userDetails?.district_id) {
		return null
	}
	return (
		<Animated.ScrollView
			entering={FadeIn.duration(200)}
			exiting={FadeOut.duration(200)}
			contentContainerStyle={{
				flexGrow: 1,
				paddingHorizontal: 15,
				paddingVertical: 30,
			}}
			className="bg-white dark:bg-black"
			showsVerticalScrollIndicator={false}
			keyboardShouldPersistTaps="handled"
		>
			<ItemCardsList distrcitId={userDetails.district_id} />
		</Animated.ScrollView>
	)
}
