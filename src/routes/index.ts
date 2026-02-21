
export const routes = {
    home: '/',
    actors: {
        farmers: {
            index: '/actors/farmers',
            [':farmer']: '/actors/farmers/:farmer',
        },   
        cooperatives: '/actors/cooperatives',
        institutions: '/actors/institutions',
        traders: '/actors/traders',
    },
    trades: '/trades',
    more: '/more',
}
