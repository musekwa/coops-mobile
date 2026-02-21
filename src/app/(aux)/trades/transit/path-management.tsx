import { Feather, Ionicons } from '@expo/vector-icons'
import { useRef, useState } from 'react'
import {
	Animated as RNAnimated,
	Text,
	Dimensions,
	ScrollView,
	TouchableOpacity,
	View,
	ActivityIndicator,
} from 'react-native'
import Animated, { SlideInLeft } from 'react-native-reanimated'
import { colors } from 'src/constants'
import { useActionStore } from 'src/store/actions/actions'
import Toast from 'src/components/ToastMessage/Toast'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import PathInspectionPointItem from 'src/features/formal-shipment/components/path-inspection-point-item'
import { PathLabelType } from 'src/types'
import CustomConfirmDialg from 'src/components/dialogs/CustomConfirmDialg'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import CustomProgressDialg from 'src/components/dialogs/CustomProgressDialg'
const windowWidth = Dimensions.get('window').width

export default function PathManagementScreen() {
	const router = useRouter()
	const { reloading, setReloading } = useActionStore()
	const [findingPaths, setFindingPaths] = useState(true)
	const [loading, setLoading] = useState(true)

	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const { shipmentId } = useLocalSearchParams()
	const [currentIndex, setCurrentIndex] = useState(0)
	const [currentPath, setCurrentPath] = useState<string[]>()
	const translateX = useRef(new RNAnimated.Value(0)).current
	const toastRef = useRef<any>({})
	const [paths, setPaths] = useState<string[][]>([])
	const [checkedDistricts, setCheckedDistricts] = useState<any[]>([])
	const [pathEditVisible, setPathEditVisible] = useState(false)
	const [confirmDialogVisible, setConfirmDialogVisible] = useState(false)
	const [selectedDistrict, setSelectedDistrict] = useState<string>('')
	const [selectedProvince, setSelectedProvince] = useState<string>('')
	const [selectedPathLabel, setSelectedPathLabel] = useState<PathLabelType | undefined>(undefined)
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [currentPathLabel, setCurrentPathLabel] = useState<PathLabelType | undefined>(undefined)

	// handle press to slide to the previous or next path
	const slideToPrevious = () => {
		setLoading(true)
		if (currentIndex > 0) {
			// Start the animation to slide to the previous item
			RNAnimated.timing(translateX, {
				toValue: windowWidth,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				setCurrentIndex((prevIndex) => {
					const nextIndex = prevIndex - 1
					if (nextIndex >= 0) {
						setCurrentPath(paths[nextIndex])
						return nextIndex
					}
					return prevIndex
				})
				translateX.setValue(0) // Reset translateX to 0 without animation
				setLoading(false)
			})
		} else {
			RNAnimated.timing(translateX, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start(() => setLoading(false))
		}
	}

	// handle press to slide to the next path
	const slideToNext = () => {
		setLoading(true)
		if (currentIndex < paths.length - 1) {
			RNAnimated.timing(translateX, {
				toValue: -windowWidth,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				setCurrentIndex((prevIndex) => {
					const nextIndex = prevIndex + 1
					if (nextIndex < paths.length) {
						setCurrentPath(paths[nextIndex])
						return nextIndex
					}
					return prevIndex
				})
				translateX.setValue(0) // Reset translateX to 0 without animation
				setLoading(false)
			})
		} else {
			RNAnimated.timing(translateX, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start(() => setLoading(false))
		}
	}

	const isAllowedToChangePath = () => {
		
	}

	const onCancel = () => {
		setConfirmDialogVisible(false)
	}

	const isLastPathLabel =
		currentPathLabel === PathLabelType.CHANGED_AS_PER_SHIPMENT_REJECTION ||
		currentPathLabel === PathLabelType.CHANGED_UNEXPECTEDLY_BY_DRIVER

	return (
		<>
			<Animated.View entering={SlideInLeft.duration(500)} className="flex-1 bg-white dark:bg-black ">
			<View className="px-3 flex-1	">
				<View className="border flex-row-reverse border-gray-300 dark:border-gray-700 rounded-md">
					<TouchableOpacity
						activeOpacity={0.5}
						disabled={isLastPathLabel}
						onPress={() => {
							if (!isLastPathLabel) {
								setPathEditVisible(true)
							} else {
								setHasError(true)
								setErrorMessage(
									'Não é possível mudar o destino desta carga. Se necessário, trate uma nova Guia de Trânsito.',
								)
							}
						}}
						className="p-2 flex-col items-center justify-start"
					>
						<Feather name="edit" size={20} color={isLastPathLabel ? colors.gray600 : colors.primary} />
						<Text className="text-[8px] italic text-gray-600 dark:text-gray-400 font-mono">Novo destino</Text>
					</TouchableOpacity>
					<View className="flex-1 space-y-3 p-2">
						<View className="flex flex-row justify-between items-center">
							<View className="flex flex-row items-center space-x-2 w-[110px]">
								<Ionicons name="location-outline" size={15} color={isDarkMode ? colors.white : colors.black} />
								<Text className="text-xs text-gray-600 dark:text-gray-400 font-mono">Proveniência:</Text>
							</View>
							<View className="flex-1 flex-row items-center space-x-2">
								<Text className="text-xs text-gray-600 dark:text-gray-400 font-mono">{currentPath?.[0]}</Text>
							</View>
						</View>
						<View className="flex flex-row justify-between items-center">
							<View className="flex flex-row items-center space-x-2 w-[110px]">
								<Ionicons
									name="send-outline"
									size={15}
									color={isDarkMode ? colors.white : colors.black}
									style={{
										transform: [{ rotate: '-45deg' }],
									}}
								/>
								<Text className="text-xs text-gray-600 dark:text-gray-400 font-mono">Destino:</Text>
							</View>
							<View className="flex-1 flex-row items-center space-x-2">
								<Text className="text-xs text-gray-600 dark:text-gray-400 font-mono">
									{currentPath?.[currentPath.length - 1]}
								</Text>
							</View>
						</View>
					</View>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						flexGrow: 1,
						flexDirection: 'column',
						paddingTop: 20,
						paddingBottom: 150,
					}}
				>
					<View className="py-3">
					
					</View>

					{selectedPathLabel &&
						currentPath?.map((district, index) => {
							// if the path (district) already has a check, show the check details
							// otherwise, show a placeholder for the check
							if (
								checkedDistricts?.some(
									(check) => check.place === district && check.notes?.split(' - ')[0] === selectedPathLabel,
								)
							) {
								const check = checkedDistricts.find((check) => check.place === district)
								return (
									<PathInspectionPointItem
										key={index}
										index={index}
										district={district}
										currentPath={currentPath}
										check={check}
									/>
								)
							}
							return (
								<PathInspectionPointItem
									key={index}
									index={index}
									district={district}
									currentPath={currentPath}
									check={null}
								/>
							)
						})}

					{!selectedPathLabel &&
						currentPath?.map((district, index) => {
							// if the path (district) already has a check, show the check details
							// otherwise, show a placeholder for the check
							if (
								checkedDistricts?.some(
									(check) => check.place === district && check.notes?.split(' - ')[0] === currentPathLabel,
								)
							) {
								const check = checkedDistricts.find((check) => check.place === district)
								return (
									<PathInspectionPointItem
										key={index}
										index={index}
										check={check}
										district={district}
										currentPath={currentPath}
									/>
								)
							}

							return (
								<PathInspectionPointItem
									key={index}
									index={index}
									district={district}
									currentPath={currentPath}
									check={null}
								/>
							)
						})}
				</ScrollView>
			</View>

			<View className="">
				<Text className="italic text-[12px] text-gray-400 px-3">Seleccione a rota percorrida por esta carga.</Text>
				<View className="flex-row justify-between items-center">
					<TouchableOpacity
						disabled={currentIndex === 0}
						onPress={slideToPrevious}
						className={`flex-1 items-center ${currentIndex === 0 ? 'opacity-20' : ''}`}
					>
						<Ionicons name="play-back-circle-outline" size={50} color={colors.primary} />
						<Text className="text-[10px] text-gray-400">Anterior</Text>
					</TouchableOpacity>
					<TouchableOpacity 
					// onPress={addPathToShipment} 
					className="flex-1 items-center">
						<Ionicons name="pause-circle-outline" size={50} color={colors.primary} />
						<Text className="text-[10px] text-gray-400">Seleccionar</Text>
					</TouchableOpacity>
					<TouchableOpacity
						disabled={currentIndex === paths.length - 1}
						onPress={slideToNext}
						className={`flex-1 items-center ${currentIndex === paths.length - 1 ? 'opacity-20' : ''}`}
					>
						<Ionicons name="play-forward-circle-outline" size={50} color={colors.primary} />
						<Text className="text-[10px] text-gray-400">Próximo</Text>
					</TouchableOpacity>
				</View>
			</View>
			<Toast ref={toastRef} />
			{/* {shipment && (
				<PathEdit
					setHasError={setHasError}
					setErrorMessage={setErrorMessage}
					setConfirmDialogVisible={setConfirmDialogVisible}
					visible={pathEditVisible}
					setVisible={setPathEditVisible}
					shipment={shipment}
					setSelectedDistrict={setSelectedDistrict}
					setSelectedProvince={setSelectedProvince}
					setSelectedPathLabel={setSelectedPathLabel}
				/>
			)} */}
			<CustomConfirmDialg
				visible={confirmDialogVisible}
				setVisible={setConfirmDialogVisible}
				yesCallback={() => {
					setFindingPaths(true)
					setConfirmDialogVisible(false)
					setPathEditVisible(false)
					setLoading(true)
				}}
				noCallback={onCancel}
				yesText="Sim"
				noText="Não"
				message={`Tem certeza que deseja mudar o distrito de destino de ${currentPath?.[currentPath.length - 1]} para ${selectedDistrict}?`}
				title="Mudança de Rota"
			/>
			<ErrorAlert
				visible={hasError}
				title="Erro"
				setVisible={setHasError}
				message={errorMessage}
				setMessage={setErrorMessage}
			/>
			{loading && (
				<View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black/30">
					<ActivityIndicator size="large" color={colors.primary} />
				</View>
			)}
			<CustomProgressDialg
				title="Aguarde..."
				message="Gerando novas rotas..."
				isLoading={reloading}
				setIsLoading={setReloading}
			/>
		</Animated.View>
		</>
	)
}
