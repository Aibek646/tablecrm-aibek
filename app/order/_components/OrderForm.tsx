'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { tablecrmApi } from '@/lib/tablecrm-api';
import { useDebounce } from '@/hooks/useDebounce';
import ProductSelector from '@/app/order/_components/ProductSelector';
import type { TOrderItem } from '@/types/tablecrm';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';

export default function OrderForm({
    token,
    onLogout,
}: {
    token: string;
    onLogout: () => void;
}) {
    const [organizationId, setOrganizationId] = useState<number | null>(null);
    const [warehouseId, setWarehouseId] = useState<number | null>(null);
    const [payboxId, setPayboxId] = useState<number | null>(null);
    const [priceTypeId, setPriceTypeId] = useState<number | null>(null);
    const [phone, setPhone] = useState('');
    const [selectedContragentId, setSelectedContragentId] = useState<
        number | null
    >(null);
    const [items, setItems] = useState<TOrderItem[]>([]);
    const debouncedPhone = useDebounce(phone, 500);
    const [success, setSuccess] = useState(false);

    const { mutate, isPending } = useMutation({
        mutationFn: (conduct: boolean) =>
            tablecrmApi.createSale(
                {
                    token,
                    contragent: selectedContragentId,
                    warehouse_id: warehouseId,
                    paybox_id: payboxId,
                    organization: organizationId,
                    price_type_id: priceTypeId,
                    items: items.map((i) => ({
                        nomenclature_id: i.nomenclature_id,
                        quantity: i.quantity,
                        price: i.price,
                    })),
                },
                conduct
            ),
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setItems([]);
                setPhone('');
                setSelectedContragentId(null);
                setWarehouseId(null);
                setPayboxId(null);
                setOrganizationId(null);
                setPriceTypeId(null);
            }, 2000);
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                console.log(error.response?.data);
                toast.error(JSON.stringify(error.response?.data));
            }
        },
    });

    const { data: organizations } = useQuery({
        queryKey: ['organizations', token],
        queryFn: async () => {
            const { data } = await tablecrmApi.getOrganizations(token);
            return data.result;
        },
    });

    const { data: warehouses } = useQuery({
        queryKey: ['warehouses', token],
        queryFn: async () => {
            const { data } = await tablecrmApi.getWarehouses(token);
            return data.result;
        },
    });

    const { data: payboxes } = useQuery({
        queryKey: ['payboxes', token],
        queryFn: async () => {
            const { data } = await tablecrmApi.getPayboxes(token);
            return data.result;
        },
    });

    const { data: priceTypes } = useQuery({
        queryKey: ['priceTypes', token],
        queryFn: async () => {
            const { data } = await tablecrmApi.getPriceTypes(token);
            return data.result;
        },
    });

    const { data: contragents } = useQuery({
        queryKey: ['contragents', token, debouncedPhone],
        queryFn: async () => {
            const { data } = await tablecrmApi.getContragents(
                token,
                debouncedPhone || undefined
            );
            return data.result;
        },
        enabled: debouncedPhone.length > 0,
    });

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-3xl">✓</span>
                </div>
                <p className="font-medium">Заказ создан!</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col max-w-[800px] mx-auto">
            <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center justify-between">
                <h1 className="font-semibold">Новая продажа</h1>
                <Button
                    variant="outline"
                    onClick={onLogout}
                    className="text-sm text-muted-foreground cursor-pointer"
                >
                    Выйти
                </Button>
            </div>

            <form>
                <div className="flex-1 flex flex-col gap-4 p-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Клиент</label>
                        <input
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                setSelectedContragentId(null);
                            }}
                            placeholder="Поиск по телефону"
                            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                        {contragents &&
                            contragents.length > 0 &&
                            !selectedContragentId && (
                                <div className="border rounded-lg overflow-hidden">
                                    {contragents.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedContragentId(c.id);
                                                setPhone(c.phone);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted border-b last:border-b-0"
                                        >
                                            <span className="font-medium">
                                                {c.name}
                                            </span>
                                            <span className="text-muted-foreground ml-2">
                                                {c.phone}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">
                            Организация
                        </label>
                        <select
                            value={organizationId ?? ''}
                            onChange={(e) =>
                                setOrganizationId(
                                    Number(e.target.value) || null
                                )
                            }
                        >
                            <option value="">Выберите организацию</option>
                            {organizations?.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.short_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Склад</label>
                        <select
                            value={warehouseId ?? ''}
                            onChange={(e) =>
                                setWarehouseId(Number(e.target.value) || null)
                            }
                            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">Выберите склад</option>
                            {warehouses?.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Касса</label>
                        <select
                            value={payboxId ?? ''}
                            onChange={(e) =>
                                setPayboxId(Number(e.target.value) || null)
                            }
                            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">Выберите кассу</option>
                            {payboxes?.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Тип цены</label>
                        <select
                            value={priceTypeId ?? ''}
                            onChange={(e) =>
                                setPriceTypeId(Number(e.target.value) || null)
                            }
                            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">Выберите тип цены</option>
                            {priceTypes?.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <ProductSelector
                    token={token}
                    priceTypeId={priceTypeId}
                    items={items}
                    onChange={setItems}
                />
            </form>
            <div className="sticky bottom-0 bg-background border-t px-4 py-3 flex gap-3">
                <Button
                    disabled={items.length === 0 || isPending}
                    onClick={() => {
                        if (!organizationId)
                            return toast.error('Выберите организацию');
                        if (!warehouseId) return toast.error('Выберите склад');
                        if (!payboxId) return toast.error('Выберите кассу');
                        mutate(false);
                    }}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50 cursor-pointer"
                >
                    Создать
                </Button>
                <Button
                    variant="outline"
                    disabled={items.length === 0 || isPending}
                    onClick={() => {
                        if (!organizationId)
                            return toast.error('Выберите организацию');
                        if (!warehouseId) return toast.error('Выберите склад');
                        if (!payboxId) return toast.error('Выберите кассу');
                        mutate(true);
                    }}
                    className="flex-1 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50 cursor-pointer"
                >
                    {isPending ? 'Создание...' : 'Создать и провести'}
                </Button>
            </div>
        </div>
    );
}
