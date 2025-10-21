// src/types/product.ts
export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  promoPrice?: number;
  initialQuantity: number;
  quantity: number;
  categoryId?: string;
  purchaseDate: string; // ISO date string
  storageLocation: string;
  createdAt: string;
  updatedAt: string;
}
