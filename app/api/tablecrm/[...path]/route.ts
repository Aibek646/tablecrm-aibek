import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
const BASE_URL = 'https://app.tablecrm.com/api/v1';

async function handler(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const endpoint = path.join('/');
    const search = req.nextUrl.searchParams.toString();
    const url = `${BASE_URL}/${endpoint}/${search ? `?${search}` : ''}`;

    try {
        if (req.method === 'GET') {
            const { data } = await axios.get(url);
            return NextResponse.json(data);
        }
        if (req.method === 'POST') {
            const body = await req.json();
            const { data } = await axios.post(url, body);
            return NextResponse.json(data);
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return NextResponse.json(error.response?.data, {
                status: error.response?.status ?? 500,
            });
            return NextResponse.json(
                {
                    message: 'Unknown error',
                },
                {
                    status: 500,
                }
            );
        }
    }
}

export { handler as GET, handler as POST };
