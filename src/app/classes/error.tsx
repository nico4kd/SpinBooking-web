'use client';

import { useEffect } from 'react';
import { Button } from '../../components/ui';
import { AlertTriangle, RefreshCw, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClassesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Classes page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--surface-0))] p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[hsl(var(--error)/0.15)] flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-[hsl(var(--error))]" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-primary">
            Error al cargar las clases
          </h1>
          <p className="text-secondary">
            No pudimos cargar la lista de clases disponibles. Por favor intenta nuevamente.
          </p>
          {error.digest && (
            <p className="text-xs text-tertiary font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={reset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Volver al Dashboard
          </Button>
        </div>

        {/* Additional help */}
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
