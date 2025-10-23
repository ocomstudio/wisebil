// src/app/invoice/[id]/page.tsx
import { UserDataProvider, getUserBySaleId } from '@/context/user-context';
import { Sale } from '@/types/sale';
import { CompanyProfile } from '@/types/company';
import { InvoiceTemplate } from '@/components/invoice/invoice-template';
import { LocaleProvider } from '@/context/locale-context';

async function getSaleData(id: string): Promise<{ sale: Sale; companyProfile: CompanyProfile | null; userData: any } | null> {
  const userData = await getUserBySaleId(id);
  if (!userData) {
    return null;
  }

  const sale = userData.sales?.find(s => s.id === id);
  if (!sale) {
    return null;
  }
  
  return { sale, companyProfile: userData.companyProfile || null, userData };
}

export default async function PublicInvoicePage({ params }: { params: { id: string } }) {
  const data = await getSaleData(params.id);

  if (!data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Facture non trouvée</h1>
          <p className="text-muted-foreground">Le lien de cette facture est peut-être incorrect ou la facture a été supprimée.</p>
        </div>
      </div>
    );
  }

  return (
    <UserDataProvider initialData={data.userData}>
        <LocaleProvider>
            <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
                <InvoiceTemplate sale={data.sale} />
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
