'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button } from '../../../components/ui';
import { Building2, Copy, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils/currency';
import Link from 'next/link';

function TransferPendingContent() {
  const searchParams = useSearchParams();

  const ref = searchParams.get('ref') || '';
  const amount = Number(searchParams.get('amount') || 0);
  const alias = searchParams.get('alias') || '';
  const holder = searchParams.get('holder') || '';
  const bank = searchParams.get('bank') || '';

  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const copyToClipboard = async (text: string, type: 'alias' | 'ref') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'alias') {
        setCopiedAlias(true);
        setTimeout(() => setCopiedAlias(false), 2000);
      } else {
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
      }
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-0))] flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-20 h-20 rounded-full bg-[hsl(var(--primary)/0.15)] items-center justify-center">
            <Building2 className="w-10 h-10 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">¡Transferencia registrada!</h1>
            <p className="text-secondary mt-1">
              Realizá la transferencia con los datos de abajo para activar tu paquete.
            </p>
          </div>
        </div>

        {/* Transfer details */}
        <Card variant="elevated">
          <h2 className="font-semibold mb-4">Datos para transferir</h2>
          <div className="space-y-3">
            {/* Alias */}
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))]">
              <div>
                <p className="text-xs text-tertiary mb-0.5">Alias</p>
                <p className="font-mono font-semibold">{alias}</p>
              </div>
              <button
                onClick={() => copyToClipboard(alias, 'alias')}
                className="flex items-center gap-1.5 text-xs text-[hsl(var(--primary))] hover:opacity-80 transition-opacity"
              >
                {copiedAlias ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiedAlias ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            {/* Holder */}
            <div className="p-3 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))]">
              <p className="text-xs text-tertiary mb-0.5">Titular</p>
              <p className="font-semibold">{holder}</p>
            </div>

            {/* Bank */}
            {bank && (
              <div className="p-3 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))]">
                <p className="text-xs text-tertiary mb-0.5">Banco</p>
                <p className="font-semibold">{bank}</p>
              </div>
            )}

            {/* Amount */}
            <div className="p-3 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))]">
              <p className="text-xs text-tertiary mb-0.5">Monto</p>
              <p className="text-xl font-bold text-[hsl(var(--primary))]">
                {formatCurrency(amount)}
              </p>
            </div>

            {/* Reference */}
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.2)]">
              <div>
                <p className="text-xs text-tertiary mb-0.5">Referencia (concepto)</p>
                <p className="font-mono font-bold text-[hsl(var(--primary))]">{ref}</p>
              </div>
              <button
                onClick={() => copyToClipboard(ref, 'ref')}
                className="flex items-center gap-1.5 text-xs text-[hsl(var(--primary))] hover:opacity-80 transition-opacity"
              >
                {copiedRef ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiedRef ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <p className="text-xs text-secondary mt-4">
            Incluí la referencia en el concepto de la transferencia para que podamos identificarla.
          </p>
        </Card>

        {/* Timeline */}
        <Card variant="default">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">¿Qué pasa ahora?</p>
              <p className="text-sm text-secondary mt-1">
                Una vez que realices la transferencia, nuestro equipo la verificará y activará tu
                paquete dentro de las <strong>24 hs hábiles</strong>. Recibirás una notificación
                cuando esté listo.
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

export default function TransferPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
        </div>
      }
    >
      <TransferPendingContent />
    </Suspense>
  );
}
