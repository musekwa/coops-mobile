import { create } from 'zustand'

export interface InfoProviderData {
	info_provider_id: string
	info_provider_name: string
}

export interface InfoProviderState {
	hasSelectedInfoProvider: boolean
	infoProvider: InfoProviderData
	setHasSelectedInfoProvider: (hasSelectedInfoProvider: boolean) => void
	setInfoProvider: (infoProvider: InfoProviderData) => void
	resetInfoProvider: () => void
	getInfoProvider: () => InfoProviderState
	assertInfoProvider: () => { status: boolean; message: string }
}

export interface AggregatedInfoState {
	hasAggregated: boolean
	activeParticipantParticipations: {
		participant_id: string
		participant_type: string
		quantity: number
		participant_name: string
	}[]
}

export interface AggregatedInfo extends AggregatedInfoState {
	setHasAggregated: (hasAggregated: boolean) => void
	setAggregatedInfo: (aggregatedInfo: AggregatedInfoState) => void
	resetAggregatedInfo: () => void
	getAggregatedInfo: () => AggregatedInfoState
	assertAggregatedInfo: () => { status: boolean; message: string; quantity: number }
}

export interface TransferredByOrgInfoState {
	hasTransferredByOrg: boolean
	transfersOrganizations: {
		group_id: string
		group_name: string
		organization_type: string
		quantity: number
	}[]
}

export interface TransferredByOrgInfo extends TransferredByOrgInfoState {
	setHasTransferredByOrg: (hasTransferredByOrg: boolean) => void
	setTransferredByOrgInfo: (transferredByOrgInfo: TransferredByOrgInfoState) => void
	resetTransferredByOrgInfo: () => void
	getTransferredByOrgInfo: () => TransferredByOrgInfoState
	assertTransferredByOrgInfo: () => { status: boolean; message: string; quantity: number }
	removeOrganization: ({ group_id }: { group_id: string }) => void
	updateOrganizationQuantity: ({ group_id, quantity }: { group_id: string; quantity: number }) => void
	setOrganizationAndQuantity: ({
		group_id,
		group_name,
		organization_type,
		quantity,
	}: {
		group_id: string
		group_name: string
		organization_type: string
		quantity: number
	}) => void
}

export interface BoughtInfo {
	hasBought: boolean
	quantityBought: number
	boughtPrice: number

	setBoughtInfo: (boughtInfo: BoughtInfo) => void
	setQuantityBought: (quantityBought: number) => void
	setBoughtPrice: (boughtPrice: number) => void
	setHasBought: (hasBought: boolean) => void
	resetBoughtInfo: () => void
	getBoughtInfo: () => BoughtInfo
	assertBoughtInfo: () => { status: boolean; message: string; quantity: number }
}

export interface ResoldInfo {
	hasResold: boolean
	quantityResold: number
	resoldPrice: number

	setResoldInfo: (resoldInfo: ResoldInfo) => void
	setQuantityResold: (quantityResold: number) => void
	setResoldPrice: (resoldPrice: number) => void
	setHasResold: (hasResold: boolean) => void
	resetResoldInfo: () => void
	getResoldInfo: () => ResoldInfo
	assertResoldInfo: () => { status: boolean; message: string; quantity: number }
}

export interface TransferredInfoState {
	hasTransferred: boolean
	transfersWarehouses: {
		warehouse_id: string
		warehouse_label: string
		warehouse_type: string
		quantity: number
	}[]
}

export interface TransferredInfo extends TransferredInfoState {
	setHasTransferred: (hasTransferred: boolean) => void
	setTransferredInfo: (transferredInfo: TransferredInfoState) => void
	resetTransferredInfo: () => void
	getTransferredInfo: () => TransferredInfoState
	setWarehouseAndQuantity: ({
		warehouse_id,
		warehouse_label,
		warehouse_type,
		quantity,
	}: {
		warehouse_id: string
		warehouse_label: string
		warehouse_type: string
		quantity: number
	}) => void
	updateWarehouseQuantity: ({ warehouse_id, quantity }: { warehouse_id: string; quantity: number }) => void
	removeWarehouse: ({ warehouse_id }: { warehouse_id: string }) => void
	assertTransferredInfo: () => { status: boolean; message: string; quantity: number }
}

export interface ReceivedInfo {
	hasReceivedTransfer: boolean
	quantityReceived: number
	receivedFromWarehouseId: string
	receivedFromWarehouseLabel: string
}

export interface ExportationInfoState {
	hasSentToExportation: boolean
	exportations: {
		country: string
		quantity: number
	}[]
}

export interface ExportationInfo extends ExportationInfoState {
	setHasSentToExportation: (hasSentToExportation: boolean) => void
	setExportationInfo: (exportationInfo: ExportationInfoState) => void
	resetExportationInfo: () => void
	getExportationInfo: () => ExportationInfoState
	setCountryAndQuantity: ({ country, quantity }: { country: string; quantity: number }) => void
	assertExportationInfo: () => { status: boolean; message: string; quantity: number }
}

export interface ProcessingInfoState {
	hasSentToProcessing: boolean
	processingWarehouses: {
		warehouse_id: string
		warehouse_label: string
		warehouse_type: string
		quantity: number
	}[]
}

export interface ProcessingInfo extends ProcessingInfoState {
	setHasSentToProcessing: (hasSentToProcessing: boolean) => void
	setProcessingInfo: (processingInfo: ProcessingInfoState) => void
	resetProcessingInfo: () => void
	getProcessingInfo: () => ProcessingInfoState
	setWarehouseAndQuantity: ({
		warehouse_id,
		warehouse_label,
		warehouse_type,
		quantity,
	}: {
		warehouse_id: string
		warehouse_label: string
		warehouse_type: string
		quantity: number
	}) => void
	updateWarehouseQuantity: ({ warehouse_id, quantity }: { warehouse_id: string; quantity: number }) => void
	removeWarehouse: ({ warehouse_id }: { warehouse_id: string }) => void
	assertProcessingInfo: () => { status: boolean; message: string; quantity: number }
}

export interface LostInfo {
	hasLost: boolean
	quantityLost: number
	setLostInfo: (lostInfo: LostInfo) => void
	setQuantityLost: (quantityLost: number) => void
	setHasLost: (hasLost: boolean) => void
	resetLostInfo: () => void
	getLostInfo: () => LostInfo
	assertLostInfo: () => { status: boolean; message: string; quantity: number }
}

export interface DateRange {
	startDate: Date | null
	endDate: Date | null
	setStartDate: (startDate: Date | null) => void
	setEndDate: (endDate: Date | null) => void
	getDateRange: () => DateRange
	resetDateRange: () => void
	assertDateRange: () => { status: boolean; message: string }
}

export const useInfoProviderStore = create<InfoProviderState>((set, get) => ({
	hasSelectedInfoProvider: false,
	infoProvider: {
		info_provider_id: '',
		info_provider_name: '',
	},
	setHasSelectedInfoProvider: (hasSelectedInfoProvider: boolean) => set({ hasSelectedInfoProvider }),
	setInfoProvider: (infoProvider: InfoProviderData) => set({ infoProvider }),
	resetInfoProvider: () =>
		set({ hasSelectedInfoProvider: false, infoProvider: { info_provider_id: '', info_provider_name: '' } }),
	getInfoProvider: () => get(),
	assertInfoProvider: () => {
		const { hasSelectedInfoProvider, infoProvider } = get()
		if (!hasSelectedInfoProvider) {
			return { status: false, message: 'Selecione um fornecedor de informações.' }
		}
		if (!infoProvider.info_provider_id) {
			return { status: false, message: 'Selecione um fornecedor de informações.' }
		}
		return { status: true, message: '' }
	},
}))

export const useBoughtInfoStore = create<BoughtInfo>((set, get) => ({
	hasBought: false,
	quantityBought: 0,
	boughtPrice: 0,

	setBoughtInfo: (boughtInfo: BoughtInfo) => set(boughtInfo),
	setQuantityBought: (quantityBought: number) => set({ quantityBought }),
	setBoughtPrice: (boughtPrice: number) => set({ boughtPrice }),
	setHasBought: (hasBought: boolean) => set({ hasBought }),
	resetBoughtInfo: () =>
		set({
			hasBought: false,
			quantityBought: 0,
			boughtPrice: 0,
		}),
	getBoughtInfo: () => get(),
	assertBoughtInfo: () => {
		const { hasBought, boughtPrice, quantityBought } = get()

		if (hasBought) {
			if (!boughtPrice && !quantityBought) {
				return { status: false, message: 'As informações de compras são obrigatórias.', quantity: quantityBought }
			}
			if (boughtPrice && !quantityBought) {
				return { status: false, message: 'Indica a quantidade comprada.', quantity: quantityBought }
			}
			if (!boughtPrice && quantityBought) {
				return { status: false, message: 'Indica o preço de compra.', quantity: quantityBought }
			}
			if (boughtPrice <= 5) {
				return { status: false, message: 'O preço de compra deve ser maior que 5 MZN.', quantity: quantityBought }
			}
			if (quantityBought <= 5) {
				return { status: false, message: 'A quantidade comprada deve ser maior que 5 Kg.', quantity: quantityBought }
			}
		}
		return { status: true, message: '', quantity: quantityBought }
	},
}))

export const useResoldInfoStore = create<ResoldInfo>((set, get) => ({
	hasResold: false,
	quantityResold: 0,
	resoldPrice: 0,

	setResoldInfo: (resoldInfo: ResoldInfo) => set(resoldInfo),
	resetResoldInfo: () =>
		set({
			hasResold: false,
			quantityResold: 0,
			resoldPrice: 0,
		}),
	getResoldInfo: () => get(),
	setQuantityResold: (quantityResold: number) => set({ quantityResold }),
	setResoldPrice: (resoldPrice: number) => set({ resoldPrice }),
	setHasResold: (hasResold: boolean) => set({ hasResold }),
	assertResoldInfo: () => {
		const { hasResold, resoldPrice, quantityResold } = get()

		if (hasResold) {
			if (!resoldPrice && !quantityResold) {
				return { status: false, message: 'As informações de vendas são obrigatórias.', quantity: quantityResold }
			}
			if (resoldPrice && !quantityResold) {
				return { status: false, message: 'Indica a quantidade vendida.', quantity: quantityResold }
			}
			if (!resoldPrice && quantityResold) {
				return { status: false, message: 'Indica o preço de venda.', quantity: quantityResold }
			}
			if (resoldPrice <= 5) {
				return { status: false, message: 'O preço de venda deve ser maior que 5 MZN.', quantity: quantityResold }
			}
			if (quantityResold <= 5) {
				return { status: false, message: 'A quantidade vendida deve ser maior que 5 Kg.', quantity: quantityResold }
			}
		}
		return { status: true, message: '', quantity: quantityResold }
	},
}))

export const useAggregatedInfoStore = create<AggregatedInfo>((set, get) => ({
	hasAggregated: false,
	activeParticipantParticipations: [],
	setHasAggregated: (hasAggregated: boolean) => set({ hasAggregated }),
	setAggregatedInfo: (aggregatedInfo: AggregatedInfoState) => set(aggregatedInfo),
	resetAggregatedInfo: () => set({ hasAggregated: false, activeParticipantParticipations: [] }),
	getAggregatedInfo: () => get(),
	assertAggregatedInfo: () => {
		const { hasAggregated, activeParticipantParticipations } = get()
		if (hasAggregated) {
			if (activeParticipantParticipations.length === 0) {
				return {
					status: false,
					message: 'Indica os membros que participaram da agregação.',
					quantity: activeParticipantParticipations.reduce((acc, p) => acc + p.quantity, 0),
				}
			}
			if (activeParticipantParticipations.some((p) => p.quantity <= 0)) {
				return {
					status: false,
					message: 'A participação deve ser maior que 0 Kg.',
					quantity: activeParticipantParticipations.reduce((acc, p) => acc + p.quantity, 0),
				}
			}
		}
		return {
			status: true,
			message: '',
			quantity: activeParticipantParticipations.reduce((acc, p) => acc + p.quantity, 0),
		}
	},
}))

export const useTransferredByOrgInfoStore = create<TransferredByOrgInfo>((set, get) => ({
	hasTransferredByOrg: false,
	transfersOrganizations: [],
	setHasTransferredByOrg: (hasTransferredByOrg: boolean) => set({ hasTransferredByOrg }),
	setTransferredByOrgInfo: (transferredByOrgInfo: TransferredByOrgInfoState) => set(transferredByOrgInfo),
	resetTransferredByOrgInfo: () => set({ hasTransferredByOrg: false, transfersOrganizations: [] }),
	getTransferredByOrgInfo: () => get(),
	setOrganizationAndQuantity: ({
		group_id,
		group_name,
		organization_type,
		quantity,
	}: {
		group_id: string
		group_name: string
		organization_type: string
		quantity: number
	}) =>
		set((state) => ({
			transfersOrganizations: state.transfersOrganizations.map((o) =>
				o.group_id === group_id ? { ...o, quantity } : o,
			),
		})),
	updateOrganizationQuantity: ({ group_id, quantity }: { group_id: string; quantity: number }) =>
		set((state) => ({
			transfersOrganizations: state.transfersOrganizations.map((o) =>
				o.group_id === group_id ? { ...o, quantity } : o,
			),
		})),
	removeOrganization: ({ group_id }: { group_id: string }) =>
		set((state) => ({
			transfersOrganizations: state.transfersOrganizations.filter((o) => o.group_id !== group_id),
		})),
	assertTransferredByOrgInfo: () => {
		const { hasTransferredByOrg, transfersOrganizations } = get()

		if (hasTransferredByOrg) {
			if (transfersOrganizations.length === 0) {
				return {
					status: false,
					message: 'Indica a união para a qual transferiu a castanha.',
					quantity: transfersOrganizations.reduce((acc, o) => acc + o.quantity, 0),
				}
			}
			if (transfersOrganizations.some((o) => o.quantity <= 0)) {
				return {
					status: false,
					message: 'A quantidade deve ser maior que 0 Kg.',
					quantity: transfersOrganizations.reduce((acc, o) => acc + o.quantity, 0),
				}
			}
		}
		return { status: true, message: '', quantity: transfersOrganizations.reduce((acc, o) => acc + o.quantity, 0) }
	},
}))

export const useTransferredInfoStore = create<TransferredInfo>((set, get) => ({
	hasTransferred: false,
	transfersWarehouses: [],
	setHasTransferred: (hasTransferred: boolean) => set({ hasTransferred }),
	setTransferredInfo: (transferredInfo: TransferredInfoState) => set(transferredInfo),
	resetTransferredInfo: () => set({ hasTransferred: false, transfersWarehouses: [] }),
	getTransferredInfo: () => get(),
	setWarehouseAndQuantity: ({ warehouse_id, warehouse_label, warehouse_type, quantity }) =>
		set((state) => ({
			transfersWarehouses: state.transfersWarehouses.map((w) =>
				w.warehouse_id === warehouse_id ? { ...w, quantity } : w,
			),
		})),
	updateWarehouseQuantity: ({ warehouse_id, quantity }) =>
		set((state) => ({
			transfersWarehouses: state.transfersWarehouses.map((w) =>
				w.warehouse_id === warehouse_id ? { ...w, quantity } : w,
			),
		})),
	removeWarehouse: ({ warehouse_id }) =>
		set((state) => ({
			transfersWarehouses: state.transfersWarehouses.filter((w) => w.warehouse_id !== warehouse_id),
		})),
	assertTransferredInfo: () => {
		const { hasTransferred, transfersWarehouses } = get()

		if (hasTransferred) {
			if (transfersWarehouses.length === 0) {
				return {
					status: false,
					message: 'Indica pelo menos uma transferência.',
					quantity: transfersWarehouses.reduce((acc, w) => acc + w.quantity, 0),
				}
			}
			if (transfersWarehouses.some((w) => w.quantity <= 0)) {
				return {
					status: false,
					message: 'A quantidade deve ser maior que 0 Kg.',
					quantity: transfersWarehouses.reduce((acc, w) => acc + w.quantity, 0),
				}
			}
		}
		return { status: true, message: '', quantity: transfersWarehouses.reduce((acc, w) => acc + w.quantity, 0) }
	},
}))

export const useReceivedInfoStore = create<ReceivedInfo>((set, get) => ({
	hasReceivedTransfer: false,
	quantityReceived: 0,
	receivedFromWarehouseId: '',
	receivedFromWarehouseLabel: '',

	setReceivedInfo: (receivedInfo: ReceivedInfo) => set(receivedInfo),
	resetReceivedInfo: () =>
		set({
			hasReceivedTransfer: false,
			quantityReceived: 0,
			receivedFromWarehouseId: '',
			receivedFromWarehouseLabel: '',
		}),
	getReceivedInfo: () => get(),
}))

export const useExportationInfoStore = create<ExportationInfo>((set, get) => ({
	hasSentToExportation: false,
	exportations: [],
	setHasSentToExportation: (hasSentToExportation: boolean) => set({ hasSentToExportation }),
	setExportationInfo: (exportationInfo: ExportationInfoState) => set(exportationInfo),
	resetExportationInfo: () =>
		set({
			hasSentToExportation: false,
			exportations: [],
		}),
	getExportationInfo: () => get(),
	setCountryAndQuantity: ({ country, quantity }: { country: string; quantity: number }) =>
		set((state) => ({
			exportations: state.exportations.map((exportation) =>
				exportation.country === country ? { ...exportation, quantity } : exportation,
			),
		})),
	assertExportationInfo: () => {
		const { hasSentToExportation, exportations } = get()

		if (hasSentToExportation) {
			if (exportations.length === 0) {
				return {
					status: false,
					message: 'Indica pelo menos uma exportação.',
					quantity: exportations.reduce((acc, e) => acc + e.quantity, 0),
				}
			}
			if (exportations.some((e) => e.quantity <= 0)) {
				return {
					status: false,
					message: 'A quantidade deve ser maior que 0 Kg.',
					quantity: exportations.reduce((acc, e) => acc + e.quantity, 0),
				}
			}
		}
		return { status: true, message: '', quantity: exportations.reduce((acc, e) => acc + e.quantity, 0) }
	},
}))
export const useProcessingInfoStore = create<ProcessingInfo>((set, get) => ({
	hasSentToProcessing: false,
	processingWarehouses: [],
	setHasSentToProcessing: (hasSentToProcessing: boolean) => set({ hasSentToProcessing }),
	setProcessingInfo: (processingInfo: ProcessingInfoState) =>
		set({
			hasSentToProcessing: processingInfo.hasSentToProcessing,
			processingWarehouses: processingInfo.processingWarehouses,
		}),
	resetProcessingInfo: () =>
		set({
			hasSentToProcessing: false,
			processingWarehouses: [],
		}),
	getProcessingInfo: () => get(),
	setWarehouseAndQuantity: ({
		warehouse_id,
		warehouse_label,
		warehouse_type,
		quantity,
	}: {
		warehouse_id: string
		warehouse_label: string
		warehouse_type: string
		quantity: number
	}) =>
		set((state) => ({
			processingWarehouses: state.processingWarehouses.map((w) =>
				w.warehouse_id === warehouse_id ? { ...w, quantity } : w,
			),
		})),
	updateWarehouseQuantity: ({ warehouse_id, quantity }: { warehouse_id: string; quantity: number }) =>
		set((state) => ({
			processingWarehouses: state.processingWarehouses.map((w) =>
				w.warehouse_id === warehouse_id ? { ...w, quantity } : w,
			),
		})),
	removeWarehouse: ({ warehouse_id }: { warehouse_id: string }) =>
		set((state) => ({
			processingWarehouses: state.processingWarehouses.filter((w) => w.warehouse_id !== warehouse_id),
		})),
	assertProcessingInfo: () => {
		const { hasSentToProcessing, processingWarehouses } = get()

		if (hasSentToProcessing) {
			if (processingWarehouses.length === 0) {
				return {
					status: false,
					message: 'Indica pelo menos uma transferência.',
					quantity: processingWarehouses.reduce((acc, w) => acc + w.quantity, 0),
				}
			}
			if (processingWarehouses.some((w) => w.quantity <= 0)) {
				return {
					status: false,
					message: 'A quantidade deve ser maior que 0 Kg.',
					quantity: processingWarehouses.reduce((acc, w) => acc + w.quantity, 0),
				}
			}
		}
		return { status: true, message: '', quantity: processingWarehouses.reduce((acc, w) => acc + w.quantity, 0) }
	},
}))

export const useLostInfoStore = create<LostInfo>((set, get) => ({
	hasLost: false,
	quantityLost: 0,

	setLostInfo: (lostInfo: LostInfo) => set(lostInfo),
	resetLostInfo: () =>
		set({
			hasLost: false,
			quantityLost: 0,
		}),
	getLostInfo: () => get(),
	setQuantityLost: (quantityLost: number) => set({ quantityLost }),
	setHasLost: (hasLost: boolean) => set({ hasLost }),
	assertLostInfo: () => {
		const { hasLost, quantityLost } = get()
		if (hasLost) {
			if (quantityLost <= 0) {
				return { status: false, message: 'A quantidade deve ser maior que 0 Kg.', quantity: quantityLost }
			}
		}
		return { status: true, message: '', quantity: quantityLost }
	},
}))

export const useDateRangeStore = create<DateRange>((set, get) => ({
	startDate: null,
	endDate: null,

	setDateRange: (dateRange: DateRange) => set(dateRange),
	setStartDate: (startDate: Date | null) => set({ startDate }),
	setEndDate: (endDate: Date | null) => set({ endDate }),
	resetDateRange: () =>
		set({
			startDate: null,
			endDate: null,
		}),
	getDateRange: () => get(),
	assertDateRange: () => {
		const { startDate, endDate } = get()
		if (!startDate || !endDate) {
			return { status: false, message: 'As datas de início e fim são obrigatórias.' }
		}

		const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

		if (diffDays < 1) {
			return {
				status: false,
				message: 'O intervalo de tempo entre a data de início e fim deve ser de pelo menos 1 dia.',
			}
		}
		return { status: true, message: '' }
	},
}))
