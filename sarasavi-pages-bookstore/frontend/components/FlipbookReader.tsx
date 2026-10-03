'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Lock, 
  Sparkles, 
  Award, 
  Check, 
  ArrowRight,
  List,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import type { Book } from '@/types/orders';

interface FlipbookReaderProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  userMembership: string | null;
  onUpgradeMembership?: () => void;
}

interface BookPage {
  pageNumber: number;
  chapterTitle?: string;
  type: 'cover' | 'copyright' | 'contents' | 'reading';
  content: {
    heading?: string;
    subheading?: string;
    paragraphs: string[];
    footer?: string;
  };
}

// Generate realistic reading pages for the book
function getBookPages(book: Book): BookPage[] {
  const isSinhala = book.category === 'Sinhala Books' || Boolean(book.sinhalaTitle);

  if (isSinhala) {
    return [
      {
        pageNumber: 1,
        type: 'cover',
        content: {
          heading: book.sinhalaTitle || book.title,
          subheading: `${book.title} · ${book.author}`,
          paragraphs: [
            'සරසවි ප්‍රකාශන නිල ඩිජිටල් සංරක්ෂිත සංස්කරණය',
            'සම්භාව්‍ය සිංහල සාහිත්‍ය කෘති මාලාව',
            `ISBN: ${book.isbn}`
          ],
          footer: 'Sarasavi Pages Interactive 3D Flipbook Edition'
        }
      },
      {
        pageNumber: 2,
        type: 'copyright',
        content: {
          heading: 'ප්‍රකාශන තොරතුරු හා සංරක්ෂණය',
          subheading: 'SARASAVI PAGES OFFICIAL DIGITAL ARCHIVE',
          paragraphs: [
            `කෘතිය: ${book.sinhalaTitle || book.title} (${book.title})`,
            `කර්තෘ: ${book.author}`,
            `ප්‍රකාශනය: ${book.publisher || 'සරසවි ප්‍රකාශකයෝ, කොළඹ'}`,
            'ජාතික පුස්තකාල හා ප්‍රලේඛන සේවා මණ්ඩලයේ ලියාපදිංචි අංකය: SL-2026-ARCHIVE-99',
            'මෙම ඩිජිටල් පෙරලිය හැකි පොත (Interactive Flipbook) සරසවි පේජස් සාමාජිකයන්ගේ අධ්‍යයන හා කියවීමේ පහසුව උදෙසා විශේෂයෙන් සකසන ලද්දකි.',
            'සියලුම හිමිකම් ඇවිරිණි. අනවසර පිටපත් කිරීම සපුරා තහනම්.'
          ],
          footer: 'Registered Colombo Archive · 2026 Edition'
        }
      },
      {
        pageNumber: 3,
        type: 'contents',
        content: {
          heading: 'පටුන (Table of Contents)',
          subheading: 'ප්‍රධාන පරිච්ඡේද',
          paragraphs: [
            '1 වන පරිච්ඡේදය: අපේ ගම සහ ළමා වියේ සොඳුරු මතක ..................... පිටුව 04',
            '2 වන පරිච්ඡේදය: රහසිගත සැලසුම් සහ ජින්නාගේ මිත්‍රත්වය ............... පිටුව 08',
            '3 වන පරිච්ඡේදය: මහ සයුර මැද දූපත සොයා යාම ............................ පිටුව 12',
            '4 වන පරිච්ඡේදය: මඩොල් දූවේ නව ජීවිතය සහ අභියෝග .................... පිටුව 16',
            '5 වන පරිච්ඡේදය: ස්වාධීනත්වයේ සහ අස්වැන්නේ අරුමය ................... පිටුව 20'
          ],
          footer: 'Official Digitized Index'
        }
      },
      {
        pageNumber: 4,
        chapterTitle: '1 වන පරිච්ඡේදය',
        type: 'reading',
        content: {
          heading: '1 වන පරිච්ඡේදය: අපේ ගම සහ මුල් අවදිය',
          paragraphs: [
            'අපේ ගම සුන්දර මුහුදු තීරයකටත්, නිල්වන් කලපුවකටත් මැදිව පිහිටි නිස්කලංක ගම්මානයකි. ගමේ කෙළවර වූ කඳුගැටය මුදුනට නැගි විට මුළු ගම්මානයම පොල් රුප්පාවලින් වැසීගිය හරිත වර්ණ මුහුදක් මෙන් දිස්විය.',
            'මගේ ළමා කාලය ගෙවුණේ නිදහස් කුරුල්ලෙකු මෙනි. පොත්පත් වලට වඩා මගේ සිත ඇදී ගියේ කලපුවේ ඔරු පැදීමටත්, මාළු බෑමටත්, නොදන්නා ඉසව් සොයා ඇවිදීමටත්ය. ගමේ අනෙක් ළමයින් අතර මම නිතරම කණ්ඩායමේ නායකයා ලෙස කැපී පෙනුණෙමි.',
            'ජින්නා මට හමුවූයේ මෙවන් දිනකය. ඔහු නිර්භීත, එඩිතර, ඕනෑම අසීරු අවස්ථාවක නොසැලී සිටිය හැකි අසහාය මිතුරෙකු විය. අප දෙදෙනාගේ හමුවීම අපේ මුළු ජීවිත ගමනම වෙනස් කරනු ඇතැයි එදා අප කිසිවෙකුත් සිහිනෙන්දු නොසිතුවෙමු.'
          ],
          footer: 'පිටුව 04'
        }
      },
      {
        pageNumber: 5,
        chapterTitle: '1 වන පරිච්ඡේදය (ඉතිරිය)',
        type: 'reading',
        content: {
          heading: 'කලපුවේ රහස් සහ අලුත් බලාපොරොත්තු',
          paragraphs: [
            'හිරු බැස යන හෝරාවේ කලපු දිය මත රන්වන් පැහැති රැළිති නැගෙද්දී, අපි දෙදෙනා පැරණි කඩොලාන ගසක් යට හිඳී අනාගතය ගැන කතා කළෙමු. වැඩිහිටියන්ගේ දැඩි නීති රීති වලින් මිදී අපේම ලෝකයක් ගොඩනගා ගැනීමේ පිපාසය අප සිත් තුළ දැඩිව පැලපදියම්ව තිබිණි.',
            '“උපාලි, උඹට මතකද අර ඈතින් පේන මඩොල් දූව?” ජින්නා දිනක් කලපුවේ කෙළවර වූ අඳුරු දූපත දෙසට අත දිගු කරමින් ඇසීය.',
            '“ඔව්, මිනිස්සු කියන්නේ එහේ හොල්මන් තියෙනවා කියලා,” මම සිනාසෙමින් කීවෙමි. “හැබැයි අපි දෙන්නට එහෙට යන්න බැරි කමක් නෑ!”'
          ],
          footer: 'පිටුව 05'
        }
      },
      {
        pageNumber: 6,
        chapterTitle: '2 වන පරිච්ඡේදය',
        type: 'reading',
        content: {
          heading: '2 වන පරිච්ඡේදය: තීරණාත්මක ගමන',
          paragraphs: [
            'එක් වැසිබර අලුයමක කිසිවෙකුටත් නොදන්වා අප දෙදෙනා කුඩා ඔරුවක් සූදානම් කර ගතිමු. අවශ්‍ය වූයේ වියළි ආහාර ස්වල්පයක්, ගිනිපෙට්ටියක් සහ නොසැලෙන ධෛර්යය පමණි.',
            'කලපුවේ ජලය රළු වෙමින් පැවති අතර සීතල සුළඟ අපගේ සිරුරු විනිවිද ගියේය. එහෙත් මඩොල් දූව දෙසට ඇදී ගිය අපගේ ඔරුව කිසිදු පසුබෑමක් නොපෙන්වීය. එය අපගේ ස්වාධීනත්වයේ පළමු පියවර විය.'
          ],
          footer: 'පිටුව 06'
        }
      }
    ];
  }

  // Academic / Technology / English books
  return [
    {
      pageNumber: 1,
      type: 'cover',
      content: {
        heading: book.title,
        subheading: `By ${book.author}`,
        paragraphs: [
          'Sarasavi Pages Interactive 3D Digital Edition',
          `Category: ${book.category}`,
          `Official ISBN: ${book.isbn}`
        ],
        footer: 'Exclusive Reader Edition · Certified Reproduction'
      }
    },
    {
      pageNumber: 2,
      type: 'copyright',
      content: {
        heading: 'Publication & Digital Archival Notice',
        subheading: 'SARASAVI SCHOLAR REPOSITORY',
        paragraphs: [
          `Title: ${book.title}`,
          `Author: ${book.author}`,
          `Publisher: ${book.publisher || 'Academic & Technical Press'}`,
          'Certified for academic curricula including SLIIT Software Engineering and Computing modules.',
          'Interactive Heyzine-style 3D page rendering developed exclusively for Sarasavi Pages members.',
          'All trademarks and copyrighted material belong to their respective original publishers.'
        ],
        footer: 'Colombo Digital Repository · 2026'
      }
    },
    {
      pageNumber: 3,
      type: 'contents',
      content: {
        heading: 'Table of Contents',
        subheading: 'Core Chapters & Syllabus Modules',
        paragraphs: [
          'Chapter 01: Foundational Principles & Architecture ................ Page 04',
          'Chapter 02: Design Patterns, Clean Abstractions & Rigor ............ Page 18',
          'Chapter 03: Performance, Scalability & Data Modeling ............. Page 42',
          'Chapter 04: Concurrency, Replication & Fault Tolerance ........... Page 88',
          'Chapter 05: Practical Case Studies & Implementation ............. Page 124'
        ],
        footer: 'Interactive Course Syllabi Index'
      }
    },
    {
      pageNumber: 4,
      chapterTitle: 'Chapter 1',
      type: 'reading',
      content: {
        heading: 'Chapter 1: Foundational Principles & System Design',
        paragraphs: [
          'In modern software engineering, complexity is the foremost adversary of enduring systems. A system that works today under modest laboratory loads will inevitably degrade unless engineered for reliability, scalability, and maintainability.',
          'Reliability means continuing to function correctly, even in the presence of adversity (hardware faults, software bugs, or human error). Scalability describes a system’s ability to cope with increased load across computational and storage dimensions.',
          'Throughout this treatise, we explore how data-intensive architectures maintain coherence across distributed clusters, drawing directly from real-world systems deployed at global scale.'
        ],
        footer: 'Page 04'
      }
    },
    {
      pageNumber: 5,
      chapterTitle: 'Chapter 1 (Continued)',
      type: 'reading',
      content: {
        heading: 'Data Models and Query Languages',
        paragraphs: [
          'The limits of my language mean the limits of my world. The data models we select dictate how we conceptualize relationships, query semantics, and persistence pipelines.',
          'Relational models, pioneer-designed by Edgar Codd in 1970, hide implementation details behind declarative queries. Conversely, document models and graph topologies offer natural fits for nested hierarchies and heavily connected networks.',
          'A disciplined engineer must evaluate trade-offs rather than adhering dogmatically to single paradigms.'
        ],
        footer: 'Page 05'
      }
    },
    {
      pageNumber: 6,
      chapterTitle: 'Chapter 2',
      type: 'reading',
      content: {
        heading: 'Chapter 2: Concurrency & Transactional Rigor',
        paragraphs: [
          'When multiple users update concurrent records, isolation levels govern the anomalies that may arise: dirty reads, non-repeatable reads, and phantom updates.',
          'Strict serializability represents the gold standard of correctness, ensuring that concurrent operations yield outcomes identical to sequential execution.'
        ],
        footer: 'Page 06'
      }
    }
  ];
}

export default function FlipbookReader({
  book,
  isOpen,
  onClose,
  userMembership,
  onUpgradeMembership
}: FlipbookReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0-indexed pair or single
  const [isDualPage, setIsDualPage] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [isPageFlipping, setIsPageFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  
  // Membership & Paywall status
  // User has access if they are a member (BASIC or PREMIUM) OR have unlocked this single book pass
  const [hasUnlockedPass, setHasUnlockedPass] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const pages = getBookPages(book);
  const totalPages = pages.length;

  // Check stored passes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const passKey = `sp_pass_${book.id}`;
      const unlocked = localStorage.getItem(passKey) === 'true' || localStorage.getItem('sp_pass_all') === 'true';
      setHasUnlockedPass(unlocked);
    }
  }, [book.id]);

  const isMember = Boolean(userMembership === 'BASIC' || userMembership === 'PREMIUM' || hasUnlockedPass);

  // Responsive single/dual page mode
  useEffect(() => {
    const handleResize = () => {
      setIsDualPage(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Web Audio API Synthesized Paper Flip Sound Effect
  const playPageFlipSound = () => {
    if (!isSoundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Generate soft paper rustle white noise with lowpass filter
      const bufferSize = ctx.sampleRate * 0.12; // 120ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.12);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {}
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Turn page logic
  const turnNext = () => {
    const step = isDualPage ? 2 : 1;
    const nextIdx = currentPageIndex + step;

    // Check membership paywall: Free users can only view pages 0 to 2 (Page 1-2)
    if (!isMember && nextIdx >= 2) {
      setShowPaywallModal(true);
      return;
    }

    if (nextIdx < totalPages) {
      setFlipDirection('next');
      setIsPageFlipping(true);
      playPageFlipSound();
      setTimeout(() => {
        setCurrentPageIndex(nextIdx);
        setIsPageFlipping(false);
      }, 350);
    }
  };

  const turnPrev = () => {
    const step = isDualPage ? 2 : 1;
    const prevIdx = Math.max(0, currentPageIndex - step);
    if (prevIdx !== currentPageIndex) {
      setFlipDirection('prev');
      setIsPageFlipping(true);
      playPageFlipSound();
      setTimeout(() => {
        setCurrentPageIndex(prevIdx);
        setIsPageFlipping(false);
      }, 350);
    }
  };

  // Slideshow
  useEffect(() => {
    if (!isPlayingSlideshow) return;
    const interval = setInterval(() => {
      const step = isDualPage ? 2 : 1;
      if (currentPageIndex + step < totalPages && (isMember || currentPageIndex + step < 2)) {
        turnNext();
      } else {
        setIsPlayingSlideshow(false);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlayingSlideshow, currentPageIndex, isDualPage, totalPages, isMember]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') turnNext();
      if (e.key === 'ArrowLeft') turnPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPageIndex, isDualPage, isMember]);

  // Handle Instant Single Digital Pass Purchase (LKR 250)
  const handleBuySinglePass = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sp_pass_${book.id}`, 'true');
    }
    setHasUnlockedPass(true);
    setShowPaywallModal(false);
  };

  if (!isOpen) return null;

  // Active pages calculation
  const leftPage = pages[currentPageIndex] || null;
  const rightPage = isDualPage ? pages[currentPageIndex + 1] || null : null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#121614]/95 backdrop-blur-2xl flex flex-col justify-between text-[#F8F9F5] select-none overflow-hidden animate-fadeIn"
      style={{ perspective: '2000px' }}
    >
      {/* ── 1. HEYZINE-STYLE TOP TOOLBAR ── */}
      <header className="h-14 sm:h-16 px-4 sm:px-8 border-b border-white/10 bg-[#1A211D]/80 backdrop-blur-md flex items-center justify-between gap-4 z-30 shrink-0">
        
        {/* Left: Book Meta & Membership Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#34451D] border border-[#596B32] flex items-center justify-center text-[#B7D85A] shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm sm:text-base text-white font-medium truncate">
                {book.sinhalaTitle ? `${book.sinhalaTitle} · ${book.title}` : book.title}
              </h2>
              {isMember ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B7D85A]/20 border border-[#B7D85A]/40 text-[#B7D85A] text-[10px] font-mono font-medium shrink-0">
                  <Award className="w-3 h-3" />
                  <span>Member Unlocked</span>
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-medium shrink-0">
                  <Lock className="w-3 h-3" />
                  <span>Free Preview (Pages 1–2)</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#A8B69A] truncate font-light">
              By {book.author} · Interactive 3D Digital Flipbook
            </p>
          </div>
        </div>

        {/* Right: Controls & Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Table of contents toggle */}
          <button
            onClick={() => setShowToc(!showToc)}
            className={`p-2 rounded-xl border text-xs transition-all flex items-center gap-1 ${
              showToc 
                ? 'bg-[#34451D] text-[#B7D85A] border-[#B7D85A]' 
                : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
            }`}
            title="Table of Contents"
          >
            <List className="w-4 h-4" />
            <span className="hidden md:inline font-sans text-xs">Contents</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs transition-all"
            title={isSoundEnabled ? 'Disable Page Turn Audio' : 'Enable Page Turn Audio'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-[#B7D85A]" /> : <VolumeX className="w-4 h-4 text-white/40" />}
          </button>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-white/5 rounded-xl border border-white/10 p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
              className="p-1.5 text-white/80 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] px-1 text-white/70">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
              className="p-1.5 text-white/80 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Slideshow button */}
          <button
            onClick={() => setIsPlayingSlideshow(!isPlayingSlideshow)}
            className={`p-2 rounded-xl border text-xs transition-all ${
              isPlayingSlideshow
                ? 'bg-[#B7D85A] text-[#121614] border-[#B7D85A]'
                : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
            }`}
            title={isPlayingSlideshow ? 'Pause Slideshow' : 'Play Slideshow'}
          >
            {isPlayingSlideshow ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition-all ml-1"
            title="Exit Reader"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── 2. HEYZINE 3D FLIPBOOK VIEWPORT ── */}
      <main className="relative flex-1 flex items-center justify-center p-3 sm:p-8 overflow-hidden">
        
        {/* Table of contents sidebar drawer */}
        {showToc && (
          <aside className="absolute left-4 top-4 bottom-4 w-72 rounded-2xl bg-[#1A211D]/95 border border-[#596B32]/40 backdrop-blur-xl p-5 z-40 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <span className="font-display font-medium text-sm text-white">Table of Contents</span>
                <button onClick={() => setShowToc(false)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {pages.map((p, idx) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => {
                      if (!isMember && idx >= 2) {
                        setShowPaywallModal(true);
                      } else {
                        setCurrentPageIndex(isDualPage ? Math.floor(idx / 2) * 2 : idx);
                        setShowToc(false);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentPageIndex === idx || (isDualPage && (currentPageIndex === idx || currentPageIndex + 1 === idx))
                        ? 'bg-[#34451D] text-[#B7D85A] font-medium'
                        : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate pr-2">
                      {p.content.heading || `Page ${p.pageNumber}`}
                    </span>
                    {!isMember && idx >= 2 ? (
                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                    ) : (
                      <span className="font-mono text-[10px] text-white/50">{p.pageNumber}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {!isMember && (
              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={() => setShowPaywallModal(true)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-[#B7D85A] to-[#8FA842] text-[#121614] font-display text-xs font-semibold shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Unlock All Pages</span>
                </button>
              </div>
            )}
          </aside>
        )}

        {/* 3D Realistic Open Book Spread Container */}
        <div 
          className="relative transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Outer Book Spine & Leather/Hardcover Border */}
          <div className="relative bg-[#1A261C] p-2.5 sm:p-4 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] border border-[#3E4F28]/60 flex items-center justify-center">
            
            {/* The Dual-Page Spread */}
            <div className={`relative flex items-stretch bg-[#FAF7F0] text-[#20231B] rounded-2xl overflow-hidden shadow-2xl ${
              isDualPage ? 'w-[780px] sm:w-[880px] h-[520px] sm:h-[580px]' : 'w-[360px] sm:w-[440px] h-[540px] sm:h-[600px]'
            }`}>
              
              {/* ── LEFT PAGE ── */}
              {leftPage && (
                <div className={`relative flex-1 p-6 sm:p-10 flex flex-col justify-between border-r border-[#20231B]/10 font-sans ${
                  isDualPage ? 'border-r shadow-[inset_-25px_0_35px_rgba(0,0,0,0.06)]' : ''
                }`}>
                  {/* Subtle paper grain texture */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Page Header */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#717665] border-b border-[#20231B]/10 pb-2 mb-4">
                    <span className="truncate">{book.title}</span>
                    <span>{leftPage.chapterTitle || leftPage.pageNumber}</span>
                  </div>

                  {/* Main Page Content */}
                  <div className="space-y-4 my-auto">
                    {leftPage.type === 'cover' ? (
                      <div className="text-center space-y-4 py-8">
                        <div className="w-28 sm:w-36 h-40 sm:h-48 mx-auto rounded-xl overflow-hidden shadow-xl border-2 border-white">
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                        </div>
                        <h1 className="font-display font-medium text-2xl sm:text-3xl text-[#20231B]">
                          {leftPage.content.heading}
                        </h1>
                        <p className="font-sans text-xs sm:text-sm text-[#596B32] font-semibold">
                          {leftPage.content.subheading}
                        </p>
                        <div className="space-y-1 pt-2">
                          {leftPage.content.paragraphs.map((para, i) => (
                            <p key={i} className="text-xs text-[#717665] font-light">{para}</p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {leftPage.content.heading && (
                          <h3 className="font-display text-lg sm:text-xl font-medium text-[#20231B] leading-snug border-b border-[#20231B]/10 pb-2">
                            {leftPage.content.heading}
                          </h3>
                        )}
                        <div className="space-y-3 font-serif text-xs sm:text-[13px] leading-relaxed text-[#2C3127]">
                          {leftPage.content.paragraphs.map((p, i) => (
                            <p key={i} className="indent-4 leading-[1.7]">{p}</p>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Page Footer */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8C9180] pt-3 border-t border-[#20231B]/10 mt-4">
                    <span>{leftPage.content.footer || 'Sarasavi Archive'}</span>
                    <span className="font-bold text-[#34451D]">{leftPage.pageNumber}</span>
                  </div>
                </div>
              )}

              {/* ── CENTER SPINE CREASE (Dual Page Mode) ── */}
              {isDualPage && (
                <div className="w-4 bg-gradient-to-r from-[#20231B]/15 via-transparent to-[#20231B]/15 shadow-inner shrink-0 z-20 pointer-events-none" />
              )}

              {/* ── RIGHT PAGE (Dual Page Mode) ── */}
              {isDualPage && rightPage && (
                <div className="relative flex-1 p-6 sm:p-10 flex flex-col justify-between font-sans shadow-[inset_25px_0_35px_rgba(0,0,0,0.06)]">
                  {/* Subtle paper grain texture */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Page Header */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#717665] border-b border-[#20231B]/10 pb-2 mb-4">
                    <span>{rightPage.chapterTitle || 'Chapter Excerpt'}</span>
                    <span>{book.author}</span>
                  </div>

                  {/* Main Page Content */}
                  <div className="space-y-4 my-auto">
                    {rightPage.content.heading && (
                      <h3 className="font-display text-lg sm:text-xl font-medium text-[#20231B] leading-snug border-b border-[#20231B]/10 pb-2">
                        {rightPage.content.heading}
                      </h3>
                    )}
                    <div className="space-y-3 font-serif text-xs sm:text-[13px] leading-relaxed text-[#2C3127]">
                      {rightPage.content.paragraphs.map((p, i) => (
                        <p key={i} className="indent-4 leading-[1.7]">{p}</p>
                      ))}
                    </div>
                  </div>

                  {/* Page Footer */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8C9180] pt-3 border-t border-[#20231B]/10 mt-4">
                    <span className="font-bold text-[#34451D]">{rightPage.pageNumber}</span>
                    <span>{rightPage.content.footer || 'Sarasavi Archive'}</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Left Arrow (Prev Page) */}
          <button
            onClick={turnPrev}
            disabled={currentPageIndex === 0}
            className="absolute -left-5 sm:-left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#1A211D]/90 hover:bg-[#34451D] text-white border border-[#596B32] shadow-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 z-30"
            title="Previous Page"
          >
            <ChevronLeft className="w-5 h-5 text-[#B7D85A]" />
          </button>

          {/* Right Arrow (Next Page) */}
          <button
            onClick={turnNext}
            disabled={currentPageIndex >= totalPages - (isDualPage ? 2 : 1)}
            className="absolute -right-5 sm:-right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#1A211D]/90 hover:bg-[#34451D] text-white border border-[#596B32] shadow-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 z-30"
            title="Next Page"
          >
            <ChevronRight className="w-5 h-5 text-[#B7D85A]" />
          </button>

        </div>
      </main>

      {/* ── 3. HEYZINE BOTTOM PAGE NAVIGATION SCRUBBER ── */}
      <footer className="h-14 sm:h-16 px-4 sm:px-8 border-t border-white/10 bg-[#1A211D]/80 backdrop-blur-md flex items-center justify-between gap-4 z-30 shrink-0">
        
        {/* Previous */}
        <button
          onClick={turnPrev}
          disabled={currentPageIndex === 0}
          className="flex items-center gap-1 text-xs font-sans text-white/80 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Scrubber Slider */}
        <div className="flex items-center gap-3 max-w-md w-full mx-auto">
          <span className="font-mono text-xs text-[#B7D85A] font-semibold shrink-0">
            {isDualPage 
              ? `${leftPage ? leftPage.pageNumber : 1}–${rightPage ? rightPage.pageNumber : leftPage ? leftPage.pageNumber : 1}` 
              : leftPage?.pageNumber || 1
            }
          </span>

          <input
            type="range"
            min={0}
            max={totalPages - 1}
            value={currentPageIndex}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isMember && val >= 2) {
                setShowPaywallModal(true);
              } else {
                setCurrentPageIndex(isDualPage ? Math.floor(val / 2) * 2 : val);
              }
            }}
            className="w-full accent-[#B7D85A] h-1.5 bg-white/20 rounded-lg cursor-pointer"
          />

          <span className="font-mono text-xs text-white/60 shrink-0">
            / {totalPages}
          </span>
        </div>

        {/* Next */}
        <button
          onClick={turnNext}
          disabled={currentPageIndex >= totalPages - (isDualPage ? 2 : 1)}
          className="flex items-center gap-1 text-xs font-sans text-white/80 hover:text-white disabled:opacity-30 transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* ── 4. MEMBERSHIP PAYWALL MODAL (Heyzine Paywall Lock) ── */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-[#18231B] border border-[#B7D85A]/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl text-white space-y-5 animate-scaleUp">
            
            <button
              onClick={() => setShowPaywallModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-full bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-[#34451D] border border-[#B7D85A] flex items-center justify-center text-[#B7D85A] mx-auto shadow-lg shadow-[#B7D85A]/20">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34451D] text-[#B7D85A] text-[11px] font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Exclusive Sarasavi Member Privilege</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl text-white font-medium">
                Unlock Full Interactive 3D Flipbook
              </h3>
              <p className="text-xs sm:text-sm text-[#C8D4B8] font-light leading-relaxed max-w-md mx-auto">
                You have reached the end of the free sample preview. Interactive Heyzine-style digital reading with realistic page turns is reserved for Sarasavi Members or Digital Pass holders.
              </p>
            </div>

            {/* Paywall Options Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {/* Option 1: Full Membership */}
              <div className="p-4 rounded-2xl bg-[#233125] border border-[#B7D85A]/60 flex flex-col justify-between space-y-3">
                <div>
                  <span className="font-mono text-[10px] text-[#B7D85A] font-semibold uppercase block">Best Value</span>
                  <h4 className="font-display font-medium text-white text-base">Full Membership</h4>
                  <p className="text-[11px] text-[#A8B69A] mt-1 font-light">
                    Unlimited digital flipbooks for all 1,500+ books + 20% discount on print copies.
                  </p>
                </div>
                <div>
                  <span className="font-mono text-sm text-[#B7D85A] font-bold block mb-2">From LKR 990</span>
                  <Link
                    href="/membership"
                    onClick={() => {
                      setShowPaywallModal(false);
                      onClose();
                    }}
                    className="w-full py-2 rounded-xl bg-[#B7D85A] hover:bg-[#a6c84c] text-[#121614] font-display text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1"
                  >
                    <span>Upgrade Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Option 2: Single Book Pass */}
              <div className="p-4 rounded-2xl bg-[#233125]/70 border border-white/20 flex flex-col justify-between space-y-3">
                <div>
                  <span className="font-mono text-[10px] text-white/60 font-semibold uppercase block">Single Title Pass</span>
                  <h4 className="font-display font-medium text-white text-base">Digital Pass Only</h4>
                  <p className="text-[11px] text-[#A8B69A] mt-1 font-light">
                    Instant lifetime digital flipbook access for *{book.title}*.
                  </p>
                </div>
                <div>
                  <span className="font-mono text-sm text-white font-bold block mb-2">LKR 250</span>
                  <button
                    onClick={handleBuySinglePass}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-medium transition-all border border-white/20 flex items-center justify-center gap-1"
                  >
                    <span>Unlock Book (LKR 250)</span>
                    <Check className="w-3.5 h-3.5 text-[#B7D85A]" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-white/40 font-light">
              Secure encryption · Instant digital activation · Accessible on mobile, tablet & desktop
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
