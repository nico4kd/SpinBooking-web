'use client';

/**
 * Global error boundary — catches errors in the root layout itself.
 * Must render its own <html> and <body> since the root layout may have crashed.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: '#0a0a0b',
            color: '#e4e4e7',
          }}
        >
          <div style={{ maxWidth: 400, textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Algo salió mal
            </h1>
            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
              Ocurrió un error crítico. Por favor recarga la página.
            </p>
            {error.digest && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#71717a',
                  fontFamily: 'monospace',
                  marginBottom: '1.5rem',
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: 8,
                border: 'none',
                background: '#06b6d4',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Recargar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
