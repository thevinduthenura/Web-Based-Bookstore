'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Search, 
  ShoppingCart, 
  Shield, 
  Star, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Tag, 
  HelpCircle, 
  Truck, 
  Clock, 
  Send,
  X,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import { ordersApi } from '@/lib/orders-api';
import apiClient from '@/lib/api-client';
import type { Book } from '@/types/orders';

export default function StorefrontPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Cart state
  const [cart, setCart] = useState<{ book: Book; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Support ticket state (M3 Zeen)
  const [ticketForm, setTicketForm] = useState({
    customerName: '',
    contactNumber: '',
    subject: '',
    description: ''
  });
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await ordersApi.getBooks();
        setBooks(data);
      } catch (err) {
        console.error('Failed to load books:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(books.map(b => b.category)));
    return ['ALL', ...cats];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchesSearch = 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory]);

  const addToCart = (book: Book) => {
    setCart(prev => {
      const existing = prev.find(item => item.book.id === book.id);
      if (existing) {
        return prev.map(item =>
          item.book.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { book, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (bookId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.book.id === bookId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { book: Book; quantity: number }[]
    );
  };

  const removeFromCart = (bookId: string) => {
    setCart(prev => prev.filter(item => item.book.id !== bookId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const discountAmount = promoApplied ? (subtotal * promoDiscount) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const applyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME10') {
      setPromoDiscount(10);
      setPromoApplied(true);
    } else if (code === 'SARASAVI20') {
      if (subtotal < 3000) {
        setPromoError('Min spend of LKR 3,000 required for SARASAVI20');
        return;
      }
      setPromoDiscount(20);
      setPromoApplied(true);
    } else if (code === 'STUDENT15') {
      setPromoDiscount(15);
      setPromoApplied(true);
    } else {
      setPromoError('Invalid promo code. Try WELCOME10 or SARASAVI20');
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketStatus('submitting');
    try {
      await apiClient.post('/tickets', {
        ...ticketForm,
        customerId: 1
      });
      setTicketStatus('success');
      setTicketForm({ customerName: '', contactNumber: '', subject: '', description: '' });
      setTimeout(() => setTicketStatus('idle'), 5000);
    } catch {
      setTicketStatus('error');
      setTimeout(() => setTicketStatus('idle'), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f8f9fb] flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      
      {/* ── TOP NAV ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0f1117]/90 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-white to-ink-muted bg-clip-text text-transparent">
                Sarasavi Pages
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-brand-400">
                Online Bookstore
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by title, author, or category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-card border border-surface-border rounded-xl text-xs text-ink placeholder-ink-muted focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-surface-card border border-surface-border hover:border-brand-500/50 text-ink-muted hover:text-white transition-colors"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center shadow-glow animate-pulse">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* Admin Portal Button */}
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-semibold hover:shadow-glow transition-all active:scale-95"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-surface-border/50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Sri Lanka's Premier University & E-Commerce Bookstore</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-tight mb-4">
            Discover Stories That <span className="bg-gradient-brand bg-clip-text text-transparent">Inspire</span>, Educate & Transform
          </h1>

          <p className="text-sm sm:text-base text-ink-muted max-w-2xl mx-auto mb-8">
            Explore authentic Sri Lankan literature, international bestsellers, university engineering texts, and academic references with fast islandwide delivery.
          </p>

          {/* Value props */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-3 rounded-xl bg-surface-card/60 border border-surface-border flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-brand-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold block text-white">Islandwide</span>
                <span className="text-ink-muted text-[10px]">Fast Delivery</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-card/60 border border-surface-border flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold block text-white">100% Genuine</span>
                <span className="text-ink-muted text-[10px]">Publisher Certified</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-card/60 border border-surface-border flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold block text-white">Special Deals</span>
                <span className="text-ink-muted text-[10px]">Promo Codes</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-card/60 border border-surface-border flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold block text-white">24/7 Support</span>
                <span className="text-ink-muted text-[10px]">Ticket Resolution</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROMOTIONS BAR ──────────────────────────────────────── */}
      <section className="bg-surface-card/40 border-b border-surface-border py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span>Use code <strong className="text-brand-400 font-mono">WELCOME10</strong> for 10% OFF your first order!</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Use <strong className="text-emerald-400 font-mono">SARASAVI20</strong> for 20% OFF orders over LKR 3,000</span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Student discount: <strong className="text-amber-400 font-mono">STUDENT15</strong> (15% OFF)</span>
          </div>
        </div>
      </section>

      {/* ── CATALOG SECTION ─────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-tight">
              Featured Books Catalog
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Showing {filteredBooks.length} titles available for instant dispatch
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brand-500 text-white shadow-glow'
                    : 'bg-surface-card border border-surface-border text-ink-muted hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-surface-card border border-surface-border animate-pulse" />
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-surface-card/40 rounded-2xl border border-surface-border">
            <BookOpen className="w-10 h-10 text-ink-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-white">No books found</p>
            <p className="text-xs text-ink-muted mt-1">Try adjusting your search query or category filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <div
                key={book.id}
                className="group rounded-2xl bg-surface-card border border-surface-border hover:border-brand-500/40 p-4 flex flex-col justify-between transition-all hover:shadow-card-hover"
              >
                <div>
                  {/* Book cover container */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-surface-muted mb-4">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback placeholder image
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-surface">
                        <BookOpen className="w-12 h-12 text-ink-faint" />
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#0f1117]/80 backdrop-blur-md text-[10px] font-semibold text-brand-400 border border-brand-500/20">
                      {book.category}
                    </div>

                    {book.rating && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-[#0f1117]/80 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center gap-1 border border-amber-400/20">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{book.rating}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-sm text-white line-clamp-1 group-hover:text-brand-400 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">
                    by {book.author}
                  </p>
                  <p className="text-[11px] text-ink-faint mt-2 line-clamp-2">
                    {book.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-surface-border mt-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-ink-muted uppercase tracking-wider block">Price</span>
                    <span className="font-display font-bold text-sm text-white">
                      LKR {book.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(book)}
                    className="px-3.5 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500 text-brand-400 hover:text-white border border-brand-500/30 hover:border-transparent text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CUSTOMER SUPPORT TICKET SECTION (M3 Zeen) ────────── */}
        <section className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-card border border-surface-border relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Customer Help Desk — Module M3</span>
            </div>
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              Have an Issue with an Order or Need Assistance?
            </h3>
            <p className="text-xs text-ink-muted mt-1 mb-6">
              Submit a support ticket and our Customer Service team (managed by Zeen A.C.) will resolve it promptly.
            </p>

            {ticketStatus === 'success' ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ticket submitted successfully! Our support admins will review it on the Admin Portal.</span>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={ticketForm.customerName}
                    onChange={e => setTicketForm(f => ({ ...f, customerName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-xs text-ink placeholder-ink-muted focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Contact Number (+94...)"
                    value={ticketForm.contactNumber}
                    onChange={e => setTicketForm(f => ({ ...f, contactNumber: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-xs text-ink placeholder-ink-muted focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Subject (e.g. Order Delivery Status)"
                  value={ticketForm.subject}
                  onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-xs text-ink placeholder-ink-muted focus:outline-none focus:border-cyan-500"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your issue or request..."
                  value={ticketForm.description}
                  onChange={e => setTicketForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-xs text-ink placeholder-ink-muted focus:outline-none focus:border-cyan-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={ticketStatus === 'submitting'}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{ticketStatus === 'submitting' ? 'Submitting...' : 'Submit Support Ticket'}</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* ── CART DRAWER MODAL ───────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-surface-card border-l border-surface-border h-full flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-500" />
                <h3 className="font-display font-bold text-base text-white">Your Shopping Cart</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-ink-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-ink-muted text-xs">
                  Your cart is empty. Add some books to get started!
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.book.id}
                    className="p-3 rounded-xl bg-surface border border-surface-border flex items-center gap-3"
                  >
                    <div className="w-12 h-16 rounded-lg bg-surface-muted overflow-hidden shrink-0">
                      {item.book.coverImage && (
                        <img src={item.book.coverImage} alt={item.book.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs text-white truncate">{item.book.title}</h4>
                      <p className="text-[11px] text-brand-400 font-semibold mt-0.5">
                        LKR {item.book.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.book.id, -1)}
                        className="p-1 rounded bg-surface-card text-ink-muted hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.book.id, 1)}
                        className="p-1 rounded bg-surface-card text-ink-muted hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.book.id)}
                        className="p-1 text-red-400 hover:text-red-300 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Promo Code Input */}
            {cart.length > 0 && (
              <div className="py-3 border-t border-surface-border space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Promo Code"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-ink uppercase"
                  />
                  <button
                    onClick={applyPromo}
                    className="px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white text-xs font-semibold"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-red-400">{promoError}</p>}
                {promoApplied && <p className="text-[11px] text-emerald-400">✓ {promoDiscount}% discount applied!</p>}
              </div>
            )}

            {/* Checkout Total */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-surface-border space-y-2">
                <div className="flex justify-between text-xs text-ink-muted">
                  <span>Subtotal</span>
                  <span>LKR {subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>Discount ({promoDiscount}%)</span>
                    <span>- LKR {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-surface-border/50">
                  <span>Total</span>
                  <span>LKR {total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => alert(`Order placed successfully for LKR ${total.toFixed(2)}! Payment recorded under Module M2.`)}
                  className="w-full mt-3 py-3 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-[#0f1117] border-t border-surface-border mt-16 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-white">Sarasavi Pages (Pvt) Ltd.</span>
              <p className="text-[11px] text-ink-muted">SE2030 Software Engineering — Year 2 Semester 1 Group Project (Group B9G2)</p>
            </div>
          </div>

          {/* Members list */}
          <div className="text-center md:text-right text-[11px] text-ink-muted space-y-0.5">
            <p><strong>M1:</strong> Gunathilaka (Admin & Staff) | <strong>M2:</strong> Anaf (Payments) | <strong>M3:</strong> Zeen (Support)</p>
            <p><strong>M4:</strong> Dissanayake (Inventory) | <strong>M5:</strong> Gayathmi (Accounts) | <strong>M6:</strong> Diyes (Orders & Cart)</p>
          </div>

          <Link
            href="/login"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors underline"
          >
            Go to Admin & Staff Portal &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
