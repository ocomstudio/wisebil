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
  userId: string; // ID of the user who created the sale
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  total: number;
  date: string;
}
