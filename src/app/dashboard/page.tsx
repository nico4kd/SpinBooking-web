'use client';

import { useAuth } from '../../context/auth-context';
import { Card } from '../../components/ui';
import { AppLayout, PageHeader } from '../../components/Layout';
import { MonthDayPicker } from '../../components/calendar/MonthDayPicker';
import BikeSelectionModal from '../../components/BikeSelectionModal';
import { CreditsCard } from './components/CreditsCard';
import { DayDetailPanel } from './components/DayDetailPanel';
import { useDashboardData } from './hooks/useDashboardData';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    stats,
    statsLoading,
    statsError,
    loadStats,
    packagesLoading,
    activePackages,
    pendingPackages,
    selectedDay,
    setSelectedDay,
    setCalendarMonth,
    monthBookingDates,
    dayLoading,
    dayBooking,
    dayClasses,
    showBikeModal,
    pendingClassId,
    pendingMaxCapacity,
    bookingClass,
    handleCancelBooking,
    handleBookClass,
    handleBikeSelected,
    closeBikeModal,
  } = useDashboardData();

  return (
    <AppLayout>
      <PageHeader
        title="Inicio"
        description={`Bienvenido de vuelta, ${user?.firstName}`}
        showDate
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Section 1: Créditos disponibles */}
        <CreditsCard
          stats={stats}
          statsLoading={statsLoading}
          statsError={statsError}
          onRetryStats={loadStats}
          activePackages={activePackages}
          pendingPackages={pendingPackages}
          packagesLoading={packagesLoading}
        />

        {/* Section 2: Calendario */}
        <Card variant="elevated">
          <h2 className="text-title mb-4">Calendario</h2>

          <MonthDayPicker
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            bookingDates={monthBookingDates}
            onMonthChange={setCalendarMonth}
          />

          {selectedDay ? (
            <DayDetailPanel
              selectedDay={selectedDay}
              dayLoading={dayLoading}
              dayBooking={dayBooking}
              dayClasses={dayClasses}
              bookingClass={bookingClass}
              onCancelBooking={handleCancelBooking}
              onBookClass={handleBookClass}
            />
          ) : (
            <p className="text-secondary text-sm text-center py-4 mt-4">
              Selecciona un día para ver clases disponibles.
            </p>
          )}
        </Card>
      </div>

      <BikeSelectionModal
        isOpen={showBikeModal}
        classId={pendingClassId ?? ''}
        maxCapacity={pendingMaxCapacity}
        onSelect={handleBikeSelected}
        onClose={closeBikeModal}
      />
    </AppLayout>
  );
}
