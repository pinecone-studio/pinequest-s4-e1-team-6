export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

export interface Store {
  id: string;
  name: string;
  logo?: string;
  category?: string;
  rating: number;
  productCount: number;
  isVerified: boolean;
}

export interface CartItem {
  product: Product;
  store: Store;
  qty: number;
}

export type ActiveView = "stores" | "detail" | "cart";
