export interface Product {
  id: string;
  title: string;
  name?: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  price: number;
  compareAtPrice: number;
  category: string;
  image: string;
  images?: string[];
  rating: number;
  reviewsCount: number;
  tags: string[];
  inStock: boolean;
  stockQty?: number;
  sizes?: string[];
  colors?: string[];
  hsn?: string;
  gstRate?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

export const DEMO_PRODUCTS: Product[] = [];

