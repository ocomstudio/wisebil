// src/app/payment/initiate/page.tsx
import { Suspense } from 'react';
import { db, auth as adminAuth } from '@/lib/firebase-admin';

async function InitiatePaymentPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const { plan, transaction_id, amount, currency, idToken } = searchParams;
    
    // 1. Validate required parameters
    if (!plan || !transaction_id || !amount || !currency || !idToken) {
        return <div className="text-red-500 p-8">Erreur: Paramètres de paiement invalides ou manquants.</div>;
    }

    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;

    if (!apiKey || !siteId) {
        return <div className="text-red-500 p-8">Erreur: Configuration de paiement du serveur manquante. Veuillez contacter le support.</div>;
    }

    // 2. Verify Auth Token and Get User Info
    let user: { uid: string; email: string; displayName: string; phone: string; };
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken as string);
        const userRecord = await adminAuth.getUser(decodedToken.uid);
        user = {
            uid: userRecord.uid,
            email: userRecord.email || 'no-email@example.com',
            displayName: userRecord.displayName || 'Utilisateur',
            phone: userRecord.phoneNumber || ''
        };
    } catch (error) {
        console.error("Error verifying token:", error);
        return <div className="text-red-500 p-8">Erreur d'authentification. Impossible de vérifier l'utilisateur.</div>;
    }

    // 3. Create a PENDING transaction in Firestore
    try {
        const transactionRef = db.collection('transactions').doc(transaction_id as string);
        await transactionRef.set({
            userId: user.uid,
            plan: plan,
            amount: Number(amount),
            currency: currency,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
        });
    } catch(e) {
        console.error("Firestore Error: Could not create pending transaction", e);
        return <div className="text-red-500 p-8">Erreur de base de données : Impossible d'initier la transaction.</div>
    }
    
    const description = `Abonnement ${plan} - Wisebil`;
    const return_url = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=success`;
    const notify_url = `${process.env.NEXT_PUBLIC_APP_URL}/api/cinetpay/notify`;

    // 4. Create an auto-submitting form to redirect to CinetPay
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground">
            <h1 className="text-2xl font-bold mb-4">Redirection vers CinetPay...</h1>
            <p className="text-muted-foreground">Veuillez patienter.</p>
            <form id="cinetpay-form" method="POST" action="https://api-checkout.cinetpay.com/v2/payment">
                <input type="hidden" name="apikey" value={apiKey} />
                <input type="hidden" name="site_id" value={siteId} />
                <input type="hidden" name="transaction_id" value={transaction_id as string} />
                <input type="hidden" name="amount" value={amount as string} />
                <input type="hidden" name="currency" value={currency as string} />
                <input type="hidden" name="description" value={description} />
                <input type="hidden" name="return_url" value={return_url} />
                <input type="hidden" name="notify_url" value={notify_url} />
                <input type="hidden" name="channels" value="ALL" />
                <input type="hidden" name="customer_name" value={user.displayName.split(' ')[0]} />
                <input type="hidden" name="customer_surname" value={user.displayName.split(' ').slice(1).join(' ')} />
                <input type="hidden" name="customer_email" value={user.email} />
                <input type="hidden" name="customer_phone_number" value={user.phone} />
            </form>
            <script
                dangerouslySetInnerHTML={{
                __html: `
                    document.addEventListener('DOMContentLoaded', function() {
                        document.getElementById('cinetpay-form').submit();
                    });
                `,
                }}
            />
        </div>
    );
}


export default async function InitiatePaymentPageWrapper({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    return (
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Chargement...</div>}>
            <InitiatePaymentPage searchParams={searchParams} />
        </Suspense>
    );
}
