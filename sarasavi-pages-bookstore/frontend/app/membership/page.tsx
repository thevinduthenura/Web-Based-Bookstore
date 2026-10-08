'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';
import { printMembershipInvoice } from '@/lib/invoice-pdf';
import { 
  formatAndLimitPhone, 
  handlePhoneKeyDown,
  formatAndLimitCardNumber, 
  formatAndLimitCardExpiry, 
  limitCvv 
} from '@/lib/input-utils';
import { 
  Check, 
  Gift, 
  Copy, 
  CheckCheck, 
  AlertCircle, 
  ArrowLeft, 
  ArrowUpRight, 
  Download,
  MessageCircle,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  CreditCard,
  Crown,
  BookOpen,
  Truck,
  RotateCcw,
  Tag,
  Zap,
  Lock,
  Wifi,
  ChevronRight,
  Award,
  QrCode,
  Building2,
  Smartphone,
  Upload,
  FileCheck
} from 'lucide-react';
import { evaluatePromoCode } from '@/lib/promotions';

interface MembershipPlan {
  id: 'STARTER' | 'BASIC' | 'PREMIUM';
  tag: string;
  badge?: string;
  badgeType?: 'popular' | 'vip' | 'active';
  title: string;
  titleAccent: string;
  monthlyPrice: number;
  yearlyPrice: number;
  priceFormattedYearly: string;
  priceFormattedMonthly: string;
  discountPercentage: number;
  description: string;
  features: string[];
  ctaLabel: string;
  isPopular?: boolean;
}

const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'STARTER',
    tag: 'Starter Tier',
    title: 'sarasavi',
    titleAccent: 'starter',
    monthlyPrice: 0,
    yearlyPrice: 0,
    priceFormattedYearly: '0',
    priceFormattedMonthly: '0',
    discountPercentage: 0,
    description: 'Perfect for casual readers beginning their literary exploration at Sarasavi Pages.',
    features: [
      'Full Book & Stationery Catalog Access',
      'Standard Courier Delivery (3-5 business days)',
      'Order Tracking & Digital Order History',
      'Standard Customer Support via Chat & Email',
      'Community Book Reviews & Reader Ratings'
    ],
    ctaLabel: 'Current Free Tier'
  },
  {
    id: 'BASIC',
    tag: 'Pro Reader',
    badge: 'Most Popular',
    badgeType: 'popular',
    isPopular: true,
    title: 'reader',
    titleAccent: 'basic',
    monthlyPrice: 250,
    yearlyPrice: 1500,
    priceFormattedYearly: '1,500',
    priceFormattedMonthly: '250',
    discountPercentage: 10,
    description: 'The premier package for avid bookworms and enthusiastic literature patrons.',
    features: [
      '10% Storewide Discount on all books & stationery',
      'Exclusive Monthly Literary Salon & Book Club Invitations',
      'Priority 24h Express Courier Dispatch',
      'Extended 30-Day Hassle-Free Book Returns',
      'Curated Monthly Literary Digest & Staff Picks',
      'Digital Passes to Sarasavi Seasonal Book Festivals'
    ],
    ctaLabel: 'Select Reader Basic'
  },
  {
    id: 'PREMIUM',
    tag: 'VIP Collector',
    badge: 'VIP Elite',
    badgeType: 'vip',
    title: 'scholar',
    titleAccent: 'premium',
    monthlyPrice: 450,
    yearlyPrice: 3500,
    priceFormattedYearly: '3,500',
    priceFormattedMonthly: '450',
    discountPercentage: 20,
    description: 'Elite full-access privileges for dedicated scholars, collectors & true bibliophiles.',
    features: [
      '20% Storewide Discount on every book in store',
      'Free Unlimited Priority Express Courier Delivery islandwide',
      'VIP Author Signings & Private Literary Salon Evenings',
      'Dedicated 24/7 Personal Bibliophile Concierge',
      '2 Free Collectible Silk Bookmarks & Merchandise Monthly',
      'Guaranteed Early Access to Signed First Editions & Rare Prints'
    ],
    ctaLabel: 'Upgrade to Scholar VIP'
  }
];

export default function MembershipPage() {
  // Page Steps: 'plans' | 'checkout' | 'success'
  const [currentStep, setCurrentStep] = useState<'plans' | 'checkout' | 'success'>('plans');

  // Billing Cycle: 'yearly' | 'monthly'
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');

  // Customer state
  const [customer, setCustomer] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    membership: 'NONE' | 'STARTER' | 'BASIC' | 'PREMIUM';
    tier: string;
    isMember: boolean;
    referralCode?: string;
  } | null>(null);

  const [copiedReferral, setCopiedReferral] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan>(MEMBERSHIP_PLANS[2]); // Default Scholar VIP

  // Checkout form fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // Payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Sri Lankan Payment Gateway & Alternative Methods
  type MembershipPaymentMethod = 'CREDIT_CARD' | 'LANKA_QR' | 'BANK_TRANSFER' | 'HELA_PAY' | 'KOKO_PAY' | 'MINTPAY';
  const [paymentMethod, setPaymentMethod] = useState<MembershipPaymentMethod>('CREDIT_CARD');
  const [bankRefNo, setBankRefNo] = useState('');
  const [bankSlipName, setBankSlipName] = useState('');
  const [helaPayPhone, setHelaPayPhone] = useState('');
  const [kokoPhone, setKokoPhone] = useState('');
  const [mintpayPhone, setMintpayPhone] = useState('');
  const [qrVerified, setQrVerified] = useState(false);

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoAppliedCode, setPromoAppliedCode] = useState('');
  const [promoError, setPromoError] = useState('');

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Success state with activation info
  const [activatedInvoice, setActivatedInvoice] = useState<{
    invoiceNo: string;
    membershipId: string;
    plan: string;
    amount: number;
    date: string;
    holderName: string;
  } | null>(null);

  // Cancellation modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  // Admin authentication state & permissions
  const { user: authUser, isSuperAdmin, hasRole } = useAuth();
  const [adminUser, setAdminUser] = useState<any>(authUser);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // Interactive 3D Card tilt for success screen
  const successCardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    if (authUser) {
      setAdminUser(authUser);
    } else {
      try {
        const staffRaw = Cookies.get('sp_user') || (typeof window !== 'undefined' ? localStorage.getItem('sp_user') : null);
        if (staffRaw) setAdminUser(JSON.parse(staffRaw));
        else setAdminUser(null);
      } catch {
        setAdminUser(null);
      }
    }
  }, [authUser]);

  const canManageMembership = Boolean(
    (isSuperAdmin || hasRole?.('SUPER_ADMIN')) ||
    hasRole?.('ACCOUNT_ADMIN') ||
    (adminUser && (
      adminUser.role === 'SUPER_ADMIN' ||
      adminUser.role === 'ACCOUNT_ADMIN' ||
      adminUser.username === 'GunathilakaT1540' ||
      adminUser.username === 'GayathmiR3013' ||
      adminUser.username === 'admin'
    ))
  );

  const handleAdminGrantTier = (tier: 'STARTER' | 'BASIC' | 'PREMIUM') => {
    const updatedCust = {
      ...(customer || {
        id: 'CUST-8832',
        name: 'Active Reader',
        email: 'reader@sarasavipages.lk',
        phone: '0771234567',
        city: 'Colombo'
      }),
      membership: tier,
      tier: tier === 'PREMIUM' ? 'SCHOLAR' : tier === 'BASIC' ? 'READER' : 'STANDARD',
      isMember: tier !== 'STARTER'
    };
    setCustomer(updatedCust as any);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_customer', JSON.stringify(updatedCust));
      localStorage.setItem('sp_membership', tier);
      window.dispatchEvent(new Event('sp_customer_updated'));
    }
    setAdminToast(`Customer membership tier set to ${tier}!`);
    setTimeout(() => setAdminToast(null), 3500);
  };

  // Load customer info from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sp_customer');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomer({
          id: parsed.id || 'CUST-8832',
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          city: parsed.city || parsed.address || '',
          membership: parsed.membership || 'NONE',
          tier: parsed.tier || 'STANDARD',
          isMember: Boolean(parsed.isMember),
          referralCode: parsed.referralCode || `SP-${(parsed.name || 'READER').toUpperCase().replace(/\s+/g, '').slice(0, 8)}-C9A3`
        });

        if (parsed.name) {
          setFullName(parsed.name);
          setCardHolder(parsed.name.toUpperCase());
        }
        if (parsed.email) setEmailAddress(parsed.email);
        if (parsed.phone) setPhoneNumber(parsed.phone);
        if (parsed.address || parsed.city) setLocationCity(parsed.address || parsed.city);
      }
    } catch {
      // Fallback
    }
  }, []);

  // Handle plan select from grid -> go to Checkout
  const handleSelectPlan = (plan: MembershipPlan) => {
    if (plan.id === 'STARTER') return;
    setSelectedPlan(plan);
    setPromoDiscount(0);
    setPromoAppliedCode('');
    setPromoError('');
    setCurrentStep('checkout');
    setIsCardFlipped(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Copy referral code
  const handleCopyReferral = () => {
    const code = customer?.referralCode || 'SP-THEVINDU-C9A3';
    navigator.clipboard.writeText(code);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  // Calculate plan price based on billing cycle
  const currentPlanPrice = billingCycle === 'yearly' 
    ? selectedPlan.yearlyPrice 
    : selectedPlan.monthlyPrice;

  // Apply promo code
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const res = evaluatePromoCode(code, currentPlanPrice);
    if (!res.valid) {
      setPromoError(res.message);
      setPromoDiscount(0);
      setPromoAppliedCode('');
    } else {
      setPromoDiscount(res.discountAmount);
      setPromoAppliedCode(res.code);
    }
  };

  // Helper: formatted method name for invoices & receipts
  const getPaymentMethodDisplay = (amt: number) => {
    switch (paymentMethod) {
      case 'LANKA_QR':
        return 'LankaQR Instant Payment';
      case 'BANK_TRANSFER':
        return `Bank Transfer (Ref: ${bankRefNo.trim() || 'Direct Deposit'})`;
      case 'HELA_PAY':
        return `HelaPay Mobile (${helaPayPhone.trim() || 'Verified'})`;
      case 'KOKO_PAY':
        return `Koko Pay (3x Installments: LKR ${(amt / 3).toFixed(2)})`;
      case 'MINTPAY':
        return `Mintpay (3x Split: LKR ${(amt / 3).toFixed(2)})`;
      case 'CREDIT_CARD':
      default:
        return `Card ending in ${cardNumber.slice(-4) || '8832'}`;
    }
  };

  // Complete Payment and activate plan
  const handlePayAndActivate = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'BANK_TRANSFER' && !bankRefNo.trim()) {
      alert('Please enter your Bank Deposit Reference Number or Transaction ID.');
      return;
    }
    if (paymentMethod === 'HELA_PAY' && !helaPayPhone.trim()) {
      alert('Please enter your HelaPay Registered Mobile Number.');
      return;
    }
    if (paymentMethod === 'KOKO_PAY' && !kokoPhone.trim()) {
      alert('Please enter your Koko Pay Mobile Number.');
      return;
    }
    if (paymentMethod === 'MINTPAY' && !mintpayPhone.trim()) {
      alert('Please enter your Mintpay Registered Mobile Number.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const invoiceNo = `INV-MEM-${Math.floor(100000 + Math.random() * 900000)}`;
      const membershipId = `SP-MEM-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toLocaleString();
      const updatedMembership: 'BASIC' | 'PREMIUM' = selectedPlan.id === 'PREMIUM' ? 'PREMIUM' : 'BASIC';
      const updatedTier = selectedPlan.id === 'PREMIUM' ? 'SCHOLAR_PREMIUM' : 'READER_BASIC';
      const finalAmount = Math.max(0, currentPlanPrice - promoDiscount);
      const memberName = fullName || customer?.name || 'Valued Reader';
      const methodLabel = getPaymentMethodDisplay(finalAmount);

      const updatedCustomer = {
        id: customer?.id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: memberName,
        email: emailAddress || customer?.email || 'reader@sarasavipages.lk',
        phone: phoneNumber || customer?.phone || '',
        city: locationCity || customer?.city || '',
        membership: updatedMembership,
        tier: updatedTier,
        isMember: true,
        referralCode: customer?.referralCode || `SP-${memberName.toUpperCase().replace(/\s+/g, '').slice(0, 8)}-C9A3`
      };

      setCustomer(updatedCustomer);

      try {
        localStorage.setItem('sp_customer', JSON.stringify(updatedCustomer));
        localStorage.setItem('sp_membership', updatedMembership);
        const receipts = JSON.parse(localStorage.getItem(`sp_receipts_${updatedCustomer.id}`) || '[]');
        receipts.unshift({
          invoice: invoiceNo,
          date: now.split(',')[0],
          amount: finalAmount,
          plan: `${selectedPlan.title} ${selectedPlan.titleAccent}`.toUpperCase(),
          method: paymentMethod,
          paymentMethodDisplay: methodLabel,
          status: 'PAID'
        });
        localStorage.setItem(`sp_receipts_${updatedCustomer.id}`, JSON.stringify(receipts));
        window.dispatchEvent(new Event('sp_customer_updated'));
      } catch {
        // Ignore
      }

      setActivatedInvoice({
        invoiceNo,
        membershipId,
        plan: selectedPlan.id === 'PREMIUM' ? 'SCHOLAR VIP ELITE' : 'READER BASIC',
        amount: finalAmount,
        date: now,
        holderName: memberName
      });

      setIsProcessing(false);
      setCurrentStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1300);
  };

  // Download Invoice PDF
  const handleDownloadInvoice = () => {
    if (!activatedInvoice) return;
    printMembershipInvoice({
      invoiceNo: activatedInvoice.invoiceNo,
      date: activatedInvoice.date,
      customer: cardHolder || fullName || customer?.name || 'Member',
      email: emailAddress || customer?.email,
      phone: customer?.phone,
      customerId: customer?.id || 'CUST-8832',
      plan: activatedInvoice.plan,
      duration: billingCycle === 'yearly' ? '1 Year (12 Months Unlimited Access)' : '1 Month Subscription',
      price: currentPlanPrice,
      discount: promoDiscount,
      total: activatedInvoice.amount,
      paymentMethod: getPaymentMethodDisplay(activatedInvoice.amount),
    });
  };

  // Cancel subscription
  const handleConfirmCancel = () => {
    if (!customer) return;
    const downgraded = {
      ...customer,
      membership: 'NONE' as const,
      tier: 'STANDARD',
      isMember: false
    };
    setCustomer(downgraded);
    try {
      localStorage.setItem('sp_customer', JSON.stringify(downgraded));
      localStorage.setItem('sp_membership', 'STARTER');
      window.dispatchEvent(new Event('sp_customer_updated'));
    } catch {
      // Ignore
    }
    setIsCancelModalOpen(false);
    setCancelSuccessMsg('Your subscription has been cancelled. You are now on the free Sarasavi Starter plan.');
    setTimeout(() => setCancelSuccessMsg(''), 5000);
  };

  // Card brand detection helper
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (clean.startsWith('5')) return 'MASTERCARD';
    if (clean.startsWith('3')) return 'AMEX';
    return 'CREDIT CARD';
  };

  // Interactive mouse tilt for VIP card
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!successCardRef.current) return;
    const rect = successCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 12;
    const rotateX = -((y - centerY) / centerY) * 12;
    setTiltStyle({ rx: rotateX, ry: rotateY });
  };

  const handleCardMouseLeave = () => {
    setTiltStyle({ rx: 0, ry: 0 });
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#20231B] antialiased selection:bg-[#34451D] selection:text-white font-sans pb-28 relative overflow-hidden">
      
      {/* ── Custom Theme CSS for Realistic 3D Card & Confetti Animation (CineVault Ref) ── */}
      <style jsx global>{`
        /* 3D Card Flip in Checkout */
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }

        /* Float animation for VIP card in Success Step (Reference: CineVault) */
        @keyframes vipFloatAnimation {
          0%, 100% {
            transform: translateY(0px) rotateX(4deg) rotateY(-3deg);
          }
          50% {
            transform: translateY(-16px) rotateX(-3deg) rotateY(3deg);
          }
        }
        .animate-vip-float {
          animation: vipFloatAnimation 3.5s ease-in-out infinite;
        }

        /* Pulse glow behind VIP card */
        @keyframes vipPulseGlow {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.12);
          }
        }
        .animate-vip-pulse {
          animation: vipPulseGlow 2.8s ease-in-out infinite;
        }

        /* Holographic diagonal light sheen */
        @keyframes vipShineSheen {
          0% {
            transform: translateX(-160%) rotate(25deg);
          }
          30%, 100% {
            transform: translateX(240%) rotate(25deg);
          }
        }
        .animate-vip-shine {
          animation: vipShineSheen 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Confetti particle rain */
        @keyframes confettiFall {
          0% {
            transform: translateY(-30px) rotate(0deg) scale(0.8);
            opacity: 1;
          }
          85% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(340px) rotate(720deg) scale(1);
            opacity: 0;
          }
        }
        .confetti-item {
          position: absolute;
          width: 9px;
          height: 14px;
          border-radius: 2px;
          opacity: 0;
          animation-name: confettiFall;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-iteration-count: infinite;
        }
      `}</style>

      {/* ── Cohesive Floating Pill Header ─── */}
      <Navbar activeTab="membership" />

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: MEMBERSHIP PACKAGES & PRICING
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 'plans' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300 pt-2">
          
          {/* ── Live Admin Storefront Control Bar ── */}
          {canManageMembership && (
            <div className="bg-[#20231B] border border-[#34451D] p-4 sm:p-5 rounded-3xl shadow-lg text-[#F8F9F5]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#34451D] border border-[#596B32] flex items-center justify-center text-[#B7D85A] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#B7D85A] tracking-wider uppercase">
                        Account &amp; Membership Live Controls
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#34451D] text-[#E2E7D8] text-[10px] font-mono border border-[#596B32]">
                        {adminUser?.role?.replace('_', ' ') || 'ACCOUNT ADMIN'}
                      </span>
                    </div>
                    <p className="text-xs text-[#AAB58A] mt-0.5 font-light">
                      Grant reader subscriber privileges or simulate membership tiers live in realtime.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#AAB58A] font-mono mr-1">Assign Tier:</span>
                  <button
                    type="button"
                    onClick={() => handleAdminGrantTier('PREMIUM')}
                    className="px-3.5 py-1.5 rounded-full bg-[#B7D85A] text-[#20231B] hover:bg-white text-xs font-semibold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5 text-[#34451D]" />
                    <span>Grant Scholar (20%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminGrantTier('BASIC')}
                    className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#E2E7D8] text-xs font-medium border border-white/20 transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#B7D85A]" />
                    <span>Grant Basic (10%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminGrantTier('STARTER')}
                    className="px-3.5 py-1.5 rounded-full bg-red-950/40 hover:bg-red-900/40 text-red-300 text-xs font-medium border border-red-800/40 transition-all active:scale-95"
                  >
                    Reset Tier
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header Title Section with Sarasavi Brand Styling */}
          <div className="text-center space-y-3.5 pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#34451D]/10 border border-[#596B32]/30 text-[#34451D]">
              <Sparkles className="w-3.5 h-3.5 text-[#D96B27]" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em]">
                CHOOSE YOUR LITERARY PRIVILEGES
              </span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#20231B] tracking-tight font-light leading-tight">
              membership <span className="italic text-[#D96B27] font-normal">packages</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-[#596B32] max-w-xl mx-auto font-light leading-relaxed">
              Unlock the complete Sarasavi Pages experience with exclusive storewide discounts, complimentary priority courier delivery, and privileged collector perks.
            </p>

            {/* Annual vs Monthly Billing Toggle */}
            <div className="pt-4 flex items-center justify-center">
              <div className="bg-[#EAEFE2] p-1.5 rounded-full border border-[#DCE3D2] flex items-center gap-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-[#20231B] shadow-xs font-semibold'
                      : 'text-[#596B32] hover:text-[#20231B]'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    billingCycle === 'yearly'
                      ? 'bg-[#34451D] text-white shadow-xs font-semibold'
                      : 'text-[#596B32] hover:text-[#20231B]'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="bg-[#B7D85A] text-[#20231B] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tight">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Cancellation Notification Alert */}
          {cancelSuccessMsg && (
            <div className="max-w-xl mx-auto p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] text-xs text-[#20231B] flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-[#D96B27] shrink-0" />
              <span>{cancelSuccessMsg}</span>
            </div>
          )}

          {/* ── 3-CARD PRICING TIERS GRID ─────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-2">
            {MEMBERSHIP_PLANS.map((plan) => {
              const isCurrent = (plan.id === 'STARTER' && (!customer?.isMember || customer?.membership === 'NONE')) ||
                                (plan.id === customer?.membership);
              const isPopular = plan.isPopular;
              const isVip = plan.id === 'PREMIUM';
              const displayPrice = billingCycle === 'yearly' ? plan.priceFormattedYearly : plan.priceFormattedMonthly;
              const displayPeriod = plan.id === 'STARTER' ? '/forever' : (billingCycle === 'yearly' ? '/year' : '/month');

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-7 lg:p-8 flex flex-col justify-between transition-all duration-300 ${
                    isPopular
                      ? 'bg-[#26311A] text-white border-2 border-[#D96B27] shadow-[0_16px_45px_rgba(217,107,39,0.20)] hover:-translate-y-1.5'
                      : isVip
                      ? 'bg-gradient-to-b from-[#1C2413] via-[#212C16] to-[#171E0F] text-white border-2 border-[#596B32] shadow-[0_16px_45px_rgba(52,69,29,0.22)] hover:border-[#B7D85A] hover:-translate-y-1.5'
                      : 'bg-white text-[#20231B] border border-[#E2E7D8] shadow-sm hover:border-[#7F9148] hover:-translate-y-1'
                  }`}
                >
                  {/* Floating Badges */}
                  {isPopular && (
                    <div className="absolute -top-3.5 right-6">
                      <span className="bg-[#D96B27] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 font-mono">
                        <Zap className="w-3 h-3" /> Most Popular
                      </span>
                    </div>
                  )}

                  {isVip && (
                    <div className="absolute -top-3.5 right-6">
                      {isCurrent ? (
                        <span className="bg-[#B7D85A] text-[#20231B] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1 font-mono">
                          <Check className="w-3 h-3" /> ACTIVE PLAN
                        </span>
                      ) : (
                        <span className="bg-[#34451D] text-[#B7D85A] border border-[#596B32] text-[10px] font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3 text-[#B7D85A]" /> VIP Elite Pass
                        </span>
                      )}
                    </div>
                  )}

                  {/* Card Content Top */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-medium uppercase tracking-wider ${
                        isPopular || isVip ? 'text-[#B7D85A]' : 'text-[#596B32]'
                      }`}>
                        {plan.tag}
                      </span>
                      {isCurrent && !isVip && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F0F4E8] text-[#34451D] border border-[#E2E7D8] text-[10px] font-mono">
                          Current
                        </span>
                      )}
                    </div>

                    {/* Plan Heading */}
                    <h3 className={`font-serif text-2xl lg:text-3xl font-light tracking-tight ${
                      isPopular || isVip ? 'text-white' : 'text-[#20231B]'
                    }`}>
                      {plan.title} <span className="font-normal italic text-[#D96B27]">{plan.titleAccent}</span>
                    </h3>

                    {/* Price Display */}
                    <div className="flex items-baseline gap-1.5 pt-1 pb-1">
                      <span className={`text-xs font-mono font-normal ${isPopular || isVip ? 'text-[#DCE3D2]' : 'text-[#707365]'}`}>
                        LKR
                      </span>
                      <span className={`text-4xl sm:text-5xl font-serif font-light tracking-tight ${
                        isPopular || isVip ? 'text-white' : 'text-[#20231B]'
                      }`}>
                        {displayPrice}
                      </span>
                      <span className={`text-xs font-mono ${isPopular || isVip ? 'text-[#AAB58A]' : 'text-[#707365]'}`}>
                        {displayPeriod}
                      </span>
                    </div>

                    {plan.discountPercentage > 0 && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B7D85A]/20 border border-[#B7D85A]/30 text-[#B7D85A] text-[10px] font-mono font-semibold">
                        <Tag className="w-3 h-3" /> {plan.discountPercentage}% OFF ALL BOOKS STOREWIDE
                      </div>
                    )}

                    <p className={`text-xs leading-relaxed min-h-[38px] ${
                      isPopular || isVip ? 'text-[#E2E7D8]' : 'text-[#596B32]'
                    }`}>
                      {plan.description}
                    </p>

                    <div className={`h-px my-4 ${isPopular || isVip ? 'bg-white/10' : 'bg-[#E2E7D8]'}`} />

                    {/* Features List */}
                    <ul className="space-y-3 text-xs">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className={`flex items-start gap-2.5 ${
                          isPopular || isVip ? 'text-[#F8F9F5]' : 'text-[#20231B]'
                        }`}>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isPopular 
                              ? 'bg-[#D96B27]/25 text-[#D96B27]' 
                              : isVip 
                              ? 'bg-[#B7D85A]/25 text-[#B7D85A]' 
                              : 'bg-[#E4E7D2] text-[#34451D]'
                          }`}>
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span className="leading-tight font-light">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom CTA Button */}
                  <div className="pt-8">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-3.5 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] text-[#707365] font-medium text-xs tracking-wider uppercase cursor-default flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4 text-[#596B32]" />
                        <span>Active Membership</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full py-3.5 rounded-2xl font-semibold text-xs tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 ${
                          isPopular
                            ? 'bg-[#D96B27] hover:bg-[#E57A28] text-white shadow-[0_6px_24px_rgba(217,107,39,0.35)]'
                            : isVip
                            ? 'bg-[#B7D85A] hover:bg-[#C8E86B] text-[#20231B] shadow-[0_6px_24px_rgba(183,216,90,0.35)]'
                            : 'bg-[#34451D] hover:bg-[#20231B] text-white shadow-xs'
                        }`}
                      >
                        <span>{plan.ctaLabel}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── REFERRAL PROGRAM BANNER ────────────────────────────────── */}
          <div className="rounded-3xl border border-dashed border-[#D96B27]/60 bg-gradient-to-r from-white via-[#FCFDF9] to-[#F3F6ED] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-[#D96B27] shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D96B27]/15 border border-[#D96B27]/40 flex items-center justify-center shrink-0 text-[#D96B27]">
                <Gift className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xl text-[#20231B] font-light">
                  refer a fellow reader &amp; <span className="italic text-[#D96B27] font-normal">both save!</span>
                </h4>
                <p className="text-xs text-[#596B32] max-w-xl leading-relaxed font-light">
                  Share your personalized Sarasavi Pages referral invite with friends. When they activate any reader membership, both of you earn LKR 500 in book credits plus exclusive seasonal gifts!
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex flex-col items-start md:items-end gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#707365]">
                YOUR REFERRAL PASS:
              </span>
              <div className="flex items-center gap-2 w-full md:w-auto bg-white p-1.5 rounded-2xl border border-[#E2E7D8] shadow-xs">
                <span className="font-mono text-xs font-semibold text-[#20231B] px-3">
                  {customer?.referralCode || 'SP-THEVINDU-C9A3'}
                </span>
                <button
                  onClick={handleCopyReferral}
                  className="px-4 py-2 rounded-xl bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                >
                  {copiedReferral ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-[#B7D85A]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── SUBSCRIPTION CANCELLATION / DOWNGRADE SECTION ───────────── */}
          <div className="rounded-3xl border border-[#E8B8B8] bg-[#FFF5F5] p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1 text-center sm:text-left">
              <h5 className="font-serif text-sm font-medium text-[#B91C1C]">
                Need to cancel or pause your membership?
              </h5>
              <p className="text-xs text-[#991B1B] max-w-lg font-light">
                You will be downgraded to the free Sarasavi Starter plan. Your saved books, reviews, and reading history remain safely intact.
              </p>
            </div>

            <button
              onClick={() => setIsCancelModalOpen(true)}
              disabled={!customer?.isMember || customer?.membership === 'NONE'}
              className="px-5 py-2.5 rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 disabled:hover:bg-[#DC2626] text-white text-xs font-medium transition-all shadow-xs shrink-0 active:scale-95"
            >
              Cancel Subscription
            </button>
          </div>
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 2: FULL CHECKOUT & 3D INTERACTIVE CARD
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 'checkout' && (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300 pt-2">
          
          {/* Back to Plans Button */}
          <div>
            <button
              onClick={() => setCurrentStep('plans')}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#596B32] hover:text-[#20231B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Membership Packages</span>
            </button>
          </div>

          {/* Header Title */}
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-[#D96B27]">
              FINAL STEP • SECURE CHECKOUT
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#20231B] font-light">
              plan: <span className="font-normal italic text-[#D96B27]">{selectedPlan.title} {selectedPlan.titleAccent}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#596B32] font-light">
              Complete your member verification details below to activate immediate literary privileges.
            </p>
          </div>

          {/* Checkout Main Card */}
          <div className="rounded-3xl bg-white border border-[#E2E7D8] p-6 sm:p-10 shadow-lg">
            <form onSubmit={handlePayAndActivate} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Form Fields (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Personal Info Header */}
                <div className="flex items-center justify-between pb-1">
                  <h3 className="font-serif text-lg text-[#20231B] font-light">
                    subscriber details
                  </h3>
                  <span className="text-[10px] font-mono text-[#707365]">* All fields required</span>
                </div>

                {/* Personal Info Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1.5 tracking-wider">
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setCardHolder(e.target.value.toUpperCase());
                      }}
                      placeholder="e.g. Thevindu Thenura"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] focus:outline-none focus:border-[#34451D] focus:bg-white font-sans transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1.5 tracking-wider">
                      PHONE NUMBER *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={16}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(formatAndLimitPhone(e.target.value))}
                      onKeyDown={handlePhoneKeyDown}
                      placeholder="e.g. 077 123 4567"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] font-mono focus:outline-none focus:border-[#34451D] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1.5 tracking-wider">
                      DELIVERY CITY / ADDRESS *
                    </label>
                    <input
                      type="text"
                      required
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      placeholder="e.g. Colombo 07, Sri Lanka"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] focus:outline-none focus:border-[#34451D] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1.5 tracking-wider">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="e.g. thevindu@sarasavipages.lk"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] focus:outline-none focus:border-[#34451D] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="h-px bg-[#E2E7D8] my-2" />

                {/* ── Payment Method Selector Tabs ── */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-2 tracking-wider">
                      SELECT PAYMENT METHOD *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CREDIT_CARD')}
                        className={`p-2.5 rounded-2xl border text-xs font-medium transition-all flex items-center gap-2 ${
                          paymentMethod === 'CREDIT_CARD'
                            ? 'border-[#34451D] bg-[#34451D] text-white shadow-xs'
                            : 'border-[#E2E7D8] bg-[#F8F9F5] hover:bg-white text-[#20231B]'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 shrink-0" />
                        <span className="truncate">Card Payment</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('LANKA_QR')}
                        className={`p-2.5 rounded-2xl border text-xs font-medium transition-all flex items-center gap-2 ${
                          paymentMethod === 'LANKA_QR'
                            ? 'border-[#34451D] bg-[#34451D] text-white shadow-xs'
                            : 'border-[#E2E7D8] bg-[#F8F9F5] hover:bg-white text-[#20231B]'
                        }`}
                      >
                        <QrCode className="w-4 h-4 shrink-0 text-[#B7D85A]" />
                        <span className="truncate">LankaQR Scan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('BANK_TRANSFER')}
                        className={`p-2.5 rounded-2xl border text-xs font-medium transition-all flex items-center gap-2 ${
                          paymentMethod === 'BANK_TRANSFER'
                            ? 'border-[#34451D] bg-[#34451D] text-white shadow-xs'
                            : 'border-[#E2E7D8] bg-[#F8F9F5] hover:bg-white text-[#20231B]'
                        }`}
                      >
                        <Building2 className="w-4 h-4 shrink-0" />
                        <span className="truncate">Bank Transfer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('HELA_PAY')}
                        className={`p-2.5 rounded-2xl border text-xs font-medium transition-all flex items-center gap-2 ${
                          paymentMethod === 'HELA_PAY'
                            ? 'border-[#34451D] bg-[#34451D] text-white shadow-xs'
                            : 'border-[#E2E7D8] bg-[#F8F9F5] hover:bg-white text-[#20231B]'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 shrink-0 text-amber-400" />
                        <span className="truncate">HelaPay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('KOKO_PAY')}
                        className={`p-2.5 rounded-2xl border text-xs font-medium transition-all flex items-center gap-2 ${
                          paymentMethod === 'KOKO_PAY'
                            ? 'border-[#34451D] bg-[#34451D] text-white shadow-xs'
                            : 'border-[#E2E7D8] bg-[#F8F9F5] hover:bg-white text-[#20231B]'
                        }`}
                      >
                        <Zap className="w-4 h-4 shrink-0 text-amber-300" />
                        <span className="truncate">Koko (3x Split)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('MINTPAY')}
                        className={`p-2.5 rounded-2xl border text-xs font-medium transition-all flex items-center gap-2 ${
                          paymentMethod === 'MINTPAY'
                            ? 'border-[#34451D] bg-[#34451D] text-white shadow-xs'
                            : 'border-[#E2E7D8] bg-[#F8F9F5] hover:bg-white text-[#20231B]'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 shrink-0 text-[#B7D85A]" />
                        <span className="truncate">Mintpay</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. CREDIT/DEBIT CARD SUB-FORM */}
                  {paymentMethod === 'CREDIT_CARD' && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-sm font-medium text-[#20231B]">
                          Credit or Debit Card Details
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsCardFlipped(!isCardFlipped)}
                          className="text-[10px] font-mono text-[#D96B27] hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{isCardFlipped ? 'Show Front' : 'Flip to Back'}</span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1.5 tracking-wider">
                          CARD NUMBER *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatAndLimitCardNumber(e.target.value))}
                            onFocus={() => setIsCardFlipped(false)}
                            placeholder="•••• •••• •••• ••••"
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] font-mono focus:outline-none focus:border-[#34451D] focus:bg-white transition-all"
                          />
                          <CreditCard className="w-4 h-4 text-[#707365] absolute left-4 top-3.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1.5 tracking-wider">
                            EXPIRY DATE *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatAndLimitCardExpiry(e.target.value))}
                            onFocus={() => setIsCardFlipped(false)}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] font-mono focus:outline-none focus:border-[#34451D] focus:bg-white transition-all text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1.5 tracking-wider">
                            CVV / CVC *
                          </label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(limitCvv(e.target.value))}
                            onFocus={() => setIsCardFlipped(true)}
                            onBlur={() => setIsCardFlipped(false)}
                            placeholder="•••"
                            className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] font-mono focus:outline-none focus:border-[#34451D] focus:bg-white transition-all text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1.5 tracking-wider">
                          CARDHOLDER NAME *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          onFocus={() => setIsCardFlipped(false)}
                          placeholder="NAME ON CARD"
                          className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] font-mono focus:outline-none focus:border-[#34451D] focus:bg-white transition-all uppercase"
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. LANKAQR SCAN TO PAY SUB-FORM */}
                  {paymentMethod === 'LANKA_QR' && (
                    <div className="p-5 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E2E7D8] pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#34451D] text-[#B7D85A] flex items-center justify-center font-bold font-mono text-xs">
                            LQR
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-[#20231B] block">LankaQR Instant Mobile Pay</span>
                            <span className="text-[10px] text-[#596B32]">Certified CBSL National Standard</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#34451D] text-[#B7D85A] font-mono text-[10px] font-semibold">
                          0% Gateway Fee
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* Dynamic Stylized QR Representation */}
                        <div className="w-36 h-36 bg-white p-2.5 rounded-2xl border-2 border-[#34451D] shadow-md flex flex-col items-center justify-center shrink-0">
                          <svg className="w-full h-full text-[#34451D]" viewBox="0 0 100 100" fill="currentColor">
                            <rect x="10" y="10" width="24" height="24" rx="3" fill="#34451D" />
                            <rect x="15" y="15" width="14" height="14" rx="2" fill="white" />
                            <rect x="18" y="18" width="8" height="8" fill="#34451D" />

                            <rect x="66" y="10" width="24" height="24" rx="3" fill="#34451D" />
                            <rect x="71" y="15" width="14" height="14" rx="2" fill="white" />
                            <rect x="74" y="18" width="8" height="8" fill="#34451D" />

                            <rect x="10" y="66" width="24" height="24" rx="3" fill="#34451D" />
                            <rect x="15" y="71" width="14" height="14" rx="2" fill="white" />
                            <rect x="18" y="74" width="8" height="8" fill="#34451D" />

                            <circle cx="50" cy="50" r="7" fill="#B7D85A" />
                            <rect x="42" y="18" width="8" height="8" fill="#34451D" />
                            <rect x="52" y="28" width="8" height="8" fill="#596B32" />
                            <rect x="42" y="74" width="8" height="8" fill="#34451D" />
                            <rect x="52" y="64" width="8" height="8" fill="#596B32" />
                            <rect x="66" y="52" width="8" height="8" fill="#34451D" />
                            <rect x="76" y="66" width="8" height="8" fill="#34451D" />
                            <rect x="76" y="80" width="8" height="8" fill="#596B32" />
                          </svg>
                        </div>

                        <div className="text-xs space-y-1.5 flex-1">
                          <p className="font-semibold text-[#20231B]">How to complete payment:</p>
                          <ol className="list-decimal list-inside space-y-1 text-[#596B32] text-[11px]">
                            <li>Open any banking app (ComBank, BOC, Sampath, Flash, Genie, FriMi, SOLO).</li>
                            <li>Select <strong>Scan QR</strong> and scan the code.</li>
                            <li>Confirm payment of <strong>LKR {Math.max(0, currentPlanPrice - promoDiscount).toFixed(2)}</strong>.</li>
                          </ol>
                          <p className="font-mono text-[10px] text-[#707365] pt-1">
                            Ref: <strong>LQR-MEM-{Math.floor(100000 + Math.random() * 900000)}</strong>
                          </p>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-[#34451D] cursor-pointer pt-2 border-t border-[#E2E7D8]">
                        <input
                          type="checkbox"
                          checked={qrVerified}
                          onChange={(e) => setQrVerified(e.target.checked)}
                          className="rounded text-[#34451D] focus:ring-[#596B32] w-4 h-4"
                        />
                        <span>I have scanned and completed the LankaQR transaction.</span>
                      </label>
                    </div>
                  )}

                  {/* 3. BANK TRANSFER & SLIP UPLOAD SUB-FORM */}
                  {paymentMethod === 'BANK_TRANSFER' && (
                    <div className="p-5 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-[#20231B] mb-2">Sarasavi Pages Official Bank Accounts</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-3 bg-white rounded-xl border border-[#E2E7D8]">
                            <p className="font-semibold text-[#34451D]">Commercial Bank of Ceylon</p>
                            <p className="font-mono text-[#20231B]">A/C: 1002394829</p>
                            <p className="text-[#85887A]">Branch: Colombo Fort (Code 012)</p>
                            <p className="text-[#85887A]">Name: Sarasavi Pages Books Ltd</p>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-[#E2E7D8]">
                            <p className="font-semibold text-[#34451D]">Bank of Ceylon (BOC)</p>
                            <p className="font-mono text-[#20231B]">A/C: 8201948270</p>
                            <p className="text-[#85887A]">Branch: Corporate Branch (Code 001)</p>
                            <p className="text-[#85887A]">Name: Sarasavi Pages Books Ltd</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1">
                            BANK DEPOSIT REFERENCE / SLIP NUMBER *
                          </label>
                          <input
                            type="text"
                            required={paymentMethod === 'BANK_TRANSFER'}
                            value={bankRefNo}
                            onChange={(e) => setBankRefNo(e.target.value)}
                            placeholder="e.g. TXN9821034 or Slip #00492"
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E2E7D8] text-xs text-[#20231B] font-mono focus:outline-none focus:border-[#34451D]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1">
                            ATTACH PAYMENT SLIP / RECEIPT SCREENSHOT (OPTIONAL)
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="cursor-pointer px-4 py-2 rounded-xl bg-white border border-[#E2E7D8] text-xs text-[#34451D] hover:bg-[#F8F9F5] flex items-center gap-1.5 font-medium transition-colors shadow-xs">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{bankSlipName ? 'Change Slip' : 'Upload Deposit Slip'}</span>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setBankSlipName(file.name);
                                }}
                              />
                            </label>
                            {bankSlipName && (
                              <span className="text-[11px] font-mono text-[#596B32] flex items-center gap-1">
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>{bankSlipName}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. HELAPAY MOBILE WALLET SUB-FORM */}
                  {paymentMethod === 'HELA_PAY' && (
                    <div className="p-5 rounded-2xl bg-[#FFF9F2] border border-[#FCD9BD] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#FCD9BD] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-[#D96B27] text-white text-[10px] font-bold">
                            HelaPay
                          </span>
                          <span className="text-xs font-semibold text-[#20231B]">Sri Lanka Mobile Wallet</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#D96B27]">Instant Authorization</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#D96B27] font-semibold mb-1">
                          HELAPAY REGISTERED PHONE NUMBER *
                        </label>
                        <input
                          type="tel"
                          required={paymentMethod === 'HELA_PAY'}
                          value={helaPayPhone}
                          onChange={(e) => setHelaPayPhone(formatAndLimitPhone(e.target.value))}
                          onKeyDown={handlePhoneKeyDown}
                          placeholder="e.g. 077 123 4567"
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#FCD9BD] text-xs font-mono text-[#20231B] focus:outline-none focus:border-[#D96B27]"
                        />
                        <p className="text-[10px] text-[#85887A] mt-1">
                          You will receive a fast 1-click confirmation prompt on your HelaPay mobile app.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 5. KOKO PAY (3x INSTALLMENTS) SUB-FORM */}
                  {paymentMethod === 'KOKO_PAY' && (
                    <div className="p-5 rounded-2xl bg-[#F4F9F2] border border-[#CDE5C5] space-y-4">
                      <div className="flex items-center justify-between border-b border-[#CDE5C5] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#20231B] text-[#B7D85A] text-[10px] font-bold">
                            koko
                          </span>
                          <span className="text-xs font-semibold text-[#20231B]">Buy Now Pay Later · 0% Interest</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#596B32] font-semibold">3 Easy Monthly Payments</span>
                      </div>

                      {/* 3 Installments Plan Breakdown */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 bg-white rounded-xl border border-[#CDE5C5] space-y-0.5">
                          <span className="text-[9px] font-mono uppercase text-[#85887A] block">Due Today</span>
                          <span className="text-xs font-mono font-bold text-[#34451D] block">
                            LKR {((Math.max(0, currentPlanPrice - promoDiscount)) / 3).toFixed(2)}
                          </span>
                          <span className="text-[9px] text-emerald-600 font-medium">1st Installment</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-[#CDE5C5] space-y-0.5">
                          <span className="text-[9px] font-mono uppercase text-[#85887A] block">In 30 Days</span>
                          <span className="text-xs font-mono font-bold text-[#34451D] block">
                            LKR {((Math.max(0, currentPlanPrice - promoDiscount)) / 3).toFixed(2)}
                          </span>
                          <span className="text-[9px] text-[#85887A]">2nd Installment</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-[#CDE5C5] space-y-0.5">
                          <span className="text-[9px] font-mono uppercase text-[#85887A] block">In 60 Days</span>
                          <span className="text-xs font-mono font-bold text-[#34451D] block">
                            LKR {((Math.max(0, currentPlanPrice - promoDiscount)) / 3).toFixed(2)}
                          </span>
                          <span className="text-[9px] text-[#85887A]">3rd Installment</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1">
                          KOKO ACCOUNT MOBILE NUMBER *
                        </label>
                        <input
                          type="tel"
                          required={paymentMethod === 'KOKO_PAY'}
                          value={kokoPhone}
                          onChange={(e) => setKokoPhone(formatAndLimitPhone(e.target.value))}
                          onKeyDown={handlePhoneKeyDown}
                          placeholder="e.g. 077 123 4567"
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#CDE5C5] text-xs font-mono text-[#20231B] focus:outline-none focus:border-[#34451D]"
                        />
                      </div>
                    </div>
                  )}

                  {/* 6. MINTPAY (PAY IN 3) SUB-FORM */}
                  {paymentMethod === 'MINTPAY' && (
                    <div className="p-5 rounded-2xl bg-[#F0F8FF] border border-[#CCE3F5] space-y-4">
                      <div className="flex items-center justify-between border-b border-[#CCE3F5] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#0055FF] text-white text-[10px] font-bold">
                            Mintpay
                          </span>
                          <span className="text-xs font-semibold text-[#20231B]">Shop Now, Split in 3 · Zero Fees</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#0055FF] font-semibold">Debit or Credit Card</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2.5 bg-white rounded-xl border border-[#CCE3F5]">
                          <span className="text-[9px] font-mono text-[#85887A] block">Today (1/3)</span>
                          <span className="font-mono font-bold text-[#0055FF] block">
                            LKR {((Math.max(0, currentPlanPrice - promoDiscount)) / 3).toFixed(2)}
                          </span>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-[#CCE3F5]">
                          <span className="text-[9px] font-mono text-[#85887A] block">Month 1 (2/3)</span>
                          <span className="font-mono font-bold text-[#20231B] block">
                            LKR {((Math.max(0, currentPlanPrice - promoDiscount)) / 3).toFixed(2)}
                          </span>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-[#CCE3F5]">
                          <span className="text-[9px] font-mono text-[#85887A] block">Month 2 (3/3)</span>
                          <span className="font-mono font-bold text-[#20231B] block">
                            LKR {((Math.max(0, currentPlanPrice - promoDiscount)) / 3).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#0055FF] font-semibold mb-1">
                          MINTPAY REGISTERED MOBILE NUMBER *
                        </label>
                        <input
                          type="tel"
                          required={paymentMethod === 'MINTPAY'}
                          value={mintpayPhone}
                          onChange={(e) => setMintpayPhone(formatAndLimitPhone(e.target.value))}
                          onKeyDown={handlePhoneKeyDown}
                          placeholder="e.g. 077 123 4567"
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#CCE3F5] text-xs font-mono text-[#20231B] focus:outline-none focus:border-[#0055FF]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-[#E2E7D8] my-2" />

                {/* Promo Code Box */}
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-light text-[#20231B]">
                    promo code
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="TRY WELCOME20 OR SAVE500"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] font-mono focus:outline-none focus:border-[#34451D] focus:bg-white uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-5 py-2.5 rounded-xl bg-[#34451D] hover:bg-[#20231B] text-xs font-semibold text-white transition-all active:scale-95 shadow-xs"
                    >
                      Apply Code
                    </button>
                  </div>
                  {promoAppliedCode && (
                    <p className="text-[11px] text-[#596B32] font-semibold flex items-center gap-1 font-mono">
                      <Check className="w-3.5 h-3.5" /> Promo {promoAppliedCode} applied! -LKR {promoDiscount.toFixed(2)}
                    </p>
                  )}
                  {promoError && (
                    <p className="text-[11px] text-[#DC2626] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {promoError}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: 3D Virtual Card & Order Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* ── 3D FLIPPABLE VIRTUAL CARD (CineVault Ref with Sarasavi Theme) ── */}
                <div className="perspective-1000 w-full max-w-[340px] sm:max-w-[380px] mx-auto h-[215px]">
                  <div 
                    className={`w-full h-full relative preserve-3d transition-transform duration-700 ${
                      isCardFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* ── CARD FRONT ── */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#242E18] via-[#1A2212] to-[#11170B] border border-[#596B32]/60 p-6 shadow-2xl flex flex-col justify-between text-white backface-hidden overflow-hidden">
                      {/* Ambient Specular Sheen */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#B7D85A]/15 rounded-full blur-2xl pointer-events-none" />

                      {/* Header Row: Microchip, NFC & Brand */}
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          {/* 3D Realistic Gold Microchip */}
                          <div className="w-11 h-8 rounded bg-gradient-to-tr from-[#D4AF37] via-[#F7D070] to-[#996515] border border-[#B89628] shadow-inner relative flex items-center justify-center">
                            <div className="w-full h-[1px] bg-[#7A5200] absolute opacity-70" />
                            <div className="h-full w-[1px] bg-[#7A5200] absolute opacity-70" />
                            <div className="w-3 h-3 rounded-full border border-[#7A5200] opacity-60" />
                          </div>
                          {/* NFC Contactless waves */}
                          <Wifi className="w-4 h-4 text-[#DCE3D2]/70 rotate-90" />
                        </div>

                        <div className="text-right">
                          <span className="font-display text-[10px] tracking-widest text-[#B7D85A] uppercase block">
                            sarasavīpages
                          </span>
                          <span className="text-[9px] font-mono font-bold tracking-wider text-[#D96B27]">
                            {getCardBrand(cardNumber)}
                          </span>
                        </div>
                      </div>

                      {/* Card Number Row */}
                      <div className="py-1 relative z-10">
                        <p className="font-mono text-base sm:text-lg tracking-[0.2em] text-white font-medium drop-shadow-md">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </p>
                      </div>

                      {/* Card Bottom Row: Holder & Expiry */}
                      <div className="flex items-end justify-between text-[10px] font-mono relative z-10">
                        <div>
                          <span className="text-[#8E967D] block text-[8px] uppercase tracking-wider">
                            MEMBER HOLDER
                          </span>
                          <span className="text-white font-semibold tracking-wider uppercase text-xs truncate max-w-[170px] block">
                            {cardHolder || 'VALUED READER'}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[#8E967D] block text-[8px] uppercase tracking-wider">
                            EXPIRES
                          </span>
                          <span className="text-white font-semibold text-xs tracking-wider">
                            {cardExpiry || 'MM/YY'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── CARD BACK (Flipped View) ── */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#1A2212] via-[#141A0D] to-[#0A0D07] border border-[#596B32]/40 shadow-2xl flex flex-col justify-between text-white backface-hidden rotate-y-180 overflow-hidden">
                      {/* Magnetic Stripe */}
                      <div className="w-full h-10 bg-[#0c0c0c] mt-4 border-y border-black" />

                      {/* Signature Strip & CVV Area */}
                      <div className="px-6 space-y-1">
                        <div className="flex items-center justify-between text-[8px] font-mono text-[#8E967D]">
                          <span>AUTHORIZED SIGNATURE</span>
                          <span>CVV</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-1 h-8 bg-white/90 rounded-l flex items-center px-3">
                            <span className="font-serif italic text-xs text-[#20231B] opacity-70">
                              {cardHolder || 'Member Signature'}
                            </span>
                          </div>
                          <div className="w-14 h-8 bg-[#E2E7D8] rounded-r flex items-center justify-center font-mono font-bold text-xs text-[#20231B] tracking-widest border-l border-gray-300">
                            {cardCvv || '•••'}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Warning */}
                      <div className="px-6 pb-4 flex items-center justify-between text-[8px] font-mono text-[#8E967D]">
                        <span>SARASAVI LITERARY SOCIETY</span>
                        <div className="flex items-center gap-1 text-[#B7D85A]">
                          <Lock className="w-2.5 h-2.5" />
                          <span>256-BIT ENCRYPTED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── ORDER SUMMARY BOX ────────────────────────────── */}
                <div className="rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] p-5 space-y-3.5">
                  <h4 className="font-serif text-sm text-[#20231B] font-medium flex items-center justify-between">
                    <span>Order Summary</span>
                    <span className="text-[10px] font-mono text-[#596B32] uppercase">
                      {billingCycle === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}
                    </span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[#596B32]">
                      <span>Sarasavi {selectedPlan.title.toUpperCase()} {selectedPlan.titleAccent.toUpperCase()}</span>
                      <span className="font-mono text-[#20231B] font-semibold">LKR {currentPlanPrice.toFixed(2)}</span>
                    </div>

                    {promoDiscount > 0 && (
                      <div className="flex justify-between items-center text-[#596B32] font-semibold">
                        <span>Promo Code ({promoAppliedCode})</span>
                        <span className="font-mono text-[#DC2626]">- LKR {promoDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="h-px bg-[#E2E7D8] my-1" />

                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-sm font-semibold text-[#20231B]">Total Due Today</span>
                      <span className="font-mono text-xl font-bold text-[#D96B27]">
                        LKR {Math.max(0, currentPlanPrice - promoDiscount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pay & Activate Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-[#D96B27] hover:bg-[#E57A28] text-white font-semibold text-sm shadow-[0_8px_25px_rgba(217,107,39,0.35)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Activating Membership &amp; Generating Pass...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirm &amp; Activate {selectedPlan.titleAccent.toUpperCase()}</span>
                    </>
                  )}
                </button>

                {/* Direct WhatsApp Concierge Help */}
                <div className="text-center pt-1">
                  <a
                    href="https://wa.me/94770000000?text=Hi%20Sarasavi%20Pages%2C%20I%20need%20help%20with%20membership%20activation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-[#596B32] hover:text-[#20231B] font-medium transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Have questions? Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 3: SUCCESS & SPECTACULAR CARD ANIMATION (CINEVAULT REF)
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 'success' && activatedInvoice && (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8 pt-6 text-center animate-in fade-in duration-500">
          
          {/* ── CELEBRATION CONTAINER WITH FALLING CONFETTI ── */}
          <div className="relative w-full h-[320px] sm:h-[350px] flex items-center justify-center perspective-1000 overflow-visible">
            
            {/* Confetti Particles (CineVault inspiration with Sarasavi Colors: Gold, Lime, Amber, Emerald, Cream) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[
                { left: '10%', delay: '0s', dur: '3.2s', color: '#D4AF37' },
                { left: '18%', delay: '0.4s', dur: '2.8s', color: '#B7D85A' },
                { left: '26%', delay: '0.9s', dur: '3.5s', color: '#D96B27' },
                { left: '34%', delay: '0.2s', dur: '3.0s', color: '#596B32' },
                { left: '42%', delay: '0.7s', dur: '2.9s', color: '#D4AF37' },
                { left: '50%', delay: '0.1s', dur: '3.4s', color: '#F8F9F5' },
                { left: '58%', delay: '0.6s', dur: '3.1s', color: '#B7D85A' },
                { left: '66%', delay: '0.3s', dur: '2.7s', color: '#D96B27' },
                { left: '74%', delay: '0.8s', dur: '3.3s', color: '#596B32' },
                { left: '82%', delay: '0.5s', dur: '3.0s', color: '#D4AF37' },
                { left: '90%', delay: '1.0s', dur: '2.8s', color: '#B7D85A' },
                { left: '14%', delay: '1.4s', dur: '3.1s', color: '#D96B27' },
                { left: '22%', delay: '1.8s', dur: '2.9s', color: '#F8F9F5' },
                { left: '46%', delay: '1.6s', dur: '3.3s', color: '#B7D85A' },
                { left: '62%', delay: '1.2s', dur: '3.5s', color: '#D4AF37' },
                { left: '78%', delay: '1.7s', dur: '2.8s', color: '#596B32' },
                { left: '88%', delay: '1.5s', dur: '3.2s', color: '#D96B27' },
              ].map((c, i) => (
                <div
                  key={i}
                  className="confetti-item"
                  style={{
                    left: c.left,
                    top: '-20px',
                    backgroundColor: c.color,
                    animationDelay: c.delay,
                    animationDuration: c.dur,
                  }}
                />
              ))}
            </div>

            {/* ── GLOWING 3D FLOATING VIP MEMBERSHIP CARD ── */}
            <div 
              className="relative z-10 transition-transform duration-200 ease-out cursor-pointer"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${tiltStyle.rx}deg) rotateY(${tiltStyle.ry}deg)`,
              }}
            >
              {/* Radial Pulsing Aura Glow Behind the Card (CineVault pulse) */}
              <div className="absolute -inset-6 bg-[radial-gradient(ellipse_at_center,_rgba(183,216,90,0.5)_0%,_rgba(217,107,39,0.25)_45%,_transparent_70%)] rounded-3xl blur-2xl animate-vip-pulse pointer-events-none" />

              {/* Physical Floating VIP Card */}
              <div 
                ref={successCardRef}
                className="animate-vip-float w-[320px] sm:w-[380px] h-[195px] sm:h-[220px] rounded-3xl bg-gradient-to-br from-[#242E18] via-[#1A2212] to-[#10160B] border-2 border-[#B7D85A]/50 p-6 shadow-[0_25px_60px_rgba(52,69,29,0.45)] flex flex-col justify-between text-left relative overflow-hidden"
              >
                {/* Diagonal Holographic Sheen Sweep (CineVault shine animation) */}
                <div className="absolute -inset-full w-[250%] h-[250%] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-vip-shine" />

                {/* Top Row: Gold Microchip + Brand Laurel + NFC */}
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    {/* Metallic Gold Chip */}
                    <div className="w-12 h-9 rounded-md bg-gradient-to-tr from-[#D4AF37] via-[#FCE881] to-[#996515] border border-[#B89628] shadow-md relative flex items-center justify-center">
                      <div className="w-full h-[1px] bg-[#664300] absolute opacity-70" />
                      <div className="h-full w-[1px] bg-[#664300] absolute opacity-70" />
                      <div className="w-3.5 h-3.5 rounded-full border border-[#664300] opacity-60" />
                    </div>
                    <Wifi className="w-4 h-4 text-[#B7D85A] rotate-90 opacity-80" />
                  </div>

                  <div className="text-right">
                    <span className="font-display text-[11px] tracking-widest text-[#B7D85A] uppercase font-bold block">
                      sarasavīpages
                    </span>
                    <span className="text-[9px] font-mono text-[#DCE3D2]/70 tracking-wider">
                      LITERARY PATRON
                    </span>
                  </div>
                </div>

                {/* Middle Row: Embossed VIP Tier Name */}
                <div className="space-y-0.5 relative z-10">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#B7D85A]">
                    MEMBERSHIP STATUS: ACTIVE
                  </span>
                  <h4 className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#D96B27] uppercase drop-shadow-md">
                    {activatedInvoice.plan}
                  </h4>
                </div>

                {/* Bottom Row: Member Holder, ID & Holographic Seal */}
                <div className="flex items-end justify-between relative z-10 pt-1">
                  <div>
                    <span className="text-[#8E967D] block text-[8px] uppercase tracking-wider">
                      MEMBER NAME
                    </span>
                    <p className="font-mono text-xs sm:text-sm text-white font-semibold tracking-wide uppercase truncate max-w-[190px]">
                      {activatedInvoice.holderName}
                    </p>
                    <span className="text-[9px] font-mono text-[#DCE3D2]/60">
                      ID: {activatedInvoice.membershipId}
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#B7D85A]/30 to-[#D96B27]/40 border border-[#B7D85A]/60 flex items-center justify-center shadow-inner">
                      <Award className="w-5 h-5 text-[#B7D85A]" />
                    </div>
                    <span className="text-[8px] font-mono text-[#B7D85A] mt-1 uppercase">
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Heading Typography & Congratulations */}
          <div className="space-y-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B7D85A]/20 border border-[#B7D85A]/30 text-[#34451D] text-xs font-mono font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#596B32]" /> MEMBERSHIP SUCCESSFULLY ACTIVATED
            </span>
            
            <h1 className="font-serif text-3xl sm:text-5xl text-[#20231B] font-light">
              welcome to the <span className="italic text-[#D96B27] font-normal">elite circle!</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-[#596B32] max-w-lg mx-auto font-light leading-relaxed">
              Your <strong className="text-[#20231B] font-semibold">{activatedInvoice.plan}</strong> membership privileges are now live on your account. You have unlocked exclusive storewide discounts, complimentary priority courier delivery, and seasonal literary invitations.
            </p>
          </div>

          {/* Activated Benefits Checklist */}
          <div className="max-w-xl mx-auto rounded-2xl bg-white border border-[#E2E7D8] p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#B7D85A]/20 text-[#34451D] flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs text-[#20231B] font-medium">Storewide Discounts Active</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#B7D85A]/20 text-[#34451D] flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-xs text-[#20231B] font-medium">Priority Express Dispatch</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#B7D85A]/20 text-[#34451D] flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-xs text-[#20231B] font-medium">Concierge &amp; Salon Access</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/catalog"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#D96B27] hover:bg-[#E57A28] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_4px_24px_rgba(217,107,39,0.35)] active:scale-95 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Start Reading &amp; Browsing</span>
            </Link>

            <Link
              href="/account"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-[#F0F4E8] text-[#20231B] border border-[#E2E7D8] font-medium text-xs tracking-wider uppercase transition-all active:scale-95 shadow-xs flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-[#596B32]" />
              <span>View My Account</span>
            </Link>

            <button
              onClick={handleDownloadInvoice}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1E3A5F] hover:bg-[#2563EB] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Invoice PDF</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setCurrentStep('plans')}
              className="text-xs text-[#596B32] hover:text-[#20231B] underline font-medium"
            >
              Return to Membership Plans Overview
            </button>
          </div>
        </main>
      )}

      {/* ── CANCEL CONFIRMATION MODAL ───────────────────────────────── */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-rose-200 p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#B91C1C]">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#DC2626] shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-medium text-[#20231B]">Cancel Subscription?</h4>
            </div>
            <p className="text-xs text-[#596B32] leading-relaxed">
              Are you sure you wish to cancel your active membership? You will forfeit storewide discounts (10% - 20%), free priority delivery privileges, and VIP salon invites at the end of the current billing cycle.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E7D8]">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs text-[#596B32] hover:text-[#20231B] font-medium"
              >
                Keep My Membership
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-md transition-all active:scale-95"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Toast Notification ── */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#20231B] text-[#F8F9F5] px-5 py-3.5 rounded-2xl shadow-2xl border border-[#34451D] animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-[#B7D85A] shrink-0" />
          <span className="text-xs font-mono">{adminToast}</span>
          <button
            type="button"
            onClick={() => setAdminToast(null)}
            className="ml-2 text-[#AAB58A] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
