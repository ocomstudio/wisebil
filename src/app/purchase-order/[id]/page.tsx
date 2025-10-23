// src/app/purchase-order/[id]/page.tsx
import { UserDataProvider, getUserByPurchaseId } from '@/context/user-context';
import { Purchase } from '@/types/purchase';
import { CompanyProfile } from '@/types/company';
import { PurchaseOrderTemplate } from '@/components/invoice/purchase-order-template';
import { LocaleProvider } from '@/context/locale-context';

async function getPurchaseData(id: string): Promise<{ purchase: Purchase; companyProfile: CompanyProfile | null, userData: any } | null> {
  const userData = await getUserByPurchaseId(id);
  if (!userData) {
    return null;
  }

  const purchase = userData.purchases?.find(p => p.id === id);
  if (!purchase) {
    return null;
  }
  
  return { purchase, companyProfile: userData.companyProfile || null, userData };
}

export default async function PublicPurchaseOrderPage({ params }: { params: { id: string } }) {
  const data = await getPurchaseData(params.id);

  if (!data) {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Bon de commande non trouvé</h1>
          <p className="text-muted-foreground">Le lien est peut-être incorrect ou le bon de commande a été supprimé.</p>
        </div>
      </div>
    );
  }
  
  return (
    <UserDataProvider initialData={data.userData}>
        <LocaleProvider>
            <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
                <PurchaseOrderTemplate purchase={data.purchase} />
            </div>
        </LocaleProvider>
    </UserDataProvider>
  );
}

// Add a dummy component to satisfy the build process for the initialData prop
const DummyComponent = () => null;
DummyComponent.displayName = 'DummyComponent';
UserDataProvider.defaultProps = {
  initialData: null,
  children: <DummyComponent />,
};
