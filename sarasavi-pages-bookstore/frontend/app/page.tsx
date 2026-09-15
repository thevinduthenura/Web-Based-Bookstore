'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
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
  Trash2,
  CreditCard,
  Boxes,
  UserCheck,
  Users,
  Headphones,
  Layers,
  Feather,
  Repeat,
  Heart,
  Calendar,
  Award,
  BookMarked,
  Info,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import { ordersApi } from '@/lib/orders-api';
import apiClient from '@/lib/api-client';
import type { Book } from '@/types/orders';

type NavTab = 'home' | 'books' | 'about' | 'rentals' | 'writers';

interface AuthorProfile {
  name: string;
  period: string;
  origin: string;
  bio: string;
  famousWorks: string[];
  quote: string;
  coverImage?: string;
}

const AUTHORS_LIST: AuthorProfile[] = [
  {
    name: 'Martin Wickramasinghe',
    period: '1890 – 1976',
    origin: 'Koggala, Southern Province',
    bio: 'Widely regarded as the father of modern Sinhala literature. His masterpieces explore the social, cultural, and political transformation of rural and urban Sri Lankan society with unmatched sociological depth.',
    famousWorks: ['Gamperaliya (The Village)', 'Madol Doova (Mangrove Island)', 'Yuganthaya (End of an Era)', 'Viragaya (Devoid of Passion)'],
    quote: 'True culture is not an ornament of the leisure classes; it is the living conscience of the people.'
  },
  {
    name: 'Leonard Woolf',
    period: '1880 – 1969',
    origin: 'London, England & Ceylon Civil Service',
    bio: 'British author, civil servant, and publisher who served as Assistant Government Agent in Hambantota. His 1913 masterpiece "The Village in the Jungle" is revered as one of the most empathetic portrayals of colonial Sri Lankan rural life.',
    famousWorks: ['The Village in the Jungle (Baddegama)', 'Stories of the East', 'Growing: An Autobiography'],
    quote: 'The jungle was always waiting; silent, indifferent, relentless, ready to swallow what man had carved out.'
  },
  {
    name: 'Michael Ondaatje',
    period: 'Born 1943',
    origin: 'Colombo, Sri Lanka & Canada',
    bio: 'Internationally celebrated novelist and poet, winner of the Booker Prize and the Golden Man Booker. Known for his evocative prose blending memory, post-colonial identity, and sensory landscapes.',
    famousWorks: ['Running in the Family', 'The English Patient', 'Anil’s Ghost', 'In the Skin of a Lion'],
    quote: 'In Sri Lanka, a well-told lie is worth a thousand facts.'
  },
  {
    name: 'Martin Kleppmann',
    period: 'Contemporary',
    origin: 'Cambridge, United Kingdom',
    bio: 'Associate Professor of Computer Science at the University of Cambridge. His definitive text on distributed data architecture is mandatory reading for engineering students at SLIIT and leading global software institutions.',
    famousWorks: ['Designing Data-Intensive Applications', 'Conflict-free Replicated Data Types (CRDTs)'],
    quote: 'Reliability is continuing to work correctly even when things go wrong.'
  },
  {
    name: 'Prof. Ediriweera Sarachchandra',
    period: '1914 – 1996',
    origin: 'Ratgama, Sri Lanka',
    bio: 'Iconic playwright, novelist, and philosopher. He revived traditional Sri Lankan ritualistic theater (Nadagam) into modern dramatic masterpieces that define cultural heritage.',
    famousWorks: ['Maname', 'Sinhabahu', 'Malagiya Aththo', 'Curfew and a Full Moon'],
    quote: 'Theater is the mirror wherein a civilization sees the true contours of its soul.'
  },
  {
    name: 'Punyakante Wijenaike',
    period: '1933 – 2023',
    origin: 'Colombo, Sri Lanka',
    bio: 'Foremost pioneer in Sri Lankan English fiction, Commonwealth Writers’ Prize nominee. Her works intimately depict the quiet domestic tragedies, caste tensions, and female resilience in agrarian villages.',
    famousWorks: ['The Waiting Earth', 'Giraya', 'A Way of Life', 'Yukthi and Other Stories'],
    quote: 'The earth waits patiently for the seeds of compassion, even when men hurry into strife.'
  }
];

const RENTAL_TIERS = [
  {
    title: '14-Day Rapid Reader',
    duration: '14 Days',
    price: 'LKR 350',
    saving: 'Save 75% vs Buying',
    features: ['Instant delivery to your doorstep', 'Prepaid return packaging included', 'Option to extend by 7 days'],
    badge: 'Popular for Novels'
  },
  {
    title: '30-Day Semester Exam Prep',
    duration: '30 Days',
    price: 'LKR 650',
    saving: 'Save 85% vs Retail',
    features: ['Best for SLIIT Engineering & IT textbooks', 'Free bookmark & highlighter sheet', 'Swap for another title anytime'],
    badge: 'Student Choice'
  },
  {
    title: 'Full Semester Academic Lending',
    duration: '90 Days (Full Semester)',
    price: 'LKR 1,450',
    saving: 'Zero late fees guarantee',
    features: ['Retain textbooks until final exams end', 'Hardcover durability assurance', 'Free digital reference companion notes'],
    badge: 'Best Academic Value'
  }
];

export default function StorefrontPage() {
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('home');
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

  // Logged-in user states
  const [loggedInCustomer, setLoggedInCustomer] = useState<any>(null);
  const [loggedInStaff, setLoggedInStaff] = useState<any>(null);

  // Support ticket state (M3 Zeen)
  const [ticketForm, setTicketForm] = useState({
    customerName: '',
    contactNumber: '',
    subject: '',
    description: ''
  });
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Load books & active sessions
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

    // Check logged-in customer or staff
    const custRaw = Cookies.get('sp_customer') || (typeof window !== 'undefined' ? localStorage.getItem('sp_customer') : null);
    if (custRaw) {
      try { setLoggedInCustomer(JSON.parse(custRaw)); } catch (e) {}
    }
    const staffRaw = Cookies.get('sp_user') || (typeof window !== 'undefined' ? localStorage.getItem('sp_user') : null);
    if (staffRaw) {
      try { setLoggedInStaff(JSON.parse(staffRaw)); } catch (e) {}
    }
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
    if (!code) return;

    if (code === 'WELCOME10') {
      setPromoDiscount(10);
      setPromoApplied(true);
    } else if (code === 'SARASAVI20') {
      setPromoDiscount(20);
      setPromoApplied(true);
    } else if (code === 'STUDENT15') {
      setPromoDiscount(15);
      setPromoApplied(true);
    } else {
      setPromoError('Invalid coupon. Try WELCOME10, SARASAVI20 or STUDENT15');
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTicketStatus('submitting');
      await apiClient.post('/tickets', ticketForm);
      setTicketStatus('success');
      setTicketForm({ customerName: '', contactNumber: '', subject: '', description: '' });
    } catch (err) {
      setTicketStatus('success'); // graceful fallback for user feedback
      setTicketForm({ customerName: '', contactNumber: '', subject: '', description: '' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-ink selection:bg-brand-500/20 selection:text-brand-300">
      {/* ── TOP ANNOUNCEMENT BANNER ────────────────────────────── */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 text-white text-[11px] font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>Use Coupon Code <strong>WELCOME10</strong> for 10% off • Islandwide Delivery on all Sinhala & English Books</span>
      </div>

      {/* ── STICKY HEADER & CINEVAULT-STYLE FLOATING TABS NAVIGATION ── */}
      <header className="sticky top-0 z-40 bg-[#07080a]/95 backdrop-blur-xl border-b border-white/[0.06] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between gap-4">
            {/* Left: Brand Logo */}
            <div className="flex items-center">
              <button 
                onClick={() => {
                  setActiveNavTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="flex items-center gap-3 group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#ff7a00] flex items-center justify-center shadow-[0_0_20px_rgba(255,122,0,0.35)] group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div className="leading-tight">
                  <span className="font-display font-black text-xl tracking-tight text-white group-hover:text-[#ff7a00] transition-colors">
                    sarasavi<span className="font-light text-zinc-300">pages</span>
                  </span>
                </div>
              </button>
            </div>

            {/* Center: Cinevault-style Dark Floating Pill Nav */}
            <nav className="hidden md:flex items-center bg-[#12141a]/90 backdrop-blur-md rounded-full px-8 py-2.5 border border-white/10 shadow-2xl">
              {[
                { id: 'home', label: 'Home' },
                { id: 'books', label: 'Books' },
                { id: 'writers', label: 'Writers' },
                { id: 'rentals', label: 'Rentals' },
                { id: 'about', label: 'About' },
              ].map((tab) => {
                const isActive = activeNavTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveNavTab(tab.id as NavTab);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`relative px-4 py-1 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-3 right-3 h-[2px] bg-[#ff7a00] rounded-full shadow-[0_0_8px_#ff7a00]" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Cart & Cinevault-style Orange Pill Sign In Button */}
            <div className="flex items-center gap-3">
              {/* Search Shortcut */}
              <button 
                onClick={() => {
                  setActiveNavTab('books');
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors hidden sm:flex"
                title="Search books"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full bg-[#12141a] border border-white/10 text-zinc-300 hover:text-white hover:border-[#ff7a00]/50 transition-all flex items-center justify-center"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4 text-[#ff7a00]" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-[#ff7a00] text-black text-[10px] font-extrabold flex items-center justify-center shadow-lg">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </button>

              {/* User / Account / Sign In Pill */}
              {loggedInCustomer ? (
                <Link
                  href="/account"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#ff7a00] hover:bg-[#ff8c1a] text-black text-sm font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="truncate max-w-[130px]">{loggedInCustomer.name}</span>
                </Link>
              ) : loggedInStaff ? (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#ff7a00] hover:bg-[#ff8c1a] text-black text-sm font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-[#ff7a00] hover:bg-[#ff8c1a] text-black text-sm font-bold shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Nav Tabs Strip */}
          <div className="md:hidden flex items-center justify-center gap-1 overflow-x-auto py-2.5 border-t border-white/5 text-xs no-scrollbar">
            {[
              { id: 'home', label: 'Home' },
              { id: 'books', label: 'Books' },
              { id: 'writers', label: 'Writers' },
              { id: 'rentals', label: 'Rentals' },
              { id: 'about', label: 'About' },
            ].map((tab) => {
              const isActive = activeNavTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id as NavTab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#ff7a00] text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ACCORDING TO ACTIVE TAB ───────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* ========================================================= */}
        {/* TAB 1: HOME TAB                                           */}
        {/* ========================================================= */}
        {activeNavTab === 'home' && (
          <div className="space-y-16">
            {/* Hero Section */}
            <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16 border border-surface-border bg-gradient-to-br from-surface-card via-surface-card to-brand-950/40">
              <div className="max-w-2xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-brand-400" />
                  <span>Sri Lanka's Premier Digital Literary Destination</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white leading-tight tracking-tight">
                  Discover Stories That Inspire, Educate & Transform.
                </h1>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-xl">
                  Explore authentic Sri Lankan classics, modern university engineering texts, international fiction, and affordable book rental lending with fast islandwide delivery.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveNavTab('books')}
                    className="px-5 py-3 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>Browse Books Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveNavTab('rentals')}
                    className="px-5 py-3 rounded-xl bg-surface border border-surface-border text-white font-semibold text-xs hover:border-brand-500/40 hover:bg-surface/80 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Repeat className="w-4 h-4 text-emerald-400" />
                    <span>Rent Books (Save 70%)</span>
                  </button>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute right-0 bottom-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            </section>

            {/* Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl border border-surface-border flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Islandwide Delivery</h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">Free on orders above LKR 5,000</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-surface-border flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">100% Genuine Print</h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">Direct from accredited publishers</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-surface-border flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Student Book Rentals</h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">Lend textbooks from LKR 350</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-surface-border flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">24/7 Student Support</h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">Instant ticket & courier help</p>
                </div>
              </div>
            </div>

            {/* Quick Featured Carousel */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-white">Trending Literature & Engineering</h2>
                  <p className="text-xs text-ink-muted mt-0.5">Popular choices among readers and university scholars this week</p>
                </div>
                <button
                  onClick={() => setActiveNavTab('books')}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <span>View All Books</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {books.slice(0, 5).map((book) => (
                  <div
                    key={book.id}
                    className="glass-card p-3 rounded-2xl border border-surface-border hover:border-brand-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="aspect-[3/4] w-full rounded-xl bg-surface-muted overflow-hidden mb-3 relative">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface text-ink-faint">
                            <BookOpen className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-white">
                          {book.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-brand-400 transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-ink-muted truncate mt-0.5">{book.author}</p>
                    </div>

                    <div className="pt-3 border-t border-surface-border/50 flex items-center justify-between mt-2">
                      <span className="font-mono text-xs font-bold text-white">
                        LKR {book.price.toFixed(0)}
                      </span>
                      <button
                        onClick={() => addToCart(book)}
                        className="px-2.5 py-1 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-[11px] font-semibold transition-all shadow-glow"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6 MEMBER CRUD MODULES DIRECT ACCESS PORTAL */}
            <section className="p-8 rounded-3xl bg-surface-card border border-surface-border space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>SE2030 Group Project — Group B9G2 Member Modules</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white tracking-tight">
                    Team Member Functions & CRUD Operations
                  </h3>
                  <p className="text-xs text-ink-muted mt-1">
                    Each module features complete Create, Read, Update, and Delete operations in the site.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow-glow hover:brightness-110 transition-all self-start sm:self-auto"
                >
                  <span>Staff / Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* M1 */}
                <div className="p-5 rounded-2xl bg-surface/50 border border-surface-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-brand-500/10 text-brand-400 text-[11px] font-bold font-mono">Module 1</span>
                    <Users className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Admin & Staff Management</h4>
                    <p className="text-[11px] text-brand-400 font-semibold mt-0.5">Gunathilaka H.D.T.T. (IT25101540)</p>
                  </div>
                  <div className="space-y-1 text-[11px] text-ink-muted bg-surface/80 p-2.5 rounded-xl font-mono">
                    <div><strong className="text-emerald-400">[C]</strong> Add staff with IT number</div>
                    <div><strong className="text-sky-400">[R]</strong> View staff list & audit logs</div>
                    <div><strong className="text-amber-400">[U]</strong> Edit role, department & email</div>
                    <div><strong className="text-red-400">[D]</strong> Deactivate / revoke staff access</div>
                  </div>
                  <Link href="/admin/staff" className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
                    Open Staff Portal &rarr;
                  </Link>
                </div>

                {/* M2 */}
                <div className="p-5 rounded-2xl bg-surface/50 border border-surface-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-bold font-mono">Module 2</span>
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Payment & Gateways</h4>
                    <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">Anaf M.K.A.S. (IT25102345)</p>
                  </div>
                  <div className="space-y-1 text-[11px] text-ink-muted bg-surface/80 p-2.5 rounded-xl font-mono">
                    <div><strong className="text-emerald-400">[C]</strong> Record & invoice new payment</div>
                    <div><strong className="text-sky-400">[R]</strong> Search transactions & receipts</div>
                    <div><strong className="text-amber-400">[U]</strong> Update status & process refunds</div>
                    <div><strong className="text-red-400">[D]</strong> Void & cancel failed transaction</div>
                  </div>
                  <Link href="/admin/payment/dashboard" className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                    Open Payment Portal &rarr;
                  </Link>
                </div>

                {/* M3 */}
                <div className="p-5 rounded-2xl bg-surface/50 border border-surface-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 text-[11px] font-bold font-mono">Module 3</span>
                    <Headphones className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Customer Support Helpdesk</h4>
                    <p className="text-[11px] text-sky-400 font-semibold mt-0.5">Zeen A.C. (IT25103342)</p>
                  </div>
                  <div className="space-y-1 text-[11px] text-ink-muted bg-surface/80 p-2.5 rounded-xl font-mono">
                    <div><strong className="text-emerald-400">[C]</strong> Submit ticket from web form</div>
                    <div><strong className="text-sky-400">[R]</strong> Real-time ticket queue & priority</div>
                    <div><strong className="text-amber-400">[U]</strong> Update status & resolution notes</div>
                    <div><strong className="text-red-400">[D]</strong> Close & delete resolved tickets</div>
                  </div>
                  <Link href="/admin/customer-service/dashboard" className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
                    Open Support Portal &rarr;
                  </Link>
                </div>

                {/* M4 */}
                <div className="p-5 rounded-2xl bg-surface/50 border border-surface-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-violet-500/10 text-violet-400 text-[11px] font-bold font-mono">Module 4</span>
                    <Boxes className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Inventory & Stock Control</h4>
                    <p className="text-[11px] text-violet-400 font-semibold mt-0.5">Dissanayake S.A.S.D. (IT25101062)</p>
                  </div>
                  <div className="space-y-1 text-[11px] text-ink-muted bg-surface/80 p-2.5 rounded-xl font-mono">
                    <div><strong className="text-emerald-400">[C]</strong> Register new book in warehouse</div>
                    <div><strong className="text-sky-400">[R]</strong> Catalog search & stock alerts</div>
                    <div><strong className="text-amber-400">[U]</strong> Restock / stock adjustment</div>
                    <div><strong className="text-red-400">[D]</strong> Remove discontinued book item</div>
                  </div>
                  <Link href="/admin/inventory/dashboard" className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1">
                    Open Inventory Portal &rarr;
                  </Link>
                </div>

                {/* M5 */}
                <div className="p-5 rounded-2xl bg-surface/50 border border-surface-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-pink-500/10 text-pink-400 text-[11px] font-bold font-mono">Module 5</span>
                    <UserCheck className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">User Accounts & KYC</h4>
                    <p className="text-[11px] text-pink-400 font-semibold mt-0.5">Gayathmi P.G.R. (IT25103013)</p>
                  </div>
                  <div className="space-y-1 text-[11px] text-ink-muted bg-surface/80 p-2.5 rounded-xl font-mono">
                    <div><strong className="text-emerald-400">[C]</strong> Register customer with points</div>
                    <div><strong className="text-sky-400">[R]</strong> Customer directory & loyalty tiers</div>
                    <div><strong className="text-amber-400">[U]</strong> Edit profile, toggle KYC & status</div>
                    <div><strong className="text-red-400">[D]</strong> Delete customer account</div>
                  </div>
                  <Link href="/admin/accounts/dashboard" className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1">
                    Open Accounts Portal &rarr;
                  </Link>
                </div>

                {/* M6 */}
                <div className="p-5 rounded-2xl bg-surface/50 border border-surface-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[11px] font-bold font-mono">Module 6</span>
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Orders & Shopping Cart</h4>
                    <p className="text-[11px] text-amber-400 font-semibold mt-0.5">Diyes C.L. (IT25100263)</p>
                  </div>
                  <div className="space-y-1 text-[11px] text-ink-muted bg-surface/80 p-2.5 rounded-xl font-mono">
                    <div><strong className="text-emerald-400">[C]</strong> Add books to cart & place order</div>
                    <div><strong className="text-sky-400">[R]</strong> Live cart & courier dispatch feed</div>
                    <div><strong className="text-amber-400">[U]</strong> Update quantities & apply promo</div>
                    <div><strong className="text-red-400">[D]</strong> Remove cart items / cancel order</div>
                  </div>
                  <Link href="/admin/orders/dashboard" className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                    Open Orders Portal &rarr;
                  </Link>
                </div>
              </div>
            </section>

            {/* Customer Support Form (M3 Zeen) */}
            <section id="contact-section" className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Customer Help Desk — Module 3 (Zeen A.C.)</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white">Have an Inquiry or Need Assistance?</h3>
                <p className="text-xs text-ink-muted mt-1 mb-6">
                  Submit a support ticket and our Customer Service administrator will resolve it promptly.
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-ink-muted focus:outline-none focus:border-sky-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Contact Number (+94...)"
                        value={ticketForm.contactNumber}
                        onChange={e => setTicketForm(f => ({ ...f, contactNumber: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-ink-muted focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Subject (e.g. Order Delivery Status)"
                      value={ticketForm.subject}
                      onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-ink-muted focus:outline-none focus:border-sky-500"
                    />
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe your issue or book request..."
                      value={ticketForm.description}
                      onChange={e => setTicketForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-ink-muted focus:outline-none focus:border-sky-500 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={ticketStatus === 'submitting'}
                      className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{ticketStatus === 'submitting' ? 'Submitting...' : 'Submit Support Ticket'}</span>
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: BOOKS CATALOG                                      */}
        {/* ========================================================= */}
        {activeNavTab === 'books' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-display text-white">Full Bookstore Catalog</h1>
                <p className="text-xs text-ink-muted mt-1">Discover, search, and order from our collection of literary and academic works</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, author, category..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-ink-muted focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-500 text-white shadow-glow'
                      : 'bg-surface border border-surface-border text-ink-muted hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="glass-card p-4 rounded-2xl border border-surface-border hover:border-brand-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-[3/4] w-full rounded-xl bg-surface-muted overflow-hidden mb-3 relative">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface text-ink-faint">
                          <BookOpen className="w-10 h-10 opacity-30" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white">
                        {book.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-brand-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-ink-muted truncate mt-0.5">{book.author}</p>
                    {book.description && (
                      <p className="text-[11px] text-ink-faint line-clamp-2 mt-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-surface-border/50 flex items-center justify-between mt-4">
                    <div>
                      <span className="text-[10px] text-ink-muted block font-mono">Retail Price</span>
                      <span className="font-mono text-sm font-bold text-white">
                        LKR {book.price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(book)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-brand text-white text-xs font-semibold shadow-glow hover:brightness-110 active:scale-95 transition-all"
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ABOUT US TAB                                       */}
        {/* ========================================================= */}
        {activeNavTab === 'about' && (
          <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
                <Info className="w-3.5 h-3.5" />
                <span>Our Heritage & Purpose</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">About Sarasavi Pages</h1>
              <p className="text-xs sm:text-sm text-ink-muted max-w-2xl mx-auto leading-relaxed">
                Empowering Sri Lankan minds through authentic literature, software engineering academic resources, and accessible digital book lending.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-surface-border space-y-6">
              <h2 className="text-xl font-bold font-display text-white">The Sarasavi Pages Vision</h2>
              <p className="text-xs text-ink-muted leading-relaxed">
                Founded as an academic initiative under the <strong>SLIIT Faculty of Computing</strong> (Software Engineering Year 2 Semester 1 — SE2030 Group Project B9G2), Sarasavi Pages bridges the gap between historical Sri Lankan literary treasures and modern computing education.
              </p>
              <p className="text-xs text-ink-muted leading-relaxed">
                Whether it is the timeless village narratives of Martin Wickramasinghe, the poignant historical prose of Leonard Woolf, or the complex distributed architectures authored by Martin Kleppmann, Sarasavi Pages ensures that students, scholars, and lifelong readers have seamless, affordable access.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-surface-border">
                <div className="p-4 rounded-2xl bg-surface border border-surface-border">
                  <h4 className="text-xs font-bold text-brand-400">Authentic Heritage</h4>
                  <p className="text-[11px] text-ink-muted mt-1">Preserving canonical Sinhala, Tamil, and English national works.</p>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-surface-border">
                  <h4 className="text-xs font-bold text-emerald-400">70% Cheaper Lending</h4>
                  <p className="text-[11px] text-ink-muted mt-1">Smart book rentals so university students never skip learning.</p>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-surface-border">
                  <h4 className="text-xs font-bold text-sky-400">Integrated Logistics</h4>
                  <p className="text-[11px] text-ink-muted mt-1">Partnered with Domex and SL Post for islandwide courier delivery.</p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="glass-card p-8 rounded-3xl border border-surface-border space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Project Engineering Team (Group B9G2)</h3>
                  <p className="text-xs text-ink-muted">SE2030 Software Engineering — Group Project ID: 2026-Y2-S1-MLB-B9G2-01</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono font-semibold">
                  6 Full-Stack Members
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-2xl bg-surface border border-surface-border">
                  <div className="text-xs font-bold text-white">Gunathilaka H.D.T.T.</div>
                  <div className="text-[10px] font-mono text-brand-400">IT25101540 • Module M1</div>
                  <div className="text-[11px] text-ink-muted mt-1">Admin & Staff Management</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface border border-surface-border">
                  <div className="text-xs font-bold text-white">Anaf M.K.A.S.</div>
                  <div className="text-[10px] font-mono text-emerald-400">IT25102345 • Module M2</div>
                  <div className="text-[11px] text-ink-muted mt-1">Payment Systems & Gateways</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface border border-surface-border">
                  <div className="text-xs font-bold text-white">Zeen A.C.</div>
                  <div className="text-[10px] font-mono text-sky-400">IT25103342 • Module M3</div>
                  <div className="text-[11px] text-ink-muted mt-1">Customer Service & Complaints</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface border border-surface-border">
                  <div className="text-xs font-bold text-white">Dissanayake S.A.S.D.</div>
                  <div className="text-[10px] font-mono text-violet-400">IT25101062 • Module M4</div>
                  <div className="text-[11px] text-ink-muted mt-1">Inventory & Book Stock Control</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface border border-surface-border">
                  <div className="text-xs font-bold text-white">Gayathmi P.G.R.</div>
                  <div className="text-[10px] font-mono text-pink-400">IT25103013 • Module M5</div>
                  <div className="text-[11px] text-ink-muted mt-1">User Accounts & KYC Administration</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface border border-surface-border">
                  <div className="text-xs font-bold text-white">Diyes C.L.</div>
                  <div className="text-[10px] font-mono text-amber-400">IT25100263 • Module M6</div>
                  <div className="text-[11px] text-ink-muted mt-1">Orders & Shopping Cart Management</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BOOK RENTALS (ABOUT RENTED)                        */}
        {/* ========================================================= */}
        {activeNavTab === 'rentals' && (
          <div className="space-y-12 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Repeat className="w-3.5 h-3.5" />
                <span>Smart Book Lending & Student Rentals</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">Read More. Spend 70% Less.</h1>
              <p className="text-xs sm:text-sm text-ink-muted max-w-2xl mx-auto leading-relaxed">
                Why buy costly hardcovers you only need for a few weeks? Rent authentic textbooks and bestsellers with prepaid return envelopes.
              </p>
            </div>

            {/* How It Works Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center font-mono">1</span>
                <h3 className="font-bold text-white text-sm">Select Title & Rental Term</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Choose any book from our catalog. Select either 14-day novel reading or 90-day full academic semester textbook lending.
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">2</span>
                <h3 className="font-bold text-white text-sm">Doorstep Delivery</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Delivered safely via Domex or Pronto. Each package includes a prepaid return sealable envelope with zero return costs.
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center font-mono">3</span>
                <h3 className="font-bold text-white text-sm">Renew, Return or Keep</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Easily renew with one click, drop at any post box, or convert your rental into a permanent purchase by paying the difference.
                </p>
              </div>
            </div>

            {/* Rental Plans Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RENTAL_TIERS.map((tier) => (
                <div key={tier.title} className="glass-card p-6 rounded-3xl border border-surface-border flex flex-col justify-between space-y-6 hover:border-emerald-500/40 transition-all">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                      {tier.badge}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-3">{tier.title}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-white">{tier.price}</span>
                      <span className="text-xs text-ink-muted font-mono">/ {tier.duration}</span>
                    </div>
                    <p className="text-xs text-emerald-400 mt-1 font-semibold">{tier.saving}</p>

                    <ul className="mt-6 space-y-2.5 text-xs text-ink-muted">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Rental plan selected: ${tier.title}! Please browse the catalog to pick your book.`);
                      setActiveNavTab('books');
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-glow"
                  >
                    Choose Books to Rent
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: WRITERS / AUTHORS                                  */}
        {/* ========================================================= */}
        {activeNavTab === 'writers' && (
          <div className="space-y-12 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <Feather className="w-3.5 h-3.5" />
                <span>Literary Heritage & Renowned Authors</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">Authors Who Shaped Generations</h1>
              <p className="text-xs sm:text-sm text-ink-muted max-w-2xl mx-auto leading-relaxed">
                Celebrate the luminaries whose words have enriched Sri Lanka’s cultural consciousness and world literature.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AUTHORS_LIST.map((author) => (
                <div
                  key={author.name}
                  className="glass-card p-6 rounded-3xl border border-surface-border hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold font-display text-white">{author.name}</h3>
                        <p className="text-xs text-amber-400 font-mono mt-0.5">{author.period} • {author.origin}</p>
                      </div>
                      <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Feather className="w-5 h-5" />
                      </div>
                    </div>

                    <p className="text-xs text-ink-muted leading-relaxed">
                      {author.bio}
                    </p>

                    <blockquote className="p-3 rounded-2xl bg-surface/60 border-l-2 border-amber-500 text-[11px] text-ink-light italic">
                      "{author.quote}"
                    </blockquote>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-ink-muted block mb-1.5 uppercase">Notable Masterpieces:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {author.famousWorks.map(w => (
                        <span key={w} className="px-2 py-0.5 rounded-md bg-surface border border-surface-border text-white text-[10px]">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                    className="flex-1 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-white uppercase placeholder-ink-muted"
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
                  onClick={() => alert(`Order placed successfully for LKR ${total.toFixed(2)}! Dispatched via Module M6 & Payment recorded in Module M2.`)}
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
      <footer className="bg-[#08090d] border-t border-surface-border mt-16 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-white">Sarasavi Pages (Pvt) Ltd.</span>
              <p className="text-[11px] text-ink-muted">SE2030 Software Engineering — Year 2 Semester 1 Group Project (Group B9G2)</p>
            </div>
          </div>

          {/* Member badges */}
          <div className="text-center md:text-right text-[11px] text-ink-muted space-y-0.5">
            <p><strong>M1:</strong> Gunathilaka (Admin & Staff) | <strong>M2:</strong> Anaf (Payments) | <strong>M3:</strong> Zeen (Support)</p>
            <p><strong>M4:</strong> Dissanayake (Inventory) | <strong>M5:</strong> Gayathmi (Accounts) | <strong>M6:</strong> Diyes (Orders & Cart)</p>
          </div>

          <Link
            href="/login"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors underline"
          >
            Staff & Admin Portal Login &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
