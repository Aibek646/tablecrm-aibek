'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tablecrmApi } from '@/lib/tablecrm-api';

const schema = z.object({
    token: z.string().min(10, 'Введите корректный токен'),
});

type TSchema = z.infer<typeof schema>;

export default function TokenForm({
    onSuccess,
}: {
    onSuccess: (token: string) => void;
}) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TSchema>({
        resolver: zodResolver(schema),
    });
    async function onSubmit({ token }: TSchema) {
        setLoading(true);
        setError(null);
        try {
            await tablecrmApi.getOrganizations(token);
            onSuccess(token);
        } catch {
            setError('Неверный токен');
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-sm flex flex-col gap-4"
            >
                <h1 className="text-xl font-semibold">Введите токен</h1>
                <input
                    {...register('token')}
                    placeholder="Токен"
                    className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.token && (
                    <p className="text-destructive text-sm">
                        {errors.token.message}
                    </p>
                )}
                {error && <p className="text-destructive text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50"
                >
                    {loading ? 'Проверка...' : 'Войти'}
                </button>
            </form>
        </div>
    );
}
