// This endpoint is no longer used for initiating payments.
// The flow is now handled by the server page at /payment/initiate.
// This file can be removed in the future.

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    return NextResponse.json({ error: 'This endpoint is deprecated. Use the /payment/initiate server page.' }, { status: 404 });
}
