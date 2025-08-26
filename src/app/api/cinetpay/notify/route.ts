// src/app/api/cinetpay/notify/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import type { NextRequest } from 'next/server';
import { pricing } from '@/app/dashboard/billing/page';


export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { cpm_trans_id, cpm_site_id, cpm_amount, cpm_trans_status, cpm_custom, cpm_currency } = data;

    // For security, you might want to verify the transaction status by calling CinetPay's check status endpoint.
    // For now, we'll trust the notification if the status is ACCEPTED.
    
    if (cpm_trans_status === 'ACCEPTED') {
      
      // The user's ID should be passed in a custom field if possible.
      // Since we don't have it, this logic is more of a placeholder.
      // A more robust solution would involve matching the transaction_id
      // saved on the user's document before payment.

      // Let's assume for now we can find the user by some metadata if we passed it.
      // As we don't have the user ID, we can't reliably update the user document.
      // This is a limitation of the current implementation.
      // A robust implementation would look like this:
      /*
        const metadata = JSON.parse(cpm_custom);
        const userId = metadata.userId;

        if (userId) {
          const userDocRef = db.collection('users').doc(userId);
          
          let plan = 'premium'; // default to premium
          if (parseInt(cpm_amount) === pricing.business[cpm_currency]) {
            plan = 'business';
          }

          await userDocRef.set({
            profile: {
              subscriptionStatus: 'active',
              subscriptionPlan: plan,
              stripeCustomerId: cpm_trans_id, // Using trans_id as a reference
            }
          }, { merge: true });

          console.log(`User ${userId} subscription updated to ${plan}.`);
        }
      */
       console.log('Payment accepted:', data);

    } else {
       console.log('Payment refused or failed:', data);
    }

    // Respond to CinetPay to acknowledge receipt
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error handling CinetPay notification:', error);
    if (error instanceof Error) {
        return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
    return NextResponse.json({ message: 'CinetPay Notify URL is active.' });
}
