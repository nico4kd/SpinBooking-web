'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import api from '../../../lib/api-client';
import { Card, Button } from '../../../components/ui';
import { AdminLayout, AdminPageHeader } from '../../../components/admin';
import { SlidersHorizontal, Save, RefreshCw, AlertCircle, CheckCircle2, Building2, ListChecks, Clock } from 'lucide-react';
import { toast } from '../../../lib/toast';

interface SystemConfigEntry {
  key: string;
  value: string;
  label?: string;
  updatedAt: string;
}

// Bank alias well-known keys
const BANK_KEYS = ['bank_alias', 'bank_alias_holder', 'bank_alias_bank'] as const;

const BANK_KEY_LABELS: Record<string, string> = {
  bank_alias: 'Alias CBU/CVU',
  bank_alias_holder: 'Titular de la cuenta',
  bank_alias_bank: 'Banco (opcional)',
};

const BANK_KEY_PLACEHOLDERS: Record<string, string> = {
  bank_alias: 'spinbooking.pagos',
  bank_alias_holder: 'SpinBooking S.A.',
  bank_alias_bank: 'Banco Galicia',
};

export default function AdminSettingsPage() {
  const { user, isAuthenticated } = useAuth();

  const [configs, setConfigs] = useState<Record<string, string>>({
    bank_alias: '',
    bank_alias_holder: '',
    bank_alias_bank: '',
    waitlist_enabled: 'false',
    cancellation_deadline_hours: '1',
  });
  const [originalConfigs, setOriginalConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      loadConfigs();
    }
  }, [isAuthenticated, user]);

  const loadConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/system-config');
      const entries: SystemConfigEntry[] = response.data;

      const mapped: Record<string, string> = {
        bank_alias: '',
        bank_alias_holder: '',
        bank_alias_bank: '',
        waitlist_enabled: 'false',
        cancellation_deadline_hours: '1',
      };
      for (const entry of entries) {
        if (entry.key in mapped) {
          mapped[entry.key] = entry.value;
        }
      }

      setConfigs(mapped);
      setOriginalConfigs(mapped);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string) => {
    const value = configs[key];
    if (!value.trim() && key !== 'bank_alias_bank') {
      toast.warning('El campo no puede estar vacío');
      return;
    }

    setSaving(key);
    try {
      await api.put(`/system-config/${key}`, { value: value.trim() });
      setOriginalConfigs((prev) => ({ ...prev, [key]: value.trim() }));
      setConfigs((prev) => ({ ...prev, [key]: value.trim() }));
      toast.success('Configuración guardada');
    } catch (err: any) {
      toast.error('Error al guardar', {
        description: err.response?.data?.message || 'Por favor intenta nuevamente',
      });
    } finally {
      setSaving(null);
    }
  };

  const isDirty = (key: string) => configs[key] !== originalConfigs[key];

  const handleWaitlistToggle = async (enabled: boolean) => {
    setSaving('waitlist_enabled');
    try {
      await api.put('/system-config/waitlist_enabled', {
        value: enabled ? 'true' : 'false',
        label: 'Lista de espera habilitada',
      });
      const newValue = enabled ? 'true' : 'false';
      setConfigs((prev) => ({ ...prev, waitlist_enabled: newValue }));
      setOriginalConfigs((prev) => ({ ...prev, waitlist_enabled: newValue }));
      toast.success(enabled ? 'Lista de espera habilitada' : 'Lista de espera deshabilitada');
    } catch (err: any) {
      toast.error('Error al guardar', {
        description: err.response?.data?.message || 'Por favor intenta nuevamente',
      });
    } finally {
      setSaving(null);
    }
  };

  const [deadlineError, setDeadlineError] = useState<string | null>(null);

  const handleDeadlineSave = async () => {
    const raw = configs.cancellation_deadline_hours.trim();
    const parsed = parseFloat(raw);

    if (isNaN(parsed) || raw === '') {
      setDeadlineError('El valor debe ser un numero valido');
      return;
    }
    if (parsed <= 0) {
      setDeadlineError('El valor debe ser mayor a 0');
      return;
    }

    setDeadlineError(null);
    setSaving('cancellation_deadline_hours');
    try {
      await api.put('/system-config/cancellation_deadline_hours', {
        value: String(parsed),
        label: 'Plazo de cancelacion (horas)',
      });
      setOriginalConfigs((prev) => ({ ...prev, cancellation_deadline_hours: String(parsed) }));
      setConfigs((prev) => ({ ...prev, cancellation_deadline_hours: String(parsed) }));
      toast.success('Plazo de cancelacion actualizado');
    } catch (err: any) {
      // Revert to previous value on failure
      setConfigs((prev) => ({ ...prev, cancellation_deadline_hours: originalConfigs.cancellation_deadline_hours }));
      toast.error('Error al guardar', {
        description: err.response?.data?.message || 'Por favor intenta nuevamente',
      });
    } finally {
      setSaving(null);
    }
  };

  const transferConfigured = configs.bank_alias && configs.bank_alias_holder;

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Configuración"
        subtitle="Ajustes del sistema SpinBooking"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {error && (
          <Card variant="elevated" className="bg-[hsl(var(--error)/0.08)] border-[hsl(var(--error)/0.3)]">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[hsl(var(--error))]" />
              <p className="text-sm text-[hsl(var(--error))]">{error}</p>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
              <p className="text-secondary">Cargando configuración...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Bank Transfer Section */}
            <Card variant="elevated">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-[hsl(var(--primary))]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="font-semibold">Datos de transferencia bancaria</h2>
                    {transferConfigured ? (
                      <span className="flex items-center gap-1 text-xs text-[hsl(var(--success))]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Configurado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-[hsl(var(--warning))]">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Sin configurar
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-secondary mt-0.5">
                    Estos datos se muestran al usuario cuando elige pagar con transferencia bancaria.
                    Si el alias no está configurado, la opción de transferencia no aparecerá en el checkout.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {BANK_KEYS.map((key) => (
                  <div key={key} className="flex items-end gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1.5">
                        {BANK_KEY_LABELS[key]}
                        {key !== 'bank_alias_bank' && (
                          <span className="text-[hsl(var(--error))] ml-1">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={configs[key]}
                        onChange={(e) =>
                          setConfigs((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        placeholder={BANK_KEY_PLACEHOLDERS[key]}
                        className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
                      />
                      {key === 'bank_alias' && (
                        <p className="text-xs text-tertiary mt-1">
                          El alias CBU/CVU al que los usuarios deben transferir.
                        </p>
                      )}
                      {key === 'bank_alias_bank' && (
                        <p className="text-xs text-tertiary mt-1">
                          Nombre del banco (opcional, solo informativo).
                        </p>
                      )}
                    </div>
                    <Button
                      variant={isDirty(key) ? 'primary' : 'outline'}
                      size="sm"
                      disabled={saving !== null || !isDirty(key)}
                      onClick={() => handleSave(key)}
                      className="flex-shrink-0"
                    >
                      {saving === key ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-1.5" />
                          Guardar
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {transferConfigured && (
                <div className="mt-6 p-4 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))]">
                  <p className="text-xs font-medium text-secondary mb-2">Vista previa del alias que verá el usuario:</p>
                  <div className="flex items-center gap-3">
                    <p className="font-mono font-bold text-[hsl(var(--primary))]">{configs.bank_alias}</p>
                    <span className="text-secondary text-sm">—</span>
                    <p className="text-sm">{configs.bank_alias_holder}</p>
                    {configs.bank_alias_bank && (
                      <span className="text-xs text-secondary">({configs.bank_alias_bank})</span>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Waitlist Toggle Section */}
            <Card variant="elevated">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                  <ListChecks className="w-5 h-5 text-[hsl(var(--primary))]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold">Lista de espera</h2>
                      <p className="text-sm text-secondary mt-0.5">
                        Permite a los miembros anotarse en lista de espera cuando una clase está completa.
                        Al deshabilitar, nuevas inscripciones serán rechazadas; las existentes continúan.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-6">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={configs.waitlist_enabled === 'true'}
                        disabled={saving !== null}
                        onChange={(e) => handleWaitlistToggle(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-[hsl(var(--border-default))] peer-focus:ring-2 peer-focus:ring-[hsl(var(--primary)/0.3)] rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[hsl(var(--primary))] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    </label>
                  </div>
                  <p className="text-xs text-tertiary mt-2">
                    Estado actual:{' '}
                    {configs.waitlist_enabled === 'true' ? (
                      <span className="text-[hsl(var(--success))] font-medium">Habilitada</span>
                    ) : (
                      <span className="text-secondary font-medium">Deshabilitada</span>
                    )}
                    {saving === 'waitlist_enabled' && (
                      <span className="ml-2 text-tertiary">(guardando...)</span>
                    )}
                  </p>
                </div>
              </div>
            </Card>

            {/* Cancellation Deadline Section */}
            <Card variant="elevated">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[hsl(var(--primary))]" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">Plazo de cancelacion</h2>
                  <p className="text-sm text-secondary mt-0.5">
                    Horas antes de la clase dentro de las cuales el miembro no puede cancelar sin perder su credito.
                  </p>
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5">
                    Plazo de cancelacion (horas)
                    <span className="text-[hsl(var(--error))] ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={configs.cancellation_deadline_hours}
                    onChange={(e) => {
                      setDeadlineError(null);
                      setConfigs((prev) => ({ ...prev, cancellation_deadline_hours: e.target.value }));
                    }}
                    placeholder="1"
                    className={`w-full px-3 py-2 rounded-[var(--radius-md)] border ${
                      deadlineError
                        ? 'border-[hsl(var(--error))] focus:ring-[hsl(var(--error)/0.3)]'
                        : 'border-[hsl(var(--border-default))] focus:ring-[hsl(var(--primary)/0.3)]'
                    } bg-[hsl(var(--surface-0))] text-sm focus:outline-none focus:ring-2`}
                  />
                  {deadlineError ? (
                    <p className="text-xs text-[hsl(var(--error))] mt-1">{deadlineError}</p>
                  ) : (
                    <p className="text-xs text-tertiary mt-1">
                      Acepta valores decimales (ej: 0.5 = 30 minutos, 1.5 = 1 hora y 30 minutos)
                    </p>
                  )}
                </div>
                <Button
                  variant={isDirty('cancellation_deadline_hours') ? 'primary' : 'outline'}
                  size="sm"
                  disabled={saving !== null || !isDirty('cancellation_deadline_hours')}
                  onClick={handleDeadlineSave}
                  className="flex-shrink-0"
                >
                  {saving === 'cancellation_deadline_hours' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* System Info */}
            <Card variant="default">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[hsl(var(--surface-1))] flex items-center justify-center flex-shrink-0">
                  <SlidersHorizontal className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="font-semibold">Acerca del sistema de configuración</h2>
                  <p className="text-sm text-secondary mt-1">
                    Los cambios en la configuración se aplican inmediatamente en el sistema.
                    No es necesario reiniciar el servidor. Los valores son guardados de forma segura en la base de datos.
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
