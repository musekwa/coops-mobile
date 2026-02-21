import { create } from 'zustand'

export type OrganizationStore = {
	individualMembers: {
		id: string,
		title: string
	}[]
	groupMembers: {
		id: string,
		title: string
	}[]

	addOrRemoveGroupMember: (member: { id: string, title: string }) => void
	addOrRemoveIndividualMember: (member: { id: string, title: string }) => void

	resetGroupMembers: () => void
	resetIndividualMembers: () => void
}

export const useOrganizationStore = create<OrganizationStore>((set, get) => ({
	individualMembers: [],
	groupMembers: [],

	addOrRemoveGroupMember: (member: { id: string, title: string }) => {
		const { groupMembers } = get()
		if (groupMembers.some(m => m.id === member.id)) {
			set({ groupMembers: groupMembers.filter(m => m.id !== member.id) })
		} else {
			set({ groupMembers: [...groupMembers, member] })
		}
	},

	addOrRemoveIndividualMember: (member: { id: string, title: string }) => {
		const { individualMembers } = get()
		if (individualMembers.some(m => m.id === member.id)) {
			set({ individualMembers: individualMembers.filter(m => m.id !== member.id) })
		} else {
			set({ individualMembers: [...individualMembers, member] })	
		}
	},

	resetGroupMembers: () => {
		set({ groupMembers: [] })
	},

	resetIndividualMembers: () => {
		set({ individualMembers: [] })
	},
}))
