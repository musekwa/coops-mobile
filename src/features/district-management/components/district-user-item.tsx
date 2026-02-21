import { UserDetailsRecord } from 'src/library/powersync/schemas/AppSchema'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import CustomPopUpMenu from 'src/components/menus/CustomPopUpMenu'
import { PopMenuOption, UserRoles } from 'src/types'
import { Image } from 'expo-image'
import { avatarPlaceholderUri } from 'src/constants/imageURI'
import { AUTH_CODES } from 'src/data/auth_codes'
import { useState, useEffect } from 'react'
import { updateUserDetails } from 'src/library/supabase/user-auth'
import { useToast } from 'src/components/ToastMessage'
import CustomConfirmDialg from 'src/components/dialogs/CustomConfirmDialg'
import { updateDistrictUserDetailsById } from 'src/library/sqlite/updates'
import { useUserDetails } from 'src/hooks/queries'
import { useActionStore } from 'src/store/actions/actions'
import {
	buildDistrictGrouping,
	buildProvinceGrouping,
	buildWarehouseGroupForDistrict,
	fetchWarehousePurchases,
} from 'src/features/district-management/utils/report-helpers'
import {
	cashewBoughtByAdminPostsHTML,
	cashewBoughtByDistrictHTML,
	cashewBoughtByProvinceHTML,
} from 'src/helpers/html/cashewBoughtByAdminPostsHTLM'
import { convertHTMLToURI } from 'src/helpers/pdf'

type DistrictUserItemProps = {
	item: UserDetailsRecord
	onStatusUpdate?: () => void // Callback to refresh parent data
}

export default function DistrictUserItem({ item, onStatusUpdate }: DistrictUserItemProps) {
	const { showSuccess, showError, showInfo } = useToast()
	const { userDetails: currentUser } = useUserDetails()
	const { setPdfUri } = useActionStore()
	const [showConfirmDialog, setShowConfirmDialog] = useState(false)
	const [selectedAction, setSelectedAction] = useState<string>('')
	const [localUserStatus, setLocalUserStatus] = useState(item.status) // Local status state
	const [isGeneratingReport, setIsGeneratingReport] = useState(false)
	const [potentialActions, setPotentialActions] = useState<{
		canBeAuthorized: boolean
		canBeBlocked: boolean
		canBeTransferred: boolean
		canBeBanned: boolean
	}>({
		canBeAuthorized: false,
		canBeBlocked: false,
		canBeTransferred: false,
		canBeBanned: false,
	})

	// Update local status when item.status changes (e.g., from parent refresh)
	useEffect(() => {
		setLocalUserStatus(item.status)
	}, [item.status])

	// Set potential actions based on user status
	useEffect(() => {
		if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.AUTHORIZED) {
			setPotentialActions({
				canBeAuthorized: false,
				canBeBlocked: true,
				canBeTransferred: true,
				canBeBanned: false,
			})
		} else if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.BLOCKED) {
			setPotentialActions({
				canBeAuthorized: true,
				canBeBlocked: false,
				canBeTransferred: false,
				canBeBanned: false,
			})
		} else if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.BANNED) {
			setPotentialActions({
				canBeAuthorized: false,
				canBeBlocked: false,
				canBeTransferred: false,
				canBeBanned: true,
			})
		} else if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.EMAIL_PENDING_VERIFICATION) {
			setPotentialActions({
				canBeAuthorized: false,
				canBeBlocked: false,
				canBeTransferred: false,
				canBeBanned: false,
			})
		} else if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED) {
			setPotentialActions({
				canBeAuthorized: true,
				canBeBlocked: false,
				canBeTransferred: false,
				canBeBanned: false,
			})
		} else {
			setPotentialActions({
				canBeAuthorized: false,
				canBeBlocked: false,
				canBeTransferred: false,
				canBeBanned: false,
			})
		}
	}, [localUserStatus])

	const resolveUserRoles = (): UserRoles[] => {
		const role = (currentUser?.user_role ?? '') as UserRoles
		return role ? [role] : []
	}

	const buildReportUserInfo = (options: { districtName?: string; provinceName?: string }) => ({
		name: currentUser?.full_name ?? 'Usuário',
		province: options.provinceName ?? 'Província desconhecida',
		district: options.districtName ?? 'Distrito desconhecido',
		roles: resolveUserRoles(),
	})

	const handleGenerateAdminPostReport = async () => {
		if (isGeneratingReport) {
			showInfo('Um relatório está a ser gerado. Aguarde por favor.')
			return
		}

		try {
			setIsGeneratingReport(true)
			if (!item.district_id) {
				showError('Distrito do usuário não encontrado.')
				return
			}

			const warehouses = await fetchWarehousePurchases({ districtId: item.district_id })

			if (!warehouses.length) {
				showInfo('Não há compras registadas para este distrito.')
				return
			}

			const grouped = buildWarehouseGroupForDistrict(warehouses)
			const reference = warehouses[0]
			const userInfo = buildReportUserInfo({
				districtName: reference.district_name,
				provinceName: reference.province_name,
			})
			const html = cashewBoughtByAdminPostsHTML(grouped, userInfo)
			const uri = await convertHTMLToURI(html)
			setPdfUri(uri)
			showSuccess('Relatório por posto administrativo gerado.')
		} catch (error) {
			console.error('Erro ao gerar relatório por posto administrativo', error)
			showError('Erro ao gerar o relatório. Tente novamente.')
		} finally {
			setIsGeneratingReport(false)
		}
	}

	const handleGenerateDistrictReport = async () => {
		if (isGeneratingReport) {
			showInfo('Um relatório está a ser gerado. Aguarde por favor.')
			return
		}

		try {
			setIsGeneratingReport(true)
			const provinceId = item.province_id
			const warehouses = await fetchWarehousePurchases(provinceId ? { provinceId } : {})

			if (!warehouses.length) {
				showInfo('Não há compras registadas para os distritos selecionados.')
				return
			}

			const grouped = buildDistrictGrouping(warehouses)
			const reference = warehouses[0]
			const userInfo = buildReportUserInfo({
				districtName: 'Todos os distritos',
				provinceName: reference.province_name,
			})
			const html = cashewBoughtByDistrictHTML(grouped, userInfo)
			const uri = await convertHTMLToURI(html)
			setPdfUri(uri)
			showSuccess('Relatório por distrito gerado.')
		} catch (error) {
			console.error('Erro ao gerar relatório por distrito', error)
			showError('Erro ao gerar o relatório. Tente novamente.')
		} finally {
			setIsGeneratingReport(false)
		}
	}

	const handleGenerateProvinceReport = async () => {
		if (isGeneratingReport) {
			showInfo('Um relatório está a ser gerado. Aguarde por favor.')
			return
		}

		try {
			setIsGeneratingReport(true)
			const warehouses = await fetchWarehousePurchases({})

			if (!warehouses.length) {
				showInfo('Não há compras registadas para as províncias.')
				return
			}

			const grouped = buildProvinceGrouping(warehouses)
			const userInfo = buildReportUserInfo({
				districtName: 'Todos os distritos',
				provinceName: 'Todas as províncias',
			})
			const html = cashewBoughtByProvinceHTML(grouped, userInfo)
			const uri = await convertHTMLToURI(html)
			setPdfUri(uri)
			showSuccess('Relatório por província gerado.')
		} catch (error) {
			console.error('Erro ao gerar relatório por província', error)
			showError('Erro ao gerar o relatório. Tente novamente.')
		} finally {
			setIsGeneratingReport(false)
		}
	}

	const handleAuthorize = async () => {
		if (!item.email) {
			return
		}
		try {
			const { success, message } = await updateUserDetails(
				{ status: AUTH_CODES.USER_DETAILS_STATUS.AUTHORIZED },
				item.email,
			)
			if (!success) {
				showError(message)
				return
			}
			// Update local status immediately
			setLocalUserStatus(AUTH_CODES.USER_DETAILS_STATUS.AUTHORIZED)

			showSuccess('Usuário autorizado com sucesso')

			// Close dialog and refresh parent data
			setShowConfirmDialog(false)
			onStatusUpdate?.()
		} catch (error) {
			showError('Erro ao autorizar usuário')
		}
	}

	const handleBlock = async () => {
		if (!item.user_id) {
			return
		}
		try {
			// Update local status immediately
			setLocalUserStatus(AUTH_CODES.USER_DETAILS_STATUS.BLOCKED)

			showSuccess('Usuário bloqueado com sucesso')

			// Close dialog and refresh parent data
			setShowConfirmDialog(false)
			onStatusUpdate?.()
		} catch (error) {
			showError('Erro ao bloquear usuário')
		}
	}

	const handleBan = async () => {
		if (!item.user_id) {
			return
		}
		try {
			// Update local status immediately
			setLocalUserStatus(AUTH_CODES.USER_DETAILS_STATUS.BANNED)

			showSuccess('Usuário banido com sucesso')

			// Close dialog and refresh parent data
			setShowConfirmDialog(false)
			onStatusUpdate?.()
		} catch (error) {
			showError('Erro ao banir usuário')
		}
	}

	const handleTransfer = async () => {
		// TODO: Implement transfer logic
		console.log('Transferir usuário:', item.id)
		showInfo('Funcionalidade de transferência em desenvolvimento')
		// Close dialog
		setShowConfirmDialog(false)
	}

	const openConfirmDialog = (action: string) => {
		setSelectedAction(action)
		setShowConfirmDialog(true)
	}

	const getConfirmDialogConfig = () => {
		switch (selectedAction) {
			case 'authorize':
				return {
					title: 'Autorizar Usuário',
					message: 'Tem a certeza que deseja autorizar este usuário?',
					yesText: 'Autorizar',
					noText: 'Cancelar',
					yesCallback: handleAuthorize,
				}
			case 'block':
				return {
					title: 'Bloquear Usuário',
					message: 'Tem a certeza que deseja bloquear este usuário?',
					yesText: 'Bloquear',
					noText: 'Cancelar',
					yesCallback: handleBlock,
				}
			case 'ban':
				return {
					title: 'Banir Usuário',
					message: 'Tem a certeza que deseja banir este usuário? Esta ação é irreversível.',
					yesText: 'Banir',
					noText: 'Cancelar',
					yesCallback: handleBan,
				}
			case 'transfer':
				return {
					title: 'Transferir Usuário',
					message: 'Tem a certeza que deseja transferir este usuário?',
					yesText: 'Transferir',
					noText: 'Cancelar',
					yesCallback: handleTransfer,
				}
			default:
				return {
					title: 'Confirmar Ação',
					message: 'Tem a certeza que deseja executar esta ação?',
					yesText: 'Confirmar',
					noText: 'Cancelar',
					yesCallback: () => {},
				}
		}
	}

	// const reportMenuOptions: PopMenuOption[] = [
	// 	{
	// 		label: 'Relatório - Postos Adm.',
	// 		icon: <Ionicons name="document-text-outline" size={18} color={colors.primary} />,
	// 		action: handleGenerateAdminPostReport,
	// 	},
	// 	{
	// 		label: 'Relatório - Distritos',
	// 		icon: <Ionicons name="bar-chart-outline" size={18} color={colors.primary} />,
	// 		action: handleGenerateDistrictReport,
	// 	},
	// 	{
	// 		label: 'Relatório - Províncias',
	// 		icon: <Ionicons name="podium-outline" size={18} color={colors.primary} />,
	// 		action: handleGenerateProvinceReport,
	// 	},
	// ]

	const menuOptions: PopMenuOption[] = [
		// ...reportMenuOptions,
		// Only show Authorize if user can be authorized
		...(potentialActions.canBeAuthorized
			? [
					{
						label: 'Autorizar',
						icon: <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />,
						action: () => openConfirmDialog('authorize'),
					},
				]
			: []),

		// Only show Block if user can be blocked
		...(potentialActions.canBeBlocked
			? [
					{
						label: 'Bloquear',
						icon: <Ionicons name="close-circle-outline" size={18} color="#ef4444" />,
						action: () => openConfirmDialog('block'),
					},
				]
			: []),

		// Only show Ban if user can be banned
		...(potentialActions.canBeBanned
			? [
					{
						label: 'Banir',
						icon: <Ionicons name="ban-outline" size={18} color="#ef4444" />,
						action: () => openConfirmDialog('ban'),
					},
				]
			: []),

		// Only show Transfer if user can be transferred
		...(potentialActions.canBeTransferred
			? [
					{
						label: 'Transferir',
						icon: <Ionicons name="arrow-forward-outline" size={18} color={colors.primary} />,
						action: () => openConfirmDialog('transfer'),
					},
				]
			: []),
	]

	const getUserRole = () => {
		if (item.user_role === UserRoles.FIELD_AGENT) {
			return 'Extensionista'
		} else if (item.user_role === UserRoles.INSPECTOR) {
			return 'Fiscal'
		} else if (item.user_role === UserRoles.COOP_ADMIN) {
			return 'Gestor de Cooperativa'
		} else if (item.user_role === UserRoles.SUPERVISOR) {
			return 'Supervisor'
		} else {
			return 'Usuário'
		}
	}

	const getUserStatus = () => {
		if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.AUTHORIZED) {
			return 'Autorizado'
		} else if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.BLOCKED) {
			return 'Bloqueado'
		} else if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.BANNED) {
			return 'Banido'
		} else if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.EMAIL_PENDING_VERIFICATION) {
			return 'Email pendente de verificação'
		} else if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED) {
			return 'Não autorizado'
		} else {
			return 'Pendente de verificação'
		}
	}

	const getStatusColor = () => {
		if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.AUTHORIZED) {
			return {
				textColor: 'text-green-700 dark:text-green-400',
				bgColor: 'bg-green-100 dark:bg-green-900/30',
				borderColor: 'border-green-200 dark:border-green-800',
			}
		} else if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.BLOCKED) {
			return {
				textColor: 'text-red-700 dark:text-red-400',
				bgColor: 'bg-red-100 dark:bg-red-900/30',
				borderColor: 'border-red-200 dark:border-red-800',
			}
		} else if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.BANNED) {
			return {
				textColor: 'text-red-800 dark:text-red-300',
				bgColor: 'bg-red-200 dark:bg-red-900/50',
				borderColor: 'border-red-300 dark:border-red-700',
			}
		} else if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.EMAIL_PENDING_VERIFICATION) {
			return {
				textColor: 'text-yellow-700 dark:text-yellow-400',
				bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
				borderColor: 'border-yellow-200 dark:border-yellow-800',
			}
		} else if (localUserStatus === AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED) {
			return {
				textColor: 'text-orange-700 dark:text-orange-400',
				bgColor: 'bg-orange-100 dark:bg-orange-900/30',
				borderColor: 'border-orange-200 dark:border-orange-800',
			}
		} else {
			return {
				textColor: 'text-gray-700 dark:text-gray-400',
				bgColor: 'bg-gray-100 dark:bg-gray-700/50',
				borderColor: 'border-gray-200 dark:border-gray-600',
			}
		}
	}

	const statusColors = getStatusColor()
	const dialogConfig = getConfirmDialogConfig()

	return (
		<View className="bg-white dark:bg-gray-800 rounded-lg px-3 py-1 mb-2 shadow-sm border border-gray-100 dark:border-gray-700">
			<View className="flex-row space-x-2">
				<View className="w-[15%] items-center justify-center">
					<Image
						source={{ uri: avatarPlaceholderUri }}
						style={{ width: 40, height: 40, borderRadius: 20 }}
						contentFit="cover"
					/>
				</View>

				<View className="flex-1">
					<Text className="text-[14px] font-bold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
						{item.full_name}
					</Text>
					<View className="flex-row items-center mb-2 justify-between">
						<View className={`px-2 py-1 rounded-full border ${statusColors.bgColor} ${statusColors.borderColor}`}>
							<Text className={`text-[11px] font-medium ${statusColors.textColor}`}>{getUserStatus()}</Text>
						</View>
						<View className="flex-row items-center">
							<Text className="text-xs text-gray-600 dark:text-gray-400">{getUserRole()}</Text>
						</View>
					</View>
				</View>

				{/* Right side - Menu and status */}
				<View className="w-[10%] items-center justify-center">
					{/* Menu button */}
					<CustomPopUpMenu
						options={menuOptions}
						title={`${item.full_name?.split(' ')[0]}`}
						icon={<Ionicons name="ellipsis-vertical" size={24} color={colors.primary} />}
					/>
				</View>
			</View>

			<CustomConfirmDialg
				visible={showConfirmDialog}
				setVisible={setShowConfirmDialog}
				yesCallback={dialogConfig.yesCallback}
				noCallback={() => setShowConfirmDialog(false)}
				yesText={dialogConfig.yesText}
				noText={dialogConfig.noText}
				message={dialogConfig.message}
				title={dialogConfig.title}
			/>
		</View>
	)
}
