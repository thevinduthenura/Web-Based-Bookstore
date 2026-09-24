'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
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
  Sparkles
} from 'lucide-react';

interface MembershipPlan {
  id: 'STARTER' | 'BASIC' | 'PREMIUM';
  tag: string;
  badge?: string;
  badgeType?: 'popular' | 'vip' | 'active';
  title: string;
  titleAccent: string;
  monthlyPrice: number;
  yearlyPrice: number;
  priceFormatted: string;
  period: string;
  description: string;
  features: string[];
  ctaLabel: string;
  isPopular?: boolean;
}

const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'STARTER',
    tag: 'Basic',
    title: 'sarasavi',
    titleAccent: 'starter',
    monthlyPrice: 0,
    yearlyPrice: 0,
    priceFormatted: '0',
    period: '/mo',
    description: 'Perfect for casual readers who want to explore our literary catalog.',
    features: [
      'Standard Book Catalog Access',
      'Regular Delivery (3-5 business days)',
      'Order History & Tracking',
      'Standard Customer Support',
      'Public Reviews & Ratings Access'
    ],
    ctaLabel: 'Current Plan'
  },
  {
    id: 'BASIC',
    tag: 'Pro',
    badge: 'Most Popular',
    badgeType: 'popular',
    isPopular: true,
    title: 'reader',
    titleAccent: 'basic',
    monthlyPrice: 250,
    yearlyPrice: 1500,
    priceFormatted: '1,500',
    period: '/yr',
    description: 'The essential package for avid readers and passionate literature lovers.',
    features: [
      '10% Storewide Discount on all books',
      'Exclusive Monthly Literary Club Invitations',
      'Priority Courier Dispatch (24h)',
      'Extended 30-Day Returns Policy',
      'Monthly Curated Recommendation Digest',
      'Seasonal Book Fair Digital Passes'
    ],
    ctaLabel: 'Go Reader Basic'
  },
  {
    id: 'PREMIUM',
    tag: 'VIP',
    badge: 'VIP Elite',
    badgeType: 'vip',
    title: 'scholar',
    titleAccent: 'premium',
    monthlyPrice: 450,
    yearlyPrice: 3500,
    priceFormatted: '3,500',
    period: '/yr',
    description: 'Exclusive full-access privileges for true bibliophiles, collectors & scholars.',
    features: [
      '20% Storewide Discount on every book',
      'Free Unlimited Priority Courier Delivery',
      'Invitations to Author Signings & Private Readings',
      '24/7 Dedicated Concierge Support',
      '2 Free Collectible Bookmarks & Merch Monthly',
      'Guaranteed Early Access to Signed First Editions'
    ],
    ctaLabel: 'Upgrade to Scholar'
  }
];

export default function MembershipPage() {
  // Page Steps: 'plans' | 'checkout' | 'success'
  const [currentStep, setCurrentStep] = useState<'plans' | 'checkout' | 'success'>('plans');

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
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan>(MEMBERSHIP_PLANS[2]); // Default Scholar Premium

  // Checkout form fields - Empty by default for new input
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoAppliedCode, setPromoAppliedCode] = useState('');
  const [promoError, setPromoError] = useState('');

  // Payment processing
  const [isProcessing, setIsProcessing] = useState(false);

  // Success state
  const [activatedInvoice, setActivatedInvoice] = useState<{
    invoiceNo: string;
    plan: string;
    amount: number;
    date: string;
  } | null>(null);

  // Cancellation modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  // Load customer info from localStorage if logged in
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

        // Pre-fill user details only if already stored in customer account
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Copy referral code
  const handleCopyReferral = () => {
    const code = customer?.referralCode || 'SP-THEVINDU-C9A3';
    navigator.clipboard.writeText(code);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  // Apply promo code
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME20' || code === 'SARASAVI20') {
      const discount = Math.round(selectedPlan.yearlyPrice * 0.2);
      setPromoDiscount(discount);
      setPromoAppliedCode(code);
    } else if (code === 'SAVE500' || code === 'READ500') {
      const discount = 500;
      setPromoDiscount(discount);
      setPromoAppliedCode(code);
    } else {
      setPromoError('Invalid promo code. Try WELCOME20 or SAVE500');
    }
  };

  // Complete Payment and activate plan
  const handlePayAndActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const invoiceNo = `INV-MEM-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toLocaleString();
      const updatedMembership: 'BASIC' | 'PREMIUM' = selectedPlan.id === 'PREMIUM' ? 'PREMIUM' : 'BASIC';
      const updatedTier = selectedPlan.id === 'PREMIUM' ? 'SCHOLAR_PREMIUM' : 'READER_BASIC';
      const finalAmount = Math.max(0, selectedPlan.yearlyPrice - promoDiscount);

      const updatedCustomer = {
        id: customer?.id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: fullName || customer?.name || 'Valued Reader',
        email: emailAddress || customer?.email || 'reader@sarasavipages.lk',
        phone: phoneNumber || customer?.phone || '',
        city: locationCity || customer?.city || '',
        membership: updatedMembership,
        tier: updatedTier,
        isMember: true,
        referralCode: customer?.referralCode || `SP-${(fullName || 'READER').toUpperCase().slice(0, 8)}-C9A3`
      };

      setCustomer(updatedCustomer);

      try {
        localStorage.setItem('sp_customer', JSON.stringify(updatedCustomer));
        const receipts = JSON.parse(localStorage.getItem(`sp_receipts_${updatedCustomer.id}`) || '[]');
        receipts.unshift({
          invoice: invoiceNo,
          date: now.split(',')[0],
          amount: finalAmount,
          plan: `${selectedPlan.title} ${selectedPlan.titleAccent}`.toUpperCase(),
          method: 'CREDIT_CARD',
          status: 'PAID'
        });
        localStorage.setItem(`sp_receipts_${updatedCustomer.id}`, JSON.stringify(receipts));
      } catch {
        // Ignore
      }

      setActivatedInvoice({
        invoiceNo,
        plan: selectedPlan.id === 'PREMIUM' ? 'SCHOLAR PREMIUM' : 'READER BASIC',
        amount: finalAmount,
        date: now
      });

      setIsProcessing(false);
      setCurrentStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  // Download Invoice PDF/Text
  const handleDownloadInvoice = () => {
    if (!activatedInvoice) return;
    const content = `=====================================================
            SARASAVI PAGES (PVT) LTD
           OFFICIAL TAX INVOICE & RECEIPT
=====================================================
Invoice No:    ${activatedInvoice.invoiceNo}
Date / Time:   ${activatedInvoice.date}
Member ID:     ${customer?.id || 'CUST-8832'}
Cardholder:    ${cardHolder || fullName || 'Member'}
Email:         ${emailAddress}
Location:      ${locationCity}

PLAN SUBSCRIPTION:
Tier Plan:     SARASAVI ${activatedInvoice.plan}
Duration:      1 Year (12 Months Unlimited Access)
Status:        ACTIVE - FULL PRIVILEGES
Payment Mode:  Card ending in ${cardNumber.slice(-4) || '4444'}

FINANCIAL STATEMENT:
Base Plan:     LKR ${selectedPlan.yearlyPrice.toFixed(2)}
Promo Applied: -LKR ${promoDiscount.toFixed(2)} (${promoAppliedCode || 'None'})
VAT (0%):      LKR 0.00
-----------------------------------------------------
TOTAL PAID:    LKR ${activatedInvoice.amount.toFixed(2)}
=====================================================
Welcome to the Sarasavi Pages Elite Reading Circle!
Enjoy storewide member discounts, priority delivery, and book passes.
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activatedInvoice.invoiceNo}.txt`;
    link.click();
    URL.revokeObjectURL(url);
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
    } catch {
      // Ignore
    }
    setIsCancelModalOpen(false);
    setCancelSuccessMsg('Your subscription has been cancelled. You are now on the free Sarasavi Starter plan.');
    setTimeout(() => setCancelSuccessMsg(''), 5000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#20231B] antialiased selection:bg-[#34451D] selection:text-white font-sans pb-24">
      
      {/* ── Cohesive Floating Pill Header (Exact Sarasavi Pages Theme) ─── */}
      <Navbar activeTab="membership" />

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: MEMBERSHIP PACKAGES GRID (Screenshot 1 - Sarasavi Theme)
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 'plans' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-300">
          
          {/* Header Heading */}
          <div className="text-center space-y-3 pt-3">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#D96B27] block">
              CHOOSE YOUR EXPERIENCE
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#20231B] tracking-tight font-light">
              membership <span className="italic text-[#D96B27] font-normal">packages</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#6B705C] max-w-xl mx-auto font-light">
              Select the perfect plan to unlock the full potential of Sarasavi Pages with exclusive literary perks, storewide savings, and collector privileges.
            </p>
          </div>

          {/* Cancellation Notification Alert */}
          {cancelSuccessMsg && (
            <div className="max-w-xl mx-auto p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] text-xs text-[#20231B] flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-[#D96B27] shrink-0" />
              <span>{cancelSuccessMsg}</span>
            </div>
          )}

          {/* ── 3-CARD PRICING TIERS ──────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {MEMBERSHIP_PLANS.map((plan) => {
              const isCurrent = (plan.id === 'STARTER' && (!customer?.isMember || customer?.membership === 'NONE')) ||
                                (plan.id === customer?.membership);
              const isPopular = plan.isPopular;
              const isVip = plan.id === 'PREMIUM';

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                    isPopular
                      ? 'bg-[#2A351D] text-white border-2 border-[#D96B27] shadow-[0_12px_40px_rgba(217,107,39,0.18)] hover:-translate-y-1'
                      : isVip
                      ? 'bg-[#202B15] text-white border-2 border-[#596B32] shadow-[0_12px_40px_rgba(52,69,29,0.16)] hover:border-[#B7D85A] hover:-translate-y-1'
                      : 'bg-white text-[#20231B] border border-[#E2E7D8] shadow-sm hover:border-[#85887A]'
                  }`}
                >
                  {/* Most Popular Badge on Card 2 */}
                  {isPopular && (
                    <div className="absolute -top-3.5 right-6">
                      <span className="bg-[#D96B27] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* VIP Elite or ACTIVE Badge on Card 3 */}
                  {isVip && (
                    <div className="absolute -top-3.5 right-6">
                      {isCurrent ? (
                        <span className="bg-[#B7D85A] text-[#20231B] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1 font-mono">
                          <Check className="w-3 h-3" /> ACTIVE
                        </span>
                      ) : (
                        <span className="bg-[#34451D] text-[#B7D85A] border border-[#596B32] text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                          VIP Elite
                        </span>
                      )}
                    </div>
                  )}

                  {/* Top Section */}
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

                    {/* Title */}
                    <h3 className={`font-serif text-2xl font-light tracking-tight ${
                      isPopular || isVip ? 'text-white' : 'text-[#20231B]'
                    }`}>
                      {plan.title} <span className="font-normal italic text-[#D96B27]">{plan.titleAccent}</span>
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 pt-1 pb-2">
                      <span className={`text-xs font-mono font-normal ${isPopular || isVip ? 'text-[#E2E7D8]' : 'text-[#85887A]'}`}>LKR</span>
                      <span className={`text-4xl sm:text-5xl font-serif font-light tracking-tight ${
                        isPopular || isVip ? 'text-white' : 'text-[#20231B]'
                      }`}>
                        {plan.priceFormatted}
                      </span>
                      <span className={`text-xs font-mono ${isPopular || isVip ? 'text-[#AAB09A]' : 'text-[#85887A]'}`}>{plan.period}</span>
                    </div>

                    <p className={`text-xs leading-relaxed min-h-[36px] ${
                      isPopular || isVip ? 'text-[#E2E7D8]' : 'text-[#6B705C]'
                    }`}>
                      {plan.description}
                    </p>

                    <div className={`h-px my-4 ${isPopular || isVip ? 'bg-white/10' : 'bg-[#E2E7D8]'}`} />

                    {/* Feature Checklist */}
                    <ul className="space-y-3 text-xs">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className={`flex items-start gap-2.5 ${
                          isPopular || isVip ? 'text-[#F8F9F5]' : 'text-[#3D4335]'
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
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom CTA Button */}
                  <div className="pt-8">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] text-[#85887A] font-medium text-xs tracking-wider uppercase cursor-default flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4 text-[#596B32]" />
                        <span>Current Plan</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full py-3 rounded-2xl font-medium text-xs tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 ${
                          isPopular
                            ? 'bg-[#D96B27] hover:bg-[#E57A28] text-white font-semibold shadow-[0_4px_20px_rgba(217,107,39,0.3)]'
                            : isVip
                            ? 'bg-[#B7D85A] hover:bg-[#C8E86B] text-[#20231B] font-semibold shadow-[0_4px_20px_rgba(183,216,90,0.3)]'
                            : 'bg-[#34451D] hover:bg-[#20231B] text-white'
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

          {/* ── REFERRAL BANNER ────────────────────────────────────────── */}
          <div className="rounded-3xl border border-dashed border-[#D96B27]/70 bg-white/70 backdrop-blur-sm p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-[#D96B27] shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D96B27]/15 border border-[#D96B27]/40 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-[#D96B27]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-[#20231B] font-normal">
                  refer a fellow reader &amp; both save!
                </h4>
                <p className="text-xs text-[#6B705C] max-w-xl leading-relaxed font-light">
                  Share Sarasavi Pages with your friends. When they use your referral code during membership upgrade, both of you get special reader reward credits and exclusive collector gifts!
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex flex-col items-start md:items-end gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#85887A]">
                YOUR REFERRAL CODE:
              </span>
              <div className="flex items-center gap-2 w-full md:w-auto bg-white p-1.5 rounded-2xl border border-[#E2E7D8] shadow-xs">
                <span className="font-mono text-xs font-semibold text-[#20231B] px-3">
                  {customer?.referralCode || 'SP-THEVINDU-C9A3'}
                </span>
                <button
                  onClick={handleCopyReferral}
                  className="px-3.5 py-1.5 rounded-xl bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
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

          {/* ── CANCEL / DOWNGRADE SECTION ─────────────────────────────── */}
          <div className="rounded-3xl border border-[#E8B8B8] bg-[#FFF5F5] p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1 text-center sm:text-left">
              <h5 className="font-serif text-sm font-medium text-[#B91C1C]">
                Want to cancel your subscription?
              </h5>
              <p className="text-xs text-[#991B1B] max-w-lg font-light">
                You&apos;ll be downgraded to the free Sarasavi Starter plan. Your order history, bookmarks, and saved books won&apos;t be affected.
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
          STEP 2: FULL CHECKOUT & CONFIRMATION (Screenshot 2 - Sarasavi Theme)
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 'checkout' && (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
          
          {/* Back to Plans Button */}
          <div>
            <button
              onClick={() => setCurrentStep('plans')}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#596B32] hover:text-[#20231B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Plans</span>
            </button>
          </div>

          {/* Header Title */}
          <div className="text-center space-y-2">
            <h1 className="font-serif text-4xl sm:text-5xl text-[#20231B] font-light">
              plan: <span className="font-normal italic text-[#D96B27]">{selectedPlan.titleAccent}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#6B705C] font-light">
              Check your details below and confirm your subscription
            </p>
          </div>

          {/* Checkout Card */}
          <div className="rounded-3xl bg-white border border-[#E2E7D8] p-6 sm:p-10 shadow-lg">
            <form onSubmit={handlePayAndActivate} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form Fields (7 cols) - Clean and Editable */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Personal Info Grid */}
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
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +94 77 123 4567"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] font-mono focus:outline-none focus:border-[#34451D] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1.5 tracking-wider">
                      LOCATION / CITY *
                    </label>
                    <input
                      type="text"
                      required
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      placeholder="e.g. Colombo, Sri Lanka"
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
                      placeholder="e.g. thevindu@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] focus:outline-none focus:border-[#34451D] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="h-px bg-[#E2E7D8] my-2" />

                {/* Card Information Section */}
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-light text-[#20231B]">
                    card information
                  </h3>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1.5 tracking-wider">
                      CARD NUMBER *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                        setCardNumber(v);
                      }}
                      placeholder="•••• •••• •••• ••••"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] font-mono focus:outline-none focus:border-[#34451D] focus:bg-white transition-all"
                    />
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
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').replace(/(\d{2})/, '$1/').slice(0, 5);
                          setCardExpiry(v);
                        }}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] font-mono focus:outline-none focus:border-[#34451D] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#596B32] font-semibold mb-1.5 tracking-wider">
                        CVV *
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] font-mono focus:outline-none focus:border-[#34451D] focus:bg-white transition-all"
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
                      placeholder="NAME ON CARD"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] font-mono focus:outline-none focus:border-[#34451D] focus:bg-white transition-all uppercase"
                    />
                  </div>
                </div>

                <div className="h-px bg-[#E2E7D8] my-2" />

                {/* Promo Code Section */}
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-light text-[#20231B]">
                    promo code
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="E.G. WELCOME20"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder-[#9E9F94] font-mono focus:outline-none focus:border-[#34451D] focus:bg-white uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-5 py-2.5 rounded-xl bg-[#34451D] hover:bg-[#20231B] text-xs font-semibold text-white transition-all active:scale-95 shadow-xs"
                    >
                      Apply
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

              {/* Right Column: Live Credit Card & Order Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* ── REALISTIC CREDIT CARD GRAPHIC (Screenshot 2) ─── */}
                <div className="relative rounded-2xl bg-gradient-to-br from-[#242A1D] via-[#1B2114] to-[#12160C] border border-[#3E4A28] p-6 shadow-xl overflow-hidden aspect-[1.58/1] flex flex-col justify-between text-white">
                  {/* Subtle Card Glow / Shine */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#B7D85A]/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Top Row: Gold Chip & Card Type */}
                  <div className="flex items-center justify-between">
                    {/* Gold Microchip */}
                    <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-[#D4AF37] via-[#F7D070] to-[#AA820A] border border-[#B89628] shadow-inner relative flex items-center justify-center">
                      <div className="w-full h-[1px] bg-[#967406] absolute" />
                      <div className="h-full w-[1px] bg-[#967406] absolute" />
                    </div>

                    <span className="font-serif italic font-bold text-sm tracking-wider text-[#D96B27]">
                      CREDIT CARD
                    </span>
                  </div>

                  {/* Middle Row: Card Number */}
                  <div className="py-2">
                    <p className="font-mono text-lg sm:text-xl tracking-[0.18em] text-white font-light drop-shadow-sm">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </p>
                  </div>

                  {/* Bottom Row: Holder & Expiry */}
                  <div className="flex items-end justify-between text-[10px] font-mono">
                    <div>
                      <span className="text-[#8C937E] block text-[9px] uppercase tracking-wider">
                        CARD HOLDER
                      </span>
                      <span className="text-white font-semibold tracking-wider uppercase text-xs truncate max-w-[140px] block">
                        {cardHolder || 'YOUR NAME'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[#8C937E] block text-[9px] uppercase tracking-wider">
                        EXPIRES
                      </span>
                      <span className="text-white font-semibold text-xs tracking-wider">
                        {cardExpiry || 'MM/YY'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── ORDER SUMMARY BOX ────────────────────────────── */}
                <div className="rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] p-5 space-y-3.5">
                  <h4 className="font-serif text-sm text-[#20231B] font-medium">
                    Order Summary
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[#596B32]">
                      <span>Sarasavi {selectedPlan.title.toUpperCase()} {selectedPlan.titleAccent.toUpperCase()} Plan</span>
                      <span className="font-mono text-[#20231B] font-semibold">LKR {selectedPlan.yearlyPrice.toFixed(2)}</span>
                    </div>

                    {promoDiscount > 0 && (
                      <div className="flex justify-between items-center text-[#596B32] font-semibold">
                        <span>Promo Discount ({promoAppliedCode})</span>
                        <span className="font-mono">- LKR {promoDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="h-px bg-[#E2E7D8] my-1" />

                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-sm font-semibold text-[#20231B]">Total Due</span>
                      <span className="font-mono text-xl font-bold text-[#D96B27]">
                        LKR {Math.max(0, selectedPlan.yearlyPrice - promoDiscount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pay & Activate Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-[#D96B27] hover:bg-[#E57A28] text-white font-semibold text-sm shadow-[0_8px_25px_rgba(217,107,39,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Activating Membership...</span>
                    </>
                  ) : (
                    <span>Pay &amp; Activate Plan</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom WhatsApp Support Contact */}
          <div className="text-center space-y-2.5 pt-2">
            <span className="text-xs text-[#85887A] block">
              Or reach us directly via:
            </span>
            <a
              href="https://wa.me/94770000000?text=Hi%20Sarasavi%20Pages%2C%20I%20have%20a%20question%20regarding%20membership"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F452A] hover:bg-[#275735] text-[#78E298] text-xs font-semibold border border-[#356F45] transition-all shadow-md active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-[#78E298]" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 3: SUCCESS & ELITE CIRCLE SCREEN (Screenshot 3 - Sarasavi Theme)
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 'success' && activatedInvoice && (
        <main className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8 pt-8 text-center animate-in fade-in zoom-in-95 duration-400">
          
          {/* Glowing 3D Membership Card */}
          <div className="mx-auto w-72 sm:w-80 h-44 rounded-2xl bg-gradient-to-br from-[#242A1D] via-[#1B2114] to-[#12160C] border border-[#596B32] p-5 shadow-[0_20px_50px_rgba(52,69,29,0.3)] flex flex-col justify-between text-left relative overflow-hidden transition-transform hover:scale-105 duration-300">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#B7D85A]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between">
              {/* Gold Chip */}
              <div className="w-10 h-7 rounded bg-gradient-to-tr from-[#D4AF37] to-[#F7D070] border border-[#B89628] shadow-sm relative flex items-center justify-center">
                <div className="w-full h-[1px] bg-[#967406] absolute" />
                <div className="h-full w-[1px] bg-[#967406] absolute" />
              </div>
              <span className="text-[10px] font-display tracking-widest text-[#B7D85A] uppercase">
                sarasavīpages
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#D96B27] uppercase drop-shadow-sm">
                {activatedInvoice.plan}
              </h4>
              <p className="font-mono text-xs text-white tracking-wide">
                {cardHolder || fullName || customer?.name || 'Member'}
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3 pt-2">
            <h1 className="font-serif text-3xl sm:text-5xl text-[#20231B] font-light">
              welcome to the <span className="italic text-[#D96B27] font-normal">elite circle!</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#596B32] max-w-lg mx-auto font-light leading-relaxed">
              Your <strong className="text-[#20231B] font-semibold">{activatedInvoice.plan}</strong> membership is now active. You have unlocked storewide discounts, priority delivery, and exclusive literary passes.
            </p>
          </div>

          {/* Action Buttons (Screenshot 3) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/catalog"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#D96B27] hover:bg-[#E57A28] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_4px_24px_rgba(217,107,39,0.3)] active:scale-95"
            >
              Start Reading Now
            </Link>

            <Link
              href="/account"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-[#F0F4E8] text-[#20231B] border border-[#E2E7D8] font-medium text-xs tracking-wider uppercase transition-all active:scale-95 shadow-xs"
            >
              View My Plan
            </Link>

            <button
              onClick={handleDownloadInvoice}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Invoice PDF</span>
            </button>
          </div>
        </main>
      )}

      {/* ── CANCEL CONFIRMATION MODAL ───────────────────────────────── */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-rose-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#B91C1C]">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-serif text-lg font-medium text-[#20231B]">Cancel Membership?</h4>
            </div>
            <p className="text-xs text-[#596B32] leading-relaxed">
              Are you sure you want to cancel your active membership? You will lose storewide discounts (10% - 20%) and exclusive literary benefits. You will be placed on the Sarasavi Starter free plan.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E7D8]">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#596B32] hover:text-[#20231B]"
              >
                Keep My Plan
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-medium shadow-md transition-all active:scale-95"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
