// React and React Native imports
import { useMemo, useState } from 'react'
import { SectionList, View } from 'react-native'

// Components
import ActorListEmpty from 'src/components/not-found/ActorListEmpty'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import SectionedListHeader from './sectioned-list-header'
import SectionedListItem from './sectioned-list-item'

// Hooks
import { useActionStore } from 'src/store/actions/actions'


import { ActionType } from 'src/types'

// Helpers
import { getIntlDate } from 'src/helpers/dates'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'

interface InformalShipmentIndexProps {
	isLoading: boolean
}

export default function InformalShipmentIndex({ isLoading }: InformalShipmentIndexProps) {
	const { startDate, endDate } = useActionStore()
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

	const filteredInformalTraders = useMemo(() => {
		
		return []
	}, [])

	// TODO: Implement a sectioned list with the traders and their marchandises
	// 1. The marchandises are grouped by trader
	// 2. The trader's fullname (surname + otherNames) and phone number are the section header
	// 3. The section is expandable
	// 4. The sectioned list is sorted by the trader's fullname
	// 5. When a section is expanded, the marchandises are displayed in a list
	// 6. When a section is collapsed, the marchandises are hidden

	// Render section header: display trader's name, phone, and photo
	const renderSectionHeader = ({
		section,
	}: {
		section: { owner: { fullName: string; phone: string | number; licenseType: string } }
	}) => <SectionedListHeader section={section} expandedSections={expandedSections} toggleSection={toggleSection} />

	// Toggle section expansion: if the section is already expanded, collapse it, otherwise expand it
	const toggleSection = (sectionName: string) => {
		setExpandedSections((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(sectionName)) {
				newSet.delete(sectionName)
			} else {
				newSet.add(sectionName)
			}
			return newSet
		})
	}

	// Render warehouse item: display warehouse details if the section is expanded
	const renderItem = ({ item, section }: { item: any; section: string }) => (
		<SectionedListItem expandedSections={expandedSections} item={item} section={section} />
	)

	return (
		<View className="space-y-6 pb-6 pt-3">
			<View className="">
				<SectionList
					sections={filteredInformalTraders}
					renderSectionHeader={renderSectionHeader}
					renderItem={renderItem}
					stickySectionHeadersEnabled={true}
					keyExtractor={(item: { fullName: string; phone: string; _id: string }) => item._id}
					contentContainerStyle={{
						paddingBottom: 60,
						gap: 3,
					}}
					renderSectionFooter={({ section }: { section: { owner: { fullName: string; phone: string } } }) =>
						expandedSections.has(section.owner.fullName + section.owner.phone) ? null : <View style={{ height: 10 }} />
					}
					showsVerticalScrollIndicator={false}
					ListHeaderComponent={() => (
						<View className="py-3">
							<FormItemDescription
								description={`Comerciantes informais com mercadorias para ou do distrito de ${"userDistrict"} entre ${getIntlDate(startDate)} e ${getIntlDate(endDate)}`}
							/>
						</View>
					)}
					ListEmptyComponent={
						<View className="flex-1 h-[200px] justify-center items-center">
								<EmptyPlaceholder message="Não há informações sobre o tránsito informal de mercadorias para o período selecionado" />
						</View>
					}
				/>
			</View>
		</View>
	)
}
