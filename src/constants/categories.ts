import { ActorCategory, CategoryCardType, OrganizationTypes } from 'src/types'
import {
	actorOrganizationsImageUri,
	associationCategoryImageUri,
	cooperativeCategoryImageUri,
	farmerCategoryImageUri,
	processorCategoryImageUri,
	sprayerCategoryImageUri,
	traderCategoryImageUri,
	unionCategoryImageUri,
} from './imageURI'

export const multicategory = [
	'FARMER_SMALL_SCALE',
	'FARMER_LARGE_SCALE',
	'FARMER_UNCATEGORIZED',
	'TRADER_PRIMARY',
	'TRADER_SECONDARY',
	'TRADER_EXPORT',
	'TRADER_LOCAL',
	'TRADER_LARGE_SCALE_PROCESSING',
	'TRADER_SMALL_SCALE_PROCESSING',
	'TRADER_UNCATEGORIZED',
	'WORKER',
]

export const organizationTypes = [
	{
		title: 'Cooperativas',
		count: 0,
		routeSegment: 'cooperatives',
		description: '',
		imageUri: cooperativeCategoryImageUri,
		orgType: OrganizationTypes.COOPERATIVE,
	},
	{
		title: 'Associações',
		count: 0,
		routeSegment: 'associations',
		description: '',
		imageUri: associationCategoryImageUri,
		orgType: OrganizationTypes.ASSOCIATION,
	},
	{
		title: 'Uniões de Cooperativas',
		count: 0,
		routeSegment: 'coop-unions',
		description: '.',
		imageUri: unionCategoryImageUri,
		orgType: OrganizationTypes.COOP_UNION,
	},
]

export const categoryOptions = [
	{
		actorCategory: ActorCategory.FARMER,
		title: 'Produtor',
		icon: 'person',
		description: '',
		imageUri: farmerCategoryImageUri,
	},
	{
		actorCategory: ActorCategory.COOPERATIVE,
		title: 'Cooperativa',
		icon: 'hand-holding-dollar',
		description: '',
		imageUri: traderCategoryImageUri,
	},
	{
		actorCategory: ActorCategory.ASSOCIATION,
		title: 'Associação',
		icon: 'people-group',
		description: '',
		imageUri: associationCategoryImageUri,
	},
	{
		actorCategory: ActorCategory.COOP_UNION,
		title: 'União de Cooperativas',
		icon: 'people-group',
		description: '',
		imageUri: unionCategoryImageUri,
	},
]

export const categoriesCardDetails: CategoryCardType[] = [
	{
		actorCategory: ActorCategory.FARMER,
		description: 'Familiares e Comerciais.',
		title: 'Produtores',
		bannerImage: farmerCategoryImageUri,
		// icon: 'account',
	},
	// {
	// 	actorCategory: ActorCategory.SERVICE_PROVIDER,
	// 	description: 'Serviços de pulverização.',
	// 	title: 'Provedores de Serviços',
	// 	bannerImage: sprayerCategoryImageUri,
	// 	// icon: 'account',
	// },
	// {
	// 	actorCategory: ActorCategory.TRADER,
	// 	description: 'Primários, Intermediários e Finais.',
	// 	title: 'Comerciantes',
	// 	bannerImage: traderCategoryImageUri,
	// 	// icon: 'account',
	// },
	// {
	// 	actorCategory: ActorCategory.PROCESSOR,
	// 	description: 'Processadores Industriais e Artesanais.',
	// 	title: 'Processadores',
	// 	bannerImage: processorCategoryImageUri,
	// 	// icon: 'account',
	// },
	{
		actorCategory: ActorCategory.COOPERATIVE,
		description: 'Cooperativas de produtores.',
		title: 'Cooperativas',
		bannerImage: cooperativeCategoryImageUri,
	},
	{
		actorCategory: ActorCategory.ASSOCIATION,
		description: 'Associações de produtores.',
		title: 'Associações',
		bannerImage: associationCategoryImageUri,
	},
	{
		actorCategory: ActorCategory.COOP_UNION,
		description: 'Uniões de cooperativas.',
		title: 'Uniões',
		bannerImage: unionCategoryImageUri,
	},
]
