'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/auth-context';
import api from '../../../../lib/api-client';
import { WaitlistStatus } from '../../../../lib/api';
import { Card, Button, Badge } from '../../../../components/ui';
import { getDifficultyBadge } from '../../../../lib/utils/difficulty';
import BikeSelectionModal from '../../../../components/BikeSelectionModal';
import { toast } from '../../../../lib/toast';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  User as InstructorIcon,
  AlertCircle,
  Hourglass,
  Bike,
} from 'lucide-react';

interface WaitlistEntry {
  id: string;
  position: number;
  status: string;
  joinedAt: string;
  notifiedAt: string | null;
  notificationExpiresAt: string | null;
  respondedAt: string | null;
  remainingMinutes: number | null;
  isExpired: boolean;
  class: {
    id: string;
    title: string;
    description: string;
    startTime: string;
    duration: number;
    difficultyLevel: string;
    musicTheme: string;
    maxCapacity: number;
    currentCapacity: number;
    room: {
      id: string;
      name: string;
      location: string;
      capacity: number;
    };
    instructor: {
      id: string;
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

export default function WaitlistAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const waitlistId = params.id as string;

  const [waitlistEntry, setWaitlistEntry] = useState<WaitlistEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [showBikeModal, setShowBikeModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && waitlistId) {
      loadWaitlistEntry();
    }
  }, [isAuthenticated, waitlistId]);

  // Countdown timer
  useEffect(() => {
    if (waitlistEntry?.remainingMinutes !== null && waitlistEntry?.remainingMinutes !== undefined) {
      setRemainingSeconds(waitlistEntry.remainingMinutes * 60);
    }
  }, [waitlistEntry]);

  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  const loadWaitlistEntry = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<WaitlistEntry>(`/waitlist/${waitlistId}`);
      setWaitlistEntry(response.data);
    } catch (error: any) {
      console.error('Error loading waitlist entry:', error);
      setError(error.response?.data?.message || 'Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptWithBike = (bikeNumber: number | null) => {
    handleAccept(bikeNumber);
  };

  const handleAccept = async (bikeNumber?: number | null) => {
    setProcessing(true);
    try {
      await api.post(`/waitlist/${waitlistId}/accept`, { bikeNumber });

      // Success! Redirect to bookings page
      router.push('/bookings?success=waitlist_accepted');
    } catch (error: any) {
      console.error('Error accepting spot:', error);
      toast.error(
        'Error al aceptar el lugar',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
      // Reload to get updated status
      await loadWaitlistEntry();
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm('¿Estás seguro que quieres rechazar este lugar? Esta acción no se puede deshacer.')) {
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/waitlist/${waitlistId}/decline`);

      // Redirect to classes page
      router.push('/classes?info=waitlist_declined');
    } catch (error: any) {
      console.error('Error declining spot:', error);
      toast.error(
        'Error al rechazar el lugar',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
      await loadWaitlistEntry();
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
          <p className="text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !waitlistEntry) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-md w-full text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--error)/0.15)] flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-[hsl(var(--error))]" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p className="text-secondary">
                {error || 'No se encontró la entrada en la lista de espera'}
              </p>
            </div>
            <Button variant="primary" onClick={() => router.push('/classes')}>
              Volver a Clases
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Check if already responded
  if (waitlistEntry.status !== WaitlistStatus.NOTIFIED) {
    let statusMessage = '';
    let statusIcon = <CheckCircle2 className="w-8 h-8" />;
    let statusColor = 'success';

    if (waitlistEntry.status === WaitlistStatus.ACCEPTED) {
      statusMessage = '¡Ya aceptaste este lugar! Revisa tus reservas.';
      statusColor = 'success';
      statusIcon = <CheckCircle2 className="w-8 h-8 text-[hsl(var(--success))]" />;
    } else if (waitlistEntry.status === WaitlistStatus.DECLINED) {
      statusMessage = 'Rechazaste este lugar. El spot fue ofrecido a otra persona.';
      statusColor = 'default';
      statusIcon = <XCircle className="w-8 h-8 text-tertiary" />;
    } else if (waitlistEntry.status === WaitlistStatus.EXPIRED) {
      statusMessage = 'Esta oferta expiró. El tiempo límite se alcanzó.';
      statusColor = 'warning';
      statusIcon = <Hourglass className="w-8 h-8 text-[hsl(var(--warning))]" />;
    } else {
      statusMessage = 'Esta entrada ya no está disponible.';
      statusColor = 'default';
      statusIcon = <AlertCircle className="w-8 h-8 text-tertiary" />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-md w-full text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-full bg-[hsl(var(--${statusColor})/0.15)] flex items-center justify-center`}>
              {statusIcon}
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">
                {waitlistEntry.status === WaitlistStatus.ACCEPTED ? '¡Lugar Aceptado!' : 'Oferta No Disponible'}
              </h2>
              <p className="text-secondary">{statusMessage}</p>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push(waitlistEntry.status === WaitlistStatus.ACCEPTED ? '/bookings' : '/classes')}
            >
              {waitlistEntry.status === WaitlistStatus.ACCEPTED ? 'Ver Mis Reservas' : 'Volver a Clases'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Check if expired
  const isExpired = remainingSeconds !== null && remainingSeconds <= 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-0))] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with Countdown */}
        <Card variant="elevated" className="text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--success)/0.15)] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[hsl(var(--success))]" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-2">¡Hay un Lugar Disponible!</h1>
              <p className="text-secondary">
                Se liberó un lugar en la clase que estabas esperando
              </p>
            </div>

            {/* Countdown Timer */}
            {!isExpired && remainingSeconds !== null && (
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-[var(--radius-lg)] bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.3)]">
                <Clock className="w-6 h-6 text-[hsl(var(--primary))]" />
                <div>
                  <p className="text-sm text-secondary">Tiempo restante</p>
                  <p className="text-3xl font-bold text-[hsl(var(--primary))] tabular-nums">
                    {formatCountdown(remainingSeconds)}
                  </p>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-[var(--radius-lg)] bg-[hsl(var(--error)/0.08)] border border-[hsl(var(--error)/0.3)]">
                <Hourglass className="w-6 h-6 text-[hsl(var(--error))]" />
                <div>
                  <p className="text-sm text-secondary">Tiempo expirado</p>
                  <p className="text-lg font-bold text-[hsl(var(--error))]">
                    Esta oferta ya no está disponible
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Class Details */}
        <Card variant="elevated">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xl font-bold">{waitlistEntry.class.title}</h2>
                {getDifficultyBadge(waitlistEntry.class.difficultyLevel)}
              </div>
              <p className="text-secondary">{waitlistEntry.class.description}</p>
            </div>

            {/* Class Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-tertiary mt-0.5" />
                <div>
                  <p className="text-sm text-secondary">Fecha y Hora</p>
                  <p className="font-medium capitalize">
                    {formatDate(waitlistEntry.class.startTime)}
                  </p>
                  <p className="font-semibold text-[hsl(var(--primary))]">
                    {formatTime(waitlistEntry.class.startTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-tertiary mt-0.5" />
                <div>
                  <p className="text-sm text-secondary">Duración</p>
                  <p className="font-medium">{waitlistEntry.class.duration} minutos</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <InstructorIcon className="w-5 h-5 text-tertiary mt-0.5" />
                <div>
                  <p className="text-sm text-secondary">Instructor</p>
                  <p className="font-medium">
                    {waitlistEntry.class.instructor.user.firstName}{' '}
                    {waitlistEntry.class.instructor.user.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-tertiary mt-0.5" />
                <div>
                  <p className="text-sm text-secondary">Sala</p>
                  <p className="font-medium">{waitlistEntry.class.room.name}</p>
                  {waitlistEntry.class.room.location && (
                    <p className="text-sm text-tertiary">{waitlistEntry.class.room.location}</p>
                  )}
                </div>
              </div>
            </div>

            {waitlistEntry.class.musicTheme && (
              <div className="pt-4 border-t border-[hsl(var(--border-default))]">
                <p className="text-sm text-secondary">Música</p>
                <p className="font-medium">{waitlistEntry.class.musicTheme}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        {!isExpired && (
          <Card variant="elevated">
            <div className="space-y-4">
              <h3 className="font-semibold">¿Qué quieres hacer?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowBikeModal(true)}
                  disabled={processing}
                  className="h-auto py-4"
                >
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-semibold">Aceptar Lugar</span>
                    <span className="text-xs opacity-80">Seleccionar bicicleta</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDecline}
                  disabled={processing}
                  className="h-auto py-4"
                >
                  <div className="flex flex-col items-center gap-2">
                    <XCircle className="w-6 h-6" />
                    <span className="font-semibold">Rechazar Lugar</span>
                    <span className="text-xs opacity-80">Ofrecer a otra persona</span>
                  </div>
                </Button>
              </div>

              <p className="text-sm text-secondary text-center">
                {remainingSeconds !== null &&
                  `Tienes ${Math.floor(remainingSeconds / 60)} minutos para decidir`
                }
              </p>
            </div>
          </Card>
        )}

        {isExpired && (
          <Card variant="elevated" className="text-center py-8">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12 text-[hsl(var(--warning))]" />
              <div>
                <h3 className="font-semibold mb-1">Tiempo Expirado</h3>
                <p className="text-sm text-secondary">
                  Esta oferta ya no está disponible. El lugar fue ofrecido a otra persona.
                </p>
              </div>
              <Button variant="primary" onClick={() => router.push('/classes')}>
                Buscar Otras Clases
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Bike Selection Modal */}
      {showBikeModal && (
        <BikeSelectionModal
          classId={waitlistEntry.class.id}
          maxCapacity={waitlistEntry.class.maxCapacity}
          onSelect={handleAcceptWithBike}
          onClose={() => setShowBikeModal(false)}
          isOpen={showBikeModal}
        />
      )}
    </div>
  );
}
