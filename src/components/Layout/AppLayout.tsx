'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * AppLayout - Shared layout for authenticated pages
 *
 * Features:
 * - Automatic authentication check
 * - Sidebar with auto-active navigation
 * - Loading state handling
 * - Consistent structure across all pages
 *
 * Usage:
 * ```tsx
 * export default function DashboardPage() {
 *   return (
 *     <AppLayout>
 *       <PageHeader title="Dashboard" description="..." />
 *       <div className="p-8">
 *         {content}
 *       </div>
 *     </AppLayout>
 *   );
 * }
 * ```
 */
export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
          <p className="text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show nothing (will redirect)
  if (!user) {
    return null;
  }

  // Authenticated - render layout
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-16 lg:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
