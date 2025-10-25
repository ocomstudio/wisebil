// This file is no longer used for initiating the payment directly.
// The client now calls the get-keys endpoint and initiates the seamless flow.
// This file could be repurposed for other server-side payment logic or deleted.

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json({ error: 'This endpoint is deprecated. Use the seamless flow initiated from the client.' }, { status: 404 });
}
