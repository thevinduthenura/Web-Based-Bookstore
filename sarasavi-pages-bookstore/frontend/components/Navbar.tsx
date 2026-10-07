'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { 
  Globe, 
  ShoppingCart, 
  ChevronDown, 
  User, 
  Menu, 
  X 
} from 'lucide-react';

interface NavbarProps {
  activeTab?: 'home' | 'catalog' | 'stationery' | 'membership' | 'orders' | 'about';
  onOpenBag?: () => void;
  isHomeHero?: boolean;
  isDark?: boolean;
}

export default function Navbar({ 
  activeTab = 'home', 
  onOpenBag, 
  isHomeHero = false,
  isDark: isDarkProp
}: NavbarProps) {
  const [customer, setCustomer] = useState<{ id?: string; name?: string; email?: string } | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine if navbar is currently over a dark background:
  // Explicit prop takes priority; otherwise on home hero before scroll it is dark.
  const isDark = isDarkProp !== undefined 
    ? isDarkProp 
    : (isHomeHero && !isScrolled);

  useEffect(() => {
    // 1. Read logged-in customer from cookies or localStorage
    const loadCustomer = () => {
      try {
        const custRaw = Cookies.get('sp_customer') || (typeof window !== 'undefined' ? localStorage.getItem('sp_customer') : null);
        if (custRaw) {
          const parsed = JSON.parse(custRaw);
          setCustomer(parsed);
          return;
        }
        const staffRaw = Cookies.get('sp_user') || (typeof window !== 'undefined' ? localStorage.getItem('sp_user') : null);
        if (staffRaw) {
          const parsed = JSON.parse(staffRaw);
          setCustomer({ 
            id: parsed.username || 'user', 
            name: parsed.fullName || parsed.username || 'Admin',
            dashboardPath: parsed.dashboardPath || '/admin/dashboard'
          } as any);
          return;
        }
        setCustomer(null);
      } catch {
        setCustomer(null);
      }
    };

    // 2. Read cart count
    const updateCount = () => {
      try {
        const cartData = localStorage.getItem('sp_cart');
        if (cartData) {
          const items = JSON.parse(cartData);
          if (Array.isArray(items)) {
            const total = items.reduce((acc: number, item: { quantity?: number }) => acc + (item.quantity || 1), 0);
            setCartCount(total);
            return;
          }
        }
        setCartCount(0);
      } catch {
        setCartCount(0);
      }
    };

    loadCustomer();
    updateCount();

    window.addEventListener('storage', updateCount);
    window.addEventListener('sp_cart_updated', updateCount);
    window.addEventListener('sp_customer_updated', loadCustomer);

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('sp_cart_updated', updateCount);
      window.removeEventListener('sp_customer_updated', loadCustomer);
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'catalog', label: 'Catalog', href: '/catalog' },
    { id: 'stationery', label: 'Stationery', href: '/catalog?category=Stationery' },
    { id: 'membership', label: 'Membership', href: '/membership' },
    { id: 'about', label: 'About', href: '/about' },
    { id: 'orders', label: 'My Orders', href: '/orders' },
  ];

  const displayName = customer?.name?.split(' ')[0] || customer?.email?.split('@')[0] || 'thevindu99';

  return (
    <header className={`sticky top-3 sm:top-4 z-40 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 transition-all ${
      isHomeHero ? '-mb-20 pointer-events-none' : 'mb-6'
    }`}>
      <div className={`pointer-events-auto backdrop-blur-xl rounded-full h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 ${
        isDark
          ? 'bg-black/30 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
          : 'bg-white/92 border border-[#E2E7D8] shadow-[0_8px_32px_rgba(32,35,27,0.05)]'
      }`}>
        
        {/* Left: Brand Wordmark with Organic Dots */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group text-left shrink-0">
          <div className="flex items-center -space-x-1">
            <div className={`w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full ${isDark ? 'bg-white/90' : 'bg-[#34451D]'} group-hover:scale-110 transition-transform`} />
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#B7D85A] group-hover:scale-110 transition-transform" />
            <div className={`w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full ${isDark ? 'bg-[#AAB58A]' : 'bg-[#596B32]'} group-hover:scale-110 transition-transform`} />
          </div>
          <span className="font-display text-base sm:text-lg tracking-tight transition-colors">
            <span className={`font-medium ${isDark ? 'text-white' : 'text-[#20231B]'}`}>
              sarasavi
            </span>
            <span className={`font-light ${isDark ? 'text-[#B7D85A]' : 'text-[#596B32]'}`}>
              pages
            </span>
          </span>
        </Link>

        {/* Center: Healium Pill Navigation */}
        <nav className={`hidden md:flex items-center rounded-full p-1 border gap-1 text-xs transition-all ${
          isDark
            ? 'bg-[#F0F4E8]/95 backdrop-blur-md border-white/20 shadow-xs'
            : 'bg-[#F0F4E8] border-[#E2E7D8]'
        }`}>
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`relative px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#34451D] text-white shadow-xs font-medium'
                    : 'text-[#34451D]/80 hover:text-[#20231B] hover:bg-white font-normal'
                }`}
              >
                <span>{isActive ? `• ${tab.label}` : tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Currency, Bag, Account Chip & Mobile Menu Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Currency Pill */}
          <div className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-light transition-all cursor-pointer ${
            isDark 
              ? 'text-white/90 hover:text-white hover:bg-white/10' 
              : 'text-[#596B32] hover:text-[#20231B] hover:bg-[#F0F4E8]'
          }`}>
            <Globe className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#B7D85A]' : 'text-[#596B32]'}`} />
            <span>LKR</span>
            <ChevronDown className={`w-3 h-3 ${isDark ? 'text-white/70' : 'text-[#596B32]'}`} />
          </div>

          {/* Shopping Bag Button */}
          {onOpenBag ? (
            <button
              onClick={onOpenBag}
              className={`relative px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-normal flex items-center gap-1.5 shadow-xs transition-all ${
                isDark
                  ? 'bg-white hover:bg-[#F0F4E8] border border-white/30 text-[#20231B]'
                  : 'bg-white hover:bg-[#F0F4E8] border border-[#E2E7D8] text-[#20231B]'
              }`}
              title="Shopping Bag"
            >
              <ShoppingCart className={`w-3.5 h-3.5 ${isDark ? 'text-[#34451D]' : 'text-[#596B32]'}`} />
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span className="h-4 min-w-[16px] px-1 rounded-full bg-[#B7D85A] text-[#20231B] text-[10px] font-mono font-medium flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          ) : (
            <Link
              href="/catalog?cart=open"
              className={`relative px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-normal flex items-center gap-1.5 shadow-xs transition-all ${
                isDark
                  ? 'bg-white hover:bg-[#F0F4E8] border border-white/30 text-[#20231B]'
                  : 'bg-white hover:bg-[#F0F4E8] border border-[#E2E7D8] text-[#20231B]'
              }`}
              title="Shopping Bag"
            >
              <ShoppingCart className={`w-3.5 h-3.5 ${isDark ? 'text-[#34451D]' : 'text-[#596B32]'}`} />
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span className="h-4 min-w-[16px] px-1 rounded-full bg-[#B7D85A] text-[#20231B] text-[10px] font-mono font-medium flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Account Chip or Sign In */}
          {customer ? (
            <Link
              href={(customer as any).dashboardPath || '/account'}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium shadow-xs transition-all ${
                isDark
                  ? 'bg-white hover:bg-[#F0F4E8] text-[#20231B] border border-white/30'
                  : 'bg-[#34451D] hover:bg-[#20231B] text-white'
              }`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                isDark ? 'bg-[#34451D]/15' : 'bg-white/20'
              }`}>
                <User className={`w-2.5 h-2.5 ${isDark ? 'text-[#34451D]' : 'text-[#B7D85A]'}`} />
              </div>
              <span className="max-w-[80px] sm:max-w-none truncate">{displayName}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium shadow-xs transition-all ${
                isDark
                  ? 'bg-white hover:bg-[#F0F4E8] text-[#20231B] border border-white/30'
                  : 'bg-[#34451D] hover:bg-[#20231B] text-white'
              }`}
            >
              <span>Sign in</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={`md:hidden p-1.5 rounded-full transition-colors ${
              isDark
                ? 'text-white hover:bg-white/15'
                : 'text-[#596B32] hover:bg-[#F0F4E8]'
            }`}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className={`pointer-events-auto md:hidden mt-2 rounded-3xl p-4 shadow-xl space-y-2 animate-in fade-in duration-200 border ${
          isDark
            ? 'bg-[#20231B]/95 backdrop-blur-2xl border-white/15 text-white'
            : 'bg-white border-[#E2E7D8] text-[#20231B]'
        }`}>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`py-2 px-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? isDark 
                      ? 'bg-[#B7D85A] text-[#20231B] font-semibold' 
                      : 'bg-[#34451D] text-white font-semibold'
                    : isDark
                      ? 'text-white/85 hover:bg-white/10'
                      : 'text-[#20231B] hover:bg-[#F0F4E8]'
                }`}
              >
                {activeTab === item.id ? `• ${item.label}` : item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
