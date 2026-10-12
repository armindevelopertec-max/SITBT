'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usarAlmacenAutenticacion } from '@/store/almacen-autenticacion';
import BarraLateral from '@/components/layout/BarraLateral';
import Encabezado from '@/components/layout/Encabezado';
import { cn } from '@/lib/utilidades';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = usarAlmacenAutenticacion();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleMenuClick = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BarraLateral
        colapsada={isMobile ? false : sidebarCollapsed}
        abierta={isMobile ? sidebarOpen : true}
        onCerrar={() => setSidebarOpen(false)}
        onColapsar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={cn(
          'transition-all duration-300',
          isMobile ? '' : (sidebarCollapsed ? 'ml-16' : 'ml-64')
        )}
      >
        <Encabezado onMenuClick={handleMenuClick} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
