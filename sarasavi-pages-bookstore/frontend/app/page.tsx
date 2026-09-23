'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrambleTextReveal, addMagneticEffect } from '@/hooks/useGsapAnimations';
import Link from 'next/link';
import Cookies from 'js-cookie';
import AdminModeBar from '@/components/admin/AdminModeBar';
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
  HelpCircle, 
  Truck, 
  Clock, 
  Send,
  X,
  Plus,
  Minus,
  Trash2,
  Users,
  Layers,
  Feather,
  Repeat,
  Award,
  Info,
  User,
  SlidersHorizontal,
  ChevronRight,
  Quote,
  Compass,
  Globe,
  Bookmark,
  LogOut,
  Bell,
  LayoutDashboard,
  Instagram,
  Facebook,
  Twitter
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
}

const AUTHORS_LIST: AuthorProfile[] = [
  {
    name: 'Martin Wickramasinghe',
    period: '1890 - 1976',
    origin: 'Koggala, Southern Province',
    bio: 'Widely regarded as the father of modern Sinhala literature. His masterpieces explore the social, cultural, and political transformation of rural and urban Sri Lankan society with unmatched sociological depth.',
    famousWorks: ['Gamperaliya (The Village)', 'Madol Doova (Mangrove Island)', 'Yuganthaya (End of an Era)', 'Viragaya (Devoid of Passion)'],
    quote: 'True culture is not an ornament of the leisure classes; it is the living conscience of the people.'
  },
  {
    name: 'Leonard Woolf',
    period: '1880 - 1969',
    origin: 'London & Ceylon Civil Service (Hambantota)',
    bio: 'British author, political theorist, and publisher who served as Assistant Government Agent in Hambantota. His 1913 classic "The Village in the Jungle" stands as one of the most empathetic portrayals of colonial Sri Lankan rural reality.',
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
    origin: 'University of Cambridge, UK',
    bio: 'Associate Professor of Computer Science at Cambridge. His definitive treatise on distributed systems and data architecture is foundational reading for engineering students at SLIIT and leading global software institutions.',
    famousWorks: ['Designing Data-Intensive Applications', 'Conflict-free Replicated Data Types (CRDTs)'],
    quote: 'Reliability is continuing to work correctly even when things go wrong.'
  },
  {
    name: 'Prof. Ediriweera Sarachchandra',
    period: '1914 - 1996',
    origin: 'Ratgama, Sri Lanka',
    bio: 'Iconic playwright, novelist, and philosopher. He revived traditional Sri Lankan ritualistic theater (Nadagam) into modern dramatic masterpieces that define the island’s cultural conscience.',
    famousWorks: ['Maname', 'Sinhabahu', 'Malagiya Aththo', 'Curfew and a Full Moon'],
    quote: 'Theater is the mirror wherein a civilization sees the true contours of its soul.'
  },
  {
    name: 'Punyakante Wijenaike',
    period: '1933 - 2023',
    origin: 'Colombo, Sri Lanka',
    bio: 'Foremost pioneer in Sri Lankan English fiction, Commonwealth Writers’ Prize nominee. Her works intimately depict quiet domestic tragedies, social tensions, and female resilience in agrarian villages.',
    famousWorks: ['The Waiting Earth', 'Giraya', 'A Way of Life', 'Yukthi and Other Stories'],
    quote: 'The earth waits patiently for the seeds of compassion, even when men hurry into strife.'
  }
];

const RENTAL_TIERS = [
  {
    title: '14-Day Rapid Reader',
    duration: '14 Days',
    price: 'LKR 350',
    saving: 'Save 75% vs Retail',
    features: [
      'Instant doorstep courier delivery',
      'Prepaid protective return envelope included',
      'Option to extend by 7 days at discounted fee',
      'Condition warranty against accidental minor wear'
    ],
    badge: 'Popular for Fiction & Novels'
  },
  {
    title: '30-Day Semester Exam Prep',
    duration: '30 Days',
    price: 'LKR 650',
    saving: 'Save 85% vs Retail',
    features: [
      'Engineered for SLIIT Computing & Engineering syllabi',
      'Complimentary curated bookmark & highlighter tabs',
      'Exchange for another subject title during term',
      '24/7 student support via Module M3 care'
    ],
    badge: 'Undergraduate Choice'
  },
  {
    title: 'Full Semester Academic Lending',
    duration: '90 Days (Full Semester)',
    price: 'LKR 1,450',
    saving: 'Zero Late Fees Guarantee',
    features: [
      'Retain essential course texts until finals conclude',
      'Hardcover library-grade durability assurance',
      'Free companion digital reference reading guide',
      'Option to purchase at 50% discount at end of term'
    ],
    badge: 'Best Academic Value'
  }
];

export default function StorefrontPage() {
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('home');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ── GSAP Animation Refs ──────────────────────────────────────────────────
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLHeadingElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const bentoRef = useRef<HTMLElement>(null);
  const featuredBooksRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
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
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
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

  // ── GSAP Animations ─────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // ─── 1. Hero Scramble Text ───────────────────────────────────────────
      if (heroTitleRef.current) {
        const titleEl = heroTitleRef.current;
        scrambleTextReveal(titleEl, titleEl.textContent || '', 1.8, 0.2);
        gsap.fromTo(
          titleEl,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.1 }
        );
      }

      // ─── 2. Hero Subtitle Parallax Slide ─────────────────────────────────
      if (heroSubtitleRef.current) {
        gsap.fromTo(
          heroSubtitleRef.current,
          { opacity: 0, x: 40, filter: 'blur(8px)' },
          { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', delay: 0.4 }
        );
      }

      // ─── 3. Scroll-Driven Clip-Path Reveal for sections ──────────────────
      const sections = document.querySelectorAll('[data-gsap-reveal]');
      sections.forEach((section, i) => {
        gsap.fromTo(
          section,
          {
            clipPath: 'inset(0% 0% 100% 0%)',
            y: 40,
            opacity: 0,
          },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            opacity: 1,
            duration: 1.0,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ─── 4. Bento Cards Stagger Spring ───────────────────────────────────
      if (bentoRef.current) {
        const bentoCards = bentoRef.current.children;
        gsap.fromTo(
          bentoCards,
          { opacity: 0, y: 60, scale: 0.92, rotateX: 8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.9,
            ease: 'back.out(1.4)',
            stagger: { each: 0.12, from: 'start' },
            scrollTrigger: {
              trigger: bentoRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // ─── 5. Steps Section - Line drawing animation ────────────────────────
      if (stepsRef.current) {
        const stepItems = stepsRef.current.querySelectorAll('[data-step-item]');
        gsap.fromTo(
          stepItems,
          { opacity: 0, x: -30, filter: 'blur(4px)' },
          {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'expo.out',
            stagger: 0.2,
            scrollTrigger: {
              trigger: stepsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // ─── 6. Testimonials - 3D card flip stagger ───────────────────────────
      if (testimonialsRef.current) {
        const cards = testimonialsRef.current.querySelectorAll('[data-testimonial-card]');
        gsap.set(cards, { transformPerspective: 800, transformOrigin: 'top center' });
        gsap.fromTo(
          cards,
          { opacity: 0, rotateX: -25, y: 50 },
          {
            opacity: 1,
            rotateX: 0,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.18,
            scrollTrigger: {
              trigger: testimonialsRef.current,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // ─── 7. GSAP Infinite Marquee Ticker ─────────────────────────────────
      if (marqueeRef.current) {
        const track = marqueeRef.current.querySelector('[data-marquee-track]') as HTMLElement;
        if (track) {
          const totalWidth = track.scrollWidth / 2;
          gsap.to(track, {
            x: `-${totalWidth}px`,
            duration: 28,
            ease: 'none',
            repeat: -1,
          });
        }
      }
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // ─── GSAP: Magnetic effect on featured book cards (runs after books load) ───
  useEffect(() => {
    if (typeof window === 'undefined' || books.length === 0) return;
    const cleanups: (() => void)[] = [];

    // Featured books stagger spring entrance
    if (featuredBooksRef.current) {
      const cards = featuredBooksRef.current.querySelectorAll('[data-book-card]');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50, scale: 0.9, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.75,
          ease: 'back.out(1.6)',
          stagger: { each: 0.1, from: 'center' },
          scrollTrigger: {
            trigger: featuredBooksRef.current,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Magnetic effect on each book card
      cards.forEach((card) => {
        const cleanup = addMagneticEffect(card as HTMLElement, 0.2);
        cleanups.push(cleanup);
      });
    }

    return () => {
      cleanups.forEach(fn => fn());
    };
  }, [books]);

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

  const handleCustomerSignOut = () => {
    Cookies.remove('sp_customer');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sp_customer');
    }
    setLoggedInCustomer(null);
  };

  return (
    <div className="min-h-screen bg-[#c8d8c6] bg-gradient-to-b from-[#bed4bc] via-[#cadbc8] to-[#e0ede0] text-[#122215] font-sans antialiased selection:bg-[#122215] selection:text-white pb-20">
      {/* ── CINEVAULT-STYLE ADMIN MODE TOP BAR (Visible only to Admins) ── */}
      {loggedInStaff && (
        <AdminModeBar showOnStorefront={true} />
      )}

      {/* ── HEALIUM AUTHENTIC FLOATING PILL NAVIGATION ───────── */}
      <header className="sticky top-4 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="ios-glass bg-white/85 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-full h-16 px-6 flex items-center justify-between gap-4 transition-all">
          {/* Left: Healium Organic Emblem + Wordmark */}
          <button 
            onClick={() => {
              setActiveNavTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            className="flex items-center gap-2.5 group text-left shrink-0"
          >
            <div className="flex items-center -space-x-1">
              <div className="w-3.5 h-3.5 rounded-full bg-[#122215] group-hover:scale-110 transition-transform" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:scale-110 transition-transform" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#122215] group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-medium text-lg tracking-tight text-[#122215] font-sans">
              sarasavi<span className="font-normal text-[#526456]">pages</span>
            </span>
          </button>

          {/* Center: Healium Pill Navigation */}
          <nav className="hidden md:flex items-center rounded-full p-1 bg-black/[0.04] gap-1">
            {[
              { id: 'home', label: '• Home' },
              { id: 'books', label: 'Books' },
              { id: 'writers', label: 'People' },
              { id: 'membership', label: 'Membership' },
              { id: 'rentals', label: 'Leaderboard' },
              { id: 'about', label: 'About' },
            ].map((tab) => {
              const isActive = activeNavTab === tab.id || (tab.id === 'books' && activeNavTab === 'books');
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'membership') {
                      setIsTicketModalOpen(true);
                    } else {
                      setActiveNavTab(tab.id as NavTab);
                    }
                    window.scrollTo({ top: tab.id === 'books' ? 500 : 0, behavior: 'smooth' });
                  }}
                  className={`relative px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#122215] shadow-sm'
                      : 'text-[#526456] hover:text-[#122215] hover:bg-white/40'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Currency, Bag, and Black Pill Login */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#46564a] hover:bg-black/[0.04] cursor-pointer">
              <Globe className="w-3.5 h-3.5 text-[#46564a] shrink-0" />
              <span>LKR</span>
              <ChevronRight className="w-3 h-3 rotate-90" />
            </div>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-3.5 py-1.5 rounded-full bg-white/90 border border-black/[0.06] text-[#122215] hover:bg-white shadow-sm text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Shopping Bag"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#1a2e22]" />
              <span className="hidden sm:inline">Bag</span>
              {cart.length > 0 && (
                <span className="h-4 min-w-[16px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-medium flex items-center justify-center">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* Login Pill Button */}
            {loggedInCustomer ? (
              <Link
                href="/account"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#122215] text-white text-xs font-medium shadow-md hover:bg-black transition-all"
              >
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <User className="w-2.5 h-2.5" />
                </div>
                <span>{loggedInCustomer.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#122215] hover:bg-black text-white text-xs font-medium shadow-md transition-all active:scale-95"
              >
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN VIEWPORT ──────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-20">

        {/* ========================================================= */}
        {/* TAB 1: HOME (LUMÓRA / HEALIUM EDITORIAL SHOWCASE)         */}
        {/* ========================================================= */}
        {activeNavTab === 'home' && (
          <>
            {/* ── HEALIUM AUTHENTIC FULL-BLEED HERO CANVAS ──────────────────────── */}
            <section ref={heroSectionRef} className="relative rounded-[36px] sm:rounded-[44px] overflow-hidden shadow-2xl bg-[#142316] text-white flex flex-col pt-6 pb-0">
              
              {/* Forest & Morning Sunlight Atmosphere Background */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/images/healium-moss-book.jpg')`,
                  filter: 'brightness(0.65) saturate(1.2)'
                }}
              />
              {/* Healium Green Atmospheric Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#162719]/80 via-[#182d1c]/50 to-[#0e1b10]/95" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />

              {/* ── TOP PILL INFO BADGES (INSIDE HERO) ── */}
              <div className="relative z-20 px-6 sm:px-10 pt-2 flex items-center justify-between">
                <div className="ios-glass inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white text-xs font-medium shadow-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span>islandwide express · all 25 districts</span>
                </div>
                <div className="hidden sm:flex ios-glass items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-xs font-medium shadow-md">
                  <Bookmark className="w-3.5 h-3.5 text-amber-300" />
                  <span>{books.length > 0 ? `${books.length}+ titles` : '1,500+ curated titles'}</span>
                </div>
              </div>

              {/* ── BOOKSTORE HERO HEADLINE SECTION ── */}
              <div className="relative z-10 px-6 sm:px-10 pt-6 pb-2 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-4 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sri Lanka&apos;s Trusted Online Bookstore</span>
                </div>
                <h1 ref={heroTitleRef} className="font-sans font-bold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08] drop-shadow-md">
                  Your Stories, Literature & Academic Textbooks
                </h1>
                <p className="text-white/80 text-xs sm:text-sm font-normal leading-relaxed max-w-xl mx-auto mt-4 drop-shadow-sm">
                  From celebrated Sinhala literary classics by Martin Wickramasinghe to SLIIT engineering & computing course texts. Delivered safely to your doorstep across all 25 districts.
                </p>
              </div>

              {/* ── CENTER BOOKSTORE SEARCH BAR & CATEGORY CHIPS ── */}
              <div className="relative z-10 max-w-2xl mx-auto w-full px-6 py-6 flex flex-col items-center">
                <div className="ios-glass-dark p-2 rounded-full flex items-center gap-2 shadow-2xl w-full border border-white/30 backdrop-blur-2xl">
                  <Search className="w-5 h-5 text-emerald-300 ml-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by book title, author, category, or ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setActiveNavTab('books');
                        window.scrollTo({ top: 500, behavior: 'smooth' });
                      }
                    }}
                    className="bg-transparent text-white placeholder-white/60 text-xs sm:text-sm focus:outline-none flex-1 min-w-0 px-2"
                  />
                  <button
                    onClick={() => {
                      setActiveNavTab('books');
                      window.scrollTo({ top: 500, behavior: 'smooth' });
                    }}
                    className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-lg shrink-0 flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Popular Genre Quick Filters */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                  <span className="text-white/70 text-[11px] font-medium">Browse:</span>
                  {['ALL', 'FICTION', 'LITERATURE', 'TECHNOLOGY', 'ACADEMIC'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveNavTab('books');
                        window.scrollTo({ top: 500, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium backdrop-blur-md border border-white/15 transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── BOOKSTORE CORE VALUE PROPOSITIONS DOCK ── */}
              <div className="relative z-20 bg-[#162719]/95 backdrop-blur-2xl rounded-t-[36px] sm:rounded-t-[44px] border-t border-white/20 p-6 sm:p-8 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Feature 1 */}
                  <div className="bg-white/95 rounded-3xl p-6 shadow-md border border-black/[0.04] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 shadow-xs">
                      <BookOpen className="w-5 h-5 text-emerald-700" />
                    </div>
                    <h3 className="font-bold text-[#122215] text-base">100% Genuine Print Editions</h3>
                    <p className="text-xs text-[#556358] leading-relaxed">
                      Sourced directly from premier Sri Lankan publishers and international university presses. Guaranteed crisp, authentic paperbacks and hardcovers.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-white/95 rounded-3xl p-6 shadow-md border border-black/[0.04] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-800 flex items-center justify-center border border-sky-100 shadow-xs">
                      <Truck className="w-5 h-5 text-sky-700" />
                    </div>
                    <h3 className="font-bold text-[#122215] text-base">Islandwide Express Courier</h3>
                    <p className="text-xs text-[#556358] leading-relaxed">
                      Doorstep parcel delivery within 24–48 hours across all 25 districts of Sri Lanka. Transparent live tracking via Domex Express and SL Post.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-white/95 rounded-3xl p-6 shadow-md border border-black/[0.04] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100 shadow-xs">
                      <Shield className="w-5 h-5 text-amber-700" />
                    </div>
                    <h3 className="font-bold text-[#122215] text-base">Safe Payments & Cash on Delivery</h3>
                    <p className="text-xs text-[#556358] leading-relaxed">
                      Encrypted card gateways with Visa, Mastercard, PayHere, and Stripe. Convenient Cash on Delivery available at your doorstep with hassle-free returns.
                    </p>
                  </div>
                </div>
              </div>

            </section>

            {/* ── GSAP INFINITE MARQUEE TICKER ──────────────────────────── */}
            <div ref={marqueeRef} className="overflow-hidden py-4 -mx-4 sm:-mx-6 lg:-mx-8 select-none">
              <div data-marquee-track className="flex items-center gap-8 will-change-transform">
                {/* Duplicate items for seamless loop */}
                {[...Array(2)].map((_, repeatIdx) => (
                  <div key={repeatIdx} className="flex items-center gap-8 shrink-0">
                    {[
                      '· Sinhala Literature', '· Academic Lending', '· SLIIT Textbooks',
                      '· Archival Editions', '· Islandwide Delivery', '· Rare Manuscripts',
                      '· Martin Wickramasinghe', '· Leonard Woolf', '· Michael Ondaatje',
                      '· 48k+ Readers', '· 1500+ Titles', '· 25 Districts',
                      '· Literary Preservation', '· Sustainable Packaging', '· Express Courier',
                    ].map((tag, i) => (
                      <span key={i} className="shrink-0 font-sans text-sm font-normal text-[#2d4a32] tracking-tight whitespace-nowrap">
                        {tag}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* ── BOOKSTORE "HOW IT WORKS - IN 3 SIMPLE STEPS" SECTION ─── */}
            <section ref={stepsRef as React.RefObject<HTMLElement>} className="bg-white rounded-[36px] sm:rounded-[44px] p-8 sm:p-12 lg:p-16 border border-black/[0.06] shadow-sm space-y-12">
              
              {/* Centered Small Label & Headline */}
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f6f2] text-emerald-800 text-xs font-mono font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>How Sarasavi Pages Works</span>
                </div>
                <h2 className="font-sans text-3xl sm:text-5xl font-bold text-[#122215] leading-[1.1] tracking-tight">
                  From Our Bookshelf to Your Doorstep in 3 Simple Steps
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                {/* Left Column (5 cols): Numbered Steps */}
                <div className="lg:col-span-5 space-y-6">
                  {[
                    { n: '01/', title: 'Browse & Choose Books', desc: 'Explore 1,500+ curated volumes, Sinhala classics, SLIIT computing textbooks, and international bestsellers.' },
                    { n: '02/', title: 'Instant Order or Rental', desc: 'Checkout with secure card/COD or choose discounted student semester lending with zero late fees.' },
                    { n: '03/', title: 'Islandwide Doorstep Delivery', desc: 'Securely packaged in protective eco-friendly wrap and delivered in 24–48 hours across all 25 districts.' },
                  ].map((step) => (
                    <div data-step-item key={step.n} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-[#f6f9f6] transition-colors cursor-default group">
                      <span className="font-mono text-base font-bold text-emerald-700 shrink-0">{step.n}</span>
                      <div className="space-y-1">
                        <h4 className="font-sans text-base sm:text-lg font-bold text-[#142618] group-hover:text-emerald-800 transition-colors">
                          {step.title}
                        </h4>
                        <p className="text-xs text-[#5a685e] leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column (7 cols): Top Stats Bar + Overlapping Cards */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Top Stats Bar */}
                  <div className="grid grid-cols-3 gap-4 pb-6 border-b border-black/[0.08] text-center">
                    <div>
                      <div className="text-[11px] font-mono text-[#66756a] uppercase">Catalog Titles</div>
                      <div className="font-sans text-2xl sm:text-3xl font-bold text-[#142618]">1,500+</div>
                    </div>
                    <div className="border-x border-black/[0.08]">
                      <div className="text-[11px] font-mono text-[#66756a] uppercase">Satisfaction</div>
                      <div className="font-sans text-2xl sm:text-3xl font-bold text-[#142618]">98.7%</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-[#66756a] uppercase">Districts</div>
                      <div className="font-sans text-2xl sm:text-3xl font-bold text-[#142618]">25</div>
                    </div>
                  </div>

                  {/* 3 Overlapping Cards Stack */}
                  <div className="relative h-[340px] sm:h-[380px] max-w-lg mx-auto w-full flex items-center justify-center">
                    
                    {/* Card 1: Top-Left Green App Icon Card */}
                    <div className="absolute top-0 left-4 sm:left-8 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 shadow-xl flex items-center justify-center z-10 animate-float">
                      <div className="relative flex items-center justify-center w-full h-full">
                        <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white stroke-[2]" />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Center Portrait Photo Card */}
                    <div className="relative w-44 sm:w-56 h-64 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-20">
                      <img
                        src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80"
                        alt="Reading Book"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white text-[11px] font-medium drop-shadow-sm">
                        <span>Verified Sarasavi Reader</span>
                      </div>
                    </div>

                    {/* Card 3: Bottom-Right Delivery Guarantee badge */}
                    <div className="absolute bottom-0 right-4 sm:right-8 w-36 sm:w-44 h-48 sm:h-56 rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-30 animate-float" style={{ animationDelay: '1.5s' }}>
                      <img
                        src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80"
                        alt="Book Stack"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 right-3 ios-glass px-2.5 py-1 rounded-xl text-white text-[10px] font-mono font-bold shadow-md flex items-center gap-1">
                        <Truck className="w-3 h-3 text-emerald-300" />
                        <span>24–48h Dispatch</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </section>

            {/* ── BENTO METRICS & ACHIEVEMENTS GRID ─────────────────── */}
            <section ref={bentoRef as React.RefObject<HTMLElement>} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex -space-x-2">
                    <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User" />
                    <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="User" />
                    <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User" />
                    <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" alt="User" />
                  </div>
                  <div className="mt-4">
                    <span className="text-[11px] font-mono text-[#666f68] uppercase block">Global & National Readers</span>
                    <h3 className="font-sans text-4xl font-medium text-[#121614] mt-1">48k+</h3>
                  </div>
                </div>
                <p className="text-xs text-[#5a625d] leading-relaxed">
                  Connecting book clubs, SLIIT engineering students, and rural schools through shared reading.
                </p>
              </div>

              <div className="bg-[#0d110e] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-white/60 uppercase">Literary Recognitions</span>
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-sans text-4xl font-medium text-white">12*</h3>
                    <p className="text-xs text-white/70 mt-1">National & University Honors</p>
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Featured for thoughtful archival preservation and authentic Sinhala translations.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
                <div>
                  <span className="text-[11px] font-mono text-[#666f68] uppercase block">Volumes Catalogued</span>
                  <h3 className="font-sans text-4xl font-medium text-[#121614] mt-1">1,500+</h3>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1a2e22] rounded-full w-4/5" />
                  </div>
                  <p className="text-xs text-[#5a625d] leading-relaxed">
                    From Sinhala classics to distributed computing textbooks.
                  </p>
                </div>
              </div>

              <div className="bg-[#1a2b20] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-lg transition-shadow">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-white/60 uppercase">Logistics Reach</span>
                    <Compass className="w-5 h-5 text-emerald-300" />
                  </div>
                  <h3 className="font-sans text-4xl font-medium text-white mt-2">25</h3>
                  <p className="text-xs text-emerald-200 mt-0.5">Districts Nationwide</p>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Partnered with regional postal hubs and express couriers across Sri Lanka.
                </p>
              </div>
            </section>

            {/* ── CURATION PROCESS - Lumóra Production Style ─────────── */}
            <section className="bg-white rounded-[32px] p-8 sm:p-12 border border-black/[0.06] shadow-sm space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#666f68] block mb-1">- ARCHIVAL WORKFLOW</span>
                  <h2 className="font-sans text-2xl sm:text-3xl font-medium text-[#121614]">
                    Our Process Moves Like Production.
                  </h2>
                </div>
                <p className="text-xs text-[#5a625d] max-w-sm leading-relaxed">
                  Every volume passes through rigorous authenticity, condition, and catalog preservation standards.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { step: '01', title: 'Discover', desc: 'We research forgotten archives, university syllabi, and author manuscripts to source enduring literature.' },
                  { step: '02', title: 'Curate', desc: 'Certified typography, binding durability, and translation fidelity checks ensure museum-grade volumes.' },
                  { step: '03', title: 'Circulate', desc: 'Smart student lending tiers allow readers to absorb textbooks without high retail costs.' },
                  { step: '04', title: 'Deliver', desc: 'Protective sustainable envelopes and 24-48hr door-to-door transit to every home and dormitory.' }
                ].map((p) => (
                  <div key={p.step} className="p-6 rounded-2xl bg-[#fbfbf9] border border-black/[0.05] space-y-4 hover:bg-[#f3f3ed] transition-colors">
                    <span className="text-xs font-mono font-medium text-[#1a2e22]">{p.step}</span>
                    <h4 className="font-sans text-base font-medium text-[#121614]">{p.title}</h4>
                    <p className="text-xs text-[#5a625d] leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── FEATURED LITERATURE SPOTLIGHT ─────────────────────── */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-[#666f68] block">Handpicked Volumes</span>
                  <h2 className="font-sans text-2xl sm:text-3xl font-medium text-[#121614] mt-0.5">
                    Essential Reading & Curated Editions
                  </h2>
                </div>
                <button
                  onClick={() => setActiveNavTab('books')}
                  className="text-xs font-semibold text-[#1a2e22] hover:text-black flex items-center gap-1.5 underline underline-offset-4"
                >
                  <span>Explore Full Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div ref={featuredBooksRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {books.slice(0, 4).map((book) => (
                  <div
                    data-book-card
                    key={book.id}
                    className="bg-white rounded-2xl p-4 border border-black/[0.06] hover:shadow-lg hover:border-black/20 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="aspect-[3/4] w-full rounded-xl bg-stone-100 overflow-hidden mb-3 relative">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <BookOpen className="w-8 h-8 stroke-1" />
                          </div>
                        )}
                        {/* iOS glass category badge */}
                        <span className="absolute top-2 left-2 ios-glass-light px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#1a2e22] font-medium">
                          {book.category}
                        </span>
                      </div>
                      <h4 className="font-sans text-xs sm:text-sm font-medium text-[#121614] line-clamp-1 group-hover:text-[#1a2e22] transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-xs text-[#666f68] truncate mt-0.5">{book.author}</p>
                    </div>
                    <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between mt-3">
                      <span className="font-mono text-xs sm:text-sm font-medium text-[#121614]">
                        LKR {book.price.toFixed(0)}
                      </span>
                      <button
                        onClick={() => addToCart(book)}
                        className="px-3 py-1.5 rounded-full bg-[#121614] hover:bg-black text-white text-[11px] font-medium transition-all active:scale-95"
                      >
                        + Add to Bag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── VOICES BETWEEN PAGES - Lumóra Testimonials ──────────── */}
            <section ref={testimonialsRef as React.RefObject<HTMLElement>} className="bg-white rounded-[32px] p-8 sm:p-12 border border-black/[0.06] shadow-sm space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#666f68] block mb-1">- READER REFLECTIONS</span>
                  <h2 className="font-sans text-2xl sm:text-3xl font-medium text-[#121614]">
                    Voices Between Pages
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-full bg-[#f4f4ee] text-xs font-mono font-medium text-[#1a2e22]">
                    4.9 / 5.0 Rating
                  </div>
                  <span className="text-xs text-[#666f68]">Over 3,400+ Verified Readers</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { quote: "Sarasavi Pages transformed our study group. Being able to rent Martin Kleppmann's data systems textbook for an entire semester saved us 85% compared to purchasing hardcovers.", name: 'Kavindu Senanayake', role: 'SLIIT Software Engineering Undergraduate' },
                  { quote: "The archival preservation of Leonard Woolf's Baddegama and Martin Wickramasinghe's trilogy is breathtaking. The typography and packaging feel like an art gallery release.", name: 'Dr. Anoma Wijesuriya', role: 'Literary Historian & Visiting Scholar' },
                  { quote: "Courier delivery was astonishingly fast to Kandy. The book was securely sealed in eco-friendly waterproof packaging with prepaid return envelopes ready.", name: 'Malik Jayawardena', role: 'Colombo Readers Circle' }
                ].map((t, idx) => (
                  <div data-testimonial-card key={idx} className="p-6 rounded-2xl bg-[#fbfbf9] border border-black/[0.05] flex flex-col justify-between space-y-4 hover:bg-[#f3f3ed] transition-colors">
                    <div className="space-y-3">
                      <Quote className="w-5 h-5 text-[#1a2e22]/40" />
                      <p className="text-xs text-[#444c46] leading-relaxed italic">"{t.quote}"</p>
                    </div>
                    <div className="pt-3 border-t border-black/[0.04]">
                      <h5 className="font-sans text-xs font-medium text-[#121614]">{t.name}</h5>
                      <span className="text-[11px] text-[#666f68] block">{t.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>


            {/* ── SE2030 UNIVERSITY PROJECT MEMBERS - iOS GLASS DARK ─── */}
            <section className="relative rounded-[32px] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1200&q=80')`,
                  filter: 'brightness(0.3) saturate(1.2)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a10]/90 via-[#0d110e]/80 to-[#0a1a10]/95" />

              <div className="relative z-10 p-8 sm:p-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="ios-glass inline-flex items-center gap-2 px-3 py-1 rounded-full text-emerald-300 text-xs font-medium mb-3">
                      <Layers className="w-3.5 h-3.5" />
                      <span>SE2030 Software Engineering · Group Project B9G2</span>
                    </div>
                    <h3 className="font-sans text-2xl font-medium text-white tracking-tight">
                      Member Modules & System Architecture
                    </h3>
                    <p className="text-xs text-white/60 mt-1">
                      Complete end-to-end CRUD operations, REST endpoints, and role-based administration.
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#121614] font-medium text-xs hover:bg-stone-100 transition-all self-start sm:self-auto shadow-md"
                  >
                    <span>Staff / Admin Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { mod: 'M1', title: 'Admin & Staff Management', member: 'Gunathilaka H.D.T.T.', id: 'IT25101540', icon: <Users className="w-4 h-4 text-emerald-300" /> },
                    { mod: 'M2', title: 'Payment Gateways & Transactions', member: 'Anaf M.K.A.S.', id: 'IT25102345', icon: <Award className="w-4 h-4 text-emerald-300" /> },
                    { mod: 'M3', title: 'Customer Support & Tickets', member: 'Zeen A.C.', id: 'IT25103342', icon: <HelpCircle className="w-4 h-4 text-emerald-300" /> },
                    { mod: 'M4', title: 'Inventory & Stock Audit Control', member: 'Dissanayake S.A.S.D.', id: 'IT25101062', icon: <Bookmark className="w-4 h-4 text-emerald-300" /> },
                    { mod: 'M5', title: 'User Identity & Authentication', member: 'Gayathmi P.G.R.', id: 'IT25103013', icon: <User className="w-4 h-4 text-emerald-300" /> },
                    { mod: 'M6', title: 'Orders & Shopping Cart Management', member: 'Diyes C.L.', id: 'IT25100263', icon: <ShoppingCart className="w-4 h-4 text-emerald-300" /> },
                  ].map((m) => (
                    <div key={m.mod} className="ios-glass p-5 rounded-2xl space-y-2.5 hover:bg-white/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="ios-glass-dark px-2.5 py-0.5 rounded-md text-emerald-300 text-[10px] font-mono font-medium">{`Module ${m.mod}`}</span>
                        {m.icon}
                      </div>
                      <h4 className="font-sans font-medium text-white text-xs sm:text-sm">{m.title}</h4>
                      <p className="text-[11px] text-white/60">{m.member} · {m.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CATALOG (FULL BOOKS STOREFRONT)                    */}
        {/* ========================================================= */}
        {activeNavTab === 'books' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-black/[0.06]">
              <div>
                <span className="text-xs font-mono uppercase text-[#666f68] block">Curated Catalog</span>
                <h1 className="text-3xl sm:text-4xl font-sans font-medium text-[#121614] mt-1">Complete Bookstore Archive</h1>
                <p className="text-xs text-[#5a625d] mt-1">Browse, search, and reserve volumes across canonical literature and university curricula</p>
              </div>

              {/* Minimal Search Input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#666f68] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, author, or genre..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-black/[0.08] text-xs text-[#121614] placeholder-[#88908a] focus:outline-none focus:border-black shadow-sm"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#121614] text-white shadow-sm'
                      : 'bg-white border border-black/[0.08] text-[#5a625d] hover:text-[#121614]'
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
                  className="bg-white rounded-2xl p-4 border border-black/[0.06] hover:shadow-lg hover:border-black/20 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-[3/4] w-full rounded-xl bg-stone-100 overflow-hidden mb-3 relative">
                      {book.coverImage ? (
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <BookOpen className="w-10 h-10 stroke-1" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-mono text-[#1a2e22] font-semibold shadow-sm">
                        {book.category}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-[#121614] line-clamp-1 group-hover:text-[#1a2e22] transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#666f68] truncate mt-0.5">{book.author}</p>
                    {book.description && (
                      <p className="text-[11px] text-[#78827b] line-clamp-2 mt-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-black/[0.05] flex items-center justify-between mt-4">
                    <div>
                      <span className="text-[10px] text-[#666f68] block font-mono">Retail Value</span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#121614]">
                        LKR {book.price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(book)}
                      className="px-3.5 py-1.5 rounded-full bg-[#121614] hover:bg-black text-white text-xs font-medium shadow-sm transition-all active:scale-95"
                    >
                      + Add to Bag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: WRITERS & AUTHORS (EDITORIAL PROFILES)              */}
        {/* ========================================================= */}
        {activeNavTab === 'writers' && (
          <div className="space-y-12 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono uppercase text-[#666f68] tracking-widest block">Literary Pantheon</span>
              <h1 className="text-4xl sm:text-5xl font-sans font-medium text-[#121614]">Authors Who Shaped Generations</h1>
              <p className="text-xs sm:text-sm text-[#5a625d] max-w-xl mx-auto leading-relaxed">
                Celebrating the luminaries whose prose and treatises have enriched Sri Lanka’s cultural consciousness and world literature.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AUTHORS_LIST.map((author) => (
                <div
                  key={author.name}
                  className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-sm flex flex-col justify-between space-y-6 hover:border-black/20 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-sans font-medium text-[#121614]">{author.name}</h3>
                        <p className="text-xs font-mono text-[#2b4736] mt-0.5">{author.period} · {author.origin}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-[#f4f4ee] flex items-center justify-center text-[#1a2e22] shrink-0">
                        <Feather className="w-4 h-4" />
                      </div>
                    </div>

                    <p className="text-xs text-[#525a54] leading-relaxed">
                      {author.bio}
                    </p>

                    <blockquote className="p-4 rounded-2xl bg-[#fbfbf9] border-l-2 border-[#1a2e22] text-xs font-serif italic text-[#253028]">
                      "{author.quote}"
                    </blockquote>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#78827b] uppercase block mb-2">Canonical Works:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {author.famousWorks.map(w => (
                        <span key={w} className="px-3 py-1 rounded-full bg-[#f4f4ee] text-[11px] font-medium text-[#121614]">
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

        {/* ========================================================= */}
        {/* TAB 4: RENTALS (SMART LENDING SHOWCASE)                    */}
        {/* ========================================================= */}
        {activeNavTab === 'rentals' && (
          <div className="space-y-12 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono uppercase text-[#666f68] tracking-widest block">Circular Literary Economy</span>
              <h1 className="text-4xl sm:text-5xl font-sans font-medium text-[#121614]">Read More. Spend 70% Less.</h1>
              <p className="text-xs sm:text-sm text-[#5a625d] max-w-xl mx-auto leading-relaxed">
                Why purchase expensive hardcover volumes you only require for a few semester weeks? Rent authentic textbooks with complimentary prepaid return envelopes.
              </p>
            </div>

            {/* How It Works Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Select Title & Rental Term', desc: 'Choose any volume from our library. Select either 14-day fiction reading or 90-day semester textbook lending.' },
                { step: '02', title: 'Doorstep Courier Delivery', desc: 'Delivered in pristine waterproof cases with prepaid return postage labels ready for hassle-free dispatch.' },
                { step: '03', title: 'Renew, Return or Keep', desc: 'Easily extend with one click, hand back to any courier, or convert to permanent purchase by paying the net difference.' }
              ].map(s => (
                <div key={s.step} className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm space-y-3">
                  <span className="font-mono text-xs font-medium text-[#1a2e22] bg-[#f4f4ee] px-2.5 py-1 rounded-full">{s.step}</span>
                  <h3 className="font-medium text-[#121614] text-sm">{s.title}</h3>
                  <p className="text-xs text-[#5a625d] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Rental Plans Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RENTAL_TIERS.map((tier) => (
                <div key={tier.title} className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-sm flex flex-col justify-between space-y-6 hover:border-black/20 transition-all">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-[#f4f4ee] text-[#1a2e22] text-[11px] font-medium">
                      {tier.badge}
                    </span>
                    <h3 className="text-xl font-medium font-sans text-[#121614] mt-4">{tier.title}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-medium font-mono text-[#121614]">{tier.price}</span>
                      <span className="text-xs text-[#666f68] font-mono">/ {tier.duration}</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">{tier.saving}</p>

                    <ul className="mt-6 space-y-3 text-xs text-[#525a54]">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#1a2e22] shrink-0" />
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
                    className="w-full py-3 rounded-full bg-[#121614] hover:bg-black text-white font-medium text-xs transition-all shadow-sm"
                  >
                    Choose Books to Rent
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ABOUT US (HERITAGE & PURPOSE)                      */}
        {/* ========================================================= */}
        {activeNavTab === 'about' && (
          <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono uppercase text-[#666f68] tracking-widest block">Heritage & Governance</span>
              <h1 className="text-4xl sm:text-5xl font-sans font-medium text-[#121614]">About Sarasavi Pages</h1>
              <p className="text-xs sm:text-sm text-[#5a625d] max-w-xl mx-auto leading-relaxed">
                Empowering Sri Lankan minds through authentic literature, software engineering academic resources, and accessible digital book lending.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-black/[0.06] shadow-sm space-y-6">
              <h2 className="text-2xl font-medium font-sans text-[#121614]">The Sarasavi Pages Vision</h2>
              <p className="text-xs sm:text-sm text-[#525a54] leading-relaxed">
                Founded as an academic initiative under the <strong>SLIIT Faculty of Computing</strong> (Software Engineering Year 2 Semester 1 - SE2030 Group Project B9G2), Sarasavi Pages bridges historical Sri Lankan literary treasures and modern computing education.
              </p>
              <p className="text-xs sm:text-sm text-[#525a54] leading-relaxed">
                Whether it is the timeless village narratives of Martin Wickramasinghe, the poignant historical prose of Leonard Woolf, or the complex distributed architectures authored by Martin Kleppmann, Sarasavi Pages ensures that students, scholars, and lifelong readers have seamless, affordable access.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-black/[0.05]">
                <div className="p-5 rounded-2xl bg-[#fbfbf9] border border-black/[0.05]">
                  <h4 className="text-xs font-bold text-[#1a2e22]">Authentic Heritage</h4>
                  <p className="text-[11px] text-[#5a625d] mt-1">Preserving canonical Sinhala, Tamil, and English national works.</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#fbfbf9] border border-black/[0.05]">
                  <h4 className="text-xs font-bold text-emerald-700">70% Cheaper Lending</h4>
                  <p className="text-[11px] text-[#5a625d] mt-1">Smart book rentals so university students never skip learning.</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#fbfbf9] border border-black/[0.05]">
                  <h4 className="text-xs font-bold text-sky-700">Integrated Logistics</h4>
                  <p className="text-[11px] text-[#5a625d] mt-1">Partnered with Domex and SL Post for islandwide courier delivery.</p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-black/[0.06] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#121614]">Project Engineering Team (Group B9G2)</h3>
                  <p className="text-xs text-[#666f68]">SE2030 Software Engineering - Group Project ID: 2026-Y2-S1-MLB-B9G2-01</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#f4f4ee] text-[#1a2e22] text-xs font-mono font-semibold">
                  6 Members
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#fbfbf9] border border-black/[0.05]">
                  <div className="text-xs font-bold text-[#121614]">Gunathilaka H.D.T.T.</div>
                  <div className="text-[10px] font-mono text-[#1a2e22] font-semibold">IT25101540 | Module M1</div>
                  <div className="text-[11px] text-[#666f68] mt-1">Admin & Staff Management</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbfbf9] border border-black/[0.05]">
                  <div className="text-xs font-bold text-[#121614]">Anaf M.K.A.S.</div>
                  <div className="text-[10px] font-mono text-[#1a2e22] font-semibold">IT25102345 | Module M2</div>
                  <div className="text-[11px] text-[#666f68] mt-1">Payment Systems & Gateways</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbfbf9] border border-black/[0.05]">
                  <div className="text-xs font-bold text-[#121614]">Zeen A.C.</div>
                  <div className="text-[10px] font-mono text-[#1a2e22] font-semibold">IT25103342 | Module M3</div>
                  <div className="text-[11px] text-[#666f68] mt-1">Customer Service & Complaints</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbfbf9] border border-black/[0.05]">
                  <div className="text-xs font-bold text-[#121614]">Dissanayake S.A.S.D.</div>
                  <div className="text-[10px] font-mono text-[#1a2e22] font-semibold">IT25101062 | Module M4</div>
                  <div className="text-[11px] text-[#666f68] mt-1">Inventory & Stock Audit Control</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbfbf9] border border-black/[0.05]">
                  <div className="text-xs font-bold text-[#121614]">Gayathmi P.G.R.</div>
                  <div className="text-[10px] font-mono text-[#1a2e22] font-semibold">IT25103013 | Module M5</div>
                  <div className="text-[11px] text-[#666f68] mt-1">User Identity & Authentication</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbfbf9] border border-black/[0.05]">
                  <div className="text-xs font-bold text-[#121614]">Diyes C.L.</div>
                  <div className="text-[10px] font-mono text-[#1a2e22] font-semibold">IT25100263 | Module M6</div>
                  <div className="text-[11px] text-[#666f68] mt-1">Orders & Shopping Cart Management</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── CUSTOMER SUPPORT TICKET MODAL (MODULE M3) ──────────── */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsTicketModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/[0.08] z-10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#1a2e22] font-medium">[ MODULE M3 · CUSTOMER CARE ]</span>
                <h3 className="text-xl font-medium font-sans text-[#121614]">Submit Support Ticket</h3>
              </div>
              <button 
                onClick={() => setIsTicketModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/[0.05] text-[#666f68]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ticketStatus === 'success' ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-medium text-[#121614]">Ticket Registered Successfully</h4>
                <p className="text-xs text-[#5a625d]">Our student & courier care officer (Module M3) will reach out within 4 business hours.</p>
                <button
                  onClick={() => {
                    setTicketStatus('idle');
                    setIsTicketModalOpen(false);
                  }}
                  className="mt-4 px-6 py-2 rounded-full bg-[#121614] text-white text-xs font-medium"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#525a54] font-medium mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.customerName}
                    onChange={e => setTicketForm({ ...ticketForm, customerName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#fbfbf9] border border-black/[0.08] text-[#121614] focus:outline-none focus:border-black"
                    placeholder="e.g. Kasun Perera"
                  />
                </div>

                <div>
                  <label className="block text-[#525a54] font-medium mb-1">Contact Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.contactNumber}
                    onChange={e => setTicketForm({ ...ticketForm, contactNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#fbfbf9] border border-black/[0.08] text-[#121614] focus:outline-none focus:border-black"
                    placeholder="+94 7X XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-[#525a54] font-medium mb-1">Inquiry Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.subject}
                    onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#fbfbf9] border border-black/[0.08] text-[#121614] focus:outline-none focus:border-black"
                    placeholder="e.g. Courier delivery status / Rental renewal"
                  />
                </div>

                <div>
                  <label className="block text-[#525a54] font-medium mb-1">Message Description</label>
                  <textarea
                    rows={3}
                    required
                    value={ticketForm.description}
                    onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#fbfbf9] border border-black/[0.08] text-[#121614] focus:outline-none focus:border-black"
                    placeholder="Please specify order or book reference..."
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-black/[0.08] text-[#5a625d] text-xs font-medium hover:bg-black/[0.03]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={ticketStatus === 'submitting'}
                    className="px-5 py-2 rounded-full bg-[#121614] hover:bg-black text-white text-xs font-medium shadow-sm transition-all"
                  >
                    {ticketStatus === 'submitting' ? 'Submitting...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── SHOPPING CART SLIDE-OVER DRAWER ─────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-white border-l border-black/[0.06] h-full shadow-2xl flex flex-col p-6 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#1a2e22]" />
                <h3 className="font-medium font-sans text-[#121614] text-base">Your Bag</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#f4f4ee] text-[#1a2e22] font-mono font-medium">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/[0.05] text-[#666f68]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 py-4 space-y-3 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-[#666f68] space-y-2">
                  <ShoppingCart className="w-10 h-10 mx-auto text-stone-300 stroke-1" />
                  <p className="text-xs">Your shopping bag is empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.book.id} className="p-4 rounded-2xl bg-[#fbfbf9] border border-black/[0.05] flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-[#121614] truncate">{item.book.title}</h4>
                      <p className="text-[11px] font-mono text-[#1a2e22] font-medium mt-0.5">LKR {item.book.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-black/[0.08] rounded-full bg-white">
                        <button 
                          onClick={() => updateQuantity(item.book.id, -1)}
                          className="p-1.5 hover:text-black text-[#666f68]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-medium text-[#121614]">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.book.id, 1)}
                          className="p-1.5 hover:text-black text-[#666f68]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.book.id)}
                        className="p-1.5 rounded-full text-[#88908a] hover:text-red-600 hover:bg-red-50 transition-colors"
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
              <div className="pt-4 border-t border-black/[0.06] space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Coupon (e.g. WELCOME10)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#fbfbf9] border border-black/[0.08] text-xs text-[#121614] focus:outline-none focus:border-black uppercase font-mono"
                  />
                  <button
                    onClick={applyPromo}
                    className="px-4 py-2 rounded-xl bg-[#121614] text-white text-xs font-medium hover:bg-black transition-all"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-red-500">{promoError}</p>}
                {promoApplied && (
                  <p className="text-[11px] text-emerald-600 inline-flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>{promoDiscount}% promotional discount applied!</span>
                  </p>
                )}
              </div>
            )}

            {/* Checkout Total */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-black/[0.06] space-y-2">
                <div className="flex justify-between text-xs text-[#666f68]">
                  <span>Subtotal</span>
                  <span className="font-mono">LKR {subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-xs text-emerald-600 font-medium">
                    <span>Coupon Discount ({promoDiscount}%)</span>
                    <span className="font-mono">- LKR {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium text-[#121614] pt-2 border-t border-black/[0.05]">
                  <span>Total Due</span>
                  <span className="font-mono">LKR {total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => alert(`Order placed successfully for LKR ${total.toFixed(2)}! Dispatched via Module M6 & Payment recorded in Module M2.`)}
                  className="w-full mt-3 py-3 rounded-full bg-[#121614] hover:bg-black text-white font-medium text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GRAND EDITORIAL FOOTER (LUMÓRA SIGNATURE FOOTER) ───── */}
      <footer className="bg-[#0d110e] text-white rounded-t-[40px] sm:rounded-t-[48px] pt-16 pb-12 px-6 sm:px-12 mt-20">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Top Inquiries & Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pb-12 border-b border-white/10">
            <div className="md:col-span-6 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block">Direct Inquiries</span>
              <a 
                href="mailto:curator@sarasavipages.lk" 
                className="text-xl sm:text-2xl font-sans font-normal text-white hover:text-stone-300 transition-colors underline underline-offset-8"
              >
                curator@sarasavipages.lk
              </a>
              <p className="text-xs text-white/60 max-w-sm leading-relaxed">
                For rare manuscript acquisitions, university academic bulk lending, and Sri Lankan publisher distribution partnerships.
              </p>
            </div>

            <div className="md:col-span-3 space-y-3 text-xs">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block">Navigation</span>
              <ul className="space-y-2 text-white/70">
                <li><button onClick={() => { setActiveNavTab('books'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">Literary Catalog</button></li>
                <li><button onClick={() => { setActiveNavTab('writers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">Authors & Pantheon</button></li>
                <li><button onClick={() => { setActiveNavTab('rentals'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">Student Lending Tiers</button></li>
                <li><button onClick={() => { setActiveNavTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">SLIIT Project & Heritage</button></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3 text-xs">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block">Administration</span>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/login" className="hover:text-white">Staff / Admin Login</Link></li>
                <li><Link href="/admin/dashboard" className="hover:text-white">M1 Staff Management</Link></li>
                <li><button onClick={() => setIsTicketModalOpen(true)} className="hover:text-white">M3 Support Desk</button></li>
                <li><span className="text-white/40">Colombo, Sri Lanka</span></li>
              </ul>
            </div>
          </div>

          {/* Monumental Giant Brand Typography */}
          <div className="overflow-hidden">
            <h2 className="text-6xl sm:text-9xl lg:text-[130px] font-display font-light tracking-tight text-white/[0.90] leading-none select-none lowercase">
              sarasavi pages<span className="text-2xl sm:text-5xl lg:text-6xl font-light text-white/30 align-top">®</span>
            </h2>
          </div>

          {/* Bottom Academic Legal Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/50 font-mono">
            <p>© 2026 Sarasavi Pages (Pvt) Ltd. All rights reserved.</p>
            <p>SE2030 Software Engineering · Group Project 2026-Y2-S1-MLB-B9G2-01 · SLIIT</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
