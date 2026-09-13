export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  coverImage: string;
  stockQuantity: number;
  isbn: string;
  description: string;
  rating: number;
}

export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  coverImage: string;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id?: string;
  customerId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Promotion {
  id: string;
  code: string;
  discountPercentage?: number;
  discountPercent?: number;
  maxDiscount: number;
  minSpend: number;
  validUntil: string;
  active: boolean;
}

export interface PromoResult {
  promotion: Promotion;
  discountAmount: number;
  finalTotal: number;
}
