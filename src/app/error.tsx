'use client';

import { useEffect } from 'react';
import { Button } from '../components/ui';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--surface-0))] p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[hsl(var(--error)/0.15)] flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-[hsl(var(--error))]" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-primary">
            Algo salió mal
          </h1>
          <p className="text-secondary">
            Ocurrió un error inesperado. Por favor intenta nuevamente.
          </p>
          {error.digest && (
            <p className="text-xs text-tertiary font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={reset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar nuevamente
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Button>
        </div>

        <div className="pt-6 border-t border-[hsl(var(--border-default))]">
          <p className="text-sm text-tertiary">
            Si el problema persiste, por favor{' '}
            <a
              href="mailto:soporte@spinbooking.com"
              className="text-[hsl(var(--primary))] hover:underline"
            >
              contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
