'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api-client';
import { Card, Button } from '../ui';
import {
  X,
  Search,
  RefreshCw,
  ChevronLeft,
  CheckCircle,
  User,
  CreditCard,
  Banknote,
  AlertCircle,
} from 'lucide-react';
import { PackageType } from '@spinbooking/types';
import { formatCurrency } from '@spinbooking/utils';
import { toast } from '../../lib/toast';

// --- Interfaces ---

interface ManualPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalStep = 1 | 2 | 3 | 4;

interface SelectedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  nroDocumento: string;
}

interface ManualPaymentFormData {
  selectedUser: SelectedUser | null;
  packageType: PackageType | null;
  paymentMethod: 'IN_PERSON_CASH' | 'IN_PERSON_CARD' | null;
}

interface SearchState {
  query: string;
  results: SelectedUser[];
  loading: boolean;
  searched: boolean;
  error: string | null;
}

// --- Package Options ---
// Mirrors PACKAGE_CONFIGS from SpinBooking-api/src/config/package.config.ts
// TODO: Centralize in @spinbooking/types or fetch from API
const PACKAGE_OPTIONS = [
  { type: PackageType.TRIAL, label: 'Prueba (1 clase)', price: 3000, tickets: 1 },
  { type: PackageType.STARTER, label: 'Inicial (4 clases)', price: 10000, tickets: 4 },
  { type: PackageType.REGULAR, label: 'Regular (8 clases)', price: 18000, tickets: 8 },
  { type: PackageType.PRO, label: 'Pro (12 clases)', price: 24000, tickets: 12 },
  { type: PackageType.UNLIMITED, label: 'Ilimitado (30 dias)', price: 35000, tickets: 999 },
] as const;

const INITIAL_FORM_DATA: ManualPaymentFormData = {
  selectedUser: null,
  packageType: null,
  paymentMethod: null,
};

const INITIAL_SEARCH_STATE: SearchState = {
  query: '',
  results: [],
  loading: false,
  searched: false,
  error: null,
};

// --- Component ---

export function ManualPaymentModal({ open, onClose, onSuccess }: ManualPaymentModalProps) {
  const [step, setStep] = useState<ModalStep>(1);
  const [formData, setFormData] = useState<ManualPaymentFormData>(INITIAL_FORM_DATA);
  const [searchState, setSearchState] = useState<SearchState>(INITIAL_SEARCH_STATE);
  const [submitting, setSubmitting] = useState(false);

  // Reset all state when modal closes
  const handleClose = () => {
    if (submitting) return;
    setStep(1);
    setFormData(INITIAL_FORM_DATA);
    setSearchState(INITIAL_SEARCH_STATE);
    setSubmitting(false);
    onClose();
  };

  // Debounced search: 300ms after user stops typing
  useEffect(() => {
    if (!open) return;

    const query = searchState.query.trim();
    if (!query) {
      setSearchState((prev) => ({ ...prev, results: [], searched: false, error: null }));
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await api.get('/admin/users', { params: { search: query } });
        const users = (response.data?.data || response.data || []).map((u: any) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          nroDocumento: u.nroDocumento,
        }));
        setSearchState((prev) => ({ ...prev, results: users, loading: false, searched: true }));
      } catch (error: any) {
        console.error('Error searching users:', error);
        setSearchState((prev) => ({
          ...prev,
          results: [],
          loading: false,
          searched: true,
          error: 'Error al buscar usuario. Intenta nuevamente.',
        }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchState.query, open]);

  // --- Step handlers ---

  const handleSelectUser = (user: SelectedUser) => {
    setFormData((prev) => ({ ...prev, selectedUser: user }));
    setStep(2);
  };

  const handleSelectPackage = (packageType: PackageType) => {
    setFormData((prev) => ({ ...prev, packageType }));
    setStep(3);
  };

  const handleSelectPaymentMethod = (method: 'IN_PERSON_CASH' | 'IN_PERSON_CARD') => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
    setStep(4);
  };

  const handleBack = () => {
    if (submitting) return;
    if (step === 2) {
      setFormData((prev) => ({ ...prev, selectedUser: null }));
      setStep(1);
    } else if (step === 3) {
      setFormData((prev) => ({ ...prev, packageType: null }));
      setStep(2);
    } else if (step === 4) {
      setFormData((prev) => ({ ...prev, paymentMethod: null }));
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!formData.selectedUser || !formData.packageType || !formData.paymentMethod) return;

    setSubmitting(true);
    try {
      // Step 1: Create package for user
      const pkgResponse = await api.post(
        `/admin/users/${formData.selectedUser.id}/package`,
        { packageType: formData.packageType }
      );
      const packageId = pkgResponse.data?.package?.id || pkgResponse.data?.id;

      if (!packageId) {
        throw new Error('No se recibio el ID del paquete creado');
      }

      // Step 2: Create in-person payment for that package
      try {
        await api.post(`/payments/in-person/${packageId}`, {
          method: formData.paymentMethod,
        });
      } catch (paymentError: any) {
        toast.error('El paquete fue creado pero el pago fallo', {
          description:
            paymentError.response?.data?.message ||
            'Revisa en /admin/payments para completar el pago del paquete pendiente.',
        });
        setSubmitting(false);
        return;
      }

      const selectedPkg = PACKAGE_OPTIONS.find((p) => p.type === formData.packageType);
      toast.success('Pago registrado exitosamente', {
        description: `${formData.selectedUser.firstName} ${formData.selectedUser.lastName} — ${selectedPkg?.label} (${selectedPkg?.tickets === 999 ? 'ilimitado' : selectedPkg?.tickets + ' creditos'})`,
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error('Error al registrar pago', {
        description: error.response?.data?.message || 'Por favor intenta nuevamente',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Helpers ---

  const selectedPkg = PACKAGE_OPTIONS.find((p) => p.type === formData.packageType);

  const stepLabels: Record<ModalStep, string> = {
    1: 'Buscar Alumno',
    2: 'Seleccionar Paquete',
    3: 'Metodo de Pago',
    4: 'Confirmar',
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card variant="elevated" className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Registrar Pago Manual</h2>
            <p className="text-xs text-secondary mt-0.5">
              Paso {step} de 4 — {stepLabels[step]}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={submitting}
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 mb-6">
          {([1, 2, 3, 4] as ModalStep[]).map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step
                  ? 'bg-[hsl(var(--primary))]'
                  : 'bg-[hsl(var(--surface-1))]'
              }`}
            />
          ))}
        </div>

        {/* Step 1: DNI Search */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                value={searchState.query}
                onChange={(e) =>
                  setSearchState((prev) => ({ ...prev, query: e.target.value }))
                }
                placeholder="Ingresa el DNI del alumno"
                className="w-full pl-10 pr-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                autoFocus
              />
            </div>

            {/* Loading */}
            {searchState.loading && (
              <div className="flex items-center gap-2 py-4 text-secondary text-sm">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                Buscando...
              </div>
            )}

            {/* Error */}
            {searchState.error && !searchState.loading && (
              <div className="flex items-center gap-2 py-4 text-sm text-[hsl(var(--error))]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {searchState.error}
              </div>
            )}

            {/* Results */}
            {!searchState.loading && !searchState.error && searchState.results.length > 0 && (
              <div className="space-y-2">
                {searchState.results.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full text-left p-3 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--surface-1))] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-[hsl(var(--primary))]" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-secondary">DNI: {user.nroDocumento}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!searchState.loading &&
              !searchState.error &&
              searchState.searched &&
              searchState.results.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-6">
                  <Search className="w-8 h-8 text-secondary" />
                  <p className="text-sm text-secondary">Usuario no encontrado</p>
                </div>
              )}
          </div>
        )}

        {/* Step 2: Package Selection */}
        {step === 2 && formData.selectedUser && (
          <div className="space-y-4">
            {/* Selected user summary */}
            <div className="p-3 bg-[hsl(var(--surface-1))] rounded-[var(--radius-md)] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {formData.selectedUser.firstName} {formData.selectedUser.lastName}
                </p>
                <p className="text-xs text-secondary">DNI: {formData.selectedUser.nroDocumento}</p>
              </div>
            </div>

            {/* Package options */}
            <div className="space-y-2">
              {PACKAGE_OPTIONS.map((pkg) => (
                <button
                  key={pkg.type}
                  onClick={() => handleSelectPackage(pkg.type)}
                  className="w-full text-left p-3 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--surface-1))] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{pkg.label}</p>
                      <p className="text-xs text-secondary">
                        {pkg.tickets === 999 ? 'Clases ilimitadas' : `${pkg.tickets} clases`}
                      </p>
                    </div>
                    <p className="font-bold text-sm">{formatCurrency(pkg.price)}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Back */}
            <div className="pt-4 border-t border-[hsl(var(--border-default))]">
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Volver
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment Method Selection */}
        {step === 3 && formData.selectedUser && formData.packageType && (
          <div className="space-y-4">
            {/* Selected user + package summary */}
            <div className="p-3 bg-[hsl(var(--surface-1))] rounded-[var(--radius-md)] space-y-1">
              <p className="text-sm">
                <span className="text-secondary">Alumno: </span>
                <strong>
                  {formData.selectedUser.firstName} {formData.selectedUser.lastName}
                </strong>
              </p>
              <p className="text-sm">
                <span className="text-secondary">Paquete: </span>
                <strong>{selectedPkg?.label}</strong>
                {' — '}
                <span className="font-bold">{formatCurrency(selectedPkg?.price ?? 0)}</span>
              </p>
            </div>

            {/* Payment method options */}
            <div className="space-y-2">
              <button
                onClick={() => handleSelectPaymentMethod('IN_PERSON_CASH')}
                className="w-full text-left p-3 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--surface-1))] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--success)/0.15)] flex items-center justify-center">
                    <Banknote className="w-4 h-4 text-[hsl(var(--success))]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Efectivo</p>
                    <p className="text-xs text-secondary">Pago en efectivo presencial</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectPaymentMethod('IN_PERSON_CARD')}
                className="w-full text-left p-3 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--surface-1))] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Tarjeta Presencial</p>
                    <p className="text-xs text-secondary">Pago con tarjeta en el estudio</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Back */}
            <div className="pt-4 border-t border-[hsl(var(--border-default))]">
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Volver
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation & Submit */}
        {step === 4 && formData.selectedUser && formData.packageType && formData.paymentMethod && (
          <div className="space-y-4">
            {/* Full summary */}
            <div className="p-4 bg-[hsl(var(--surface-1))] rounded-[var(--radius-md)] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {formData.selectedUser.firstName} {formData.selectedUser.lastName}
                  </p>
                  <p className="text-xs text-secondary">DNI: {formData.selectedUser.nroDocumento}</p>
                </div>
              </div>

              <div className="border-t border-[hsl(var(--border-default))] pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Paquete</span>
                  <span className="font-medium">{selectedPkg?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Precio</span>
                  <span className="font-bold">{formatCurrency(selectedPkg?.price ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Metodo de pago</span>
                  <span className="font-medium">
                    {formData.paymentMethod === 'IN_PERSON_CASH' ? 'Efectivo' : 'Tarjeta Presencial'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Creditos</span>
                  <span className="font-medium">
                    {selectedPkg?.tickets === 999 ? 'Ilimitado' : `${selectedPkg?.tickets} clases`}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border-default))]">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={submitting}
                onClick={handleBack}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Volver
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Pago
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
