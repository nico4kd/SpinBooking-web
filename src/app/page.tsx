'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-context';
import Link from 'next/link';
import { Button } from '../components/ui';
import { Zap, Calendar, Users, TrendingUp } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
          <p className="text-secondary">Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(var(--primary)/0.08)] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(var(--accent-hot)/0.06)] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl text-center space-y-12">
          {/* Hero section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))]">
              <Zap className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span className="text-sm text-secondary">
                Reserva tu energía
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[hsl(var(--text-primary))] via-[hsl(var(--primary))] to-[hsl(var(--text-primary))] bg-clip-text text-transparent">
                SpinBooking
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-secondary max-w-2xl mx-auto">
              Sistema de reservas para clases de spinning.{' '}
              <span className="text-primary">
                Mantén tu momentum.
              </span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="xl" variant="primary" className="w-full sm:w-auto">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                Crear Cuenta
              </Button>
            </Link>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12">
            <div className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))] rounded-[var(--radius-lg)] p-6 space-y-3 hover:border-[hsl(var(--border-emphasis))] transition-colors">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="font-semibold text-lg">Reserva Fácil</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Calendario intuitivo para reservar tu spot en segundos
              </p>
            </div>

            <div className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))] rounded-[var(--radius-lg)] p-6 space-y-3 hover:border-[hsl(var(--border-emphasis))] transition-colors">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[hsl(var(--accent-hot)/0.15)] flex items-center justify-center">
                <Users className="w-5 h-5 text-[hsl(var(--accent-hot))]" />
              </div>
              <h3 className="font-semibold text-lg">Gestión de Paquetes</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Administra tus créditos y paquetes en un solo lugar
              </p>
            </div>

            <div className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))] rounded-[var(--radius-lg)] p-6 space-y-3 hover:border-[hsl(var(--border-emphasis))] transition-colors">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[hsl(var(--success)/0.15)] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[hsl(var(--success))]" />
              </div>
              <h3 className="font-semibold text-lg">Tracking Personal</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Mantén tu racha y visualiza tu progreso
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-8 text-sm text-tertiary">
            <p>Desarrollado con energía by SpinBooking Team</p>
          </div>
        </div>
      </div>
    </main>
  );
}
