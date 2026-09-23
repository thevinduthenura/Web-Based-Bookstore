import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

// ── Next.js Font Optimization ─────────────────────────────────────────────
// Loaded via next/font: zero layout shift, auto-subsetting, self-hosted at runtime
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// ── SEO Metadata ----------------------------------------------------------
export const metadata: Metadata = {
  title: {
    default: 'Sarasavi Pages® - Premier Curated Bookstore Sri Lanka',
    template: '%s | Sarasavi Pages®',
  },
  description:
    'Sri Lanka\'s premier curated bookstore, academic textbook lending, and literary platform. 1,500+ titles, same-day Colombo delivery, and rare Sinhala archival editions.',
  keywords: [
    'bookstore Sri Lanka',
    'Sinhala literature',
    'academic textbooks',
    'SLIIT books',
    'Sarasavi Pages',
    'online bookstore Colombo',
  ],
  authors: [{ name: 'Sarasavi Pages (Pvt) Ltd.' }],
  creator: 'Sarasavi Pages',
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    url: 'https://sarasavipages.lk',
    siteName: 'Sarasavi Pages',
    title: 'Sarasavi Pages® - Premier Curated Bookstore Sri Lanka',
    description:
      'Sri Lanka\'s premier curated bookstore. 1,500+ titles, islandwide delivery, rare archival editions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sarasavi Pages® - Premier Curated Bookstore Sri Lanka',
    description: 'Sri Lanka\'s premier curated bookstore and academic lending platform.',
    creator: '@sarasavipages',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#f7f9f7] text-[#0d0f12] antialiased selection:bg-emerald-950 selection:text-white font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
