import { ActorCategory, CategoryCardType } from 'src/types'
import { create } from 'zustand'

interface CategoryCardState {
	category: CategoryCardType
	getCategory: () => CategoryCardType
	setCategory: (category: CategoryCardType) => void
	resetCategory: () => void
}

export const useActorStore = create<CategoryCardState>((set, get) => ({
	category: {
		actorCategory: ActorCategory.FARMER,
		description: '',
		title: '',
		bannerImage: '',
		icon: '',
	},
	resetCategory: () =>
		set({ category: { actorCategory: ActorCategory.FARMER, description: '', title: '', bannerImage: '', icon: '' } }),
	getCategory: () => get().category,
	setCategory: (category: CategoryCardType) => {
		set({ category })
	},
}))
