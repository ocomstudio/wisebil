// src/types/sale.ts
export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Price at the time of sale
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  total: number;
  date: string;
}
