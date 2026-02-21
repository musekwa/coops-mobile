import { Href, usePathname, useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { FAB, Portal } from 'react-native-paper'
import { colors } from 'src/constants'
import { noImageUri } from 'src/constants/imageURI'
import { useActorStore } from 'src/store/actor'
import { ActorCategory } from 'src/types'

type Props = {
	actorCategory: ActorCategory
	title: string
	icon?: string
	imageUri: string
}[]

export function GroupFloatingButton({ categories }: { categories: Props }) {
	const router = useRouter()
	const pathname = usePathname()
	const { colorScheme } = useColorScheme()

	const { getCategory, setCategory } = useActorStore()
	const [isOpen, setIsOpen] = useState(false)
	const toggleOpen = () => {
		setIsOpen(!isOpen)
	}

	return (
		<Portal>
			<FAB.Group
				style={[
					styles.fab,
					{
						bottom: isOpen ? 30 : 60,
					},
				]}
				open={isOpen}
				visible={pathname === '/actors'}
				theme={{ colors: { primary: colors.primary, background: colorScheme === 'dark' ? '#000000' : '#ffffff' } }}
				icon={isOpen ? 'close' : 'plus'}
				actions={categories.map((category) => ({
					icon: (props: any) => {
						// Validate imageUri to prevent crashes
						const isValidUri =
							category.imageUri &&
							typeof category.imageUri === 'string' &&
							category.imageUri.trim() !== '' &&
							(category.imageUri.startsWith('http') ||
								category.imageUri.startsWith('data:') ||
								category.imageUri.startsWith('file:'))

						const imageSource = isValidUri ? { uri: category.imageUri } : { uri: noImageUri }

						return (
							<View className="flex justify-center items-center h-full">
								<Image
									source={imageSource}
									style={{ width: 35, height: 35 }}
									contentFit="cover"
									onError={(error) => {
										console.error('Image load error:', error)
									}}
									onLoadStart={() => {
										// Optional: handle load start
									}}
								/>
							</View>
						)
					},
					label: category.title,
					labelStyle: { color: colorScheme === 'dark' ? colors.white : colors.black, fontSize: 20 },
					onPress: () => {
						if (category.actorCategory === ActorCategory.FARMER) {
							router.navigate('/actors/registration/farmer')
						} else if (category.actorCategory === ActorCategory.COOPERATIVE) {
							router.navigate('/actors/registration/cooperative')
						} else if (category.actorCategory === ActorCategory.ASSOCIATION) {
							router.navigate('/actors/registration/association')
						} else if (category.actorCategory === ActorCategory.COOP_UNION) {
							router.navigate('/actors/registration/coop-union')
						}

						setCategory({
							...category,
							description: '',
							bannerImage: '',
						})
					},
					color: '#FFFFFF',
					style: { backgroundColor: '#ffffff' },
				}))}
				onStateChange={({ open }) => setIsOpen(open)}
				onPress={toggleOpen}
			/>
		</Portal>
	)
}

const styles = StyleSheet.create({
	fab: {
		position: 'absolute',
		right: 0,
		bottom: 60,
	},
})
