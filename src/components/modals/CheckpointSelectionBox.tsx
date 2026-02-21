import { View, Text } from 'react-native'
import { v4 as uuidv4 } from 'uuid'
import React, { useEffect, useState } from 'react'
import { Dialog } from 'react-native-simple-dialogs'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import { cn } from 'src/utils/tailwind'
import { checkpoints } from 'src/constants/checkpoints'
import { useActionStore } from 'src/store/actions/actions'

type CheckpointSelectionBoxProps = {
	visible: boolean
	setVisible: (value: boolean) => void
	districtId: string
}

export default function CheckpointSelectionBox({
	visible,
	setVisible,
	districtId,
}: CheckpointSelectionBoxProps) {
	const {
		toastPayload, setToast, 
	} = useActionStore()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>('')

	const [districtCheckpoints, setDistrictCheckpoints] = useState<string[]>([])

	useEffect(()=>{
		const districtCheckpoints = checkpoints[districtId]
		if (districtCheckpoints) {
			setDistrictCheckpoints(districtCheckpoints)
		}
		else {
			setDistrictCheckpoints([])
		}
	}, [ districtId ])

	const addUserToCheckpoint = () => {
		// add the user to the selected checkpoint


		// check if the checkpoint already exists
		// const checkpoint = checkpoints.find((c) => c.point === selectedCheckpoint)

		// find if this user is already in any checkpoint in the district
		// const checkpointWithUser = checkpoints.find((c) => c.inspectors.find((i) => i.name === userData.name)) 

		// if the user is already in a checkpoint, remove them from the checkpoint
		// if () {
			try {

				
			} catch (error) {
				console.log('Error removing user from checkpoint', error)
				throw new Error('Error removing user from checkpoint')
			}
		// }

		// if the checkpoint exists, add the user to the checkpoint
		// if (checkpoint) {
		// 	try {


		// 		setToast({
		// 			title: 'Novo posto de fiscalização',
		// 			description: 'Actualizou o seu posto de fiscalização com sucesso.',
		// 			type: 'success',
		// 			duration: 3000,
		// 		})
		
		// 	} catch (error) {
		// 		setToast({
		// 			title: 'Erro',
		// 			description: 'Ocorreu um erro ao adicionar o utilizador ao posto de fiscalização.',
		// 			type: 'error',
		// 			duration: 3000,
		// 		})
		// 		console.log('Error adding user to checkpoint', error)
		// 		throw new Error('Error adding user to checkpoint')
		// 	}
		// } else {
		// 	try {
		// 		
		// 		setToast({
		// 			title: 'Novo posto de fiscalização',
		// 			description: 'Criou um novo posto de fiscalização com sucesso.',
		// 			type: 'success',
		// 			duration: 3000,
		// 		})
		// 	} catch (error) {
		// 		setToast({
		// 			title: 'Erro',
		// 			description: 'Ocorreu um erro ao criar o posto de fiscalização.',
		// 			type: 'error',
		// 			duration: 3000,
		// 		})
		// 		console.log('Error creating checkpoint', error)
		// 		throw new Error('Error creating checkpoint')
		// 	}
		// }
	}

	
	return (
		<Dialog
			statusBarTranslucent={true}
			visible={visible}
			onRequestClose={() => {
				setVisible(false)
			}}
			onTouchOutside={() => {
				setVisible(false)
			}}
			contentInsetAdjustmentBehavior={'automatic'}
			dialogStyle={{
				backgroundColor: isDarkMode ? colors.gray900 : colors.white,
				borderRadius: 10,
			}}
		>
			<View className="px-3 flex pb-3 space-y-4">
				<View className="flex space-y-1">
					<Text className="text-black dark:text-white font-bold ">Postos de fiscalização</Text>
					<Text className="italic text-[12px] text-gray-600 dark:text-gray-400">
						Seleccione o seu posto de fiscalização actual.
					</Text>
				</View>
				<View className="flex space-y-3">
					{/* {districtCheckpoints.map((checkpoint, index) => (
						<TouchableOpacity
							onPress={() => {
								if (selectedCheckpoint === checkpoint) {
									setSelectedCheckpoint('')
								} else {
									setSelectedCheckpoint(checkpoint)
								}
							}}
							key={index}
							className="flex flex-row space-x-2"
						>
							<View className="w-[15%] flex">
								{selectedCheckpoint === checkpoint ? (
									<Ionicons name="radio-button-on-outline" size={24} color={colors.primary} />
								) : (
									<Ionicons
										name="radio-button-off-outline"
										size={24}
										color={isDarkMode ? colors.lightestgray : colors.black}
									/>
								)}
							</View>
							<View className="flex-1">
								<Text className="font-normal text-[14px] text-black dark:text-white ">{checkpoint}</Text>
							</View>
						</TouchableOpacity>
					))} */}
				</View>
				<View className="flex flex-row justify-between pt-6">
					<TouchableOpacity
						onPress={() => {
							setVisible(false)
							setSelectedCheckpoint('')
						}}
						className="flex flex-row p-2 border border-gray-400 rounded-full "
					>
						<Text className="font-normal text-[14px] text-black dark:text-gray-400 ">Cancelar</Text>
					</TouchableOpacity>
					<TouchableOpacity
						disabled={selectedCheckpoint === ''}
						onPress={() => {
							addUserToCheckpoint()
							setVisible(false)
						}}
						className={cn('flex flex-row space-x-2  p-2 bg-[#008000]  rounded-full ', {
							'bg-[#008000]': selectedCheckpoint !== '',
							'opacity-50': selectedCheckpoint === '',
						})}
					>
						<Text className="font-normal text-[14px] text-white dark:text-white ">Confirmar</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Dialog>
	)
}
