import { View, Text } from 'react-native'
import { v4 as uuidv4 } from 'uuid'
import React, { useEffect, useState } from 'react'
import { Dialog } from 'react-native-simple-dialogs'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import { TouchableOpacity } from 'react-native'
import { cn } from 'src/utils/tailwind'
import { useActionStore } from 'src/store/actions/actions'
import { Image } from 'expo-image'
import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { ScrollView } from 'react-native'
import { getTimeElapsedSinceRegistration } from 'src/helpers/dates'

type DuplicatesPreviewProps = {
	// duplicates: Farmer[] | Trader[]
	// setDuplicates: (value: Farmer[] | Trader[]) => void
	setProceed: (b: boolean) => void
	hint: 'Farmer' | 'Trader'
}

export default function DuplicatesPreview({ hint, setProceed }: DuplicatesPreviewProps) {
	const isDarkMode = useColorScheme().colorScheme === 'dark'

	return (
		<Dialog
			statusBarTranslucent={true}
			visible={false}
			onRequestClose={() => {
				// setDuplicates([])
			}}
			onTouchOutside={() => {
				// setDuplicates([])
			}}
			contentInsetAdjustmentBehavior={'automatic'}
			dialogStyle={{
				// flex: 1,
				maxHeight: 500,
				backgroundColor: isDarkMode ? colors.gray900 : colors.white,
				borderRadius: 10,
			}}
		>
			<View className="px-3 flex pb-3 space-y-4">
				<ScrollView
					contentContainerStyle={{
						justifyContent: 'center',
						alignItems: 'center',
					}}
					showsVerticalScrollIndicator={false}
				>
					<View className="flex space-y-1 py-12">
						<Text className="text-black dark:text-white font-bold text-center">
							{false ? 'Foi encontrado um registo similar' : `Foram encontrados 7 registos similares`}
						</Text>
						<Text className="italic text-[12px] text-gray-600 dark:text-gray-400 text-center">
							Se "Continuar", um novo registo será criado.
						</Text>
					</View>
					{hint === 'Farmer' && (
						<View className="flex-1 pt-3 pb-6">
							{/* {duplicates.map((duplicate, index) => {
								const surname = duplicate.surname.toLowerCase().includes('company') ? '(Empresa)' : duplicate.surname
								const anotherHint = duplicate?.nuit
									? `NUIT: ${duplicate.nuit}`
									: duplicate.contacts?.phone1
										? `Tel: ${duplicate.contacts.phone1}`
										: duplicate.contacts?.phone2
											? `Tel: ${duplicate.contacts.phone2}`
											: duplicate.birth?.date
												? `Nascimento: ${duplicate.birth.date}`
												: ''
								const location = [
									duplicate.village !== 'N/A' && duplicate.village ? duplicate.village : '',
									duplicate.adminPost !== 'N/A' && duplicate.adminPost ? duplicate.adminPost : '',
									duplicate.district !== 'N/A' && duplicate.district ? duplicate.district : '',
									duplicate.province !== 'N/A' && duplicate.province ? duplicate.province : ''
								].filter(Boolean).join(', ');

								const birthDate = duplicate.birth && duplicate.birth?.date
									? `Nascido aos ${Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(duplicate.birth.date))}`
									: '';

								const birth = [birthDate, duplicate.birth?.district]
									.filter(Boolean)
									.join(', ');

								return (
									<View key={index} className="flex border-b border-gray-400 py-3 ">
										<View className="flex space-y-2 items-center">
											<Image
												source={{ uri: duplicate.photo ?? avatarPlaceholderUri }}
												style={{ width: 80, height: 80, borderRadius: 60 }}
												contentFit="cover"
											/>
											<Text className="text-black dark:text-white text-[14px]">
												{duplicate.otherNames} {surname}
											</Text>
											<Text className="text-gray-600 dark:text-gray-400 text-[10px]">
												Registado há {getTimeElapsedSinceRegistration(duplicate.createdAt)}
											</Text>

											<Text className="text-gray-600 dark:text-gray-400 text-[12px] text-center">{anotherHint}</Text>
											<Text className="text-gray-600 dark:text-gray-400 text-[12px] text-center">Residente em: {location}</Text>
											{birth && <Text className="text-gray-600 dark:text-gray-400 text-[12px] text-center">{birth}</Text>}
										</View>
									</View>
								)
							})} */}
						</View>
					)}
					{hint === 'Trader' && (
						<View className="flex-1 pt-3 pb-6">
							{/* {duplicates.map((duplicate, index) => {
								const surname = duplicate.surname.toLowerCase().includes('company') ? '(Empresa)' : duplicate.surname
								const anotherHint = duplicate?.nuit
									? `NUIT: ${duplicate.nuit}`
									: duplicate.contacts?.phone1
										? `Tel: ${duplicate.contacts.phone1}`
										: duplicate.contacts?.phone2
											? `Tel: ${duplicate.contacts.phone2}`
											: duplicate.birth?.date
												? `Nascimento: ${duplicate.birth.date}`
												: ''
								
								const location = [
									duplicate.village !== 'N/A' && duplicate.village ? duplicate.village : '',
									duplicate.adminPost !== 'N/A' && duplicate.adminPost ? duplicate.adminPost : '',
									duplicate.district !== 'N/A' && duplicate.district ? duplicate.district : '',
									duplicate.province !== 'N/A' && duplicate.province ? duplicate.province : ''
								].filter(Boolean).join(', ');

								const birthDate = duplicate.birth && duplicate.birth?.date
									? `Nascido aos ${Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(duplicate.birth.date))}`
									: '';

								const birth = [birthDate, duplicate.birth?.district]
									.filter(Boolean)
									.join(', ');

								return (
									<View key={index} className="flex pb-6 border-b border-gray-400 ">
										<View className="flex space-y-2 items-center">
											<Image
												source={{ uri: duplicate.photo ?? avatarPlaceholderUri }}
												style={{ width: 80, height: 80, borderRadius: 60 }}
												contentFit="cover"
											/>
											<Text className="text-black dark:text-white text-[14px]">
												{duplicate.otherNames} {surname}
											</Text>
											<Text className="text-gray-600 dark:text-gray-400 text-[12px]">
												Registado há {getTimeElapsedSinceRegistration(duplicate.createdAt)}
											</Text>

											<Text className="text-gray-600 dark:text-gray-400 text-[12px]">{anotherHint}</Text>
											<Text className="text-gray-600 dark:text-gray-400 text-[12px] text-center">Residente em: {location}</Text>
											{birth && <Text className="text-gray-600 dark:text-gray-400 text-[12px] text-center">{birth}</Text>}
										</View>
									</View>
								)
							})} */}
						</View>
					)}
					<View className="flex flex-row justify-between w-full pt-6">
						<TouchableOpacity
							onPress={() => {
								// setDuplicates([])
								setProceed(false)
							}}
							className="flex flex-row p-2 border border-gray-400 rounded-full "
						>
							<Text className="font-normal text-[14px] text-black dark:text-gray-400 ">Cancelar</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => {
								setProceed(true)
								// setDuplicates([])
							}}
							className={cn('flex flex-row space-x-2  p-2 bg-[#008000]  rounded-full ')}
						>
							<Text className="font-normal text-[14px] text-white dark:text-white ">Continuar</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</View>
		</Dialog>
	)
}
