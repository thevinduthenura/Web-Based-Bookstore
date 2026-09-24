'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminModeBar from '@/components/admin/AdminModeBar';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?error=admin_required');
    }
  }, [user, isLoading, router]);

  // Close mobile sidebar on route transition
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // If loading, display a graceful loading spinner
  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8F9F5] text-[#20231B]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#34451D] border-t-transparent" />
          <p className="text-xs font-semibold text-[#596B32] font-mono">Authenticating Admin Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#20231B] flex flex-col font-sans antialiased selection:bg-[#34451D] selection:text-white admin-theme">
      <AdminModeBar />
      <div className="flex-1 flex">
        <Sidebar 
          isMobileOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <Header 
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)} 
          />
          <main className="flex-1 p-3.5 sm:p-6 md:p-8 relative bg-[#F8F9F5]">
            {/* Subtle ambient light in top-right of main view */}
            <div className="absolute top-0 right-10 w-96 h-96 bg-[#B7D85A]/10 rounded-full blur-[160px] pointer-events-none" />
            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
