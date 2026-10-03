'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Sparkles, 
  ArrowRight, 
  ShoppingCart, 
  Check, 
  Bookmark, 
  BookOpen,
  Feather,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import FlipbookReader from '@/components/FlipbookReader';
import type { Book } from '@/types/orders';

interface SpotlightBook {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  coverImage: string;
  quote: string;
  badge: string;
  tag: string;
}

const FEATURED_SPOTLIGHTS: SpotlightBook[] = [
  {
    id: 'b1',
    title: 'Gamperaliya (The Village)',
    author: 'Martin Wickramasinghe',
    category: 'Sinhala Books',
    price: 1200,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=700',
    quote: 'The living conscience of rural Ceylon during modern transformation.',
    badge: 'National Classic',
    tag: '1944 Masterpiece'
  },
  {
    id: 'b3',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    category: 'Academic Books',
    price: 5800,
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=700',
    quote: 'The fundamental treatise on distributed systems & scalability.',
    badge: 'SLIIT Recommended',
    tag: 'Computing Syllabi'
  },
  {
    id: 'b2',
    title: 'The Village in the Jungle',
    author: 'Leonard Woolf',
    category: 'Sinhala Books',
    price: 1450,
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=700',
    quote: 'An empathetic portrayal of southern wilderness & human spirit.',
    badge: 'Ceylon Archive',
    tag: 'Colonial Classic'
  },
  {
    id: 'b4',
    title: 'Fundamentals of Database Systems',
    author: 'Ramez Elmasri & Shamkant Navathe',
    category: 'Academic Books',
    price: 4950,
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=700',
    quote: 'Relational data modeling, query optimization & transaction control.',
    badge: 'DDD Module Text',
    tag: 'Core Reference'
  },
  {
    id: 'b5',
    title: 'Running in the Family',
    author: 'Michael Ondaatje',
    category: 'Non-Fiction',
    price: 1850,
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=700',
    quote: 'A luminous, sensory memoir through Ceylon’s historic landscapes.',
    badge: 'Golden Booker Winner',
    tag: 'Island Memoir'
  }
];

interface Props {
  onAddToCart?: (book: Book) => void;
}

export default function CinematicEditorialSpotlight({ onAddToCart }: Props) {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  
  const [selectedBook, setSelectedBook] = useState<SpotlightBook>(FEATURED_SPOTLIGHTS[1]);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [isFlipbookOpen, setIsFlipbookOpen] = useState(false);
  const [userMembership, setUserMembership] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserMembership(localStorage.getItem('sp_membership'));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Watermark horizontal scrub parallax
      if (watermarkRef.current && containerRef.current) {
        gsap.to(watermarkRef.current, {
          xPercent: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      }

      // 2. Headline & Quote Fade-Up with Blur Removal
      if (headlineRef.current && containerRef.current) {
        gsap.fromTo(
          headlineRef.current.children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: {
              trigger: headlineRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // 3. Scroll-driven Fan Out of Cards (Scrubbed)
      if (cardsWrapperRef.current && containerRef.current) {
        const cards = cardsWrapperRef.current.querySelectorAll('[data-spotlight-card]');
        
        // Define fan-out transforms for 5 cards:
        // [-2, -1, 0, +1, +2]
        const fanConfigs = [
          { x: -160, y: 35, rot: -10, scale: 0.92 },
          { x: -80, y: 15, rot: -5, scale: 0.96 },
          { x: 0, y: -15, rot: 0, scale: 1.04 },
          { x: 80, y: 15, rot: 5, scale: 0.96 },
          { x: 160, y: 35, rot: 10, scale: 0.92 },
        ];

        // Animate based on scroll scrub
        gsap.fromTo(
          cards,
          {
            x: 0,
            y: 50,
            rotation: 0,
            scale: 0.88,
            opacity: 0.6
          },
          {
            x: (i) => fanConfigs[i % fanConfigs.length].x,
            y: (i) => fanConfigs[i % fanConfigs.length].y,
            rotation: (i) => fanConfigs[i % fanConfigs.length].rot,
            scale: (i) => fanConfigs[i % fanConfigs.length].scale,
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsWrapperRef.current,
              start: 'top 85%',
              end: 'center 50%',
              scrub: 1.2
            }
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleQuickAdd = (book: SpotlightBook) => {
    if (onAddToCart) {
      onAddToCart({
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        price: book.price,
        coverImage: book.coverImage,
        stockQuantity: 20,
        rating: 4.9,
        isbn: '978-955-0201-88-2',
        description: book.quote
      });
      setAddedId(book.id);
      setTimeout(() => setAddedId(null), 2500);
    }
  };

  return (
    <section 
      ref={containerRef}
      className="relative w-full py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-[#20231B] via-[#2D391A] to-[#20231B] text-white border-y border-[#596B32]/30"
    >
      {/* ── BACKGROUND WATERMARK TEXT (GSAP Parallax Scrub) ── */}
      <div 
        ref={watermarkRef}
        className="absolute top-10 left-0 text-[14vw] font-display font-light text-white/[0.03] select-none pointer-events-none whitespace-nowrap leading-none tracking-tighter"
      >
        SARASAVI · ARCHIVAL · CURATION · CEYLON ·
      </div>

      {/* Subtle organic light gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B7D85A]/10 via-[#596B32]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── HEADLINE & CINEMATIC EDITORIAL TITLE ── */}
        <div ref={headlineRef} className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#34451D]/90 border border-[#7F9148]/40 text-[#B7D85A] text-xs font-mono font-medium mb-4 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#B7D85A]" />
            <span>Curatorial Spotlight · 2026 Archive</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-[1.12]">
            Literature is the living conscience <br className="hidden sm:inline" />
            <span className="italic text-[#B7D85A] font-light">
              of our island&apos;s story.
            </span>
          </h2>

          <p ref={quoteRef} className="mt-4 text-[#D3DCBF] font-sans font-light text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            From rural Southern social transformation to Cambridge distributed computing. Handpicked print editions preserved for Sri Lankan readers and scholars.
          </p>
        </div>

        {/* ── SCROLL-DRIVEN FAN DECK CARDS (GSAP Scrub) ── */}
        <div 
          ref={cardsWrapperRef} 
          className="relative w-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-visible py-6"
        >
          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap lg:flex-nowrap">
            {FEATURED_SPOTLIGHTS.map((book) => {
              const isSelected = selectedBook.id === book.id;
              
              return (
                <div
                  key={book.id}
                  data-spotlight-card
                  onClick={() => setSelectedBook(book)}
                  className={`relative w-[190px] sm:w-[220px] h-[300px] sm:h-[350px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-xl group border ${
                    isSelected 
                      ? 'border-[#B7D85A] ring-2 ring-[#B7D85A]/40 shadow-[0_20px_40px_rgba(183,216,90,0.18)] -translate-y-3 z-30' 
                      : 'border-white/10 hover:border-white/40 hover:-translate-y-1 z-10'
                  }`}
                >
                  {/* Book Cover Image */}
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient Overlay for Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#20231B] via-[#20231B]/40 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-[#34451D]/90 backdrop-blur-md border border-[#596B32]/40 text-[#B7D85A] text-[9px] font-mono font-medium shadow-xs">
                      {book.tag}
                    </span>
                    <span className="font-mono text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      LKR {book.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Bottom Text Content */}
                  <div className="absolute bottom-0 inset-x-0 p-4 text-left">
                    <span className="text-[10px] font-mono text-[#B7D85A] block uppercase tracking-wider mb-1">
                      {book.author}
                    </span>
                    <h3 className="font-display text-sm sm:text-base text-white font-medium line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SELECTED BOOK INSPECTION & ACTION DOCK ── */}
        <div className="mt-8 bg-[#34451D]/90 border border-[#596B32] rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 text-left w-full sm:w-auto">
            <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-[#7F9148] shadow-md">
              <img 
                src={selectedBook.coverImage} 
                alt={selectedBook.title}
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded-sm bg-[#596B32] text-[#B7D85A] text-[10px] font-mono uppercase font-semibold">
                  {selectedBook.badge}
                </span>
                <span className="text-xs text-[#D3DCBF] font-light">
                  {selectedBook.category}
                </span>
              </div>
              <h4 className="font-display text-base sm:text-lg text-white font-medium">
                {selectedBook.title}
              </h4>
              <p className="text-xs text-[#D3DCBF] font-light italic mt-0.5 line-clamp-1">
                &ldquo;{selectedBook.quote}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 border-[#596B32]/40 pt-3 sm:pt-0">
            <span className="font-display text-lg text-[#B7D85A] font-semibold mr-1">
              LKR {selectedBook.price.toLocaleString()}
            </span>

            <button
              onClick={() => setIsFlipbookOpen(true)}
              className="px-3.5 py-2 rounded-full bg-[#1A261C] hover:bg-[#233125] text-[#B7D85A] border border-[#B7D85A]/40 font-mono text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
              title="Open Online 3D Flipbook Reader"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Read 3D</span>
            </button>

            <Link
              href={`/catalog/${selectedBook.id}`}
              className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-medium transition-all border border-white/20 flex items-center gap-1.5"
              title="View Book Details"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Details</span>
            </Link>

            {onAddToCart && (
              <button
                onClick={() => handleQuickAdd(selectedBook)}
                className={`px-4 py-2 rounded-full font-display text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 active:scale-95 ${
                  addedId === selectedBook.id
                    ? 'bg-[#B7D85A] text-[#20231B]'
                    : 'bg-[#B7D85A] hover:bg-[#a6c84c] text-[#20231B]'
                }`}
              >
                {addedId === selectedBook.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ── Flipbook Reader Modal ── */}
      {isFlipbookOpen && (
        <FlipbookReader
          book={{
            id: selectedBook.id,
            title: selectedBook.title,
            author: selectedBook.author,
            category: selectedBook.category,
            price: selectedBook.price,
            coverImage: selectedBook.coverImage,
            stockQuantity: 20,
            isbn: '978-955-0201-88-2',
            description: selectedBook.quote,
            rating: 4.9
          }}
          isOpen={isFlipbookOpen}
          onClose={() => setIsFlipbookOpen(false)}
          userMembership={userMembership}
        />
      )}
    </section>
  );
}
