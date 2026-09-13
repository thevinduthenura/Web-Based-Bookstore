import { Book, Cart, PromoResult } from '@/types/orders';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const MOCK_BOOKS: Book[] = [
  { id: "b1", title: "Madol Doova", author: "Martin Wickramasinghe", category: "Classic Fiction", price: 1250.00,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 45, isbn: "978-955-0201-12-1", description: "Classic Sri Lankan adventure novel following Upali and Jinna.", rating: 4.8 },
  { id: "b2", title: "Gamperaliya", author: "Martin Wickramasinghe", category: "Classic Fiction", price: 1450.00,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 30, isbn: "978-955-0201-15-2", description: "The saga of a traditional southern Sri Lankan family.", rating: 4.9 },
  { id: "b3", title: "The Village in the Jungle", author: "Leonard Woolf", category: "Historical", price: 1850.00,
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 25, isbn: "978-955-0201-88-0", description: "Depicts the lives of people in a remote jungle village.", rating: 4.7 },
  { id: "b4", title: "Running in the Family", author: "Michael Ondaatje", category: "Memoir", price: 2100.00,
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 20, isbn: "978-067-9746-69-0", description: "A fictionalized memoir of the author return to his native Sri Lanka.", rating: 4.6 },
  { id: "b5", title: "Clean Code", author: "Robert C. Martin", category: "Technology", price: 4500.00,
    coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 15, isbn: "978-013-2350-88-4", description: "A handbook of agile software craftsmanship.", rating: 4.9 },
];

let localCart: Cart = {
  customerId: "CUST-101",
  items: [],
  totalAmount: 0,
  totalItems: 0
};

async function fetchApi<T>(url: string, options?: RequestInit, fallback?: () => T): Promise<T> {
  try {
    const res = await fetch(API_BASE + url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(errJson.message || 'API call failed');
    }
    const json = await res.json();
    return json.data as T;
  } catch (err) {
    if (fallback) {
      return fallback();
    }
    throw err;
  }
}

export const ordersApi = {
  getBooks: async (): Promise<Book[]> =>
    fetchApi<Book[]>('/books', undefined, () => MOCK_BOOKS),

  getCart: async (customerId: string): Promise<Cart> =>
    fetchApi<Cart>(`/cart/${customerId}`, undefined, () => ({ ...localCart })),

  addToCart: async (customerId: string, bookId: string, quantity: number = 1): Promise<Cart> =>
    fetchApi<Cart>(`/cart/${customerId}/items`, {
      method: 'POST',
      body: JSON.stringify({ bookId, quantity })
    }, () => {
      const book = MOCK_BOOKS.find(b => b.id === bookId);
      if (!book) throw new Error('Book not found');
      const existing = localCart.items.find(i => i.bookId === bookId);
      if (existing) {
        existing.quantity += quantity;
        existing.subtotal = existing.price * existing.quantity;
      } else {
        localCart.items.push({
          bookId: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          coverImage: book.coverImage,
          quantity,
          subtotal: book.price * quantity
        });
      }
      localCart.totalAmount = localCart.items.reduce((s, i) => s + i.subtotal, 0);
      localCart.totalItems = localCart.items.reduce((s, i) => s + i.quantity, 0);
      return { ...localCart };
    }),

  updateCartQuantity: async (customerId: string, bookId: string, quantity: number): Promise<Cart> =>
    fetchApi<Cart>(`/cart/${customerId}/items/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }, () => {
      if (quantity <= 0) {
        localCart.items = localCart.items.filter(i => i.bookId !== bookId);
      } else {
        const item = localCart.items.find(i => i.bookId === bookId);
        if (item) {
          item.quantity = quantity;
          item.subtotal = item.price * quantity;
        }
      }
      localCart.totalAmount = localCart.items.reduce((s, i) => s + i.subtotal, 0);
      localCart.totalItems = localCart.items.reduce((s, i) => s + i.quantity, 0);
      return { ...localCart };
    }),

  removeCartItem: async (customerId: string, bookId: string): Promise<Cart> =>
    fetchApi<Cart>(`/cart/${customerId}/items/${bookId}`, { method: 'DELETE' }, () => {
      localCart.items = localCart.items.filter(i => i.bookId !== bookId);
      localCart.totalAmount = localCart.items.reduce((s, i) => s + i.subtotal, 0);
      localCart.totalItems = localCart.items.reduce((s, i) => s + i.quantity, 0);
      return { ...localCart };
    }),

  clearCart: async (customerId: string): Promise<void> =>
    fetchApi<void>(`/cart/${customerId}`, { method: 'DELETE' }, () => {
      localCart.items = [];
      localCart.totalAmount = 0;
      localCart.totalItems = 0;
    }),

  validateCoupon: async (code: string, cartTotal: number): Promise<PromoResult> =>
    fetchApi<PromoResult>('/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartTotal })
    }, () => {
      const upper = code.toUpperCase();
      const MOCK_PROMOS: Record<string, { discountPercent: number; maxDiscount: number; minSpend: number }> = {
        PAGE10: { discountPercent: 10, maxDiscount: 500, minSpend: 2000 },
        WELCOME20: { discountPercent: 20, maxDiscount: 1000, minSpend: 3000 },
        SLIITBOOK: { discountPercent: 15, maxDiscount: 750, minSpend: 1500 },
      };
      const p = MOCK_PROMOS[upper];
      if (!p) throw new Error('Invalid coupon code. Try PAGE10, WELCOME20 or SLIITBOOK.');
      if (cartTotal < p.minSpend) throw new Error(`Minimum spend of LKR ${p.minSpend.toFixed(2)} required.`);
      const discount = Math.min(cartTotal * (p.discountPercent / 100), p.maxDiscount);
      return {
        promotion: {
          id: upper,
          code: upper,
          discountPercentage: p.discountPercent,
          discountPercent: p.discountPercent,
          maxDiscount: p.maxDiscount,
          minSpend: p.minSpend,
          validUntil: '',
          active: true
        },
        discountAmount: Math.round(discount * 100) / 100,
        finalTotal: Math.round((cartTotal - discount) * 100) / 100,
      };
    }),
};
