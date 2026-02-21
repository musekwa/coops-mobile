import { RelativePathString, useNavigation } from 'expo-router'
import { RefObject, useEffect, useRef, useState } from 'react'
import { ScrollView, TouchableOpacity, Text, View, Animated } from 'react-native'
import BackButton from 'src/components/buttons/BackButton'
import OrganizationDataPreview from 'src/components/data-preview/OrganizationDataPreview'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import SuccessAlert from 'src/components/dialogs/SuccessAlert'

import AddAssociationForm from 'src/components/organizations/AddAssociation'
import AddCoopForm from 'src/components/organizations/AddCoop'
import AddCoopUnionForm from 'src/components/organizations/AddCoopUnion'
import { useHeaderOptions } from 'src/hooks/useNavigationSearch'
import { useActionStore } from 'src/store/actions/actions'
import {
	AssociationFormDataType,
	CoopUnionFormDataType,
	useAssociationStore,
	useCoopUnionStore,
	CoopFormDataType,
	useCoopStore,
} from 'src/store/organizations'

import { ActionType, OrganizationTypes } from 'src/types'
import { cn } from 'src/utils/tailwind'
import { match } from 'ts-pattern'

const organizations = [
	{
		title: 'Cooperativa',
		orgType: OrganizationTypes.COOPERATIVE,
	},
	{
		title: 'Associação',
		orgType: OrganizationTypes.ASSOCIATION,
	},
	{
		title: 'União de Cooperativas',
		orgType: OrganizationTypes.COOP_UNION,
	},
]

const CategoryTab = ({
	org,
	activeOrg,
	onPress,
}: {
	org: { title: string; orgType: OrganizationTypes }
	activeOrg: OrganizationTypes
	onPress: () => void
}) => {
	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			className={cn(
				'border border-gray-400 bg-white dark:border-gray-800 dark:bg-gray-900  items-center justify-center mx-1 px-1 py-2 rounded-md my-1',
				{
					'bg-[#008000]': activeOrg === org.orgType,
				},
			)}
		>
			<Text
				className={cn('text-[13px] text-black dark:text-white ', {
					'text-white': activeOrg === org.orgType,
				})}
			>
				{org.title}
			</Text>
		</TouchableOpacity>
	)
}

export default function OrgRegistrationScreen() {
	const navigation = useNavigation()
	const scrollViewRef: RefObject<any> = useRef(null)
	const [activeOrg, setActiveOrg] = useState<OrganizationTypes>(OrganizationTypes.COOPERATIVE)
	const { getAddActionType, resetAddActionType } = useActionStore()
	const fixedTabWidth = 100

	const [success, setSuccess] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [hasError, setHasError] = useState(false)
	const [previewData, setPreviewData] = useState(false)
	const [routeSegment, setRouteSegment] = useState('')

	const handleTabPress = (org: { title: string; orgType: OrganizationTypes }) => {
		const activeOrg = organizations.findIndex((o) => o.orgType === org.orgType)
		const scrollToPosition = activeOrg * fixedTabWidth
		scrollViewRef.current?.scrollTo({ x: scrollToPosition, animated: true })
		setActiveOrg(org.orgType)
	}

	useHeaderOptions({}, 'Registo de Organização')
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton />,
		})

		if (getAddActionType() !== ActionType.UNKNOWN) {
			if (getAddActionType() === ActionType.ADD_COOPERATIVE) {
				setActiveOrg(OrganizationTypes.COOPERATIVE)
			} else if (getAddActionType() === ActionType.ADD_ASSOCIATION) {
				setActiveOrg(OrganizationTypes.ASSOCIATION)
			} else if (getAddActionType() === ActionType.ADD_COOP_UNION) {
				setActiveOrg(OrganizationTypes.COOP_UNION)
			} else {
				setActiveOrg(OrganizationTypes.COOPERATIVE)
			}
			resetAddActionType()
		}
	}, [])

	useEffect(() => {
		const activeOrgIndex = organizations.findIndex((o) => o.orgType === activeOrg)
		const scrollToPosition = activeOrgIndex * fixedTabWidth
		scrollViewRef.current?.scrollTo({ x: scrollToPosition, animated: true })
	}, [activeOrg, organizations])

	const renderTabBar = () => {
		return (
			<ScrollView
				ref={scrollViewRef}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					paddingHorizontal: 10,
					height: 45,
				}}
			>
				{organizations.map((org) => (
					<CategoryTab key={org.title} org={org} activeOrg={activeOrg} onPress={() => handleTabPress(org)} />
				))}
			</ScrollView>
		)
	}

	const addOrganizationForm = match(activeOrg)
		.with(OrganizationTypes.ASSOCIATION, () => {
			return (
				<AddAssociationForm
					setErrorMessage={setErrorMessage}
					setPreviewData={setPreviewData}
					setHasError={setHasError}
				/>
			)
		})
		.with(OrganizationTypes.COOPERATIVE, () => {
			return <AddCoopForm setErrorMessage={setErrorMessage} setPreviewData={setPreviewData} setHasError={setHasError} />
		})
		.with(OrganizationTypes.COOP_UNION, () => {
			return (
				<AddCoopUnionForm setErrorMessage={setErrorMessage} setPreviewData={setPreviewData} setHasError={setHasError} />
			)
		})
		.run()

	const org = match(activeOrg)
		.with(OrganizationTypes.COOPERATIVE, () => useCoopStore().getFormData() as CoopFormDataType)
		.with(OrganizationTypes.ASSOCIATION, () => useAssociationStore().getFormData() as AssociationFormDataType)
		.with(OrganizationTypes.COOP_UNION, () => useCoopUnionStore().getFormData() as CoopUnionFormDataType)
		.exhaustive()

	const tabOpacity = useRef(new Animated.Value(1)).current // Initial opacity

	return (
		<View className="flex-1 bg-white dark:bg-black relative">
			<Animated.View
				className=""
				style={{
					opacity: tabOpacity,
					transform: [
						{
							scaleY: tabOpacity.interpolate({
								inputRange: [0, 1],
								outputRange: [0, 1], // Scale from completely flat to full height
								extrapolate: 'clamp',
							}),
						},
					],
					// Ensure the view's origin is at the top for the scaling animation
					transformOrigin: 'top',
				}}
			>
				{renderTabBar()}
			</Animated.View>

			{addOrganizationForm}

			<OrganizationDataPreview
				hasError={hasError}
				errorMessage={errorMessage}
				previewData={previewData}
				setPreviewData={setPreviewData}
				org={org}
				setErrorMessage={setErrorMessage}
				setHasError={setHasError}
				setSuccess={setSuccess}
				setRouteSegment={setRouteSegment}
				organizationType={activeOrg}
			/>
			<ErrorAlert
				visible={hasError}
				setVisible={setHasError}
				title="Erro"
				message={errorMessage}
				setMessage={setErrorMessage}
			/>
			<SuccessAlert visible={success} setVisible={setSuccess} route={routeSegment as RelativePathString | undefined} />
		</View>
	)
}
