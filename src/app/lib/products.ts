/**
 * SYSTEM_PURGE: Mock data has been deconstructed.
 * This file is maintained as a placeholder for technical schema definitions only.
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrls: string[];
  category: string;
  slug: string;
  details: string[];
  stockQuantity?: number;
  stockBySize?: Record<string, number>;
}

export const products: Product[] = [];