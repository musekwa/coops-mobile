import { View, Text, Modal, TouchableOpacity, FlatList, TextInput, StatusBar } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import EmptyPlaceholder from '../not-found/EmptyPlaceholder'
import FormItemDescription from '../forms/FormItemDescription'
import Label from '../forms/Label'

const statusBarHeight = StatusBar.currentHeight || 20

type SelectModalProps = {
	label: string
	showModal: boolean
	setShowModal: (b: boolean) => void
	setValue: (v: string) => void
	itemsList: { label: string; value: string; description?: string; icon?: string }[]
	mode?: 'multi-select'
	searchPlaceholder?: string
	emptyMessage?: string
}

export default function CustomSelectItem({
	showModal,
	label,
	setShowModal,
	setValue,
	itemsList,
	mode,
	searchPlaceholder,
	emptyMessage,
}: SelectModalProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [filteredItems, setFilteredItems] = useState(itemsList)

	useEffect(() => {
		const filtered = itemsList.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
		setFilteredItems(filtered)
	}, [searchQuery, itemsList])

	const renderItem = ({ item }: { item: { label: string; value: string; description?: string; icon?: string } }) => (
		<SelectItem
			item={item}
			setValue={setValue}
			mode={mode || 'single-select'}
			setShowModal={setShowModal}
			setSearchQuery={setSearchQuery}
		/>
	)

	return (
		<Modal presentationStyle="overFullScreen" animationType="slide" visible={showModal} statusBarTranslucent>
			<View className="flex-1 bg-white dark:bg-black">
				<StatusBar backgroundColor="#008000" barStyle="light-content" translucent={true} />

				<CustomSelectHeader
					label={label}
					searchPlaceholder={searchPlaceholder || 'Procurar...'}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					setShowModal={setShowModal}
				/>

				<View className="p-3">
					<FlatList
						ListHeaderComponent={
							<View className="mb-4">
								<FormItemDescription description={label} />
							</View>
						}
						showsVerticalScrollIndicator={false}
						ListFooterComponentStyle={{
							paddingBottom: 100,
						}}
						ListEmptyComponent={<EmptyPlaceholder message={emptyMessage || 'Nenhum item encontrado'} />}
						ListFooterComponent={
							<View className="pb-24 h-16">
								<TouchableOpacity
									onPress={() => {
										setSearchQuery('')
										setShowModal(false)
									}}
								>
									<Text>Cancelar</Text>
								</TouchableOpacity>
							</View>
						}
						data={filteredItems}
						renderItem={renderItem}
					/>
				</View>
			</View>
		</Modal>
	)
}

const CustomSelectHeader = ({
	label,
	searchPlaceholder,
	searchQuery,
	setSearchQuery,
	setShowModal,
}: {
	label: string
	searchPlaceholder: string
	searchQuery: string
	setSearchQuery: (text: string) => void
	setShowModal: (show: boolean) => void
}) => {
	return (
		<View
			style={{
				paddingTop: statusBarHeight,
			}}
			className={`px-3 bg-[#008000]`}
		>
			<View className="flex flex-row justify-between space-x-3 items-center">
				<View className="items-center justify-center">
					<Ionicons onPress={() => setShowModal(false)} name="arrow-back-outline" size={24} color={colors.white} />
				</View>
				<View className="my-4 flex-1" style={{ position: 'relative' }}>
					<TextInput
						className="bg-gray-100 dark:bg-gray-100 text-black dark:text-black p-2 rounded-md relative"
						placeholder={searchPlaceholder || 'Procurar...'}
						placeholderTextColor="#999"
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
					{/* add clear button */}
					{searchQuery && (
						<TouchableOpacity
							style={{
								position: 'absolute',
								right: 8,
								top: '50%',
								transform: [{ translateY: -10 }],
							}}
							onPress={() => setSearchQuery('')}
						>
							<Ionicons name="close" size={20} color={colors.gray600} />
						</TouchableOpacity>
					)}
				</View>
			</View>
		</View>
	)
}

const SelectItem = ({
	item,
	setValue,
	mode,
	setShowModal,
	setSearchQuery,
}: {
	item: { label: string; value: string; description?: string; icon?: string }
	setValue: (value: string) => void
	mode: 'multi-select' | 'single-select'
	setShowModal: (show: boolean) => void
	setSearchQuery: (text: string) => void
}) => {
	return (
		<TouchableOpacity
			onPress={() => {
				setValue(item.value)
				if (mode !== 'multi-select') {
					setShowModal(false)
					setSearchQuery('')
				}
			}}
			className="bg-gray-50 dark:bg-black my-2 min-h-[60px] items-center flex flex-row justify-between  border border-slate-100 dark:border-slate-700 px-3 text-[18px] shadow-xs shadow-black rounded-xl"
		>
			<View className="flex-1">
				<Label label={item.label} />
				{item.description && <FormItemDescription description={item.description} />}
			</View>
			<View className="w-4 h-4 border border-gray-400 rounded-full dark:border-gray-400" />
		</TouchableOpacity>
	)
}
