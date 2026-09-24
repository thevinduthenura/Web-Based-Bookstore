'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';
import { 
  BookOpen, 
  Search, 
  ShoppingCart, 
  Shield, 
  Star, 
  Sparkles, 
  ArrowRight, 
  ArrowUpRight,
  CheckCircle2, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  User, 
  SlidersHorizontal, 
  ChevronRight, 
  ChevronLeft,
  Eye,
  Award
} from 'lucide-react';
import { ordersApi } from '@/lib/orders-api';
import apiClient from '@/lib/api-client';
import type { Book } from '@/types/orders';

const CATEGORIES = [
  'All',
  'Classic Fiction',
  'Historical Fiction',
  'Computer Science',
  'Literature',
  'Poetry',
  'Philosophy',
  'Science'
];

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'title'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected book for details modal
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

  // Cart state
  const [cart, setCart] = useState<{ book: Book; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState<string | null>(null);

  // Synchronize cart with localStorage & open drawer if URL has cart param
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sp_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      }
    } catch {}

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('cart') === 'open' || params.get('openBag') === 'true') {
        setIsCartOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sp_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('sp_cart_updated'));
    } catch {}
  }, [cart]);

  // Checkout state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Colombo',
    district: 'Colombo',
    postalCode: '00300'
  });
  const [paymentForm, setPaymentForm] = useState({
    method: 'CREDIT_CARD' as 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY',
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });
  const [orderInvoice, setOrderInvoice] = useState<any>(null);

  // User state & membership
  const [loggedInCustomer, setLoggedInCustomer] = useState<any>(null);
  const [userMembership, setUserMembership] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sp_membership') || null;
    }
    return null;
  });

  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await ordersApi.getBooks();
        let storedBooks: Book[] = [];
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('sp_catalog_books');
          if (raw) {
            try { storedBooks = JSON.parse(raw); } catch (e) {}
          }
        }
        const initialList = storedBooks.length > 0 ? storedBooks : data;
        const hiddenIds: string[] = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('sp_hidden_books') || '[]')
          : [];
        setBooks(initialList.filter(b => !hiddenIds.includes(b.id) && !b.hidden));
      } catch (err) {
        console.error('Failed to load books:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();

    const custRaw = Cookies.get('sp_customer') || (typeof window !== 'undefined' ? localStorage.getItem('sp_customer') : null);
    if (custRaw) {
      try {
        const parsed = JSON.parse(custRaw);
        setLoggedInCustomer(parsed);
        if (parsed.name) {
          setShippingForm(prev => ({
            ...prev,
            fullName: parsed.name,
            email: parsed.email || ''
          }));
        }
      } catch (e) {}
    }
  }, []);

  // Filtered and sorted books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchesSearch = 
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.isbn && book.isbn.includes(searchQuery));
        const matchesCategory = 
          selectedCategory === 'All' || 
          book.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesPrice = book.price <= maxPrice;
        const matchesStock = !inStockOnly || book.stockQuantity > 0;
        return matchesSearch && matchesCategory && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0; // featured default
      });
  }, [books, searchQuery, selectedCategory, sortBy, maxPrice, inStockOnly]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy, maxPrice, inStockOnly]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / itemsPerPage));
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBooks, currentPage]);

  // Cart operations
  const addToCart = (book: Book) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.book.id === book.id);
      if (existing) {
        return prev.map((i) =>
          i.book.id === book.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { book, quantity: 1 }];
    });
    setCartToast(`"${book.title}" added to bag`);
    setTimeout(() => setCartToast(null), 3000);
  };

  const updateQuantity = (bookId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.book.id === bookId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as { book: Book; quantity: number }[]
    );
  };

  const removeFromCart = (bookId: string) => {
    setCart((prev) => prev.filter((i) => i.book.id !== bookId));
  };

  // Pricing & member discount
  const subtotal = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const memberDiscountRate = userMembership === 'PREMIUM' ? 20 : userMembership === 'BASIC' ? 10 : 0;
  const discountAmount = (subtotal * memberDiscountRate) / 100;
  const total = Math.max(0, subtotal - discountAmount);

  // Checkout Submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutProcessing(true);
    await new Promise((res) => setTimeout(res, 1500));

    const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const invoice = {
      invoiceNo,
      orderId,
      items: cart.map((i) => ({ title: i.book.title, qty: i.quantity, price: i.book.price })),
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod: paymentForm.method.replace(/_/g, ' '),
      date: new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' }),
      customer: shippingForm.fullName,
      email: shippingForm.email,
    };
    setOrderInvoice(invoice);

    const custId = loggedInCustomer?.customerId || 'CUST-GUEST';
    if (typeof window !== 'undefined') {
      const userOrders = JSON.parse(localStorage.getItem(`sp_orders_${custId}`) || '[]');
      const newOrder = {
        id: orderId,
        invoiceNo,
        items: cart.map((i) => `${i.book.title} (x${i.quantity})`).join(', '),
        itemDetails: cart.map((i) => ({
          title: i.book.title,
          qty: i.quantity,
          price: i.book.price,
          coverImage: i.book.coverImage
        })),
        amount: total,
        subtotal,
        discount: discountAmount,
        status: 'PROCESSING',
        courier: 'Domex Express',
        tracking: `DX-${Math.floor(100000 + Math.random() * 900000)}`,
        date: 'Just now',
        shippingAddress: `${shippingForm.address}, ${shippingForm.city}`,
        customerName: shippingForm.fullName,
        email: shippingForm.email
      };
      localStorage.setItem(`sp_orders_${custId}`, JSON.stringify([newOrder, ...userOrders]));
      const allOrders = JSON.parse(localStorage.getItem('sp_all_orders') || '[]');
      localStorage.setItem('sp_all_orders', JSON.stringify([newOrder, ...allOrders]));
    }

    try {
      await apiClient.post('/payment', {
        orderId: 1,
        customerId: loggedInCustomer?.id || 1,
        amount: total,
        currency: 'LKR',
        paymentMethod: paymentForm.method,
        transactionReference: invoiceNo,
        gatewayMessage: 'Simulated payment success',
        invoiceNumber: invoiceNo
      });
    } catch (err: any) {
      console.warn('Payment API fallback:', err.message);
    }

    setCheckoutProcessing(false);
    setCheckoutStep('success');
    setCart([]);
  };

  const handleDownloadInvoice = (inv: typeof orderInvoice) => {
    if (!inv) return;
    const lines = [
      '================================================================',
      '           SARASAVI PAGES (PVT) LTD - OFFICIAL TAX INVOICE',
      '================================================================',
      `Invoice No  : ${inv.invoiceNo}`,
      `Order ID    : ${inv.orderId}`,
      `Date & Time : ${inv.date}`,
      `Customer    : ${inv.customer}`,
      `Email       : ${inv.email}`,
      '----------------------------------------------------------------',
      'PURCHASED TITLES:',
      ...inv.items.map((i: any) => `  ${i.title.padEnd(35)} x${i.qty}  LKR ${(i.price * i.qty).toFixed(2)}`),
      '----------------------------------------------------------------',
      `Subtotal    : LKR ${inv.subtotal.toFixed(2)}`,
      inv.discount > 0 ? `Discount    : - LKR ${inv.discount.toFixed(2)}` : '',
      `TOTAL PAID  : LKR ${inv.total.toFixed(2)}`,
      `Payment     : ${inv.paymentMethod}`,
      '================================================================',
      'Thank you for ordering with Sarasavi Pages!',
      'Authentic editions · Express islandwide courier delivery',
      '================================================================',
    ].filter(Boolean).join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoiceNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#20231B] antialiased selection:bg-[#34451D] selection:text-white font-sans py-4">
      {/* ── Cohesive Floating Pill Header ──────────────────────────── */}
      <Navbar activeTab="catalog" onOpenBag={() => setIsCartOpen(true)} />

      {/* ── Main Catalog Content ────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Banner Section with Rich Editorial Contrast */}
        <div className="bg-gradient-to-br from-[#233014] via-[#2F3F1B] to-[#1C2610] text-[#F7F5EC] p-6 sm:p-10 rounded-3xl border border-[#435527] shadow-[0_16px_40px_rgba(28,38,16,0.16)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B7D85A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="max-w-2xl space-y-2 relative z-10">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#B7D85A] font-semibold">
              Curated Bookstore Catalog
            </span>
            <h1 className="font-display font-light text-3xl sm:text-4xl text-[#F7F5EC] tracking-tight">
              Explore Our Curated Titles
            </h1>
            <p className="text-xs sm:text-sm text-[#E2E7D8] leading-relaxed font-light">
              Browse Sri Lanka's finest collection of modern fiction, historical literature, academic texts, and translated classics.
            </p>
            {userMembership && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#B7D85A] text-[#1C2610] text-xs font-mono font-semibold shadow-xs">
                <Award className="w-3.5 h-3.5" />
                <span>
                  {userMembership === 'PREMIUM' ? '👑 Scholar Premium Active (20% OFF applied)' : '⭐ Reader Basic Active (10% OFF applied)'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Filter and Search Bar with Crisp Card Elevation */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E2E7D8] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#85887A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or ISBN..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:border-[#34451D] focus:bg-white transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#85887A] hover:text-[#20231B]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="text-xs text-[#85887A] font-medium whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3.5 py-2 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] focus:outline-none focus:border-[#34451D] focus:bg-white font-medium shadow-xs cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="title">Title: A–Z</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 text-xs ${
                    active
                      ? 'bg-[#34451D] text-white font-medium shadow-xs'
                      : 'bg-[#F0F4E8] text-[#596B32] border border-[#E2E7D8] hover:bg-white hover:text-[#20231B]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info & Count */}
        <div className="flex items-center justify-between text-xs text-[#85887A] px-2 font-mono">
          <span>
            Showing <strong className="text-[#20231B]">{paginatedBooks.length}</strong> of{' '}
            <strong className="text-[#20231B]">{filteredBooks.length}</strong> books
          </span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#34451D]/30 border-t-[#34451D] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#85887A] font-mono">Loading bookstore archive...</p>
          </div>
        ) : paginatedBooks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E2E7D8] text-center space-y-3 shadow-xs">
            <BookOpen className="w-10 h-10 text-[#85887A] mx-auto opacity-40" />
            <h3 className="font-display font-light text-lg text-[#20231B]">No books match your criteria</h3>
            <p className="text-xs text-[#85887A]">Try clearing your search query or choosing another category.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="px-4 py-2 rounded-full bg-[#34451D] text-white text-xs font-medium hover:bg-[#20231B] transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {paginatedBooks.map((book) => {
              const discountedPrice = memberDiscountRate > 0 
                ? book.price * (1 - memberDiscountRate / 100) 
                : null;
              return (
                <div
                  key={book.id}
                  className="group relative bg-white rounded-3xl border border-[#E2E7D8] p-4 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#596B32] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="space-y-3">
                    {/* Cover Image Container */}
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#F8F9F5] border border-[#E2E7D8] shadow-xs">
                      <img
                        src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[#34451D] text-[10px] font-mono font-medium border border-[#E2E7D8] shadow-xs">
                        {book.category}
                      </span>
                      {/* Quick view button */}
                      <button
                        onClick={() => setPreviewBook(book)}
                        className="absolute bottom-2.5 right-2.5 p-2 rounded-full bg-white/95 backdrop-blur-xs text-[#34451D] hover:bg-[#34451D] hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-md"
                        title="Quick View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Book Metadata */}
                    <div>
                      <div className="flex items-center gap-1 text-[#D96B27] mb-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-[11px] font-mono font-semibold">{book.rating || 4.8}</span>
                      </div>
                      <h3 className="font-display font-medium text-base text-[#20231B] line-clamp-1 group-hover:text-[#34451D] transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-[#85887A] line-clamp-1 font-light">{book.author}</p>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="pt-3 border-t border-[#E2E7D8] flex items-center justify-between gap-2 mt-3">
                    <div>
                      {discountedPrice ? (
                        <div>
                          <span className="text-sm font-mono font-semibold text-[#34451D]">
                            LKR {discountedPrice.toFixed(0)}
                          </span>
                          <span className="text-[10px] font-mono text-[#85887A] line-through ml-1.5">
                            LKR {book.price.toFixed(0)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-mono font-semibold text-[#20231B]">
                          LKR {book.price.toFixed(0)}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-[#596B32] block font-medium">
                        {book.stockQuantity > 0 ? `${book.stockQuantity} in stock` : 'Out of stock'}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(book)}
                      disabled={book.stockQuantity <= 0}
                      className="px-3.5 py-1.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-white border border-[#E2E7D8] text-[#20231B] hover:bg-[#F0F4E8] disabled:opacity-40 transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-full text-xs font-mono transition-all ${
                  currentPage === page
                    ? 'bg-[#34451D] text-white font-semibold shadow-xs'
                    : 'bg-white border border-[#E2E7D8] text-[#85887A] hover:text-[#20231B]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-white border border-[#E2E7D8] text-[#20231B] hover:bg-[#F0F4E8] disabled:opacity-40 transition-all"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* ── Cart Toast Notification ─────────────────────────────────── */}
      {cartToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#34451D] text-white px-4 py-2.5 rounded-full shadow-xl text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#B7D85A]" />
          <span>{cartToast}</span>
        </div>
      )}

      {/* ── Quick Book Preview Modal ────────────────────────────────── */}
      {previewBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E2E7D8] shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#F0F4E8] shrink-0 border border-[#E2E7D8]">
                  <img src={previewBook.coverImage} alt={previewBook.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#596B32]">{previewBook.category}</span>
                  <h3 className="font-display font-normal text-lg text-[#20231B]">{previewBook.title}</h3>
                  <p className="text-xs text-[#85887A]">{previewBook.author}</p>
                </div>
              </div>
              <button onClick={() => setPreviewBook(null)} className="p-1 rounded-full hover:bg-[#F0F4E8] text-[#85887A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#85887A] leading-relaxed border-t border-b border-[#E2E7D8] py-3">
              {previewBook.description || 'Authentic curated edition from Sarasavi Pages bookstore collection.'}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8]">
                <span className="text-[#85887A] block text-[10px]">ISBN</span>
                <span className="text-[#20231B]">{previewBook.isbn || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8]">
                <span className="text-[#85887A] block text-[10px]">Stock Status</span>
                <span className="text-[#34451D] font-medium">{previewBook.stockQuantity} copies available</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs text-[#85887A] block">Retail Price</span>
                <span className="font-mono text-lg font-medium text-[#20231B]">LKR {previewBook.price.toFixed(2)}</span>
              </div>
              <button
                onClick={() => { addToCart(previewBook); setPreviewBook(null); }}
                className="px-5 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Shopping Bag</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-over Cart Drawer ──────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full border-l border-[#E2E7D8] shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E7D8]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#34451D]" />
                  <h3 className="font-display font-normal text-lg text-[#20231B]">Your Shopping Bag</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-full hover:bg-[#F0F4E8] text-[#85887A]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="mt-4 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#85887A] space-y-2">
                    <ShoppingCart className="w-8 h-8 mx-auto opacity-30" />
                    <p>Your bag is currently empty.</p>
                  </div>
                ) : (
                  cart.map(({ book, quantity }) => (
                    <div key={book.id} className="p-3 rounded-2xl bg-white border border-[#E2E7D8] flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img src={book.coverImage} alt={book.title} className="w-10 h-12 object-cover rounded-lg shrink-0 border border-[#E2E7D8]" />
                        <div className="truncate">
                          <h4 className="font-display text-xs text-[#20231B] truncate">{book.title}</h4>
                          <span className="font-mono text-xs text-[#34451D]">LKR {book.price.toFixed(0)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-[#F8F9F5] rounded-full border border-[#E2E7D8] px-1.5 py-0.5 text-xs">
                          <button onClick={() => updateQuantity(book.id, -1)} className="p-1 hover:text-[#34451D]">
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="px-2 font-mono">{quantity}</span>
                          <button onClick={() => updateQuantity(book.id, 1)} className="p-1 hover:text-[#34451D]">
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(book.id)} className="text-[#85887A] hover:text-red-700 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-[#E2E7D8] space-y-2 text-xs">
                <div className="flex justify-between text-[#85887A]">
                  <span>Subtotal</span>
                  <span className="font-mono">LKR {subtotal.toFixed(2)}</span>
                </div>
                {memberDiscountRate > 0 ? (
                  <div className="flex justify-between text-[#596B32] font-medium">
                    <span>Member Discount ({memberDiscountRate}%)</span>
                    <span className="font-mono">- LKR {discountAmount.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[11px] text-[#85887A] flex items-center justify-between">
                    <span>Non-member standard pricing</span>
                    <Link href="/account" className="text-[#34451D] font-semibold underline">Join Member</Link>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-[#20231B] pt-2 border-t border-[#E2E7D8]">
                  <span>Total</span>
                  <span className="font-mono text-[#34451D]">LKR {total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); setCheckoutStep('shipping'); }}
                  className="w-full mt-2 py-3 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Multi-Step Checkout Modal ───────────────────────────────── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E2E7D8] shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 sm:p-7 border-b border-[#E2E7D8]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#596B32] font-semibold tracking-wider block">
                  {checkoutStep === 'shipping' ? 'Step 1 of 2 · Delivery Details' : checkoutStep === 'payment' ? 'Step 2 of 2 · Secure Payment' : '✓ Order Confirmed'}
                </span>
                <h3 className="font-display font-normal text-xl text-[#20231B] mt-0.5">
                  {checkoutStep === 'shipping' ? 'Shipping Information' : checkoutStep === 'payment' ? 'Payment Details' : 'Order Placed Successfully!'}
                </h3>
              </div>
              {checkoutStep !== 'success' && (
                <button onClick={() => setIsCheckoutOpen(false)} className="p-1.5 rounded-full hover:bg-[#F0F4E8] text-[#85887A]">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-5 sm:p-7 space-y-4 text-xs">
              {checkoutStep === 'shipping' && (
                <form onSubmit={(e) => { e.preventDefault(); setCheckoutStep('payment'); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#85887A] font-medium mb-1">Full Name *</label>
                      <input
                        required
                        value={shippingForm.fullName}
                        onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                        placeholder="Kasun Perera"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[#85887A] font-medium mb-1">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={shippingForm.email}
                        onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                        placeholder="you@email.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#85887A] font-medium mb-1">Street Address *</label>
                    <input
                      required
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                      placeholder="No. 12, Galle Road"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#85887A] font-medium mb-1">City *</label>
                      <input
                        required
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        placeholder="Colombo"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[#85887A] font-medium mb-1">Mobile Number *</label>
                      <input
                        required
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        placeholder="+94 77 123 4567"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsCheckoutOpen(false)} className="px-4 py-2.5 rounded-full border border-[#E2E7D8] text-[#85887A] hover:bg-[#F0F4E8]">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white font-medium shadow-md">
                      Continue to Payment →
                    </button>
                  </div>
                </form>
              )}

              {checkoutStep === 'payment' && (
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentForm({ ...paymentForm, method: m })}
                        className={`p-3 rounded-xl border font-medium text-xs transition-all ${
                          paymentForm.method === m
                            ? 'border-[#34451D] bg-[#34451D] text-white'
                            : 'border-[#E2E7D8] bg-white text-[#20231B] hover:border-[#596B32]'
                        }`}
                      >
                        {m === 'CREDIT_CARD' ? '💳 Credit Card' : m === 'DEBIT_CARD' ? '🏧 Debit Card' : m === 'BANK_TRANSFER' ? '🏦 Bank Transfer' : '💵 Cash on Delivery'}
                      </button>
                    ))}
                  </div>

                  {paymentForm.method !== 'CASH_ON_DELIVERY' && paymentForm.method !== 'BANK_TRANSFER' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#85887A] font-medium mb-1">Card Number *</label>
                        <input
                          required
                          maxLength={19}
                          value={paymentForm.cardNumber}
                          onChange={(e) => setPaymentForm({
                            ...paymentForm,
                            cardNumber: e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim()
                          })}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#85887A] font-medium mb-1">Expiry *</label>
                          <input
                            required
                            maxLength={5}
                            value={paymentForm.expiry}
                            onChange={(e) => setPaymentForm({
                              ...paymentForm,
                              expiry: e.target.value.replace(/\D/g, '').replace(/(\d{2})/, '$1/').slice(0, 5)
                            })}
                            placeholder="MM/YY"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] font-mono text-[#20231B] focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[#85887A] font-medium mb-1">CVV *</label>
                          <input
                            required
                            type="password"
                            maxLength={4}
                            value={paymentForm.cvv}
                            onChange={(e) => setPaymentForm({
                              ...paymentForm,
                              cvv: e.target.value.replace(/\D/g, '')
                            })}
                            placeholder="•••"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] font-mono text-[#20231B] focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-[#34451D] text-white flex justify-between items-center">
                    <span>Total Amount</span>
                    <span className="font-mono text-lg">LKR {total.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    <button type="button" onClick={() => setCheckoutStep('shipping')} className="px-4 py-2.5 rounded-full border border-[#E2E7D8] text-[#85887A] hover:bg-[#F0F4E8]">
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={checkoutProcessing}
                      className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white font-medium shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
                    >
                      {checkoutProcessing ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Processing Payment...</span>
                        </>
                      ) : (
                        <span>Confirm & Pay LKR {total.toFixed(2)}</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {checkoutStep === 'success' && orderInvoice && (
                <div className="space-y-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#34451D] flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8 text-[#B7D85A]" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl text-[#20231B]">Payment Successful!</h4>
                    <p className="text-xs text-[#85887A] mt-1">
                      Confirmation receipt issued to <strong className="text-[#34451D]">{orderInvoice.email}</strong>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] text-left space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#85887A]">Invoice No</span>
                      <span className="text-[#34451D] font-bold">{orderInvoice.invoiceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#85887A]">Order ID</span>
                      <span>{orderInvoice.orderId}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E2E7D8] pt-2 font-sans font-semibold text-[#20231B]">
                      <span>Total Paid</span>
                      <span className="font-mono">LKR {orderInvoice.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleDownloadInvoice(orderInvoice)}
                      className="flex-1 py-2.5 rounded-full border border-[#34451D] text-[#34451D] text-xs font-medium hover:bg-[#F0F4E8] transition-all flex items-center justify-center gap-1.5"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Download Tax Invoice (.txt)</span>
                    </button>
                    <Link
                      href="/orders"
                      className="flex-1 py-2.5 rounded-full bg-[#34451D] text-white text-xs font-medium hover:bg-[#20231B] transition-all flex items-center justify-center"
                    >
                      View in My Orders →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
