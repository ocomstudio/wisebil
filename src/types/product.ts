// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  promoPrice?: number;
  quantity: number;
  imageUrl?: string;
}
