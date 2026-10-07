'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    }
    return Boolean(isDarkProp);
  });

  // Dynamic real-time underlying background detection
  useEffect(() => {
    const checkDarkness = () => {
      if (typeof window === 'undefined' || !headerRef.current) return;

      const rect = headerRef.current.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) return;

      const y = rect.top + rect.height / 2;
      const samplePoints = [
        rect.left + Math.min(80, rect.width * 0.15),
        rect.left + rect.width / 2,
        rect.right - Math.min(80, rect.width * 0.15)
      ];

      let darkCount = 0;
      let lightCount = 0;

      for (const x of samplePoints) {
        if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) continue;
        const elements = document.elementsFromPoint(x, y);

        let resolved = false;
        for (const el of elements) {
          if (!el || headerRef.current?.contains(el) || el === headerRef.current) continue;

          const htmlEl = el as HTMLElement;

          // 1. Explicit dark container classes
          const darkContainer = htmlEl.closest?.(
            '[class*="bg-[#20231B]"], [class*="bg-[#0E120A]"], [class*="bg-[#141811]"], [class*="bg-[#1C2610]"], [class*="bg-[#233014]"], [class*="bg-[#2F3F1B]"], [class*="bg-[#34451D]"], [class*="bg-black"], [class*="from-[#20231B]"], [class*="from-[#0E120A]"], [class*="bg-neutral-900"], [class*="bg-gray-900"]'
          );
          if (darkContainer) {
            darkCount++;
            resolved = true;
            break;
          }

          // 2. Explicit light container classes
          const lightContainer = htmlEl.closest?.(
            '[class*="bg-[#F8F9F5]"], [class*="bg-[#F0F4E8]"], [class*="bg-[#E2E7D8]"], [class*="bg-white"], [class*="bg-gray-50"], [class*="bg-stone-50"]'
          );

          // 3. Computed background color inspection
          let curr: HTMLElement | null = htmlEl;
          while (curr && curr !== document.body && curr !== document.documentElement) {
            const style = window.getComputedStyle(curr);
            const bg = parseRgb(style.backgroundColor);
            if (bg && bg.a > 0.35) {
              const lum = getLuminance(bg.r, bg.g, bg.b);
              if (lum < 0.48) {
                darkCount++;
              } else {
                lightCount++;
              }
              resolved = true;
              break;
            }
            curr = curr.parentElement;
          }
          if (resolved) break;

          // 4. White text strongly implies dark background
          const textStyle = window.getComputedStyle(htmlEl);
          const textColor = parseRgb(textStyle.color);
          if (textColor && textColor.a > 0.6 && !lightContainer) {
            const textLum = getLuminance(textColor.r, textColor.g, textColor.b);
            if (textLum > 0.8) {
              darkCount++;
              resolved = true;
              break;
            }
          }
        }

        if (!resolved) {
          // Check body or route fallback
          const bodyBg = parseRgb(window.getComputedStyle(document.body).backgroundColor);
          if (bodyBg && bodyBg.a > 0.35) {
            if (getLuminance(bodyBg.r, bodyBg.g, bodyBg.b) < 0.48) {
              darkCount++;
            } else {
              lightCount++;
            }
          }
        }
      }

      if (darkCount > 0 || lightCount > 0) {
        setIsDetectedDark(darkCount >= lightCount);
      } else {
        // Fallback: check pathname
        if (pathname?.includes('/about')) {
          setIsDetectedDark(true);
        } else if (isHomeHero && window.scrollY < 650) {
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
    const timer = setTimeout(handleUpdate, 60);

    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timer);
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [pathname, isHomeHero]);

  // Prop takes precedence if provided; otherwise uses automatic detection
  const isDark = isDarkProp !== undefined ? isDarkProp : isDetectedDark;

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
    <header 
      ref={headerRef}
      className={`sticky top-3 sm:top-4 z-40 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 transition-all ${
        isHomeHero ? '-mb-20 pointer-events-none' : 'mb-6'
      }`}
    >
      <div className={`pointer-events-auto backdrop-blur-2xl rounded-full h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 ${
        isDark
          ? 'bg-[#20231B]/75 border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
          : 'bg-white/95 border border-[#E2E7D8] shadow-[0_8px_32px_rgba(32,35,27,0.06)]'
      }`}>
        
        {/* Left: Brand Wordmark with Organic Dots */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group text-left shrink-0">
          <div className="flex items-center -space-x-1">
            <div className={`w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full ${isDark ? 'bg-white' : 'bg-[#34451D]'} group-hover:scale-110 transition-transform`} />
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#B7D85A] group-hover:scale-110 transition-transform" />
            <div className={`w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full ${isDark ? 'bg-[#DCE3D2]' : 'bg-[#596B32]'} group-hover:scale-110 transition-transform`} />
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
            <Globe className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#B7D85A]' : 'text-[#596B32]'}`} />
            <span>LKR</span>
            <ChevronDown className={`w-3 h-3 ${isDark ? 'text-white/80' : 'text-[#596B32]'}`} />
          </div>

          {/* Shopping Bag Button */}
          {onOpenBag ? (
            <button
              onClick={onOpenBag}
              className={`relative px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-normal flex items-center gap-1.5 shadow-xs transition-all ${
                isDark
                  ? 'bg-white hover:bg-[#F0F4E8] border border-white/40 text-[#20231B]'
                  : 'bg-white hover:bg-[#F0F4E8] border border-[#E2E7D8] text-[#20231B]'
              }`}
              title="Shopping Bag"
            >
              <ShoppingCart className={`w-3.5 h-3.5 ${isDark ? 'text-[#34451D]' : 'text-[#596B32]'}`} />
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
              className={`relative px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-normal flex items-center gap-1.5 shadow-xs transition-all ${
                isDark
                  ? 'bg-white hover:bg-[#F0F4E8] border border-white/40 text-[#20231B]'
                  : 'bg-white hover:bg-[#F0F4E8] border border-[#E2E7D8] text-[#20231B]'
              }`}
              title="Shopping Bag"
            >
              <ShoppingCart className={`w-3.5 h-3.5 ${isDark ? 'text-[#34451D]' : 'text-[#596B32]'}`} />
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
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium shadow-xs transition-all ${
                isDark
                  ? 'bg-white hover:bg-[#F0F4E8] text-[#20231B] border border-white/40 shadow-sm'
                  : 'bg-[#34451D] hover:bg-[#20231B] text-white shadow-xs'
              }`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                isDark ? 'bg-[#34451D]/15' : 'bg-white/20'
              }`}>
                <User className={`w-2.5 h-2.5 ${isDark ? 'text-[#34451D]' : 'text-[#B7D85A]'}`} />
              </div>
              <span className="max-w-[80px] sm:max-w-none truncate font-medium">{displayName}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium shadow-xs transition-all ${
                isDark
                  ? 'bg-white hover:bg-[#F0F4E8] text-[#20231B] border border-white/40 shadow-sm'
                  : 'bg-[#34451D] hover:bg-[#20231B] text-white shadow-xs'
              }`}
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

