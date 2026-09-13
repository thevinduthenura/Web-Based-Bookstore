import { Book, Cart, PromoResult } from './types';

const API_BASE = '/api';

// Fallback mock data for when the backend isn't running
const MOCK_BOOKS: Book[] = [
  { id: "book-001", title: "Madol Doova", author: "Martin Wickramasinghe", category: "Fiction", price: 1250.00,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 25, isbn: "978-955-9034-01-2", description: "Classic Sri Lankan adventure novel.", rating: 4.8 },
  { id: "book-002", title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", price: 1850.00,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 18, isbn: "978-0743273565", description: "Ambition, love, and tragedy in the Roaring Twenties.", rating: 4.6 },
  { id: "book-003", title: "Clean Code", author: "Robert C. Martin", category: "Technology", price: 4500.00,
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 12, isbn: "978-0132350884", description: "Guide to writing maintainable, clean software.", rating: 4.9 },
  { id: "book-004", title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", category: "Technology", price: 5800.00,
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 8, isbn: "978-1449373320", description: "Manual on distributed systems and data processing.", rating: 4.9 },
  { id: "book-005", title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", category: "History", price: 2450.00,
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 15, isbn: "978-0062316097", description: "How Homo Sapiens conquered the planet.", rating: 4.7 },
  { id: "book-006", title: "Atomic Habits", author: "James Clear", category: "Self-Help", price: 2200.00,
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 30, isbn: "978-0735211292", description: "Build good habits and break bad ones.", rating: 4.9 },
  { id: "book-007", title: "Gamperaliya", author: "Martin Wickramasinghe", category: "Literature", price: 1350.00,
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 20, isbn: "978-955-9034-12-8", description: "Social changes in 20th century Sri Lanka.", rating: 4.8 },
  { id: "book-008", title: "Python Crash Course, 3rd Edition", author: "Eric Matthes", category: "Technology", price: 3900.00,
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 10, isbn: "978-1718502703", description: "Hands-on introduction to Python programming.", rating: 4.8 },
];

// local in-memory cart used when backend is offline
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
      console.warn(`[Offline Fallback] ${url}`);
      return fallback();
    }
    throw err;
  }
}

export const api = {
  // fetch all books from catalog
  getBooks: async (): Promise<Book[]> =>
    fetchApi<Book[]>('/books', undefined, () => MOCK_BOOKS),

  // get or create a cart for this customer
  getCart: async (customerId: string): Promise<Cart> =>
    fetchApi<Cart>(`/cart/${customerId}`, undefined, () => ({ ...localCart })),

  // add a book to the cart
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
        localCart.items.push({ bookId: book.id, title: book.title, author: book.author,
          price: book.price, coverImage: book.coverImage, quantity, subtotal: book.price * quantity });
      }
      localCart.totalAmount = localCart.items.reduce((s, i) => s + i.subtotal, 0);
      localCart.totalItems  = localCart.items.reduce((s, i) => s + i.quantity, 0);
      return { ...localCart };
    }),

  // update quantity of a specific cart item
  updateCartQuantity: async (customerId: string, bookId: string, quantity: number): Promise<Cart> =>
    fetchApi<Cart>(`/cart/${customerId}/items/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }, () => {
      if (quantity <= 0) {
        localCart.items = localCart.items.filter(i => i.bookId !== bookId);
      } else {
        const item = localCart.items.find(i => i.bookId === bookId);
        if (item) { item.quantity = quantity; item.subtotal = item.price * quantity; }
      }
      localCart.totalAmount = localCart.items.reduce((s, i) => s + i.subtotal, 0);
      localCart.totalItems  = localCart.items.reduce((s, i) => s + i.quantity, 0);
      return { ...localCart };
    }),

  // remove a single item from the cart
  removeCartItem: async (customerId: string, bookId: string): Promise<Cart> =>
    fetchApi<Cart>(`/cart/${customerId}/items/${bookId}`, { method: 'DELETE' }, () => {
      localCart.items = localCart.items.filter(i => i.bookId !== bookId);
      localCart.totalAmount = localCart.items.reduce((s, i) => s + i.subtotal, 0);
      localCart.totalItems  = localCart.items.reduce((s, i) => s + i.quantity, 0);
      return { ...localCart };
    }),

  // clear the entire cart
  clearCart: async (customerId: string): Promise<void> =>
    fetchApi<void>(`/cart/${customerId}`, { method: 'DELETE' }, () => {
      localCart.items = []; localCart.totalAmount = 0; localCart.totalItems = 0;
    }),

  // validate a coupon code against the backend
  validateCoupon: async (code: string, cartTotal: number): Promise<PromoResult> =>
    fetchApi<PromoResult>('/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartTotal })
    }, () => {
      // offline fallback — mirrors the seeded promo codes
      const upper = code.toUpperCase();
      const MOCK_PROMOS: Record<string, { discountPercent: number; maxDiscount: number; minSpend: number }> = {
        PAGE10:    { discountPercent: 10, maxDiscount: 1000, minSpend: 2000 },
        SARASAVI20:{ discountPercent: 20, maxDiscount: 2000, minSpend: 4000 },
        WELCOME15: { discountPercent: 15, maxDiscount: 500,  minSpend: 1500 },
      };
      const p = MOCK_PROMOS[upper];
      if (!p) throw new Error('Invalid coupon code. Try PAGE10, SARASAVI20 or WELCOME15.');
      if (cartTotal < p.minSpend) throw new Error(`Minimum spend of LKR ${p.minSpend.toFixed(2)} required.`);
      const discount = Math.min(cartTotal * (p.discountPercent / 100), p.maxDiscount);
      return {
        promotion: { id: upper, code: upper, discountPercent: p.discountPercent,
          maxDiscount: p.maxDiscount, minSpend: p.minSpend, validUntil: '', active: true },
        discountAmount: Math.round(discount * 100) / 100,
        finalTotal: Math.round((cartTotal - discount) * 100) / 100,
      };
    }),
};

