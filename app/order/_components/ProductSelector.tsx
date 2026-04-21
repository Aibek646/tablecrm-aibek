import { TNomenclature, TOrderItem } from '@/types/tablecrm';
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { tablecrmApi } from '@/lib/tablecrm-api';

export default function ProductSelector({
    token,
    priceTypeId,
    items,
    onChange,
}: {
    token: string;
    priceTypeId: number | null;
    items: TOrderItem[];
    onChange: (items: TOrderItem[]) => void;
}) {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    const { data: products } = useQuery({
        queryKey: ['nomenclature', token, debouncedSearch],
        queryFn: async () => {
            const { data } = await tablecrmApi.getNomenclature(
                token,
                debouncedSearch || undefined
            );
            return data.result;
        },
    });

    function getPrice(product: TNomenclature): number {
        if (!priceTypeId || !product.prices) return 0;
        return (
            product.prices.find((p) => p.price_type_id === priceTypeId)
                ?.price ?? 0
        );
    }
    function addProduct(product: TNomenclature) {
        const exists = items.find((i) => i.nomenclature_id === product.id);
        if (exists) {
            onChange(
                items.map((i) =>
                    i.nomenclature_id === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                )
            );
        } else {
            onChange([
                ...items,
                {
                    nomenclature_id: product.id,
                    nomenclature_name: product.name,
                    quantity: 1,
                    price: getPrice(product),
                    unit_name: product.unit_name,
                },
            ]);
        }
        setSearch('');
    }
    function updateQuantity(id: number, quantity: number) {
        if (quantity < 1) return removeProduct(id);
        onChange(
            items.map((i) =>
                i.nomenclature_id === id ? { ...i, quantity } : i
            )
        );
    }

    function updatePrice(id: number, price: number) {
        onChange(
            items.map((i) => (i.nomenclature_id === id ? { ...i, price } : i))
        );
    }

    function removeProduct(id: number) {
        onChange(items.filter((i) => i.nomenclature_id !== id));
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return (
        <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Товары</label>

            {/* Search */}
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск товара"
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            {/* Search results */}
            {search && products && products.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                    {products.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => addProduct(p)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted border-b last:border-b-0"
                        >
                            <span>{p.name}</span>
                            <span className="text-muted-foreground ml-2">
                                {getPrice(p)} сом
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Cart items */}
            {items.map((item) => (
                <div
                    key={item.nomenclature_id}
                    className="border rounded-lg p-3 flex flex-col gap-2"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            {item.nomenclature_name}
                        </span>
                        <button
                            type="button"
                            onClick={() => removeProduct(item.nomenclature_id)}
                            className="text-destructive text-sm"
                        >
                            Удалить
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    updateQuantity(
                                        item.nomenclature_id,
                                        item.quantity - 1
                                    )
                                }
                                className="w-7 h-7 border rounded flex items-center justify-center text-sm"
                            >
                                −
                            </button>
                            <span className="text-sm w-6 text-center">
                                {item.quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    updateQuantity(
                                        item.nomenclature_id,
                                        item.quantity + 1
                                    )
                                }
                                className="w-7 h-7 border rounded flex items-center justify-center text-sm"
                            >
                                +
                            </button>
                        </div>

                        {/* Price */}
                        <input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                                updatePrice(
                                    item.nomenclature_id,
                                    Number(e.target.value)
                                )
                            }
                            className="border rounded-lg px-2 py-1 text-sm w-24 outline-none focus:ring-2 focus:ring-ring"
                        />
                        <span className="text-muted-foreground text-sm">
                            {item.unit_name ?? ''}
                        </span>
                    </div>
                </div>
            ))}

            {/* Total */}
            {items.length > 0 && (
                <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span>Итого</span>
                    <span>{total} сом</span>
                </div>
            )}
        </div>
    );
}
