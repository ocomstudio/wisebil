// src/context/invoicing-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Invoice } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField, onSnapshot, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { useAccounting } from './accounting-context';
import type { JournalEntry } from '@/components/dashboard/accounting/journal-entries';


interface InvoicingContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'status'>) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  isLoading: boolean;
}

const InvoicingContext = createContext<InvoicingContextType | undefined>(undefined);

export const InvoicingProvider = ({ children }: { children: ReactNode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addEntry } = useAccounting();

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setInvoices([]);
      setIsLoading(false);
      return;
    }

    const userDocRef = getUserDocRef();
    if (!userDocRef) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().invoices) {
        const sortedInvoices = docSnap.data().invoices.sort((a: Invoice, b: Invoice) => 
            new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
        );
        setInvoices(sortedInvoices);
      } else {
        setInvoices([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to listen to invoices from Firestore", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, getUserDocRef]);
  
  const generateInvoiceNumber = async (): Promise<string> => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return "INV-001";
    
    const docSnap = await getDoc(userDocRef);
    const currentCount = docSnap.exists() ? docSnap.data().invoiceCounter || 0 : 0;
    const newCount = currentCount + 1;

    await setDoc(userDocRef, { invoiceCounter: newCount }, { merge: true });
    
    return `INV-${String(newCount).padStart(3, '0')}`;
  };

  const addInvoice = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'status'>) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef || !addEntry) return;

    try {
        const invoiceNumber = await generateInvoiceNumber();
        
        const newInvoice: Invoice = {
            id: uuidv4(),
            invoiceNumber,
            status: 'draft',
            ...invoiceData,
            companyLogoUrl: invoiceData.companyLogoUrl || null,
            signatureUrl: invoiceData.signatureUrl || null,
            stampUrl: invoiceData.stampUrl || null,
        };
        
        // Step 1: Save invoice to Firestore
        await setDoc(userDocRef, { invoices: arrayUnion(newInvoice) }, { merge: true });
        
        // Step 2: Generate and save accounting journal entry
        const journalEntries: JournalEntry[] = [
            // Debit Client Account (4111)
            {
                id: uuidv4(),
                date: new Date(newInvoice.issueDate),
                accountNumber: 4111,
                accountName: 'Clients',
                description: `Facture ${newInvoice.invoiceNumber} - ${newInvoice.customerName}`,
                debit: newInvoice.total,
                credit: 0
            },
            // Credit Sales Account (7060 - Prestations de services)
            {
                id: uuidv4(),
                date: new Date(newInvoice.issueDate),
                accountNumber: 7060,
                accountName: 'Prestations de services',
                description: `Facture ${newInvoice.invoiceNumber} - ${newInvoice.customerName}`,
                credit: newInvoice.total,
                debit: 0
            },
        ];
        
        await addEntry(journalEntries);

    } catch(e) {
      console.error("Failed to add invoice or journal entry", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save invoice and its accounting entry." });
      throw e;
    }
  }, [getUserDocRef, toast, addEntry]);

  const updateInvoiceStatus = useCallback(async (id: string, status: Invoice['status']) => {
    const userDocRef = getUserDocRef();
    if (!userDocRef || !addEntry) return;

    const currentInvoices = [...invoices];
    const invoiceIndex = currentInvoices.findIndex(inv => inv.id === id);
    if (invoiceIndex === -1) {
        toast({ variant: "destructive", title: "Erreur", description: "Facture non trouvée." });
        return;
    }
    
    // Prevent re-processing if already paid
    if (currentInvoices[invoiceIndex].status === 'paid' && status === 'paid') {
        toast({ title: "Info", description: "Cette facture a déjà été marquée comme payée."});
        return;
    }

    currentInvoices[invoiceIndex].status = status;
    const updatedInvoice = currentInvoices[invoiceIndex];

    try {
        await setDoc(userDocRef, { invoices: currentInvoices }, { merge: true });
        toast({ title: "Statut mis à jour", description: `La facture a été marquée comme ${status}.`});

        // If status is 'paid', create the payment journal entry
        if (status === 'paid') {
            const paymentEntries: JournalEntry[] = [
                // Debit Bank Account (5210)
                {
                    id: uuidv4(),
                    date: new Date(), // Use today's date for payment
                    accountNumber: 5210,
                    accountName: 'Banques',
                    description: `Règlement Facture ${updatedInvoice.invoiceNumber} - ${updatedInvoice.customerName}`,
                    debit: updatedInvoice.total,
                    credit: 0
                },
                // Credit Client Account (4111)
                {
                    id: uuidv4(),
                    date: new Date(),
                    accountNumber: 4111,
                    accountName: 'Clients',
                    description: `Règlement Facture ${updatedInvoice.invoiceNumber} - ${updatedInvoice.customerName}`,
                    credit: updatedInvoice.total,
                    debit: 0
                },
            ];
            await addEntry(paymentEntries);
            toast({ title: "Comptabilité mise à jour", description: "L'écriture de règlement a été générée."});
        }

    } catch(e) {
         console.error("Failed to update invoice status or journal entry", e);
         toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le statut ou de générer l'écriture." });
         throw e;
    }

  }, [invoices, getUserDocRef, toast, addEntry]);


  return (
    <InvoicingContext.Provider value={{ invoices, addInvoice, updateInvoiceStatus, isLoading }}>
      {children}
    </InvoicingContext.Provider>
  );
};

export const useInvoicing = () => {
  const context = useContext(InvoicingContext);
  if (context === undefined) {
    throw new Error('useInvoicing must be used within a InvoicingProvider');
  }
  return context;
};
