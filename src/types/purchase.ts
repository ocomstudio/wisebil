// src/types/purchase.ts
export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Price at the time of purchase
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  date: string;
}
