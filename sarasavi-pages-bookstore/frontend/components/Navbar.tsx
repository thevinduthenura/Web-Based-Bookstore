'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { isCustomerDeactivatedLocally, isStaffDeactivatedLocally } from '@/hooks/useAuth';
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

// Helper: Parse rgb or rgba string to numeric RGBA components
function parseRgb(colorStr: string): { r: number; g: number; b: number; a: number } | null {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'inherit') return null;
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    };
  }
  return null;
}

// Helper: Compute perceived luminance (0 to 1)
function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Helper: Inspect element or ancestors for visible background luminance
function inspectElementLuminance(el: HTMLElement): 'dark' | 'light' | null {
  let curr: HTMLElement | null = el;
  while (curr && curr !== document.documentElement) {
    const classStr = curr.className || '';
    if (typeof classStr === 'string' && classStr.length > 0) {
      // 1. Explicit light container classes (cards, sections, panels, backgrounds)
      if (
        classStr.includes('bg-white') ||
        classStr.includes('bg-[#F8F9F5]') ||
        classStr.includes('bg-[#F0F4E8]') ||
        classStr.includes('bg-[#E2E7D8]') ||
        classStr.includes('bg-[#EBF0E4]') ||
        classStr.includes('bg-[#DCE3D2]') ||
        classStr.includes('bg-gray-50') ||
        classStr.includes('bg-stone-50') ||
        classStr.includes('bg-neutral-50')
      ) {
        return 'light';
      }

      // 2. Explicit dark container classes
      if (
        classStr.includes('bg-[#20231B]') ||
        classStr.includes('bg-[#0E120A]') ||
        classStr.includes('bg-[#141811]') ||
        classStr.includes('bg-[#1C2610]') ||
        classStr.includes('bg-[#233014]') ||
        classStr.includes('bg-[#2F3F1B]') ||
        classStr.includes('bg-[#34451D]') ||
        classStr.includes('bg-[#18220D]') ||
        classStr.includes('bg-black') ||
        classStr.includes('from-[#20231B]') ||
        classStr.includes('from-[#0E120A]') ||
        classStr.includes('from-[#1C2610]') ||
        classStr.includes('from-[#34451D]') ||
        classStr.includes('bg-neutral-900') ||
        classStr.includes('bg-neutral-950') ||
        classStr.includes('bg-gray-900') ||
        classStr.includes('bg-gray-950')
      ) {
        return 'dark';
      }
    }

    const style = window.getComputedStyle(curr);
    const bg = parseRgb(style.backgroundColor);
    if (bg && bg.a > 0.35) {
      const lum = getLuminance(bg.r, bg.g, bg.b);
      return lum < 0.5 ? 'dark' : 'light';
    }

    // Direct text color check
    const text = curr.textContent?.trim();
    if (text && text.length > 0) {
      const textColor = parseRgb(style.color);
      if (textColor && textColor.a > 0.6) {
        const textLum = getLuminance(textColor.r, textColor.g, textColor.b);
        if (textLum > 0.82) {
          return 'dark';
        }
        if (textLum < 0.25) {
          return 'light';
        }
      }
    }

    curr = curr.parentElement;
  }
  return null;
}

export default function Navbar({ 
  activeTab = 'home', 
  onOpenBag, 
  isHomeHero = false,
  isDark: isDarkProp
}: NavbarProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  const [customer, setCustomer] = useState<{ id?: string; name?: string; email?: string } | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDetectedDark, setIsDetectedDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.includes('/about')) return true;
      if (window.location.pathname === '/' && window.scrollY === 0) return true;
    }
    return Boolean(isDarkProp);
  });

  // Dynamic real-time underlying background detection (iOS-style adaptive luminance)
  useEffect(() => {
    const checkDarkness = () => {
      if (typeof window === 'undefined' || !headerRef.current) return;

      const rect = headerRef.current.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) return;

      const samplePoints = [
        { x: rect.left + Math.min(80, rect.width * 0.15), y: rect.top + rect.height / 2 },
        { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        { x: rect.right - Math.min(80, rect.width * 0.15), y: rect.top + rect.height / 2 },
        { x: rect.left + Math.min(80, rect.width * 0.15), y: rect.bottom + 12 },
        { x: rect.right - Math.min(80, rect.width * 0.15), y: rect.bottom + 12 }
      ];

      let darkCount = 0;
      let lightCount = 0;

      for (const pt of samplePoints) {
        if (pt.x < 0 || pt.x > window.innerWidth || pt.y < 0 || pt.y > window.innerHeight) continue;
        const elements = document.elementsFromPoint(pt.x, pt.y);

        for (const el of elements) {
          if (!el || headerRef.current?.contains(el) || el === headerRef.current) continue;

          const res = inspectElementLuminance(el as HTMLElement);
          if (res === 'dark') {
            darkCount++;
            break;
          } else if (res === 'light') {
            lightCount++;
            break;
          }
        }
      }

      if (darkCount > 0 || lightCount > 0) {
        setIsDetectedDark(darkCount > lightCount);
      } else {
        if (pathname?.includes('/about')) {
          setIsDetectedDark(true);
        } else if (pathname === '/' && window.scrollY < 200) {
          setIsDetectedDark(true);
        } else {
          setIsDetectedDark(false);
        }
      }
    };

    let rafId: number | null = null;
    const handleUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(checkDarkness);
    };

    handleUpdate();
    const timer = setTimeout(handleUpdate, 50);

    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timer);
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [pathname]);

  // Prop takes precedence if provided; otherwise uses automatic detection
  const isDark = isDarkProp !== undefined ? isDarkProp : isDetectedDark;

  useEffect(() => {
    // 1. Read logged-in user from cookies or localStorage (Staff takes precedence)
    const loadCustomer = () => {
      try {
        // Check active staff session first
        const staffRaw = Cookies.get('sp_user') || (typeof window !== 'undefined' ? localStorage.getItem('sp_user') : null);
        if (staffRaw) {
          const parsed = JSON.parse(staffRaw);
          if (isStaffDeactivatedLocally(parsed.username || parsed.email || parsed.employeeId || '').isDeactivated) {
            Cookies.remove('sp_user', { path: '/' });
            Cookies.remove('sp_token', { path: '/' });
            if (typeof window !== 'undefined') {
              localStorage.removeItem('sp_user');
              localStorage.removeItem('sp_token');
            }
            setCustomer(null);
            return;
          }

          setCustomer({ 
            id: parsed.username || 'admin', 
            name: parsed.fullName || parsed.username || 'Admin',
            isStaff: true,
            role: parsed.role,
            dashboardPath: parsed.dashboardPath || '/admin/dashboard'
          } as any);
          return;
        }

        // If no staff session, check customer session
        const custRaw = Cookies.get('sp_customer') || (typeof window !== 'undefined' ? localStorage.getItem('sp_customer') : null);
        if (custRaw) {
          const parsed = JSON.parse(custRaw);
          if (isCustomerDeactivatedLocally(parsed.customerId || parsed.email || '').isDeactivated) {
            Cookies.remove('sp_customer', { path: '/' });
            if (typeof window !== 'undefined') {
              localStorage.removeItem('sp_customer');
            }
            setCustomer(null);
            return;
          }

          setCustomer(parsed);
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
    window.addEventListener('sp_user_updated', loadCustomer);

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('sp_cart_updated', updateCount);
      window.removeEventListener('sp_customer_updated', loadCustomer);
      window.removeEventListener('sp_user_updated', loadCustomer);
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
    <header 
      ref={headerRef}
      className={`sticky top-3 sm:top-4 z-40 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 transition-all ${
        isHomeHero ? '-mb-20 pointer-events-none' : 'mb-6'
      }`}
    >
      <div className="pointer-events-auto bg-white/92 backdrop-blur-xl border border-[#E2E7D8] shadow-[0_8px_32px_rgba(32,35,27,0.05)] rounded-full h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-all">
        
        {/* Left: Brand Wordmark with Organic Dots */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group text-left shrink-0">
          <div className="flex items-center -space-x-1">
            <div className={`w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full ${isDark ? 'bg-white' : 'bg-[#34451D]'} transition-colors duration-200 group-hover:scale-110`} />
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#B7D85A] group-hover:scale-110 transition-transform" />
            <div className={`w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full ${isDark ? 'bg-[#DCE3D2]' : 'bg-[#596B32]'} transition-colors duration-200 group-hover:scale-110`} />
          </div>
          <span className="font-display text-base sm:text-lg tracking-tight">
            <span className={`font-medium transition-colors duration-200 ${isDark ? 'text-white' : 'text-[#20231B]'}`}>
              sarasavi
            </span>
            <span className={`font-light transition-colors duration-200 ${isDark ? 'text-[#B7D85A]' : 'text-[#596B32]'}`}>
              pages
            </span>
          </span>
        </Link>

        {/* Center: Healium Pill Navigation */}
        <nav className="hidden md:flex items-center rounded-full p-1 bg-[#F0F4E8] border border-[#E2E7D8] gap-1 text-xs">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`relative px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#34451D] text-white shadow-xs font-semibold'
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
          <div className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            isDark 
              ? 'text-white hover:bg-white/10' 
              : 'text-[#596B32] hover:text-[#20231B] hover:bg-[#F0F4E8]'
          }`}>
            <Globe className={`w-3.5 h-3.5 shrink-0 transition-colors duration-200 ${isDark ? 'text-[#B7D85A]' : 'text-[#596B32]'}`} />
            <span className={`transition-colors duration-200 ${isDark ? 'text-white' : 'text-[#596B32]'}`}>LKR</span>
            <ChevronDown className={`w-3 h-3 transition-colors duration-200 ${isDark ? 'text-white/80' : 'text-[#596B32]'}`} />
          </div>

          {/* Shopping Bag Button */}
          {onOpenBag ? (
            <button
              onClick={onOpenBag}
              className="relative px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white border border-[#E2E7D8] text-[#20231B] hover:bg-[#F0F4E8] shadow-xs text-xs font-normal flex items-center gap-1.5 transition-all"
              title="Shopping Bag"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#596B32]" />
              <span className="hidden sm:inline font-medium">Bag</span>
              {cartCount > 0 && (
                <span className="h-4 min-w-[16px] px-1 rounded-full bg-[#B7D85A] text-[#20231B] text-[10px] font-mono font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          ) : (
            <Link
              href="/catalog?cart=open"
              className="relative px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white border border-[#E2E7D8] text-[#20231B] hover:bg-[#F0F4E8] shadow-xs text-xs font-normal flex items-center gap-1.5 transition-all"
              title="Shopping Bag"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#596B32]" />
              <span className="hidden sm:inline font-medium">Bag</span>
              {cartCount > 0 && (
                <span className="h-4 min-w-[16px] px-1 rounded-full bg-[#B7D85A] text-[#20231B] text-[10px] font-mono font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Account Chip or Sign In */}
          {customer ? (
            <Link
              href={(customer as any).dashboardPath || '/account'}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-xs transition-all"
            >
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-2.5 h-2.5 text-[#B7D85A]" />
              </div>
              <span className="max-w-[120px] sm:max-w-none truncate font-medium flex items-center gap-1.5">
                {(customer as any).isStaff && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#B7D85A] text-[#20231B] text-[9px] font-bold uppercase tracking-wider">
                    Staff
                  </span>
                )}
                <span>{displayName}</span>
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-xs transition-all"
            >
              <span className="font-medium">Sign in</span>
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
        <div className="pointer-events-auto md:hidden mt-2 bg-white border border-[#E2E7D8] rounded-3xl p-4 shadow-xl space-y-2 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`py-2 px-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-[#34451D] text-white font-semibold'
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

