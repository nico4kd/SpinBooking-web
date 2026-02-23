'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import api from '../../../lib/api-client';
import { Card, Button, Badge, DatePicker, Select } from '../../../components/ui';
import { AdminLayout, AdminPageHeader } from '../../../components/admin';
import {
  Filter,
  CreditCard,
  DollarSign,
  Clock,
  TrendingUp,
  X,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { formatCurrency } from '@spinbooking/utils';
import { toast } from '../../../lib/toast';

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  externalId: string | null;
  receiptNumber: string | null;
  paidAt: string | null;
  createdAt: string;
  package: {
    id: string;
    type: string;
    status: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface PaymentStats {
  totalRevenue: number;
  pendingPayments: number;
  thisMonthRevenue: number;
  manualPayments: number;
}

interface PendingPackage {
  id: string;
  type: string;
  price: number;
  currency: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminPaymentsPage() {
  const { user, isAuthenticated } = useAuth();

  // Data state
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [pendingPackages, setPendingPackages] = useState<PendingPackage[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    thisMonthRevenue: 0,
    manualPayments: 0,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // UI state
  const [showManualPaymentForm, setShowManualPaymentForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'IN_PERSON_CASH' | 'IN_PERSON_CARD'>('IN_PERSON_CASH');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      loadPayments();
      loadPendingPackages();
    }
  }, [isAuthenticated, user, page, statusFilter, methodFilter, startDate, endDate]);

  const loadPayments = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: 20,
      };

      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      // Note: This endpoint needs to be created in the backend to support admin access
      // For now, we'll use the regular payments endpoint
      const response = await api.get('/payments', { params });

      const paymentsData = response.data;
      setPayments(paymentsData);

      // Calculate stats
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalRevenue = paymentsData
        .filter((p: PaymentData) => p.status === 'APPROVED')
        .reduce((sum: number, p: PaymentData) => sum + p.amount, 0);

      const pendingPayments = paymentsData.filter(
        (p: PaymentData) => p.status === 'PENDING' || p.status === 'PROCESSING'
      ).length;

      const thisMonthRevenue = paymentsData
        .filter((p: PaymentData) =>
          p.status === 'APPROVED' &&
          p.paidAt &&
          new Date(p.paidAt) >= firstDayOfMonth
        )
        .reduce((sum: number, p: PaymentData) => sum + p.amount, 0);

      const manualPayments = paymentsData.filter(
        (p: PaymentData) =>
          p.method === 'IN_PERSON_CASH' || p.method === 'IN_PERSON_CARD'
      ).length;

      setStats({
        totalRevenue,
        pendingPayments,
        thisMonthRevenue,
        manualPayments,
      });
    } catch (error: any) {
      console.error('Error loading payments:', error);
      setError(error.response?.data?.message || 'Error al cargar pagos');
    } finally {
      setLoadingData(false);
    }
  };

  const loadPendingPackages = async () => {
    try {
      // Note: This endpoint needs to be created to fetch all pending packages
      // For now, we'll use a placeholder
      const response = await api.get('/admin/packages?status=PENDING');
      setPendingPackages(response.data || []);
    } catch (error: any) {
      console.error('Error loading pending packages:', error);
      // Don't show error to user, just log it
      setPendingPackages([]);
    }
  };

  const handleRecordManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackage) {
      toast.warning('Por favor selecciona un paquete');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/payments/in-person/${selectedPackage}`, {
        method: paymentMethod,
        receiptNumber: receiptNumber || undefined,
      });

      toast.success(
        'Pago registrado exitosamente',
        {
          description: 'El paquete ha sido activado',
        }
      );

      // Reset form
      setSelectedPackage('');
      setPaymentMethod('IN_PERSON_CASH');
      setReceiptNumber('');
      setShowManualPaymentForm(false);

      // Reload data
      await loadPayments();
      await loadPendingPackages();
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast.error(
        'Error al registrar pago',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (payment: PaymentData) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleInitiateRefund = (payment: PaymentData) => {
    if (payment.status !== 'APPROVED') {
      toast.warning('Solo se pueden reembolsar pagos aprobados');
      return;
    }
    setSelectedPayment(payment);
    setRefundReason('');
    setShowRefundModal(true);
  };

  const handleProcessRefund = async () => {
    if (!selectedPayment) return;

    if (!refundReason.trim()) {
      toast.warning('Por favor ingresa el motivo del reembolso');
      return;
    }

    if (!confirm('¿Estás seguro de procesar este reembolso? Esta acción invalidará el paquete.')) {
      return;
    }

    setProcessingRefund(true);
    try {
      await api.post(`/payments/${selectedPayment.id}/refund`, {
        reason: refundReason,
      });

      toast.success('Reembolso procesado exitosamente');
      setShowRefundModal(false);
      setSelectedPayment(null);
      await loadPayments();
    } catch (error: any) {
      console.error('Error processing refund:', error);
      toast.error(
        'Error al procesar reembolso',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setProcessingRefund(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">Aprobado</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'PROCESSING':
        return <Badge variant="default">Procesando</Badge>;
      case 'REJECTED':
        return <Badge variant="hot">Rechazado</Badge>;
      case 'REFUNDED':
        return <Badge variant="default">Reembolsado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'ONLINE_MERCADOPAGO':
        return 'MercadoPago Online';
      case 'IN_PERSON_CASH':
        return 'Efectivo';
      case 'IN_PERSON_CARD':
        return 'Tarjeta (Presencial)';
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

  const selectedPkg = pendingPackages.find(p => p.id === selectedPackage);

  return (
    <>
      <AdminLayout>
      <AdminPageHeader
        title="Gestión de Pagos"
        subtitle={`${payments.length} pagos registrados`}
      />

      {/* Header Actions */}
      <div className="h-16 border-b border-[hsl(var(--border-default))] flex items-center justify-end pl-16 pr-4 sm:px-6 lg:px-8 bg-[hsl(var(--surface-0))]">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowManualPaymentForm(!showManualPaymentForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          {showManualPaymentForm ? 'Ocultar' : 'Registrar'} Pago Manual
        </Button>
      </div>

        {/* Statistics Cards */}
        <div className="border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--success)/0.15)] flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[hsl(var(--success))]" />
                </div>
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-secondary">Ingresos Totales</p>
                </div>
              </div>
            </Card>

            <Card variant="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--warning)/0.15)] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[hsl(var(--warning))]" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.pendingPayments}</p>
                  <p className="text-xs text-secondary">Pagos Pendientes</p>
                </div>
              </div>
            </Card>

            <Card variant="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats.thisMonthRevenue)}</p>
                  <p className="text-xs text-secondary">Este Mes</p>
                </div>
              </div>
            </Card>

            <Card variant="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent-hot)/0.15)] flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[hsl(var(--accent-hot))]" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.manualPayments}</p>
                  <p className="text-xs text-secondary">Pagos Manuales</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Manual Payment Form */}
        {showManualPaymentForm && (
          <div className="border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] p-6">
            <Card variant="elevated">
              <h2 className="text-lg font-semibold mb-4">Registrar Pago Manual</h2>
              <form onSubmit={handleRecordManualPayment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Paquete Pendiente <span className="text-[hsl(var(--error))]">*</span>
                    </label>
                    <Select
                      value={selectedPackage}
                      onValueChange={setSelectedPackage}
                      options={[
                        { value: '', label: 'Seleccionar paquete...' },
                        ...pendingPackages.map((pkg) => ({
                          value: pkg.id,
                          label: `${pkg.user.firstName} ${pkg.user.lastName} - ${getPackageTypeLabel(pkg.type)} (${formatCurrency(pkg.price)})`,
                        })),
                      ]}
                      searchable={pendingPackages.length > 5}
                      placeholder="Seleccionar paquete..."
                    />
                    {pendingPackages.length === 0 && (
                      <p className="text-xs text-secondary mt-1">
                        No hay paquetes pendientes de pago
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Método de Pago <span className="text-[hsl(var(--error))]">*</span>
                    </label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as any)}
                      options={[
                        { value: 'IN_PERSON_CASH', label: 'Efectivo' },
                        { value: 'IN_PERSON_CARD', label: 'Tarjeta (Presencial)' },
                      ]}
                      placeholder="Seleccionar método"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Número de Recibo (Opcional)
                    </label>
                    <input
                      type="text"
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      placeholder="REC-001"
                      className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                    />
                  </div>

                  <div className="flex items-end">
                    {selectedPkg && (
                      <div className="p-3 bg-[hsl(var(--surface-1))] rounded-[var(--radius-md)] w-full">
                        <p className="text-xs text-secondary">Monto a cobrar</p>
                        <p className="text-lg font-bold">{formatCurrency(selectedPkg.price)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-[hsl(var(--border-default))]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowManualPaymentForm(false);
                      setSelectedPackage('');
                      setReceiptNumber('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={submitting || !selectedPackage}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Registrar Pago
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
              </Button>
              {(statusFilter || methodFilter || startDate || endDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('');
                    setMethodFilter('');
                    setStartDate('');
                    setEndDate('');
                    setPage(1);
                  }}
                >
                  Limpiar Filtros
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-[hsl(var(--border-default))]">
                <div>
                  <label className="block text-sm font-medium mb-2">Estado</label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setPage(1);
                    }}
                    options={[
                      { value: '', label: 'Todos los estados' },
                      { value: 'APPROVED', label: 'Aprobado' },
                      { value: 'PENDING', label: 'Pendiente' },
                      { value: 'PROCESSING', label: 'Procesando' },
                      { value: 'REJECTED', label: 'Rechazado' },
                      { value: 'REFUNDED', label: 'Reembolsado' },
                    ]}
                    placeholder="Seleccionar estado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Método</label>
                  <Select
                    value={methodFilter}
                    onValueChange={(value) => {
                      setMethodFilter(value);
                      setPage(1);
                    }}
                    options={[
                      { value: '', label: 'Todos los métodos' },
                      { value: 'ONLINE_MERCADOPAGO', label: 'MercadoPago Online' },
                      { value: 'IN_PERSON_CASH', label: 'Efectivo' },
                      { value: 'IN_PERSON_CARD', label: 'Tarjeta (Presencial)' },
                    ]}
                    placeholder="Seleccionar método"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Desde</label>
                  <DatePicker
                    value={startDate ? new Date(startDate) : undefined}
                    onChange={(date) => {
                      setStartDate(date?.toISOString().split('T')[0] || '');
                      setPage(1);
                    }}
                    placeholder="Seleccionar fecha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Hasta</label>
                  <DatePicker
                    value={endDate ? new Date(endDate) : undefined}
                    onChange={(date) => {
                      setEndDate(date?.toISOString().split('T')[0] || '');
                      setPage(1);
                    }}
                    placeholder="Seleccionar fecha"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {error && (
            <Card variant="elevated" className="mb-6 bg-[hsl(var(--error)/0.08)] border-[hsl(var(--error)/0.3)]">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[hsl(var(--error))]" />
                <p className="text-sm text-[hsl(var(--error))]">{error}</p>
              </div>
            </Card>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                <p className="text-secondary">Cargando pagos...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Payments Table */}
              <Card variant="elevated" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[hsl(var(--surface-1))] border-b border-[hsl(var(--border-default))]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Paquete
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Método
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border-default))]">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <CreditCard className="w-12 h-12 text-tertiary" />
                              <p className="text-sm text-secondary">No se encontraron pagos</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr
                            key={payment.id}
                            className="hover:bg-[hsl(var(--surface-1))] transition-colors cursor-pointer"
                            onClick={() => handleViewDetails(payment)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatDateTime(payment.paidAt || payment.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="font-medium">
                                  {payment.package.user.firstName} {payment.package.user.lastName}
                                </p>
                                <p className="text-xs text-secondary">{payment.package.user.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {getPackageTypeLabel(payment.package.type)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {getPaymentMethodLabel(payment.method)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getPaymentStatusBadge(payment.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                {payment.status === 'APPROVED' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInitiateRefund(payment);
                                    }}
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Reembolsar
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </AdminLayout>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card variant="elevated" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Detalles del Pago</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPayment(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-secondary mb-1">ID de Pago</p>
                  <p className="font-mono text-sm">{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Estado</p>
                  {getPaymentStatusBadge(selectedPayment.status)}
                </div>
              </div>

              <div className="border-t border-[hsl(var(--border-default))] pt-4">
                <h3 className="font-semibold mb-3">Usuario</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-secondary mb-1">Nombre</p>
                    <p className="text-sm">
                      {selectedPayment.package.user.firstName} {selectedPayment.package.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary mb-1">Email</p>
                    <p className="text-sm">{selectedPayment.package.user.email}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[hsl(var(--border-default))] pt-4">
                <h3 className="font-semibold mb-3">Detalles del Pago</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-secondary mb-1">Monto</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary mb-1">Método</p>
                    <p className="text-sm">{getPaymentMethodLabel(selectedPayment.method)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary mb-1">Paquete</p>
                    <p className="text-sm">{getPackageTypeLabel(selectedPayment.package.type)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary mb-1">Fecha de Pago</p>
                    <p className="text-sm">
                      {selectedPayment.paidAt
                        ? formatDateTime(selectedPayment.paidAt)
                        : 'Pendiente'}
                    </p>
                  </div>
                  {selectedPayment.externalId && (
                    <div>
                      <p className="text-xs text-secondary mb-1">ID Externo (MercadoPago)</p>
                      <p className="text-sm font-mono">{selectedPayment.externalId}</p>
                    </div>
                  )}
                  {selectedPayment.receiptNumber && (
                    <div>
                      <p className="text-xs text-secondary mb-1">Número de Recibo</p>
                      <p className="text-sm font-mono">{selectedPayment.receiptNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedPayment.status === 'APPROVED' && (
                <div className="border-t border-[hsl(var(--border-default))] pt-4">
                  <Button
                    variant="hot"
                    size="sm"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleInitiateRefund(selectedPayment);
                    }}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Procesar Reembolso
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card variant="elevated" className="max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Confirmar Reembolso</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedPayment(null);
                  setRefundReason('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[hsl(var(--warning)/0.1)] border border-[hsl(var(--warning)/0.3)] rounded-[var(--radius-md)]">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-[hsl(var(--warning))] flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">¿Estás seguro?</p>
                    <p className="text-xs text-secondary mt-1">
                      Esta acción reembolsará el pago e invalidará el paquete del usuario.
                      Los tickets no utilizados serán marcados como reembolsados.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm mb-2">
                  <strong>Usuario:</strong> {selectedPayment.package.user.firstName}{' '}
                  {selectedPayment.package.user.lastName}
                </p>
                <p className="text-sm mb-2">
                  <strong>Monto:</strong> {formatCurrency(selectedPayment.amount)}
                </p>
                <p className="text-sm mb-4">
                  <strong>Paquete:</strong> {getPackageTypeLabel(selectedPayment.package.type)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Motivo del Reembolso <span className="text-[hsl(var(--error))]">*</span>
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Ingresa el motivo del reembolso..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border-default))]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedPayment(null);
                    setRefundReason('');
                  }}
                  className="flex-1"
                  disabled={processingRefund}
                >
                  Cancelar
                </Button>
                <Button
                  variant="hot"
                  size="sm"
                  onClick={handleProcessRefund}
                  className="flex-1"
                  disabled={processingRefund || !refundReason.trim()}
                >
                  {processingRefund ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar Reembolso
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
