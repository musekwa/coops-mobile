import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-tools'
import SignUpForm from 'src/components/auth/sign-up-form'
import HeroCard from 'src/components/auth/hero-card'
import CustomSafeAreaView from 'src/components/layouts/safe-area-view'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import { Text } from 'react-native'

export default function SignUp() {
	return (
		<CustomSafeAreaView edges={['top']}>
			<KeyboardAwareScrollView
				automaticallyAdjustContentInsets={true}
				restoreScrollOnKeyboardHide={true}
				keyboardDismissMode="interactive"
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				contentContainerStyle={{
					flexGrow: 1,
					padding: 16,
					paddingBottom: 40,
				}}
				className="bg-white dark:bg-black"
			>
				<HeroCard />
				<View className="py-4 flex flex-col items-center justify-center">
					<Text className="text-sm font-bold text-center text-black dark:text-white">Crie sua conta</Text>
					<FormItemDescription description="Preencha os dados abaixo para criar sua conta" />
				</View>
				<View className="flex-1 justify-center space-y-3">
					<SignUpForm />
				</View>
			</KeyboardAwareScrollView>
		</CustomSafeAreaView>
	)
}
