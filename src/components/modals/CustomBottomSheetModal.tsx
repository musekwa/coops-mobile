import React, { useCallback, useMemo } from 'react'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { ScrollView, View } from 'react-native'
import { KeyboardAvoidingView } from 'react-native'

type CustomBottomSheetModalProps = {
	children: React.ReactNode
	bottomSheetModalRef: React.RefObject<BottomSheetModal | null>
	handleDismissModalPress: () => void
	renderFooter?: (props: any) => React.ReactNode
	index?: number
}

export default function CustomBottomSheetModal({
	children,
	bottomSheetModalRef,
	handleDismissModalPress,
	renderFooter,
	index = 2,
}: CustomBottomSheetModalProps) {
	const snapPoints = useMemo(() => ['25%', '50%', '60%', '70%', '80%', '90%'], [])

	// const renderFooter = renderFooter || ((props: any) => (
	// 	<BottomSheetFooter {...props} style={{ backgroundColor: 'white' }}>
	// 		<View className="flex flex-row justify-between items-center px-4 py-2">
	// 			<TouchableOpacity onPress={handleDismissModalPress}>
	// 				<Text className="text-red-600 text-[16px] font-bold">Cancelar</Text>
	// 			</TouchableOpacity>
	// 			<TouchableOpacity onPress={handleDismissModalPress}>
	// 				<Text className="text-green-600 text-[16px] font-bold">Salvar</Text>
	// 			</TouchableOpacity>
	// 		</View>
	// 	</BottomSheetFooter>
	// ))
	const renderBackdrop = useCallback(
		(props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />,
		[],
	)

	return (
		<View style={{ flex: 1 }}>
			<BottomSheetModal
				ref={bottomSheetModalRef}
				index={index || 2}
				snapPoints={snapPoints}
				keyboardBehavior="fillParent"
				// onChange={handleSheetChanges}
				footerComponent={renderFooter}
				backdropComponent={renderBackdrop}
				// keyboardBlurBehavior="restore"
				onDismiss={() => {}}
				enablePanDownToClose={true}
				enableOverDrag={true}
			>
				<BottomSheetView>
					<KeyboardAvoidingView keyboardVerticalOffset={80} behavior="position">
						<ScrollView
							className="bg-white dark:bg-black min-h-full"
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{
								paddingBottom: 80,
								flexGrow: 1,
							}}
							keyboardShouldPersistTaps={'always'}
						>
							{children}
						</ScrollView>
					</KeyboardAvoidingView>
				</BottomSheetView>
			</BottomSheetModal>
		</View>
	)
}
