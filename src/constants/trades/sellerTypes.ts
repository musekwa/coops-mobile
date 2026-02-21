import { Seller, TradingPurpose } from "src/types";

export const sellerTypes: Seller[] = [
	{ id: 'FARMER', label: 'Produtor' },
	// { id: 'INFORMAL_TRADER', label: 'Comerciante Informal' },
	{ id: 'TRADER', label: 'Comerciante Formal' },
	{ id: 'COOPERATIVE', label: 'Cooperativa' },
	{ id: 'ASSOCIATION', label: 'Associação' },
	{ id: 'UNION', label: 'União de Cooperativas' },
]

export const tradingPurposeItems = [
	{ label: 'Exportação', value: TradingPurpose.EXPORT },
	{ label: 'Processamento Artesanal', value: TradingPurpose.SMALL_SCALE_PROCESSING },
	{ label: 'Processamento Industrial', value: TradingPurpose.LARGE_SCALE_PROCESSING },
	{ label: 'Revenda', value: TradingPurpose.RESELLING },
	{ label: 'Consumo Local', value: TradingPurpose.LOCAL },
]
