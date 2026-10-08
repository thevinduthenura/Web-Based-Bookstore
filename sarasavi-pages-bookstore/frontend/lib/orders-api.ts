import { Book, Cart, PromoResult } from '@/types/orders';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const MOCK_BOOKS: Book[] = [
  { id: "b1", title: "Madol Doova", sinhalaTitle: "මඩොල් දූව", author: "Martin Wickramasinghe", category: "Sinhala Books", price: 1250.00,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 45, isbn: "978-955-0201-12-1", description: "Classic Sri Lankan adventure novel following Upali Gintota and Jinna on the mangrove island.", rating: 4.9,
    language: "Sinhala / සිංහල", pages: 216, publisher: "Sarasavi Publishers" },
  { id: "b2", title: "Gamperaliya", sinhalaTitle: "ගම්පෙරළිය", author: "Martin Wickramasinghe", category: "Sinhala Books", price: 1450.00,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 30, isbn: "978-955-0201-15-2", description: "The landmark trilogy depicting the profound transformation of a traditional southern feudal family into modern society.", rating: 4.9,
    language: "Sinhala / සිංහල", pages: 304, publisher: "Sarasavi Publishers" },
  { id: "b3", title: "The Village in the Jungle", sinhalaTitle: "බැද්දේගම", author: "Leonard Woolf", category: "Sinhala Books", price: 1850.00,
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 25, isbn: "978-955-0201-88-0", description: "Depicts the lives of people in a remote southern jungle village of Hambantota, translated into Sinhala by A.P. Gunaratne.", rating: 4.7,
    language: "Sinhala / English", pages: 280, publisher: "Sarasavi Publishers" },
  { id: "b10", title: "Yuganthaya", sinhalaTitle: "යුගාන්තය", author: "Martin Wickramasinghe", category: "Sinhala Books", price: 1350.00,
    coverImage: "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 28, isbn: "978-955-0201-22-0", description: "The concluding masterpiece of the Koggala trilogy examining Colombo urban working-class emergence.", rating: 4.8,
    language: "Sinhala / සිංහල", pages: 268, publisher: "Sarasavi Publishers" },
  { id: "b11", title: "Viragaya", sinhalaTitle: "විරාගය", author: "Martin Wickramasinghe", category: "Sinhala Books", price: 1400.00,
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 22, isbn: "978-955-0201-35-0", description: "Psychological masterpiece centered on Aravinda and philosophical detachment in modern Ceylon.", rating: 4.9,
    language: "Sinhala / සිංහල", pages: 244, publisher: "Sarasavi Publishers" },
  { id: "b4", title: "Running in the Family", sinhalaTitle: "පවුලේ කතාව", author: "Michael Ondaatje", category: "Non-Fiction", price: 2100.00,
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 20, isbn: "978-067-9746-69-0", description: "A fictionalized memoir of the author's return to his native Sri Lanka in late 1970s.", rating: 4.6,
    language: "English", pages: 256, publisher: "Vintage Books" },
  { id: "b5", title: "Clean Code", sinhalaTitle: "ක්ලීන් කෝඩ්", author: "Robert C. Martin", category: "Technology", price: 4500.00,
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 15, isbn: "978-013-2350-88-4", description: "A handbook of agile software craftsmanship with best practices for Java and object-oriented design.", rating: 4.9,
    language: "English", pages: 464, publisher: "Prentice Hall" },
  { id: "b6", title: "Database Design Fundamentals", sinhalaTitle: "දත්ත සමුදාය සැලසුම්කරණය", author: "Ramez Elmasri & Shamkant Navathe", category: "Academic Books", price: 2500.00,
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 50, isbn: "978-0-13-468599-1", description: "Comprehensive principles of relational databases, normalisation, and SQL design for SLIIT students.", rating: 4.8,
    language: "English", pages: 890, publisher: "Pearson" },
  { id: "b7", title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", price: 1200.00,
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 30, isbn: "978-0-7432-7356-5", description: "The story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan in the Jazz Age.", rating: 4.5,
    language: "English", pages: 180, publisher: "Scribner" },
  { id: "b8", title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", category: "Non-Fiction", price: 1800.00,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 40, isbn: "978-0-06-231609-7", description: "A renowned survey of the history of humankind from the Stone Age up to the twenty-first century.", rating: 4.9,
    language: "English", pages: 498, publisher: "Harper" },
  { id: "b9", title: "Harry Potter & the Chamber of Secrets", author: "J.K. Rowling", category: "Fiction", price: 1500.00,
    coverImage: "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 25, isbn: "978-0-439-06486-6", description: "The classic second year of Harry Potter at Hogwarts School of Witchcraft and Wizardry.", rating: 4.9,
    language: "English", pages: 352, publisher: "Bloomsbury" },
  { id: "s1", title: "Pilot G2 Premium Gel Pen Set (12pcs)", author: "Pilot Japan", category: "Office Stationery", price: 650.00,
    coverImage: "https://images.unsplash.com/photo-1585336261026-70e28e169b2d?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 200, isbn: "STN-PILOT-01", description: "Smooth flowing 0.7mm retractable gel rollerball pens with comfortable rubber grip. Set of blue, black, and red.", rating: 4.8 },
  { id: "s2", title: "Nataraj A4 Ruled Exercise Notebook (200 pgs)", author: "Nataraj / Hindustan", category: "Office Stationery", price: 280.00,
    coverImage: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 150, isbn: "STN-NATARAJ-02", description: "Premium 70gsm recycled paper ruled notebook ideal for university students and lecture notes.", rating: 4.6 },
  { id: "s3", title: "Camlin Artist Watercolour Paint Set (24 Cakes)", author: "Camlin Kokuyo", category: "Art Supplies", price: 1350.00,
    coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 60, isbn: "STN-CAMLIN-03", description: "Richly pigmented 24 watercolour cakes with professional camel hair paintbrush included.", rating: 4.8 },
  { id: "s4", title: "Tipp-Ex Rapid Correction Fluid & Micro Tape Duo", author: "BIC / Tipp-Ex", category: "Office Stationery", price: 220.00,
    coverImage: "https://images.unsplash.com/photo-1585336261026-70e28e169b2d?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 300, isbn: "STN-TIPPEX-04", description: "Quick drying opaque white correction fluid and precision correction tape for neat documents.", rating: 4.5 },
  { id: "s5", title: "Apsara Matt Drawing Pencil Set (10 Grades, HB-8B)", author: "Apsara Art", category: "Art Supplies", price: 580.00,
    coverImage: "https://images.unsplash.com/photo-1580569214296-5cf2ebe74b1d?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 100, isbn: "STN-APSARA-05", description: "Professional grading sketching and drawing pencils made from natural seasoned cedar wood.", rating: 4.9 },
  { id: "s6", title: "Atlas Pastel Fluorescent Highlighters (Pack of 6)", author: "Atlas Ceylon", category: "Office Stationery", price: 490.00,
    coverImage: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 120, isbn: "STN-ATLAS-06", description: "Soft pastel highlighters with dual chisel tips for underline or broad highlighting without bleed-through.", rating: 4.7 },
  { id: "s7", title: "Maped Oxford Precision Geometry Math Instrument Box", author: "Maped Stationery", category: "Office Stationery", price: 850.00,
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 85, isbn: "STN-MAPED-07", description: "Durable embossed metal tin containing stainless compass, divider, protractor, set squares, and pencil.", rating: 4.8 },
  { id: "s8", title: "Kangaro Heavy Duty Metal Desk Stapler & 1000 Pins", author: "Kangaro Industrial", category: "Office Stationery", price: 720.00,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 90, isbn: "STN-KANGARO-08", description: "All-steel construction desk stapler with quick-load mechanism, capable of binding up to 30 sheets.", rating: 4.6 },
  { id: "s9", title: "Daler-Rowney A4 Hardbound Artist Sketchbook (150gsm)", author: "Daler-Rowney", category: "Art Supplies", price: 1650.00,
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
    stockQuantity: 45, isbn: "STN-DALER-09", description: "Acid-free heavyweight 150gsm cartridge paper with tactile black cloth hardbound cover.", rating: 4.9 },
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
  getBooks: async (): Promise<Book[]> => {
    try {
      const data = await fetchApi<Book[]>('/books', undefined, () => MOCK_BOOKS);
      if (!Array.isArray(data) || data.length === 0) {
        return MOCK_BOOKS;
      }
      // Ensure all mock stationery & essential catalog items are present if backend DB only has minimal books
      const existingIds = new Set(data.map((b) => String(b.id)));
      const missingItems = MOCK_BOOKS.filter((b) => !existingIds.has(String(b.id)));
      return [...data, ...missingItems];
    } catch {
      return MOCK_BOOKS;
    }
  },

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

  validateCoupon: async (code: string, cartTotal: number): Promise<PromoResult> => {
    const { evaluatePromoCode } = await import('@/lib/promotions');
    return fetchApi<PromoResult>('/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartTotal })
    }, () => {
      const res = evaluatePromoCode(code, cartTotal);
      if (!res.valid) {
        throw new Error(res.message);
      }
      return {
        promotion: {
          id: res.code,
          code: res.code,
          discountPercentage: res.discountPercentage,
          discountPercent: res.discountPercentage,
          maxDiscount: 2000,
          minSpend: 0,
          validUntil: '',
          active: true
        },
        discountAmount: res.discountAmount,
        finalTotal: res.finalTotal,
      };
    });
  },

  getOrders: async (): Promise<any[]> =>
    fetchApi<any[]>('/orders', { method: 'GET' }, () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('sp_admin_orders');
        if (stored) {
          try { return JSON.parse(stored); } catch (e) {}
        }
      }
      return [];
    }),

  createOrder: async (order: any): Promise<any> =>
    fetchApi<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    }, () => order),

  updateOrder: async (id: string, order: any): Promise<any> =>
    fetchApi<any>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order)
    }, () => order),

  deleteOrder: async (id: string): Promise<void> =>
    fetchApi<void>(`/orders/${id}`, {
      method: 'DELETE'
    }, () => {}),
};
