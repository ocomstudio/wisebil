// This file is no longer used and will be removed.
// The payment logic has been moved to the client-side on the billing page.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'This endpoint is deprecated.' }, { status: 404 });
}
