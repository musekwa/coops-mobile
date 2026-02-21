import React, { useEffect, useMemo, useState, memo } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { AntDesign, Ionicons } from '@expo/vector-icons'

import { useHeaderOptions } from 'src/hooks/useNavigationSearch'
import { useActionStore } from 'src/store/actions/actions'
import { colors } from 'src/constants'

// Components
import PrecondictionsQuestionnaire from 'src/components/tracking/PreconditionsQuestionnaire'
import ErrorAlert from 'src/components/dialogs/ErrorAlert'
import DatesRange from 'src/components/tracking/DatesRange'
import CustomPopUpMenu from 'src/components/menus/CustomPopUpMenu'
import DisplayPDF from 'src/components/data-preview/PdfDisplayer'
import ShipmentFiltering from 'src/components/tracking/ShipmentFiltering'
// import FormalShipmentIndex from 'src/features/formal-shipment'
import FormalShipmentListSkeleton from 'src/features/formal-shipment/formal-shipment-list-skeleton'
import InformalShipmentIndex from 'src/features/informal-shipment'
import ShipmentSearch from 'src/features/formal-shipment/shipement-search'
import EmptyPlaceholder from 'src/components/not-found/EmptyPlaceholder'

// Hooks and utilities
import { useUserDetails, useQueryManyAndWatchChanges } from 'src/hooks/queries'
import { UserDetailsRecord, TABLES } from 'src/library/powersync/schemas/AppSchema'
import { getDistrictById } from 'src/library/sqlite/selects'
import { getIntlDate } from 'src/helpers/dates'
import { convertHTMLToURI } from 'src/helpers/pdf'
import { biweeklyReportHTML, ShipmentReportRow, ReportUserData } from 'src/helpers/html/periodicReportHTML'
import { powersync } from 'src/library/powersync/system'
import { UserRoles } from 'src/types'

// Types
interface ShipmentData {
	id: string
	shipment_number: string
	owner_id: string
	owner_type: string
	status: string
	departure_district_id: string
	destination_district_id: string
	departure_district_name: string
	destination_district_name: string
	departure_province_name: string
	destination_province_name: string
	owner_name: string
}

type TabType = 'VERIFIED' | 'UNVERIFIED'

// Constants
const SHIPMENT_STATUS = {
	PENDING: 'PENDING',
	DELIVERED: 'DELIVERED',
	AT_ARRIVAL: 'AT_ARRIVAL',
	AT_DEPARTURE: 'AT_DEPARTURE',
	IN_TRANSIT: 'IN_TRANSIT',
} as const

const STATUS_CONFIG = {
	[SHIPMENT_STATUS.PENDING]: {
		text: 'Pendente',
		colors: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300' },
	},
	[SHIPMENT_STATUS.AT_ARRIVAL]: {
		text: 'Chegou',
		colors: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300' },
	},
	[SHIPMENT_STATUS.DELIVERED]: {
		text: 'Chegou',
		colors: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300' },
	},
	[SHIPMENT_STATUS.AT_DEPARTURE]: {
		text: 'Saiu',
		colors: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300' },
	},
	[SHIPMENT_STATUS.IN_TRANSIT]: {
		text: 'Em trânsito',
		colors: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300' },
	},
} as const

const OWNER_TYPE_LABEL: Record<string, string> = {
	TRADER: 'Comerciante',
	FARMER: 'Produtor',
	GROUP: 'Grupo',
}

const DEFAULT_INSPECTION_SUMMARY = 'Sem fiscalização registada'

const translateOwnerTypeLabel = (ownerType: string) => OWNER_TYPE_LABEL[ownerType] ?? ownerType

const translateStatusLabel = (status: string) => STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.text ?? status

const normalizePhone = (phone?: string | null) => {
	if (!phone || phone === 'N/A') {
		return 'N/A'
	}
	return phone
}

const formatLocation = (district?: string | null, province?: string | null) => {
	const parts = [district, province].filter((part) => !!part && part !== 'N/A') as string[]
	return parts.length > 0 ? parts.join(', ') : 'N/A'
}

const formatReferenceDate = (iso?: string | null) => {
	if (!iso) {
		return 'N/A'
	}
	const date = new Date(iso)
	if (Number.isNaN(date.getTime())) {
		return iso
	}
	return getIntlDate(date)
}

type RawShipmentReportRow = {
	shipment_number: string
	owner_type: string
	owner_name: string | null
	owner_phone: string | null
	status: string
	reference_date: string | null
	total_quantity: number | null
	origin_district: string | null
	origin_province: string | null
	destination_district: string | null
	destination_province: string | null
	inspections_summary: string | null
	arrival_date: string | null
}

const buildShipmentReportQuery = (hasDistrictFilter: boolean) => `
SELECT
  cs.id,
  cs.shipment_number,
  cs.owner_type,
  cs.status,
  COALESCE(
    (SELECT surname || ' ' || other_names FROM ${TABLES.ACTOR_DETAILS} WHERE actor_id = cs.owner_id),
    (SELECT other_names FROM ${TABLES.ACTOR_DETAILS} ad 
     INNER JOIN ${TABLES.ACTORS} a ON ad.actor_id = a.id 
     WHERE a.id = cs.owner_id AND a.category = 'GROUP'),
    'N/A'
  ) AS owner_name,
  COALESCE(
    (SELECT COALESCE(NULLIF(c.primary_phone, 'N/A'), NULLIF(c.secondary_phone, 'N/A'))
       FROM ${TABLES.ACTOR_DETAILS} ad
       LEFT JOIN ${TABLES.CONTACT_DETAILS} c ON c.owner_id = ad.actor_id AND (c.owner_type = 'TRADER' OR c.owner_type = 'FARMER')
      WHERE ad.actor_id = cs.owner_id),
    'N/A'
  ) AS owner_phone,
  COALESCE(l.issue_date, first_check.first_check_date) AS reference_date,
  departure_dist.name AS origin_district,
  departure_prov.name AS origin_province,
  destination_dist.name AS destination_district,
  destination_prov.name AS destination_province,
  (SELECT IFNULL(SUM(sl.quantity), 0) FROM ${TABLES.SHIPMENT_LOADS} sl WHERE sl.shipment_id = cs.id) AS total_quantity,
  (
    SELECT GROUP_CONCAT(
      cp.name || ' (' || sc.checkpoint_type || ' - ' || strftime('%d/%m/%Y', sc.checked_at) || ')', ' | '
    )
    FROM ${TABLES.SHIPMENT_CHECKS} sc
    JOIN ${TABLES.CHECKPOINTS} cp ON sc.checkpoint_id = cp.id
    WHERE sc.shipment_id = cs.id
  ) AS inspections_summary,
  (
    SELECT strftime('%d/%m/%Y', sc.checked_at)
    FROM ${TABLES.SHIPMENT_CHECKS} sc
    WHERE sc.shipment_id = cs.id AND sc.checkpoint_type = 'AT_ARRIVAL'
    ORDER BY sc.checked_at DESC
    LIMIT 1
  ) AS arrival_date
FROM ${TABLES.CASHEW_SHIPMENTS} cs
LEFT JOIN ${TABLES.LICENSES} l ON l.license_number = cs.shipment_number
JOIN ${TABLES.SHIPMENT_DIRECTIONS} sd ON cs.id = sd.shipment_id
JOIN ${TABLES.ADDRESS_DETAILS} departure_addr ON sd.departure_address_id = departure_addr.id
JOIN ${TABLES.DISTRICTS} departure_dist ON departure_addr.district_id = departure_dist.id
JOIN ${TABLES.PROVINCES} departure_prov ON departure_addr.province_id = departure_prov.id
JOIN ${TABLES.ADDRESS_DETAILS} destination_addr ON sd.destination_address_id = destination_addr.id
JOIN ${TABLES.DISTRICTS} destination_dist ON destination_addr.district_id = destination_dist.id
JOIN ${TABLES.PROVINCES} destination_prov ON destination_addr.province_id = destination_prov.id
LEFT JOIN (
    SELECT shipment_id, MIN(checked_at) AS first_check_date
    FROM ${TABLES.SHIPMENT_CHECKS}
    GROUP BY shipment_id
) first_check ON first_check.shipment_id = cs.id
WHERE COALESCE(l.issue_date, first_check.first_check_date) IS NOT NULL
  AND datetime(COALESCE(l.issue_date, first_check.first_check_date)) BETWEEN datetime(?) AND datetime(?)
${
	hasDistrictFilter
		? `  AND (
        departure_addr.district_id = ?
        OR destination_addr.district_id = ?
        OR EXISTS (
            SELECT 1
            FROM ${TABLES.SHIPMENT_CHECKPOINT_SEQUENCE} scs
            JOIN ${TABLES.CHECKPOINTS} cp ON scs.checkpoint_id = cp.id
            JOIN ${TABLES.ADDRESS_DETAILS} checkpoint_addr ON checkpoint_addr.owner_id = cp.id AND checkpoint_addr.owner_type = 'CHECKPOINT'
            WHERE scs.shipment_id = cs.id
              AND checkpoint_addr.district_id = ?
        )
    )`
		: ''
}
ORDER BY datetime(reference_date) DESC
`

const fetchShipmentReportRows = async (params: {
	startISO: string
	endISO: string
	districtId?: string | null
}): Promise<ShipmentReportRow[]> => {
	const hasDistrictFilter = !!params.districtId
	const queryParams: string[] = [params.startISO, params.endISO]
	if (hasDistrictFilter && params.districtId) {
		queryParams.push(params.districtId, params.districtId, params.districtId)
	}

	const query = buildShipmentReportQuery(hasDistrictFilter)
	const rows = (await powersync.getAll(query, queryParams)) as RawShipmentReportRow[]

	return rows.map((row) => ({
		referenceDate: formatReferenceDate(row.reference_date),
		shipmentNumber: row.shipment_number,
		totalQuantityKg: row.total_quantity ?? 0,
		ownerName: row.owner_name ?? 'N/A',
		ownerTypeLabel: translateOwnerTypeLabel(row.owner_type),
		ownerPhone: normalizePhone(row.owner_phone),
		originLabel: formatLocation(row.origin_district, row.origin_province),
		destinationLabel: formatLocation(row.destination_district, row.destination_province),
		statusLabel: translateStatusLabel(row.status),
		inspectionsSummary: row.inspections_summary ?? DEFAULT_INSPECTION_SUMMARY,
		arrivalDate: row.arrival_date ?? undefined,
	}))
}

// ============================================================================
// SHIPMENT ITEM COMPONENT
// ============================================================================

interface ShipmentItemProps {
	shipment: ShipmentData
	onPress: (shipment: ShipmentData) => void
}

const ShipmentItem = memo(({ shipment, onPress }: ShipmentItemProps) => {
	const statusConfig =
		STATUS_CONFIG[shipment.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[SHIPMENT_STATUS.PENDING]

	return (
		<TouchableOpacity className="mb-2 mx-1" activeOpacity={0.7} onPress={() => onPress(shipment)}>
			<View
				className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
				style={{ maxHeight: 120 }}
			>
				{/* Header Section */}
				<ShipmentItemHeader shipment={shipment} statusConfig={statusConfig} />

				{/* Route Information Section */}
				<ShipmentItemRoute shipment={shipment} />
			</View>
		</TouchableOpacity>
	)
})

const ShipmentItemHeader = ({
	shipment,
	statusConfig,
}: {
	shipment: ShipmentData
	statusConfig: (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG]
}) => (
	<View className="flex-row items-center justify-between p-2">
		<View className="flex-row items-center flex-1 min-w-0">
			<View className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mr-2 flex-shrink-0">
				<Ionicons name="cube-outline" size={14} color={colors.primary} />
			</View>
			<View className="flex-1 min-w-0">
				<Text className="font-bold text-black dark:text-white text-xs" numberOfLines={1} style={{ fontSize: 14 }}>
					{shipment.shipment_number}
				</Text>
				<Text className="text-gray-500 dark:text-gray-400" numberOfLines={1} style={{ fontSize: 12 }}>
					{shipment.owner_name}
				</Text>
			</View>
		</View>
		<View className={`px-2 py-1 rounded-full ml-1 flex-shrink-0 ${statusConfig.colors.bg}`}>
			<Text className={`font-medium ${statusConfig.colors.text}`} style={{ fontSize: 12 }}>
				{statusConfig.text}
			</Text>
		</View>
	</View>
)

const ShipmentItemRoute = ({ shipment }: { shipment: ShipmentData }) => (
	<View className="px-2 pb-2">
		<View className="flex-row items-center justify-between">
			{/* Origin */}
			<RoutePoint
				iconColor="#EF4444"
				iconBg="bg-red-100 dark:bg-red-900"
				label="Origem"
				location={`${shipment.departure_district_name}, ${shipment.departure_province_name}`}
			/>

			{/* Destination */}
			<RoutePoint
				iconColor="#10B981"
				iconBg="bg-green-100 dark:bg-green-900"
				label="Destino"
				location={`${shipment.destination_district_name}, ${shipment.destination_province_name}`}
				className="ml-2"
			/>
		</View>
	</View>
)

const RoutePoint = ({
	iconColor,
	iconBg,
	label,
	location,
	className = '',
}: {
	iconColor: string
	iconBg: string
	label: string
	location: string
	className?: string
}) => (
	<View className={`flex-row items-center flex-1 min-w-0 ${className}`}>
		<View className={`w-4 h-4 ${iconBg} rounded-full items-center justify-center mr-1 flex-shrink-0`}>
			<Ionicons name="location" size={8} color={iconColor} />
		</View>
		<View className="flex-1 min-w-0">
			<Text className="text-gray-500 dark:text-gray-400" style={{ fontSize: 12 }}>
				{label}
			</Text>
			<Text className="text-black dark:text-white font-medium" numberOfLines={1} style={{ fontSize: 12 }}>
				{location}
			</Text>
		</View>
	</View>
)

// ============================================================================
// TAB NAVIGATION COMPONENT
// ============================================================================

interface TabNavigationProps {
	activeTab: TabType
	onTabChange: (tab: TabType) => void
	onFilterPress: () => void
	hasResetAll: boolean
}

const TabNavigation = ({ activeTab, onTabChange, onFilterPress, hasResetAll }: TabNavigationProps) => {
	const isVerifiedActive = hasResetAll && activeTab === 'VERIFIED'
	const isUnverifiedActive = hasResetAll && activeTab === 'UNVERIFIED'

	return (
		<View className="mb-3">
			<View className="flex-row items-center justify-between">
				{/* Elegant Tab Bar with Underline Indicator */}
				<View className="flex-row border-b border-gray-200 dark:border-gray-700 flex-1">
					<TabButton
						icon="checkmark-circle"
						label="Verificados"
						isActive={isVerifiedActive}
						onPress={() => onTabChange('VERIFIED')}
					/>
					<TabButton
						icon="ban"
						label="Interceptados"
						isActive={isUnverifiedActive}
						onPress={() => onTabChange('UNVERIFIED')}
					/>
				</View>
			</View>
		</View>
	)
}

const TabButton = ({
	icon,
	label,
	isActive,
	onPress,
}: {
	icon: string
	label: string
	isActive: boolean
	onPress: () => void
}) => (
	<TouchableOpacity
		onPress={onPress}
		activeOpacity={0.7}
		className="flex-1 flex-row items-center justify-center py-3 px-2 relative"
	>
		<Ionicons name={icon as any} size={18} color={isActive ? colors.primary : '#9CA3AF'} />
		<Text
			className={`ml-2 text-sm font-semibold ${
				isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
			}`}
		>
			{label}
		</Text>
		{isActive && <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008000] rounded-full" />}
	</TouchableOpacity>
)

// ============================================================================
// HEADER COMPONENTS
// ============================================================================

interface ShipmentHeaderRightProps {
	isDarkMode: boolean
	onAnnouncement: () => void
	onSearch: () => void
	onDateRange: () => void
	onReport: () => void
	onFilter: () => void
}

const ShipmentHeaderRight = ({
	isDarkMode,
	onAnnouncement,
	onSearch,
	onDateRange,
	onReport,
	onFilter,
}: ShipmentHeaderRightProps) => {
	const menuOptions = [
		{
			label: 'Anunciar viagem',
			icon: <AntDesign name="car" size={18} color={isDarkMode ? colors.white : colors.black} />,
			action: onAnnouncement,
		},
		{
			label: 'Procurar mercadorias',
			icon: (
				<Ionicons
					name="search-outline"
					size={18}
					color={isDarkMode ? colors.white : colors.black}
					style={{ transform: [{ rotate: '90deg' }] }}
				/>
			),
			action: onSearch,
		},
		{
			label: 'Seleccionar período',
			icon: <Ionicons name="calendar-outline" size={18} color={isDarkMode ? colors.white : colors.black} />,
			action: onDateRange,
		},
		{
			label: 'Gerar relatório',
			icon: <Ionicons color={isDarkMode ? colors.white : colors.black} name="document-attach-outline" size={20} />,
			action: onReport,
		},
		{
			label: 'Filtrar mercadorias',
			icon: <Ionicons name="filter-outline" size={18} color={isDarkMode ? colors.white : colors.black} />,
			action: onFilter,
		},
	]

	return (
		<View className="flex flex-row items-center space-x-4">
			<CustomPopUpMenu options={menuOptions} />
		</View>
	)
}

interface ShipmentHeaderTitleProps {
	userDetails: UserDetailsRecord
	startDate: Date
	endDate: Date
	onReset: () => void
}

const ShipmentHeaderTitle = ({ userDetails, startDate, endDate, onReset }: ShipmentHeaderTitleProps) => {
	const [districtName, setDistrictName] = useState<string>('')

	useEffect(() => {
		const fetchDistrictName = async () => {
			if (userDetails?.district_id) {
				try {
					const district = await getDistrictById(userDetails.district_id)
					setDistrictName(district || '')
				} catch (error) {
					console.error('Error fetching district name:', error)
					setDistrictName('')
				}
			} else {
				setDistrictName('')
			}
		}

		fetchDistrictName()
	}, [userDetails?.district_id])

	return (
		<TouchableOpacity className="items-center" activeOpacity={0.5} onPress={onReset}>
			<Text className="text-black dark:text-white text-[14px] font-bold">{districtName || 'Carregando...'}</Text>
			<Text className="text-[#008000] text-[12px] font-bold text-center">
				{getIntlDate(startDate)} - {getIntlDate(endDate)}
			</Text>
		</TouchableOpacity>
	)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ShipmentScreen() {
	// Hooks
	const { userDetails } = useUserDetails()
	const {
		pdfUri,
		setPdfUri,
		setArquiving,
		arquiving,
		resetArquiving,
		reloading,
		setReloading,
		startDate,
		endDate,
		resetStartDate,
		resetEndDate,
	} = useActionStore()
	const isDarkMode = useColorScheme().colorScheme === 'dark'
	const navigation = useNavigation()
	const router = useRouter()
	const { tab } = useLocalSearchParams()

	// State
	const [showDatesRanges, setShowDatesRanges] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [errorAlert, setErrorAlert] = useState(false)
	const [showPreConditions, setShowPreConditions] = useState(false)
	const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(-1)
	const [showFilteringOptions, setShowFiltering] = useState(false)
	const [filteringOptions, setFilteringOptions] = useState<string[]>([])
	const [activeTab, setActiveTab] = useState<TabType>((tab as TabType) || 'VERIFIED')
	const [showShipmentSearch, setShowShipmentSearch] = useState(false)
	const [userDistrictName, setUserDistrictName] = useState<string>('')

	// Data fetching
	const { data: shipments } = useQueryManyAndWatchChanges<
		ShipmentData & {
			has_checkpoint_in_user_district: number
		}
	>(`
		SELECT DISTINCT
			cs.id,
			cs.shipment_number,
			cs.owner_id,
			cs.owner_type,
			cs.status,
			departure_addr.district_id as departure_district_id,
			destination_addr.district_id as destination_district_id,
			departure_dist.name as departure_district_name,
			destination_dist.name as destination_district_name,
			departure_prov.name as departure_province_name,
			destination_prov.name as destination_province_name,
			CASE 
				WHEN cs.owner_type = 'TRADER' THEN (SELECT surname || ' ' || other_names FROM ${TABLES.ACTOR_DETAILS} WHERE actor_id = cs.owner_id)
				WHEN cs.owner_type = 'GROUP' THEN (SELECT other_names FROM ${TABLES.ACTOR_DETAILS} ad 
				 INNER JOIN ${TABLES.ACTORS} a ON ad.actor_id = a.id 
				 WHERE a.id = cs.owner_id AND a.category = 'GROUP')
				WHEN cs.owner_type = 'FARMER' THEN (SELECT surname || ' ' || other_names FROM ${TABLES.ACTOR_DETAILS} WHERE actor_id = cs.owner_id)
				ELSE 'Unknown Owner'
			END as owner_name,
			CASE 
				WHEN EXISTS (
					SELECT 1 
					FROM ${TABLES.SHIPMENT_CHECKPOINT_SEQUENCE} scs2
					JOIN ${TABLES.CHECKPOINTS} sc2 ON scs2.checkpoint_id = sc2.id
					JOIN ${TABLES.ADDRESS_DETAILS} checkpoint_addr2 ON checkpoint_addr2.owner_id = sc2.id AND checkpoint_addr2.owner_type = 'CHECKPOINT'
					WHERE scs2.shipment_id = cs.id 
					AND checkpoint_addr2.district_id = '${userDetails?.district_id}'
				) THEN 1
				ELSE 0
			END as has_checkpoint_in_user_district
		FROM ${TABLES.CASHEW_SHIPMENTS} cs
		JOIN ${TABLES.SHIPMENT_DIRECTIONS} sd ON cs.id = sd.shipment_id
		JOIN ${TABLES.ADDRESS_DETAILS} departure_addr ON sd.departure_address_id = departure_addr.id
		JOIN ${TABLES.ADDRESS_DETAILS} destination_addr ON sd.destination_address_id = destination_addr.id
		JOIN ${TABLES.DISTRICTS} departure_dist ON departure_addr.district_id = departure_dist.id
		JOIN ${TABLES.DISTRICTS} destination_dist ON destination_addr.district_id = destination_dist.id
		JOIN ${TABLES.PROVINCES} departure_prov ON departure_addr.province_id = departure_prov.id
		JOIN ${TABLES.PROVINCES} destination_prov ON destination_addr.province_id = destination_prov.id
		LEFT JOIN ${TABLES.SHIPMENT_CHECKPOINT_SEQUENCE} scs ON cs.id = scs.shipment_id
		LEFT JOIN ${TABLES.CHECKPOINTS} sc ON scs.checkpoint_id = sc.id
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} checkpoint_addr ON checkpoint_addr.owner_id = sc.id AND checkpoint_addr.owner_type = 'CHECKPOINT'
		WHERE (
			departure_addr.district_id = '${userDetails?.district_id}' 
			OR destination_addr.district_id = '${userDetails?.district_id}'
			OR checkpoint_addr.district_id = '${userDetails?.district_id}'
		)
		ORDER BY cs.id DESC
	`)

	// Computed values
	const filteredShipments = useMemo(() => {
		if (!shipments) return []

		// Sort shipments:
		// 1. DELIVERED shipments go to the tail (end)
		// 2. Among non-delivered, shipments coming to user's district come first
		// 3. A shipment is "coming to user's district" if destination_district_id matches user's district
		//    or if any checkpoint in the sequence belongs to user's district
		const sortedShipments = [...shipments].sort((a, b) => {
			const aIsDelivered = a.status === 'DELIVERED'
			const bIsDelivered = b.status === 'DELIVERED'

			// Both delivered: keep original order
			if (aIsDelivered && bIsDelivered) {
				return 0
			}

			// Only a is delivered: a goes to tail
			if (aIsDelivered) {
				return 1
			}

			// Only b is delivered: b goes to tail
			if (bIsDelivered) {
				return -1
			}

			// Neither is delivered: check if coming to user's district
			const aIsComingToUserDistrict =
				a.destination_district_id === userDetails?.district_id || (a as any).has_checkpoint_in_user_district === 1

			const bIsComingToUserDistrict =
				b.destination_district_id === userDetails?.district_id || (b as any).has_checkpoint_in_user_district === 1

			// Both coming to user's district or both not: keep original order
			if (aIsComingToUserDistrict === bIsComingToUserDistrict) {
				return 0
			}

			// a is coming to user's district, b is not: a comes first
			if (aIsComingToUserDistrict) {
				return -1
			}

			// b is coming to user's district, a is not: b comes first
			return 1
		})

		return sortedShipments
	}, [shipments, filteringOptions, arquiving, reloading, userDetails?.district_id])

	// console.log('filteredShipments', filteredShipments)

	const hasResetAll = !showPreConditions && !showShipmentSearch && !showFilteringOptions && !showDatesRanges

	// Event handlers
	const handleTabChange = (tab: TabType) => {
		setActiveTab(tab)
		setReloading(true)
		handleResetAll()
		selectedSlotIndex !== -1 && setSelectedSlotIndex(-1)
	}

	const handleFilter = () => {
		setShowFiltering((s) => !s)
		setFilteringOptions([])
		resetArquiving()
	}

	const handleConfirmFilter = () => {
		setShowFiltering(false)
		setReloading(true)
	}

	const handleShipmentPress = (shipment: ShipmentData) => {
		// console.log('Selected shipment:', shipment.shipment_number)
		router.push(`/trades/transit/shipment-inspection?shipmentId=${shipment.id}` as any)
	}

	const handleShipmentAnnouncement = () => {
		setShowPreConditions(true)
		setShowShipmentSearch(false)
		setShowFiltering(false)
		setShowDatesRanges(false)
	}

	const handleShipmentSearch = () => {
		setShowShipmentSearch(true)
		setShowPreConditions(false)
		setShowFiltering(false)
		setShowDatesRanges(false)
	}

	const handleShipmentDateRange = () => {
		setShowDatesRanges(true)
		setShowPreConditions(false)
		setShowFiltering(false)
		setShowShipmentSearch(false)
	}

	const handleShipmentReport = async () => {
		setReloading(true)
		try {
			const start = new Date(startDate)
			start.setHours(0, 0, 0, 0)
			const end = new Date(endDate)
			end.setHours(23, 59, 59, 999)

			const reportData = await fetchShipmentReportRows({
				startISO: start.toISOString(),
				endISO: end.toISOString(),
				districtId: userDetails?.district_id ?? undefined,
			})

			if (!reportData.length) {
				setErrorMessage('Não há registos para gerar um relatório')
				setErrorAlert(true)
				return
			}

			const roles: UserRoles[] = userDetails?.user_role ? [userDetails.user_role as UserRoles] : []
			const reportUserData: ReportUserData = {
				name: userDetails?.full_name ?? 'N/A',
				district: userDistrictName || 'N/A',
				roles,
			}

			const html = biweeklyReportHTML(reportData, startDate, endDate, reportUserData)
			const uri = await convertHTMLToURI(html)
			setPdfUri(uri)
		} catch (error) {
			console.error('Erro ao gerar relatório de mercadorias:', error)
			setErrorMessage('Não foi possível gerar o relatório. Tente novamente.')
			setErrorAlert(true)
		} finally {
			setReloading(false)
		}
	}

	const handleShipmentFilter = () => {
		setShowFiltering(true)
		setShowPreConditions(false)
		setShowShipmentSearch(false)
		setShowDatesRanges(false)
	}

	const handleResetAll = () => {
		setShowPreConditions(false)
		setShowShipmentSearch(false)
		setShowFiltering(false)
		setShowDatesRanges(false)
	}

	const handleHeaderReset = () => {
		resetStartDate()
		resetEndDate()
		setReloading(true)
		setArquiving(false)
		selectedSlotIndex !== -1 && setSelectedSlotIndex(-1)
	}

	const refreshShipmentList = () => {
		setReloading(true)
		setArquiving(false)
		selectedSlotIndex !== -1 && setSelectedSlotIndex(-1)
	}

	// Effects
	useEffect(() => {
		const updateDistrictName = async () => {
			if (userDetails?.district_id) {
				try {
					const district = await getDistrictById(userDetails.district_id)
					setUserDistrictName(district || '')
				} catch (error) {
					console.error('Erro ao obter nome do distrito:', error)
					setUserDistrictName('')
				}
			} else {
				setUserDistrictName('')
			}
		}

		updateDistrictName()
	}, [userDetails?.district_id])

	useEffect(() => {
		if (reloading) {
			const timeout = setTimeout(() => {
				setReloading(false)
			}, 1000)
			return () => clearTimeout(timeout)
		}
	}, [reloading, setReloading])

	useEffect(() => {
		refreshShipmentList()
	}, [])

	useHeaderOptions()

	useEffect(() => {
		// setReloading(true)
		navigation.setOptions({
			headerTitle: () => (
				<ShipmentHeaderTitle
					userDetails={userDetails || ({} as UserDetailsRecord)}
					startDate={startDate}
					endDate={endDate}
					onReset={handleHeaderReset}
				/>
			),
			headerRight: () => (
				<ShipmentHeaderRight
					isDarkMode={isDarkMode}
					onAnnouncement={handleShipmentAnnouncement}
					onSearch={handleShipmentSearch}
					onDateRange={handleShipmentDateRange}
					onReport={handleShipmentReport}
					onFilter={handleShipmentFilter}
				/>
			),
		})
	}, [endDate, startDate, arquiving, pdfUri, userDetails])

	// Early return for PDF display
	if (pdfUri) {
		return <DisplayPDF />
	}

	// Render content based on current state
	const renderContent = () => {
		if (showShipmentSearch) {
			return <ShipmentSearch />
		}

		if (showFilteringOptions) {
			return (
				<ShipmentFiltering
					handleFilter={handleFilter}
					setFilteringOptions={setFilteringOptions}
					filteringOptions={filteringOptions}
					handleConfirmFilter={handleConfirmFilter}
				/>
			)
		}

		if (reloading) {
			return <FormalShipmentListSkeleton />
		}

		if (activeTab === 'VERIFIED') {
			return (
				<FlatList
					ListHeaderComponent={() => <View className="h-[20px]" />}
					data={filteredShipments}
					renderItem={({ item }: { item: ShipmentData }) => (
						<ShipmentItem shipment={item} onPress={handleShipmentPress} />
					)}
					ListEmptyComponent={() => (
						<View className="flex-1 items-center justify-center h-[200px]">
							<EmptyPlaceholder message="Não há informações sobre o tránsito de mercadorias para o período selecionado" />
						</View>
					)}
					keyExtractor={(item: ShipmentData) => item.id}
				/>
			)
		}

		return <InformalShipmentIndex isLoading={reloading} />
	}

	return (
		<View className="flex-1 bg-white dark:bg-black px-3">
			{/* Tab Navigation */}
			<TabNavigation
				activeTab={activeTab}
				onTabChange={handleTabChange}
				onFilterPress={handleFilter}
				hasResetAll={hasResetAll}
			/>

			{/* Content Area */}
			{renderContent()}

			{/* Modals and Dialogs */}
			<PrecondictionsQuestionnaire visible={showPreConditions} setVisible={setShowPreConditions} />
			<ErrorAlert
				message={errorMessage}
				setMessage={setErrorMessage}
				title=""
				visible={errorAlert}
				setVisible={setErrorAlert}
			/>
			<DatesRange
				visible={showDatesRanges}
				setVisible={setShowDatesRanges}
				selectedSlotIndex={selectedSlotIndex}
				setSelectedSlotIndex={setSelectedSlotIndex}
			/>
		</View>
	)
}
