export type TListResponse<T> = {
    result: T[];
    count: number;
};

export type TContragent = {
    id: number;
    name: string;
    phone: string;
};

export type TOrganization = {
    id: number;
    short_name: string;
};

export type TWarehouse = {
    id: number;
    name: string;
};

export type TPaybox = {
    id: number;
    name: string;
};

export type TPriceType = {
    id: number;
    name: string;
};

export type TNomenclaturePrice = {
    price_type_id: number;
    price: number;
};

export type TNomenclature = {
    id: number;
    name: string;
    unit_name: string | null;
    prices: TNomenclaturePrice[] | null;
};

export type TOrderItem = {
    nomenclature_id: number;
    nomenclature_name: string;
    quantity: number;
    price: number;
    unit_name: string | null;
};

export type TCreateSalePayload = {
    token: string;
    contragent: number | null;
    warehouse_id: number | null;
    paybox_id: number | null;
    organization: number | null;
    price_type_id: number | null;
    items: { nomenclature_id: number; quantity: number; price: number }[];
    conduct?: boolean;
};
