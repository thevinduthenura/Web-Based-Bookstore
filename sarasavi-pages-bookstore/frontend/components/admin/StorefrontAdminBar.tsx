'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';
import AdminModeBar from '@/components/admin/AdminModeBar';
import type { AuthUser } from '@/types/admin';

export default function StorefrontAdminBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeStaff, setActiveStaff] = useState<AuthUser | null>(user);

  useEffect(() => {
    setMounted(true);
    const syncStaff = () => {
      if (user) {
        setActiveStaff(user);
        return;
      }
      try {
        const staffRaw = Cookies.get('sp_user') || (typeof window !== 'undefined' ? localStorage.getItem('sp_user') : null);
        if (staffRaw) {
          setActiveStaff(JSON.parse(staffRaw));
        } else {
          setActiveStaff(null);
        }
      } catch {
        setActiveStaff(null);
      }
    };

    syncStaff();
    window.addEventListener('sp_user_updated', syncStaff);
    window.addEventListener('storage', syncStaff);
    return () => {
      window.removeEventListener('sp_user_updated', syncStaff);
      window.removeEventListener('storage', syncStaff);
    };
  }, [user]);

  // Do not render on admin dashboard pages (/admin/*) or when no staff user is authenticated
  if (!mounted || !activeStaff || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full animate-in fade-in duration-150">
      <AdminModeBar showOnStorefront={true} />
    </div>
  );
}
