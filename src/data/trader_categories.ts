import { MultiCategory } from "src/types";


export const traderCategories = [
    { label: 'Comerciante Primário', value: MultiCategory.TRADER_PRIMARY },
    { label: 'Comerciante Secundário', value: MultiCategory.TRADER_SECONDARY },
    { label: 'Exportador', value: MultiCategory.TRADER_EXPORT },
    // { label: 'Mercado Local', value: MultiCategory.TRADER_LOCAL },
    { label: 'Processador Industrial', value: MultiCategory.TRADER_LARGE_SCALE_PROCESSING },
    { label: 'Processador Artesanal', value: MultiCategory.TRADER_SMALL_SCALE_PROCESSING },
    { label: 'Comerciante Informal', value: MultiCategory.TRADER_INFORMAL },
]
