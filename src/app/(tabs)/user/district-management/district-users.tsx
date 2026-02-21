import { useEffect, useState } from 'react'
import { View, FlatList } from 'react-native'
import { useUserDetails } from 'src/hooks/queries'
import { UserDetailsRecord } from 'src/library/powersync/schemas/AppSchema'
import DistrictUserItem from 'src/features/district-management/components/district-user-item'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import { selectUsersByDistrictId } from 'src/library/supabase/queries'
import DisplayPDF from 'src/components/data-preview/PdfDisplayer'
import { useActionStore } from 'src/store/actions/actions'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'
import CustomShimmerPlaceholder from 'src/components/placeholder/CustomShimmerPlaceholder'

export default function DistrictManagement() {
	const { userDetails } = useUserDetails()
	const [districtUsers, setDistrictUsers] = useState<UserDetailsRecord[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const { pdfUri } = useActionStore()

	useEffect(() => {
		if (userDetails?.district_id) {
			selectUsersByDistrictId(userDetails?.district_id)
				.then((users) => {
					setDistrictUsers(users.data)
				})
				.finally(() => {
					setIsLoading(false)
				})
		}
	}, [userDetails])

	const renderItem = ({ item }: { item: UserDetailsRecord }) => {
		return <DistrictUserItem item={item} />
	}


	if (pdfUri) {
		return <DisplayPDF />
	}

	if (isLoading) {
		return <DistrictUsersSkeleton />
	}

	return (
		<View className="flex-1 bg-white dark:bg-black px-3">
			<FlatList
				data={districtUsers}
				renderItem={renderItem}
				keyExtractor={(item: UserDetailsRecord) => item.id}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={() => (
					<View className="py-3">
						<FormItemDescription description="Usuários do Distrito" />
					</View>
				)}
				ListEmptyComponent={() => (
					<View className="flex-1 items-center justify-center h-[400px]">
						<EmptyPlaceholder message="Não há usuários para mostrar" />
					</View>
				)}
			/>
			<SingleFloatingButton icon="arrow-right" route="/(tabs)/user/district-management" />
		</View>
	)
}


const DistrictUsersSkeleton = () => (
	<View className="flex-1 bg-white dark:bg-black px-3">
		<View className="py-3">
			<FormItemDescription description="Usuários do Distrito" />
		</View>
		{Array.from({ length: 10 }).map((_, index) => (
			<View
				key={index}
				className="bg-white dark:bg-gray-800 rounded-lg px-3 py-1 mb-2 shadow-sm border border-gray-100 dark:border-gray-700"
			>
				<View className="flex-row space-x-2">
					{/* Avatar skeleton */}
					<View className="w-[15%] items-center justify-center">
						<CustomShimmerPlaceholder
							style={{
								width: 40,
								height: 40,
								borderRadius: 20,
							}}
						/>
					</View>

					{/* Content skeleton */}
					<View className="flex-1">
						{/* Name skeleton */}
						<CustomShimmerPlaceholder
							style={{
								width: '70%',
								height: 16,
								borderRadius: 4,
								marginBottom: 8,
							}}
						/>
						<View className="flex-row items-center mb-2 justify-between">
							{/* Status badge skeleton */}
							<CustomShimmerPlaceholder
								style={{
									width: 100,
									height: 24,
									borderRadius: 12,
								}}
							/>
							{/* Role skeleton */}
							<CustomShimmerPlaceholder
								style={{
									width: 80,
									height: 12,
									borderRadius: 4,
								}}
							/>
						</View>
					</View>

					{/* Menu button skeleton */}
					<View className="w-[10%] items-center justify-center">
						<CustomShimmerPlaceholder
							style={{
								width: 24,
								height: 24,
								borderRadius: 12,
							}}
						/>
					</View>
				</View>
			</View>
		))}
	</View>
)