import { View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { usePreconditionsStore } from 'src/store/tracking/pre-conditions'
import { useColorScheme } from 'nativewind'
import { colors } from 'src/constants'
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet'
import CustomTextInput from 'src/components/custom-text-input/CustomTextInput'
import { ActionType } from 'src/types'
import ActorListEmpty from 'src/components/not-found/ActorListEmpty'
import { useShipmentReceiverDetailsStore } from 'src/store/tracking/receiverDetails'
import TraderRenderItem from './ShipmentOwnerRenderItem'
import { useShipmentOwnerDetailsStore } from 'src/store/shipment/shipment_owner_details'
type TraderListProps = {
	handleClosePress: () => void
	sheetRef: React.RefObject<BottomSheet>
}

export default function TraderList({ handleClosePress, sheetRef }: TraderListProps) {
	const { preconditions } = usePreconditionsStore()
	const { setShipmentReceiverDetails, shipmentReceiverDetails } = useShipmentReceiverDetailsStore()
	const { shipmentOwnerDetails } = useShipmentOwnerDetailsStore()
	const { colorScheme } = useColorScheme()
	const isDarkMode = colorScheme === 'dark'
	const [search, setSearch] = useState('')
	const ownerId = shipmentOwnerDetails.ownerId

	// get traders and map them to retrived fields to be set in the TraderList
	let traders: any[] = []
	traders = traders.map(
		(trader) =>
			({
				_id: trader._id,
				surname: trader.surname,
				otherNames: trader.otherNames,
				multicategory: trader.multicategory,
				contacts: {
					phone1: trader.contacts?.phone1,
					phone2: trader.contacts?.phone2,
					email: trader.contacts?.email,
				},
				workers: trader.workers,
				photo: trader.photo,
				province: trader.province,
				district: trader.district,
				adminPost: trader.adminPost,
				village: trader.village,
			}) as any,
	)

	const isCompany = (trader: any) => {
		return trader.surname.toLowerCase().includes('company')
	}

	const getFoundTraders = (cb: (trader: any) => boolean) => {
		if (search !== '') {
			return traders.filter((trader) => {
				const fullName = `${trader.otherNames} ${trader.surname}`
				return fullName.toLowerCase().includes(search.toLowerCase()) && cb(trader) && trader._id !== ownerId
			})
		} else {
			return traders
				.filter((trader) => cb(trader) && trader._id !== ownerId)
				.sort((a, b) => `${a.otherNames} ${a.surname}`.localeCompare(`${b.otherNames} ${b.surname}`))
		}
	}

	const filteredTraders = useMemo(() => {
		return getFoundTraders(isCompany)
	}, [traders, preconditions, search])

	// BottomSheet Modal: Render Backdrop
	const renderBackdrop = useCallback(
		(props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
		[],
	)

	const snapPoints = useMemo(() => ['75%', '90%', '100%'], [])

	// Handle BottomSheet Change
	const handleSheetChange = useCallback((index: number) => {
		console.log('handleSheetChange', index)
	}, [])

	const handlePressListItem = (item: any) => {
		setShipmentReceiverDetails({
			...shipmentReceiverDetails,
			receiverId: item._id,
			receiverName: `${item.otherNames} ${item.surname}`,
			receiverPhone: String(item.contacts?.phone1) ?? String(item.contacts?.phone2),
		})
		// set/update the trader details (owner of the shipment)
		// setTrader(item)

		handleClosePress()
	}

	useEffect(() => {
		if (traders) {
			// setTraderList(traders)
		}
	}, [])

	return (
		<BottomSheet
			keyboardBehavior="fillParent"
			enablePanDownToClose={true}
			backdropComponent={renderBackdrop}
			ref={sheetRef}
			snapPoints={snapPoints}
			onChange={handleSheetChange}
			onClose={handleClosePress}
			handleStyle={{ backgroundColor: isDarkMode ? colors.black : colors.white }}
			handleIndicatorStyle={{ backgroundColor: isDarkMode ? colors.white : colors.gray600 }}
		>
			<BottomSheetFlatList
				ListFooterComponent={<View className="h-28" />}
				contentContainerStyle={{
					backgroundColor: isDarkMode ? colors.black : colors.white,
					flexGrow: 1,
					paddingHorizontal: 15,
				}}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={() => <ActorListEmpty actionType={ActionType.ADD_TRADER} />}
				data={filteredTraders}
				keyExtractor={(item: any) => item._id.toString()}
				renderItem={({ item }: { item: any }) => (
					<TraderRenderItem item={item} handlePressListItem={handlePressListItem} />
				)}
			/>
			<View className="absolute bottom-0 left-0 right-0 items-center mx-3">
				<View className="w-full flex-1 ">
					<CustomTextInput
						label={``}
						value={search}
						placeholder={`Procurar comerciante pelo nome`}
						onChangeText={(text) => {
							setSearch(text)
						}}
					/>
				</View>
			</View>
		</BottomSheet>
	)
}
