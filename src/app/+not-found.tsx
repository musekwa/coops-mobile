import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import { Pressable } from 'react-native'
import { Text, View } from 'react-native'

export default function NotFoundScreen() {
	const router = useRouter()

	return (
		<View style={{ flex: 1 }}>
			<View className="flex-1 bg-white dark:bg-black">
				<Stack.Screen options={{ title: 'Oops!' }} />
			<View className="flex-1 items-center justify-center p-4">
				<View className="flex-row items-center gap-2 mb-4">
					<Text className="text-[16px] font-normal text-[#008000]">Este ecrâ não foi encontrado!</Text>
				</View>

				<Pressable
					className="mt-4 p-2 flex-row items-center border border-[#008000] rounded-md"
					onPress={() => router.back()}
				>
					<Ionicons name="arrow-back" size={24} color="#008000" />
					<Text className="text-[16px] font-normal text-[#008000]">Voltar</Text>
				</Pressable>

				{/* <Link href="/" className="mt-4 p-4">
					<Text className="text-base text-[#008000]">Voltar para o ecrâ inicial!</Text>
				</Link> */}
			</View>
			</View>
		</View>
	)
}
