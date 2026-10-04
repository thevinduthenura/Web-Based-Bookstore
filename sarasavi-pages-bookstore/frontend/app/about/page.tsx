'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const techStack = [
  { label: 'FRAMEWORK', value: 'Spring Boot 3.3', color: '#B7D85A' },
  { label: 'DATABASE', value: 'H2 / MS SQL Server', color: '#D97706' },
  { label: 'FRONTEND', value: 'Next.js 14 + TypeScript', color: '#60A5FA' },
  { label: 'LANGUAGE', value: 'Java 17 LTS', color: '#F87171' },
  { label: 'BUILD TOOL', value: 'Maven 3.9', color: '#A78BFA' },
  { label: 'RUNS ON', value: 'localhost:3000 / :8080', color: '#34D399' },
  { label: 'ARCHITECTURE', value: 'Modular Monolith (6 Modules)', color: '#FBBF24' },
  { label: 'SECURITY', value: 'Spring Security 6 + JWT', color: '#38BDF8' },
];

interface ModuleTeamMember {
  code: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  tags: string[];
  member: {
    name: string;
    initials: string;
    itNumber: string;
    email: string;
    badge?: string;
    isLead?: boolean;
    role: string;
  };
}

const integratedModules: ModuleTeamMember[] = [
  {
    code: 'M1',
    title: 'Admin & Staff Management',
    desc: 'Role-based access control (Super Admin, Order Manager, Payment Auditor, CS Rep, Inventory Manager) with session tracking, system diagnostics, and audit logs.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    tags: ['RBAC Security', 'Audit Logs', 'Staff Records', 'Super Admin'],
    member: {
      name: 'Gunathilaka H.D.T.T.',
      initials: 'GH',
      itNumber: 'IT25101540 – Level 5',
      email: 'gunathilaka@sarasavipages.lk',
      badge: 'PROJECT LEAD',
      isLead: true,
      role: 'Project Lead & Module Architect',
    },
  },
  {
    code: 'M2',
    title: 'Payment & Financial Gateway',
    desc: 'Multi-channel checkout engine supporting credit/debit cards, bank transfer slips, digital wallets, LKR price conversions, and tamper-proof receipts.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    tags: ['Card Gateway', 'Bank Slips', 'Audit Receipts', 'LKR Currency'],
    member: {
      name: 'Anaf M.K.A.S.',
      initials: 'AM',
      itNumber: 'IT25102345 – Level 5',
      email: 'anaf@sarasavipages.lk',
      role: 'Payment & Financial Operations Lead',
    },
  },
  {
    code: 'M3',
    title: 'Customer Service & Dispute Tickets',
    desc: 'Integrated support ticket lifecycles, real-time query handling, order dispute mediation, return authorizations, and customer satisfaction metrics.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    tags: ['Dispute Tickets', 'Support Chat', 'Inquiries', 'Resolution SLAs'],
    member: {
      name: 'Zeen A.C.',
      initials: 'ZA',
      itNumber: 'IT25103342 – Level 5',
      email: 'zeen@sarasavipages.lk',
      role: 'Customer Service & Ticket Disputes Lead',
    },
  },
  {
    code: 'M4',
    title: 'Inventory & Supplier Procurement',
    desc: 'Automated warehouse stock tracking, threshold restocking alerts, supplier purchase agreements, warehouse bin tracking, and SKU management.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    tags: ['Stock Thresholds', 'Supplier POs', 'SKU Warehouse', 'Reorder Triggers'],
    member: {
      name: 'Dissanayake S.A.S.D.',
      initials: 'DS',
      itNumber: 'IT25101062 – Level 5',
      email: 'dissanayake@sarasavipages.lk',
      role: 'Inventory & Supplier Logistics Lead',
    },
  },
  {
    code: 'M5',
    title: 'User Accounts, Membership & Loyalty',
    desc: 'Tiered reader memberships (Silver, Gold, Botanical Elite), lending privilege validation, loyalty points accrual, customer KYC, and read statistics.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    tags: ['Tiered Loyalty', 'Digital Lending', 'KYC & Profile', 'Points Accrual'],
    member: {
      name: 'Gayathmi P.G.R.',
      initials: 'GP',
      itNumber: 'IT25103013 – Level 5',
      email: 'gayathmi@sarasavipages.lk',
      role: 'User Accounts, Membership & Loyalty Lead',
    },
  },
  {
    code: 'M6',
    title: 'Books Catalog, 3D Flipbook & Order Fulfillment',
    desc: 'Rich Sri Lankan literature catalog, Heyzine-style interactive 3D digital flipbooks with page-turning animations, shopping bag, and Domex express shipping.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    tags: ['3D Flipbook', 'Catalog & Search', 'Cart & Orders', 'Domex Courier'],
    member: {
      name: 'Diyes C.L.',
      initials: 'DC',
      itNumber: 'IT25100263 – Level 5',
      email: 'diyes@sarasavipages.lk',
      role: 'Book Catalog, 3D Flipbook & Orders Lead',
    },
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0E120A] text-[#F3F4F1] font-sans selection:bg-[#B7D85A] selection:text-[#18220D]">
      {/* Top Navbar */}
      <Navbar activeTab="about" />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {/* Header Breadcrumbs / Subtitle */}
        <div className="mb-2">
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8FA368]">
            SE2030 – SOFTWARE ENGINEERING PROJECT (2ND YEAR, 1ST SEMESTER)
          </p>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white">
            about <span className="text-[#B7D85A] italic">sarasavipages & team</span>
          </h1>
          <p className="mt-4 max-w-4xl text-base sm:text-lg text-[#C8D1BE] leading-relaxed">
            Sarasavi Pages is a high-performance, modular enterprise web-based bookstore and digital reading platform built as a collaborative group project for the SE2030 Software Engineering module at SLIIT. It allows book lovers across Sri Lanka to browse rich botanical archives, purchase physical print editions, borrow with 14-day digital lending, and immerse themselves in interactive 3D digital flipbooks with secure banking and order logistics.
          </p>
        </div>

        {/* Section 1: TECH STACK */}
        <section className="mb-14">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#8FA368] mb-4">
            TECH STACK
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {techStack.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#151D10] border border-[#25331B] rounded-xl p-5 hover:border-[#B7D85A]/50 transition-all duration-300 group shadow-md"
              >
                <div className="text-[11px] font-mono tracking-wider text-[#7E9362] uppercase mb-1.5">
                  {item.label}
                </div>
                <div
                  className="text-base sm:text-lg font-bold font-mono tracking-tight"
                  style={{ color: item.color }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Unified Section: 6 INTEGRATED MODULES & TEAM ARCHITECTURE */}
        <section className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#8FA368] mb-1">
                6 INTEGRATED MODULES & TEAM ARCHITECTURE
              </h2>
              <p className="text-sm text-[#AAB89E]">
                Modular monolith engineering with each subsystem designed and led by a dedicated team developer.
              </p>
            </div>
            <div className="text-xs font-mono text-[#7E9362]">
              SE2030 Group Project · 6 Subsystems
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integratedModules.map((mod) => (
              <div
                key={mod.code}
                className={`rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xl relative group ${
                  mod.member.isLead
                    ? 'bg-[#162211] border-2 border-[#B7D85A] ring-1 ring-[#B7D85A]/30 hover:border-[#D2E687]'
                    : 'bg-[#151D10] border border-[#25331B] hover:border-[#8FA368]/60 hover:bg-[#182212]'
                }`}
              >
                <div>
                  {/* Top Header: Badge, Code & Icon */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#27381A] text-[#B7D85A] border border-[#3E5629]">
                        {mod.code}
                      </span>
                      {mod.member.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-[#B7D85A] text-[#141C0C] uppercase shadow-sm">
                          {mod.member.badge}
                        </span>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#223117] border border-[#3A4E27] flex items-center justify-center text-[#B7D85A] flex-shrink-0 group-hover:scale-110 group-hover:text-[#D2E687] transition-all">
                      {mod.icon}
                    </div>
                  </div>

                  {/* Module Title */}
                  <h3 className="text-lg font-bold text-white group-hover:text-[#B7D85A] transition-colors tracking-tight mb-2">
                    {mod.title}
                  </h3>

                  {/* Module Description */}
                  <p className="text-sm text-[#AAB89E] leading-relaxed mb-4">
                    {mod.desc}
                  </p>

                  {/* Capability Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {mod.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1C2715] text-[#8FA368] border border-[#2C3E20]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Module Lead & Developer Footer */}
                <div className="pt-4 border-t border-[#233119] flex items-center gap-3.5 mt-auto">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      mod.member.isLead
                        ? 'bg-[#B7D85A] text-[#141C0C] font-mono shadow-md'
                        : 'bg-[#223117] text-[#B7D85A] border border-[#354B24]'
                    }`}
                  >
                    {mod.member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">
                        {mod.member.name}
                      </h4>
                    </div>
                    <p className="text-xs font-mono text-[#8FA368] truncate">
                      {mod.member.itNumber}
                    </p>
                    <a
                      href={`mailto:${mod.member.email}`}
                      className="text-xs text-[#A0B092] hover:text-[#B7D85A] transition-colors truncate block"
                    >
                      {mod.member.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: System Execution Info Banner */}
        <section>
          <div className="bg-[#12190E] border border-[#25351B] rounded-2xl p-5 flex items-start gap-4 text-xs sm:text-sm text-[#AAB89E] leading-relaxed shadow-md">
            <div className="w-8 h-8 rounded-full bg-[#1C2814] border border-[#344825] flex items-center justify-center text-[#B7D85A] flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p>
                Sarasavi Pages runs locally at{' '}
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-semibold text-[#B7D85A] underline hover:text-white"
                >
                  http://localhost:3000
                </a>
                . Start the application with{' '}
                <code className="px-1.5 py-0.5 rounded bg-[#1D2B15] text-[#D2E687] font-mono text-xs border border-[#344825]">
                  mvn spring-boot:run
                </code>{' '}
                from the project root to launch the Spring Boot backend on{' '}
                <span className="font-mono text-[#B7D85A]">port 8080</span> with active{' '}
                <span className="font-semibold text-white">H2 / MS SQL</span> persistent storage.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#080B06] text-white pt-16 pb-12 px-6 sm:px-12 mt-20 border-t border-[#1F2C15]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pb-10 border-b border-[#1F2C15]">
            <div className="md:col-span-6 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B7D85A] block">Academic & Distribution Inquiries</span>
              <a 
                href="mailto:curator@sarasavipages.lk" 
                className="text-xl sm:text-2xl font-serif font-light text-white hover:text-[#B7D85A] transition-colors underline underline-offset-8"
              >
                curator@sarasavipages.lk
              </a>
              <p className="text-xs text-[#8FA368] max-w-sm leading-relaxed">
                SE2030 Software Engineering Group Project · Sri Lanka Institute of Information Technology (SLIIT).
              </p>
            </div>

            <div className="md:col-span-3 space-y-3 text-xs">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B7D85A] block">Navigation</span>
              <ul className="space-y-2 text-[#C8D1BE]">
                <li><Link href="/" className="hover:text-white transition-colors">Home Page</Link></li>
                <li><Link href="/catalog" className="hover:text-white transition-colors">Book Catalog</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About & Team</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3 text-xs">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B7D85A] block">Administration</span>
              <ul className="space-y-2 text-[#C8D1BE]">
                <li><Link href="/login" className="hover:text-white transition-colors">Staff / Admin Login</Link></li>
                <li><Link href="/admin/dashboard" className="hover:text-white transition-colors">Staff Dashboard</Link></li>
                <li><span className="text-[#657554]">SLIIT Malabe Campus, Sri Lanka</span></li>
              </ul>
            </div>
          </div>

          <div className="overflow-hidden">
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-light tracking-tight text-white/80 leading-none select-none lowercase">
              sarasavi pages<span className="text-xl sm:text-4xl font-light text-[#B7D85A]/60 align-top">®</span>
            </h2>
          </div>

          <div className="pt-6 border-t border-[#1F2C15] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#657554] font-mono">
            <p>© 2026 Sarasavi Pages. All rights reserved.</p>
            <p>SE2030 Software Engineering · Group Project 2026-Y2-S1-MLB-B9G2-01 · SLIIT</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
