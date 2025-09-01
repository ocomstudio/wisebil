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
            },
            // Credit Sales Account (7060 - Prestations de services)
            {
                id: uuidv4(),
                date: new Date(newInvoice.issueDate),
                accountNumber: 7060,
                accountName: 'Prestations de services',
                description: `Facture ${newInvoice.invoiceNumber} - ${newInvoice.customerName}`,
                credit: newInvoice.total,
            },
        ];
        
        await addEntry(journalEntries);

    } catch(e) {
      console.error("Failed to add invoice or journal entry", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save invoice and its accounting entry." });
      throw e;
    }
  }, [getUserDocRef, toast, addEntry]);


  return (
    <InvoicingContext.Provider value={{ invoices, addInvoice, isLoading }}>
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
