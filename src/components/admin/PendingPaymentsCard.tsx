'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import api from '../../lib/api-client';
import { Card, Button } from '../ui';
import { Clock, CheckCircle, RefreshCw, X, Banknote, Building2, AlertCircle, Plus } from 'lucide-react';
import { formatCurrency } from '@spinbooking/utils';
import { toast } from '../../lib/toast';
import { ManualPaymentModal } from './ManualPaymentModal';

interface PendingManualPaymentData {
  paymentId: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  reference?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  package: {
    id: string;
    type: string;
  };
}

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case 'ONLINE_MERCADOPAGO':
      return 'MercadoPago Online';
    case 'IN_PERSON_CASH':
      return 'Efectivo';
    case 'IN_PERSON_CARD':
      return 'Tarjeta (Presencial)';
    case 'BANK_TRANSFER':
      return 'Transferencia Bancaria';
    default:
      return method;
  }
};

const getPackageTypeLabel = (type: string) => {
  switch (type) {
    case 'TRIAL':
      return 'Prueba (1 clase)';
    case 'STARTER':
      return 'Inicial (4 clases)';
    case 'REGULAR':
      return 'Regular (8 clases)';
    case 'PRO':
      return 'Pro (12 clases)';
    case 'UNLIMITED':
      return 'Ilimitado';
    default:
      return type;
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function PendingPaymentsCard() {
  const { user, isAuthenticated } = useAuth();

  const [pendingManualPayments, setPendingManualPayments] = useState<PendingManualPaymentData[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPendingPayment, setSelectedPendingPayment] = useState<PendingManualPaymentData | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadPendingManualPayments = async () => {
    setLoadingPending(true);
    try {
      const response = await api.get('/payments/admin/pending');
      setPendingManualPayments(response.data || []);
    } catch (error: any) {
      console.error('Error loading pending manual payments:', error);
      // Keep stale data on polling error
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      loadPendingManualPayments();
    }
  }, [isAuthenticated, user]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return;

    const intervalId = setInterval(() => {
      loadPendingManualPayments();
    }, 15_000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, user]);

  const handleConfirmPayment = async (paymentId: string) => {
    setProcessingAction(paymentId);
    try {
      await api.post(`/payments/${paymentId}/confirm`);
      toast.success('Pago confirmado', { description: 'El paquete ha sido activado' });
      await loadPendingManualPayments();
    } catch (error: any) {
      toast.error('Error al confirmar pago', {
        description: error.response?.data?.message || 'Por favor intenta nuevamente',
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPendingPayment) return;
    if (!rejectReason.trim()) {
      toast.warning('Por favor ingresa el motivo del rechazo');
      return;
    }
    setProcessingAction(selectedPendingPayment.paymentId);
    try {
      await api.post(`/payments/${selectedPendingPayment.paymentId}/reject`, { reason: rejectReason });
      toast.success('Pago rechazado');
      setShowRejectModal(false);
      setSelectedPendingPayment(null);
      setRejectReason('');
      await loadPendingManualPayments();
    } catch (error: any) {
      toast.error('Error al rechazar pago', {
        description: error.response?.data?.message || 'Por favor intenta nuevamente',
      });
    } finally {
      setProcessingAction(null);
    }
  };

  return (
    <>
      <Card variant="elevated" className="overflow-hidden">
        <div className="p-6 border-b border-[hsl(var(--border-default))]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--warning)/0.15)] flex items-center justify-center">
              <Clock className="w-4 h-4 text-[hsl(var(--warning))]" />
            </div>
            <div>
              <h2 className="font-semibold">Pagos pendientes de confirmación</h2>
              <p className="text-xs text-secondary">
                Transferencias y pagos en efectivo que requieren acción del administrador
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {pendingManualPayments.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))] text-xs font-bold">
                  {pendingManualPayments.length}
                </span>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowManualPaymentModal(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Pago Manual
              </Button>
            </div>
          </div>
        </div>

        {loadingPending ? (
          <div className="flex items-center gap-2 p-6 text-secondary text-sm">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
            Cargando...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[hsl(var(--surface-1))] border-b border-[hsl(var(--border-default))]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Paquete
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Referencia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border-default))]">
                {pendingManualPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="w-8 h-8 text-[hsl(var(--success))]" />
                        <p className="text-sm text-secondary">No hay pagos pendientes de confirmación</p>
                      </div>
                    </td>
                  </tr>
                )}
                {pendingManualPayments.map((p) => {
                  const isProcessing = processingAction === p.paymentId;
                  return (
                    <tr key={p.paymentId} className="hover:bg-[hsl(var(--surface-1))] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium text-sm">
                          {p.user.firstName} {p.user.lastName}
                        </p>
                        <p className="text-xs text-secondary">{p.user.email}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {p.method === 'BANK_TRANSFER' ? (
                            <Building2 className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                          ) : (
                            <Banknote className="w-3.5 h-3.5 text-[hsl(var(--success))]" />
                          )}
                          <span className="text-sm">{getPaymentMethodLabel(p.method)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {getPackageTypeLabel(p.package.type)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-semibold text-sm">{formatCurrency(p.amount)}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.reference ? (
                          <span className="font-mono text-xs bg-[hsl(var(--surface-1))] px-2 py-1 rounded">
                            {p.reference}
                          </span>
                        ) : (
                          <span className="text-xs text-tertiary">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">
                        {formatDateTime(p.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isProcessing}
                            onClick={() => handleConfirmPayment(p.paymentId)}
                          >
                            {isProcessing ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            Confirmar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isProcessing}
                            onClick={() => {
                              setSelectedPendingPayment(p);
                              setRejectReason('');
                              setShowRejectModal(true);
                            }}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Reject Modal */}
      {showRejectModal && selectedPendingPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card variant="elevated" className="max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Rechazar pago</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPendingPayment(null);
                  setRejectReason('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[hsl(var(--error)/0.08)] border border-[hsl(var(--error)/0.3)] rounded-[var(--radius-md)]">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-[hsl(var(--error))] flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Esta acción no se puede deshacer</p>
                    <p className="text-xs text-secondary mt-1">
                      {selectedPendingPayment.method === 'BANK_TRANSFER'
                        ? 'El paquete será cancelado y el usuario deberá iniciar el proceso nuevamente.'
                        : 'El paquete activo será cancelado y los tickets serán reembolsados.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm space-y-1">
                <p>
                  <span className="text-secondary">Usuario: </span>
                  <strong>{selectedPendingPayment.user.firstName} {selectedPendingPayment.user.lastName}</strong>
                </p>
                <p>
                  <span className="text-secondary">Método: </span>
                  {getPaymentMethodLabel(selectedPendingPayment.method)}
                </p>
                <p>
                  <span className="text-secondary">Monto: </span>
                  <strong>{formatCurrency(selectedPendingPayment.amount)}</strong>
                </p>
                {selectedPendingPayment.reference && (
                  <p>
                    <span className="text-secondary">Referencia: </span>
                    <span className="font-mono">{selectedPendingPayment.reference}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Motivo del rechazo <span className="text-[hsl(var(--error))]">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ej: Transferencia no recibida, monto incorrecto..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border-default))]">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={processingAction !== null}
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedPendingPayment(null);
                    setRejectReason('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="hot"
                  size="sm"
                  className="flex-1"
                  disabled={processingAction !== null || !rejectReason.trim()}
                  onClick={handleRejectPayment}
                >
                  {processingAction ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Rechazando...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Confirmar rechazo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <ManualPaymentModal
        open={showManualPaymentModal}
        onClose={() => setShowManualPaymentModal(false)}
        onSuccess={() => loadPendingManualPayments()}
      />
    </>
  );
}
