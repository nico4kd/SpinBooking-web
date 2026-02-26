'use client';

import { useCallback, useEffect, useState } from 'react';
import { usersApi, packagesApi, bookingsApi, classesApi } from '../../../lib/api';
import type { UserStats, UserPackage, ClassWithAvailability, Booking } from '../../../lib/api';
import { BookingStatus, PackageStatus } from '../../../lib/api';
import { useNotifications } from '../../../hooks/useNotifications';
import { toast } from '../../../lib/toast';
import { format, addDays, isSameDay, startOfMonth, endOfMonth } from 'date-fns';

export function useDashboardData() {
  // Stats state
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Packages state
  const [packages, setPackages] = useState<UserPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  // Calendar / day-detail state
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [dayBooking, setDayBooking] = useState<Booking | null>(null);
  const [dayClasses, setDayClasses] = useState<ClassWithAvailability[]>([]);

  // Month-scoped booking dots state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [monthBookingDates, setMonthBookingDates] = useState<string[]>([]);

  // Bike selection modal state
  const [showBikeModal, setShowBikeModal] = useState(false);
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const [pendingMaxCapacity, setPendingMaxCapacity] = useState<number>(0);
  const [bookingClass, setBookingClass] = useState<string | null>(null);

  // ── Data loaders ──

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await usersApi.getStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      setStatsError(
        error.response?.data?.message ||
          'No pudimos cargar tus estadísticas. Por favor intenta nuevamente.'
      );
    } finally {
      setStatsLoading(false);
    }
  };

  const loadPackages = async () => {
    try {
      setPackagesLoading(true);
      const data = await packagesApi.getUserPackages();
      setPackages(data);
    } catch (error: any) {
      console.error('Error loading packages:', error);
      setPackages([]);
    } finally {
      setPackagesLoading(false);
    }
  };

  const loadMonthBookings = async (month: Date) => {
    const startDate = format(startOfMonth(month), "yyyy-MM-dd'T'00:00:00");
    const endDate = format(endOfMonth(month), "yyyy-MM-dd'T'23:59:59");

    try {
      const result = await bookingsApi.list({ startDate, endDate, limit: 200 });
      const confirmed = result.data.filter((b) => b.status === BookingStatus.CONFIRMED);
      const dates = confirmed.map((b) => format(new Date(b.class.startTime), 'yyyy-MM-dd'));
      setMonthBookingDates([...new Set(dates)]);
    } catch {
      try {
        const [upcomingResult, pastResult] = await Promise.all([
          bookingsApi.list({ upcoming: true, limit: 200 }),
          bookingsApi.list({ past: true, limit: 200 }),
        ]);

        const allBookings = [...upcomingResult.data, ...pastResult.data];
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const confirmed = allBookings.filter((b) => {
          if (b.status !== 'CONFIRMED') return false;
          const d = new Date(b.class.startTime);
          return d >= monthStart && d <= monthEnd;
        });

        const dates = confirmed.map((b) =>
          format(new Date(b.class.startTime), 'yyyy-MM-dd')
        );
        setMonthBookingDates([...new Set(dates)]);
      } catch {
        setMonthBookingDates([]);
      }
    }
  };

  const loadDayData = async (date: Date) => {
    setDayLoading(true);
    setDayBooking(null);
    setDayClasses([]);

    const startDate = format(date, "yyyy-MM-dd'T'00:00:00");
    const endDate = format(addDays(date, 1), "yyyy-MM-dd'T'00:00:00");

    try {
      let foundBooking: Booking | null = null;

      try {
        const result = await bookingsApi.list({ startDate, endDate });
        const confirmed = result.data.filter((b) => b.status === BookingStatus.CONFIRMED);
        if (confirmed.length > 0) {
          foundBooking = confirmed[0];
        }
      } catch {
        try {
          const [upcomingResult, pastResult] = await Promise.all([
            bookingsApi.list({ upcoming: true, limit: 100 }),
            bookingsApi.list({ past: true, limit: 100 }),
          ]);
          const allBookings = [...upcomingResult.data, ...pastResult.data];
          const matched = allBookings.filter(
            (b) =>
              b.status === BookingStatus.CONFIRMED &&
              isSameDay(new Date(b.class.startTime), date)
          );
          if (matched.length > 0) {
            foundBooking = matched[0];
          }
        } catch {
          // Silently fail
        }
      }

      if (foundBooking) {
        setDayBooking(foundBooking);
        return;
      }

      try {
        const classesResult = await classesApi.list({ startDate, endDate, limit: 100 });
        setDayClasses(classesResult.data);
      } catch {
        setDayClasses([]);
      }
    } finally {
      setDayLoading(false);
    }
  };

  // ── Effects ──

  useEffect(() => {
    loadStats();
    loadPackages();
    loadMonthBookings(new Date());
  }, []);

  useEffect(() => {
    loadMonthBookings(calendarMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarMonth]);

  useNotifications({
    onNewPackageActivated: useCallback(() => {
      loadStats();
      loadPackages();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  });

  useEffect(() => {
    const handler = () => {
      loadStats();
      loadPackages();
    };
    window.addEventListener('spinbooking:package-activated', handler);
    return () => window.removeEventListener('spinbooking:package-activated', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { delta } = (e as CustomEvent<{ delta: number }>).detail;
      setStats((prev) =>
        prev ? { ...prev, availableCredits: prev.availableCredits + delta } : prev,
      );
    };
    window.addEventListener('spinbooking:credits-updated', handler);
    return () => window.removeEventListener('spinbooking:credits-updated', handler);
  }, []);

  useEffect(() => {
    if (selectedDay) {
      loadDayData(selectedDay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  // ── Handlers ──

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) return;

    try {
      await bookingsApi.cancel(bookingId);
      toast.success('Reserva cancelada');
      if (selectedDay) {
        loadDayData(selectedDay);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? 'Error al cancelar'
      );
    }
  };

  const handleBookClass = (classItem: ClassWithAvailability) => {
    if (classItem.isFull) {
      toast.error('Clase llena — ya no hay spots disponibles');
      return;
    }

    if (stats === null || stats.availableCredits === 0) {
      toast.error('No tienes créditos disponibles para reservar');
      return;
    }

    const nonPendingPackages = packages.filter((p) => p.status !== PackageStatus.PENDING);
    if (
      nonPendingPackages.length > 0 &&
      nonPendingPackages.every((p) => p.remainingTickets === 0)
    ) {
      toast.error('No tienes créditos disponibles para reservar');
      return;
    }

    setPendingClassId(classItem.id);
    setPendingMaxCapacity(classItem.maxCapacity);
    setShowBikeModal(true);
  };

  const handleBikeSelected = async (bikeNumber: number | null) => {
    if (!pendingClassId) return;

    setBookingClass(pendingClassId);
    setShowBikeModal(false);

    try {
      await bookingsApi.create({
        classId: pendingClassId,
        bikeNumber,
      });
      toast.success('Reserva confirmada');
      if (selectedDay) {
        loadDayData(selectedDay);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? 'Error al reservar'
      );
    } finally {
      setBookingClass(null);
      setPendingClassId(null);
      setPendingMaxCapacity(0);
    }
  };

  const closeBikeModal = () => {
    setShowBikeModal(false);
    setPendingClassId(null);
  };

  // ── Derived data ──

  const activePackages = packages.filter(
    (p) => p.status === PackageStatus.ACTIVE && p.remainingTickets > 0
  );
  const pendingPackages = packages.filter((p) => p.status === PackageStatus.PENDING);

  return {
    // Stats
    stats,
    statsLoading,
    statsError,
    loadStats,

    // Packages
    packages,
    packagesLoading,
    activePackages,
    pendingPackages,

    // Calendar
    selectedDay,
    setSelectedDay,
    calendarMonth,
    setCalendarMonth,
    monthBookingDates,

    // Day detail
    dayLoading,
    dayBooking,
    dayClasses,

    // Bike modal
    showBikeModal,
    pendingClassId,
    pendingMaxCapacity,
    bookingClass,

    // Handlers
    handleCancelBooking,
    handleBookClass,
    handleBikeSelected,
    closeBikeModal,
  };
}
