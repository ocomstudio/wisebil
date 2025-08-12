// src/app/api/stripe/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || 'http://localhost:9002';

// POST /api/stripe - Create a checkout session
export async function POST(req: NextRequest) {
  try {
    const { priceId, userId, userEmail } = await req.json();

    if (!priceId || !userId) {
      return NextResponse.json({ error: 'Missing priceId or userId' }, { status: 400 });
    }

    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    let stripeCustomerId = userDoc.data()?.profile?.stripeCustomerId;

    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: userEmail,
            metadata: {
                firebaseUID: userId,
            },
        });
        stripeCustomerId = customer.id;
        await userDocRef.set({ profile: { stripeCustomerId } }, { merge: true });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${WEBAPP_URL}/dashboard?payment=success`,
      cancel_url: `${WEBAPP_URL}/dashboard/billing?payment=cancelled`,
      metadata: {
        firebaseUID: userId
      }
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Stripe session creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Webhook handler
async function handleStripeWebhook(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("Stripe signature or webhook secret is missing.");
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const firebaseUID = session.metadata?.firebaseUID;
      
      if (!firebaseUID) {
        console.error("Webhook Error: No firebaseUID in session metadata.");
        break;
      }
      
      const userDocRef = db.collection('users').doc(firebaseUID);
      await userDocRef.set({
        profile: {
          subscriptionStatus: 'active',
          stripeCustomerId: session.customer,
        }
      }, { merge: true });
      
      console.log(`User ${firebaseUID} subscribed successfully.`);
      break;
    }
    case 'customer.subscription.deleted':
    case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const usersQuery = db.collection('users').where('profile.stripeCustomerId', '==', customerId);
        const userSnapshot = await usersQuery.get();

        if (userSnapshot.empty) {
            console.error(`Webhook Error: No user found for Stripe customer ID ${customerId}`);
            break;
        }

        const userDocRef = userSnapshot.docs[0].ref;
        const newStatus = subscription.status === 'active' ? 'active' : 'inactive';
        
        await userDocRef.set({
            profile: {
                subscriptionStatus: newStatus
            }
        }, { merge: true });

        console.log(`Subscription status for ${userDocRef.id} updated to ${newStatus}`);
        break;
    }
    default:
      console.warn(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// We need a separate handler for the webhook because Next.js has issues with
// a single route handling both JSON and raw body parsing.
export async function PUT(req: NextRequest) {
    return handleStripeWebhook(req);
}

// Add GET handler for the webhook to match the Stripe dashboard check
export async function GET() {
    return NextResponse.json({ message: "Stripe webhook endpoint is active." });
}
