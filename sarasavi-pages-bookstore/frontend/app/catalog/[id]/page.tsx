'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FlipbookReader from '@/components/FlipbookReader';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';
import { formatAndLimitIsbn } from '@/lib/input-utils';
import { 
  BookOpen, 
  ShoppingCart, 
  Star, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  Plus, 
  Minus, 
  Lock, 
  Award, 
  Share2, 
  Layers, 
  Feather, 
  ChevronRight,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  Settings
} from 'lucide-react';
import { ordersApi } from '@/lib/orders-api';
import type { Book } from '@/types/orders';

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id as string;
  const { user: authUser, isSuperAdmin, hasRole } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState<'paperback' | 'rental' | 'digital'>('paperback');
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Admin authentication state & modals
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    sinhalaTitle: '',
    author: '',
    category: 'Literature',
    price: 1500,
    stockQuantity: 25,
    isbn: '',
    description: '',
    publisher: 'Sarasavi Publishers',
    pages: 280,
    language: 'Sinhala / English',
    coverImage: ''
  });

  // User membership
  const [userMembership, setUserMembership] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mem = localStorage.getItem('sp_membership');
      setUserMembership(mem);

      // Check admin status from authUser, cookie or localStorage
      if (authUser) {
        setAdminUser(authUser);
      } else {
        const staffRaw = Cookies.get('sp_user') || localStorage.getItem('sp_user');
        if (staffRaw) {
          try {
            setAdminUser(JSON.parse(staffRaw));
          } catch {}
        }
      }
    }
  }, [authUser]);

  // Strict Role-Based Access Control:
  // "Adala part eka adala adminta vitharai eka pennanne. Super adminta onema deyak karanna access kohomath hambenava"
  // - SUPER_ADMIN (Gunathilaka H.D.T.T. / M1): Universal access to all system parts.
  // - ORDER_ADMIN (Diyes C.L. / M6): Dedicated manager for Book Catalog, 3D Flipbook & Orders.
  // - INVENTORY_ADMIN (Dissanayake S.A.S.D. / M4): Catalog inventory & warehouse stock manager.
  // Other admins (PAYMENT_ADMIN, CUSTOMER_SERVICE_ADMIN, ACCOUNT_ADMIN) do NOT have catalog edit/delete access.
  const canManageBook = Boolean(
    (isSuperAdmin || hasRole('SUPER_ADMIN')) ||
    hasRole('ORDER_ADMIN') ||
    hasRole('INVENTORY_ADMIN') ||
    (adminUser && (
      adminUser.role === 'SUPER_ADMIN' ||
      adminUser.role === 'ORDER_ADMIN' ||
      adminUser.role === 'INVENTORY_ADMIN' ||
      adminUser.username === 'GunathilakaT1540' ||
      adminUser.username === 'DiyesL0263' ||
      adminUser.username === 'DissanayakeD1062' ||
      adminUser.username === 'admin'
    ))
  );

  // Fetch book
  useEffect(() => {
    async function loadBook() {
      try {
        const books = await ordersApi.getBooks();
        // Check stored local catalog override if exists
        let catalog = books;
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('sp_catalog_books');
          if (stored) {
            try { catalog = JSON.parse(stored); } catch {}
          }
        }
        const found = catalog.find((b) => b.id === bookId);
        if (found) {
          setBook(found);
          setEditForm({
            title: found.title || '',
            sinhalaTitle: found.sinhalaTitle || '',
            author: found.author || '',
            category: found.category || 'Literature',
            price: found.price || 1500,
            stockQuantity: found.stockQuantity ?? 25,
            isbn: found.isbn || '',
            description: found.description || '',
            publisher: found.publisher || 'Sarasavi Publishers',
            pages: found.pages || 280,
            language: found.language || 'Sinhala / English',
            coverImage: found.coverImage || ''
          });
        } else {
          // Fallback to first book if not found
          const fallback = catalog[0] || null;
          setBook(fallback);
          if (fallback) {
            setEditForm({
              title: fallback.title || '',
              sinhalaTitle: fallback.sinhalaTitle || '',
              author: fallback.author || '',
              category: fallback.category || 'Literature',
              price: fallback.price || 1500,
              stockQuantity: fallback.stockQuantity ?? 25,
              isbn: fallback.isbn || '',
              description: fallback.description || '',
              publisher: fallback.publisher || 'Sarasavi Publishers',
              pages: fallback.pages || 280,
              language: fallback.language || 'Sinhala / English',
              coverImage: fallback.coverImage || ''
            });
          }
        }
      } catch (e) {
        console.error('Failed to load book details:', e);
      } finally {
        setLoading(false);
      }
    }
    if (bookId) loadBook();
  }, [bookId]);

  // Admin: Save updated book details
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageBook) {
      setAdminToast('Access Denied: Only Order Admin (M6) or Super Admin can modify books.');
      setTimeout(() => setAdminToast(null), 3500);
      return;
    }
    if (!book) return;

    const updatedBook: Book = {
      ...book,
      title: editForm.title.trim() || book.title,
      sinhalaTitle: editForm.sinhalaTitle.trim() || undefined,
      author: editForm.author.trim() || book.author,
      category: editForm.category,
      price: Number(editForm.price) || book.price,
      stockQuantity: Number(editForm.stockQuantity) >= 0 ? Number(editForm.stockQuantity) : book.stockQuantity,
      isbn: editForm.isbn.trim() || book.isbn,
      description: editForm.description.trim() || book.description,
      publisher: editForm.publisher.trim() || book.publisher,
      pages: Number(editForm.pages) || book.pages,
      language: editForm.language.trim() || book.language,
      coverImage: editForm.coverImage.trim() || book.coverImage
    };

    setBook(updatedBook);

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sp_catalog_books');
        let catalog: Book[] = stored ? JSON.parse(stored) : [];
        const index = catalog.findIndex((b) => b.id === book.id);
        if (index >= 0) {
          catalog[index] = updatedBook;
        } else {
          catalog.push(updatedBook);
        }
        localStorage.setItem('sp_catalog_books', JSON.stringify(catalog));
        window.dispatchEvent(new Event('sp_catalog_updated'));
      } catch (err) {
        console.error('Error saving updated book catalog:', err);
      }
    }

    setIsEditModalOpen(false);
    setAdminToast(`"${updatedBook.title}" updated successfully!`);
    setTimeout(() => setAdminToast(null), 3500);
  };

  // Admin: Toggle Activate / Deactivate status
  const handleToggleActive = () => {
    if (!canManageBook) {
      setAdminToast('Access Denied: Only Order Admin (M6) or Super Admin can modify books.');
      setTimeout(() => setAdminToast(null), 3500);
      return;
    }
    if (!book) return;
    const isNowHidden = !book.hidden;
    const updatedBook: Book = {
      ...book,
      hidden: isNowHidden
    };

    setBook(updatedBook);

    if (typeof window !== 'undefined') {
      try {
        // Update catalog
        const stored = localStorage.getItem('sp_catalog_books');
        let catalog: Book[] = stored ? JSON.parse(stored) : [];
        const index = catalog.findIndex((b) => b.id === book.id);
        if (index >= 0) {
          catalog[index] = updatedBook;
          localStorage.setItem('sp_catalog_books', JSON.stringify(catalog));
        }

        // Update hidden IDs registry
        const hiddenIds: string[] = JSON.parse(localStorage.getItem('sp_hidden_books') || '[]');
        let nextHidden: string[];
        if (isNowHidden) {
          nextHidden = Array.from(new Set([...hiddenIds, book.id]));
        } else {
          nextHidden = hiddenIds.filter(id => id !== book.id);
        }
        localStorage.setItem('sp_hidden_books', JSON.stringify(nextHidden));
        window.dispatchEvent(new Event('sp_catalog_updated'));
      } catch (err) {
        console.error('Error toggling book status:', err);
      }
    }

    setAdminToast(
      isNowHidden
        ? `Book "${book.title}" deactivated and hidden from regular customers.`
        : `Book "${book.title}" re-activated and live in catalog!`
    );
    setTimeout(() => setAdminToast(null), 4000);
  };

  // Admin: Delete book permanently
  const handleDeleteBook = () => {
    if (!canManageBook) {
      setAdminToast('Access Denied: Only Order Admin (M6) or Super Admin can modify books.');
      setTimeout(() => setAdminToast(null), 3500);
      return;
    }
    if (!book) return;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sp_catalog_books');
        if (stored) {
          const catalog: Book[] = JSON.parse(stored);
          const filtered = catalog.filter((b) => b.id !== book.id);
          localStorage.setItem('sp_catalog_books', JSON.stringify(filtered));
        }

        // Also add to hidden books
        const hiddenIds: string[] = JSON.parse(localStorage.getItem('sp_hidden_books') || '[]');
        localStorage.setItem('sp_hidden_books', JSON.stringify([...hiddenIds, book.id]));
        window.dispatchEvent(new Event('sp_catalog_updated'));
      } catch (err) {
        console.error('Error deleting book:', err);
      }
    }

    setIsDeleteModalOpen(false);
    setAdminToast(`"${book.title}" has been deleted from the catalog.`);
    setTimeout(() => {
      router.push('/catalog');
    }, 1200);
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!book) return;
    try {
      const stored = localStorage.getItem('sp_cart');
      const cart: { book: Book; quantity: number }[] = stored ? JSON.parse(stored) : [];
      const existing = cart.find((i) => i.book.id === book.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ book, quantity });
      }
      localStorage.setItem('sp_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('sp_cart_updated'));
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    } catch (e) {
      console.error('Failed to add to cart:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9F5] flex flex-col">
        <Navbar activeTab="catalog" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#34451D]/30 border-t-[#34451D] rounded-full animate-spin mx-auto" />
            <p className="font-mono text-xs text-[#636855]">Opening book archive...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#F8F9F5] flex flex-col">
        <Navbar activeTab="catalog" />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="font-display text-2xl text-[#20231B]">Book Not Found</h2>
          <p className="text-xs text-[#636855]">The requested title could not be found in our bookstore archive.</p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#34451D] text-white text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const memberDiscountRate = userMembership === 'PREMIUM' ? 20 : userMembership === 'BASIC' ? 10 : 0;
  const discountedPrice = memberDiscountRate > 0 ? book.price * (1 - memberDiscountRate / 100) : null;
  const isStationery = (book.category || '').toLowerCase().includes('stationery') || (book.category || '').toLowerCase().includes('supplies');

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#20231B] antialiased selection:bg-[#34451D] selection:text-white font-sans py-4 flex flex-col">
      {/* ── Cohesive Navbar ── */}
      <Navbar activeTab={isStationery ? 'stationery' : 'catalog'} />

      {/* ── Admin Toast Notification ── */}
      {adminToast && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-3 rounded-2xl bg-[#1A261C] border border-[#596B32] text-white shadow-2xl text-xs flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#B7D85A] shrink-0" />
            <span className="font-medium">{adminToast}</span>
          </div>
        </div>
      )}

      {/* ── Admin Management Suite Bar (Visible ONLY to Order Admin / Inventory Admin / Super Admin) ── */}
      {canManageBook && adminUser && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-3 pb-1">
          <div className="bg-[#1A261C] border border-[#596B32] rounded-3xl p-3.5 sm:px-6 sm:py-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#34451D] border border-[#B7D85A]/50 flex items-center justify-center text-[#B7D85A] shadow-xs shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-white tracking-tight">
                    Admin Mode: {adminUser.fullName || adminUser.username}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#B7D85A] text-[#121614] text-[9px] font-mono font-bold uppercase tracking-wider">
                    {adminUser.role || 'STAFF'}
                  </span>
                </div>
                <span className="text-[11px] text-[#A5AB9A] block mt-0.5">
                  Direct live control: Edit product details, stock, or toggle catalog visibility
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              {/* Active / Deactivated Status Pill */}
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border shadow-xs ${
                book.hidden 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${book.hidden ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span>{book.hidden ? 'DEACTIVATED' : 'ACTIVE / IN CATALOG'}</span>
              </span>

              {/* Edit Details Button */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Edit book details, price and stock"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#B7D85A]" />
                <span>Edit Book</span>
              </button>

              {/* Deactivate / Activate Button */}
              <button
                onClick={handleToggleActive}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all shadow-xs active:scale-95 cursor-pointer ${
                  book.hidden
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                    : 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border-amber-500/40'
                }`}
                title={book.hidden ? 'Activate title to make it visible to readers' : 'Deactivate title to hide from readers'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{book.hidden ? 'Activate' : 'Deactivate'}</span>
              </button>

              {/* Delete Button */}
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white border border-red-500/30 text-xs font-medium transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Permanently remove from bookstore catalog"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Deactivated Alert Banner (When Book is Hidden) ── */}
      {book.hidden && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-2">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Title is Deactivated:</strong> This book is hidden from customer browsing and search results. You can view specifications below and re-activate whenever ready.
              </span>
            </div>
            {canManageBook && (
              <button
                onClick={handleToggleActive}
                className="px-3.5 py-1 rounded-full bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-semibold transition-all self-start sm:self-auto shrink-0 shadow-xs"
              >
                Activate Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#7B806B]">
          <Link href="/" className="hover:text-[#34451D] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-[#34451D] transition-colors">Catalog</Link>
          <span>/</span>
          <Link 
            href={`/catalog?category=${encodeURIComponent(book.category)}`}
            className="hover:text-[#34451D] transition-colors"
          >
            {book.category}
          </Link>
          <span>/</span>
          <span className="text-[#34451D] truncate font-medium">{book.title}</span>
        </div>
      </div>

      {/* ── Main Book Details Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-12 flex-1 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ── LEFT COLUMN (5 cols): Cover & Digital Reader CTA ── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Big High-Definition Book Cover */}
            <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-white border border-[#E2E7D8] shadow-2xl p-4 flex items-center justify-center group">
              <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner bg-[#F0F4E8]">
                <img
                  src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Category & Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  <span className="px-3 py-1 rounded-full bg-[#34451D]/90 backdrop-blur-md text-[#B7D85A] text-[11px] font-mono font-medium shadow-md border border-[#596B32]/40">
                    {book.category}
                  </span>
                  {book.sinhalaTitle && (
                    <span className="px-3 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[#34451D] text-[11px] font-display font-semibold shadow-xs border border-[#E2E7D8]">
                      {book.sinhalaTitle}
                    </span>
                  )}
                </div>

                {/* Rating badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#20231B] text-xs font-mono font-semibold shadow-md flex items-center gap-1 border border-[#E2E7D8]">
                  <Star className="w-3.5 h-3.5 text-[#D96B27] fill-[#D96B27]" />
                  <span>{book.rating || 4.8}</span>
                </div>
              </div>
            </div>

            {/* ── HEYZINE-STYLE DIGITAL FLIPBOOK CALLOUT OR STATIONERY SPEC ── */}
            {!isStationery ? (
              <div className="bg-gradient-to-br from-[#1B291A] to-[#2D391A] text-white rounded-3xl p-6 border border-[#596B32] shadow-xl relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#B7D85A]/15 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#34451D] border border-[#B7D85A]/50 flex items-center justify-center text-[#B7D85A]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#B7D85A] font-semibold block">
                        Heyzine-Style Experience
                      </span>
                      <h4 className="font-display font-medium text-base text-white">
                        Interactive 3D Digital Flipbook
                      </h4>
                    </div>
                  </div>

                  {userMembership ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#B7D85A] text-[#121614] text-[10px] font-mono font-bold uppercase shrink-0">
                      Unlocked
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-medium flex items-center gap-1 shrink-0">
                      <Lock className="w-3 h-3" />
                      <span>Member Only</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#D3DCBF] font-light leading-relaxed mb-4">
                  Experience realistic 3D page turning, digital annotations, table of contents and full chapter excerpts online on any device.
                </p>

                <button
                  onClick={() => setIsReaderOpen(true)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#B7D85A] to-[#8FA842] hover:from-[#c5e468] hover:to-[#9cb74b] text-[#121614] font-display font-semibold text-xs transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Read Online in 3D Flipbook</span>
                </button>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#A8B69A]">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B7D85A]" />
                    <span>Free preview: Pages 1–2</span>
                  </span>
                  <Link href="/membership" className="text-[#B7D85A] hover:underline flex items-center gap-0.5">
                    <span>Membership details</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#1B291A] to-[#2D391A] text-white rounded-3xl p-6 border border-[#596B32] shadow-xl relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#B7D85A]/15 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#34451D] border border-[#B7D85A]/50 flex items-center justify-center text-[#B7D85A]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#B7D85A] font-semibold block">
                        Verified Authentic
                      </span>
                      <h4 className="font-display font-medium text-base text-white">
                        Original Brand Supply
                      </h4>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-[#B7D85A] text-[#121614] text-[10px] font-mono font-bold uppercase shrink-0">
                    Stock: {book.stockQuantity}
                  </span>
                </div>

                <p className="text-xs text-[#D3DCBF] font-light leading-relaxed mb-4">
                  Factory-sealed original pack sourced directly from authorized brand distributors. Guaranteed genuine quality for school, university, and office use.
                </p>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#B7D85A] to-[#8FA842] hover:from-[#c5e468] hover:to-[#9cb74b] text-[#121614] font-display font-semibold text-xs transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add {quantity} to Shopping Bag</span>
                </button>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#A8B69A]">
                  <span className="inline-flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#B7D85A]" />
                    <span>Express Islandwide Delivery in 24–48h</span>
                  </span>
                  <span className="text-[#B7D85A]">Original Sealed Pack</span>
                </div>
              </div>
            )}

            {/* Trust & Guarantee Badges */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-[#E2E7D8] shadow-xs text-center text-[11px] font-sans">
              <div className="space-y-1">
                <ShieldCheck className="w-5 h-5 text-[#34451D] mx-auto" />
                <span className="block font-medium text-[#20231B]">100% Genuine</span>
                <span className="text-[#85887A] text-[10px] block">Publisher Edition</span>
              </div>
              <div className="space-y-1 border-x border-[#E2E7D8]">
                <Truck className="w-5 h-5 text-[#34451D] mx-auto" />
                <span className="block font-medium text-[#20231B]">24–48h Dispatch</span>
                <span className="text-[#85887A] text-[10px] block">All 25 Districts</span>
              </div>
              <div className="space-y-1">
                <RotateCcw className="w-5 h-5 text-[#34451D] mx-auto" />
                <span className="block font-medium text-[#20231B]">Hassle-Free</span>
                <span className="text-[#85887A] text-[10px] block">Return Policy</span>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN (7 cols): Book Details, Pricing & Formats ── */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Title, Sinhala Subtitle, Author */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#F0F4E8] text-[#596B32] font-mono text-xs font-semibold border border-[#E2E7D8]">
                  {book.category}
                </span>
                {book.sinhalaTitle && (
                  <span className="px-3 py-1 rounded-full bg-[#34451D] text-[#B7D85A] font-mono text-xs font-semibold">
                    {book.sinhalaTitle}
                  </span>
                )}
                <span className="text-xs font-mono text-[#85887A]">
                  ISBN: {book.isbn}
                </span>
              </div>

              <h1 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-[#20231B] tracking-tight leading-[1.12]">
                {book.title}
                {book.sinhalaTitle && (
                  <span className="block text-2xl sm:text-3xl text-[#596B32] font-normal mt-1">
                    ({book.sinhalaTitle})
                  </span>
                )}
              </h1>

              <p className="text-sm sm:text-base text-[#596B32] font-sans font-medium flex items-center gap-2 pt-1">
                <span>{isStationery ? `Brand: ${book.author}` : `By ${book.author}`}</span>
                <span className="text-[#85887A]">•</span>
                <span className="text-[#85887A] font-light">{book.publisher || (isStationery ? 'Genuine Distributor' : 'Sarasavi Publishers')}</span>
              </p>
            </div>

            {/* Pricing Dock */}
            <div className="p-6 rounded-3xl bg-white border border-[#E2E7D8] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E2E7D8] pb-4">
                <div>
                  <div className="flex items-baseline gap-3">
                    {discountedPrice ? (
                      <>
                        <span className="font-display text-3xl sm:text-4xl font-semibold text-[#34451D]">
                          LKR {discountedPrice.toFixed(0)}
                        </span>
                        <span className="font-mono text-base text-[#85887A] line-through">
                          LKR {book.price.toFixed(0)}
                        </span>
                      </>
                    ) : (
                      <span className="font-display text-3xl sm:text-4xl font-semibold text-[#20231B]">
                        LKR {book.price.toFixed(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-[#596B32] font-semibold mt-1 block">
                    {book.stockQuantity > 0 ? `In Stock (${book.stockQuantity} copies available)` : 'Currently Out of Stock'}
                  </span>
                </div>

                {userMembership ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B7D85A]/30 text-[#20231B] text-xs font-mono font-semibold border border-[#B7D85A]">
                    <Award className="w-3.5 h-3.5 text-[#34451D]" />
                    <span>Member Discount Applied ({memberDiscountRate}%)</span>
                  </div>
                ) : (
                  <Link
                    href="/membership"
                    className="text-xs text-[#596B32] hover:text-[#34451D] underline underline-offset-4 font-medium"
                  >
                    Get Member Price (Save up to 20%)
                  </Link>
                )}
              </div>

              {/* Format Selection Selector */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-[#7B806B] font-semibold block">
                  Select Format:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedFormat('paperback')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedFormat === 'paperback'
                        ? 'border-[#34451D] bg-[#F0F4E8] ring-2 ring-[#34451D]/20 shadow-xs'
                        : 'border-[#E2E7D8] bg-white hover:border-[#85887A]'
                    }`}
                  >
                    <span className="text-xs font-medium text-[#20231B] block">Paperback Print</span>
                    <span className="text-[11px] font-mono text-[#596B32] font-semibold">
                      LKR {discountedPrice ? discountedPrice.toFixed(0) : book.price.toFixed(0)}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedFormat('rental')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedFormat === 'rental'
                        ? 'border-[#34451D] bg-[#F0F4E8] ring-2 ring-[#34451D]/20 shadow-xs'
                        : 'border-[#E2E7D8] bg-white hover:border-[#85887A]'
                    }`}
                  >
                    <span className="text-xs font-medium text-[#20231B] block">14-Day Lending</span>
                    <span className="text-[11px] font-mono text-[#596B32] font-semibold">LKR 350 (Save 75%)</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFormat('digital');
                      setIsReaderOpen(true);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedFormat === 'digital'
                        ? 'border-[#34451D] bg-[#F0F4E8] ring-2 ring-[#34451D]/20 shadow-xs'
                        : 'border-[#E2E7D8] bg-white hover:border-[#85887A]'
                    }`}
                  >
                    <span className="text-xs font-medium text-[#20231B] flex items-center justify-between">
                      <span>3D Flipbook</span>
                      <Sparkles className="w-3 h-3 text-[#B7D85A]" />
                    </span>
                    <span className="text-[11px] font-mono text-[#596B32] font-semibold">
                      {userMembership ? 'Free with Pass' : 'LKR 250 / Member'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quantity & Add to Cart button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center rounded-full border border-[#E2E7D8] bg-[#F8F9F5] p-1 w-full sm:w-auto justify-between">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#20231B] hover:bg-[#E2E7D8] disabled:opacity-40 transition-colors shadow-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-sm font-semibold px-4">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={quantity >= book.stockQuantity}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#20231B] hover:bg-[#E2E7D8] disabled:opacity-40 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={book.stockQuantity <= 0}
                  className="flex-1 w-full py-3.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white font-display font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    Add to Bag · LKR {((discountedPrice || book.price) * quantity).toLocaleString()}
                  </span>
                </button>
              </div>

              {addedToast && (
                <div className="p-3 rounded-2xl bg-[#EAF2D8] border border-[#B7D85A] text-[#20231B] text-xs flex items-center justify-between animate-fadeIn font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#34451D]" />
                    <span>Added {quantity} copy to your shopping bag!</span>
                  </div>
                  <Link href="/catalog?cart=open" className="underline font-bold text-[#34451D]">
                    View Bag
                  </Link>
                </div>
              )}

            </div>

            {/* Synopsis & Literary Overview */}
            <div className="space-y-3">
              <h3 className="font-display font-medium text-xl text-[#20231B]">
                About This Edition
              </h3>
              <p className="font-sans font-light text-sm text-[#4A4E42] leading-relaxed">
                {book.description}
              </p>
              {book.category === 'Sinhala Books' && (
                <p className="font-sans text-xs text-[#636855] leading-relaxed bg-[#F0F4E8] p-4 rounded-2xl border border-[#E2E7D8]">
                  මෙම කෘතිය ශ්‍රී ලාංකීය සාහිත්‍ය ක්ෂේත්‍රයේ විශිෂ්ටතම සංධිස්ථානයක් වන අතර පාසල් සහ විශ්වවිද්‍යාල විෂය නිර්දේශයන් සඳහා අනුමත සංස්කරණයකි.
                </p>
              )}
            </div>

            {/* Book Specifications Table */}
            <div className="space-y-3">
              <h3 className="font-display font-medium text-xl text-[#20231B]">
                Product Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-[#E2E7D8]">
                  <span className="text-[10px] font-mono uppercase text-[#7B806B] block">Language</span>
                  <span className="text-xs font-medium text-[#20231B] mt-0.5 block">{book.language || 'English / Sinhala'}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-[#E2E7D8]">
                  <span className="text-[10px] font-mono uppercase text-[#7B806B] block">Number of Pages</span>
                  <span className="text-xs font-medium text-[#20231B] mt-0.5 block">{book.pages || 280} pages</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-[#E2E7D8]">
                  <span className="text-[10px] font-mono uppercase text-[#7B806B] block">ISBN-13</span>
                  <span className="text-xs font-medium text-[#20231B] mt-0.5 block font-mono">{book.isbn}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-[#E2E7D8]">
                  <span className="text-[10px] font-mono uppercase text-[#7B806B] block">Publisher</span>
                  <span className="text-xs font-medium text-[#20231B] mt-0.5 block">{book.publisher || 'Sarasavi Publishers'}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-[#E2E7D8]">
                  <span className="text-[10px] font-mono uppercase text-[#7B806B] block">Delivery</span>
                  <span className="text-xs font-medium text-[#20231B] mt-0.5 block">Domex Express · 24-48h</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-[#E2E7D8]">
                  <span className="text-[10px] font-mono uppercase text-[#7B806B] block">Digital Access</span>
                  <span className="text-xs font-medium text-[#596B32] mt-0.5 block font-semibold">Interactive 3D Flipbook</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* ── Interactive Heyzine Flipbook Reader Modal ── */}
      <FlipbookReader
        book={book}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        userMembership={userMembership}
        onUpgradeMembership={() => {
          setIsReaderOpen(false);
          router.push('/membership');
        }}
      />

      {/* ── ADMIN: EDIT BOOK DETAILS MODAL ───────────────────────── */}
      {canManageBook && isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E2E7D8] rounded-[32px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E2E7D8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0F4E8] text-[#34451D] flex items-center justify-center border border-[#E2E7D8]">
                  <Edit3 className="w-5 h-5 text-[#596B32]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#20231B]">Edit Book Catalog Details</h3>
                  <p className="text-xs text-[#85887A]">Modify title, pricing, warehouse stock, and metadata</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F8F9F5] hover:bg-[#F0F4E8] text-[#85887A] hover:text-[#20231B] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#34451D] font-medium mb-1.5">Book Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#34451D] font-medium mb-1.5">Sinhala Title (Optional)</label>
                  <input
                    type="text"
                    value={editForm.sinhalaTitle}
                    onChange={(e) => setEditForm({ ...editForm, sinhalaTitle: e.target.value })}
                    placeholder="e.g. මඩොල් දූව"
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#34451D] font-medium mb-1.5">Author *</label>
                  <input
                    type="text"
                    required
                    value={editForm.author}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#34451D] font-medium mb-1.5">Category *</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white cursor-pointer"
                  >
                    <option value="Literature">Literature</option>
                    <option value="Sinhala Books">Sinhala Books</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Academic">Academic Books</option>
                    <option value="Technology">Technology</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Office Stationery">Office Stationery</option>
                    <option value="Art Supplies">Art Supplies</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#34451D] font-medium mb-1.5">Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    min={50}
                    max={999999}
                    step={10}
                    onInput={(e) => { if (e.currentTarget.value.length > 6) e.currentTarget.value = e.currentTarget.value.slice(0, 6); }}
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Math.max(0, Math.min(999999, Number(e.target.value))) })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-mono focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#34451D] font-medium mb-1.5">Stock Quantity (Units) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={99999}
                    onInput={(e) => { if (e.currentTarget.value.length > 5) e.currentTarget.value = e.currentTarget.value.slice(0, 5); }}
                    value={editForm.stockQuantity}
                    onChange={(e) => setEditForm({ ...editForm, stockQuantity: Math.max(0, Math.min(99999, Number(e.target.value))) })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-mono focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#34451D] font-medium mb-1.5">ISBN-13</label>
                  <input
                    type="text"
                    maxLength={17}
                    placeholder="978-955-0201-99-9"
                    value={editForm.isbn}
                    onChange={(e) => setEditForm({ ...editForm, isbn: formatAndLimitIsbn(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-mono focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#34451D] font-medium mb-1.5">Publisher</label>
                  <input
                    type="text"
                    value={editForm.publisher}
                    onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#34451D] font-medium mb-1.5">Pages Count</label>
                  <input
                    type="number"
                    value={editForm.pages}
                    onChange={(e) => setEditForm({ ...editForm, pages: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-mono focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#34451D] font-medium mb-1.5">Language</label>
                  <input
                    type="text"
                    value={editForm.language}
                    onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#34451D] font-medium mb-1.5">Cover Image URL</label>
                <input
                  type="text"
                  value={editForm.coverImage}
                  onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                  placeholder="/images/madol_doova.jpg or https://..."
                  className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-mono text-[11px] focus:outline-none focus:border-[#596B32] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[#34451D] font-medium mb-1.5">Description & Synopsis</label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E7D8]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#F8F9F5] hover:bg-[#F0F4E8] text-[#85887A] hover:text-[#20231B] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white font-semibold transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-[#B7D85A]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADMIN: DELETE CONFIRMATION MODAL ──────────────────────── */}
      {canManageBook && isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E2E7D8] rounded-[32px] p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#20231B]">Delete "{book.title}"?</h3>
              <p className="text-xs text-[#85887A] mt-1 leading-relaxed">
                Are you sure you want to permanently remove this title from the bookstore catalog? This action will remove all customer access and inventory links.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E7D8]">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-full bg-[#F8F9F5] hover:bg-[#F0F4E8] text-[#85887A] hover:text-[#20231B] text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBook}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
