import axios from 'axios';

import type {
    TListResponse,
    TContragent,
    TOrganization,
    TWarehouse,
    TPaybox,
    TPriceType,
    TNomenclature,
    TCreateSalePayload,
} from '@/types/tablecrm';

const api = axios.create({
    baseURL: '/api/tablecrm',
});

export const tablecrmApi = {
    getContragents: (token: string, phone?: string) =>
        api.get<TListResponse<TContragent>>('/contragents/', {
            params: { token, limit: 20, ...(phone ? { phone } : {}) },
        }),
    getOrganizations: (token: string) =>
        api.get<TListResponse<TOrganization>>('/organizations/', {
            params: { token, limit: 100 },
        }),
    getWarehouses: (token: string) =>
        api.get<TListResponse<TWarehouse>>('/warehouses/', {
            params: { token, limit: 100 },
        }),

    getPayboxes: (token: string) =>
        api.get<TListResponse<TPaybox>>('/payboxes/', {
            params: { token, limit: 100 },
        }),

    getPriceTypes: (token: string) =>
        api.get<TListResponse<TPriceType>>('/price_types/', {
            params: { token, limit: 100 },
        }),

    getNomenclature: (token: string, search?: string) =>
        api.get<TListResponse<TNomenclature>>('/nomenclature/', {
            params: { token, limit: 50, ...(search ? { name: search } : {}) },
        }),

    createSale: (payload: TCreateSalePayload, conduct: boolean) => {
        const { token, ...body } = payload;
        return api.post(`/docs_sales/?token=${token}&conduct=${conduct}`, [
            body,
        ]);
    },
};
