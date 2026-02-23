'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import Link from 'next/link';
import { Button, Input, Card } from '../../../components/ui';
import { LogIn, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[hsl(var(--primary)/0.08)] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition-opacity"
          >
            <Zap className="w-6 h-6 text-[hsl(var(--primary))]" />
            SpinBooking
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bienvenido de vuelta</h2>
            <p className="mt-2 text-sm text-secondary">
              ¿No tienes cuenta?{' '}
              <Link
                href="/register"
                className="font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-hover))] transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card variant="elevated">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-[var(--radius-md)] bg-[hsl(var(--destructive)/0.15)] border border-[hsl(var(--destructive)/0.3)] p-4">
                <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
              </div>
            )}

            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Contraseña"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-hover))] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </span>
              )}
            </Button>
          </form>
        </Card>

        {/* Test users info */}
        <Card variant="default" padding="sm">
          <div className="text-center space-y-2">
            <p className="text-xs font-medium text-secondary">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-tertiary">
              <p>
                <span className="font-mono text-[hsl(var(--primary))]">admin@spinbooking.com</span>{' '}
                / Admin123!
              </p>
              <p>
                <span className="font-mono text-[hsl(var(--primary))]">
                  carolina.member@spinbooking.com
                </span>{' '}
                / Member123!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
