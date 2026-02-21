import { useEffect, useMemo, useState } from 'react'
import { ScrollView, TouchableOpacity, View, Text } from 'react-native'
import { useUserDetails } from 'src/hooks/queries'
import { useToast } from 'src/components/ToastMessage'
import { useActionStore } from 'src/store/actions/actions'
import FormItemDescription from 'src/components/forms/FormItemDescription'
import {
	buildDistrictGrouping,
	buildProvinceGrouping,
	buildWarehouseGroupForDistrict,
	fetchWarehousePurchases,
	fetchDistrictTransferSummary,
	fetchProvinceTransferSummary,
	fetchProcessingVsExportSummary,
} from 'src/features/district-management/utils/report-helpers'
import {
	cashewBoughtByAdminPostsHTML,
	cashewBoughtByDistrictHTML,
	cashewBoughtByProvinceHTML,
} from 'src/helpers/html/cashewBoughtByAdminPostsHTLM'
import { convertHTMLToURI } from 'src/helpers/pdf'
import { UserRoles } from 'src/types'
import DisplayPDF from 'src/components/data-preview/PdfDisplayer'
import { Ionicons } from '@expo/vector-icons'
import { colors } from 'src/constants'
import { useNavigation } from 'expo-router'
import BackButton from 'src/components/buttons/BackButton'
import { cashewTransfersFlowHTML, cashewProcessingVsExportHTML } from 'src/helpers/html/cashewFlowComparisonsHTML'
import { DrawerActions } from '@react-navigation/native'
import SingleFloatingButton from 'src/components/buttons/SingleFloatingButton'

const ACTIONS = {
	adminPost: {
		title: 'Compras por Posto Administrativo',
		description: 'Resumo das compras por cada posto administrativo do seu distrito.',
		successMessage: 'Relatório por posto administrativo gerado.',
		infoMessage: 'Não há compras registadas para este distrito.',
		icon: 'business-outline',
	},
	district: {
		title: 'Compras por Distrito',
		description: 'Comparativo das compras por distrito dentro da sua província.',
		successMessage: 'Relatório por distrito gerado.',
		infoMessage: 'Não há compras registadas para os distritos selecionados.',
		icon: 'podium-outline',
	},
	province: {
		title: 'Compras por Província',
		description: 'Visão geral das compras por província a nível nacional.',
		successMessage: 'Relatório por província gerado.',
		infoMessage: 'Não há compras registadas para as províncias.',
		icon: 'globe-outline',
	},
	flowTransfers: {
		title: 'Transferências de Caju',
		description: 'Entradas vs saídas no seu distrito e na província.',
		successMessage: 'Relatório de transferências gerado.',
		infoMessage: 'Não foram encontradas transferências registadas para o distrito/província.',
		icon: 'swap-vertical-outline',
	},
	processingVsExport: {
		title: 'Processamento vs Exportação',
		description: 'Comparativo do volume destinado ao processamento e à exportação no país.',
		successMessage: 'Relatório de processamento vs exportação gerado.',
		infoMessage: 'Não foram encontrados registos de processamento ou exportação.',
		icon: 'analytics-outline',
	},
} as const

type ActionKey = keyof typeof ACTIONS

export default function DistrictReportsScreen() {
	const { showSuccess, showError, showInfo } = useToast()
	const { userDetails } = useUserDetails()
	const { setPdfUri, pdfUri } = useActionStore()
	const [isGenerating, setIsGenerating] = useState(false)
	const buttonStyles = useMemo(() => ({ borderColor: colors.primary, borderWidth: 1 }), [])
	const navigation = useNavigation()

	const resolveUserRoles = (): UserRoles[] => {
		const role = (userDetails?.user_role ?? '') as UserRoles
		return role ? [role] : []
	}

	const buildReportUserInfo = (options: { districtName?: string; provinceName?: string }) => ({
		name: userDetails?.full_name ?? 'Usuário',
		province: options.provinceName ?? 'Província desconhecida',
		district: options.districtName ?? 'Distrito desconhecido',
		roles: resolveUserRoles(),
	})

	const runWithGuard = async (actionKey: ActionKey, callback: () => Promise<boolean>) => {
		if (isGenerating) {
			showInfo('Um relatório está a ser gerado. Aguarde por favor.')
			return
		}

		try {
			setIsGenerating(true)
			const success = await callback()
			if (success) {
				showSuccess(ACTIONS[actionKey].successMessage)
			}
		} catch (error) {
			console.error(`Erro ao gerar relatório ${actionKey}`, error)
			showError('Erro ao gerar o relatório. Tente novamente.')
		} finally {
			setIsGenerating(false)
		}
	}

	const handleGenerateAdminPostReport = () =>
		runWithGuard('adminPost', async () => {
			if (!userDetails?.district_id) {
				showError('Distrito do usuário não encontrado.')
				return false
			}

			const warehouses = await fetchWarehousePurchases({ districtId: userDetails.district_id })
			if (!warehouses.length) {
				showInfo(ACTIONS.adminPost.infoMessage)
				return false
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
			return true
		})

	const handleGenerateDistrictReport = () =>
		runWithGuard('district', async () => {
			const provinceId = userDetails?.province_id
			const warehouses = await fetchWarehousePurchases(provinceId ? { provinceId } : {})
			if (!warehouses.length) {
				showInfo(ACTIONS.district.infoMessage)
				return false
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
			return true
		})

	const handleGenerateProvinceReport = () =>
		runWithGuard('province', async () => {
			const warehouses = await fetchWarehousePurchases({})
			if (!warehouses.length) {
				showInfo(ACTIONS.province.infoMessage)
				return false
			}

			const grouped = buildProvinceGrouping(warehouses)
			const userInfo = buildReportUserInfo({
				districtName: 'Todos os distritos',
				provinceName: 'Todas as províncias',
			})
			const html = cashewBoughtByProvinceHTML(grouped, userInfo)
			const uri = await convertHTMLToURI(html)
			setPdfUri(uri)
			return true
		})

	const handleGenerateTransferFlowReport = () =>
		runWithGuard('flowTransfers', async () => {
			if (!userDetails?.province_id) {
				showError('Província do usuário não encontrada.')
				return false
			}

			const [districtSummary, provinceRows] = await Promise.all([
				userDetails?.district_id ? fetchDistrictTransferSummary(userDetails.district_id) : Promise.resolve(null),
				fetchProvinceTransferSummary(userDetails.province_id),
			])

			const normalizedDistrict = districtSummary
				? {
						regionName: districtSummary.region_name ?? 'Distrito desconhecido',
						transferIn: Number(districtSummary.transfer_in ?? 0),
						transferOut: Number(districtSummary.transfer_out ?? 0),
					}
				: null

			const normalizedProvince = (provinceRows ?? []).map((row) => ({
				regionName: row.region_name ?? 'Distrito desconhecido',
				transferIn: Number(row.transfer_in ?? 0),
				transferOut: Number(row.transfer_out ?? 0),
			}))

			const hasDistrictData =
				normalizedDistrict && (normalizedDistrict.transferIn > 0 || normalizedDistrict.transferOut > 0)
			const hasProvinceData = normalizedProvince.some((row) => row.transferIn > 0 || row.transferOut > 0)

			if (!hasDistrictData && !hasProvinceData) {
				showInfo(ACTIONS.flowTransfers.infoMessage)
				return false
			}

			const provinceNameLabel =
				districtSummary?.province_name ?? provinceRows?.[0]?.province_name ?? 'Província desconhecida'

			const html = cashewTransfersFlowHTML(
				{
					district: normalizedDistrict
						? {
								regionName: normalizedDistrict.regionName,
								transferIn: normalizedDistrict.transferIn,
								transferOut: normalizedDistrict.transferOut,
							}
						: null,
					provinceBreakdown: normalizedProvince,
				},
				buildReportUserInfo({
					districtName: normalizedDistrict?.regionName ?? 'Distrito do usuário',
					provinceName: provinceNameLabel,
				}),
			)
			const uri = await convertHTMLToURI(html)
			setPdfUri(uri)
			return true
		})

	const handleGenerateProcessingVsExportReport = () =>
		runWithGuard('processingVsExport', async () => {
			const rows = await fetchProcessingVsExportSummary()
			const normalized = (rows ?? []).map((row) => ({
				provinceName: row.province_name ?? 'Província desconhecida',
				processed: Number(row.processed_qty ?? 0),
				exported: Number(row.exported_qty ?? 0),
			}))

			const hasData = normalized.some((row) => row.processed > 0 || row.exported > 0)
			if (!hasData) {
				showInfo(ACTIONS.processingVsExport.infoMessage)
				return false
			}

			const html = cashewProcessingVsExportHTML(
				normalized,
				buildReportUserInfo({
					districtName: 'Todos os distritos',
					provinceName: 'Todas as províncias',
				}),
			)
			const uri = await convertHTMLToURI(html)
			setPdfUri(uri)
			return true
		})

	const actions = [
		{ key: 'adminPost' as ActionKey, handler: handleGenerateAdminPostReport },
		{ key: 'district' as ActionKey, handler: handleGenerateDistrictReport },
		{ key: 'province' as ActionKey, handler: handleGenerateProvinceReport },
		{ key: 'flowTransfers' as ActionKey, handler: handleGenerateTransferFlowReport },
		{ key: 'processingVsExport' as ActionKey, handler: handleGenerateProcessingVsExportReport },
	]

	useEffect(() => {}, [])

	if (pdfUri) {
		return <DisplayPDF />
	}

	return (
		<>
			<ScrollView
				showsVerticalScrollIndicator={false}
				className="flex-1 bg-white dark:bg-black px-4 py-4"
				contentContainerStyle={{ paddingBottom: 32 }}
			>
				<FormItemDescription description="Gerar relatórios do distrito" />
				<View className="space-y-4 mt-4">
					{actions.map(({ key, handler }) => (
						<TouchableOpacity
							key={key}
							onPress={handler}
							disabled={isGenerating}
							className={`rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 bg-white dark:bg-neutral-900 shadow-sm ${
								isGenerating ? 'opacity-70' : 'opacity-100'
							}`}
						>
							<View className="flex-row items-start justify-between">
								<View className="flex-1 pr-4">
									<View className="flex-row items-center">
										<Ionicons
											name={ACTIONS[key].icon as keyof typeof Ionicons.glyphMap}
											size={22}
											color={colors.primary}
										/>
										<Text className="ml-3 text-base font-semibold text-neutral-900 dark:text-white">
											{ACTIONS[key].title}
										</Text>
									</View>
									<Text className="text-sm text-neutral-600 dark:text-neutral-300 mt-3 leading-5">
										{ACTIONS[key].description}
									</Text>
								</View>
								<Ionicons name="chevron-forward" size={20} color={colors.primary} />
							</View>
							<View className="mt-5 flex-row items-center justify-between">
								<View className="flex-row items-center rounded-full px-3 py-2" style={buttonStyles}>
									<Ionicons
										name={isGenerating ? 'time-outline' : 'download-outline'}
										size={18}
										color={colors.primary}
									/>
									<Text className="ml-2 text-sm font-semibold" style={{ color: colors.primary }}>
										{isGenerating ? 'A gerar...' : 'Gerar relatório'}
									</Text>
								</View>
								<Text className="text-xs text-neutral-500 dark:text-neutral-400">
									{isGenerating ? 'Aguarde a conclusão do relatório.' : 'Toque para gerar o relatório.'}
								</Text>
							</View>
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>
			<SingleFloatingButton icon="arrow-right" route="/(tabs)/user/district-management" />
		</>
	)
}
