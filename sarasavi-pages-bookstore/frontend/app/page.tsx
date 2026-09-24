'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { addMagneticEffect } from '@/hooks/useGsapAnimations';
import Link from 'next/link';
import Cookies from 'js-cookie';
import Navbar from '@/components/Navbar';
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
  Menu,
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
  Twitter,
  Edit3,
  Eye,
  EyeOff,
  AlertCircle,
  Save
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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

  // Synchronize cart with localStorage
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
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sp_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('sp_cart_updated'));
    } catch {}
  }, [cart]);

  // ── CHECKOUT FLOW STATE ──────────────────────────────────────────────────
  type CheckoutStep = 'shipping' | 'payment' | 'success';
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('shipping');
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: 'Colombo',
    postalCode: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    method: 'CREDIT_CARD' as 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY',
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [orderInvoice, setOrderInvoice] = useState<{
    invoiceNo: string;
    orderId: string;
    items: { title: string; qty: number; price: number }[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: string;
    date: string;
    customer: string;
    email: string;
  } | null>(null);

  // ── MEMBERSHIP PURCHASE STATE ────────────────────────────────────────────
  const MEMBERSHIP_PLANS = [
    { id: 'BASIC', label: 'Reader Basic', price: 990, duration: '3 months', benefits: ['10% discount on all books', 'Free shipping on orders over LKR 2000', 'Priority customer support', 'Early access to new arrivals'] },
    { id: 'PREMIUM', label: 'Scholar Premium', price: 2490, duration: '12 months', benefits: ['20% discount on all books', 'Free shipping on all orders', 'Priority customer support', 'Early access + exclusive editions', 'Academic lending tier upgrades', '2 free rentals per month'] },
  ];
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [membershipStep, setMembershipStep] = useState<'select' | 'payment' | 'success'>('select');
  const [selectedMembershipPlan, setSelectedMembershipPlan] = useState(MEMBERSHIP_PLANS[0]);
  const [membershipPaymentForm, setMembershipPaymentForm] = useState({
    method: 'CREDIT_CARD' as 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER',
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });
  const [membershipProcessing, setMembershipProcessing] = useState(false);
  const [membershipInvoice, setMembershipInvoice] = useState<{
    invoiceNo: string;
    plan: string;
    price: number;
    duration: string;
    date: string;
    customer: string;
  } | null>(null);
  const [userMembership, setUserMembership] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sp_membership') || null;
    }
    return null;
  });

  // Logged-in user states & Auth
  const { user: authStaff } = useAuth();
  const [loggedInCustomer, setLoggedInCustomer] = useState<any>(null);
  const [loggedInStaff, setLoggedInStaff] = useState<any>(null);
  const activeStaff = authStaff || loggedInStaff;

  // Strict role check: Only admin with catalog permissions ("Only admin - adala adminta adala parts")
  // Module 1 (SUPER_ADMIN), Module 4 (INVENTORY_ADMIN), and Module 6 (ORDER_ADMIN)
  const canManageBooks = Boolean(
    activeStaff && (
      activeStaff.role === 'SUPER_ADMIN' ||
      activeStaff.role === 'INVENTORY_ADMIN' ||
      activeStaff.role === 'ORDER_ADMIN'
    )
  );

  // Admin Book Management Modals
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteConfirmBook, setDeleteConfirmBook] = useState<Book | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Form state for creating a new book
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    author: '',
    category: 'Classic Fiction',
    price: 1500,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    stockQuantity: 25,
    isbn: '978-955-0201-99-9',
    description: '',
    rating: 4.8
  });

  // Admin Action Toast
  const [adminNotification, setAdminNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setAdminNotification({ message, type });
    setTimeout(() => setAdminNotification(null), 4000);
  };

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
        let storedBooks: Book[] = [];
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('sp_catalog_books');
          if (raw) {
            try { storedBooks = JSON.parse(raw); } catch (e) {}
          }
        }
        const hiddenIds: string[] = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('sp_hidden_books') || '[]')
          : [];

        const initialList = storedBooks.length > 0 ? storedBooks : data;
        const merged = initialList.map(b => ({
          ...b,
          hidden: hiddenIds.includes(b.id) || Boolean(b.hidden)
        }));
        setBooks(merged);
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

  // Admin Book Management Handlers
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookForm.title.trim() || !newBookForm.author.trim()) return;

    const newBook: Book = {
      id: `BK-${Date.now().toString().slice(-5)}`,
      title: newBookForm.title.trim(),
      author: newBookForm.author.trim(),
      category: newBookForm.category.trim() || 'General',
      price: Number(newBookForm.price) || 0,
      coverImage: newBookForm.coverImage.trim() || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      stockQuantity: Number(newBookForm.stockQuantity) || 1,
      isbn: newBookForm.isbn.trim() || `978-955-0201-${Math.floor(10 + Math.random() * 89)}-${Math.floor(1 + Math.random() * 9)}`,
      description: newBookForm.description.trim() || 'A curated title in the Sarasavi Pages bookstore archive.',
      rating: Number(newBookForm.rating) || 4.8,
      hidden: false
    };

    const updated = [newBook, ...books];
    setBooks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_catalog_books', JSON.stringify(updated));
    }

    try {
      await apiClient.post('/books', newBook);
    } catch (err: any) {
      console.warn('Backend books sync fallback:', err.message);
    }

    setIsAddBookModalOpen(false);
    setNewBookForm({
      title: '',
      author: '',
      category: 'Classic Fiction',
      price: 1500,
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      stockQuantity: 25,
      isbn: '978-955-0201-99-9',
      description: '',
      rating: 4.8
    });
    showNotification(`Book "${newBook.title}" successfully added to the catalog!`);
  };

  const handleOpenEditBook = (book: Book) => {
    setEditingBook({ ...book });
    setIsEditBookModalOpen(true);
  };

  const handleSaveEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    const updated = books.map(b => b.id === editingBook.id ? editingBook : b);
    setBooks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_catalog_books', JSON.stringify(updated));
    }

    try {
      await apiClient.put(`/books/${editingBook.id}`, editingBook);
    } catch (err: any) {
      console.warn('Backend books update fallback:', err.message);
    }

    setIsEditBookModalOpen(false);
    showNotification(`Book details for "${editingBook.title}" updated successfully!`);
    setEditingBook(null);
  };

  const handleToggleHideBook = (book: Book) => {
    const isNowHidden = !book.hidden;
    const updated = books.map(b => b.id === book.id ? { ...b, hidden: isNowHidden } : b);
    setBooks(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_catalog_books', JSON.stringify(updated));
      const hiddenIds = updated.filter(b => b.hidden).map(b => b.id);
      localStorage.setItem('sp_hidden_books', JSON.stringify(hiddenIds));
    }

    showNotification(
      isNowHidden
        ? `"${book.title}" is now hidden from regular customers.`
        : `"${book.title}" is now visible to all customers on the storefront.`,
      isNowHidden ? 'info' : 'success'
    );
  };

  const handleDeleteBook = (book: Book) => {
    setDeleteConfirmBook(book);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmBook) return;
    const bookId = deleteConfirmBook.id;
    const bookTitle = deleteConfirmBook.title;

    const updated = books.filter(b => b.id !== bookId);
    setBooks(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_catalog_books', JSON.stringify(updated));
      const hiddenIds: string[] = JSON.parse(localStorage.getItem('sp_hidden_books') || '[]');
      localStorage.setItem('sp_hidden_books', JSON.stringify(hiddenIds.filter(id => id !== bookId)));
    }

    try {
      await apiClient.delete(`/books/${bookId}`);
    } catch (err: any) {
      console.warn('Backend books delete fallback:', err.message);
    }

    setDeleteConfirmBook(null);
    showNotification(`Book "${bookTitle}" permanently deleted from catalog.`, 'error');
  };

  // ── GSAP Animations ─────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // ─── 1. Clean Hero Title & Subtitle Fade-up ─────────────────────────
      if (heroTitleRef.current) {
        gsap.fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.1 }
        );
      }

      if (heroSubtitleRef.current) {
        gsap.fromTo(
          heroSubtitleRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.25 }
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
      // If book is hidden and current viewer cannot manage catalog, hide it completely
      if (b.hidden && !canManageBooks) {
        return false;
      }
      const matchesSearch = 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory, canManageBooks]);

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
  // Tier-based discount: Standard user = 0%, Basic member = 10%, Scholar Premium = 20%
  const memberDiscountRate = userMembership === 'PREMIUM' ? 20 : userMembership === 'BASIC' ? 10 : 0;
  const effectiveDiscountRate = Math.max(promoDiscount, memberDiscountRate);
  const discountAmount = (subtotal * effectiveDiscountRate) / 100;
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

  // ── CHECKOUT HANDLERS ────────────────────────────────────────────────────
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setCheckoutStep('shipping');
    // Pre-fill from logged-in customer
    if (loggedInCustomer) {
      setShippingForm(prev => ({
        ...prev,
        fullName: loggedInCustomer.name || '',
        email: loggedInCustomer.email || ''
      }));
    }
    setIsCheckoutOpen(true);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutProcessing(true);
    // Simulate secure payment gateway processing (1.5 sec)
    await new Promise(res => setTimeout(res, 1500));
    const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const invoice = {
      invoiceNo,
      orderId,
      items: cart.map(i => ({ title: i.book.title, qty: i.quantity, price: i.book.price })),
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod: paymentForm.method.replace(/_/g, ' '),
      date: new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' }),
      customer: shippingForm.fullName,
      email: shippingForm.email,
    };
    setOrderInvoice(invoice);

    // Save order into customer history in localStorage
    const custId = loggedInCustomer?.customerId || 'CUST-GUEST';
    if (typeof window !== 'undefined') {
      const userOrders = JSON.parse(localStorage.getItem(`sp_orders_${custId}`) || '[]');
      const newOrder = {
        id: orderId,
        invoiceNo,
        items: cart.map(i => `${i.book.title} (x${i.quantity})`).join(', '),
        itemDetails: cart.map(i => ({ title: i.book.title, qty: i.quantity, price: i.book.price, coverImage: i.book.coverImage })),
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

    // Try calling backend payment API
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
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoCode('');
  };

  const handleDownloadInvoice = (invoice: typeof orderInvoice) => {
    if (!invoice) return;
    const lines = [
      '================================================================',
      '           SARASAVI PAGES (PVT) LTD - TAX INVOICE',
      '================================================================',
      `Invoice No  : ${invoice.invoiceNo}`,
      `Order ID    : ${invoice.orderId}`,
      `Date        : ${invoice.date}`,
      `Customer    : ${invoice.customer}`,
      `Email       : ${invoice.email}`,
      '----------------------------------------------------------------',
      'ITEMS:',
      ...invoice.items.map(i => `  ${i.title.padEnd(35)} x${i.qty}  LKR ${(i.price * i.qty).toFixed(2)}`),
      '----------------------------------------------------------------',
      `Subtotal    : LKR ${invoice.subtotal.toFixed(2)}`,
      invoice.discount > 0 ? `Discount    : - LKR ${invoice.discount.toFixed(2)}` : '',
      `TOTAL DUE   : LKR ${invoice.total.toFixed(2)}`,
      `Payment     : ${invoice.paymentMethod}`,
      '================================================================',
      'Thank you for shopping with Sarasavi Pages!',
      'Islandwide delivery · Authentic editions · Sarasavi Pages (Pvt) Ltd',
      '================================================================',
    ].filter(Boolean).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── MEMBERSHIP HANDLERS ───────────────────────────────────────────────────
  const handleMembershipPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setMembershipProcessing(true);
    await new Promise(res => setTimeout(res, 1800));
    const invoiceNo = `MEM-${Date.now().toString().slice(-8)}`;
    const inv = {
      invoiceNo,
      plan: selectedMembershipPlan.label,
      price: selectedMembershipPlan.price,
      duration: selectedMembershipPlan.duration,
      date: new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' }),
      customer: loggedInCustomer?.name || shippingForm.fullName || 'Guest',
    };
    setMembershipInvoice(inv);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_membership', selectedMembershipPlan.id);
    }
    setUserMembership(selectedMembershipPlan.id);
    setMembershipProcessing(false);
    setMembershipStep('success');
  };

  const handleDownloadMembershipInvoice = (inv: typeof membershipInvoice) => {
    if (!inv) return;
    const lines = [
      '================================================================',
      '     SARASAVI PAGES (PVT) LTD - MEMBERSHIP INVOICE',
      '================================================================',
      `Invoice No  : ${inv.invoiceNo}`,
      `Date        : ${inv.date}`,
      `Customer    : ${inv.customer}`,
      '----------------------------------------------------------------',
      `Membership Plan : ${inv.plan}`,
      `Duration        : ${inv.duration}`,
      `Amount Paid     : LKR ${inv.price.toFixed(2)}`,
      '================================================================',
      'Welcome to Sarasavi Pages Membership!',
      'Enjoy exclusive discounts, free shipping & more.',
      '================================================================',
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoiceNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
    <div className="min-h-screen bg-[#F8F9F5] text-[#20231B] font-sans antialiased selection:bg-[#34451D] selection:text-white flex flex-col">
      {/* ── CINEVAULT-STYLE ADMIN MODE TOP BAR (Visible only to Admins) ── */}
      {loggedInStaff && (
        <AdminModeBar showOnStorefront={true} />
      )}

      {/* ── HEALIUM AUTHENTIC FLOATING PILL NAVIGATION ───────── */}
      <Navbar 
        activeTab="home" 
        isHomeHero={activeNavTab === 'home'} 
        onOpenBag={() => setIsCartOpen(true)} 
      />

      {/* ── MAIN VIEWPORT / CONTENT ROUTING ────────────────────── */}
      {/* ========================================================= */}
      {/* TAB 1: HOME (LUMÓRA / HEALIUM EDITORIAL SHOWCASE)         */}
      {/* ========================================================= */}
      {activeNavTab === 'home' && (
        <>
          {/* ── HEALIUM AUTHENTIC FULL-BLEED HERO CANVAS ──────────────────────── */}
          <section ref={heroSectionRef} className="relative w-full overflow-hidden bg-[#20231B] text-white flex flex-col pt-24 sm:pt-28 pb-0">
            
            {/* Forest & Morning Sunlight Atmosphere Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('/images/healium-moss-book.jpg')`,
                filter: 'brightness(0.65) saturate(1.2)'
              }}
            />
            {/* Healium Green Atmospheric Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#34451D]/90 via-[#20231B]/60 to-[#20231B]/95" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#B7D85A]/15 via-transparent to-transparent pointer-events-none" />

            {/* ── TOP PILL INFO BADGES (INSIDE HERO) ── */}
            <div className="relative z-20 max-w-7xl mx-auto w-full px-6 sm:px-10 pt-2 flex items-center justify-between">
              <div className="ios-glass inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white text-xs font-light shadow-md border border-white/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B7D85A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B7D85A]" />
                </span>
                <span>islandwide express · all 25 districts</span>
              </div>
              <div className="hidden sm:flex ios-glass items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-xs font-light shadow-md border border-white/20">
                <Bookmark className="w-3.5 h-3.5 text-[#B7D85A]" />
                <span>{books.length > 0 ? `${books.length}+ titles` : '1,500+ curated titles'}</span>
              </div>
            </div>

            {/* ── BOOKSTORE HERO HEADLINE SECTION ── */}
            <div className="relative z-10 px-6 sm:px-10 pt-6 pb-2 text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#34451D]/80 border border-[#7F9148]/50 text-[#B7D85A] text-xs font-normal mb-4 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#B7D85A]" />
                <span>Sri Lanka&apos;s Trusted Online Bookstore</span>
              </div>
              <h1 ref={heroTitleRef} className="font-display font-light text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08] drop-shadow-md">
                Your Stories, Literature & Academic Textbooks
              </h1>
              <p ref={heroSubtitleRef} className="text-[#E2E7D8]/90 text-xs sm:text-sm font-sans font-light leading-relaxed max-w-xl mx-auto mt-4 drop-shadow-sm">
                From celebrated Sinhala literary classics by Martin Wickramasinghe to SLIIT engineering & computing course texts. Delivered safely to your doorstep across all 25 districts.
              </p>
            </div>

              {/* ── CENTER BOOKSTORE SEARCH BAR & CATEGORY CHIPS ── */}
              <div className="relative z-10 max-w-2xl mx-auto w-full px-6 py-6 flex flex-col items-center">
                <div className="bg-[#34451D]/70 p-2 rounded-full flex items-center gap-2 shadow-2xl w-full border border-[#AAB58A]/30 backdrop-blur-2xl">
                  <Search className="w-5 h-5 text-[#B7D85A] ml-4 shrink-0" />
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
                    className="bg-transparent text-white placeholder-[#E2E7D8]/60 font-sans font-light text-xs sm:text-sm focus:outline-none flex-1 min-w-0 px-2"
                  />
                  <button
                    onClick={() => {
                      setActiveNavTab('books');
                      window.scrollTo({ top: 500, behavior: 'smooth' });
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#B7D85A] hover:bg-[#a6c84c] text-[#20231B] font-display font-medium text-xs transition-all shadow-lg shrink-0 flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Popular Genre Quick Filters */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                  <span className="text-[#E2E7D8] text-[11px] font-light">Browse:</span>
                  {['ALL', 'FICTION', 'LITERATURE', 'TECHNOLOGY', 'ACADEMIC'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveNavTab('books');
                        window.scrollTo({ top: 500, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1 rounded-full bg-[#34451D]/80 hover:bg-[#596B32] text-white text-[11px] font-sans font-light backdrop-blur-md border border-[#7F9148]/30 transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── BOOKSTORE CORE VALUE PROPOSITIONS DOCK ── */}
              <div className="relative z-20 w-full bg-[#34451D] border-t border-[#596B32]/40 p-6 sm:p-10 mt-6 shadow-xl">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Feature 1 */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E2E7D8] space-y-3.5 hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <div className="w-11 h-11 rounded-2xl bg-[#F0F4E8] text-[#34451D] flex items-center justify-center border border-[#E2E7D8] shadow-xs">
                      <BookOpen className="w-5 h-5 text-[#34451D]" />
                    </div>
                    <h3 className="font-display font-semibold text-[#20231B] text-base">100% Genuine Print Editions</h3>
                    <p className="font-sans font-light text-xs text-[#636855] leading-relaxed">
                      Sourced directly from premier Sri Lankan publishers and international university presses. Guaranteed crisp, authentic paperbacks and hardcovers.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E2E7D8] space-y-3.5 hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <div className="w-11 h-11 rounded-2xl bg-[#F0F4E8] text-[#34451D] flex items-center justify-center border border-[#E2E7D8] shadow-xs">
                      <Truck className="w-5 h-5 text-[#34451D]" />
                    </div>
                    <h3 className="font-display font-semibold text-[#20231B] text-base">Islandwide Express Courier</h3>
                    <p className="font-sans font-light text-xs text-[#636855] leading-relaxed">
                      Doorstep parcel delivery within 24–48 hours across all 25 districts of Sri Lanka. Transparent live tracking via Domex Express and SL Post.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E2E7D8] space-y-3.5 hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <div className="w-11 h-11 rounded-2xl bg-[#F0F4E8] text-[#34451D] flex items-center justify-center border border-[#E2E7D8] shadow-xs">
                      <Shield className="w-5 h-5 text-[#34451D]" />
                    </div>
                    <h3 className="font-display font-semibold text-[#20231B] text-base">Safe Payments & Cash on Delivery</h3>
                    <p className="font-sans font-light text-xs text-[#636855] leading-relaxed">
                      Encrypted card gateways with Visa, Mastercard, PayHere, and Stripe. Convenient Cash on Delivery available at your doorstep with hassle-free returns.
                    </p>
                  </div>
                </div>
              </div>

            </section>

            {/* ── GSAP INFINITE MARQUEE TICKER ──────────────────────────── */}
            <div ref={marqueeRef} className="w-full overflow-hidden py-3.5 bg-[#F0F4E8] border-y border-[#E2E7D8] select-none">
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
                      <span key={i} className="shrink-0 font-display font-light text-sm text-[#34451D] tracking-tight whitespace-nowrap">
                        {tag}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* ── MAIN CONTENT SECTIONS CONTAINER ────────────────────────── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 w-full flex-1">

            {/* ── BOOKSTORE "HOW IT WORKS - IN 3 SIMPLE STEPS" SECTION ─── */}
            <section ref={stepsRef as React.RefObject<HTMLElement>} className="bg-[#F0F4E8] rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#E2E7D8] shadow-xs space-y-12">
              
              {/* Centered Small Label & Headline */}
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#34451D] text-xs font-mono font-semibold border border-[#E2E7D8] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#596B32]" />
                  <span>How Sarasavi Pages Works</span>
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-light text-[#20231B] leading-[1.1] tracking-tight">
                  From Our Bookshelf to Your Doorstep in 3 Simple Steps
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                {/* Left Column (5 cols): Numbered Steps */}
                <div className="lg:col-span-5 space-y-4">
                  {[
                    { n: '01/', title: 'Browse & Choose Books', desc: 'Explore 1,500+ curated volumes, Sinhala classics, SLIIT computing textbooks, and international bestsellers.' },
                    { n: '02/', title: 'Instant Order or Rental', desc: 'Checkout with secure card/COD or choose discounted student semester lending with zero late fees.' },
                    { n: '03/', title: 'Islandwide Doorstep Delivery', desc: 'Securely packaged in protective eco-friendly wrap and delivered in 24–48 hours across all 25 districts.' },
                  ].map((step) => (
                    <div data-step-item key={step.n} className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#E2E7D8] shadow-xs hover:shadow-md hover:border-[#596B32] hover:-translate-y-0.5 transition-all cursor-default group">
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#34451D] text-[#B7D85A] shrink-0 shadow-xs">{step.n}</span>
                      <div className="space-y-1">
                        <h4 className="font-display text-base sm:text-lg font-medium text-[#20231B] group-hover:text-[#34451D] transition-colors">
                          {step.title}
                        </h4>
                        <p className="font-sans font-light text-xs text-[#636855] leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column (7 cols): Top Stats Bar + Overlapping Cards */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Top Stats Bar */}
                  <div className="grid grid-cols-3 gap-4 pb-6 border-b border-[#E2E7D8] text-center">
                    <div>
                      <div className="text-[11px] font-mono text-[#7B806B] uppercase font-light">Catalog Titles</div>
                      <div className="font-display text-2xl sm:text-3xl font-light text-[#34451D]">1,500+</div>
                    </div>
                    <div className="border-x border-[#E2E7D8]">
                      <div className="text-[11px] font-mono text-[#7B806B] uppercase font-light">Satisfaction</div>
                      <div className="font-display text-2xl sm:text-3xl font-light text-[#34451D]">98.7%</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-[#7B806B] uppercase font-light">Districts</div>
                      <div className="font-display text-2xl sm:text-3xl font-light text-[#34451D]">25</div>
                    </div>
                  </div>

                  {/* 3 Overlapping Cards Stack */}
                  <div className="relative h-[340px] sm:h-[380px] max-w-lg mx-auto w-full flex items-center justify-center">
                    
                    {/* Card 1: Top-Left Green App Icon Card */}
                    <div className="absolute top-0 left-4 sm:left-8 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#596B32] to-[#34451D] p-4 shadow-xl flex items-center justify-center z-10 animate-float">
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
                      <div className="absolute bottom-3 left-3 right-3 text-white text-[11px] font-medium drop-shadow-sm font-sans">
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
                      <div className="absolute bottom-3 right-3 bg-[#34451D]/90 backdrop-blur-md border border-[#E2E7D8]/40 px-2.5 py-1 rounded-xl text-[#B7D85A] text-[10px] font-mono font-medium shadow-md flex items-center gap-1">
                        <Truck className="w-3 h-3 text-[#B7D85A]" />
                        <span>24–48h Dispatch</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </section>

            {/* ── BENTO METRICS & ACHIEVEMENTS GRID ─────────────────── */}
            <section ref={bentoRef as React.RefObject<HTMLElement>} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E7D8] shadow-[0_4px_18px_rgba(52,69,29,0.04)] hover:shadow-xl hover:border-[#596B32] hover:-translate-y-1 transition-all flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex -space-x-2">
                    <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User" />
                    <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="User" />
                    <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User" />
                    <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" alt="User" />
                  </div>
                  <div className="mt-4">
                    <span className="text-[11px] font-mono text-[#7B806B] uppercase block font-light">Global & National Readers</span>
                    <h3 className="font-display text-4xl font-light text-[#34451D] mt-1">48k+</h3>
                  </div>
                </div>
                <p className="font-sans font-light text-xs text-[#636855] leading-relaxed">
                  Connecting book clubs, SLIIT engineering students, and rural schools through shared reading.
                </p>
              </div>

              <div className="bg-[#34451D] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-[#596B32] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#E2E7D8] uppercase font-light">Literary Recognitions</span>
                    <Award className="w-5 h-5 text-[#B7D85A]" />
                  </div>
                  <div>
                    <h3 className="font-display text-4xl font-light text-[#B7D85A]">12*</h3>
                    <p className="font-sans font-light text-xs text-[#E2E7D8] mt-1">National & University Honors</p>
                  </div>
                </div>
                <p className="font-sans font-light text-xs text-[#E2E7D8] leading-relaxed">
                  Featured for thoughtful archival preservation and authentic Sinhala translations.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E7D8] shadow-[0_4px_18px_rgba(52,69,29,0.04)] hover:shadow-xl hover:border-[#596B32] hover:-translate-y-1 transition-all flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[11px] font-mono text-[#7B806B] uppercase block font-light">Volumes Catalogued</span>
                  <h3 className="font-display text-4xl font-light text-[#34451D] mt-1">1,500+</h3>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-[#F0F4E8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#596B32] rounded-full w-4/5" />
                  </div>
                  <p className="font-sans font-light text-xs text-[#636855] leading-relaxed">
                    From Sinhala classics to distributed computing textbooks.
                  </p>
                </div>
              </div>

              <div className="bg-[#20231B] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-[#34451D] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#E2E7D8] uppercase font-light">Logistics Reach</span>
                    <Compass className="w-5 h-5 text-[#B7D85A]" />
                  </div>
                  <h3 className="font-display text-4xl font-light text-[#B7D85A] mt-2">25</h3>
                  <p className="font-sans font-light text-xs text-[#E2E7D8] mt-0.5">Districts Nationwide</p>
                </div>
                <p className="font-sans font-light text-xs text-[#85887A] leading-relaxed">
                  Partnered with regional postal hubs and express couriers across Sri Lanka.
                </p>
              </div>
            </section>

            {/* ── CURATION PROCESS - Lumóra Production Style ─────────── */}
            <section className="bg-[#F0F4E8] rounded-3xl p-8 sm:p-12 border border-[#E2E7D8] shadow-xs space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#596B32] block mb-1 font-semibold">- ARCHIVAL WORKFLOW</span>
                  <h2 className="font-display text-2xl sm:text-3xl font-light text-[#20231B]">
                    Our Process Moves Like Production.
                  </h2>
                </div>
                <p className="font-sans font-light text-xs text-[#636855] max-w-sm leading-relaxed">
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
                  <div key={p.step} className="p-6 rounded-2xl bg-white border border-[#E2E7D8] shadow-[0_4px_18px_rgba(52,69,29,0.04)] space-y-4 hover:shadow-xl hover:border-[#596B32] hover:-translate-y-1 transition-all group">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-[#34451D] text-[#B7D85A] font-mono text-xs font-semibold shadow-xs">{p.step}</span>
                    <h4 className="font-display text-base font-semibold text-[#20231B] group-hover:text-[#34451D] transition-colors">{p.title}</h4>
                    <p className="font-sans font-light text-xs text-[#636855] leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── FEATURED LITERATURE SPOTLIGHT ─────────────────────── */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-[#596B32] font-semibold tracking-wider block">Handpicked Volumes</span>
                  <h2 className="font-display text-2xl sm:text-3xl font-light text-[#20231B] mt-0.5">
                    Essential Reading & Curated Editions
                  </h2>
                </div>
                <button
                  onClick={() => setActiveNavTab('books')}
                  className="font-sans text-xs font-medium text-[#596B32] hover:text-[#34451D] flex items-center gap-1.5 underline underline-offset-4"
                >
                  <span>Explore Full Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div ref={featuredBooksRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {(canManageBooks ? books : books.filter(b => !b.hidden)).slice(0, 4).map((book) => (
                  <div
                    data-book-card
                    key={book.id}
                    className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between group shadow-[0_4px_16px_rgba(52,69,29,0.04)] ${
                      book.hidden ? 'border-amber-400/80 bg-amber-500/[0.04]' : 'border-[#E2E7D8] hover:shadow-2xl hover:border-[#596B32] hover:-translate-y-1.5'
                    }`}
                  >
                    <div>
                      <div className="aspect-[3/4] w-full rounded-xl bg-[#F0F4E8] border border-[#E2E7D8] overflow-hidden mb-3 relative shadow-inner">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                              book.hidden ? 'opacity-75 grayscale-[25%]' : ''
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <BookOpen className="w-8 h-8 stroke-1 text-[#85887A]" />
                          </div>
                        )}
                        {/* Category badge */}
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/95 border border-[#E2E7D8] text-[10px] font-mono text-[#34451D] font-semibold shadow-sm">
                          {book.category}
                        </span>
                        {book.hidden && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[9px] font-mono font-medium">
                            HIDDEN
                          </span>
                        )}
                      </div>
                      <h4 className="font-display text-sm font-semibold text-[#20231B] line-clamp-1 group-hover:text-[#596B32] transition-colors">
                        {book.title}
                      </h4>
                      <p className="font-sans font-normal text-xs text-[#7B806B] truncate mt-0.5">{book.author}</p>
                    </div>
                    <div className="pt-3 border-t border-[#E2E7D8] flex items-center justify-between mt-3">
                      <span className="font-mono text-sm sm:text-base font-bold text-[#34451D]">
                        LKR {book.price.toFixed(0)}
                      </span>
                      <button
                        onClick={() => addToCart(book)}
                        className="px-4 py-2 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-semibold transition-all active:scale-95 shadow-sm"
                      >
                        + Add to Bag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── VOICES BETWEEN PAGES - Lumóra Testimonials ──────────── */}
            <section ref={testimonialsRef as React.RefObject<HTMLElement>} className="bg-[#F0F4E8] rounded-3xl p-8 sm:p-12 border border-[#E2E7D8] shadow-xs space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#596B32] block mb-1 font-semibold">- READER REFLECTIONS</span>
                  <h2 className="font-display text-2xl sm:text-3xl font-light text-[#20231B]">
                    Voices Between Pages
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-full bg-white text-xs font-mono font-semibold text-[#34451D] border border-[#E2E7D8] shadow-xs">
                    4.9 / 5.0 Rating
                  </div>
                  <span className="font-sans font-light text-xs text-[#636855]">Over 3,400+ Verified Readers</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { quote: "Sarasavi Pages transformed our study group. Being able to rent Martin Kleppmann's data systems textbook for an entire semester saved us 85% compared to purchasing hardcovers.", name: 'Kavindu Senanayake', role: 'SLIIT Software Engineering Undergraduate' },
                  { quote: "The archival preservation of Leonard Woolf's Baddegama and Martin Wickramasinghe's trilogy is breathtaking. The typography and packaging feel like an art gallery release.", name: 'Dr. Anoma Wijesuriya', role: 'Literary Historian & Visiting Scholar' },
                  { quote: "Courier delivery was astonishingly fast to Kandy. The book was securely sealed in eco-friendly waterproof packaging with prepaid return envelopes ready.", name: 'Malik Jayawardena', role: 'Colombo Readers Circle' }
                ].map((t, idx) => (
                  <div data-testimonial-card key={idx} className="p-6 rounded-2xl bg-white border border-[#E2E7D8] shadow-[0_4px_18px_rgba(52,69,29,0.04)] flex flex-col justify-between space-y-4 hover:shadow-xl hover:border-[#596B32] hover:-translate-y-1 transition-all">
                    <div className="space-y-3">
                      <Quote className="w-5 h-5 text-[#596B32]/50" />
                      <p className="font-sans font-light text-xs text-[#20231B] leading-relaxed italic">"{t.quote}"</p>
                    </div>
                    <div className="pt-3 border-t border-[#E2E7D8]">
                      <h5 className="font-display font-semibold text-xs sm:text-sm text-[#20231B]">{t.name}</h5>
                      <span className="font-sans font-normal text-[11px] text-[#7B806B] block">{t.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SE2030 UNIVERSITY PROJECT MEMBERS - iOS GLASS DARK ─── */}
            <section className="relative rounded-3xl overflow-hidden border border-[#596B32]/40">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1200&q=80')`,
                  filter: 'brightness(0.25) saturate(1.2)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#34451D]/95 via-[#20231B]/90 to-[#34451D]/95" />

              <div className="relative z-10 p-8 sm:p-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#596B32]/50 text-[#B7D85A] border border-[#B7D85A]/30 text-xs font-normal mb-3">
                      <Layers className="w-3.5 h-3.5" />
                      <span>SE2030 Software Engineering · Group Project B9G2</span>
                    </div>
                    <h3 className="font-display text-2xl font-light text-white tracking-tight">
                      Member Modules & System Architecture
                    </h3>
                    <p className="font-sans font-light text-xs text-[#E2E7D8] mt-1">
                      Complete end-to-end CRUD operations, REST endpoints, and role-based administration.
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#20231B] font-normal text-xs hover:bg-[#F0F4E8] transition-all self-start sm:self-auto shadow-md"
                  >
                    <span>Staff / Admin Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { mod: 'M1', title: 'Admin & Staff Management', member: 'Gunathilaka H.D.T.T.', id: 'IT25101540', icon: <Users className="w-4 h-4 text-[#B7D85A]" /> },
                    { mod: 'M2', title: 'Payment Gateways & Transactions', member: 'Anaf M.K.A.S.', id: 'IT25102345', icon: <Award className="w-4 h-4 text-[#B7D85A]" /> },
                    { mod: 'M3', title: 'Customer Support & Tickets', member: 'Zeen A.C.', id: 'IT25103342', icon: <HelpCircle className="w-4 h-4 text-[#B7D85A]" /> },
                    { mod: 'M4', title: 'Inventory & Stock Audit Control', member: 'Dissanayake S.A.S.D.', id: 'IT25101062', icon: <Bookmark className="w-4 h-4 text-[#B7D85A]" /> },
                    { mod: 'M5', title: 'User Identity & Authentication', member: 'Gayathmi P.G.R.', id: 'IT25103013', icon: <User className="w-4 h-4 text-[#B7D85A]" /> },
                    { mod: 'M6', title: 'Orders & Shopping Cart Management', member: 'Diyes C.L.', id: 'IT25100263', icon: <ShoppingCart className="w-4 h-4 text-[#B7D85A]" /> },
                  ].map((m) => (
                    <div key={m.mod} className="p-5 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#34451D] text-[#B7D85A] border border-[#7F9148]/50 text-[10px] font-mono font-medium">{`Module ${m.mod}`}</span>
                        {m.icon}
                      </div>
                      <h4 className="font-display font-light text-white text-xs sm:text-sm">{m.title}</h4>
                      <p className="font-sans font-light text-[11px] text-[#E2E7D8]">{m.member} · {m.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </>
      )}

        {/* ========================================================= */}
        {/* OTHER TABS: CATALOG, PEOPLE, RENTALS, ABOUT              */}
        {/* ========================================================= */}
        {activeNavTab !== 'home' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-12 w-full flex-1">
            {/* ========================================================= */}
            {/* TAB 2: CATALOG (FULL BOOKS STOREFRONT)                    */}
            {/* ========================================================= */}
            {activeNavTab === 'books' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E2E7D8]">
              <div>
                <span className="text-xs font-mono uppercase text-[#596B32] block tracking-wider">Curated Catalog</span>
                <h1 className="text-3xl sm:text-4xl font-display font-light text-[#20231B] mt-1">Complete Bookstore Archive</h1>
                <p className="text-xs text-[#85887A] mt-1">Browse, search, and reserve volumes across canonical literature and university curricula</p>
              </div>

              {/* Minimal Search Input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#85887A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, author, or genre..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#85887A] focus:outline-none focus:border-[#596B32] shadow-xs transition-colors"
                />
              </div>
            </div>

            {/* Admin Controls Banner for Books / Inventory / Catalog Authorized Staff */}
            {canManageBooks && (
              <div className="bg-[#34451D] border border-[#7F9148]/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-md">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#B7D85A] animate-pulse shrink-0 mt-1 sm:mt-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs sm:text-sm text-[#B7D85A]">Catalog Admin Mode Active</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#596B32]/40 text-white font-mono border border-[#7F9148]/50 font-medium">
                        {activeStaff?.fullName || 'Admin Staff'} ({activeStaff?.role?.replace('_', ' ')})
                      </span>
                      <span className="text-[10px] text-[#E2E7D8] font-mono">
                        · {books.length} Titles ({books.filter(b => !b.hidden).length} Active, {books.filter(b => b.hidden).length} Hidden)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#E2E7D8] mt-1 leading-relaxed">
                      You are authorized to add new publications, edit metadata & pricing, toggle customer visibility (Hide/Unhide), and remove titles.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddBookModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B7D85A] hover:bg-[#a6c747] text-[#20231B] font-semibold text-xs shadow-md transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Book</span>
                </button>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#34451D] text-white shadow-sm'
                      : 'bg-white border border-[#E2E7D8] text-[#85887A] hover:text-[#20231B] hover:border-[#7F9148]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Empty state if no books found */}
            {filteredBooks.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E7D8] space-y-3">
                <BookOpen className="w-10 h-10 text-[#85887A] mx-auto stroke-1" />
                <h3 className="text-sm font-semibold text-[#20231B]">No books match your criteria</h3>
                <p className="text-xs text-[#85887A] max-w-sm mx-auto">
                  {selectedCategory !== 'ALL' || searchQuery
                    ? 'Try clearing the search query or changing the category filter.'
                    : 'The bookstore catalog currently has no published titles.'}
                </p>
                {canManageBooks && (
                  <button
                    onClick={() => setIsAddBookModalOpen(true)}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#596B32] text-white text-xs font-medium hover:bg-[#34451D] transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Book to Archive</span>
                  </button>
                )}
              </div>
            )}

            {/* Books Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className={`bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border transition-all flex flex-col justify-between group relative shadow-[0_4px_16px_rgba(52,69,29,0.04)] ${
                    book.hidden
                      ? 'border-amber-400/80 bg-amber-500/[0.03] shadow-sm'
                      : 'border-[#E2E7D8] hover:shadow-xl hover:border-[#596B32] hover:-translate-y-1'
                  }`}
                >
                  <div>
                    {/* Admin Action Header (Exclusively shown to authorized catalog admins) */}
                    {canManageBooks && (
                      <div className="flex items-center justify-between gap-1 pb-2 sm:pb-2.5 mb-2 sm:mb-2.5 border-b border-[#E2E7D8]">
                        <div>
                          {book.hidden ? (
                            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-900 text-[9px] sm:text-[10px] font-semibold font-mono border border-amber-300/60">
                              <EyeOff className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                              <span>HIDDEN</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-[#7F9148]/20 text-[#34451D] text-[9px] sm:text-[10px] font-semibold font-mono border border-[#7F9148]/40">
                              <Eye className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                              <span>LIVE</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-0.5 sm:gap-1">
                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEditBook(book)}
                            className="p-1 sm:p-1.5 rounded-lg hover:bg-[#F0F4E8] text-[#34451D] hover:text-[#20231B] transition-colors"
                            title="Edit book details"
                          >
                            <Edit3 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                          </button>

                          {/* Hide / Unhide button */}
                          <button
                            onClick={() => handleToggleHideBook(book)}
                            className={`p-1 sm:p-1.5 rounded-lg transition-colors ${
                              book.hidden
                                ? 'hover:bg-[#F0F4E8] text-[#596B32]'
                                : 'hover:bg-amber-100 text-amber-700'
                            }`}
                            title={book.hidden ? 'Unhide (Make visible to customers)' : 'Hide (Hide from customers)'}
                          >
                            {book.hidden ? <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> : <EyeOff className="w-3 sm:w-3.5 h-3 sm:h-3.5" />}
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteBook(book)}
                            className="p-1 sm:p-1.5 rounded-lg hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
                            title="Delete book from catalog"
                          >
                            <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="aspect-[3/4] w-full rounded-lg sm:rounded-xl bg-[#F0F4E8] border border-[#E2E7D8] overflow-hidden mb-2.5 sm:mb-3 relative">
                      {book.coverImage ? (
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            book.hidden ? 'opacity-70 grayscale-[25%]' : ''
                          }`} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#85887A]">
                          <BookOpen className="w-8 sm:w-10 h-8 sm:h-10 stroke-1" />
                        </div>
                      )}
                      <span className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[9px] sm:text-[10px] font-mono text-[#34451D] font-semibold shadow-sm border border-[#E2E7D8]">
                        {book.category}
                      </span>
                      {book.hidden && (
                        <span className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 right-1.5 sm:right-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-[#20231B]/90 backdrop-blur-md text-[#B7D85A] text-[9px] sm:text-[10px] font-mono text-center font-medium shadow-md">
                          Hidden
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs sm:text-sm font-semibold text-[#20231B] line-clamp-1 group-hover:text-[#596B32] transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#85887A] truncate mt-0.5">{book.author}</p>
                    {book.description && (
                      <p className="text-[10px] sm:text-[11px] text-[#85887A] line-clamp-2 mt-1.5 sm:mt-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 sm:pt-4 border-t border-[#E2E7D8] flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 sm:gap-2 mt-2.5 sm:mt-4">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-[#85887A] block font-mono">Retail Value</span>
                      <span className="font-mono text-xs sm:text-sm font-semibold text-[#20231B]">
                        LKR {book.price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(book)}
                      className={`w-full xs:w-auto px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-medium shadow-sm transition-all active:scale-95 text-center ${
                        book.hidden
                          ? 'bg-[#E2E7D8] text-[#20231B] hover:bg-[#D4DCC8]'
                          : 'bg-[#34451D] hover:bg-[#20231B] text-white'
                      }`}
                    >
                      {book.hidden ? 'Test Bag' : '+ Add to Bag'}
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
              <span className="text-xs font-mono uppercase text-[#596B32] tracking-widest block">Literary Pantheon</span>
              <h1 className="text-4xl sm:text-5xl font-display font-light text-[#20231B]">Authors Who Shaped Generations</h1>
              <p className="text-xs sm:text-sm text-[#85887A] max-w-xl mx-auto leading-relaxed">
                Celebrating the luminaries whose prose and treatises have enriched Sri Lanka’s cultural consciousness and world literature.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AUTHORS_LIST.map((author) => (
                <div
                  key={author.name}
                  className="bg-white rounded-3xl p-8 border border-[#E2E7D8] shadow-[0_4px_20px_rgba(52,69,29,0.04)] flex flex-col justify-between space-y-6 hover:border-[#596B32] hover:shadow-xl transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-display font-medium text-[#20231B]">{author.name}</h3>
                        <p className="text-xs font-mono text-[#596B32] font-semibold mt-0.5">{author.period} · {author.origin}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-[#F0F4E8] flex items-center justify-center text-[#34451D] shrink-0 border border-[#E2E7D8]">
                        <Feather className="w-4 h-4" />
                      </div>
                    </div>

                    <p className="text-xs text-[#636855] leading-relaxed">
                      {author.bio}
                    </p>

                    <blockquote className="p-4 rounded-2xl bg-[#F0F4E8] border-l-4 border-[#596B32] text-xs font-serif italic text-[#34451D]">
                      "{author.quote}"
                    </blockquote>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#7B806B] uppercase block mb-2 tracking-wider font-medium">Canonical Works:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {author.famousWorks.map(w => (
                        <span key={w} className="px-3 py-1 rounded-full bg-[#F0F4E8] border border-[#E2E7D8] text-[11px] font-medium text-[#20231B]">
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
              <span className="text-xs font-mono uppercase text-[#596B32] tracking-widest block font-semibold">Circular Literary Economy</span>
              <h1 className="text-4xl sm:text-5xl font-display font-light text-[#20231B]">Read More. Spend 70% Less.</h1>
              <p className="text-xs sm:text-sm text-[#7B806B] max-w-xl mx-auto leading-relaxed">
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
                <div key={s.step} className="bg-white rounded-3xl p-6 border border-[#E2E7D8] shadow-xs space-y-3">
                  <span className="font-mono text-xs font-semibold text-[#B7D85A] bg-[#34451D] px-2.5 py-1 rounded-lg shadow-xs">{s.step}</span>
                  <h3 className="font-medium font-display text-[#20231B] text-base">{s.title}</h3>
                  <p className="text-xs text-[#636855] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Rental Plans Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RENTAL_TIERS.map((tier) => (
                <div key={tier.title} className="bg-white rounded-3xl p-8 border border-[#E2E7D8] shadow-xs flex flex-col justify-between space-y-6 hover:border-[#596B32] hover:shadow-xl transition-all">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-[#F0F4E8] text-[#34451D] text-[11px] font-semibold border border-[#E2E7D8]">
                      {tier.badge}
                    </span>
                    <h3 className="text-xl font-medium font-display text-[#20231B] mt-4">{tier.title}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-light font-display text-[#20231B]">{tier.price}</span>
                      <span className="text-xs text-[#7B806B] font-mono">/ {tier.duration}</span>
                    </div>
                    <p className="text-xs text-[#596B32] mt-1 font-semibold">{tier.saving}</p>

                    <ul className="mt-6 space-y-3 text-xs text-[#636855]">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#596B32] shrink-0" />
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
                    className="w-full py-3 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white font-semibold text-xs transition-all shadow-sm"
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
              <span className="text-xs font-mono uppercase text-[#596B32] tracking-widest block font-semibold">Heritage & Governance</span>
              <h1 className="text-4xl sm:text-5xl font-display font-light text-[#20231B]">About Sarasavi Pages</h1>
              <p className="text-xs sm:text-sm text-[#7B806B] max-w-xl mx-auto leading-relaxed">
                Empowering Sri Lankan minds through authentic literature, software engineering academic resources, and accessible digital book lending.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E2E7D8] shadow-xs space-y-6">
              <h2 className="text-2xl font-light font-display text-[#20231B]">The Sarasavi Pages Vision</h2>
              <p className="text-xs sm:text-sm text-[#636855] leading-relaxed">
                Founded as an academic initiative under the <strong>SLIIT Faculty of Computing</strong> (Software Engineering Year 2 Semester 1 - SE2030 Group Project B9G2), Sarasavi Pages bridges historical Sri Lankan literary treasures and modern computing education.
              </p>
              <p className="text-xs sm:text-sm text-[#636855] leading-relaxed">
                Whether it is the timeless village narratives of Martin Wickramasinghe, the poignant historical prose of Leonard Woolf, or the complex distributed architectures authored by Martin Kleppmann, Sarasavi Pages ensures that students, scholars, and lifelong readers have seamless, affordable access.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E2E7D8]">
                <div className="p-5 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8]">
                  <h4 className="text-xs font-semibold text-[#34451D]">Authentic Heritage</h4>
                  <p className="text-[11px] text-[#636855] mt-1">Preserving canonical Sinhala, Tamil, and English national works.</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8]">
                  <h4 className="text-xs font-semibold text-[#596B32]">70% Cheaper Lending</h4>
                  <p className="text-[11px] text-[#636855] mt-1">Smart book rentals so university students never skip learning.</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8]">
                  <h4 className="text-xs font-semibold text-[#7F9148]">Integrated Logistics</h4>
                  <p className="text-[11px] text-[#636855] mt-1">Partnered with Domex and SL Post for islandwide courier delivery.</p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E2E7D8] shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-light font-display text-[#20231B]">Project Engineering Team (Group B9G2)</h3>
                  <p className="text-xs text-[#7B806B]">SE2030 Software Engineering - Group Project ID: 2026-Y2-S1-MLB-B9G2-01</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#F0F4E8] border border-[#E2E7D8] text-[#34451D] text-xs font-mono font-semibold">
                  6 Members
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] hover:border-[#596B32] transition-colors">
                  <div className="text-xs font-semibold text-[#20231B]">Gunathilaka H.D.T.T.</div>
                  <div className="text-[10px] font-mono text-[#596B32] font-semibold">IT25101540 | Module M1</div>
                  <div className="text-[11px] text-[#636855] mt-1">Admin & Staff Management</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] hover:border-[#596B32] transition-colors">
                  <div className="text-xs font-semibold text-[#20231B]">Anaf M.K.A.S.</div>
                  <div className="text-[10px] font-mono text-[#596B32] font-semibold">IT25102345 | Module M2</div>
                  <div className="text-[11px] text-[#636855] mt-1">Payment Systems & Gateways</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] hover:border-[#596B32] transition-colors">
                  <div className="text-xs font-semibold text-[#20231B]">Zeen A.C.</div>
                  <div className="text-[10px] font-mono text-[#596B32] font-semibold">IT25103342 | Module M3</div>
                  <div className="text-[11px] text-[#636855] mt-1">Customer Service & Complaints</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] hover:border-[#596B32] transition-colors">
                  <div className="text-xs font-semibold text-[#20231B]">Dissanayake S.A.S.D.</div>
                  <div className="text-[10px] font-mono text-[#596B32] font-semibold">IT25101062 | Module M4</div>
                  <div className="text-[11px] text-[#636855] mt-1">Inventory & Stock Audit Control</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] hover:border-[#596B32] transition-colors">
                  <div className="text-xs font-semibold text-[#20231B]">Gayathmi P.G.R.</div>
                  <div className="text-[10px] font-mono text-[#596B32] font-semibold">IT25103013 | Module M5</div>
                  <div className="text-[11px] text-[#636855] mt-1">User Identity & Authentication</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] hover:border-[#596B32] transition-colors">
                  <div className="text-xs font-semibold text-[#20231B]">Diyes C.L.</div>
                  <div className="text-[10px] font-mono text-[#596B32] font-semibold">IT25100263 | Module M6</div>
                  <div className="text-[11px] text-[#636855] mt-1">Orders & Shopping Cart Management</div>
                </div>
              </div>
            </div>
          </div>
        )}

          </main>
        )}

      {/* ── CUSTOMER SUPPORT TICKET MODAL (MODULE M3) ──────────── */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsTicketModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2E7D8] z-10 space-y-5 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E7D8]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#596B32] font-semibold tracking-wider">[ MODULE M3 · CUSTOMER CARE ]</span>
                <h3 className="text-xl font-normal font-display text-[#20231B]">Submit Support Ticket</h3>
              </div>
              <button 
                onClick={() => setIsTicketModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F0F4E8] text-[#85887A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ticketStatus === 'success' ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#596B32] mx-auto" />
                <h4 className="text-base font-normal font-display text-[#20231B]">Ticket Registered Successfully</h4>
                <p className="text-xs text-[#85887A]">Our student & courier care officer (Module M3) will reach out within 4 business hours.</p>
                <button
                  onClick={() => {
                    setTicketStatus('idle');
                    setIsTicketModalOpen(false);
                  }}
                  className="mt-4 px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#7B806B] font-medium mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.customerName}
                    onChange={e => setTicketForm({ ...ticketForm, customerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:bg-white focus:outline-none focus:border-[#596B32]"
                    placeholder="e.g. Kasun Perera"
                  />
                </div>

                <div>
                  <label className="block text-[#7B806B] font-medium mb-1">Contact Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.contactNumber}
                    onChange={e => setTicketForm({ ...ticketForm, contactNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:bg-white focus:outline-none focus:border-[#596B32]"
                    placeholder="+94 7X XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-[#7B806B] font-medium mb-1">Inquiry Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.subject}
                    onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:bg-white focus:outline-none focus:border-[#596B32]"
                    placeholder="e.g. Courier delivery status / Rental renewal"
                  />
                </div>

                <div>
                  <label className="block text-[#7B806B] font-medium mb-1">Message Description</label>
                  <textarea
                    rows={3}
                    required
                    value={ticketForm.description}
                    onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:bg-white focus:outline-none focus:border-[#596B32]"
                    placeholder="Please specify order or book reference..."
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(false)}
                    className="px-4 py-2.5 rounded-full border border-[#E2E7D8] text-[#85887A] text-xs font-medium hover:bg-[#F0F4E8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={ticketStatus === 'submitting'}
                    className="px-5 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-sm transition-all"
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
          <div className="relative w-full max-w-md bg-white border-l border-[#E2E7D8] h-full shadow-2xl flex flex-col p-4 sm:p-6 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E7D8]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#34451D]" />
                <h3 className="font-normal font-display text-[#20231B] text-lg">Your Bag</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F0F4E8] text-[#34451D] border border-[#E2E7D8] font-mono font-medium">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F0F4E8] text-[#85887A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 py-4 space-y-3 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-[#85887A] space-y-2">
                  <ShoppingCart className="w-10 h-10 mx-auto text-[#E2E7D8] stroke-1" />
                  <p className="text-xs">Your shopping bag is empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.book.id} className="p-4 rounded-2xl bg-[#F8F9F5] border border-[#E2E7D8] flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[#20231B] truncate">{item.book.title}</h4>
                      <p className="text-[11px] font-mono text-[#596B32] font-medium mt-0.5">LKR {item.book.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-[#E2E7D8] rounded-full bg-white">
                        <button 
                          onClick={() => updateQuantity(item.book.id, -1)}
                          className="p-1.5 hover:text-[#20231B] text-[#85887A]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-medium text-[#20231B]">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.book.id, 1)}
                          className="p-1.5 hover:text-[#20231B] text-[#85887A]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.book.id)}
                        className="p-1.5 rounded-full text-[#85887A] hover:text-red-600 hover:bg-red-50 transition-colors"
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
              <div className="pt-4 border-t border-[#E2E7D8] space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Coupon (e.g. WELCOME10)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] focus:outline-none focus:border-[#596B32] uppercase font-mono"
                  />
                  <button
                    onClick={applyPromo}
                    className="px-4 py-2 rounded-xl bg-[#34451D] text-white text-xs font-medium hover:bg-[#20231B] transition-all"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-red-500">{promoError}</p>}
                {promoApplied && (
                  <p className="text-[11px] text-[#596B32] inline-flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>{promoDiscount}% promotional discount applied!</span>
                  </p>
                )}
              </div>
            )}

            {/* Checkout Total */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-[#E2E7D8] space-y-2">
                <div className="flex justify-between text-xs text-[#85887A]">
                  <span>Subtotal</span>
                  <span className="font-mono">LKR {subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-xs text-[#596B32] font-medium">
                    <span>Coupon Discount ({promoDiscount}%)</span>
                    <span className="font-mono">- LKR {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-[#20231B] pt-2 border-t border-[#E2E7D8]">
                  <span>Total Due</span>
                  <span className="font-mono">LKR {total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full mt-3 py-3 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white font-medium text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CHECKOUT MODAL (MULTI-STEP) ──────────────────────────────────── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E2E7D8] shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
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
                <button onClick={() => { setIsCheckoutOpen(false); setCheckoutStep('shipping'); }} className="p-1.5 rounded-full hover:bg-[#F0F4E8] text-[#85887A] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {checkoutStep !== 'success' && (
              <div className="px-5 sm:px-7 pt-4">
                <div className="h-1.5 bg-[#F0F4E8] rounded-full overflow-hidden">
                  <div className={`h-full bg-[#34451D] rounded-full transition-all duration-500 ${checkoutStep === 'shipping' ? 'w-1/2' : 'w-full'}`} />
                </div>
              </div>
            )}

            <div className="p-5 sm:p-7">
              {/* STEP 1: SHIPPING */}
              {checkoutStep === 'shipping' && (
                <form onSubmit={handleShippingSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#85887A] font-medium mb-1">Full Name *</label>
                      <input required value={shippingForm.fullName} onChange={e => setShippingForm({...shippingForm, fullName: e.target.value})}
                        placeholder="e.g. Kasun Perera" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:bg-white focus:outline-none focus:border-[#596B32]" />
                    </div>
                    <div>
                      <label className="block text-[#85887A] font-medium mb-1">Email Address *</label>
                      <input required type="email" value={shippingForm.email} onChange={e => setShippingForm({...shippingForm, email: e.target.value})}
                        placeholder="you@email.com" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:bg-white focus:outline-none focus:border-[#596B32]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#85887A] font-medium mb-1">Mobile / WhatsApp *</label>
                    <input required value={shippingForm.phone} onChange={e => setShippingForm({...shippingForm, phone: e.target.value})}
                      placeholder="+94 7X XXX XXXX" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:bg-white focus:outline-none focus:border-[#596B32]" />
                  </div>
                  <div>
                    <label className="block text-[#85887A] font-medium mb-1">Street Address *</label>
                    <input required value={shippingForm.address} onChange={e => setShippingForm({...shippingForm, address: e.target.value})}
                      placeholder="No. 12, Galle Road, Dehiwala" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:bg-white focus:outline-none focus:border-[#596B32]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[#85887A] font-medium mb-1">City *</label>
                      <input required value={shippingForm.city} onChange={e => setShippingForm({...shippingForm, city: e.target.value})}
                        placeholder="Colombo" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:bg-white focus:outline-none focus:border-[#596B32]" />
                    </div>
                    <div>
                      <label className="block text-[#85887A] font-medium mb-1">District *</label>
                      <select value={shippingForm.district} onChange={e => setShippingForm({...shippingForm, district: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:bg-white focus:outline-none focus:border-[#596B32]">
                        {['Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya','Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar','Mullaitivu','Vavuniya','Puttalam','Kurunegala','Anuradhapura','Polonnaruwa','Badulla','Monaragala','Ratnapura','Kegalle','Trincomalee','Batticaloa','Ampara'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#85887A] font-medium mb-1">Postal Code</label>
                      <input value={shippingForm.postalCode} onChange={e => setShippingForm({...shippingForm, postalCode: e.target.value})}
                        placeholder="00300" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:bg-white focus:outline-none focus:border-[#596B32]" />
                    </div>
                  </div>
                  {/* Order Summary in shipping step */}
                  <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] space-y-2">
                    <p className="text-[#34451D] font-semibold text-xs mb-2">Order Summary</p>
                    {cart.map(i => (
                      <div key={i.book.id} className="flex justify-between text-[11px] text-[#85887A]">
                        <span className="truncate mr-2">{i.book.title} × {i.quantity}</span>
                        <span className="font-mono shrink-0">LKR {(i.book.price * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {promoApplied && <div className="flex justify-between text-[11px] text-[#596B32] font-medium"><span>Discount</span><span className="font-mono">- LKR {discountAmount.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-xs font-semibold text-[#20231B] pt-1 border-t border-[#E2E7D8]"><span>Total</span><span className="font-mono">LKR {total.toFixed(2)}</span></div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsCheckoutOpen(false)} className="px-4 py-2.5 rounded-full border border-[#E2E7D8] text-[#85887A] text-xs font-medium hover:bg-[#F0F4E8]">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-md transition-all active:scale-95">Continue to Payment →</button>
                  </div>
                </form>
              )}

              {/* STEP 2: PAYMENT */}
              {checkoutStep === 'payment' && (
                <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[#85887A] font-medium mb-2">Payment Method *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'] as const).map(m => (
                        <button key={m} type="button" onClick={() => setPaymentForm({...paymentForm, method: m})}
                          className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                            paymentForm.method === m ? 'border-[#34451D] bg-[#34451D] text-white' : 'border-[#E2E7D8] bg-white text-[#20231B] hover:border-[#596B32]'
                          }`}>
                          {m === 'CREDIT_CARD' ? '💳 Credit Card' : m === 'DEBIT_CARD' ? '🏧 Debit Card' : m === 'BANK_TRANSFER' ? '🏦 Bank Transfer' : '💵 Cash on Delivery'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentForm.method !== 'CASH_ON_DELIVERY' && paymentForm.method !== 'BANK_TRANSFER' && (
                    <>
                      <div>
                        <label className="block text-[#85887A] font-medium mb-1">Card Number *</label>
                        <input required maxLength={19} value={paymentForm.cardNumber}
                          onChange={e => setPaymentForm({...paymentForm, cardNumber: e.target.value.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim()})}
                          placeholder="1234 5678 9012 3456" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-mono focus:bg-white focus:outline-none focus:border-[#596B32]" />
                      </div>
                      <div>
                        <label className="block text-[#85887A] font-medium mb-1">Cardholder Name *</label>
                        <input required value={paymentForm.cardHolder} onChange={e => setPaymentForm({...paymentForm, cardHolder: e.target.value})}
                          placeholder="KASUN PERERA" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] uppercase focus:bg-white focus:outline-none focus:border-[#596B32]" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#85887A] font-medium mb-1">Expiry Date *</label>
                          <input required maxLength={5} value={paymentForm.expiry}
                            onChange={e => setPaymentForm({...paymentForm, expiry: e.target.value.replace(/\D/g,'').replace(/(\d{2})/,'$1/').slice(0,5)})}
                            placeholder="MM/YY" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-mono focus:bg-white focus:outline-none focus:border-[#596B32]" />
                        </div>
                        <div>
                          <label className="block text-[#85887A] font-medium mb-1">CVV *</label>
                          <input required type="password" maxLength={4} value={paymentForm.cvv} onChange={e => setPaymentForm({...paymentForm, cvv: e.target.value.replace(/\D/g,'')})}
                            placeholder="•••" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-mono focus:bg-white focus:outline-none focus:border-[#596B32]" />
                        </div>
                      </div>
                    </>
                  )}
                  {paymentForm.method === 'BANK_TRANSFER' && (
                    <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] text-xs text-[#34451D] space-y-1">
                      <p className="font-semibold">Bank Transfer Details:</p>
                      <p>Bank: Commercial Bank of Ceylon</p>
                      <p>Account: 1234567890 · Branch: Colombo Fort</p>
                      <p>Reference: Your order ID (provided after confirmation)</p>
                    </div>
                  )}
                  {paymentForm.method === 'CASH_ON_DELIVERY' && (
                    <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] text-xs text-[#34451D]">
                      <p className="font-semibold">Cash on Delivery Selected</p>
                      <p className="mt-1 text-[#85887A]">Our delivery partner will collect LKR {total.toFixed(2)} at your doorstep. Exact change appreciated.</p>
                    </div>
                  )}
                  {/* Final total */}
                  <div className="p-4 rounded-2xl bg-[#34451D] text-white flex justify-between items-center">
                    <span className="text-xs font-medium">Total Payable</span>
                    <span className="text-lg font-mono font-light">LKR {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-2 pt-2">
                    <button type="button" onClick={() => setCheckoutStep('shipping')} className="px-4 py-2.5 rounded-full border border-[#E2E7D8] text-[#85887A] text-xs font-medium hover:bg-[#F0F4E8]">← Back</button>
                    <button type="submit" disabled={checkoutProcessing} className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2">
                      {checkoutProcessing ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing...</> : <><Shield className="w-3.5 h-3.5" />Confirm & Pay LKR {total.toFixed(2)}</>}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: SUCCESS + INVOICE */}
              {checkoutStep === 'success' && orderInvoice && (
                <div className="space-y-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#34451D] flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-[#B7D85A]" />
                    </div>
                    <h4 className="font-display text-lg font-normal text-[#20231B]">Payment Successful!</h4>
                    <p className="text-xs text-[#85887A] max-w-sm">Your order has been placed. A confirmation email has been sent to <strong className="text-[#34451D]">{orderInvoice.email}</strong></p>
                  </div>

                  {/* Invoice Preview */}
                  <div className="text-left p-5 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#596B32] font-semibold tracking-wider uppercase">Invoice</span>
                      <span className="font-mono text-[#34451D] font-bold">{orderInvoice.invoiceNo}</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      {orderInvoice.items.map(i => (
                        <div key={i.title} className="flex justify-between text-[#85887A]">
                          <span className="truncate mr-2">{i.title} × {i.qty}</span>
                          <span className="font-mono shrink-0">LKR {(i.price * i.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {orderInvoice.discount > 0 && (
                      <div className="flex justify-between text-[11px] text-[#596B32] font-medium">
                        <span>Discount</span><span className="font-mono">- LKR {orderInvoice.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-[#20231B] pt-2 border-t border-[#E2E7D8]">
                      <span>Total Paid</span><span className="font-mono">LKR {orderInvoice.total.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-[#85887A]">Date: {orderInvoice.date} · Payment: {orderInvoice.paymentMethod}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={() => handleDownloadInvoice(orderInvoice)}
                      className="flex-1 py-2.5 rounded-full border border-[#34451D] text-[#34451D] text-xs font-medium hover:bg-[#F0F4E8] transition-all flex items-center justify-center gap-2">
                      <ArrowUpRight className="w-3.5 h-3.5" />Download Invoice (.txt)
                    </button>
                    <button onClick={() => { setIsCheckoutOpen(false); setCheckoutStep('shipping'); setOrderInvoice(null); }}
                      className="flex-1 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-md transition-all">
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MEMBERSHIP PURCHASE MODAL ─────────────────────────────────────── */}
      {isMembershipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E2E7D8] shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 sm:p-7 border-b border-[#E2E7D8]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#596B32] font-semibold tracking-wider block">Sarasavi Pages Membership</span>
                <h3 className="font-display font-normal text-xl text-[#20231B] mt-0.5">
                  {membershipStep === 'select' ? 'Choose Your Plan' : membershipStep === 'payment' ? 'Complete Payment' : 'Membership Activated!'}
                </h3>
                {userMembership && membershipStep === 'select' && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#34451D] text-[#B7D85A] text-[10px] font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Active: {MEMBERSHIP_PLANS.find(p => p.id === userMembership)?.label}
                  </span>
                )}
              </div>
              {membershipStep !== 'success' && (
                <button onClick={() => { setIsMembershipModalOpen(false); setMembershipStep('select'); }} className="p-1.5 rounded-full hover:bg-[#F0F4E8] text-[#85887A]">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-5 sm:p-7 space-y-5">
              {membershipStep === 'select' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MEMBERSHIP_PLANS.map(plan => (
                      <div key={plan.id}
                        onClick={() => setSelectedMembershipPlan(plan)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedMembershipPlan.id === plan.id ? 'border-[#34451D] bg-[#34451D] text-white' : 'border-[#E2E7D8] bg-white hover:border-[#596B32]'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-mono font-semibold ${selectedMembershipPlan.id === plan.id ? 'text-[#B7D85A]' : 'text-[#596B32]'}`}>{plan.duration}</span>
                          {selectedMembershipPlan.id === plan.id && <Check className="w-4 h-4 text-[#B7D85A]" />}
                        </div>
                        <h4 className={`font-display text-base font-normal ${selectedMembershipPlan.id === plan.id ? 'text-white' : 'text-[#20231B]'}`}>{plan.label}</h4>
                        <p className={`text-2xl font-light font-mono mt-1 ${selectedMembershipPlan.id === plan.id ? 'text-[#B7D85A]' : 'text-[#34451D]'}`}>LKR {plan.price.toFixed(0)}</p>
                        <ul className={`mt-3 space-y-1.5 text-[11px] ${selectedMembershipPlan.id === plan.id ? 'text-[#E2E7D8]' : 'text-[#85887A]'}`}>
                          {plan.benefits.map(b => (
                            <li key={b} className="flex items-center gap-1.5">
                              <Check className={`w-3 h-3 shrink-0 ${selectedMembershipPlan.id === plan.id ? 'text-[#B7D85A]' : 'text-[#596B32]'}`} />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between gap-2">
                    <button onClick={() => setIsMembershipModalOpen(false)} className="px-4 py-2.5 rounded-full border border-[#E2E7D8] text-[#85887A] text-xs font-medium hover:bg-[#F0F4E8]">Maybe Later</button>
                    <button onClick={() => setMembershipStep('payment')} className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-md transition-all active:scale-95">
                      Get {selectedMembershipPlan.label} — LKR {selectedMembershipPlan.price} →
                    </button>
                  </div>
                </>
              )}

              {membershipStep === 'payment' && (
                <form onSubmit={handleMembershipPayment} className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] flex justify-between items-center">
                    <span className="text-[#34451D] font-medium text-xs">{selectedMembershipPlan.label} · {selectedMembershipPlan.duration}</span>
                    <span className="font-mono font-semibold text-[#20231B]">LKR {selectedMembershipPlan.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <label className="block text-[#85887A] font-medium mb-2">Payment Method *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER'] as const).map(m => (
                        <button key={m} type="button" onClick={() => setMembershipPaymentForm({...membershipPaymentForm, method: m})}
                          className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all ${
                            membershipPaymentForm.method === m ? 'border-[#34451D] bg-[#34451D] text-white' : 'border-[#E2E7D8] bg-white text-[#20231B] hover:border-[#596B32]'
                          }`}>
                          {m === 'CREDIT_CARD' ? '💳 Credit' : m === 'DEBIT_CARD' ? '🏧 Debit' : '🏦 Bank'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {membershipPaymentForm.method !== 'BANK_TRANSFER' && (
                    <>
                      <div>
                        <label className="block text-[#85887A] font-medium mb-1">Card Number *</label>
                        <input required maxLength={19} value={membershipPaymentForm.cardNumber}
                          onChange={e => setMembershipPaymentForm({...membershipPaymentForm, cardNumber: e.target.value.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim()})}
                          placeholder="1234 5678 9012 3456" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-mono focus:outline-none focus:border-[#596B32] focus:bg-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#85887A] font-medium mb-1">Expiry *</label>
                          <input required maxLength={5} value={membershipPaymentForm.expiry}
                            onChange={e => setMembershipPaymentForm({...membershipPaymentForm, expiry: e.target.value.replace(/\D/g,'').replace(/(\d{2})/,'$1/').slice(0,5)})}
                            placeholder="MM/YY" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white" />
                        </div>
                        <div>
                          <label className="block text-[#85887A] font-medium mb-1">CVV *</label>
                          <input required type="password" maxLength={4} value={membershipPaymentForm.cvv}
                            onChange={e => setMembershipPaymentForm({...membershipPaymentForm, cvv: e.target.value.replace(/\D/g,'')})}
                            placeholder="•••" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white" />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between gap-2 pt-2">
                    <button type="button" onClick={() => setMembershipStep('select')} className="px-4 py-2.5 rounded-full border border-[#E2E7D8] text-[#85887A] text-xs font-medium hover:bg-[#F0F4E8]">← Back</button>
                    <button type="submit" disabled={membershipProcessing} className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2">
                      {membershipProcessing ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing...</> : <><Shield className="w-3.5 h-3.5" />Pay LKR {selectedMembershipPlan.price}</>}
                    </button>
                  </div>
                </form>
              )}

              {membershipStep === 'success' && membershipInvoice && (
                <div className="space-y-5 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#34451D] flex items-center justify-center">
                      <Award className="w-8 h-8 text-[#B7D85A]" />
                    </div>
                    <h4 className="font-display text-lg font-normal text-[#20231B]">Membership Activated!</h4>
                    <p className="text-xs text-[#85887A] max-w-sm">Welcome to <strong className="text-[#34451D]">{membershipInvoice.plan}</strong>. Your benefits are now active for {membershipInvoice.duration}.</p>
                  </div>
                  <div className="text-left p-5 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-[#85887A]">Invoice No</span><span className="font-mono text-[#34451D] font-bold">{membershipInvoice.invoiceNo}</span></div>
                    <div className="flex justify-between"><span className="text-[#85887A]">Plan</span><span className="font-medium text-[#20231B]">{membershipInvoice.plan}</span></div>
                    <div className="flex justify-between"><span className="text-[#85887A]">Duration</span><span className="text-[#20231B]">{membershipInvoice.duration}</span></div>
                    <div className="flex justify-between font-semibold text-[#20231B] pt-1 border-t border-[#E2E7D8]"><span>Amount Paid</span><span className="font-mono">LKR {membershipInvoice.price.toFixed(2)}</span></div>
                    <p className="text-[10px] text-[#85887A]">{membershipInvoice.date}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={() => handleDownloadMembershipInvoice(membershipInvoice)}
                      className="flex-1 py-2.5 rounded-full border border-[#34451D] text-[#34451D] text-xs font-medium hover:bg-[#F0F4E8] transition-all flex items-center justify-center gap-2">
                      <ArrowUpRight className="w-3.5 h-3.5" />Download Invoice (.txt)
                    </button>
                    <button onClick={() => { setIsMembershipModalOpen(false); setMembershipStep('select'); }}
                      className="flex-1 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-md transition-all">
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── GRAND EDITORIAL FOOTER (LUMÓRA SIGNATURE FOOTER) ───── */}
      <footer className="w-full bg-[#20231B] text-white pt-16 pb-12 px-6 sm:px-12 mt-20 border-t border-[#34451D]">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Top Inquiries & Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pb-12 border-b border-[#34451D]">
            <div className="md:col-span-6 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B7D85A] block">Direct Inquiries</span>
              <a 
                href="mailto:curator@sarasavipages.lk" 
                className="text-xl sm:text-2xl font-display font-light text-white hover:text-[#B7D85A] transition-colors underline underline-offset-8"
              >
                curator@sarasavipages.lk
              </a>
              <p className="text-xs text-[#E2E7D8] max-w-sm leading-relaxed">
                For rare manuscript acquisitions, university academic bulk lending, and Sri Lankan publisher distribution partnerships.
              </p>
            </div>

            <div className="md:col-span-3 space-y-3 text-xs">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B7D85A] block">Navigation</span>
              <ul className="space-y-2 text-[#E2E7D8]">
                <li><button onClick={() => { setActiveNavTab('books'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">Literary Catalog</button></li>
                <li><button onClick={() => { setActiveNavTab('writers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">Authors & Pantheon</button></li>
                <li><button onClick={() => { setActiveNavTab('rentals'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">Student Lending Tiers</button></li>
                <li><button onClick={() => { setActiveNavTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">SLIIT Project & Heritage</button></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3 text-xs">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B7D85A] block">Administration</span>
              <ul className="space-y-2 text-[#E2E7D8]">
                <li><Link href="/login" className="hover:text-white transition-colors">Staff / Admin Login</Link></li>
                <li><Link href="/admin/dashboard" className="hover:text-white transition-colors">M1 Staff Management</Link></li>
                <li><button onClick={() => setIsTicketModalOpen(true)} className="hover:text-white transition-colors">M3 Support Desk</button></li>
                <li><span className="text-[#85887A]">Colombo, Sri Lanka</span></li>
              </ul>
            </div>
          </div>

          {/* Monumental Giant Brand Typography */}
          <div className="overflow-hidden">
            <h2 className="text-6xl sm:text-9xl lg:text-[130px] font-reina font-light tracking-tight text-white/90 leading-none select-none lowercase">
              sarasavi pages<span className="text-2xl sm:text-5xl lg:text-6xl font-light text-[#B7D85A]/60 align-top">®</span>
            </h2>
          </div>

          {/* Bottom Academic Legal Bar */}
          <div className="pt-8 border-t border-[#34451D] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#85887A] font-mono">
            <p>© 2026 Sarasavi Pages (Pvt) Ltd. All rights reserved.</p>
            <p>SE2030 Software Engineering · Group Project 2026-Y2-S1-MLB-B9G2-01 · SLIIT</p>
          </div>
        </div>
      </footer>

      {/* ── MODAL: ADD NEW BOOK TO CATALOG ────────────────────────────── */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E2E7D8] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#E2E7D8] pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#596B32] tracking-wider font-semibold block">Bookstore Catalog Management</span>
                <h3 className="font-display font-medium text-xl sm:text-2xl text-[#20231B] mt-0.5">Register New Book</h3>
                <p className="text-xs text-[#7B806B] mt-1">Add a canonical or academic volume to the Sarasavi Pages public archive</p>
              </div>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F0F4E8] text-[#85887A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#20231B] block mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madol Doova or Clean Architecture"
                  value={newBookForm.title}
                  onChange={e => setNewBookForm({ ...newBookForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E7D8] text-xs text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#20231B] block mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Martin Wickramasinghe"
                    value={newBookForm.author}
                    onChange={e => setNewBookForm({ ...newBookForm, author: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E7D8] text-xs text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#20231B] block mb-1">Category *</label>
                  <select
                    value={newBookForm.category}
                    onChange={e => setNewBookForm({ ...newBookForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2E7D8] text-xs text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                  >
                    <option value="Classic Fiction">Classic Fiction</option>
                    <option value="Literature">Literature</option>
                    <option value="Technology">Technology</option>
                    <option value="Academic">Academic</option>
                    <option value="Historical">Historical</option>
                    <option value="Memoir">Memoir</option>
                    <option value="Science">Science</option>
                    <option value="Poetry">Poetry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#20231B] block mb-1">Retail Price (LKR) *</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={newBookForm.price}
                    onChange={e => setNewBookForm({ ...newBookForm, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E7D8] text-xs font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#20231B] block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={newBookForm.stockQuantity}
                    onChange={e => setNewBookForm({ ...newBookForm, stockQuantity: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E7D8] text-xs font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#20231B] block mb-1">ISBN Code</label>
                  <input
                    type="text"
                    value={newBookForm.isbn}
                    onChange={e => setNewBookForm({ ...newBookForm, isbn: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2E7D8] text-xs font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#20231B] block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newBookForm.coverImage}
                  onChange={e => setNewBookForm({ ...newBookForm, coverImage: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E7D8] text-xs font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#20231B] block mb-1">Book Description / Synopsis</label>
                <textarea
                  rows={3}
                  placeholder="Summary of novel or textbook curriculum..."
                  value={newBookForm.description}
                  onChange={e => setNewBookForm({ ...newBookForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E7D8] text-xs text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E7D8]">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-[#E2E7D8] text-xs font-medium text-[#7B806B] hover:bg-[#F0F4E8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  Publish to Bookstore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT BOOK DETAILS ─────────────────────────────────── */}
      {isEditBookModalOpen && editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E2E7D8] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#E2E7D8] pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#596B32] tracking-wider font-semibold block">Catalog Administrator Control</span>
                <h3 className="font-display font-medium text-xl sm:text-2xl text-[#20231B] mt-0.5">Edit Book Details</h3>
                <p className="text-xs text-[#7B806B] mt-1">Updating ID: <span className="font-mono text-[#596B32] font-bold">{editingBook.id}</span></p>
              </div>
              <button
                onClick={() => { setIsEditBookModalOpen(false); setEditingBook(null); }}
                className="p-1.5 rounded-full hover:bg-[#F0F4E8] text-[#85887A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBook} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#20231B] block mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={editingBook.title}
                  onChange={e => setEditingBook({ ...editingBook, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E7D8] text-xs text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#20231B] block mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={editingBook.author}
                    onChange={e => setEditingBook({ ...editingBook, author: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E7D8] text-xs text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#20231B] block mb-1">Category *</label>
                  <select
                    value={editingBook.category}
                    onChange={e => setEditingBook({ ...editingBook, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2E7D8] text-xs text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                  >
                    <option value="Classic Fiction">Classic Fiction</option>
                    <option value="Literature">Literature</option>
                    <option value="Technology">Technology</option>
                    <option value="Academic">Academic</option>
                    <option value="Historical">Historical</option>
                    <option value="Memoir">Memoir</option>
                    <option value="Science">Science</option>
                    <option value="Poetry">Poetry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#20231B] block mb-1">Price (LKR) *</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={editingBook.price}
                    onChange={e => setEditingBook({ ...editingBook, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E7D8] text-xs font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#20231B] block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={editingBook.stockQuantity}
                    onChange={e => setEditingBook({ ...editingBook, stockQuantity: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E7D8] text-xs font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#20231B] block mb-1">ISBN Code</label>
                  <input
                    type="text"
                    value={editingBook.isbn || ''}
                    onChange={e => setEditingBook({ ...editingBook, isbn: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2E7D8] text-xs font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#20231B] block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={editingBook.coverImage || ''}
                  onChange={e => setEditingBook({ ...editingBook, coverImage: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E7D8] text-xs font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#20231B] block mb-1">Synopsis / Description</label>
                <textarea
                  rows={3}
                  value={editingBook.description || ''}
                  onChange={e => setEditingBook({ ...editingBook, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E7D8] text-xs text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white bg-[#F8F9F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E7D8]">
                <button
                  type="button"
                  onClick={() => { setIsEditBookModalOpen(false); setEditingBook(null); }}
                  className="px-4 py-2.5 rounded-full border border-[#E2E7D8] text-xs font-medium text-[#7B806B] hover:bg-[#F0F4E8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE CONFIRMATION ─────────────────────────────────── */}
      {deleteConfirmBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-200 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-medium text-lg text-[#20231B]">Delete Book from Archive?</h3>
              <p className="text-xs text-[#7B806B] mt-2 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-[#20231B] font-semibold">"{deleteConfirmBook.title}"</strong> by {deleteConfirmBook.author}?
              </p>
              <p className="text-[11px] text-red-600 mt-1 font-medium">This will remove this book from customer storefront catalogs.</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmBook(null)}
                className="px-5 py-2.5 rounded-full border border-[#E2E7D8] text-xs font-medium text-[#7B806B] hover:bg-[#F0F4E8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN TOAST NOTIFICATION ──────────────────────────────────── */}
      {adminNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#34451D] text-white border border-[#7F9148]/50 shadow-2xl max-w-sm">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            adminNotification.type === 'error' ? 'bg-red-400' : adminNotification.type === 'info' ? 'bg-[#B7D85A]' : 'bg-[#B7D85A]'
          }`} />
          <p className="text-xs leading-snug flex-1 font-medium">{adminNotification.message}</p>
          <button
            onClick={() => setAdminNotification(null)}
            className="p-1 text-[#E2E7D8] hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

