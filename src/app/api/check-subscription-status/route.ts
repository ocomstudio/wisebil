// src/app/api/check-subscription-status/route.ts
import { NextResponse } from 'next/server';
import { checkUserSubscriptionStatus } from '@/app/actions/check-subscription';

export async function GET(request: Request) {
  try {
    const { isActive } = await checkUserSubscriptionStatus();
    return NextResponse.json({ isActive });
  } catch (error) {
    console.error('[API] Error checking subscription status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
