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
  userId: string; // ID of the user who created the purchase
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  date: string;
}
