import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import StorefrontAdminBar from '@/components/admin/StorefrontAdminBar';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cinzel:wght@400;600;700;800&family=Caveat:wght@400;600;700&display=swap"
        />
      </head>
      <body className="bg-[#F8F9F5] text-[#20231B] antialiased selection:bg-[#34451D] selection:text-white font-sans">
        <AuthProvider>
          <StorefrontAdminBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
