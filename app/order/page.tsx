'use client';

import { useEffect, useState } from 'react';
import TokenForm from '@/app/order/_components/TokenForm';
import OrderForm from '@/app/order/_components/OrderForm';

export default function OrderPage() {
    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        const saved = localStorage.getItem('token');
        if (saved) setToken(saved);
    }, []);

    function handleToken(t: string) {
        localStorage.setItem('token', t);
        setToken(t);
    }
    function handleLogout() {
        localStorage.removeItem('token');
        setToken(null);
    }
    if (token === null) return <TokenForm onSuccess={handleToken} />;
    return <OrderForm token={token} onLogout={handleLogout} />;
}
