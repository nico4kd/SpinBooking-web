'use client';

import type { Booking, ClassWithAvailability } from '../../../lib/api';
import { Button, Badge, Spinner } from '../../../components/ui';
import { getDifficultyBadge } from '../../../lib/utils/difficulty';
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Clock,
  MapPin,
  User,
  Bike,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

interface DayDetailPanelProps {
  selectedDay: Date;
  dayLoading: boolean;
  dayBooking: Booking | null;
  dayClasses: ClassWithAvailability[];
  bookingClass: string | null;
  onCancelBooking: (bookingId: string) => void;
  onBookClass: (classItem: ClassWithAvailability) => void;
}

export function DayDetailPanel({
  selectedDay,
  dayLoading,
  dayBooking,
  dayClasses,
  bookingClass,
  onCancelBooking,
  onBookClass,
}: DayDetailPanelProps) {
  if (dayLoading) {
    return (
      <div className="mt-6 border-t border-[hsl(var(--border-default))] pt-6">
        <div className="flex items-center justify-center py-8">
          <Spinner message="Cargando..." />
        </div>
      </div>
    );
  }

  if (dayBooking) {
    return (
      <div className="mt-6 border-t border-[hsl(var(--border-default))] pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">
                {dayBooking.class.title ?? 'Spinning'}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {getDifficultyBadge(dayBooking.class.difficultyLevel)}
                <Badge variant="success">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Confirmada
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-tertiary" />
              <span className="text-secondary">Hora:</span>
              <span className="font-medium">
                {format(new Date(dayBooking.class.startTime), 'HH:mm', { locale: es })}
              </span>
              <span className="text-tertiary">({dayBooking.class.duration} min)</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-tertiary" />
              <span className="text-secondary">Instructor:</span>
              <span className="font-medium">
                {dayBooking.class.instructor.user.firstName}{' '}
                {dayBooking.class.instructor.user.lastName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-tertiary" />
              <span className="text-secondary">Sala:</span>
              <span className="font-medium">{dayBooking.class.room.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 text-tertiary" />
              <span className="text-secondary">Bicicleta:</span>
              <span className="font-medium">
                {dayBooking.bikeNumber != null
                  ? `#${dayBooking.bikeNumber}`
                  : 'Sin asignar'}
              </span>
            </div>
          </div>

          {dayBooking.canCancel && !isPast(selectedDay) && (
            <Button
              variant="outline"
              size="sm"
              className="text-[hsl(var(--error))] hover:bg-[hsl(var(--error)/0.1)]"
              onClick={() => onCancelBooking(dayBooking.id)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar reserva
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (dayClasses.length > 0) {
    return (
      <div className="mt-6 border-t border-[hsl(var(--border-default))] pt-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-secondary">
            Clases disponibles para este día
          </h3>
          {dayClasses.map((cls) => (
            <div
              key={cls.id}
              className="flex items-center justify-between gap-4 p-3 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))]"
            >
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{cls.title ?? 'Spinning'}</span>
                  {getDifficultyBadge(cls.difficultyLevel)}
                </div>
                <div className="flex items-center gap-3 text-xs text-secondary flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(cls.startTime), 'HH:mm', { locale: es })} · {cls.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {cls.instructor.user.firstName} {cls.instructor.user.lastName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {cls.room.name}
                  </span>
                </div>
                <div className="text-xs text-tertiary">
                  {cls.isFull ? (
                    <Badge variant="default">Completo</Badge>
                  ) : cls.fewSpotsLeft ? (
                    <Badge variant="warning">{cls.spotsAvailable} lugares</Badge>
                  ) : (
                    <Badge variant="success">{cls.spotsAvailable} lugares</Badge>
                  )}
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onBookClass(cls)}
                disabled={isPast(selectedDay) || bookingClass === cls.id}
                className="shrink-0"
              >
                {bookingClass === cls.id ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                    Reservando...
                  </>
                ) : (
                  'Reservar'
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-[hsl(var(--border-default))] pt-6">
      <p className="text-secondary text-sm text-center py-4">
        No hay clases disponibles para este día.
      </p>
    </div>
  );
}
