// src/app/api/cinetpay/get-keys/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;

    if (!apiKey || !siteId) {
        return NextResponse.json({ error: "Configuration du serveur de paiement incomplète." }, { status: 500 });
    }

    return NextResponse.json({ apiKey, siteId });
}
