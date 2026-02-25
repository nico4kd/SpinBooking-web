'use client';

import { Card, Button } from '../../../components/ui';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CashPendingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--surface-0))] flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-20 h-20 rounded-full bg-[hsl(var(--primary)/0.15)] items-center justify-center">
            <Clock className="w-10 h-10 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">¡Pago registrado!</h1>
            <p className="text-secondary mt-1">
              Revisaremos el pago y activaremos tu paquete. Te notificamos cuando esté listo.
            </p>
          </div>
        </div>

        {/* What happens next card */}
        <Card variant="default">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">¿Qué pasa ahora?</p>
              <p className="text-sm text-secondary mt-1">
                Nuestro equipo confirmará el cobro en efectivo y activará tu paquete
                dentro de las <strong>24 hs hábiles</strong>. Recibirás una notificación
                cuando esté listo para reservar clases.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <Link href="/dashboard">
          <Button variant="primary" size="md" className="w-full">
            Ir a mi dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <Link href="/packages" className="block text-center text-sm text-secondary hover:text-primary transition-colors">
          Ver mis paquetes
        </Link>
      </div>
    </div>
  );
}
