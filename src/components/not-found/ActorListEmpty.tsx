import React, { useEffect, JSX } from 'react'
import { View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { Href, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { NotFoundUri } from 'src/constants/imageURI'
import { Feather, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { ActionType, ActorCategory } from 'src/types'
import { match } from 'ts-pattern'
import { colors } from 'src/constants'
import { useActorStore } from 'src/store/actor'
import { useActionStore } from 'src/store/actions/actions'
import FormItemDescription from '../forms/FormItemDescription'

export default function ActorListEmpty({ actionType }: any) {
	let action: { message: string; buttonLabel: string; icon: JSX.Element; route: string }
	const { setCategory, getCategory } = useActorStore()
	const { setAddActionType } = useActionStore()
	const router = useRouter()

	// The handleNavigation function is used to handle the navigation
	// when the user clicks on the button
	// It takes in a category and navigates to the proper registration screen or modal
	const handleNavigation = (category: ActorCategory) => {
		setAddActionType(actionType)
		match(category)
			.with(ActorCategory.FARMER, () => {
				router.navigate('/actors/registration/farmer-registration')
			})
			.with(ActorCategory.TRADER, () => {
				router.navigate('/actors/registration/trader-registration')
			})
			.with(ActorCategory.COOPERATIVE, () => {
				router.navigate('/actors/registration/org-registration')
			})
			.with(ActorCategory.ASSOCIATION, () => {
				router.navigate('/actors/registration/org-registration')
			})
			.with(ActorCategory.COOP_UNION, () => {
				router.navigate('/actors/registration/org-registration')
			})
			.with(ActorCategory.GROUP, () => {
				router.navigate('/actors/registration/org-registration')
			})
			.otherwise(() => {
				return router.navigate('/actors/registration' as Href)
			})
	}

	// check the actionType and set the action object accordingly
	switch (actionType) {
		case ActionType.ADD_FARMER:
			action = {
				message: 'Não há produtores registados',
				buttonLabel: 'Registar Produtor',
				icon: <MaterialCommunityIcons name="account-plus" size={24} color="white" />,
				route: '/actors/registration',
			}
			break
		case ActionType.ADD_TRADER:
			action = {
				message: 'Não há comerciantes registados',
				buttonLabel: 'Registar Comerciante',
				icon: <MaterialCommunityIcons name="account-plus" size={24} color="white" />,
				route: '/actors/registration/trader-registration',
			}

			break
		case ActionType.ADD_COOPERATIVE:
			action = {
				message: 'Não há cooperativas registadas',
				buttonLabel: 'Adicionar Cooperativa',
				icon: <FontAwesome6 name="people-group" size={24} color={colors.white} />,
				route: '/actors/org-registration',
			}

			break
		case ActionType.ADD_ASSOCIATION:
			action = {
				message: 'Não há associações registadas',
				buttonLabel: 'Adicionar Associação',
				icon: <FontAwesome6 name="people-group" size={24} color={colors.white} />,
				route: '/actors/org-registration',
			}

			break
		case ActionType.ADD_COOP_UNION:
			action = {
				message: 'Não há uniões de cooperativas',
				buttonLabel: 'Adicionar União de Cooperativas',
				icon: <FontAwesome6 name="people-group" size={24} color={colors.white} />,
				route: '/actors/org-registration',
			}

			break
		case ActionType.ADD_STAFF:
			action = {
				message: 'Não há responsáveis adicionados',
				buttonLabel: 'Adicionar Responsáveis',
				icon: <MaterialCommunityIcons name="account-plus" size={24} color="white" />,
				route: '/actors/registration',
			}
			break
		case ActionType.ADD_COOPERATIVE_MEMBER:
			action = {
				message: 'Cooperativa sem membros adicionados',
				buttonLabel: 'Adicionar Membro',
				icon: <MaterialCommunityIcons name="account-plus" size={24} color="white" />,
				route: '/actors/registration',
			}
			break
		case ActionType.ADD_COOP_UNION_MEMBER:
			action = {
				message: 'União sem cooperativas adicionadas',
				buttonLabel: 'Adicionar Cooperativa',
				icon: <MaterialCommunityIcons name="account-plus" size={24} color="white" />,
				route: '/actors/registration',
			}
			break
		case ActionType.ADD_ASSOCIATION_MEMBER:
			action = {
				message: 'Associação sem membros adicionados',
				buttonLabel: 'Adicionar Membro',
				icon: <MaterialCommunityIcons name="account-plus" size={24} color="white" />,
				route: '/actors/registration',
			}
			break
		case ActionType.ADD_GROUP_MEMBER:
			action = {
				message: 'Grupo de Produtores sem membros adicionado',
				buttonLabel: 'Adicionar Membro',
				icon: <MaterialCommunityIcons name="account-plus" size={24} color="white" />,
				route: '/actors/org-membership/add-member',
			}
			break
		case ActionType.UNKNOWN:
			action = {
				message: 'Ainda não há registos',
				buttonLabel: 'Registar',
				icon: <MaterialCommunityIcons name="account-plus" size={24} color="white" />,
				route: '/actors/registration',
			}
			break
		case ActionType.NO_INFO:
			action = {
				message: 'Não há informação disponível',
				buttonLabel: 'Registar',
				icon: <MaterialCommunityIcons name="account-plus" size={24} color="white" />,
				route: '/actors/registration',
			}
			break
		case ActionType.ADD_SHIPMENT:
			action = {
				message: 'Não há registos de trânsitos de mercadorias',
				buttonLabel: 'Anunciar Viagem',
				icon: <Feather name="edit" size={24} color={colors.white} />,
				route: '/(aux)/trades/registration',
			}
			break
		case ActionType.ADD_CASHEW_WAREHOUSE:
			action = {
				message: 'Não há registos de armazéns de castanha',
				buttonLabel: 'Adicionar Armazém',
				icon: <MaterialCommunityIcons name="store-plus" size={24} color="white" />,
				route: '/actors/trader/profile',
			}
			break
		case ActionType.ADD_CASHEW_FACTORY:
			action = {
				message: 'Não há registos de fábricas de castanha',
				buttonLabel: 'Adicionar Fábrica',
				icon: <MaterialCommunityIcons name="factory" size={24} color="white" />,
				route: '/actors/trader/profile',
			}
			break
		case ActionType.ADD_TRANSACTION:
			action = {
				message: 'Não há transações registadas',
				buttonLabel: 'Adicionar Transação',
				icon: <MaterialCommunityIcons name="plus" size={24} color="white" />,
				route: '/actors/trader/profile',
			}
			break
		default:
			action = {
				message: 'Nenhum registado encontrado',
				buttonLabel: 'Registar',
				icon: <MaterialCommunityIcons name="account-plus" size={24} color="white" />,
				route: '/actors/registration',
			}
	}

	useEffect(() => {
		// set the category based on the actionType
		// this is to ensure that the correct category is displayed on the registration page
		// when the user clicks on the button
		if (actionType === ActionType.ADD_FARMER) {
			setCategory({
				actorCategory: ActorCategory.FARMER,
				title: 'Produtor',
				description: 'Registar Produtor',
				bannerImage: '',
			})
		} else if (actionType === ActionType.ADD_TRADER) {
			setCategory({
				actorCategory: ActorCategory.TRADER,
				title: 'Comerciante',
				description: 'Registar Comerciante',
				bannerImage: '',
			})
		} else if (actionType === ActionType.ADD_COOPERATIVE) {
			setCategory({
				actorCategory: ActorCategory.COOPERATIVE,
				title: 'Cooperativa',
				description: 'Registar Cooperativa',
				bannerImage: '',
			})
		} else if (actionType === ActionType.ADD_ASSOCIATION) {
			setCategory({
				actorCategory: ActorCategory.ASSOCIATION,
				title: 'Associação',
				description: 'Registar Associação',
				bannerImage: '',
			})
		} else if (actionType === ActionType.ADD_COOP_UNION) {
			setCategory({
				actorCategory: ActorCategory.COOP_UNION,
				title: 'União de Cooperativas',
				description: 'Registar União de Cooperativas',
				bannerImage: '',
			})
		} else if (actionType === ActionType.ADD_STAFF) {
			setCategory({
				actorCategory: ActorCategory.STAFF,
				title: 'Responsável',
				description: 'Registar Responsável',
				bannerImage: '',
			})
		} else if (actionType === ActionType.ADD_COOPERATIVE_MEMBER) {
			setCategory({
				actorCategory: ActorCategory.COOPERATIVE_MEMBER,
				title: 'Membro de Cooperativa',
				description: 'Adicionar Membro de Cooperativa',
				bannerImage: '',
			})
		} else if (actionType === ActionType.ADD_COOP_UNION_MEMBER) {
			setCategory({
				actorCategory: ActorCategory.COOP_UNION_MEMBER,
				title: 'Membro de União de Cooperativa',
				description: 'Adicionar Membro de União das Cooperativas',
				bannerImage: '',
			})
		} else if (actionType === ActionType.ADD_CASHEW_WAREHOUSE) {
			setCategory({
				actorCategory: ActorCategory.TRADER,
				title: 'Armazém de Castanha',
				description: 'Adicionar Armazém de Castanha',
				bannerImage: '',
			})
		} else if (actionType === ActionType.ADD_TRANSACTION) {
			setCategory({
				actorCategory: ActorCategory.TRADER,
				title: 'Armazém de Castanha',
				description: 'Adicionar Transação',
				bannerImage: '',
			})
		}
	}, [actionType])

	if (actionType === ActionType.ADD_COOPERATIVE_MEMBER || actionType === ActionType.ADD_ASSOCIATION_MEMBER) {
		return (
			<View className="bg-white dark:bg-black ">
				<View className="pb-6 px-6 justify-center items-center">
					<Image
						source={{ uri: NotFoundUri }}
						style={{
							width: 60,
							height: 60,
						}}
						contentFit="cover"
					/>
					<View className="px-6">
						<FormItemDescription description={action.message} />
					</View>
				</View>
			</View>
		)
	}

	if (actionType === ActionType.UNKNOWN) {
		return (
			<View className="py-2 bg-white dark:bg-black justify-start items-center space-y-4">
				<Image
					source={{ uri: NotFoundUri }}
					style={{
						width: 60,
						height: 60,
					}}
					contentFit="contain"
				/>
				<View className="px-6">
					<FormItemDescription description={action.message} />
				</View>
			</View>
		)
	}
	if (actionType === ActionType.NO_INFO) {
		return (
			<View className="py-2 bg-white dark:bg-black justify-start items-center space-y-4">
				<Image
					source={{ uri: NotFoundUri }}
					style={{
						width: 60,
						height: 60,
					}}
					contentFit="contain"
				/>
				<View className="px-6">
					<FormItemDescription description={action.message} />
				</View>
			</View>
		)
	}
	if (
		getCategory().actorCategory === ActorCategory.COOPERATIVE_MEMBER ||
		getCategory().actorCategory === ActorCategory.COOP_UNION_MEMBER
	) {
		return (
			<View className="bg-white dark:bg-black ">
				<View className="pb-6 px-6 justify-center items-center">
					<Image
						source={{ uri: NotFoundUri }}
						style={{
							width: 60,
							height: 60,
						}}
						contentFit="contain"
					/>
					<View className="px-6">
						<FormItemDescription description={action.message} />
					</View>
				</View>
				<View className="mx-6 rounded-md  bg-[#008000]" />
			</View>
		)
	}

	if (actionType === ActionType.ADD_SHIPMENT) {
		return (
			<View className="flex-1 pt-12 bg-white dark:bg-black justify-start items-center space-y-4">
				<Image
					source={{ uri: NotFoundUri }}
					style={{
						width: 60,
						height: 60,
					}}
					contentFit="contain"
				/>
				<View className="px-6">
					<FormItemDescription description={action.message} />
				</View>
			</View>
		)
	}

	if (actionType === ActionType.ADD_CASHEW_WAREHOUSE) {
		return (
			<View className="pt-2 bg-white dark:bg-black  flex-1 justify-center items-center space-y-4">
				<Image
					source={{ uri: NotFoundUri }}
					style={{
						width: 60,
						height: 60,
					}}
					contentFit="contain"
				/>
				{/* <View className="px-6">
					<Text className="text-gray-600 dark:text-white text-[12px] italic text-center">{action.message}</Text>
				</View> */}
			</View>
		)
	}

	if (actionType === ActionType.ADD_TRANSACTION) {
		return (
			<View className="pt-6 bg-white dark:bg-black justify-start items-center space-y-4">
				<Image
					source={{ uri: NotFoundUri }}
					style={{
						width: 60,
						height: 60,
					}}
					contentFit="contain"
				/>
				{/* <View className="px-6">
					<Text className="text-gray-600 dark:text-white text-[14px] text-center">{action.message}</Text>
				</View> */}
			</View>
		)
	}

	return (
		<View className="pt-6 bg-white dark:bg-black  flex-1 justify-start items-center space-y-4">
			<Image
				source={{ uri: NotFoundUri }}
				style={{
					width: 60,
					height: 60,
				}}
				contentFit="contain"
			/>
			<View className="px-6">
				<Text className="text-gray-600 dark:text-white text-[14px] text-center">{action.message}</Text>
			</View>

			{getCategory().actorCategory !== ActorCategory.COOPERATIVE_MEMBER && (
				<TouchableOpacity
					onPress={() => {
						handleNavigation(getCategory().actorCategory)
					}}
				>
					<View className="flex flex-row justify-center items-center border border-[#008000] bg-[#008000] space-x-2 bg-primary p-2 rounded-md">
						<Text className="text-white text-[14px]">{action.buttonLabel}</Text>
						<Ionicons name="add-circle-outline" color={colors.white} size={24} />
					</View>
				</TouchableOpacity>
			)}
		</View>
	)
}
